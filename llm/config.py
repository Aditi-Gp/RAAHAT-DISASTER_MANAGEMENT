import os
from pathlib import Path

class Config:
    # Model Configuration
    MODEL_NAME = "roberta-base"
    NUM_LABELS = 3
    MAX_LENGTH = 512
    BATCH_SIZE = 16
    LEARNING_RATE = 2e-5
    NUM_EPOCHS = 5
    
    # Categories
    CATEGORIES = {
        0: "Safe",
        1: "Needs Food/Water", 
        2: "Needs Rescue"
    }
    
    CATEGORY_TO_ID = {v: k for k, v in CATEGORIES.items()}
    
    # Paths
    BASE_DIR = Path(__file__).parent
    DATA_DIR = BASE_DIR / "data"
    MODEL_DIR = BASE_DIR / "models"
    
    # API Configuration
    API_HOST = os.getenv("API_HOST", "0.0.0.0")
    API_PORT = int(os.getenv("API_PORT", 8000))
    
    # Model paths
    MODEL_PATH = MODEL_DIR / "roberta_emergency_classifier"
    TOKENIZER_PATH = MODEL_DIR / "roberta_emergency_classifier"