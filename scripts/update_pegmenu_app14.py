# -*- coding: utf-8 -*-
import os
import glob
import re

html_files = glob.glob('*.html')

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 冪等性チェック（すでにapp14があればスキップ）
    if '<a href="app14_comparative_variant_analyzer.html"' in content:
        print(f"[SKIP] {filepath} already has App 14 link.")
        continue

    # ターゲットマーカーを正規表現で探す（インデント対応）
    # 例: "      <a href=\"10_integrative_taxonomy_studio.html\""
    match = re.search(r'([ \t]*)<a href="10_integrative_taxonomy_studio\.html"', content)
    
    if match:
        indent = match.group(1)
        # ターゲットマーカー（マッチした部分全体）
        target_marker = match.group(0)
        
        # 挿入するリンクのインデントを調整
        adjusted_link = f'{indent}<a href="app14_comparative_variant_analyzer.html" class="nav-item p4">\n{indent}  <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3v18M8 21h8M4 7h16"/><path d="M4 7l-2 5h4z"/><path d="M20 7l-2 5h4z"/></svg>\n{indent}  <span class="nav-text">⑭ Comparative Variant Analyzer</span>\n{indent}</a>\n'
        
        new_content = content.replace(target_marker, adjusted_link + target_marker)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"[UPDATED] {filepath}")
    else:
        print(f"[WARNING] Target marker not found in {filepath}")
