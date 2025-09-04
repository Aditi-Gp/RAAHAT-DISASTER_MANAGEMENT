import json
import re
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score
import joblib
from config import Config
import os

class SimpleEmergencyClassifier:
    """Lightweight rule-based + ML classifier for low-memory systems"""
    
    def __init__(self):
        self.pipeline = None
        self.categories = Config.CATEGORIES
        
        # Enhanced keyword lists
        self.rescue_patterns = [
            r'\b(trapped|stuck|help|rescue|emergency|urgent)\b',
            r'\b(collapse|fire|accident|injury|bleeding)\b',
            r'\b(heart attack|debris|rubble|evacuation)\b',
            r'\b(ambulance|medical help|heavy machinery)\b',
            r'help!|sos|emergency!',
            r'\b(trapped.*floor|stuck.*roof|under.*debris)\b'
        ]
        
        self.food_water_patterns = [
            r'\b(running out|no access|need.*water|need.*food)\b',
            r'\b(supplies|medicine|drinking water|food shortage)\b',
            r'\b(medical supplies|blood donors|fever)\b',
            r'\b(cut off.*hours|stranded.*hours)\b'
        ]
        
        self.safe_patterns = [
            r'\b(prayers|stay safe|everyone.*safe|all good)\b',
            r'\b(power.*out|network.*down|roads.*open)\b',
            r'\b(checking|confirm|aftershock)\b'
        ]

    def extract_features(self, text):
        """Extract rule-based features"""
        text_lower = text.lower()
        
        # Count pattern matches
        rescue_score = sum(len(re.findall(pattern, text_lower)) for pattern in self.rescue_patterns)
        food_water_score = sum(len(re.findall(pattern, text_lower)) for pattern in self.food_water_patterns)
        safe_score = sum(len(re.findall(pattern, text_lower)) for pattern in self.safe_patterns)
        
        # Text features
        urgency_words = ['urgent', 'asap', 'immediately', 'help', 'please', 'emergency']
        urgency_count = sum(1 for word in urgency_words if word in text_lower)
        
        return {
            'rescue_score': rescue_score,
            'food_water_score': food_water_score,
            'safe_score': safe_score,
            'urgency_count': urgency_count,
            'has_exclamation': '!' in text,
            'has_caps': any(c.isupper() for c in text),
            'word_count': len(text.split()),
            'text': text  # For TF-IDF
        }

    def rule_based_classify(self, text):
        """Simple rule-based classification"""
        features = self.extract_features(text)
        
        if features['rescue_score'] >= 2:
            return "Needs Rescue", 0.8
        elif features['rescue_score'] >= 1 and features['urgency_count'] >= 1:
            return "Needs Rescue", 0.7
        elif features['food_water_score'] >= 2:
            return "Needs Food/Water", 0.8
        elif features['food_water_score'] >= 1 and features['urgency_count'] >= 1:
            return "Needs Food/Water", 0.7
        elif features['safe_score'] >= 1:
            return "Safe", 0.8
        elif features['urgency_count'] >= 2:
            return "Needs Food/Water", 0.6  # Conservative default
        else:
            return "Safe", 0.6

    def train_ml_classifier(self, train_data):
        """Train a simple ML classifier"""
        texts = [item['text'] for item in train_data]
        labels = [item['label'] for item in train_data]
        
        self.pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(max_features=5000, stop_words='english')),
            ('classifier', MultinomialNB())
        ])
        
        print("Training simple ML classifier...")
        self.pipeline.fit(texts, labels)
        
        # Test on training data
        predictions = self.pipeline.predict(texts)
        accuracy = accuracy_score(labels, predictions)
        print(f"Training accuracy: {accuracy:.3f}")
        
        return self.pipeline

    def predict(self, text):
        """Predict using hybrid approach"""
        # Try rule-based first
        rule_prediction, rule_confidence = self.rule_based_classify(text)
        
        if self.pipeline is not None and rule_confidence < 0.8:
            # Use ML classifier for uncertain cases
            ml_prediction = self.pipeline.predict([text])[0]
            ml_proba = self.pipeline.predict_proba([text])[0]
            ml_confidence = max(ml_proba)
            
            # Combine predictions
            if ml_confidence > rule_confidence:
                return ml_prediction, ml_confidence
        
        return rule_prediction, rule_confidence

    def train_and_save(self):
        """Train and save the classifier"""
        # Load training data
        train_path = "data/processed/train.json"
        if not os.path.exists(train_path):
            print("No training data found. Run data preprocessing first.")
            return
        
        with open(train_path, 'r') as f:
            train_data = json.load(f)
        
        # Train ML classifier
        self.train_ml_classifier(train_data)
        
        # Save the model
        os.makedirs("models", exist_ok=True)
        joblib.dump(self.pipeline, "models/simple_classifier.pkl")
        
        # Test the classifier
        print("\n Testing classifier...")
        test_texts = [
            "Help! Water rising fast in our house. We are trapped on the second floor.",
            "Is anyone else's power out in the area?",
            "We are running out of drinking water. Need supplies urgently.",
            "Building collapse! People trapped under debris.",
            "Everyone is safe here. Sending prayers."
        ]
        
        for text in test_texts:
            prediction, confidence = self.predict(text)
            print(f"Text: {text[:50]}...")
            print(f"Prediction: {prediction} (confidence: {confidence:.3f})\n")

    def load(self):
        """Load the saved classifier"""
        try:
            self.pipeline = joblib.load("models/simple_classifier.pkl")
            print("classifier loaded successfully")
            return True
        except FileNotFoundError:
            print("No saved classifier found. Train first.")
            return False

if __name__ == "__main__":
    classifier = SimpleEmergencyClassifier()
    classifier.train_and_save()