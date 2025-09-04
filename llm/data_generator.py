import csv
import random
from datetime import datetime, timedelta

# Define categories with template messages
CATEGORIES = {
    "flood": [
        "Flood water has entered our society in {area}. Cars submerged, people trapped!",
        "Water level rising rapidly in {area}. Need boats for evacuation.",
        "Our street in {area} is waist-deep in water. Urgent help needed!",
        "Bridge near {area} is underwater. Avoid the route! #punefloods"
    ],
    "earthquake": [
        "Strong tremor felt in {area}. Walls cracked, people panicking!",
        "Aftershock hit {area}. Many afraid to go inside their homes.",
        "Major building collapse reported near {area}. Rescue required!",
        "People screaming under rubble in {area}. Need machinery fast!"
    ],
    "fire": [
        "Massive fire at factory near {area}. Smoke visible from miles.",
        "Residential building in {area} caught fire. Families trapped inside!",
        "Car explosion reported in {area}. Fire brigade required.",
        "Warehouse burning in {area}. Very dangerous!"
    ],
    "medical": [
        "Person with severe injury in {area}. Heavy bleeding. Need ambulance!",
        "My father has a heart attack in {area}. No hospital reachable.",
        "Child in {area} has high fever, no medicine available.",
        "Need oxygen cylinder in {area}. Patient struggling to breathe."
    ],
    "infrastructure": [
        "Power lines down in {area}. Road blocked, very risky.",
        "No electricity for hours in {area}. People stranded.",
        "Mobile network completely down in {area}. Hard to contact anyone.",
        "Road collapse reported in {area}. Vehicles stuck."
    ],
    "resources": [
        "Running out of food and water in {area}. Trapped for hours.",
        "Need blood donors urgently at hospital near {area}.",
        "Rescue boats required near {area}. Many stranded.",
        "Medicines needed in {area}. People suffering without supplies."
    ],
    "general": [
        "Praying for everyone in {area}. Stay safe!",
        "Scary situation unfolding in {area}.",
        "Hope rescue teams reach {area} soon.",
        "Stay strong Pune! We will get through this together."
    ]
}

# Pune-PCMC bounding box (approximate)
LAT_RANGE = (18.50, 18.70)
LON_RANGE = (73.70, 73.85)

# Areas for diversity
AREAS = [
    "Wakad", "Hinjawadi", "Aundh", "Baner", "Pimple Saudagar",
    "Rahatani", "Thergaon", "Bhosari", "Moshi", "Nigdi",
    "Kasarwadi", "Dange Chowk", "Chinchwad", "Akurdi", "Kothrud"
]

def generate_records(num_records=1000, start_time="2025-08-23T17:00:00Z"):
    records = []
    start_dt = datetime.strptime(start_time, "%Y-%m-%dT%H:%M:%SZ")

    for i in range(num_records):
        # Random category
        category = random.choice(list(CATEGORIES.keys()))
        template = random.choice(CATEGORIES[category])
        area = random.choice(AREAS)
        text = template.format(area=area)

        # Random location within Pune-PCMC bounds
        lat = round(random.uniform(*LAT_RANGE), 4)
        lon = round(random.uniform(*LON_RANGE), 4)

        # Random timestamp within 6 hours window
        time_offset = timedelta(seconds=random.randint(0, 6 * 3600))
        timestamp = (start_dt + time_offset).strftime("%Y-%m-%dT%H:%M:%SZ")

        records.append([text, lat, lon, timestamp])

    return records

def save_to_csv(filename="disaster_data.csv", num_records=10000):
    records = generate_records(num_records)
    with open(filename, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["text", "lat", "lon", "timestamp"])
        writer.writerows(records)
    print(f"✅ Generated {num_records} records and saved to {filename}")

if __name__ == "__main__":
    save_to_csv("disaster_dataset.csv", num_records=5000)
