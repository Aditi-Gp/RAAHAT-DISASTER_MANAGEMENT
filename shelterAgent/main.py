from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from shelter import (
    shelters, 
    InventorySystem, 
    find_nearby_shelters, 
    generate_supply_report
)

app = FastAPI(
    title="Shelter Management System",
    description="API for managing disaster relief shelters and supplies",
    version="1.0.0"
)

# Pydantic models for request/response validation
class Location(BaseModel):
    latitude: float
    longitude: float

class SupplyUpdate(BaseModel):
    item: str
    change: float

class ShelterResponse(BaseModel):
    name: str
    address: str
    owner_name: str
    owner_phone: str
    capacity: int
    available_slots: int
    distance_km: float
    food_info: dict
    medical_info: dict
    essential_info: dict

@app.get("/")
async def root():
    return {"message": "Welcome to Shelter Management System API"}

@app.get("/shelters/nearby/", response_model=List[ShelterResponse])
async def get_nearby_shelters(lat: float, lon: float, radius: Optional[float] = 5):
    """Find shelters within specified radius of given coordinates"""
    try:
        nearby = find_nearby_shelters((lat, lon), shelters, radius)
        return nearby
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/shelters/supplies/low")
async def check_low_supplies(threshold: Optional[int] = 20):
    """Check all shelters for low supplies"""
    inventory_system = InventorySystem(shelters)
    return inventory_system.check_low_supplies(threshold)

@app.get("/shelters/supplies/report")
async def get_supply_report():
    """Generate overall supply report across all shelters"""
    return generate_supply_report(shelters)

@app.get("/shelters/{shelter_id}/surplus/{item}")
async def find_surplus(shelter_id: int, item: str):
    """Find nearest shelter with surplus of specified item"""
    inventory_system = InventorySystem(shelters)
    return inventory_system.find_nearest_surplus(shelter_id, item)

@app.post("/shelters/{shelter_id}/inventory/update")
async def update_inventory(shelter_id: int, updates: List[SupplyUpdate]):
    """Update inventory for specified shelter"""
    try:
        inventory_system = InventorySystem(shelters)
        updated = inventory_system.update_inventory(
            shelter_id, 
            [{"item": u.item, "change": u.change} for u in updates]
        )
        return {"status": "success", "updated_supplies": updated}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))