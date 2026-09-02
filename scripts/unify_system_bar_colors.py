import os
import re
import json
import glob

def update_manifest(filepath):
    if not os.path.exists(filepath):
        return
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        changed = False
        if data.get('theme_color') != '#1a252f':
            data['theme_color'] = '#1a252f'
            changed = True
        if data.get('background_color') != '#1a252f':
            data['background_color'] = '#1a252f'
            changed = True
            
        if changed:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"[Updated Manifest] {filepath}")
    except Exception as e:
        print(f"[Error updating manifest] {e}")

def update_html_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # 1. theme-color メタタグの正規化（#1a252f に統一）
    theme_pattern = re.compile(r'<meta\s+name=["\']theme-color["\']\s+content=["\'][^"\']*["\']\s*/?>', re.IGNORECASE)
    if theme_pattern.search(content):
        content = theme_pattern.sub('<meta name="theme-color" content="#1a252f">', content)
    else:
        content = re.sub(r'(<head[^>]*>)', r'\1\n  <meta name="theme-color" content="#1a252f">', content, flags=re.IGNORECASE)

    # 2. apple-mobile-web-app-status-bar-style の確保
    status_bar_pattern = re.compile(r'<meta\s+name=["\']apple-mobile-web-app-status-bar-style["\']\s+content=["\'][^"\']*["\']\s*/?>', re.IGNORECASE)
    if status_bar_pattern.search(content):
        content = status_bar_pattern.sub('<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">', content)
    else:
        content = re.sub(r'(<head[^>]*>)', r'\1\n  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">', content, flags=re.IGNORECASE)

    # 3. html { background-color: #1a252f; } の保証
    # 既存の html { background-color: ... } の置換、または未定義時の補正
    # ※ `html, body {` などの複合セレクタを誤爆しないように `html\s*\{` に限定しつつ、すでに #1a252f の場合は無視する
    if not re.search(r'html\s*\{\s*background-color\s*:\s*#1a252f\s*;?\s*\}', content) and \
       not re.search(r'html\s*\{\n\s*background-color\s*:\s*#1a252f\s*;?', content):
        
        # 複合セレクタでない html { ... background-color: ... } を置換
        content_new = re.sub(r'(?<![,\w])html\s*\{([^}]*?)background-color\s*:\s*[^;]+;', r'html {\1background-color: #1a252f;', content)
        if content_new == content:
            if '<style>' in content and '/* System Bar Dark Fix */' not in content:
                inject_css = "\n    /* System Bar Dark Fix */\n    html { background-color: #1a252f; }\n"
                content = content.replace('<style>', f'<style>{inject_css}', 1)
        else:
            content = content_new

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"[Updated HTML] {filepath}")

def main():
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    
    # HTML走査
    html_files = glob.glob(os.path.join(root_dir, '**', '*.html'), recursive=True)
    for html_file in html_files:
        # node_modules や .git 除外
        if 'node_modules' in html_file or '.git' in html_file:
            continue
        update_html_file(html_file)

    # manifest.json 走査
    manifest_files = glob.glob(os.path.join(root_dir, '**', 'manifest.json'), recursive=True)
    for m_file in manifest_files:
        if 'node_modules' in m_file or '.git' in m_file:
            continue
        update_manifest(m_file)

if __name__ == '__main__':
    main()
