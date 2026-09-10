import os
import glob
import re

def main():
    base_dir = "."
    html_files = glob.glob(os.path.join(base_dir, "**", "*.html"), recursive=True)
    
    for filepath in html_files:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        if "👑" in content:
            # First, replace the specific phrase
            new_content = content.replace("👑 教員専用：現在の画面を課題として発行", "教員専用：現在の画面を課題として発行")
            # Then, replace any remaining crown emojis
            new_content = new_content.replace("👑", "")
            
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"Removed crown emoji from: {filepath}")

if __name__ == "__main__":
    main()
