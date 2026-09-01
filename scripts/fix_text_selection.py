import os
import glob
import re

CSS_RULE = """
        /* 不要なテキスト選択の完全封印と例外許可 */
        body.no-select-ui { user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
        input, textarea, [contenteditable="true"] { user-select: text; -webkit-user-select: text; }
"""

def process_html_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    modified = False

    # 1. <body>タグに no-select-ui クラスを追加
    body_match = re.search(r'<body([^>]*)>', content)
    if body_match:
        body_attrs = body_match.group(1)
        if 'no-select-ui' not in body_attrs:
            # class属性を探す
            class_match = re.search(r'class=["\']([^"\']*)["\']', body_attrs)
            if class_match:
                old_class = class_match.group(1)
                new_class = f"{old_class} no-select-ui".strip()
                new_attrs = body_attrs.replace(f'class="{old_class}"', f'class="{new_class}"')
                new_attrs = new_attrs.replace(f"class='{old_class}'", f"class='{new_class}'")
            else:
                new_attrs = body_attrs + ' class="no-select-ui"'
            
            content = content[:body_match.start()] + f'<body{new_attrs}>' + content[body_match.end():]
            modified = True

    # 2. <style> ブロック内に CSS を追記
    if 'body.no-select-ui' not in content:
        # 最初の <style> を探す
        style_match = re.search(r'<style>', content)
        if style_match:
            insert_pos = style_match.end()
            content = content[:insert_pos] + "\n" + CSS_RULE + content[insert_pos:]
            modified = True
        else:
            # <style>がない場合は<head>内に追加するなどのフォールバック（Bio-Edu Suiteでは必ず<style>があるはず）
            head_match = re.search(r'</head>', content)
            if head_match:
                insert_pos = head_match.start()
                content = content[:insert_pos] + f"\n    <style>{CSS_RULE}    </style>\n" + content[insert_pos:]
                modified = True

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")
    else:
        print(f"Skipped (already applied): {filepath}")

def main():
    html_files = glob.glob("*.html")
    for filepath in html_files:
        process_html_file(filepath)

if __name__ == "__main__":
    main()
