# Jewellery Sketch to Realistic Design GAN

This folder contains the implementation of a Generative Adversarial Network (GAN) designed to transform jewellery sketches into realistic designs. The model uses a Conditional GAN (Pix2Pix) architecture, featuring a U-Net based generator and a PatchGAN discriminator.

## Folder Structure

- `model_training.py`: Script for training the GAN on a paired dataset of sketches and realistic images.
- `model_testing.py`: Script for running inference on a trained model to generate realistic designs from input sketches.
- `dataset/`: (Optional) Directory to store your training images.

## Architecture Highlights

- **Generator**: A U-Net architecture with skip connections to preserve spatial details from the input sketch. It takes a 1280x1280 RGB image as input and outputs a transformed 1280x1280 image.
- **Discriminator**: A PatchGAN discriminator that classifies 70x70 (or similar) patches of the image as real or fake, promoting high-frequency detail preservation.
- **Loss Functions**: A combination of Binary Cross Entropy for the adversarial loss and L1 Loss for image reconstruction accuracy.

## Getting Started

### Prerequisites

Ensure you have the following libraries installed:
```bash
pip install tensorflow matplotlib numpy pillow opencv-python
```

### 1. Training the Model (`model_training.py`)

1. **Prepare your Data**: Organize your sketches and realistic images in separate folders.
2. **Configure Paths**: Open `model_training.py` and update the placeholders:
   ```python
   SKETCH_PATH = 'path/to/your/sketches'
   REALISTIC_PATH = 'path/to/your/realistic_images'
   MODEL_SAVE_DIR = 'path/to/save/models'
   CHECKPOINT_DIR = 'path/to/save/checkpoints'
   ```
3. **Run Training**:
   ```bash
   python model_training.py
   ```
   The script will save checkpoints every epoch and the generator model every 5 epochs.

### 2. Testing the Model (`model_testing.py`)

1. **Configure Paths**: Open `model_testing.py` and provide the path to your trained model and the image you want to test:
   ```python
   MODEL_PATH = "path/to/your/generator_model.h5"
   INPUT_IMAGE_PATH = "path/to/your/test_image.jpg"
   ```
2. **Run Inference**:
   ```bash
   python model_testing.py
   ```
   The script will:
   - Convert the input image to a sketch (using OpenCV).
   - Preprocess it for the model.
   - Generate a realistic design.
   - Upscale and brighten the output for better visualization.
   - Display the results side-by-side.

## Normalization and Preprocessing

- Images are resized to **1280x1280**.
- Pixel values are normalized to the range **[-1, 1]** for GAN training.
- Input sketches are automatically padded to maintain aspect ratio during preprocessing.
