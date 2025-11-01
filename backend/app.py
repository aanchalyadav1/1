from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from models import db, User, Playlist, PlaylistSong, LikedSong
from config import Config
from utils import process_image
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import os

app = Flask(__name__)
from flask_cors import CORS
CORS(app, origins=["https://1-pk32mgnxt-aanchal-yadavs-projects-3d4dec53.vercel.app/"])  # Replace with your Vercel URL
app.config.from_object(Config)
db.init_app(app)
jwt = JWTManager(app)

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

# ✅ ADD THIS ROUTE to avoid 404 on Render root URL
@app.route('/')
def home():
    return jsonify({
        "message": "🎶 Backend is live on Render!",
        "status": "running",
        "routes": [
            "/register", "/login", "/profile",
            "/playlists", "/liked_songs",
            "/detect_emotion", "/recommend"
        ]
    })

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'User exists'}), 400
    user = User(username=data['username'], email=data['email'])
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User created'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    if user and user.check_password(data['password']):
        access_token = create_access_token(identity=user.id)
        return jsonify({'access_token': access_token}), 200
    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/profile', methods=['GET', 'PUT'])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if request.method == 'GET':
        return jsonify({'username': user.username, 'email': user.email})
    data = request.get_json()
    user.email = data.get('email', user.email)
    db.session.commit()
    return jsonify({'message': 'Profile updated'})

@app.route('/playlists', methods=['GET', 'POST'])
@jwt_required()
def playlists():
    user_id = get_jwt_identity()
    if request.method == 'GET':
        pls = Playlist.query.filter_by(user_id=user_id).all()
        return jsonify([{'id': p.id, 'name': p.name, 'songs': [s.song_id for s in p.songs]} for p in pls])
    data = request.get_json()
    playlist = Playlist(name=data['name'], user_id=user_id)
    db.session.add(playlist)
    db.session.commit()
    return jsonify({'id': playlist.id}), 201

@app.route('/liked_songs', methods=['GET', 'POST', 'DELETE'])
@jwt_required()
def liked_songs():
    user_id = get_jwt_identity()
    if request.method == 'GET':
        likes = LikedSong.query.filter_by(user_id=user_id).all()
        return jsonify([l.song_id for l in likes])
    data = request.get_json()
    song_id = data['song_id']
    if request.method == 'POST':
        if not LikedSong.query.filter_by(user_id=user_id, song_id=song_id).first():
            like = LikedSong(user_id=user_id, song_id=song_id)
            db.session.add(like)
            db.session.commit()
        return jsonify({'message': 'Liked'})
    LikedSong.query.filter_by(user_id=user_id, song_id=song_id).delete()
    db.session.commit()
    return jsonify({'message': 'Unliked'})

@app.route('/detect_emotion', methods=['POST'])
@jwt_required()
def detect_emotion():
    file = request.files['image']
    emotion = process_image(file)
    return jsonify({'emotion': emotion})

@app.route('/recommend', methods=['GET'])
@jwt_required()
def recommend():
    emotion = request.args.get('emotion')
    language = request.args.get('language', 'en')
    genre = emotion_genres.get(emotion, 'pop')
    results = sp.recommendations(seed_genres=[genre], limit=10, market=language.upper())
    tracks = [{'id': t['id'], 'name': t['name'], 'artist': t['artists'][0]['name'], 'url': t['external_urls']['spotify']} for t in results['tracks']]
    return jsonify(tracks)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    # ✅ Bind to Render's assigned port (important)
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
