#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bio-Edu Suite 統合コンプライアンス監査システム (master_compliance_audit.py)
現行ガイドライン (v38.2) および日本学術会議（2025年版）重要用語規格への準拠を網羅検査する。
"""
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

CORE_HTML_FILES = [
    "index.html",
    "1_Master_Mix_Studio.html",
    "2_Thermal_Cycler_Simulator.html",
    "3_Virtual_PCR_RFLP.html",
    "4_Sanger_Trace_Editor.html",
    "5_DNA_Alignment_Studio.html",
    "6_Alignment_Print_Studio.html",
    "7_Virtual_BLAST_Explorer.html",
    "8_Phylogenetic_Tree_Builder.html",
    "9_Morphometrics_Studio.html",
    "10_integrative_taxonomy_studio.html",
    "11_Comparative_Variant_Analyzer.html",
    "12_Statistical_Genetics_Lab.html",
    "13_Central_Dogma_Simulator.html",
    "14_Protein_Structure_Explorer.html",
    "lab_packs.html",
]

# 1. 日本学術会議2025年版 禁止用語パターン
FORBIDDEN_TERMS = [
    (r"優性(?!種)", "「優性」→「顕性」（優性効果→顕性効果、優性分散→顕性分散）"),
    (r"劣性", "「劣性」→「潜性」"),
    (r"古細菌", "「古細菌」→「アーキア」"),
    (r"細胞性免疫", "「細胞性免疫」→ 削除語（自然免疫と獲得免疫の協調へ）"),
    (r"(?:体)?液性免疫", "「液性免疫/体液性免疫」→ 削除語（自然免疫と獲得免疫の協調へ）"),
    (r"血漿", "「血漿」→「血しょう」"),
    (r"攪乱", "「攪乱」→「かく乱」"),
    (r"胚[囊嚢]", "「胚囊/胚嚢」→「胚のう」"),
    (r"1D配列", "「1D配列」→「塩基配列 / アミノ酸配列」"),
]

def find_emojis(text):
    found = []
    for ch in text:
        cp = ord(ch)
        if (0x1F300 <= cp <= 0x1FAFF) or (0x2600 <= cp <= 0x27BF):
            found.append(ch)
    return list(dict.fromkeys(found))

def strip_comments_and_references(html_text):
    # References & Algorithms の <details> ブロック内は原著論文タイトルを含むため除外
    text = re.sub(r"<details[^>]*>.*?References &amp; Algorithms.*?</details>", "", html_text, flags=re.DOTALL | re.IGNORECASE)
    # HTMLコメントを除去
    text = re.sub(r"<!--.*?-->", "", text, flags=re.DOTALL)
    return text

def audit_html_file(filepath: Path):
    content = filepath.read_text(encoding="utf-8", errors="ignore")
    clean_text = strip_comments_and_references(content)
    issues = []

    # Gate 1: 2025年版用語規格チェック
    for pat, msg in FORBIDDEN_TERMS:
        matches = list(re.finditer(pat, clean_text))
        if matches:
            issues.append(f"[Gate1:用語違反] {msg} ({len(matches)}箇所)")

    # Gate 2: 絵文字 ＆ 禁止属性 (title / alert / target="_blank")
    emojis = find_emojis(clean_text)
    if emojis:
        sample_e = "".join(emojis)[:8]
        issues.append(f"[Gate2:絵文字残存] ネイティブ絵文字検出: {sample_e} (計{len(emojis)}種)")

    # <svg> 内の <title> タグではなく属性の title="..." を検出
    title_attrs = [m for m in re.findall(r"<[a-zA-Z0-9]+[^>]*?\stitle\s*=", clean_text) if not m.startswith("<svg")]
    if title_attrs:
        issues.append(f"[Gate2:title属性残存] data-tooltip未移行のtitle属性 ({len(title_attrs)}箇所)")

    alerts = re.findall(r"(?<![a-zA-Z0-9_.\$])alert\s*\(", clean_text)
    if alerts:
        issues.append(f"[Gate2:ネイティブalert] alert() 使用 ({len(alerts)}箇所)")

    # 外部Googleフォーム以外の target="_blank" を検出
    blank_targets = [line.strip() for line in clean_text.splitlines() if ('target="_blank"' in line or "target='_blank'" in line) and "docs.google.com/forms" not in line]
    if blank_targets:
        issues.append(f"[Gate2:別タブ遷移] 外部フォーム以外の target='_blank' ({len(blank_targets)}箇所)")

    # Gate 3: グローバル・ドロワー (Peg Menu) ＆ 外箱DOM・フッターバージョン
    for req_cls in ["sidebar", "main-wrapper", "header-container", "footer"]:
        if f'class="{req_cls}"' not in content and f" {req_cls}" not in content:
            issues.append(f"[Gate3:外箱DOM欠落] .{req_cls} が見つかりません")

    if "Bio-Edu Suite v38.2" not in content:
        ver_m = re.search(r"Bio-Edu Suite v[0-9]+\.[0-9]+", content)
        found_v = ver_m.group(0) if ver_m else "表記なし"
        issues.append(f"[Gate3:フッター版数不一致] 現在: {found_v} (期待値: Bio-Edu Suite v38.2)")

    if "max-width: 1024px" not in content or "min-width: 1025px" not in content:
        issues.append("[Gate3:ブレイクポイント] 1024px / 1025px メディアクエリ規定の欠落")

    # Gate 4: ローカル要塞（自動通信排除）＆ システム必須モーダル
    for forbidden_sync in ["onSnapshot", "bio_edu_request_save", "beforeunload"]:
        if forbidden_sync in clean_text:
            issues.append(f"[Gate4:自動通信・禁止イベント残存] {forbidden_sync} が検出されました")

    for req_id in ["confirmModal", "accountModal", "manualCloudSaveBtn", "manualCloudLoadBtn", "presetImportSection", "teacherPresetSection"]:
        if f'id="{req_id}"' not in content and f"id='{req_id}'" not in content:
            issues.append(f"[Gate4:必須モーダル要素欠落] #{req_id}")

    return issues

def audit_js_files():
    js_issues = {}
    js_targets = [ROOT / "auth_sync.js"]
    for sub in ["js", "lib"]:
        d = ROOT / sub
        if d.exists():
            js_targets.extend(sorted(d.glob("*.js")))

    for jp in js_targets:
        if not jp.exists():
            continue
        text = jp.read_text(encoding="utf-8", errors="ignore")
        clean = re.sub(r"//.*|/\*[\s\S]*?\*/", "", text)
        f_issues = []

        for pat, msg in FORBIDDEN_TERMS:
            matches = list(re.finditer(pat, clean))
            if matches:
                f_issues.append(f"[Gate1:用語違反] {msg} ({len(matches)}箇所)")

        emojis = find_emojis(clean)
        if emojis:
            f_issues.append(f"[Gate2:絵文字残存] {''.join(emojis)[:8]}")

        for forbidden_sync in ["onSnapshot", "bio_edu_request_save", "beforeunload"]:
            if forbidden_sync in clean:
                f_issues.append(f"[Gate4:禁止通信/イベント] {forbidden_sync}")

        if f_issues:
            js_issues[str(jp.relative_to(ROOT))] = f_issues
    return js_issues

def audit_workspace_and_orphans():
    ws_issues = []
    scripts_dir = ROOT / "scripts"
    allowed = {"cleanup_audit.py", "master_compliance_audit.py"}
    if scripts_dir.exists():
        extra = [p.name for p in scripts_dir.iterdir() if p.name not in allowed and p.name != "_patch_runner.py"]
        if extra:
            ws_issues.append(f"[Gate5:scripts常駐違反] 許可外ファイル存在: {', '.join(extra)}")

    # ルート内の未参照ファイル・ディレクトリ調査
    active_corpus = ""
    for h in CORE_HTML_FILES:
        hp = ROOT / h
        if hp.exists():
            active_corpus += hp.read_text(encoding="utf-8", errors="ignore") + "\n"
    for sub in ["js", "lib"]:
        d = ROOT / sub
        if d.exists():
            for jp in d.glob("*.js"):
                active_corpus += jp.read_text(encoding="utf-8", errors="ignore") + "\n"
    if (ROOT / "auth_sync.js").exists():
        active_corpus += (ROOT / "auth_sync.js").read_text(encoding="utf-8", errors="ignore")

    suspect_items = [
        "Human_Evolution_Lab.html",
        "Morphological_Evolution_Lab.html",
        "arm.jpg",
        "skull.jpg",
        "preset_db.js",
        "cartridges",
        "print_materials",
    ]
    for item in suspect_items:
        ip = ROOT / item
        if ip.exists():
            if item not in active_corpus:
                ws_issues.append(f"[Gate5:未参照孤立ファイル] `{item}` は現行16アプリから未参照（安全に削除可能）")
            else:
                ws_issues.append(f"[Gate5:参照確認済情報] `{item}` は現行アプリで参照あり（保護対象）")
    return ws_issues

def main():
    print("=" * 76)
    print("🛡️  Bio-Edu Suite Master Compliance Audit System (v38.2 & SCJ-2025)")
    print("=" * 76)

    total_violation_files = 0
    print("\n【1. 全16コアHTMLファイル 監査結果】")
    for hname in CORE_HTML_FILES:
        hp = ROOT / hname
        if not hp.exists():
            print(f"  ❌ {hname}: ファイルが存在しません！")
            total_violation_files += 1
            continue
        issues = audit_html_file(hp)
        if not issues:
            print(f"  ✅ {hname:<38} : PASS (完全準拠)")
        else:
            total_violation_files += 1
            print(f"  ⚠️  {hname:<38} : {len(issues)} 件の指摘事項")
            for iss in issues:
                print(f"       - {iss}")

    print("\n【2. 共通JSモジュール (auth_sync.js / js/ / lib/) 監査結果】")
    js_issues = audit_js_files()
    if not js_issues:
        print("  ✅ 全JSモジュール : PASS (完全準拠)")
    else:
        for jname, iss_list in js_issues.items():
            total_violation_files += 1
            print(f"  ⚠️  {jname:<38} : {len(iss_list)} 件の指摘事項")
            for iss in js_issues[jname]:
                print(f"       - {iss}")

    print("\n【3. ワークスペース衛生 ＆ ルート孤立ファイル調査結果】")
    ws_issues = audit_workspace_and_orphans()
    for w in ws_issues:
        print(f"  ℹ️  {w}")

    print("\n" + "=" * 76)
    if total_violation_files == 0:
        print("🎉 監査結果: ALL GREEN! 全コアファイルがガイドライン v38.2 に完全準拠しています。")
    else:
        print(f"📋 監査完了: 合計 {total_violation_files} 個のファイルに改善項目が見つかりました。")
    print("=" * 76)
    return 0

if __name__ == "__main__":
    sys.exit(main())
