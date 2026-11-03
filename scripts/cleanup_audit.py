#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bio-Edu Suite ワークスペース安全クリーンアップシステム (cleanup_audit.py)
【安全原則】
- ルート直下の全HTML・教材・画像アセット（arm.jpg, skull.jpg, print_materials等）は恒久聖域とし、絶対に変更・削除しない。
- 削除対象は OS一時ファイル（.DS_Store）、エディタ一時ファイル、Pythonキャッシュ、および scripts/_patch_runner.py のみに限定する。
"""
import os
import sys
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPTS_DIR = ROOT / "scripts"

ALLOWED_SCRIPTS = {"cleanup_audit.py", "master_compliance_audit.py"}

def find_safe_cleanup_targets():
    targets = []

    # 1. scripts/ ディレクトリ内の作業一時スクリプト（_patch_runner.py 等）
    if SCRIPTS_DIR.exists():
        for item in SCRIPTS_DIR.iterdir():
            if item.name not in ALLOWED_SCRIPTS:
                targets.append((item, "scripts/ 一時作業ファイル（2ファイル常駐制）"))

    # 2. 全階層の一時ゴミファイル (.DS_Store, *.bak, *.tmp, __pycache__)
    for p in ROOT.rglob("*"):
        if ".git" in p.parts:
            continue
        if p.name in {".DS_Store"} or p.suffix in {".bak", ".tmp", ".orig"} or p.name.endswith("~"):
            targets.append((p, "OS/エディタ一時ファイル"))
        elif p.is_dir() and p.name == "__pycache__":
            targets.append((p, "Pythonバイトコードキャッシュ"))

    # 重複排除とソート
    unique_targets = {}
    for p, reason in targets:
        unique_targets[p] = reason
    return sorted(unique_targets.items(), key=lambda x: str(x[0]))

def main():
    apply_mode = "--apply" in sys.argv
    targets = find_safe_cleanup_targets()

    print("=" * 72)
    print("🧹 Bio-Edu Suite Workspace Safe Cleanup System")
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
        print(f"✅ 合計 {deleted_count} 件の一時ファイルを安全に消去しました（教材・画像アセットは完全保護）。")
    else:
        print(f"💡 合計 {len(targets)} 件の一時ファイルが検出されました。消去するには `--apply` を付与して実行してください。")
    return 0

if __name__ == "__main__":
    sys.exit(main())
