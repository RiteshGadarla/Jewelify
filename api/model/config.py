import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """
    Centralized configuration for Jewelify Flask API.
    Values are read from environment variables with sensible defaults.
    """
    # Server Configuration
    PORT = int(os.environ.get("FLASK_PORT", 5000))
    DEBUG = os.environ.get("FLASK_DEBUG", "True").lower() == "true"
    
    # App Mode: 'dev' or 'actual'
    APP_MODE = os.environ.get("APP_MODE", "actual")
    
    # Logging
    LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO").upper()
    
    # Paths
    UPLOAD_FOLDER = os.environ.get("UPLOAD_FOLDER", "./uploads")
    PROCESSED_FOLDER = os.environ.get("PROCESSED_FOLDER", "./processed")
    COLLECTION_FOLDER = os.environ.get("COLLECTION_FOLDER", "./collection")
    MOCK_IMAGES_DIR = os.environ.get("MOCK_IMAGES_DIR", "./mock_images")
    
    # Model Paths
    PIX2PIX_MODEL_PATH = os.environ.get("PIX2PIX_MODEL_PATH", "generator.h5")
    INSTRUCT_PIX2PIX_MODEL_ID = os.environ.get("INSTRUCT_PIX2PIX_MODEL_ID", "timbrooks/instruct-pix2pix")

# Instance for easy import
cfg = Config()
