#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/fix_session_persistence_bugs.py
sessionStorage一括改修で生じた無限再帰、未定義関数呼び出し、リスナー誤配置の完全修復スクリプト
"""

import glob
import os
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    original = content

    # 1. safeSessionSetItem の自己無限再帰バグを修復
    bad_recursion_pattern = re.compile(
        r"(function\s+safeSessionSetItem\s*\([^)]*\)\s*\{\s*try\s*\{\s*)safeSessionSetItem\s*\(([^)]+)\);",
        re.MULTILINE
    )
    if bad_recursion_pattern.search(content):
        content = bad_recursion_pattern.sub(r"\1sessionStorage.setItem(\2);", content)
        print(f"[FIX_RECURSION] {filepath}")

    # 2. safeSessionSetItem が呼ばれているのに関数定義がない場合の注入
    if "safeSessionSetItem(" in content and "function safeSessionSetItem" not in content:
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
        script_tag = "<script>"
        if script_tag in content:
            idx = content.find(script_tag)
            content = content[:idx + len(script_tag)] + wrapper_func + content[idx + len(script_tag):]
            print(f"[INJECT_SAFE_SETITEM] {filepath}")

    # 3. アプリ⑪の pageshow で誤って restoreWorkspace を呼んでいるのを restoreApp11Session に修正
    if "11_Comparative_Variant_Analyzer" in filepath:
        bad_p11 = "window.addEventListener('pageshow', () => setTimeout(restoreWorkspace, 60));"
        good_p11 = "window.addEventListener('pageshow', () => setTimeout(restoreApp11Session, 60));"
        if bad_p11 in content:
            content = content.replace(bad_p11, good_p11)
            print(f"[FIX_APP11_PAGESHOW] {filepath}")

    # 4. index.html で pagehide の中に pageshow が誤混入しているのを救出・正規化
    if "index" in filepath:
        nested_pageshow = re.compile(
            r"window\.addEventListener\('pagehide',\s*\(\)\s*=>\s*\{\s*serializeUIState\(\);\s*window\.addEventListener\('pageshow',\s*\(\)\s*=>\s*setTimeout\(hydrateUIState,\s*60\)\);\s*\}\);",
            re.MULTILINE
        )
        if nested_pageshow.search(content):
            corrected = """window.addEventListener('pagehide', () => {
            serializeUIState();
        });
        window.addEventListener('pageshow', () => setTimeout(hydrateUIState, 60));"""
            content = nested_pageshow.sub(corrected, content)
            print(f"[FIX_INDEX_PAGESHOW_NESTING] {filepath}")

    # 5. Human_Evolution_Lab.html の不要な末尾 Vanilla スクリプトを除去
    if "Human_Evolution_Lab" in filepath:
        vanilla_script = re.compile(
            r"\s*<script>\s*\(function\(\)\s*\{\s*function\s+saveHumanLabSession\(\)[\s\S]*?\}\)\(\);\s*</script>\s*</body>",
            re.MULTILINE
        )
        if vanilla_script.search(content):
            content = vanilla_script.sub("\n</body>", content)
            print(f"[REMOVE_HUMAN_LAB_VANILLA_DUPLICATE] {filepath}")

    # 6. アプリ⑥ (Alignment_Print_Studio) の pageshow 復元を正規化
    if "6_Alignment_Print_Studio" in filepath and "pageshow" not in content:
        anchor = "window.addEventListener('load', () => {"
        if anchor in content:
            patch = """window.addEventListener('pageshow', () => {
        try {
            const el = document.getElementById('inputText');
            const saved = sessionStorage.getItem('bio_edu_autosave_app6');
            if (el && saved && el.value.trim() === '') {
                el.value = saved;
                renderText();
            }
        } catch(e) {}
    });\n    """
            content = content.replace(anchor, patch + anchor, 1)
            print(f"[ADD_APP6_PAGESHOW] {filepath}")

    # 7. lab_packs.html の pageshow 復元を正規化
    if "lab_packs" in filepath and "pageshow" not in content:
        anchor = "window.addEventListener('DOMContentLoaded', hydrateUIState);"
        if anchor in content:
            patch = "window.addEventListener('DOMContentLoaded', hydrateUIState);\n        window.addEventListener('pageshow', () => setTimeout(hydrateUIState, 60));"
            content = content.replace(anchor, patch, 1)
            print(f"[ADD_LABPACKS_PAGESHOW] {filepath}")

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    html_files = sorted(glob.glob("*.html"))
    print(f"=== Bio-Edu Suite セッション永続化バグ完全修復開始 ({len(html_files)}ファイル) ===\n")
    fixed_count = 0
    for f in html_files:
        if fix_file(f):
            fixed_count += 1
    print(f"\n修復完了: {fixed_count} / {len(html_files)} ファイルを修正しました。")

if __name__ == '__main__':
    main()
