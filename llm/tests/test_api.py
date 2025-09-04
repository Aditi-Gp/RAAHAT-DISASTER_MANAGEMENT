import pytest
import json
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

@pytest.fixture
def sample_texts():
    return [
        "Help! Water rising fast in our house near Wakad. We are trapped on the second floor.",
        "Is anyone else's power out in Pimple Saudagar?",
        "We are running out of drinking water. Stranded in our apartment complex in Thergaon for 12 hours.",
        "Sending prayers to everyone affected. Stay safe."
    ]

def test_root_endpoint():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data

def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "model_loaded" in data

def test_single_classification():
    """Test single text classification"""
    test_data = {
        "text": "Help! Water rising fast in our house. We are trapped on the second floor.",
        "include_confidence": True,
        "include_metadata": False
    }
    
    response = client.post("/classify", json=test_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "category" in data
    assert "confidence" in data
    assert "category_id" in data
    assert data["category"] in ["Safe", "Needs Food/Water", "Needs Rescue"]
    assert 0 <= data["confidence"] <= 1

def test_single_classification_with_metadata():
    """Test single classification with metadata"""
    test_data = {
        "text": "Emergency! Building collapse at Hinjawadi. People trapped under rubble!",
        "include_confidence": True,
        "include_metadata": True
    }
    
    response = client.post("/classify", json=test_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "metadata" in data
    assert "probability_distribution" in data["metadata"]
    assert "text_features" in data["metadata"]

def test_batch_classification(sample_texts):
    """Test batch classification"""
    test_data = {
        "texts": sample_texts,
        "include_confidence": True,
        "include_metadata": False
    }
    
    response = client.post("/classify/batch", json=test_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "results" in data
    assert "processed_count" in data
    assert len(data["results"]) == len(sample_texts)
    assert data["processed_count"] == len(sample_texts)
    
    # Check each result
    for result in data["results"]:
        assert "category" in result
        assert "confidence" in result
        assert result["category"] in ["Safe", "Needs Food/Water", "Needs Rescue"]

def test_empty_text_error():
    """Test error handling for empty text"""
    test_data = {
        "text": "",
        "include_confidence": True
    }
    
    response = client.post("/classify", json=test_data)
    assert response.status_code == 400

def test_batch_size_limit():
    """Test batch size limit"""
    large_batch = ["test text"] * 101
    test_data = {
        "texts": large_batch,
        "include_confidence": True
    }
    
    response = client.post("/classify/batch", json=test_data)
    assert response.status_code == 400

def test_get_categories():
    """Test categories endpoint"""
    response = client.get("/categories")
    assert response.status_code == 200
    
    data = response.json()
    assert "categories" in data
    assert "category_descriptions" in data

def test_model_info():
    """Test model info endpoint"""
    response = client.get("/model/info")
    assert response.status_code == 200
    
    data = response.json()
    assert "is_loaded" in data
    assert "categories" in data