#!/usr/bin/env python3
"""
scripts/apply_session_workspace.py
全HTMLファイルに Session-Persistent Workspace Engine を一括適用する。
UI構造・CSS・既存JSには1文字も触れず、冪等性を担保してスクリプトタグのみを注入する。
"""

import os
import re

SIGNATURE = "/* [Bio-Edu Suite v35.1] Session-Persistent Workspace Standard */"
TAG_TEMPLATE = f'\n  <!-- {SIGNATURE} -->\n  <script src="{{rel_path}}"></script>\n'

def process_html_file(file_path, project_root):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 既にシグネチャが存在する場合はスキップ（冪等性）
    if SIGNATURE in content or "session_workspace.js" in content:
        print(f"Skipped (Already applied): {file_path}")
        return False

    # 相対パスの計算（階層対応）
    file_dir = os.path.dirname(os.path.abspath(file_path))
    target_js = os.path.join(project_root, 'js', 'session_workspace.js')
    rel_path = os.path.relpath(target_js, file_dir).replace('\\', '/')

    tag_to_insert = TAG_TEMPLATE.format(rel_path=rel_path)

    # </body> の直前に挿入
    if '</body>' in content:
        new_content = content.replace('</body>', f'{tag_to_insert}</body>', 1)
    else:
        # </body> が存在しない場合は末尾に追加
        new_content = content + tag_to_insert

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"Updated: {file_path} (linked to {rel_path})")
    return True

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, '..'))

    updated_count = 0
    skipped_count = 0

    for root, dirs, files in os.walk(project_root):
        # 除外ディレクトリ
        if any(ignored in root for ignored in ['.git', 'node_modules', '.vscode']):
            continue

        for file in files:
            if file.endswith('.html'):
                html_path = os.path.join(root, file)
                if process_html_file(html_path, project_root):
                    updated_count += 1
                else:
                    skipped_count += 1

    print(f"\n[Execution Summary] Updated: {updated_count}, Skipped: {skipped_count}")

if __name__ == '__main__':
    main()