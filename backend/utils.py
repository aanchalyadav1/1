import cv2
import numpy as np
from PIL import Image
import tensorflow as tf

model = tf.keras.models.load_model('emotion_model.keras')
emotion_labels = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']

def process_image(image_file):
    img = Image.open(image_file).convert('L').resize((48, 48))
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=[0, -1])
    prediction = model.predict(img_array)
    emotion = emotion_labels[np.argmax(prediction)]
    return emotion
