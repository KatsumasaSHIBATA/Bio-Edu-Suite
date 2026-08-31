#!/bin/bash

# 誤って作成されたゴミファイルを削除
rm -f add commit diff git python "で変更を保存し、最後に不要になった" "で変更内容を検証し、問題がなければ" と "を削除してください。" "を実行して全HTMLファイルに第15項のパッチを適用してください。その後" "作成されている"

# Pythonスクリプトを実行して全HTMLファイルを一括改修
python update_native_features.py

# 変更差分を確認
git diff

# 問題がなければコミット
git add .
git commit -m "feat: ガイドライン第15項に基づくネイティブ化・ステート保持の共通パッチを全HTMLに適用"

# 不要になったスクリプトの削除
rm -f update_native_features.py apply_and_cleanup.sh
