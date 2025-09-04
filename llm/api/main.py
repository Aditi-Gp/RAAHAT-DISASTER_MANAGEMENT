
### api/main.py

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import logging
import time
from contextlib import asynccontextmanager
from typing import List

from api.models import (
    ClassificationRequest, ClassificationResponse,
    BatchClassificationRequest, BatchClassificationResponse,
    HealthResponse
)
from api.classification_service import classification_service
from config import Config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan"""
    # Startup
    logger.info("Starting Emergency Classification API...")
    
    # Load model on startup
    success = classification_service.load_model()
    if not success:
        logger.error("Failed to load model on startup!")
        raise RuntimeError("Model loading failed")
    
    logger.info("Model loaded successfully")
    yield
    
    # Shutdown
    logger.info("Shutting down Emergency Classification API...")

# Create FastAPI app
app = FastAPI(
    title="Emergency Classification API",
    description="AI-powered classification service for emergency response coordination",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to check if model is loaded
def get_classification_service():
    if not classification_service.is_loaded:
        raise HTTPException(
            status_code=503, 
            detail="Classification service not available. Model not loaded."
        )
    return classification_service

@app.get("/", response_model=dict)
async def root():
    """Root endpoint"""
    return {
        "message": "Emergency Classification API",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs"
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy" if classification_service.is_loaded else "unhealthy",
        model_loaded=classification_service.is_loaded
    )

@app.post("/classify", response_model=ClassificationResponse)
async def classify_text(
    request: ClassificationRequest,
    service = Depends(get_classification_service)
):
    """
    Classify a single emergency text
    
    Categories:
    - **Safe**: General information, status updates, non-urgent messages
    - **Needs Food/Water**: Requests for basic supplies, medical needs
    - **Needs Rescue**: Immediate danger, trapped people, life-threatening situations
    """
    try:
        start_time = time.time()
        
        # Validate input
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        # Classify text
        result = service.classify_text(
            text=request.text,
            include_metadata=request.include_metadata
        )
        
        # Log processing time
        processing_time = time.time() - start_time
        logger.info(f"Classified text in {processing_time:.3f}s: '{request.text[:50]}...' -> {result['category']}")
        
        # Add processing time to metadata if requested
        if request.include_metadata:
            if result.get('metadata') is None:
                result['metadata'] = {}
            result['metadata']['processing_time_seconds'] = processing_time
        
        return ClassificationResponse(**result)
        
    except Exception as e:
        logger.error(f"Error in classification: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")

@app.post("/classify/batch", response_model=BatchClassificationResponse)
async def classify_batch(
    request: BatchClassificationRequest,
    service = Depends(get_classification_service)
):
    """
    Classify multiple emergency texts in batch
    
    Efficiently processes up to 100 texts at once.
    """
    try:
        start_time = time.time()
        
        # Validate input
        if not request.texts:
            raise HTTPException(status_code=400, detail="Texts list cannot be empty")
        
        if len(request.texts) > 100:
            raise HTTPException(status_code=400, detail="Maximum 100 texts per batch")
        
        # Filter empty texts
        valid_texts = [text.strip() for text in request.texts if text.strip()]
        if not valid_texts:
            raise HTTPException(status_code=400, detail="No valid texts provided")
        
        # Classify batch
        results = service.classify_batch(
            texts=valid_texts,
            include_metadata=request.include_metadata
        )
        
        # Convert to response models
        classification_responses = [ClassificationResponse(**result) for result in results]
        
        processing_time = time.time() - start_time
        logger.info(f"Batch classified {len(valid_texts)} texts in {processing_time:.3f}s")
        
        return BatchClassificationResponse(
            results=classification_responses,
            processed_count=len(valid_texts)
        )
        
    except Exception as e:
        logger.error(f"Error in batch classification: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Batch classification failed: {str(e)}")

@app.get("/model/info")
async def get_model_info(service = Depends(get_classification_service)):
    """Get information about the loaded model"""
    return service.get_model_info()

@app.get("/categories")
async def get_categories():
    """Get available classification categories"""
    return {
        "categories": Config.CATEGORIES,
        "category_descriptions": {
            "Safe": "General information, status updates, non-urgent messages",
            "Needs Food/Water": "Requests for basic supplies, medical needs, non-critical assistance",
            "Needs Rescue": "Immediate danger, trapped people, life-threatening emergencies"
        }
    }

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "status_code": exc.status_code}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "status_code": 500}
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=Config.API_HOST,
        port=Config.API_PORT,
        reload=True,
        log_level="info"
    )