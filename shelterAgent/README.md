# 🏠 Raahat Shelter Agent - Intelligent Shelter Management System

[![FastAPI](https://img.shields.io/badge/FastAPI-0.68.1-009639.svg)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org/)
[![Pydantic](https://img.shields.io/badge/Pydantic-1.8.2-E92063.svg)](https://pydantic-docs.helpmanual.io/)
[![Uvicorn](https://img.shields.io/badge/Uvicorn-0.15.0-00D2DF.svg)](https://www.uvicorn.org/)

An intelligent shelter management microservice for the Raahat disaster management system. This service provides comprehensive shelter discovery, inventory management, and resource optimization for emergency response scenarios.

## 🌟 Features

### 🏠 Shelter Discovery & Management

- **Geospatial shelter search** with configurable radius filtering
- **Real-time availability tracking** with capacity monitoring
- **Distance-based sorting** for optimal shelter recommendations
- **Multi-criteria filtering** (capacity, supplies, distance)
- **Owner contact information** for direct communication

### 📦 Intelligent Inventory System

- **Real-time supply tracking** across all shelter categories
- **Low stock alerts** with configurable thresholds
- **Surplus identification** for resource redistribution
- **Automated inventory updates** with validation
- **Supply categorization** (Food, Medical, Essential supplies)

### 🔍 Advanced Analytics

- **Comprehensive supply reports** with aggregated data
- **Resource optimization suggestions** based on demand patterns
- **Capacity utilization analysis** across shelter network
- **Supply chain gap identification** for proactive restocking
- **Geographic distribution analysis** of resources

### 🚀 High-Performance API

- **RESTful API design** with OpenAPI documentation
- **Fast geospatial calculations** using optimized algorithms
- **Scalable architecture** supporting high concurrent requests
- **Input validation** with Pydantic models
- **Comprehensive error handling** with detailed responses

## 🛠️ Technology Stack

### Core Framework

- **FastAPI 0.68.1** - Modern, fast web framework for building APIs
- **Uvicorn 0.15.0** - Lightning-fast ASGI server
- **Pydantic 1.8.2** - Data validation using Python type annotations
- **Python 3.8+** - Latest Python features and performance

### Geospatial Processing

- **Geopy 2.2.0** - Geospatial calculations and distance computations
- **Geodesic distance calculations** for accurate location-based operations
- **Coordinate system handling** for global shelter network support

### Data Management

- **In-memory data structures** optimized for fast querying
- **JSON-based configuration** for easy shelter data management
- **Structured supply categorization** for efficient inventory tracking

## 📁 Project Structure

```
shelterAgent/
├── main.py              # FastAPI application and API endpoints
├── shelter.py           # Core shelter management logic and data
├── requirements.txt     # Python dependencies
├── README.md           # This documentation
└── __pycache__/        # Python bytecode cache
```

## 🏗️ Architecture Overview

### Core Components

#### 1. Shelter Data Model

```python
shelter = {
    'id': int,                    # Unique shelter identifier
    'name': str,                  # Shelter name
    'coordinates': (lat, lng),    # GPS coordinates
    'owner': {                    # Contact information
        'name': str,
        'phone': str
    },
    'capacity': int,              # Maximum occupancy
    'available_slots': int,       # Current availability
    'address': str,               # Physical address
    'food_supplies': {...},       # Food inventory
    'medical_supplies': {...},    # Medical inventory
    'essential_supplies': {...}   # Essential items inventory
}
```

#### 2. Supply Categories

- **Food Supplies**: Rice, Dal, Ready-to-eat meals, Drinking Water
- **Medical Supplies**: First Aid Kits, Painkillers, Antibiotics, ORS
- **Essential Supplies**: Blankets, Tents, Sleeping Bags, Hygiene Kits

#### 3. Inventory Management System

```python
class InventorySystem:
    - check_low_supplies(threshold)      # Identify low stock items
    - find_nearest_surplus(shelter_id, item)  # Locate surplus resources
    - update_inventory(shelter_id, updates)   # Modify stock levels
```

## 🚀 Getting Started

### Prerequisites

- **Python 3.8 or higher**
- **pip** package manager
- **Virtual environment** (recommended)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd raahat/shelterAgent
   ```

2. **Create virtual environment**

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Start the development server**

   ```bash
   python main.py
   ```

   Or using Uvicorn directly:

   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

5. **Access the API**
   - **API Base URL**: `http://localhost:8000`
   - **Interactive Documentation**: `http://localhost:8000/docs`
   - **Alternative Documentation**: `http://localhost:8000/redoc`

## 📚 API Documentation

### 🏠 Shelter Discovery

#### Get Nearby Shelters

Find shelters within a specified radius of given coordinates.

```http
GET /shelters/nearby/?lat={latitude}&lon={longitude}&radius={radius_km}
```

**Parameters:**

- `lat` (float, required): Latitude coordinate
- `lon` (float, required): Longitude coordinate
- `radius` (float, optional): Search radius in kilometers (default: 5)

**Response:**

```json
[
  {
    "name": "Safe Haven Shelter",
    "address": "Connaught Place, New Delhi",
    "owner_name": "Anita Sharma",
    "owner_phone": "+91-9876543210",
    "capacity": 50,
    "available_slots": 12,
    "distance_km": 2.34,
    "food_info": {
      "meals_available": 100,
      "food_stock_days": 5,
      "special_diets": true,
      "last_restock_date": "2025-08-23",
      "supplies": [...]
    },
    "medical_info": {...},
    "essential_info": {...}
  }
]
```

**Example Usage:**

```bash
curl "http://localhost:8000/shelters/nearby/?lat=28.6448&lon=77.2167&radius=10"
```

### 📦 Supply Management

#### Check Low Supplies

Identify shelters with supplies below the specified threshold.

```http
GET /shelters/supplies/low?threshold={quantity}
```

**Parameters:**

- `threshold` (int, optional): Minimum quantity threshold (default: 20)

**Response:**

```json
[
  {
    "shelter_name": "Hope Center",
    "items": [
      {
        "item": "Rice",
        "quantity": "15 kg"
      },
      {
        "item": "First Aid Kits",
        "quantity": "8 units"
      }
    ]
  }
]
```

#### Generate Supply Report

Get comprehensive supply report across all shelters.

```http
GET /shelters/supplies/report
```

**Response:**

```json
{
  "food": {
    "Rice": 150.0,
    "Dal": 75.0,
    "Drinking Water": 300.0,
    "Ready-to-eat meals": 225.0
  },
  "medicine": {
    "First Aid Kits": 35.0,
    "Painkillers": 800.0,
    "Antibiotics": 350.0,
    "ORS": 500.0
  },
  "essentials": {
    "Blankets": 180.0,
    "Tents": 45.0,
    "Sleeping Bags": 135.0,
    "Hygiene Kits": 270.0
  }
}
```

#### Find Surplus Supplies

Locate nearest shelter with surplus of a specific item.

```http
GET /shelters/{shelter_id}/surplus/{item}
```

**Parameters:**

- `shelter_id` (int): Source shelter ID
- `item` (str): Item name to search for

**Response:**

```json
[
  {
    "shelter_name": "Safe Haven Shelter",
    "distance": 3.45,
    "available_quantity": "100 kg"
  }
]
```

#### Update Inventory

Modify inventory levels for a specific shelter.

```http
POST /shelters/{shelter_id}/inventory/update
```

**Request Body:**

```json
[
  {
    "item": "Rice",
    "change": 50.0
  },
  {
    "item": "Drinking Water",
    "change": -20.0
  }
]
```

**Response:**

```json
{
  "status": "success",
  "updated_supplies": [
    {
      "item": "Rice",
      "quantity": "150 kg"
    },
    {
      "item": "Drinking Water",
      "quantity": "180 L"
    }
  ]
}
```

## 🏠 Shelter Data Management

### Current Shelter Network

The system includes pre-configured shelters in the Delhi area:

#### Safe Haven Shelter

- **Location**: Connaught Place, New Delhi (28.6448, 77.2167)
- **Capacity**: 50 people (12 available slots)
- **Owner**: Anita Sharma (+91-9876543210)
- **Specialties**: Special diet accommodations, well-stocked medical supplies

#### Hope Center

- **Location**: Karol Bagh, New Delhi (28.6353, 77.2250)
- **Capacity**: 30 people (5 available slots)
- **Owner**: Rajiv Kumar (+91-9123456780)
- **Specialties**: Compact facility, essential supplies focused

### Adding New Shelters

To add new shelters, update the `shelters` list in `shelter.py`:

```python
new_shelter = {
    'id': 3,
    'name': 'New Relief Center',
    'coordinates': (latitude, longitude),
    'owner': {'name': 'Owner Name', 'phone': '+91-XXXXXXXXXX'},
    'capacity': 100,
    'available_slots': 75,
    'address': 'Physical Address',
    'food_supplies': {...},
    'medical_supplies': {...},
    'essential_supplies': {...}
}
shelters.append(new_shelter)
```

## 🔧 Configuration Options

### Supply Thresholds

Configure low stock thresholds in API calls:

```python
# Default threshold: 20 units
LOW_STOCK_THRESHOLD = 20

# Custom threshold for specific operations
CRITICAL_THRESHOLD = 10
REORDER_THRESHOLD = 30
```

### Search Parameters

Adjust search radius and filtering:

```python
DEFAULT_SEARCH_RADIUS = 5  # kilometers
MAX_SEARCH_RADIUS = 50     # kilometers
SURPLUS_THRESHOLD = 30     # units for surplus detection
```

### Supply Categories

Customize supply categorization:

```python
SUPPLY_CATEGORIES = {
    'food': ['Rice', 'Dal', 'Ready-to-eat meals', 'Drinking Water'],
    'medicine': ['First Aid Kits', 'Painkillers', 'Antibiotics', 'ORS'],
    'essentials': ['Blankets', 'Tents', 'Sleeping Bags', 'Hygiene Kits']
}
```

## 🧪 Testing

### Manual Testing

Test the API endpoints using the interactive documentation:

```bash
# Start the server
python main.py

# Open browser
http://localhost:8000/docs
```

### Example Test Scenarios

#### 1. Shelter Discovery Test

```bash
# Find shelters near Delhi center
curl "http://localhost:8000/shelters/nearby/?lat=28.6139&lon=77.2090&radius=10"
```

#### 2. Supply Management Test

```bash
# Check low supplies
curl "http://localhost:8000/shelters/supplies/low?threshold=25"

# Generate supply report
curl "http://localhost:8000/shelters/supplies/report"
```

#### 3. Inventory Update Test

```bash
# Update shelter inventory
curl -X POST "http://localhost:8000/shelters/1/inventory/update" \
     -H "Content-Type: application/json" \
     -d '[{"item": "Rice", "change": 25}]'
```

### Python Testing

```python
import requests

# Test nearby shelters
response = requests.get(
    "http://localhost:8000/shelters/nearby/",
    params={"lat": 28.6448, "lon": 77.2167, "radius": 5}
)
print(response.json())

# Test supply report
response = requests.get("http://localhost:8000/shelters/supplies/report")
print(response.json())
```

## 🚀 Production Deployment

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:

```bash
docker build -t raahat-shelter-agent .
docker run -p 8000:8000 raahat-shelter-agent
```

### Cloud Deployment

#### AWS Lambda

Deploy as serverless function using Mangum:

```python
from mangum import Mangum
from main import app

handler = Mangum(app)
```

#### Google Cloud Run

Deploy using Cloud Build:

```yaml
steps:
  - name: "gcr.io/cloud-builders/docker"
    args: ["build", "-t", "gcr.io/$PROJECT_ID/shelter-agent", "."]
  - name: "gcr.io/cloud-builders/docker"
    args: ["push", "gcr.io/$PROJECT_ID/shelter-agent"]
  - name: "gcr.io/cloud-builders/gcloud"
    args:
      [
        "run",
        "deploy",
        "shelter-agent",
        "--image",
        "gcr.io/$PROJECT_ID/shelter-agent",
        "--platform",
        "managed",
      ]
```

#### Heroku Deployment

Create `Procfile`:

```
web: uvicorn main:app --host=0.0.0.0 --port=${PORT:-5000}
```

Deploy:

```bash
git add .
git commit -m "Deploy shelter agent"
git push heroku main
```

## 🔍 Monitoring & Logging

### Application Monitoring

```python
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Add middleware for request logging
@app.middleware("http")
async def log_requests(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"Path: {request.url.path} - Time: {process_time:.4f}s")
    return response
```

### Health Check Endpoint

```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "shelter_count": len(shelters)
    }
```

### Performance Metrics

```python
@app.get("/metrics")
async def get_metrics():
    return {
        "total_shelters": len(shelters),
        "total_capacity": sum(s['capacity'] for s in shelters),
        "available_slots": sum(s['available_slots'] for s in shelters),
        "occupancy_rate": 1 - (sum(s['available_slots'] for s in shelters) /
                              sum(s['capacity'] for s in shelters))
    }
```

## 🛡️ Security Considerations

### API Security

```python
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://raahat.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Add trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["raahat.com", "*.raahat.com"]
)
```

### Input Validation

All endpoints use Pydantic models for request validation:

```python
class ShelterSearchRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    radius: float = Field(5, gt=0, le=100)
```

### Rate Limiting

Consider adding rate limiting for production:

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/shelters/nearby/")
@limiter.limit("30/minute")
async def get_nearby_shelters(request: Request, ...):
    # Implementation
```

## 🔮 Future Enhancements

### Planned Features

- **Database integration** with PostgreSQL/MongoDB
- **Real-time updates** with WebSocket support
- **Machine learning** for demand prediction
- **Multi-region support** with geospatial indexing
- **Supply chain optimization** algorithms
- **Mobile app integration** with push notifications

### Technical Improvements

- **Caching layer** with Redis for better performance
- **Microservice architecture** with service mesh
- **GraphQL API** for flexible data querying
- **Event-driven architecture** with message queues
- **Advanced analytics** with time-series data

### Integration Possibilities

- **IoT sensors** for real-time capacity monitoring
- **Blockchain** for supply chain transparency
- **AI-powered** resource allocation optimization
- **Satellite imagery** for shelter condition assessment
- **Weather API** integration for predictive planning

## 🤝 Integration with Raahat System

### API Endpoints Used by Client

The shelter agent integrates with the main Raahat client through these key endpoints:

#### Client Integration Points

```javascript
// Fetch nearby shelters for SOS alerts
const shelters = await fetch(
  `/shelters/nearby/?lat=${lat}&lon=${lon}&radius=10`
);

// Check supply levels for admin dashboard
const lowSupplies = await fetch("/shelters/supplies/low?threshold=20");

// Generate reports for analytics
const supplyReport = await fetch("/shelters/supplies/report");
```

### Data Flow

1. **SOS Alert Creation** → Client requests nearby shelters
2. **Admin Dashboard** → Displays shelter capacity and supplies
3. **Resource Management** → Updates inventory levels
4. **Analytics** → Generates supply and capacity reports

## 📊 Performance Optimization

### Geospatial Calculations

```python
# Optimized distance calculation with early termination
def find_nearby_shelters(user_location, shelters, radius):
    nearby = []
    for shelter in shelters:
        # Quick distance check before expensive calculation
        rough_distance = abs(shelter['coordinates'][0] - user_location[0]) + \
                        abs(shelter['coordinates'][1] - user_location[1])

        if rough_distance > radius * 0.02:  # Approximate degree conversion
            continue

        # Accurate calculation only for potential matches
        accurate_distance = geodesic(user_location, shelter['coordinates']).km
        if accurate_distance <= radius:
            nearby.append(shelter)

    return sorted(nearby, key=lambda x: x['distance_km'])
```

### Memory Management

```python
# Efficient data structures for large shelter networks
from collections import defaultdict
import bisect

class OptimizedShelterIndex:
    def __init__(self, shelters):
        self.shelters = shelters
        self.lat_index = sorted(shelters, key=lambda s: s['coordinates'][0])
        self.lon_index = sorted(shelters, key=lambda s: s['coordinates'][1])

    def find_nearby(self, lat, lon, radius):
        # Binary search for latitude range
        lat_min, lat_max = lat - radius/111, lat + radius/111
        # Further optimization...
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Import Errors

```bash
# Error: ModuleNotFoundError: No module named 'geopy'
# Solution:
pip install -r requirements.txt
```

#### 2. Server Won't Start

```bash
# Error: Address already in use
# Solution:
lsof -i :8000  # Find process using port 8000
kill -9 <PID>  # Kill the process
```

#### 3. CORS Issues

```python
# Add CORS middleware for cross-origin requests
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 4. Data Validation Errors

```bash
# Error: 422 Unprocessable Entity
# Check API documentation for correct request format
curl -X POST "http://localhost:8000/shelters/1/inventory/update" \
     -H "Content-Type: application/json" \
     -d '[{"item": "Rice", "change": "invalid"}]'  # Should be number, not string
```

## 📚 Additional Resources

### API Documentation

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

### FastAPI Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Pydantic Documentation](https://pydantic-docs.helpmanual.io/)
- [Uvicorn Documentation](https://www.uvicorn.org/)

### Geospatial Resources

- [Geopy Documentation](https://geopy.readthedocs.io/)
- [Geodesic Calculations](https://en.wikipedia.org/wiki/Geodesics_on_an_ellipsoid)

## 📄 License

This project is part of the Raahat Disaster Management System. Please refer to the main project license.

## 🆘 Support

For support and questions:

- **Email**: support@raahat.com
- **Technical Issues**: Create an issue in the repository
- **Emergency Hotline**: 112 (India)
- **Documentation**: [Raahat Docs](https://docs.raahat.com)

---

**⚠️ Emergency Notice**: This shelter management system is designed for disaster response scenarios. In case of real emergencies, always call 112 (India's emergency number) or your local emergency services immediately.

**🏠 Shelter Network**: This system helps coordinate emergency shelter resources during disasters. For immediate shelter assistance, contact local emergency services or disaster management authorities.
