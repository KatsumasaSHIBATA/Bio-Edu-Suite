with open("lab_packs_evolution.html", "r") as f:
    text = f.read()
print(f"Total length: {len(text)}")
print("Has footer:", "footer" in text)
print("Has modal:", "modal-overlay" in text)
