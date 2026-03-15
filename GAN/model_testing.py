import tensorflow as tf
import numpy as np
import matplotlib.pyplot as plt
from tensorflow import keras
from tensorflow.keras.layers import LeakyReLU
from PIL import Image, ImageEnhance
import cv2
import os

# =============================================================================
# PATH CONFIGURATION
# Replace these placeholder paths with your actual model and image paths
# =============================================================================
MODEL_PATH = "path/to/your/generator_model.h5"
INPUT_IMAGE_PATH = "path/to/your/test_image.jpg"

# Define a custom Conv2DTranspose layer without 'groups' argument
# This helps in loading models across different versions of Keras
class CustomConv2DTranspose(keras.layers.Conv2DTranspose):
    def __init__(self, *args, **kwargs):
        kwargs.pop('groups', None)  # Remove 'groups' from kwargs if present
        super().__init__(*args, **kwargs)

def load_generator_model(path):
    """Loads the pre-trained GAN generator model."""
    if not os.path.exists(path):
        print(f"Error: Model file not found at {path}")
        return None
    
    return tf.keras.models.load_model(
        path,
        custom_objects={'LeakyReLU': LeakyReLU, 'Conv2DTranspose': CustomConv2DTranspose}
    )

# Function to convert an image to a sketch using OpenCV
def convert_to_sketch(image_path):
    """Converts a standard image into a sketch-like representation."""
    img = cv2.imread(image_path)
    if img is None:
        return None
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    invert = cv2.bitwise_not(gray)
    blur = cv2.GaussianBlur(invert, (111, 111), 0)
    inverted_blur = cv2.bitwise_not(blur)
    sketch = cv2.divide(gray, inverted_blur, scale=256)
    return sketch

# Function to load and preprocess the input sketch for the model
def load_and_preprocess_sketch(sketch, target_size=(1280, 1280)):
    """Prepares the sketch image for model inference."""
    img = Image.fromarray(sketch).convert("RGB")

    # Maintain aspect ratio during resizing
    original_size = img.size
    original_ratio = original_size[0] / original_size[1]
    
    if original_ratio > 1:  # Landscape
        new_width = target_size[0]
        new_height = int(target_size[0] / original_ratio)
    else:  # Portrait
        new_height = target_size[1]
        new_width = int(target_size[1] * original_ratio)

    img = img.resize((new_width, new_height), Image.LANCZOS)

    # Create a new square canvas with white background (padding)
    new_img = Image.new("RGB", target_size, (255, 255, 255))
    new_img.paste(img, ((target_size[0] - new_width) // 2, (target_size[1] - new_height) // 2))

    # Normalize image to [-1, 1] for the GAN model
    img_array = np.array(new_img) / 127.5 - 1
    img_tensor = tf.convert_to_tensor(img_array, dtype=tf.float32)
    return img_tensor

# Function to upscale and brighten the generated output
def upscale_and_brighten_output(prediction, scale_factor=10, brightness_factor=1.5):
    """Post-processes the model output for better visualization."""
    output_image = np.clip((prediction[0].numpy() + 1) * 127.5, 0, 255).astype(np.uint8)
    output_img = Image.fromarray(output_image)

    # Upscale the image for higher resolution
    new_size = (output_img.width * scale_factor, output_img.height * scale_factor)
    output_img = output_img.resize(new_size, Image.LANCZOS)

    # Brighten the image for better clarity
    enhancer = ImageEnhance.Brightness(output_img)
    output_img = enhancer.enhance(brightness_factor)
    return output_img

# Visualization function
def visualize_prediction(input_image_path, brightened_output):
    """Displays the input image and the generated result side-by-side."""
    input_image = Image.open(input_image_path).convert("RGB")

    plt.figure(figsize=(15, 7))

    # Display the actual input image
    plt.subplot(1, 2, 1)
    plt.title("Original Input Image")
    plt.imshow(np.array(input_image))
    plt.axis('off')

    # Display the final output image
    plt.subplot(1, 2, 2)
    plt.title("Generated Realistic Design")
    plt.imshow(np.array(brightened_output))
    plt.axis('off')

    plt.tight_layout()
    plt.show()

def main():
    """Main entry point for model testing."""
    print("Loading Generator Model...")
    generator = load_generator_model(MODEL_PATH)
    
    if generator is None:
        return

    print(f"Processing image: {INPUT_IMAGE_PATH}")
    sketch_image = convert_to_sketch(INPUT_IMAGE_PATH)
    
    if sketch_image is None:
        print(f"Error: Could not load or process image at {INPUT_IMAGE_PATH}")
        return

    input_sketch = load_and_preprocess_sketch(sketch_image)
    input_sketch = tf.expand_dims(input_sketch, axis=0)  # Add batch dimension

    # Generate the realistic output from the sketch
    print("Generating output...")
    predictions = generator(input_sketch, training=False)
    
    # Post-process the output
    brightened_output = upscale_and_brighten_output(predictions)

    # Visualize results
    print("Visualization complete. Displaying results...")
    visualize_prediction(INPUT_IMAGE_PATH, brightened_output)

if __name__ == "__main__":
    main()
