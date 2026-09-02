import os
import re

def update_html_files():
    target_dir = "."
    meta_tag = '<meta name="theme-color" content="#1a252f">'
    
    for root, dirs, files in os.walk(target_dir):
        # node_modulesや.gitなどは除外
        if "node_modules" in root or ".git" in root or "scripts" in root:
            continue
            
        for file in files:
            if file.endswith(".html"):
                file_path = os.path.join(root, file)
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                # 既に正しいtheme-colorがあるか確認
                if 'name="theme-color"' in content:
                    # 既存のtheme-colorを #1a252f に置換
                    new_content = re.sub(
                        r'<meta\s+name="theme-color"\s+content="[^"]*">',
                        meta_tag,
                        content
                    )
                else:
                    # なければ <head> の直後に挿入
                    if "<head>" in content:
                        new_content = content.replace("<head>", f"<head>\n    {meta_tag}")
                    elif "<HEAD>" in content:
                        new_content = content.replace("<HEAD>", f"<HEAD>\n    {meta_tag}")
                    else:
                        continue
                
                if new_content != content:
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(new_content)
                    print(f"Updated theme-color in: {file_path}")

if __name__ == "__main__":
    update_html_files()
