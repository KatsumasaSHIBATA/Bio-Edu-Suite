#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bio-Edu Suite ドキュメント三点セット 矛盾解消＆新モデル「4 Argon」規定反映スクリプト (冪等性対応)
"""
from pathlib import Path


def update_workflow(path: Path) -> bool:
    if not path.exists():
        print(f"[SKIP] {path} not found.")
        return False

    text = path.read_text(encoding="utf-8")
    orig = text

    text = text.replace(
        "# **🧬 Bio-Edu Suite AI開発マスター・ワークフロー v5.12 (デュアルコア運用＆単一責務原則・早期損切りSOP)**",
        "# **🧬 Bio-Edu Suite AI開発マスター・ワークフロー v5.14 (トライコア運用・4 Argon対応＆単一責務原則・早期損切りSOP)**"
    )
    text = text.replace(
        "* **【Web側デュアルコア運用規格】**:",
        "* **【Web側トライコア運用規格（4 Argon 対応）】**:"
    )
    text = text.replace(
        "  - **Level 3**: `gemini-3.1-pro-preview`（Web側司令塔固定・Cline割当禁止）",
        "  - **Level 3**: `4 Argon (思考レベル：高値)` / `gemini-3.1-pro-preview`（Web側司令塔固定・Cline割当禁止）"
    )

    if text != orig:
        path.write_text(text, encoding="utf-8")
        print(f"[UPDATED] {path}")
        return True
    print(f"[NO CHANGE] {path} (already up-to-date)")
    return False


def update_guideline(path: Path) -> bool:
    if not path.exists():
        print(f"[SKIP] {path} not found.")
        return False

    text = path.read_text(encoding="utf-8")
    orig = text

    text = text.replace(
        "# **🎨 Bio-Edu Suite 統合UI/UX・開発ガイドライン (v37.3_2026-10-04:最新版)**",
        "# **🎨 Bio-Edu Suite 統合UI/UX・開発ガイドライン (v37.5_2026-10-14:最新版)**"
    )
    text = text.replace(
        "## **【改訂・サルベージ履歴】**\n* **v37.2 (2026-10-04):**",
        "## **【改訂・サルベージ履歴】**\n* **v37.5 (2026-10-14):** Web側司令塔への新モデル「4 Argon（思考レベル：高値・中・安値）」導入に伴うトライコア運用規格の法制化、およびドキュメント間の旧モデル規定ネジレの完全クリーンアップ。\n* **v37.2 (2026-10-04):**"
    )

    if text != orig:
        path.write_text(text, encoding="utf-8")
        print(f"[UPDATED] {path}")
        return True
    print(f"[NO CHANGE] {path} (already up-to-date)")
    return False


def main():
    root = Path(__file__).resolve().parent.parent
    update_workflow(root / "docs" / "workflow.md")
    update_guideline(root / "docs" / "guideline.md")


if __name__ == "__main__":
    main()
