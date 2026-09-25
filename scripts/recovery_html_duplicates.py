import glob
import re

def remove_duplicate_div_by_id(content, target_id):
    pattern = re.compile(r'<div[^>]*id=["\']' + target_id + r'["\'][^>]*>')
    matches = list(pattern.finditer(content))
    if len(matches) <= 1:
        return content
    
    # 2つ目以降の要素を後ろから安全に削除
    for match in reversed(matches[1:]):
        start_idx = match.start()
        depth = 1
        i = match.end()
        while depth > 0 and i < len(content):
            next_div_start = content.find('<div', i)
            next_div_end = content.find('</div>', i)
            
            if next_div_end == -1:
                break
                
            if next_div_start != -1 and next_div_start < next_div_end:
                depth += 1
                i = next_div_start + 4
            else:
                depth -= 1
                i = next_div_end + 6
                
        content = content[:start_idx] + content[i:]
    return content

html_files = glob.glob('*.html')
count = 0

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    orig_content = content
    
    # 1. 重複するシステムモーダルDOMを徹底削除（IDの競合によるボタンフリーズ解消）
    content = remove_duplicate_div_by_id(content, 'confirmModal')
    content = remove_duplicate_div_by_id(content, 'accountModal')
    content = remove_duplicate_div_by_id(content, 'feedbackModal')
    content = remove_duplicate_div_by_id(content, 'toast')
    content = remove_duplicate_div_by_id(content, 'mobile-warning-overlay')
            
    # 2. Service Worker キャッシュ強制バイパス（auth_sync.js の最新化）
    # モジュールインポートのパスにキャッシュバスターを付与
    import_target = r"import\s+\{\s*joinRoom,\s*leaveRoom,\s*importMasterPreset,\s*registerMasterPreset\s*\}\s*from\s*['\"](?:\./)?auth_sync\.js(?:\?v=\w+)?['\"];"
    content = re.sub(import_target, r"import { joinRoom, leaveRoom, importMasterPreset, registerMasterPreset } from './auth_sync.js?v=update37';", content)
    
    # scriptタグインポートのパスにキャッシュバスターを付与
    script_target = r"<script\s+type=[\"']module[\"']\s+src=[\"'](?:\./)?auth_sync\.js(?:\?v=\w+)?[\"']></script>"
    content = re.sub(script_target, r'<script type="module" src="auth_sync.js?v=update37"></script>', content)

    if content != orig_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Cleaned and Cache-Busted: {filepath}")
        count += 1

print(f"完了しました。合計 {count} 個のファイルを修正しました。")
