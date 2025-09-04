import logging
from typing import Dict, List
from classifier import SimpleEmergencyClassifier  # import your classifier
from config import Config
logger = logging.getLogger(__name__)

class EmergencyClassificationService:
    def __init__(self):
        self.classifier = SimpleEmergencyClassifier()
        self.is_loaded = False
        self.categories = self.classifier.categories

    def load_model(self) -> bool:
        """Load or initialize the classifier"""
        logger.info("Loading emergency classification model...")
        try:
            success = self.classifier.load()
            if not success:
                logger.info("Training new classifier as no saved model found...")
                self.classifier.train_and_save()
            self.is_loaded = True
            logger.info("Classifier loaded successfully")
            return True
        except Exception as e:
            logger.error(f"Error loading classifier: {str(e)}")
            self.is_loaded = False
            return False

    def classify_text(self, text: str, include_metadata: bool = False) -> dict:
        category, confidence = self.classifier.predict(text)
        category = category.strip()  # remove any extra whitespace

        try:
            category_id = next((k for k, v in Config.CATEGORIES.items() if v == category), -1)
        except ValueError:
            category_id = -1  # fallback for unknown category

        result = {
            "category": category,
            "confidence": confidence,
            "category_id": category_id
        }

        if include_metadata:
            result["metadata"] = self.classifier.extract_features(text)

        return result


    def classify_batch(self, texts: List[str], include_metadata: bool = False) -> List[Dict]:
        """Classify multiple texts"""
        if not self.is_loaded:
            raise RuntimeError("Classifier not loaded. Call load_model() first.")
        
        results = []
        for text in texts:
            results.append(self.classify_text(text, include_metadata=include_metadata))
        return results

    def get_model_info(self) -> Dict:
        """Get information about the loaded classifier"""
        return {
            'is_loaded': self.is_loaded,
            'categories': self.categories,
            'num_categories': len(self.categories)
        }

# Global service instance
classification_service = EmergencyClassificationService()
