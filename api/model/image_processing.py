import tensorflow as tf
import numpy as np
from tensorflow import keras
from tensorflow.keras.layers import LeakyReLU
from PIL import Image, ImageEnhance
import cv2


# Custom Conv2DTranspose layer to avoid compatibility issues
class CustomConv2DTranspose(keras.layers.Conv2DTranspose):
    def __init__(self, *args, **kwargs):
        kwargs.pop('groups', None)  # Remove 'groups' argument if present
        super().__init__(*args, **kwargs)


# Load the trained generator model
model_path = r"generator.h5"
generator = tf.keras.models.load_model(model_path, custom_objects={
    'LeakyReLU': LeakyReLU, 'Conv2DTranspose': CustomConv2DTranspose
})
print("🚀 Pix2Pix loaded successfully.")


# Convert an input image to a sketch using OpenCV
def convert_to_sketch(image_path):
    img = cv2.imread(image_path)  # Load image
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)  # Convert to grayscale
    invert = cv2.bitwise_not(gray)  # Invert colors
    blur = cv2.GaussianBlur(invert, (111, 111), 0)  # Apply Gaussian blur
    inverted_blur = cv2.bitwise_not(blur)  # Invert blurred image
    return cv2.divide(gray, inverted_blur, scale=256)  # Generate sketch effect


# Preprocess the sketch for the model input
def load_and_preprocess_sketch(sketch, target_size=(1280, 1280)):
    img = Image.fromarray(sketch).convert("RGB")  # Convert to RGB
    img = img.resize(target_size, Image.LANCZOS)  # Resize while maintaining quality
    img_array = np.array(img) / 127.5 - 1  # Normalize pixel values to [-1, 1]
    return tf.convert_to_tensor(img_array, dtype=tf.float32)


# Upscale and enhance brightness of the model's output
def upscale_and_brighten_output(prediction, max_length=2560, brightness_factor=1.5):
    output_image = np.clip((prediction[0].numpy() + 1) * 127.5, 0, 255).astype(np.uint8)
    output_img = Image.fromarray(output_image)  # Convert to PIL Image
    scale_factor = min(max_length / output_img.width, max_length / output_img.height)
    new_size = (int(output_img.width * scale_factor), int(output_img.height * scale_factor))
    output_img = output_img.resize(new_size, Image.LANCZOS)  # Resize image
    enhancer = ImageEnhance.Brightness(output_img)  # Brighten the image
    return enhancer.enhance(brightness_factor)


# Process an image: convert to sketch, pass through model, upscale, and save
def process_image_with_model(image_path, output_path):
    sketch = convert_to_sketch(image_path)  # Step 1: Convert image to sketch
    input_sketch = load_and_preprocess_sketch(sketch)  # Step 2: Preprocess the sketch
    input_sketch = tf.expand_dims(input_sketch, axis=0)  # Add batch dimension
    predictions = generator(input_sketch, training=False)  # Step 3: Generate output
    brightened_output = upscale_and_brighten_output(predictions)  # Step 4: Enhance output
    brightened_output.save(output_path)  # Step 5: Save result
    print(f"Processed and saved: {output_path}")
