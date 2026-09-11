with open("lab_packs_evolution.html", "r") as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    if "<!-- スマホ警告 -->" in line and "</style>" not in "".join(lines[i-10:i]):
        new_lines.append("  </style>\n</head>\n<body class=\"app-mode no-select-ui\">\n\n")
    new_lines.append(line)

with open("lab_packs_evolution.html", "w") as f:
    f.writelines(new_lines)
