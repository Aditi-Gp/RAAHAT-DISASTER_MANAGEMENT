import re
import string
from typing import List, Dict, Any
import nltk
from textblob import TextBlob

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

class TextPreprocessor:
    """Utility class for text preprocessing"""
    
    def __init__(self):
        self.stop_words = set(nltk.corpus.stopwords.words('english'))
        
        # Emergency-specific keywords that should not be removed
        self.emergency_keywords = {
            'help', 'emergency', 'urgent', 'rescue', 'trapped', 'stuck',
            'fire', 'flood', 'earthquake', 'medical', 'ambulance', 'police'
        }
    
    def clean_text(self, text: str) -> str:
        """Basic text cleaning"""
        if not text:
            return ""
        
        # Remove URLs
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        
        # Remove email addresses
        text = re.sub(r'\S+@\S+', '', text)
        
        # Remove hashtags but keep the text
        text = re.sub(r'#(\w+)', r'\1', text)
        
        # Remove mentions but keep the text
        text = re.sub(r'@(\w+)', r'\1', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def extract_urgency_indicators(self, text: str) -> Dict[str, Any]:
        """Extract urgency indicators from text"""
        text_lower = text.lower()
        
        urgency_words = [
            'urgent', 'emergency', 'asap', 'immediately', 'help', 'rescue',
            'trapped', 'stuck', 'critical', 'serious', 'severe'
        ]
        
        time_indicators = [
            'now', 'immediately', 'asap', 'urgent', 'quickly', 'fast'
        ]
        
        location_indicators = [
            'at', 'in', 'near', 'behind', 'under', 'on', 'location', 'address'
        ]
        
        return {
            'urgency_word_count': sum(1 for word in urgency_words if word in text_lower),
            'time_indicator_count': sum(1 for word in time_indicators if word in text_lower),
            'location_indicator_count': sum(1 for word in location_indicators if word in text_lower),
            'has_exclamation': '!' in text,
            'has_caps': any(c.isupper() for c in text),
            'word_count': len(text.split()),
            'char_count': len(text)
        }
    
    def extract_location_info(self, text: str) -> Dict[str, Any]:
        """Extract potential location information"""
        # Simple regex patterns for common location formats
        location_patterns = {
            'coordinates': r'(\d+\.?\d*)[,\s]*(\d+\.?\d*)',
            'area_names': r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b',
            'addresses': r'\d+\s+[A-Za-z\s]+(?:Street|St|Road|Rd|Avenue|Ave|Lane|Ln)',
            'landmarks': r'(?:near|at|behind|in front of)\s+([A-Za-z\s]+)'
        }
        
        extracted_info = {}
        
        for pattern_name, pattern in location_patterns.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                extracted_info[pattern_name] = matches
        
        return extracted_info

class TextAnalyzer:
    """Advanced text analysis utilities"""
    
    @staticmethod
    def get_sentiment(text: str) -> Dict[str, float]:
        """Get sentiment analysis"""
        blob = TextBlob(text)
        return {
            'polarity': blob.sentiment.polarity,  # -1 to 1
            'subjectivity': blob.sentiment.subjectivity  # 0 to 1
        }
    
    @staticmethod
    def extract_keywords(text: str, top_k: int = 5) -> List[str]:
        """Extract top keywords from text"""
        # Simple keyword extraction based on frequency
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
        
        # Remove common stop words but keep emergency-related words
        stop_words = set(nltk.corpus.stopwords.words('english'))
        emergency_keywords = {
            'help', 'emergency', 'urgent', 'rescue', 'trapped', 'stuck',
            'fire', 'flood', 'earthquake', 'medical', 'ambulance', 'police'
        }
        
        filtered_words = [
            word for word in words 
            if word not in stop_words or word in emergency_keywords
        ]
        
        # Count frequency
        word_freq = {}
        for word in filtered_words:
            word_freq[word] = word_freq.get(word, 0) + 1
        
        # Sort by frequency and return top k
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        return [word for word, freq in sorted_words[:top_k]]

def validate_text_input(text: str, min_length: int = 1, max_length: int = 1000) -> Dict[str, Any]:
    """Validate text input"""
    if not text:
        return {"valid": False, "error": "Text cannot be empty"}
    
    if len(text) < min_length:
        return {"valid": False, "error": f"Text too short. Minimum length: {min_length}"}
    
    if len(text) > max_length:
        return {"valid": False, "error": f"Text too long. Maximum length: {max_length}"}
    
    # Check if text contains only whitespace or special characters
    if not re.search(r'[a-zA-Z]', text):
        return {"valid": False, "error": "Text must contain at least some alphabetic characters"}
    
    return {"valid": True, "error": None}

def format_confidence_score(confidence: float) -> str:
    """Format confidence score for display"""
    if confidence >= 0.9:
        return f"Very High ({confidence:.1%})"
    elif confidence >= 0.7:
        return f"High ({confidence:.1%})"
    elif confidence >= 0.5:
        return f"Medium ({confidence:.1%})"
    else:
        return f"Low ({confidence:.1%})"