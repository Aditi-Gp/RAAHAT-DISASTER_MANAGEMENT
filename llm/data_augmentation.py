import random
import json
from typing import List, Dict
import nltk
from nltk.corpus import wordnet

class DataAugmenter:
    def __init__(self):
        nltk.download('wordnet')
        
        # Template-based augmentation for emergency scenarios
        self.rescue_templates = [
            "We are trapped in {location}. Need immediate rescue!",
            "Emergency at {location}! People are stuck and need help.",
            "Urgent help needed at {location}. Cannot escape.",
            "SOS! Trapped in {location} with {number} people.",
            "Building collapse at {location}. People under debris!",
        ]
        
        self.food_water_templates = [
            "Running out of water at {location}. Need supplies.",
            "No food for {time} in {location}. Please send help.",
            "Medical supplies needed at {location} urgently.",
            "We need drinking water at {location}. Cut off for hours.",
            "Food shortage at {location}. Many people affected.",
        ]
        
        self.safe_templates = [
            "Everyone is safe at {location}. Checking on others.",
            "Roads to {location} are clear. Traffic moving.",
            "Power restored in {location}. All good here.",
            "Is {location} area safe? Can anyone confirm?",
            "Sending prayers from {location}. Stay strong!",
        ]
        
        self.locations = [
            "Wakad", "Hinjawadi", "Pimple Saudagar", "Rahatani", 
            "Kalewadi", "Thergaon", "Akurdi", "Moshi", "Aundh"
        ]
        
        self.times = ["2 hours", "6 hours", "12 hours", "1 day", "several hours"]
        self.numbers = ["4", "6", "8", "10", "15", "20"]

    def get_synonyms(self, word: str) -> List[str]:
        """Get synonyms for a word using WordNet"""
        synonyms = set()
        for syn in wordnet.synsets(word):
            for lemma in syn.lemmas():
                synonym = lemma.name().replace('_', ' ')
                if synonym != word and synonym.isalpha():
                    synonyms.add(synonym)
        return list(synonyms)[:3]  # Return max 3 synonyms

    def synonym_replacement(self, text: str, n: int = 1) -> str:
        """Replace n words with their synonyms"""
        words = text.split()
        new_words = words.copy()
        random_word_indices = random.sample(range(len(words)), min(n, len(words)))
        
        for idx in random_word_indices:
            word = words[idx]
            synonyms = self.get_synonyms(word)
            if synonyms:
                new_words[idx] = random.choice(synonyms)
        
        return ' '.join(new_words)

    def random_insertion(self, text: str, n: int = 1) -> str:
        """Randomly insert n words into the sentence"""
        words = text.split()
        
        for _ in range(n):
            # Insert urgency words for emergency contexts
            urgency_words = ["urgent", "immediate", "please", "asap", "quickly"]
            word_to_insert = random.choice(urgency_words)
            random_idx = random.randint(0, len(words))
            words.insert(random_idx, word_to_insert)
        
        return ' '.join(words)

    def generate_template_data(self, count_per_category: int = 50) -> List[Dict]:
        """Generate synthetic data using templates"""
        synthetic_data = []
        
        # Generate rescue scenarios
        for _ in range(count_per_category):
            template = random.choice(self.rescue_templates)
            text = template.format(
                location=random.choice(self.locations),
                number=random.choice(self.numbers)
            )
            synthetic_data.append({"text": text, "label": "Needs Rescue"})
        
        # Generate food/water scenarios
        for _ in range(count_per_category):
            template = random.choice(self.food_water_templates)
            text = template.format(
                location=random.choice(self.locations),
                time=random.choice(self.times)
            )
            synthetic_data.append({"text": text, "label": "Needs Food/Water"})
        
        # Generate safe scenarios
        for _ in range(count_per_category):
            template = random.choice(self.safe_templates)
            text = template.format(location=random.choice(self.locations))
            synthetic_data.append({"text": text, "label": "Safe"})
        
        return synthetic_data

    def augment_existing_data(self, data: List[Dict], augment_factor: int = 3) -> List[Dict]:
        """Augment existing data with variations"""
        augmented_data = data.copy()
        
        for item in data:
            for _ in range(augment_factor):
                original_text = item['text']
                
                # Apply different augmentation techniques
                if random.random() < 0.4:  # Synonym replacement
                    augmented_text = self.synonym_replacement(original_text, n=2)
                elif random.random() < 0.7:  # Random insertion
                    augmented_text = self.random_insertion(original_text, n=1)
                else:  # Combination
                    augmented_text = self.synonym_replacement(original_text, n=1)
                    augmented_text = self.random_insertion(augmented_text, n=1)
                
                augmented_data.append({
                    "text": augmented_text,
                    "label": item['label']
                })
        
        return augmented_data

# Usage
if __name__ == "__main__":
    augmenter = DataAugmenter()
    
    # Load original training data
    with open("data/processed/train.json", "r") as f:
        original_data = json.load(f)
    
    # Generate synthetic data
    synthetic_data = augmenter.generate_template_data(count_per_category=100)
    
    # Augment original data
    augmented_original = augmenter.augment_existing_data(original_data, augment_factor=5)
    
    # Combine all data
    final_training_data = augmented_original + synthetic_data
    
    # Save augmented dataset
    with open("data/augmented/augmented_train.json", "w") as f:
        json.dump(final_training_data, f, indent=2)
    
    print(f"Original training samples: {len(original_data)}")
    print(f"Synthetic samples: {len(synthetic_data)}")
    print(f"Final training samples: {len(final_training_data)}")
    
    # Print final label distribution
    from collections import Counter
    labels = [item['label'] for item in final_training_data]
    print(f"Final label distribution: {Counter(labels)}")