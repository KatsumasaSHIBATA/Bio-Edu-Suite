import os

filepath = 'docs/guideline.md'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target_heading = "### 7.6 外部解析APIとのハイブリッド・デュアルエンジン規格（BLAST検索等）"

if target_heading in content:
    print("Already exists. Skipping.")
else:
    # 7.5 の終わり、あるいは次のセクションの直前に挿入する
    # 例として "* **モーダル幅の完全統一**" の直前に挿入する
    marker = "* **モーダル幅の完全統一**"
    
    insertion = """### 7.6 外部解析APIとのハイブリッド・デュアルエンジン規格（BLAST検索等）
- **目的**: オフライン環境での高速な反復演習（教育的シミュレーション）と、本物のビッグデータを用いた本格的な探究学習（リアルクラウド連携）を両立させる。
- **実装要件**:
  1. **デュアルエンジン構成**: 軽量なローカルJSエンジン（Web Workerまたは同等の非同期処理）による「オフライン・ファーストモード」と、外部の公開REST API（NCBI QBLAST API等）を直接叩く「オンライン・探究モード」を同一UI内でシームレスに切り替えられるよう設計すること。
  2. **自動フォールバック（堅牢性ガード）**: オンラインモード実行時に学校のネットワーク制限（外部API遮断）やタイムアウトが発生した場合、即座にトースト等でエラーを通知し、オフラインのローカルエンジンへ安全に誘導（フォールバック）するフェイルセーフ機構を義務付ける。
  3. **共通データモデルによる正規化**: どちらのエンジンを使用した場合でも、返却される結果オブジェクト（塩基配列・アミノ酸配列、スコア、E-value、アライメント結果等）を共通のインターフェースフォーマットに正規化し、D3.js等の描画ロジック（View）を完全に共通化すること。

"""
    if marker in content:
        new_content = content.replace(marker, insertion + marker)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Successfully inserted 7.6 into docs/guideline.md")
    else:
        print("Error: marker not found.")
