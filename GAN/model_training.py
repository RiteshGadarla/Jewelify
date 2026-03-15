import tensorflow as tf
from tensorflow.keras.layers import Input, Conv2D, Conv2DTranspose, Dropout, LeakyReLU, BatchNormalization, Concatenate
from tensorflow.keras.models import Model
import matplotlib.pyplot as plt
import os
import numpy as np

# =============================================================================
# PATH CONFIGURATION
# Replace these placeholder paths with your actual local or drive paths
# =============================================================================
SKETCH_PATH = 'path/to/your/sketch_folder' 
REALISTIC_PATH = 'path/to/your/realistic_images_folder'
MODEL_SAVE_DIR = 'path/to/save/models'
CHECKPOINT_DIR = 'path/to/save/checkpoints'

# Load and preprocess images to 1280x1280 with 3 channels
def load_images(path):
    """Loads and preprocesses images from a directory."""
    images = []
    if not os.path.exists(path):
        print(f"Warning: Path {path} does not exist.")
        return None
    
    for img_file in sorted(os.listdir(path)):
        if img_file.lower().endswith(('.png', '.jpg', '.jpeg')):
            img = tf.io.read_file(os.path.join(path, img_file))
            img = tf.image.decode_jpeg(img, channels=3)  # Force 3 channels (RGB)
            img = tf.image.resize(img, (1280, 1280)) / 127.5 - 1  # Normalize to [-1, 1]
            images.append(img)
    
    if not images:
        return None
    return tf.data.Dataset.from_tensor_slices(images).batch(1)

# Adjust U-Net Generator to 1280x1280 input
def unet_generator():
    """Defines the U-Net architecture for the generator."""
    inputs = Input(shape=[1280, 1280, 3])
    down_stack = [
        Conv2D(64, 4, strides=2, padding='same', activation=LeakyReLU(alpha=0.2)),
        Conv2D(128, 4, strides=2, padding='same', activation=LeakyReLU(alpha=0.2)),
        Conv2D(256, 4, strides=2, padding='same', activation=LeakyReLU(alpha=0.2)),
        Conv2D(512, 4, strides=2, padding='same', activation=LeakyReLU(alpha=0.2)),
        Conv2D(512, 4, strides=2, padding='same', activation=LeakyReLU(alpha=0.2)),
        Conv2D(512, 4, strides=2, padding='same', activation=LeakyReLU(alpha=0.2)),
    ]
    up_stack = [
        Conv2DTranspose(512, 4, strides=2, padding='same', activation='relu'),
        Conv2DTranspose(512, 4, strides=2, padding='same', activation='relu'),
        Conv2DTranspose(256, 4, strides=2, padding='same', activation='relu'),
        Conv2DTranspose(128, 4, strides=2, padding='same', activation='relu'),
        Conv2DTranspose(64, 4, strides=2, padding='same', activation='relu'),
        Conv2DTranspose(32, 4, strides=2, padding='same', activation='relu'),
        Conv2DTranspose(16, 4, strides=2, padding='same', activation='relu'),
    ]

    # Down-sampling
    x = inputs
    skips = []
    for down in down_stack:
        x = down(x)
        skips.append(x)
    skips = reversed(skips[:-1])

    # Up-sampling with skip connections
    for up, skip in zip(up_stack, skips):
        x = up(x)
        x = Concatenate()([x, skip])

    x = Conv2DTranspose(3, 4, strides=2, padding='same', activation='tanh')(x)
    return Model(inputs=inputs, outputs=x)

# Adjust PatchGAN Discriminator to 1280x1280 input
def patchgan_discriminator():
    """Defines the PatchGAN discriminator architecture."""
    inputs = Input(shape=[1280, 1280, 3])
    target = Input(shape=[1280, 1280, 3])
    x = Concatenate()([inputs, target])
    x = Conv2D(64, 4, strides=2, padding='same')(x)
    x = LeakyReLU(alpha=0.2)(x)

    x = Conv2D(128, 4, strides=2, padding='same')(x)
    x = BatchNormalization()(x)
    x = LeakyReLU(alpha=0.2)(x)

    x = Conv2D(256, 4, strides=2, padding='same')(x)
    x = BatchNormalization()(x)
    x = LeakyReLU(alpha=0.2)(x)

    x = Conv2D(512, 4, strides=2, padding='same')(x)
    x = BatchNormalization()(x)
    x = LeakyReLU(alpha=0.2)(x)

    x = Conv2D(1, 4, strides=1, padding='same')(x)
    return Model(inputs=[inputs, target], outputs=x)

# Loss functions and optimizers
loss_object = tf.keras.losses.BinaryCrossentropy(from_logits=True)

def discriminator_loss(real_output, fake_output):
    """Calculates the loss for the discriminator."""
    real_loss = loss_object(tf.ones_like(real_output), real_output)
    fake_loss = loss_object(tf.zeros_like(fake_output), fake_output)
    return real_loss + fake_loss

def generator_loss(disc_generated_output, gen_output, target):
    """Calculates the loss for the generator."""
    gan_loss = loss_object(tf.ones_like(disc_generated_output), disc_generated_output)
    l1_loss = tf.reduce_mean(tf.abs(target - gen_output))
    return gan_loss + (100 * l1_loss)

# Training step function
@tf.function
def train_step(input_image, target, generator, discriminator, gen_optimizer, disc_optimizer):
    """Executes one training step."""
    with tf.GradientTape() as gen_tape, tf.GradientTape() as disc_tape:
        gen_output = generator(input_image, training=True)
        disc_real_output = discriminator([input_image, target], training=True)
        disc_fake_output = discriminator([input_image, gen_output], training=True)

        gen_loss = generator_loss(disc_fake_output, gen_output, target)
        disc_loss = discriminator_loss(disc_real_output, disc_fake_output)

    generator_gradients = gen_tape.gradient(gen_loss, generator.trainable_variables)
    discriminator_gradients = disc_tape.gradient(disc_loss, discriminator.trainable_variables)

    gen_optimizer.apply_gradients(zip(generator_gradients, generator.trainable_variables))
    disc_optimizer.apply_gradients(zip(discriminator_gradients, discriminator.trainable_variables))
    return gen_loss, disc_loss

# Training Loop
def train(dataset, epochs, generator, discriminator, gen_optimizer, disc_optimizer, checkpoint_manager, model_save_dir):
    """Main training loop."""
    start_epoch = 0
    if checkpoint_manager.latest_checkpoint:
        start_epoch = int(checkpoint_manager.latest_checkpoint.split('-')[-1])
        print(f"Resuming from epoch {start_epoch}")

    for epoch in range(start_epoch, epochs):
        print(f"\nEpoch {epoch + 1}/{epochs}")
        for step, (input_image, target) in enumerate(dataset):
            gen_loss, disc_loss = train_step(input_image, target, generator, discriminator, gen_optimizer, disc_optimizer)
            if step % 10 == 0:
                print(f"Step {step}, Generator Loss: {gen_loss:.4f}, Discriminator Loss: {disc_loss:.4f}")

        # Save checkpoint every epoch
        checkpoint_manager.save()
        print(f"Checkpoint saved for epoch {epoch + 1}")

        # Save generator model every 5 epochs
        if (epoch + 1) % 5 == 0:
            os.makedirs(model_save_dir, exist_ok=True)
            generator.save(os.path.join(model_save_dir, f"generator_epoch_{epoch + 1}.h5"))
            print(f"Generator model saved at epoch {epoch + 1}")

            # Visualization of progress
            example_sketch = list(dataset.take(1))[0][0]
            prediction = generator(example_sketch, training=False)

            plt.figure(figsize=(10, 5))
            display_list = [example_sketch[0], prediction[0]]
            titles = ['Input Sketch', 'Generated Image']

            for i in range(2):
                plt.subplot(1, 2, i+1)
                plt.title(titles[i])
                plt.imshow((display_list[i] * 0.5 + 0.5))  # Rescale to [0, 1]
                plt.axis('off')
            plt.show()

def main():
    """Main entry point for training."""
    # Create directories if they don't exist
    os.makedirs(MODEL_SAVE_DIR, exist_ok=True)
    os.makedirs(CHECKPOINT_DIR, exist_ok=True)

    # Load paired datasets
    print("Loading datasets...")
    sketch_images = load_images(SKETCH_PATH)
    realistic_images = load_images(REALISTIC_PATH)

    if sketch_images is None or realistic_images is None:
        print("Error: Could not load datasets. Please check your SKETCH_PATH and REALISTIC_PATH.")
        return

    dataset = tf.data.Dataset.zip((sketch_images, realistic_images))

    # Initialize models
    print("Initializing Generator and Discriminator...")
    generator = unet_generator()
    discriminator = patchgan_discriminator()

    # Define optimizers
    gen_optimizer = tf.keras.optimizers.Adam(2e-4, beta_1=0.5)
    disc_optimizer = tf.keras.optimizers.Adam(2e-4, beta_1=0.5)

    # Setup Checkpoint Manager
    checkpoint = tf.train.Checkpoint(
        generator=generator,
        discriminator=discriminator,
        generator_optimizer=gen_optimizer,
        discriminator_optimizer=disc_optimizer
    )
    checkpoint_manager = tf.train.CheckpointManager(checkpoint, CHECKPOINT_DIR, max_to_keep=5)

    # Restore latest checkpoint if it exists
    if checkpoint_manager.latest_checkpoint:
        checkpoint.restore(checkpoint_manager.latest_checkpoint)
        print(f"Restored from {checkpoint_manager.latest_checkpoint}")
    else:
        print("Starting training from scratch.")

    # Start training
    train(dataset, epochs=100, generator=generator, discriminator=discriminator, 
          gen_optimizer=gen_optimizer, disc_optimizer=disc_optimizer, 
          checkpoint_manager=checkpoint_manager, model_save_dir=MODEL_SAVE_DIR)

if __name__ == "__main__":
    main()