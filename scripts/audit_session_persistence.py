#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/audit_session_persistence.py
全HTMLファイルにおける sessionStorage / visibilitychange / pagehide / pageshow / QuotaExceededError の静的監査スクリプト
"""

import os
import glob
import re

def audit_html_files():
    html_files = sorted(glob.glob("*.html"))
    print(f"=== Bio-Edu Suite セッション永続化・監査開始 (対象: {len(html_files)}ファイル) ===\n")
    
    header = f"{'ファイル名':<35} | {'sessionStorage':<14} | {'Quota対処':<10} | {'visibility':<10} | {'pagehide':<8} | {'pageshow':<8}"
    print(header)
    print("-" * len(header))

    results = []

    for filepath in html_files:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        has_session_storage = "sessionStorage.setItem" in content
        has_quota_fallback = bool(re.search(r"catch\s*\([^\)]*quota[^\)]*\)|quota.*exceeded", content, re.IGNORECASE))
        has_visibility = "visibilitychange" in content
        has_pagehide = "pagehide" in content
        has_pageshow = "pageshow" in content

        # 判定マーク
        c_ss = "✅ あり" if has_session_storage else "❌ なし"
        c_quota = "✅ 対応" if has_quota_fallback else ("⚠️ 未対応" if has_session_storage else "-")
        c_vis = "✅ あり" if has_visibility else "❌ なし"
        c_hide = "✅ あり" if has_pagehide else "❌ なし"
        c_show = "✅ あり" if has_pageshow else "❌ なし"

        print(f"{filepath:<35} | {c_ss:<14} | {c_quota:<10} | {c_vis:<10} | {c_hide:<8} | {c_show:<8}")

        results.append({
            "file": filepath,
            "has_ss": has_session_storage,
            "has_quota": has_quota_fallback,
            "has_vis": has_visibility,
            "has_hide": has_pagehide,
            "has_show": has_pageshow
        })

    print("-" * len(header))
    
    # 要対応ファイルのサマリー
    missing_quota = [r['file'] for r in results if r['has_ss'] and not r['has_quota']]
    missing_show = [r['file'] for r in results if r['has_ss'] and not r['has_show']]
    no_persistence = [r['file'] for r in results if not r['has_ss']]

    print("\n【監査サマリー】")
    print(f"・sessionStorage は使用しているが QuotaExceededError 未対策: {len(missing_quota)} 件")
    for f in missing_quota:
        print(f"   - {f}")
    print(f"・sessionStorage は使用しているが pageshow(復元) リスナー欠損: {len(missing_show)} 件")
    for f in missing_show:
        print(f"   - {f}")
    print(f"・セッション永続化が全く実装されていないアプリ: {len(no_persistence)} 件")
    for f in no_persistence:
        print(f"   - {f}")

if __name__ == '__main__':
    audit_html_files()
