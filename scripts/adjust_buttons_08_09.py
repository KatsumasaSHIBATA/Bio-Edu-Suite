import os
import re
import glob

def find_app_file(pattern_list):
    for p in pattern_list:
        matches = glob.glob(p, recursive=True)
        if matches:
            return matches[0]
    return None

def patch_app_08(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. 独立した「PNG保存」ボタンを抽出して元の場所から削除
    btn_pattern = r'<div>\s*<button class="btn btn-sm" id="btnSaveImg"[^>]*>[\s\S]*?PNG保存</button>\s*</div>'
    match = re.search(btn_pattern, content)
    
    if match:
        btn_html = match.group(0)
        content = content.replace(btn_html, '')
        
        # クラスを btn-sm から btn-secondary に変更して統一
        new_btn_html = re.sub(r'class="btn btn-sm"', 'class="btn btn-secondary"', btn_html)
        # divラッパーを外す
        new_btn_html = re.sub(r'^<div>\s*', '', new_btn_html)
        new_btn_html = re.sub(r'\s*</div>$', '', new_btn_html)
        
        # エクスポートボタングループ内の「TSVコピー」の後ろに挿入
        target_pattern = r'(<button id="btnCopyForApp11"[^>]*>[\s\S]*?</button>)'
        content = re.sub(target_pattern, r'\1\n              <!-- アプリ⑧ 画像保存 -->\n              ' + new_btn_html, content)

    # 2. CSSの追加（ボタングループの右寄せ、文字長に合わせた幅140px同期）
    css_patch = """
/* アプリ⑧ ボタン微調整（幅同期・右寄せ・PNG移動後） */
.export-btn-group, #exportButtonGroup, .tree-export-actions {
    display: flex !important;
    justify-content: flex-end !important;
    align-items: center !important;
    gap: 8px !important;
    width: 100% !important;
    margin-left: auto !important;
}
.export-btn-group .btn, .export-btn-group .btn-secondary, #exportButtonGroup .btn {
    min-width: 140px !important;
    text-align: center !important;
    justify-content: center !important;
    box-sizing: border-box !important;
}
"""
    if "アプリ⑧ ボタン微調整" not in content:
        content = content.replace("</style>", css_patch + "\n</style>", 1)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"[OK] App 08 updated: {filepath}")

def patch_app_09(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. CSSの追加（ボタングループの中央寄せ、文字長に合わせた幅140px同期）
    css_patch = """
/* アプリ⑨ ボタン微調整（幅同期・中央寄せ） */
.morpho-export-group, #morphoExportGroup, .export-btn-group {
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    gap: 8px !important;
    width: 100% !important;
    margin: 0 auto !important;
}
.morpho-export-group .btn, #morphoExportGroup .btn, .export-btn-group .btn-secondary {
    min-width: 140px !important;
    text-align: center !important;
    justify-content: center !important;
    box-sizing: border-box !important;
}
"""
    if "アプリ⑨ ボタン微調整" not in content:
        content = content.replace("</style>", css_patch + "\n</style>", 1)

    # 2. HTMLのインラインスタイルで justify-content: flex-end; が設定されている場合は無効化
    content = re.sub(r'(<div id="export-buttons-container" class="export-btn-group" style="[^"]*)justify-content:\s*flex-end;?([^"]*">)', r'\1\2', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"[OK] App 09 updated: {filepath}")

def main():
    #修正: globを使用せず、プロジェクトルートからの相対パスを直接指定する
    app08_file = "8_Phylogenetic_Tree_Builder.html"
    app09_file = "9_Morphometrics_Studio.html"

    if os.path.exists(app08_file):
        patch_app_08(app08_file)
    else:
        print(f"[WARN] App 08 file not found at: {app08_file}")

    if os.path.exists(app09_file):
        patch_app_09(app09_file)
    else:
        print(f"[WARN] App 09 file not found at: {app09_file}")

if __name__ == "__main__":
    main()
