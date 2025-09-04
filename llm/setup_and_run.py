#!/usr/bin/env python3
"""
Complete setup and training script for Emergency Classification Service
"""

import subprocess
import sys
import os
from pathlib import Path
import json

def run_command(command, description):
    """Run a shell command and handle errors"""
    print(f"\n{'='*50}")
    print(f"STEP: {description}")
    print(f"{'='*50}")
    
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ Success: {description}")
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error: {description}")
        print(f"Command: {command}")
        print(f"Error: {e.stderr}")
        return False

def setup_project():
    """Set up the complete project structure"""
    
    # Create project structure
    directories = [
        "data/raw",
        "data/processed", 
        "data/augmented",
        "models/roberta_emergency_classifier",
        "api",
        "tests",
        "docker",
        "logs"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"Created directory: {directory}")
    
    # Create sample CSV file with your data
    sample_data = '''text,lat,lon,timestamp
"Help! Water rising fast in our house near Wakad. We are trapped on the second floor. Family of 4.",18.6279,73.7597,2025-08-23T18:25:11Z
"Major building collapse at Hinjawadi Phase 1 after the tremor. I can hear people screaming under the rubble. Need heavy machinery!",18.5912,73.7389,2025-08-23T18:23:45Z
"My father is having a heart attack. We are at Blue Ridge society. No ambulance is reachable. Please send medical help urgently.",18.5851,73.7432,2025-08-23T18:22:50Z
"Is anyone else's power out in Pimple Saudagar? #pune",18.6096,73.7934,2025-08-23T18:21:15Z
"Massive fire at a factory in the Bhosari MIDC area. Smoke is visible from miles away. We need fire brigades ASAP!",18.6491,73.8229,2025-08-23T18:19:03Z
"Our entire street in Rahatani is flooded. Water is waist-deep. We need immediate evacuation.",18.6153,73.7831,2025-08-23T18:18:22Z
"Just felt a strong aftershock. Is everyone okay? #earthquake",18.6315,73.8005,2025-08-23T18:17:59Z
"Bad car accident on the Mumbai-Pune expressway near the bypass. Multiple cars involved. Traffic is completely stopped.",18.6401,73.7412,2025-08-23T18:15:48Z
"We are a group of 15 people stuck on the roof of our building in Kalewadi. Water is rising. Please send a rescue boat.",18.6200,73.7911,2025-08-23T18:14:10Z
"I have a severe leg injury from falling debris. Bleeding heavily. Location is near Dange Chowk. I can't move.",18.6122,73.7668,2025-08-23T18:12:34Z'''