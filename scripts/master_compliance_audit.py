#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bio-Edu Suite 統合コンプライアンス診断システム (master_compliance_audit.py)
【100% 読み取り専用】
- アプリおよびスクリプトファイルの内容を1文字も変更しません。
- 全18画面および共通JSを網羅スキャンし、指摘箇所の「行番号」と「該当コード行」を正確にレポートします。
- 階層記号（❶❷等）、矢印（➡➔）、記号（✕✓★）は教育的UIの正当な表記として許可し、検出から除外します。
"""
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# 全18画面（コア14アプリ＋ダッシュボード＋Lab Packs＋進化ラボ2編）
TARGET_HTML_FILES = [
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
    "Human_Evolution_Lab.html",
    "Morphological_Evolution_Lab.html",
]

# 恒久保護アセット（未参照判定を行わず無条件でホワイトリスト保護）
PERMANENT_ASSETS = {
    "arm.jpg",
    "skull.jpg",
    "print_materials",
    "cartridges",
    "images",
    "preset_db.js",
}

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

# 教育的タイポグラフィ記号として正式に許可する文字群（絵文字として検出しない）
ALLOWED_SYMBOLS = set(
    "❶❷❸❹❺❻❼❽❾❿"
    "①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳"
    "➡➔→←↑↓⇒⇔"
    "✕×"
    "✓✔"
    "★☆"
    "▲▼◀▶■●◆"
    "ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ"
)

def find_decorative_emojis(text):
    """装飾目的の純粋なカラー絵文字のみを抽出（許可記号は除外）"""
    found = []
    for ch in text:
        if ch in ALLOWED_SYMBOLS:
            continue
        cp = ord(ch)
        # 装飾・顔文字・絵文字ブロック（Miscellaneous Symbols and Pictographs 等）
        if (0x1F300 <= cp <= 0x1FAFF) or (cp in {0x26A0, 0x26A1, 0x2705, 0x2728, 0x2601, 0x260E}):
            found.append(ch)
    return list(dict.fromkeys(found))

def scan_html_file(filepath: Path):
    lines = filepath.read_text(encoding="utf-8", errors="ignore").splitlines()
    findings = []
    in_references = False

    for line_no, raw_line in enumerate(lines, start=1):
        line = raw_line.strip()

        # References & Algorithms の <details> 内は原著論文タイトルのため用語検査を除外
        if "<details" in line and ("References" in line or "Algorithms" in line):
            in_references = True
        if in_references:
            if "</details>" in line:
                in_references = False
            continue

        # HTMLコメント行はスキップ
        if line.startswith("<!--") and line.endswith("-->"):
            continue

        # Gate 1: 用語規格
        for pat, desc in FORBIDDEN_TERMS:
            if re.search(pat, line):
                findings.append((line_no, "Gate1:用語", f"{desc}", raw_line[:80]))

        # Gate 2: 装飾絵文字
        emojis = find_decorative_emojis(line)
        if emojis:
            findings.append((line_no, "Gate2:絵文字", f"絵文字残存: {' '.join(emojis)}", raw_line[:80]))

        # Gate 2: data-tooltip未移行の title 属性（<svg> 内の <title> は除外）
        if "<svg" not in line and re.search(r"<(?:button|span|div|a|input|select)[^>]*?\stitle=", line):
            findings.append((line_no, "Gate2:title属性", "data-tooltip未移行のtitle属性", raw_line[:80]))

        # Gate 2: ネイティブ alert()
        if re.search(r"(?<![a-zA-Z0-9_.$])alert\s*\(", line):
            findings.append((line_no, "Gate2:alert", "ネイティブ alert() の使用", raw_line[:80]))

        # Gate 4: 自動クラウド通信・禁止イベント
        for forbidden in ["onSnapshot", "bio_edu_request_save", "beforeunload"]:
            if forbidden in line and not line.startswith("//"):
                findings.append((line_no, "Gate4:通信/イベント", f"禁止キーワード: {forbidden}", raw_line[:80]))

    # ファイル全体の構造検査
    full_text = "\n".join(lines)
    for req_cls in ["sidebar", "main-wrapper", "header-container", "footer"]:
        if f'class="{req_cls}"' not in full_text and f" {req_cls}" not in full_text:
            findings.append((0, "Gate3:外箱DOM", f".{req_cls} クラスの欠落", "DOM構造確認"))

    if "Bio-Edu Suite v38.2" not in full_text:
        ver_m = re.search(r"Bio-Edu Suite v[0-9]+\.[0-9]+", full_text)
        current_v = ver_m.group(0) if ver_m else "表記なし"
        findings.append((0, "Gate3:フッター版数", f"版数不一致: {current_v} (期待値: v38.2)", "フッター表記"))

    for req_id in ["confirmModal", "accountModal", "manualCloudSaveBtn", "manualCloudLoadBtn", "presetImportSection", "teacherPresetSection"]:
        if f'id="{req_id}"' not in full_text and f"id='{req_id}'" not in full_text:
            findings.append((0, "Gate4:モーダル要素", f"必須要素 #{req_id} の欠落", "モーダル構造"))

    return findings

def scan_js_files():
    js_findings = {}
    targets = [ROOT / "auth_sync.js"]
    for sub in ["js", "lib"]:
        d = ROOT / sub
        if d.exists():
            targets.extend(sorted(d.glob("*.js")))

    for jp in targets:
        if not jp.exists():
            continue
        lines = jp.read_text(encoding="utf-8", errors="ignore").splitlines()
        f_list = []
        for line_no, raw_line in enumerate(lines, start=1):
            line = raw_line.strip()
            if line.startswith("//") or line.startswith("/*"):
                continue

            for pat, desc in FORBIDDEN_TERMS:
                if re.search(pat, line):
                    f_list.append((line_no, "Gate1:用語", desc, raw_line[:80]))

            emojis = find_decorative_emojis(line)
            if emojis:
                f_list.append((line_no, "Gate2:絵文字", f"絵文字残存: {' '.join(emojis)}", raw_line[:80]))

            for forbidden in ["onSnapshot", "bio_edu_request_save"]:
                if forbidden in line:
                    f_list.append((line_no, "Gate4:禁止通信", forbidden, raw_line[:80]))

        if f_list:
            js_findings[str(jp.relative_to(ROOT))] = f_list
    return js_findings

def main():
    print("=" * 80)
    print("🛡️  Bio-Edu Suite Master Compliance Diagnostic System (Read-Only Mode)")
    print("=" * 80)

    total_issues = 0

    print("\n【1. 全18画面 HTMLファイル 診断レポート】")
    for hname in TARGET_HTML_FILES:
        hp = ROOT / hname
        if not hp.exists():
            print(f"  ❌ {hname:<38} : ファイルが存在しません")
            total_issues += 1
            continue
        findings = scan_html_file(hp)
        if not findings:
            print(f"  ✅ {hname:<38} : 完全準拠 (指摘 0件)")
        else:
            total_issues += len(findings)
            print(f"\n  ⚠️  {hname:<38} : {len(findings)} 件の確認項目")
            for line_no, gate, desc, snippet in findings:
                loc = f"Line {line_no:<4}" if line_no > 0 else "全体  "
                print(f"       [{loc}] [{gate:<12}] {desc}")
                if line_no > 0:
                    print(f"              コード: {snippet.strip()}")

    print("\n" + "-" * 80)
    print("【2. 共通JSモジュール 診断レポート】")
    js_findings = scan_js_files()
    if not js_findings:
        print("  ✅ 全JSモジュール : 完全準拠 (指摘 0件)")
    else:
        for jname, f_list in js_findings.items():
            total_issues += len(f_list)
            print(f"\n  ⚠️  {jname:<38} : {len(f_list)} 件の確認項目")
            for line_no, gate, desc, snippet in f_list:
                print(f"       [Line {line_no:<4}] [{gate:<12}] {desc}")
                print(f"              コード: {snippet.strip()}")

    print("\n" + "=" * 80)
    print("【3. 恒久保護アセット（聖域）の維持確認】")
    for asset in sorted(PERMANENT_ASSETS):
        ap = ROOT / asset
        status = "保護維持（存在確認）" if ap.exists() else "未配置"
        print(f"  🛡️  {asset:<24} : {status}")

    print("=" * 80)
    print(f"📋 診断完了: 合計 {total_issues} 箇所の確認項目がリストアップされました。")
    print("※本スクリプトは読み取り専用です。コードの書き換えは一切行われていません。")
    print("=" * 80)
    return 0

if __name__ == "__main__":
    sys.exit(main())
