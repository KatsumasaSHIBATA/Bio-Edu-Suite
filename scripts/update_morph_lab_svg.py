import os
import re

def update_lab_packs():
    path = 'lab_packs.html'
    if not os.path.exists(path):
        print(f"Error: {path} not found")
        return False
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 三角定規SVG（btn-icon仕様）
    target_btn_svg = '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 21h18L3 3z"/><path d="M7 21v-2M11 21v-2M15 21v-2"/></svg>'

    # 1. Morphological Evolution Lab ボタンのSVG置換
    pattern_morph = re.compile(r'(<a href="Morphological_Evolution_Lab\.html"[^>]*>\s*)(<svg[^>]*>.*?</svg>)(\s*Morphological Evolution Lab を開く)', re.DOTALL)
    if pattern_morph.search(content):
        content = pattern_morph.sub(rf'\g<1>{target_btn_svg}\g<3>', content)
        print("Updated Morphological Evolution Lab button SVG in lab_packs.html")
    else:
        print("Warning: Morphological Evolution Lab button not matched in lab_packs.html")

    # 2. Human Evolution Lab ボタンのSVG置換
    pattern_human = re.compile(r'(<a href="Human_Evolution_Lab\.html"[^>]*>\s*)(<svg[^>]*>.*?</svg>)(\s*Human Evolution Lab を開く)', re.DOTALL)
    if pattern_human.search(content):
        content = pattern_human.sub(rf'\g<1>{target_btn_svg}\g<3>', content)
        print("Updated Human Evolution Lab button SVG in lab_packs.html")
    else:
        print("Warning: Human Evolution Lab button not matched in lab_packs.html")

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    return True

def update_header_svg(path, app_name):
    if not os.path.exists(path):
        print(f"Error: {path} not found")
        return False
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 三角定規SVG（header-icon仕様）
    target_header_svg = '<svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 21h18L3 3z"/><path d="M7 21v-2M11 21v-2M15 21v-2"/></svg>'

    pattern = re.compile(rf'(<h1 title="{app_name}">\s*)(<svg class="header-icon"[^>]*>.*?</svg>)(\s*{app_name}\s*</h1>)', re.DOTALL)
    match = pattern.search(content)
    if match:
        content = pattern.sub(rf'\g<1>{target_header_svg}\n            {app_name}\n          </h1>', content)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated header SVG in {path}")
        return True
    else:
        print(f"Warning: Header not matched in {path}")
        return False

if __name__ == '__main__':
    update_lab_packs()
    update_header_svg('Morphological_Evolution_Lab.html', 'Morphological Evolution Lab')
    update_header_svg('Human_Evolution_Lab.html', 'Human Evolution Lab')
    print("SVG replacement completed successfully.")
