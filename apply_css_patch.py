#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bio-Edu Suite v34.4 一括CSSパッチスクリプト
15ファイルに対してPWA/タッチターゲット/View Transitions/ドロワーブレイクポイント(1024px)更新を適用します。
"""

import os
import re
import glob

CSS_PATCH = """
        /* v34.4 PWA & Touch Target Patch */
        html, body { overscroll-behavior: none; }
        @view-transition { navigation: auto; }
        ::view-transition-old(root) { animation: 90ms cubic-bezier(0.4, 0, 1, 1) both fade-out; }
        ::view-transition-new(root) { animation: 210ms cubic-bezier(0, 0, 0.2, 1) 90ms both fade-in; }
        @keyframes fade-out { from { opacity: 1; } to { opacity: 0; } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .btn, .sidebar-action-btn, .nav-item, .hamburger-btn, select, input[type="button"], input[type="submit"] { min-height: 44px; display: inline-flex; align-items: center; box-sizing: border-box; }
        @media (max-width: 1024px) { .btn, .sidebar-action-btn, .nav-item, .hamburger-btn, select { min-height: 48px; } }
"""

def get_target_files():
    targets = []
    
    # 1. index.html & lab_packs.html
    for base in ['index.html', 'lab_packs.html']:
        if os.path.exists(base):
            targets.append(base)
            
    # 2. 1_*.html to 13_*.html
    for i in range(1, 14):
        matched = glob.glob(f"{i}_*.html")
        for m in matched:
            if m not in targets:
                targets.append(m)
                
    return sorted(targets)

def apply_patch_to_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    modified = False

    # 1. @media (max-width: 768px) のドロワー隠蔽関連を 1024px へ置換
    # .sidebar や .main-wrapper などのサイドバー/ドロワー記述があるメディアクエリを更新
    def replace_drawer_media(match):
        block = match.group(0)
        if any(k in block for k in ['.sidebar', '.main-wrapper', '.mobile-hamburger', 'has-pinned-sidebar']):
            return block.replace('@media (max-width: 768px)', '@media (max-width: 1024px)')\
                        .replace('@media screen and (max-width: 768px)', '@media screen and (max-width: 1024px)')\
                        .replace('@media(max-width: 768px)', '@media (max-width: 1024px)')\
                        .replace('@media(max-width:768px)', '@media (max-width: 1024px)')
        return block

    media_pattern = re.compile(r'@media\s*(?:screen\s+and\s*)?\(\s*max-width\s*:\s*768px\s*\)\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', re.DOTALL)
    new_content, count = media_pattern.subn(replace_drawer_media, content)
    if count > 0 and new_content != content:
        content = new_content
        modified = True

    # 2. CSSパッチの挿入（二重適用防止チェック）
    if '/* v34.4 PWA & Touch Target Patch */' not in content:
        # 最後の </style> タグの直前に挿入
        last_style_close = content.rfind('</style>')
        if last_style_close != -1:
            content = content[:last_style_close] + CSS_PATCH + content[last_style_close:]
            modified = True
        else:
            print(f"[{filepath}] 警告: </style> タグが見つかりませんでした。")

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"[{filepath}] 適用完了")
        return True
    else:
        print(f"[{filepath}] スキップ（既に適用済みまたは変更不要）")
        return False

def main():
    target_files = get_target_files()
    print(f"対象ファイル数: {len(target_files)}")
    for tf in target_files:
        print(f" - {tf}")
    print("-" * 40)
    
    updated_count = 0
    for tf in target_files:
        if apply_patch_to_file(tf):
            updated_count += 1
            
    print("-" * 40)
    print(f"完了: {updated_count}/{len(target_files)} ファイルを更新しました。")

if __name__ == '__main__':
    main()
