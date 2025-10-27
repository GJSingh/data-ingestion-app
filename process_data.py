#!/usr/bin/env python3
"""
Sample Python script to process data and generate JSON files for the Node.js application.
This script runs before the Node.js app starts in Docker.

Place your Python logic here to generate the JSON files in the input_file folder.
"""

import json
import os
from pathlib import Path

def main():
    """Main function to process data and save to input_file folder."""
    print("Processing data with Python...")
    
    # Get the input_file directory path
    input_dir = Path("/app/input_file")
    
    # Ensure the directory exists
    input_dir.mkdir(parents=True, exist_ok=True)
    
    # Example: Generate sample data
    # Replace this with your actual Python processing logic
    
    sample_data = [
        {"id": 1, "name": "Sample Data 1", "value": 100},
        {"id": 2, "name": "Sample Data 2", "value": 200}
    ]
    
    # Save to a JSON file
    output_file = input_dir / "generated_data.json"
    with open(output_file, 'w') as f:
        json.dump(sample_data, f, indent=2)
    
    print(f"Data saved to {output_file}")
    print("Python processing completed successfully!")

if __name__ == "__main__":
    main()

