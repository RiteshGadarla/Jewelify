from logger import logger

import os
import time
import random
import base64

# Directory containing placeholder jewelry images for development mode.
# Place any .jpg / .png images here; they will be returned at random.
MOCK_IMAGES_DIR = os.path.join(os.path.dirname(__file__), "mock_images")

# Fake model identifiers returned in dev mode
MOCK_MODEL_NAMES = [
    "jewelify-pix2pix-v2-dev",
    "jewelify-instruct-pix2pix-dev",
    "jewelify-gan-sketch2real-dev",
]


def _load_random_placeholder() -> bytes:
    """
    Pick a random image file from mock_images/ and return its raw bytes.
    Falls back to a minimal 1×1 white JPEG if the directory is empty.
    """
    if not os.path.isdir(MOCK_IMAGES_DIR):
        os.makedirs(MOCK_IMAGES_DIR, exist_ok=True)

    image_files = [
        f for f in os.listdir(MOCK_IMAGES_DIR)
        if f.lower().endswith((".jpg", ".jpeg", ".png"))
    ]

    if not image_files:
        # Minimal fallback: return a tiny valid JPEG as bytes
        # (1×1 white pixel JPEG, base64-decoded)
        fallback_b64 = (
            "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8U"
            "HRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgN"
            "DRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy"
            "MjL/wAARCAABAAEDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgUEB"
            "/8QAHxAAAQQCAwEAAAAAAAAAAAAAAQACAxEEBRIhMf/EABQBAQAAAAAAAAAAAAAAAAAAAAD"
            "/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwABbQAP/Z"
        )
        return base64.b64decode(fallback_b64)

    chosen = random.choice(image_files)
    with open(os.path.join(MOCK_IMAGES_DIR, chosen), "rb") as f:
        return f.read()


def generate_mock_response(prompt_id: int = 1) -> dict:
    """
    Generate a mock API response that mirrors the structure returned by the
    real AI pipeline. Used in development mode only.

    Args:
        prompt_id: The prompt ID sent by the frontend (1–4). Influences the
                   fake confidence score to simulate per-prompt variation.

    Returns:
        A dict with the following keys:
          - status        : "success"
          - mode          : "development"
          - model_name    : A fake model identifier string
          - confidence    : A fake confidence score (float, 0.70–0.99)
          - processedImage: base64-encoded JPEG/PNG string
    """
    # --- Simulate realistic inference delay (1.0 – 2.0 seconds) ---
    delay = random.uniform(1.0, 2.0)
    logger.debug(f"Simulating inference delay of {delay:.2f}s for prompt_id={prompt_id}...")
    time.sleep(delay)

    # --- Load a random placeholder image and encode to base64 ---
    raw_bytes = _load_random_placeholder()
    b64_image = base64.b64encode(raw_bytes).decode("utf-8")

    # --- Generate fake metadata ---
    model_name = random.choice(MOCK_MODEL_NAMES)
    # Vary confidence slightly by prompt_id for realism
    base_confidence = 0.82 + (prompt_id * 0.03)
    confidence = round(min(0.99, base_confidence + random.uniform(-0.05, 0.05)), 4)

    response = {
        "status": "success",
        "mode": "development",
        "model_name": model_name,
        "confidence": confidence,
        "processedImage": f"data:image/jpeg;base64,{b64_image}",
    }

    logger.info(f"Mock response generated — model={model_name}, confidence={confidence}")
    return response
