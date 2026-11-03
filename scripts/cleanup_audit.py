#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bio-Edu Suite ワークスペース自律クリーンアップ＆検疫システム (cleanup_audit.py)
常駐許可: scripts/cleanup_audit.py, scripts/master_compliance_audit.py の2本のみ。
"""
import os
import sys
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPTS_DIR = ROOT / "scripts"

ALLOWED_SCRIPTS = {"cleanup_audit.py", "master_compliance_audit.py"}

ROOT_GARBAGE_TARGETS = [
    ".aider.chat.history.md",
    ".aider.conf.yml",
    ".aider.input.history",
    ".aider.tags.cache.v4",
    ".roomodes",
    "apply_and_cleanup.sh",
    ".DS_Store",
]

CORE_HTML_WHITELIST = {
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
}

def find_garbage(purge_orphans=False):
    targets = []

    # 1. ルート直下の既知のゴミ
    for name in ROOT_GARBAGE_TARGETS:
        p = ROOT / name
        if p.exists():
            targets.append((p, "Root legacy/temp garbage"))

    # 2. 全階層の一時ファイル (.DS_Store, *.bak, *.tmp, *~, __pycache__)
    for p in ROOT.rglob("*"):
        if ".git" in p.parts:
            continue
        if p.name in {".DS_Store"} or p.suffix in {".bak", ".tmp", ".orig"} or p.name.endswith("~"):
            targets.append((p, "OS/Editor temp file"))
        elif p.is_dir() and p.name == "__pycache__":
            targets.append((p, "Python cache dir"))

    # 3. scripts/ 内の非許可ファイル・ディレクトリ
    if SCRIPTS_DIR.exists():
        for item in SCRIPTS_DIR.iterdir():
            if item.name not in ALLOWED_SCRIPTS:
                targets.append((item, "Unauthorized file/dir in scripts/ (2-file residency rule)"))

    # 4. --purge-orphans 指定時の未参照HTML/画像検査
    if purge_orphans:
        active_contents = ""
        for html_name in CORE_HTML_WHITELIST:
            hp = ROOT / html_name
            if hp.exists():
                active_contents += hp.read_text(encoding="utf-8", errors="ignore") + "\n"
        for js_dir in [ROOT, ROOT / "js", ROOT / "lib"]:
            if js_dir.exists():
                for jp in js_dir.glob("*.js"):
                    if jp.name != "preset_db.js":
                        active_contents += jp.read_text(encoding="utf-8", errors="ignore") + "\n"

        suspects = [
            "Human_Evolution_Lab.html",
            "Morphological_Evolution_Lab.html",
            "arm.jpg",
            "skull.jpg",
            "preset_db.js",
        ]
        for s in suspects:
            sp = ROOT / s
            if sp.exists() and (s not in active_contents):
                targets.append((sp, "Unreferenced orphan file in root"))

    unique_targets = {}
    for p, reason in targets:
        unique_targets[p] = reason
    return sorted(unique_targets.items(), key=lambda x: str(x[0]))

def main():
    apply_mode = "--apply" in sys.argv or "--purge-orphans" in sys.argv
    purge_orphans = "--purge-orphans" in sys.argv

    targets = find_garbage(purge_orphans=purge_orphans)
    print("=" * 72)
    print("🧹 Bio-Edu Suite Workspace Cleanup & Quarantine System")
    print("=" * 72)

    if not targets:
        print("✅ ワークスペースは完全にクリーンです（ゴミファイル: 0件）。")
        return 0

    deleted_count = 0
    for p, reason in targets:
        if not p.exists():
            continue
        rel = p.relative_to(ROOT)
        kind = "[DIR] " if p.is_dir() else "[FILE]"
        if apply_mode:
            try:
                if p.is_dir():
                    shutil.rmtree(p)
                else:
                    p.unlink()
                print(f"🗑️  Deleted {kind} {rel}  ({reason})")
                deleted_count += 1
            except Exception as e:
                print(f"⚠️  Failed to delete {rel}: {e}")
        else:
            print(f"🔍 Found   {kind} {rel}  ({reason})")

    print("-" * 72)
    if apply_mode:
        print(f"✅ 合計 {deleted_count} 件の不要項目を完全消去しました。")
    else:
        print(f"💡 合計 {len(targets)} 件の不要項目が検出されました。消去するには `--apply` を付与して実行してください。")
    return 0

if __name__ == "__main__":
    sys.exit(main())
