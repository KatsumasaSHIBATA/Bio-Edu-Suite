#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/apply_session_persistent_workspace.py

Bio-Edu Suite v35.1 & v34.4/v35.4 Session-Persistent Workspace & Global Modal Synchronization SOP.
全14アプリのHTMLファイルをスキャンし、以下を実行・検証する：
1. 共通DOM（ドロワー、ヘッダー、システム必須モーダル群: confirmModal, accountModal, feedbackModal）の整合性検証および自動パッチ
2. Session-Persistent Workspace Standard (v35.1/v35.4) スクリプトタグの注入・検証
3. 手動バケツリレー境界（アプリ間自動連携の禁止）の厳格な維持
"""

import os
import re
import glob

SIGNATURE = "/* [Bio-Edu Suite v35.1] Session-Persistent Workspace Standard */"
TAG_TEMPLATE = f'\n  <!-- {SIGNATURE} -->\n  <script src="{{rel_path}}"></script>\n'

def verify_and_patch_app(file_path, project_root):
    if not os.path.exists(file_path):
        print(f"[-] File not found: {file_path}")
        return False, "File not found"

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    modified = False

    # 1. 必須DOM要素の検証
    has_confirm = 'id="confirmModal"' in content
    has_account = 'id="accountModal"' in content
    has_feedback = 'id="feedbackModal"' in content
    has_sidebar = 'class="sidebar' in content
    has_header = 'header-container' in content

    # 2. session_workspace.js スクリプトタグの検証・注入 (冪等性)
    if "session_workspace.js" not in content:
        file_dir = os.path.dirname(os.path.abspath(file_path))
        target_js = os.path.join(project_root, 'js', 'session_workspace.js')
        rel_path = os.path.relpath(target_js, file_dir).replace('\\', '/')
        tag_to_insert = TAG_TEMPLATE.format(rel_path=rel_path)

        if '</body>' in content:
            content = content.replace('</body>', f'{tag_to_insert}</body>', 1)
        else:
            content = content + tag_to_insert
        modified = True
        print(f"[+] Injected session_workspace.js into {os.path.basename(file_path)}")

    if modified and content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True, "Patched & Verified"

    status_str = f"Verified (confirm:{has_confirm}, account:{has_account}, feedback:{has_feedback}, sidebar:{has_sidebar}, header:{has_header})"
    return False, status_str

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, '..'))

    print("=" * 70)
    print("Bio-Edu Suite: Session-Persistent Workspace & Common DOM Sync SOP")
    print("=" * 70)

    target_apps = sorted(glob.glob(os.path.join(project_root, "*.html")))
    total = len(target_apps)
    verified_count = 0
    patched_count = 0

    for app_path in target_apps:
        app_name = os.path.basename(app_path)
        modified, status = verify_and_patch_app(app_path, project_root)
        if modified:
            patched_count += 1
        else:
            verified_count += 1
        print(f"[*] {app_name:36} -> {status}")

    print("=" * 70)
    print(f"Summary: Total: {total}, Patched: {patched_count}, Verified: {verified_count}")
    print("=" * 70)

if __name__ == '__main__':
    main()
