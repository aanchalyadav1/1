from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from models import db, User, Playlist, PlaylistSong, LikedSong
from config import Config
from utils import process_image
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import os

app = Flask(__name__)

# ✅ Dynamic CORS (keep for future)
def is_allowed_origin(origin):
    if not origin:
        return False
    allowed = origin.endswith('.vercel.app') or origin == 'https://your-custom-domain.com'
    app.logger.info(f"CORS check: Origin={origin}, Allowed={allowed}")
    return allowed

@app.after_request
def add_cors_headers(response):
    origin = request.headers.get('Origin')
    if is_allowed_origin(origin):
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization,X-Requested-With'
        response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        app.logger.info(f"CORS headers set for origin: {origin}")
    return response

# 🚨 TEMPORARY WILDCARD (REMOVE AFTER TESTING)
@app.after_request
def temp_wildcard(response):
    response.headers['Access-Control-Allow-Origin'] = '*'  # Allows all origins
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization,X-Requested-With'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
    return response

# Handle preflight OPTIONS
@app.route('/<path:path>', methods=['OPTIONS'])
def handle_options(path):
    return jsonify({}), 200

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

@app.route('/')
def home():
    return jsonify({
        "message": "🎶 AI Music Recommendation Backend is live on Render!",
        "status": "running",
        "version": "1.0.0",
        "routes": [
            "/register (POST)", "/login (POST)", "/profile (GET/PUT)",
            "/playlists (GET/POST)", "/liked_songs (GET/POST/DELETE)",
            "/detect_emotion (POST)", "/recommend (GET)", "/forgot-password (POST)", "/version (GET)"
        ]
    })

@app.route('/version')
def get_version():
    return jsonify({'version': '1.0.0'})

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data or not all(k in data for k in ('username', 'email', 'password')):
            return jsonify({'message': 'Missing required fields'}), 400
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'message': 'User exists'}), 400
        user = User(username=data['username'], email=data['email'])
        user.set_password(data['password'])
        db.session.add(user)
        db.session.commit()
        return jsonify({'message': 'User created'}), 201
    except Exception as e:
        app.logger.error(f'Register error: {e}')
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data or not all(k in data for k in ('username', 'password')):
            return jsonify({'message': 'Missing required fields'}), 400
        user = User.query.filter_by(username=data['username']).first()
        if user and user.check_password(data['password']):
            access_token = create_access_token(identity=user.id)
            return jsonify({'access_token': access_token}), 200
        return jsonify({'message': 'Invalid credentials'}), 401
    except Exception as e:
        app.logger.error(f'Login error: {e}')
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/profile', methods=['GET', 'PUT'])
@jwt_required()
def profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        if request.method == 'GET':
            return jsonify({'username': user.username, 'email': user.email})
        data = request.get_json()
        user.email = data.get('email', user.email)
        db.session.commit()
        return jsonify({'message': 'Profile updated'})
    except Exception as e:
        app.logger.error(f'Profile error: {e}')
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/playlists', methods=['GET', 'POST'])
@jwt_required()
def playlists():
    try:
        user_id = get_jwt_identity()
        if request.method == 'GET':
            pls = Playlist.query.filter_by(user_id=user_id).all()
            return jsonify([{'id': p.id, 'name': p.name, 'songs': [s.song_id for s in p.songs]} for p in pls])
        data = request.get_json()
        if not data or 'name' not in data:
            return jsonify({'message': 'Playlist name required'}), 400
        playlist = Playlist(name=data['name'], user_id=user_id)
        db.session.add(playlist)
        db.session.commit()
        return jsonify({'id': playlist.id}), 201
    except Exception as e:
        app.logger.error(f'Playlists error: {e}')
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/liked_songs', methods=['GET', 'POST', 'DELETE'])
@jwt_required()
def liked_songs():
    try:
        user_id = get_jwt_identity()
        if request.method == 'GET':
            likes = LikedSong.query.filter_by(user_id=user_id).all()
            return jsonify([l.song_id for l in likes])
        data = request.get_json()
        if not data or 'song_id' not in data:
            return jsonify({'message': 'Song ID required'}), 400
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
    except Exception as e:
        app.logger.error(f'Liked songs error: {e}')
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/detect_emotion', methods=['POST'])
@jwt_required()
def detect_emotion():
    try:
        if 'image' not in request.files:
            return jsonify({'message': 'No image provided'}), 400
        file = request.files['image']
        emotion = process_image(file)
        return jsonify({'emotion': emotion})
    except Exception as e:
        app.logger.error(f'Detect emotion error: {e}')
        return jsonify({'message': 'Emotion detection failed'}), 500

@app.route('/recommend', methods=['GET'])
@jwt_required()
def recommend():
    try:
        emotion = request.args.get('emotion')
        language = request.args.get('language', 'en')
        genre = emotion_genres.get(emotion, 'pop')
        results = sp.recommendations(seed_genres=[genre], limit=10, market=language.upper())
        tracks = [{'id': t['id'], 'name': t['name'], 'artist': t['artists'][0]['name'], 'url': t['external_urls']['spotify']} for t in results['tracks']]
        return jsonify(tracks)
    except Exception as e:
        app.logger.error(f'Recommend error: {e}')
        return jsonify({'message': 'Recommendation failed'}), 500

@app.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        if not data or 'email' not in data:
            return jsonify({'message': 'Email required'}), 400
        app.logger.info(f"Password reset requested for {data['email']}")
        return jsonify({'message': 'Reset link sent'})
    except Exception as e:
        app.logger.error(f'Forgot password error: {e}')
        return jsonify({'message': 'Internal server error'}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
