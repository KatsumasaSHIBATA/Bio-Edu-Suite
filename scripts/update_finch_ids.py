#!/usr/bin/env python3
import os
import sys

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    index_path = os.path.join(base_dir, "index.html")

    with open(index_path, "r", encoding="utf-8") as f:
        content = f.read()

    old_array = """        const sampleIds = [
          "SPECIMEN-01_magnirostris",
          "SPECIMEN-02_fortis",
          "SPECIMEN-03_parvulus",
          "SPECIMEN-04_olivacea"
        ];"""
    
    new_array = """        const sampleIds = [
          "SPECIMEN-00_gallus",
          "SPECIMEN-01_olivacea",
          "SPECIMEN-02_parvulus",
          "SPECIMEN-03_fortis",
          "SPECIMEN-04_magnirostris"
        ];"""

    if old_array in content:
        content = content.replace(old_array, new_array)
        print("Updated sampleIds in hydrateAb1Presets")
    else:
        print("Already updated or not found.")

    with open(index_path, "w", encoding="utf-8") as f:
        f.write(content)

if __name__ == "__main__":
    main()
