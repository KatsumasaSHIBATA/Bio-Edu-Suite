#!/bin/bash

# 1. スクリプトを実行して全HTMLファイルを一括改修
python update_native_features.py

# 2. 変更内容を確認
git diff

# 3. 問題がなければコミット
git add .
git commit -m "feat: ガイドライン第15項に基づくネイティブ化・ステート保持の共通パッチを全HTMLに適用"

# 4. 不要になったスクリプトを削除
rm update_native_features.py
