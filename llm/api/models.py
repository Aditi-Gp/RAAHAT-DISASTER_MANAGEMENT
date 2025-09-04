from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from typing import List

class ClassificationRequest(BaseModel):
    text: str = Field(..., description="Text to classify", min_length=1, max_length=1000)
    include_confidence: bool = Field(default=True, description="Include confidence scores")
    include_metadata: bool = Field(default=False, description="Include additional metadata")

class ClassificationResponse(BaseModel):
    category: str = Field(..., description="Predicted category")
    confidence: float = Field(..., description="Confidence score")
    category_id: int = Field(..., description="Category ID")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional metadata")

class BatchClassificationRequest(BaseModel):
    # texts: list[str] = Field(..., description="List of texts to classify", max_items=100)
    texts: List[str] = Field(..., description="List of texts to classify", max_items=100)
    include_confidence: bool = Field(default=True, description="Include confidence scores")
    include_metadata: bool = Field(default=False, description="Include additional metadata")

class BatchClassificationResponse(BaseModel):
    # results: list[ClassificationResponse]
    results: List[ClassificationResponse]
    processed_count: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    version: str = "1.0.0"