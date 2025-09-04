### 1. data_preprocessor.py
import pandas as pd
import json
import re
import nltk
from textblob import TextBlob
from sklearn.model_selection import train_test_split
from typing import Dict, List, Tuple
import numpy as np

nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)

class EmergencyDataPreprocessor:
    def __init__(self):
        self.rescue_keywords = [
            'trapped', 'help', 'rescue', 'stuck', 'emergency', 'urgent',
            'collapse', 'fire', 'accident', 'injury', 'bleeding', 'heart attack',
            'debris', 'rubble', 'evacuation', 'ambulance', 'medical help', 'sos',
            'building collapse', 'heavy machinery', 'screaming', 'under debris'
        ]
        
        self.food_water_keywords = [
            'food', 'water', 'hungry', 'thirsty', 'supplies', 'medicine',
            'drinking water', 'running out', 'no access', 'fever', 'blood donors',
            'medical supplies', 'food shortage', 'cut off'
        ]
        
        self.safe_keywords = [
            'prayers', 'stay safe', 'okay', 'aftershock', 'power out',
            'network down', 'confirm', 'roads open', 'traffic stopped',
            'everyone safe', 'all good', 'checking', 'power restored'
        ]

    def clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove URLs
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        
        # Remove hashtags but keep the text
        text = re.sub(r'#(\w+)', r'\1', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^\w\s.,!?-]', '', text)
        
        return text

    def auto_label_text(self, text: str) -> str:
        """Automatically label text based on keywords and patterns"""
        text_lower = text.lower()
        
        # High priority rescue indicators
        rescue_score = sum(1 for keyword in self.rescue_keywords if keyword in text_lower)
        
        # Food/water/medical needs
        food_water_score = sum(1 for keyword in self.food_water_keywords if keyword in text_lower)
        
        # Safe/informational indicators  
        safe_score = sum(1 for keyword in self.safe_keywords if keyword in text_lower)
        
        # Additional pattern matching for rescue scenarios
        if any(phrase in text_lower for phrase in [
            'trapped', 'stuck', 'help!', 'emergency', 'rescue', 'collapse',
            'bleeding', 'heart attack', 'fire', 'ambulance', 'medical help',
            'under debris', 'heavy machinery', 'screaming'
        ]):
            rescue_score += 3
            
        # Additional pattern matching for supplies
        if any(phrase in text_lower for phrase in [
            'need food', 'need water', 'running out', 'no access',
            'medical supplies', 'food shortage', 'blood donors'
        ]):
            food_water_score += 2
            
        # Additional pattern matching for safe/informational
        if any(phrase in text_lower for phrase in [
            'stay safe', 'prayers', 'is everyone okay', 'power out',
            'roads open', 'everyone safe', 'all good'
        ]):
            safe_score += 2
        
        # Decision logic with clear priorities
        if rescue_score >= 3:
            return "Needs Rescue"
        elif rescue_score >= 1 and any(word in text_lower for word in ['urgent', 'emergency', 'help']):
            return "Needs Rescue"  
        elif food_water_score >= 2:
            return "Needs Food/Water"
        elif safe_score >= 1:
            return "Safe"
        else:
            # Default based on urgency
            urgency_indicators = ['urgent', 'asap', 'immediately', 'help', 'please', 'need']
            if any(indicator in text_lower for indicator in urgency_indicators):
                return "Needs Food/Water"  # Conservative default for urgent non-rescue
            else:
                return "Safe"

    def process_csv_data(self, csv_path: str) -> List[Dict]:
        """Process the CSV data and create labeled dataset"""
        df = pd.read_csv(csv_path)
        
        processed_data = []
        for _, row in df.iterrows():
            text = row['text']
            cleaned_text = self.clean_text(text)
            label = self.auto_label_text(text)
            
            processed_data.append({
                'text': cleaned_text,
                'label': label,
                'original_text': text,
                'lat': row['lat'],
                'lon': row['lon'],
                'timestamp': row['timestamp']
            })
        
        return processed_data

    def create_training_data(self, processed_data: List[Dict]) -> Tuple[List[Dict], List[Dict], List[Dict]]:
        """Split data into train/val/test sets"""
        training_examples = []
        for item in processed_data:
            training_examples.append({
                'text': item['text'],
                'label': item['label']
            })
        
        # Split the data
        train_data, temp_data = train_test_split(training_examples, test_size=0.4, random_state=42, stratify=[item['label'] for item in training_examples])
        val_data, test_data = train_test_split(temp_data, test_size=0.5, random_state=42, stratify=[item['label'] for item in temp_data])
        
        return train_data, val_data, test_data

if __name__ == "__main__":
    # Create data directories
    import os
    os.makedirs("data/processed", exist_ok=True)
    os.makedirs("data/augmented", exist_ok=True)
    
    preprocessor = EmergencyDataPreprocessor()
    
    # Process the CSV file
    # processed_data = preprocessor.process_csv_data("twitter csv.csv")
    processed_data = preprocessor.process_csv_data("disaster_dataset.csv")
    
    # Create training splits
    train_data, val_data, test_data = preprocessor.create_training_data(processed_data)
    
    # Save processed data
    with open("data/processed/train.json", "w") as f:
        json.dump(train_data, f, indent=2)
    
    with open("data/processed/val.json", "w") as f:
        json.dump(val_data, f, indent=2)
        
    with open("data/processed/test.json", "w") as f:
        json.dump(test_data, f, indent=2)
    
    print(f"Training samples: {len(train_data)}")
    print(f"Validation samples: {len(val_data)}")
    print(f"Test samples: {len(test_data)}")
    
    # Print label distribution
    from collections import Counter
    train_labels = [item['label'] for item in train_data]
    print(f"Label distribution: {Counter(train_labels)}")
    
    # Show some examples
    print("\nSample classifications:")
    for item in processed_data[:5]:
        print(f"Text: {item['original_text'][:80]}...")
        print(f"Label: {item['label']}\n")