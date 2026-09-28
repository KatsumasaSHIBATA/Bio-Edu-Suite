import os
import json

def update_index():
    path = "index.html"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Update hydrateAb1Presets sampleIds
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
        print("WARNING: old_array not found in hydrateAb1Presets")

    # 2. Replace getDefaultFinchSamples
    start_marker = "    function getDefaultFinchSamples() {"
    end_marker = "    function loadSamples() {"
    
    if start_marker in content and end_marker in content:
        start_idx = content.find(start_marker)
        end_idx = content.find(end_marker)
        
        with open("scripts/finch_samples_payload.json", "r", encoding="utf-8") as pf:
            payload_func = pf.read()
            
        content = content[:start_idx] + payload_func + "\n\n" + content[end_idx:]
        print("Successfully replaced getDefaultFinchSamples using payload json")
    else:
        print("ERROR: Markers not found for getDefaultFinchSamples")

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

if __name__ == "__main__":
    update_index()
