from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from models import db, User, Playlist, PlaylistSong, LikedSong
from config import Config
from utils import process_image
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from flask_cors import CORS
import os

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)
jwt = JWTManager(app)

# ✅ Use flask-cors (best for Render)
CORS(app, supports_credentials=True, origins=[
    "https://one-h4bq.onrender.com",   # your frontend URL on Render
    "http://localhost:3000"            # for local testing
])

# ✅ Spotify API Setup
sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(
    client_id=Config.SPOTIFY_CLIENT_ID,
    client_secret=Config.SPOTIFY_CLIENT_SECRET
))

emotion_genres = {
    'happy': 'pop',
    'sad': 'indie',
    'angry': 'rock',
    'fear': 'ambient',
    'surprise': 'electronic',
    'neutral': 'jazz',
    'disgust': 'classical'
}

@app.route('/')
def home():
    return jsonify({
        "message": "🎶 AI Music Recommendation Backend is live!",
        "status": "running",
        "routes": [
            "/register", "/login", "/profile", "/playlists",
            "/liked_songs", "/detect_emotion", "/recommend", "/forgot-password"
        ]
    })

@app.route('/version')
def version():
    return jsonify({"version": "1.0.0"})

# ✅ User Register
@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data or not all(k in data for k in ('username', 'email', 'password')):
            return jsonify({'message': 'Missing required fields'}), 400

        if User.query.filter_by(username=data['username']).first():
            return jsonify({'message': 'User already exists'}), 400

        user = User(username=data['username'], email=data['email'])
        user.set_password(data['password'])
        db.session.add(user)
        db.session.commit()
        return jsonify({'message': 'User registered successfully!'}), 201
    except Exception as e:
        app.logger.error(f"Register error: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

# ✅ Login
@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data or not all(k in data for k in ('username', 'password')):
            return jsonify({'message': 'Missing credentials'}), 400

        user = User.query.filter_by(username=data['username']).first()
        if user and user.check_password(data['password']):
            token = create_access_token(identity=user.id)
            return jsonify({'access_token': token}), 200

        return jsonify({'message': 'Invalid username or password'}), 401
    except Exception as e:
        app.logger.error(f"Login error: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

# ✅ Profile
@app.route('/profile', methods=['GET', 'PUT'])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    if request.method == 'GET':
        return jsonify({'username': user.username, 'email': user.email})
    else:
        data = request.get_json()
        user.email = data.get('email', user.email)
        db.session.commit()
        return jsonify({'message': 'Profile updated successfully'})

# ✅ Playlist Routes
@app.route('/playlists', methods=['GET', 'POST'])
@jwt_required()
def playlists():
    user_id = get_jwt_identity()
    if request.method == 'GET':
        pls = Playlist.query.filter_by(user_id=user_id).all()
        return jsonify([{'id': p.id, 'name': p.name} for p in pls])

    data = request.get_json()
    playlist = Playlist(name=data.get('name'), user_id=user_id)
    db.session.add(playlist)
    db.session.commit()
    return jsonify({'message': 'Playlist created', 'id': playlist.id}), 201

# ✅ Liked Songs
@app.route('/liked_songs', methods=['GET', 'POST', 'DELETE'])
@jwt_required()
def liked_songs():
    user_id = get_jwt_identity()

    if request.method == 'GET':
        likes = LikedSong.query.filter_by(user_id=user_id).all()
        return jsonify([l.song_id for l in likes])

    data = request.get_json()
    song_id = data.get('song_id')

    if request.method == 'POST':
        if not LikedSong.query.filter_by(user_id=user_id, song_id=song_id).first():
            db.session.add(LikedSong(user_id=user_id, song_id=song_id))
            db.session.commit()
        return jsonify({'message': 'Song liked'})

    LikedSong.query.filter_by(user_id=user_id, song_id=song_id).delete()
    db.session.commit()
    return jsonify({'message': 'Song unliked'})

# ✅ Emotion Detection
@app.route('/detect_emotion', methods=['POST'])
@jwt_required()
def detect_emotion():
    if 'image' not in request.files:
        return jsonify({'message': 'No image provided'}), 400
    file = request.files['image']
    emotion = process_image(file)
    return jsonify({'emotion': emotion})

# ✅ Music Recommendation
@app.route('/recommend', methods=['GET'])
@jwt_required()
def recommend():
    emotion = request.args.get('emotion', 'neutral')
    language = request.args.get('language', 'en')
    genre = emotion_genres.get(emotion, 'pop')

    results = sp.recommendations(seed_genres=[genre], limit=10, market=language.upper())
    tracks = [{'id': t['id'], 'name': t['name'], 'artist': t['artists'][0]['name'], 'url': t['external_urls']['spotify']} for t in results['tracks']]
    return jsonify(tracks)

# ✅ Forgot Password
@app.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    app.logger.info(f"Password reset requested for {email}")
    return jsonify({'message': 'Password reset link sent (mock)'})

# ✅ Main
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
