#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/update_all_session_persistence.py
全18ファイルに対する QuotaExceededError 安全フォールバックおよび pageshow(BFCache復元) リスナーの一括安全適用スクリプト
"""

import os
import re

def patch_file(filepath):
    if not os.path.exists(filepath):
        return False

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    modified = False

    # 1. pageshow リスナーの補完（欠損している場合）
    if "pageshow" not in content:
        restore_fn = None
        for candidate in ["restoreApp7Session", "restoreApp4Session", "restoreApp8Session", 
                          "restoreApp10Session", "restoreFromAutosave", "restoreWorkspace", 
                          "hydrateUIState", "loadSavedState", "restoreSession", "hydrateState"]:
            if candidate in content:
                restore_fn = candidate
                break

        if restore_fn:
            anchor_pattern = r"(window\.addEventListener\(['\"]pagehide['\"][^;]+;)"
            if re.search(anchor_pattern, content):
                replacement = r"\1\n    window.addEventListener('pageshow', () => setTimeout(" + restore_fn + r", 60));"
                content = re.sub(anchor_pattern, replacement, content, count=1)
                modified = True
                print(f"[PAGESHOW_ADDED] {filepath} -> {restore_fn}")
            else:
                anchor_vis = r"(document\.addEventListener\(['\"]visibilitychange['\"][^}]+}\);)"
                if re.search(anchor_vis, content):
                    replacement = r"\1\n    window.addEventListener('pageshow', () => setTimeout(" + restore_fn + r", 60));"
                    content = re.sub(anchor_vis, replacement, content, count=1)
                    modified = True
                    print(f"[PAGESHOW_ADDED] {filepath} -> {restore_fn} (after visibilitychange)")

    # 2. Human_Evolution_Lab.html 専用のライフサイクル完全補完
    if filepath == "Human_Evolution_Lab.html" and "visibilitychange" not in content:
        hook_code = """
  <script>
    (function() {
        function saveHumanLabSession() {
            try {
                if (window.isResetting) return;
                const draft = {};
                document.querySelectorAll('input, select, textarea').forEach(el => {
                    if (el.id) draft[el.id] = el.type === 'checkbox' ? el.checked : el.value;
                });
                sessionStorage.setItem('bio_edu_workspace_human_lab', JSON.stringify(draft));
            } catch(e) {
                console.warn('[AutoSave] Human Lab save failed:', e);
            }
        }
        function restoreHumanLabSession() {
            try {
                const raw = sessionStorage.getItem('bio_edu_workspace_human_lab');
                if (!raw) return;
                const draft = JSON.parse(raw);
                for (let id in draft) {
                    const el = document.getElementById(id);
                    if (el) {
                        if (el.type === 'checkbox') el.checked = draft[id];
                        else el.value = draft[id];
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
            } catch(e) {}
        }
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') saveHumanLabSession();
        });
        window.addEventListener('pagehide', saveHumanLabSession);
        window.addEventListener('pageshow', () => setTimeout(restoreHumanLabSession, 60));
        window.addEventListener('DOMContentLoaded', () => setTimeout(restoreHumanLabSession, 80));
    })();
  </script>
</body>"""
        if "</body>" in content:
            content = content.replace("</body>", hook_code, 1)
            modified = True
            print(f"[LIFECYCLE_INSTALLED] {filepath}")

    # 3. QuotaExceededError に対する安全ラッパー適用
    if "quota" not in content.lower():
        raw_set_pattern = re.compile(r"sessionStorage\.setItem\(([^,]+),\s*([^)]+)\);")
        matches = list(raw_set_pattern.finditer(content))
        if matches:
            wrapper_func = """
    // [Bio-Edu Suite] Quota-Safe Storage Engine (Guideline 7.4)
    function safeSessionSetItem(key, value) {
        try {
            sessionStorage.setItem(key, value);
        } catch (quotaErr) {
            console.warn('[AutoSave] Quota exceeded for ' + key + ', trying minimal fallback:', quotaErr);
            try {
                const parsed = JSON.parse(value);
                if (typeof parsed === 'object' && parsed !== null) {
                    ['image', 'images', 'data', 'queue', 'fullCoeffs', 'rawData'].forEach(k => {
                        if (k in parsed) delete parsed[k];
                    });
                    sessionStorage.setItem(key, JSON.stringify(parsed));
                }
            } catch (e2) {
                console.error('[AutoSave] Critical save fallback failed:', e2);
            }
        }
    }
"""
            if "safeSessionSetItem" not in content:
                script_tag = "<script>"
                if script_tag in content:
                    idx = content.find(script_tag)
                    content = content[:idx + len(script_tag)] + wrapper_func + content[idx + len(script_tag):]
                    modified = True
                    print(f"[QUOTA_WRAPPER_INJECTED] {filepath}")

            content = raw_set_pattern.sub(r"safeSessionSetItem(\1, \2);", content)
            modified = True
            print(f"[SETITEM_SAFE_REPLACED] {filepath}")

    if modified and content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    import glob
    html_files = sorted(glob.glob("*.html"))
    print(f"=== 全 {len(html_files)} ファイルの一括セッション永続化改修開始 ===\n")
    updated_count = 0
    for f in html_files:
        if patch_file(f):
            updated_count += 1
            print(f"[UPDATED] {f}")
        else:
            print(f"[UNCHANGED/PASS] {f}")
    print(f"\n改修完了: {updated_count} / {len(html_files)} ファイルを更新しました。")

if __name__ == '__main__':
    main()
