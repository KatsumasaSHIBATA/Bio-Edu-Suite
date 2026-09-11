with open("lab_packs_evolution.html", "r") as f:
    text = f.read()

text = text.replace("</style>\n</head>\n</style>\n</head>", "</style>\n</head>")

with open("lab_packs_evolution.html", "w") as f:
    f.write(text)
