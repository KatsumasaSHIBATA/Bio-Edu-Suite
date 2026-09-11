with open("lab_packs_evolution.html", "r") as f:
    text = f.read()

div_open = text.count("<div")
div_close = text.count("</div")

print(f"<div>: {div_open}, </div>: {div_close}")
