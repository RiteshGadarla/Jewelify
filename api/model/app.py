"""
Jewelify — Flask API Server
Supports two runtime modes:
  --mode dev    : Development mode — no ML models loaded, uses mock image responses
  --mode actual : Actual mode     — loads real ML models and runs the full AI pipeline

Usage:
  python app.py --mode dev
  python app.py --mode actual
"""

import os
import argparse
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

from logger import logger
from config import cfg

# ---------------------------------------------------------------------------
# App setup using centralized config
# ---------------------------------------------------------------------------
APP_MODE = cfg.APP_MODE

# ---------------------------------------------------------------------------
# Conditionally import ML pipeline — only in actual mode
# ---------------------------------------------------------------------------
if APP_MODE == "actual":
    logger.info("ACTUAL MODE — Loading ML models...")
    from image_processing import process_image_with_model
    from instruct import generate_image
    logger.info("ML models loaded successfully.")
else:
    logger.info("DEVELOPMENT MODE — ML models will NOT be loaded.")
    logger.info("Mock image responses will be used instead.")
    # Import the lightweight mock generator
    from mock_response import generate_mock_response

# ---------------------------------------------------------------------------
# Flask app setup
# ---------------------------------------------------------------------------
app = Flask(__name__)
CORS_ORIGIN = os.environ.get("CORS_ORIGIN", "http://localhost:3000")
CORS(app, resources={r"/*": {"origins": CORS_ORIGIN}})

UPLOAD_FOLDER = cfg.UPLOAD_FOLDER
PROCESSED_FOLDER = cfg.PROCESSED_FOLDER
COLLECTION_FOLDER = cfg.COLLECTION_FOLDER

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)
os.makedirs(COLLECTION_FOLDER, exist_ok=True)

logger.info(f"Server initialized with folders: {UPLOAD_FOLDER}, {PROCESSED_FOLDER}, {COLLECTION_FOLDER}")


# ---------------------------------------------------------------------------
# Helper utilities
# ---------------------------------------------------------------------------
def get_next_filename(folder_path):
    existing_files = [f for f in os.listdir(folder_path) if f.startswith("img")]
    next_number = len(existing_files) + 1
    return f"img{next_number}"


def get_user_folder(base_folder, username):
    folder_path = os.path.join(base_folder, username)
    os.makedirs(folder_path, exist_ok=True)
    return folder_path


# ---------------------------------------------------------------------------
# Health / Status endpoint
# Useful to confirm which mode is active without inspecting console logs.
# ---------------------------------------------------------------------------
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok",
        "app": "Jewelify",
        "mode": "development" if APP_MODE == "dev" else "actual",
        "ml_models_loaded": APP_MODE == "actual"
    })


# ---------------------------------------------------------------------------
# Upload endpoint — routes to mock or real pipeline based on APP_MODE
# ---------------------------------------------------------------------------
@app.route('/api/upload', methods=['POST'])
def upload_image():
    if 'username' not in request.form or 'image' not in request.files or 'prompt_id' not in request.form:
        return jsonify({'error': 'Username, image file, or prompt_id missing'}), 400

    username = request.form['username']
    prompt_id = int(request.form['prompt_id'])
    image_file = request.files['image']

    if image_file.filename == '':
        return jsonify({'error': 'No image selected'}), 400

    # -------------------------------------------------------------------
    # DEVELOPMENT MODE — return mock response immediately
    # No real processing happens; frontend receives a structurally identical
    # response so it can be fully developed without ML models.
    # -------------------------------------------------------------------
    if APP_MODE == "dev":
        logger.info(f"Received upload from user='{username}', prompt_id={prompt_id}. Returning mock response.")
        mock = generate_mock_response(prompt_id)

        # In dev mode, we still save the "processed" result to the collection folder
        # so the 'Collections' page works.
        try:
            user_collection_folder = get_user_folder(COLLECTION_FOLDER, username)
            collection_filename = get_next_filename(user_collection_folder) + ".jpg"
            collection_image_path = os.path.join(user_collection_folder, collection_filename)

            # Extract base64 part and decode
            header, encoded = mock['processedImage'].split(",", 1)
            import base64
            with open(collection_image_path, "wb") as f:
                f.write(base64.b64decode(encoded))

            logger.info(f"Saved mock image to collection: {collection_image_path}")

            # Update the response to include the filename for consistency if needed,
            # though the frontend is now set up to handle both.
            # mock['collection_path'] = f"{username}/{collection_filename}"
        except Exception as e:
            logger.error(f"Failed to save mock image to collection: {str(e)}")

        return jsonify(mock)

    # -------------------------------------------------------------------
    # ACTUAL MODE — run the full AI processing pipeline
    # -------------------------------------------------------------------
    # Define user folders
    user_upload_folder = get_user_folder(UPLOAD_FOLDER, username)
    user_processed_folder = get_user_folder(PROCESSED_FOLDER, username)
    user_collection_folder = get_user_folder(COLLECTION_FOLDER, username)

    # Save uploaded image
    filename = f"{username}_{len(os.listdir(user_upload_folder)) + 1:03d}" + os.path.splitext(image_file.filename)[1]
    image_path = os.path.join(user_upload_folder, filename)
    image_file.save(image_path)

    # Define processed file paths
    processed_filename = 'processed_' + filename
    processed_image_path = os.path.join(user_processed_folder, processed_filename)

    # Process image based on prompt_id
    if 1 <= prompt_id <= 3:
        # Use generate_image function (Stable Diffusion InstructPix2Pix)
        generate_image(image_path, processed_image_path, prompt_id)
        logger.info(f"Image generated successfully for {username}")
    elif prompt_id == 4:
        # Use custom processing for prompt_id 4 (Pix2Pix GAN)
        process_image_with_model(image_path, processed_image_path)
    else:
        return jsonify({'error': 'Invalid prompt_id. Use 1-4.'}), 400

    # Move processed file to collection folder
    collection_filename = get_next_filename(user_collection_folder) + os.path.splitext(processed_image_path)[1]
    collection_image_path = os.path.join(user_collection_folder, collection_filename)
    os.rename(processed_image_path, collection_image_path)

    return jsonify({'processedImage': f"{username}/{collection_filename}"})


# ---------------------------------------------------------------------------
# Text-to-image save endpoint (unchanged from original)
# ---------------------------------------------------------------------------
@app.route('/api/text-image-save', methods=['POST'])
def save_text_generated_image():
    if 'username' not in request.form or 'image' not in request.files:
        return jsonify({'error': 'Username or image file missing'}), 400

    username = request.form['username']
    image_file = request.files['image']

    if image_file.filename == '':
        return jsonify({'error': 'No image provided'}), 400

    user_collection_folder = get_user_folder(COLLECTION_FOLDER, username)

    try:
        collection_filename = get_next_filename(user_collection_folder) + os.path.splitext(image_file.filename)[1]
        collection_image_path = os.path.join(user_collection_folder, collection_filename)
        image_file.save(collection_image_path)

        return jsonify({'message': 'Image saved successfully', 'processedImage': f"{username}/{collection_filename}"})
    except Exception as e:
        return jsonify({'error': f'An error occurred while saving the image: {str(e)}'}), 500


# ---------------------------------------------------------------------------
# Serve processed/collection images
# ---------------------------------------------------------------------------
@app.route('/processed/<username>/<filename>', methods=['GET'])
def get_processed_image(username, filename):
    return send_from_directory(os.path.join(COLLECTION_FOLDER, username), filename)


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------
if __name__ == '__main__':
    mode_label = "DEVELOPMENT" if APP_MODE == "dev" else "ACTUAL"
    logger.info(f"Starting server in {mode_label} mode on port {cfg.PORT}...")
    app.run(debug=cfg.DEBUG, port=cfg.PORT)
