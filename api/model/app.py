import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from image_processing import process_image_with_model
from instruct import generate_image

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

UPLOAD_FOLDER = './uploads'
PROCESSED_FOLDER = './processed'
COLLECTION_FOLDER = './collection'

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)
os.makedirs(COLLECTION_FOLDER, exist_ok=True)


def get_next_filename(folder_path):
    existing_files = [f for f in os.listdir(folder_path) if f.startswith("img")]
    next_number = len(existing_files) + 1
    return f"img{next_number}"


def get_user_folder(base_folder, username):
    folder_path = os.path.join(base_folder, username)
    os.makedirs(folder_path, exist_ok=True)
    return folder_path


@app.route('/api/upload', methods=['POST'])
def upload_image():
    if 'username' not in request.form or 'image' not in request.files or 'prompt_id' not in request.form:
        return jsonify({'error': 'Username, image file, or prompt_id missing'}), 400

    username = request.form['username']
    prompt_id = int(request.form['prompt_id'])
    image_file = request.files['image']

    if image_file.filename == '':
        return jsonify({'error': 'No image selected'}), 400

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
        # Use generate_image function
        generate_image(image_path, processed_image_path, prompt_id)
        print("Image generated successfully")
    elif prompt_id == 4:
        # Use custom processing for prompt_id 4
        process_image_with_model(image_path, processed_image_path)
    else:
        return jsonify({'error': 'Invalid prompt_id. Use 1-4.'}), 400

    # Move processed file to collection folder
    collection_filename = get_next_filename(user_collection_folder) + os.path.splitext(processed_image_path)[1]
    collection_image_path = os.path.join(user_collection_folder, collection_filename)
    os.rename(processed_image_path, collection_image_path)

    return jsonify({'processedImage': f"{username}/{collection_filename}"})


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
        # Save the file in the collection folder
        collection_filename = get_next_filename(user_collection_folder) + os.path.splitext(image_file.filename)[1]
        collection_image_path = os.path.join(user_collection_folder, collection_filename)
        image_file.save(collection_image_path)

        return jsonify({'message': 'Image saved successfully', 'processedImage': f"{username}/{collection_filename}"})
    except Exception as e:
        return jsonify({'error': f'An error occurred while saving the image: {str(e)}'}), 500


@app.route('/processed/<username>/<filename>', methods=['GET'])
def get_processed_image(username, filename):
    return send_from_directory(os.path.join(COLLECTION_FOLDER, username), filename)


if __name__ == '__main__':
    print("Server started")
    app.run(debug=True, port=5000)
