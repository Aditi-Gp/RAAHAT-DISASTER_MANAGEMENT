shelters = [
    {
        'id': 1,
        'name': 'Safe Haven Shelter',
        'coordinates': (28.6448, 77.2167),  # latitude, longitude
        'owner': {'name': 'Anita Sharma', 'phone': '+91-9876543210'},
        'capacity': 50,
        'available_slots': 12,
        'address': 'Connaught Place, New Delhi',
        'food_supplies': {
            'meals_available': 100,
            'food_stock_days': 5,
            'special_diets': True,
            'last_restock_date': '2025-08-23',
            'supplies': [
                {'item': 'Rice', 'quantity': '100 kg'},
                {'item': 'Dal', 'quantity': '50 kg'},
                {'item': 'Drinking Water', 'quantity': '200 L'},
                {'item': 'Ready-to-eat meals', 'quantity': '150 packets'}
            ]
        },
        'supplies': [  # General supplies for inventory checks
            {'item': 'Rice', 'quantity': '100 kg'},
            {'item': 'Dal', 'quantity': '50 kg'},
            {'item': 'Drinking Water', 'quantity': '200 L'},
            {'item': 'Ready-to-eat meals', 'quantity': '150 packets'}
        ],
        'medical_supplies': {
            'first_aid_kits': 20,
            'last_restock_date': '2025-08-23',
            'supplies': [
                {'item': 'First Aid Kits', 'quantity': '20 units'},
                {'item': 'Painkillers', 'quantity': '500 tablets'},
                {'item': 'Antibiotics', 'quantity': '200 strips'},
                {'item': 'ORS', 'quantity': '300 packets'}
            ]
        },
        'essential_supplies': {
            'last_restock_date': '2025-08-23',
            'supplies': [
                {'item': 'Blankets', 'quantity': '100 pieces'},
                {'item': 'Tents', 'quantity': '25 units'},
                {'item': 'Sleeping Bags', 'quantity': '75 pieces'},
                {'item': 'Hygiene Kits', 'quantity': '150 kits'}
            ]
        }
    },
    {
        'id': 2,
        'name': 'Hope Center',
        'coordinates': (28.6353, 77.2250),
        'owner': {'name': 'Rajiv Kumar', 'phone': '+91-9123456780'},
        'capacity': 30,
        'available_slots': 5,
        'address': 'Karol Bagh, New Delhi',
        'food_supplies': {
            'meals_available': 60,
            'food_stock_days': 3,
            'special_diets': False,
            'last_restock_date': '2025-08-23',
            'supplies': [
                {'item': 'Rice', 'quantity': '50 kg'},
                {'item': 'Dal', 'quantity': '25 kg'},
                {'item': 'Drinking Water', 'quantity': '100 L'},
                {'item': 'Ready-to-eat meals', 'quantity': '75 packets'}
            ]
        },
        'supplies': [
            {'item': 'Rice', 'quantity': '50 kg'},
            {'item': 'Dal', 'quantity': '25 kg'},
            {'item': 'Drinking Water', 'quantity': '100 L'},
            {'item': 'Ready-to-eat meals', 'quantity': '75 packets'}
        ],
        'medical_supplies': {
            'first_aid_kits': 15,
            'last_restock_date': '2025-08-23',
            'supplies': [
                {'item': 'First Aid Kits', 'quantity': '15 units'},
                {'item': 'Painkillers', 'quantity': '300 tablets'},
                {'item': 'Antibiotics', 'quantity': '150 strips'},
                {'item': 'ORS', 'quantity': '200 packets'}
            ]
        },
        'essential_supplies': {
            'last_restock_date': '2025-08-23',
            'supplies': [
                {'item': 'Blankets', 'quantity': '80 pieces'},
                {'item': 'Tents', 'quantity': '20 units'},
                {'item': 'Sleeping Bags', 'quantity': '60 pieces'},
                {'item': 'Hygiene Kits', 'quantity': '120 kits'}
            ]
        }
    }
]

from geopy.distance import geodesic
from datetime import datetime

# Define supply categories and their example items
SUPPLY_CATEGORIES = {
    'food': ['Rice', 'Dal', 'Ready-to-eat meals', 'Drinking Water'],
    'medicine': ['First Aid Kits', 'Painkillers', 'Antibiotics', 'ORS'],
    'essentials': ['Blankets', 'Tents', 'Sleeping Bags', 'Hygiene Kits']
}


class InventorySystem:
    def __init__(self, shelters):
        self.shelters = shelters

    def check_low_supplies(self, threshold=20):
        """Check which shelters are running low on any supply item below given threshold."""
        low_supplies = []
        for shelter in self.shelters:
            shelter_supplies = []
            # Iterate over general supplies for inventory checks
            for item in shelter.get('supplies', []):
                try:
                    quantity = float(item['quantity'].split()[0])
                    if quantity < threshold:
                        shelter_supplies.append({
                            'item': item['item'],
                            'quantity': item['quantity']
                        })
                except (ValueError, IndexError):
                    # Skip any malformed quantities
                    continue
            if shelter_supplies:
                low_supplies.append({
                    'shelter_name': shelter['name'],
                    'items': shelter_supplies
                })
        return low_supplies

    def find_nearest_surplus(self, shelter_id, item_name, surplus_threshold=30):
        """Find nearest shelter (excluding the given one) with surplus above the threshold."""
        current_shelter = next(s for s in self.shelters if s['id'] == shelter_id)
        surplus_shelters = []

        for shelter in self.shelters:
            if shelter['id'] == shelter_id:
                continue
            for item in shelter.get('supplies', []):
                if item['item'].lower() == item_name.lower():
                    try:
                        quantity = float(item['quantity'].split()[0])
                        if quantity > surplus_threshold:
                            dist = geodesic(current_shelter['coordinates'], shelter['coordinates']).km
                            surplus_shelters.append({
                                'shelter_name': shelter['name'],
                                'distance': round(dist, 2),
                                'available_quantity': item['quantity']
                            })
                    except (ValueError, IndexError):
                        continue

        return sorted(surplus_shelters, key=lambda x: x['distance'])

    def update_inventory(self, shelter_id, updates):
        """Add (positive change) or remove (negative change) quantities from inventory."""
        shelter = next(s for s in self.shelters if s['id'] == shelter_id)
        for update in updates:
            for item in shelter.get('supplies', []):
                if item['item'].lower() == update['item'].lower():
                    try:
                        current_qty = float(item['quantity'].split()[0])
                        unit = item['quantity'].split()[1]
                        new_qty = max(current_qty + update['change'], 0)  # Don't allow negative stock
                        item['quantity'] = f"{new_qty} {unit}"
                    except (ValueError, IndexError):
                        continue
        shelter['last_updated'] = datetime.now().strftime("%Y-%m-%d")
        return shelter.get('supplies', [])


def generate_supply_report(shelters):
    """Generate cumulative quantities for each category of supplies."""
    report = {category: {} for category in SUPPLY_CATEGORIES}

    for shelter in shelters:
        for item in shelter.get('supplies', []):
            category = next((cat for cat, items in SUPPLY_CATEGORIES.items() if item['item'] in items), None)
            if category:
                quantity = 0
                try:
                    quantity = float(item['quantity'].split()[0])
                except (ValueError, IndexError):
                    continue
                report[category][item['item']] = report[category].get(item['item'], 0) + quantity
    return report


def find_nearby_shelters(user_location, shelters, search_radius_km=5):
    """Find shelters within radius and provide expanded info including all supplies."""
    nearby = []
    for shelter in shelters:
        dist = geodesic(user_location, shelter['coordinates']).km
        if dist <= search_radius_km:
            nearby.append({
                'name': shelter['name'],
                'address': shelter['address'],
                'owner_name': shelter['owner']['name'],
                'owner_phone': shelter['owner']['phone'],
                'capacity': shelter['capacity'],
                'available_slots': shelter['available_slots'],
                'latitude': shelter['coordinates'][0],
                'longitude': shelter['coordinates'][1],
                'distance_km': round(dist, 2),
                'food_info': {
                    'meals_available': shelter['food_supplies']['meals_available'],
                    'food_stock_days': shelter['food_supplies']['food_stock_days'],
                    'special_diets': shelter['food_supplies']['special_diets'],
                    'last_restock_date': shelter['food_supplies']['last_restock_date'],
                    'supplies': shelter['food_supplies']['supplies']
                },
                'medical_info': {
                    'first_aid_kits': shelter['medical_supplies']['first_aid_kits'],
                    'last_restock_date': shelter['medical_supplies']['last_restock_date'],
                    'supplies': shelter['medical_supplies']['supplies']
                },
                'essential_info': {
                    'last_restock_date': shelter['essential_supplies']['last_restock_date'],
                    'supplies': shelter['essential_supplies']['supplies']
                }
            })
    return nearby


# ---------- Example usage ----------

inventory_system = InventorySystem(shelters)

print("\nShelters with Low Supplies:")
low_supplies = inventory_system.check_low_supplies()
for shelter in low_supplies:
    print(f"\n{shelter['shelter_name']}:")
    for item in shelter['items']:
        print(f"- {item['item']}: {item['quantity']}")

print("\nNearest Surplus for Rice at Shelter 1:")
surplus_shelters = inventory_system.find_nearest_surplus(1, 'Rice')
for shelter in surplus_shelters:
    print(f"- {shelter['shelter_name']}: {shelter['available_quantity']} ({shelter['distance']} km away)")

print("\nOverall Supply Report:")
report = generate_supply_report(shelters)
for category, items in report.items():
    print(f"\n{category.upper()}:")
    for item, quantity in items.items():
        print(f"- {item}: {quantity}")

print("\nUpdating Inventory for Shelter 1:")
updates = [
    {'item': 'Rice', 'change': 50},   # Add 50kg Rice
    {'item': 'Drinking Water', 'change': -20}  # Remove 20L Water
]
updated_supplies = inventory_system.update_inventory(1, updates)
for item in updated_supplies:
    print(f"- {item['item']}: {item['quantity']}")

print("\nNearby Shelters within 5 km:")
user_location = (28.6400, 77.2200)
nearby_shelters = find_nearby_shelters(user_location, shelters)
for s in nearby_shelters:
    print(f"\nShelter: {s['name']}")
    print(f"Address: {s['address']}")
    print(f"Owner: {s['owner_name']} | Phone: {s['owner_phone']}")
    print(f"Capacity: {s['capacity']} | Available Slots: {s['available_slots']}")
    print(f"Location: ({s['latitude']}, {s['longitude']}) | Distance: {s['distance_km']} km")
    
    print("\nFood Supplies Info:")
    print(f"- Meals Available: {s['food_info']['meals_available']}")
    print(f"- Food Stock Days: {s['food_info']['food_stock_days']}")
    print(f"- Special Diets: {'Yes' if s['food_info']['special_diets'] else 'No'}")
    print(f"- Last Restock: {s['food_info']['last_restock_date']}")
    print("- Food Items:")
    for item in s['food_info']['supplies']:
        print(f"  * {item['item']}: {item['quantity']}")
    
    print("\nMedical Supplies Info:")
    print(f"- First Aid Kits: {s['medical_info']['first_aid_kits']}")
    print(f"- Last Restock: {s['medical_info']['last_restock_date']}")
    print("- Medical Items:")
    for item in s['medical_info']['supplies']:
        print(f"  * {item['item']}: {item['quantity']}")
    
    print("\nEssential Supplies Info:")
    print(f"- Last Restock: {s['essential_info']['last_restock_date']}")
    print("- Essential Items:")
    for item in s['essential_info']['supplies']:
        print(f"  * {item['item']}: {item['quantity']}")
    print("-" * 70)
