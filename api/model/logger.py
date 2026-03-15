import logging
import sys
import os
from datetime import datetime

def get_logger(name="Jewelify"):
    """
    Returns a structured logger with a consistent format:
    [TIMESTAMP] [LEVEL] [COMPONENT] MESSAGE
    """
    logger = logging.getLogger(name)
    
    # Set logging level from environment variable or default to INFO
    log_level_str = os.environ.get("LOG_LEVEL", "INFO").upper()
    log_level = getattr(logging, log_level_str, logging.INFO)
    logger.setLevel(log_level)

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        # Standard format: [2026-03-15 17:48:00] [INFO] [Jewelify] Server startup complete.
        formatter = logging.Formatter(
            '[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
    return logger

# Pre-instantiated logger for convenience
logger = get_logger()
