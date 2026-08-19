# 🧬 Bio-Edu Suite

## 🎯 概要 (Overview)
Bio-Edu Suiteは、大学や高校の生物学・バイオインフォマティクス実習のために開発された、**ブラウザだけで完結する教育用ウェブアプリケーション群**です。
DNA配列の増幅（PCR）から、系統樹作成、形態測定（EFA）、統計遺伝学（GxE）、そしてタンパク質の立体構造解析まで、現代の生物学における一連の解析パイプラインをシームレスに体験できます。

サーバー構築やPython環境の準備は一切不要。学生のPCやスマホでHTMLファイルを開くだけで、本格的なDry解析実習を即座にスタートできます。

## 💡 基本哲学 (Our Philosophy)
1. **「なぜ？」を必ず示す (Rationale System)** 
   操作がブラックボックス化するのを防ぐため、「現場のコツ」として熱力学的根拠やパラメータの意味をUIの随所に提示しています。
2. **「繋がり」を体感する (Seamless Pipeline)** 
   各アプリが独立するのではなく、ダッシュボードを中心とした「バケツリレー形式（TSV/JSON連携）」を採用。配列から構造へ、遺伝子から形態・環境への繋がりを体感できます。
3. **プロツールへの架け橋 (Bridge to Professional)** 
   ブラウザ内でMEGA、MAFFT、ImageJ相当のアルゴリズム（UPGMA/NJ/MP/ML、楕円フーリエ解析など）をエミュレートし基礎を学んだ後、プロ用ソフトウェアへステップアップできるよう誘導する仕組みを設けています。

## 📦 収録アプリケーション (v32.x)

ダッシュボードを中心とした全6フェーズ＋拡張パッケージで構成されています。

### PHASE 1: 収集・ハブ
- **Investigation Dashboard** (`index.html`)
  各アプリへのハブとなるダッシュボード。採集したサンプルと環境メタデータを登録し、各解析アプリへデータを送り出します。

### PHASE 2: DNAラボ
- **① PCR Master Mix Studio** (`1_Master_Mix_Studio.html`) - 反応液の最適化
- **② Thermal Cycler Simulator** (`2_Thermal_Cycler_Simulator.html`) - 熱プロファイルの設計
- **③ Virtual PCR & RFLP** (`3_Virtual_PCR_RFLP.html`) - PCR増幅と制限酵素による消化シミュレーション
- **④ Sanger Trace Editor** (`4_Sanger_Trace_Editor.html`) - 波形データのノイズ手動修正
- **⑤ DNA Alignment Studio** (`5_DNA_Alignment_Studio.html`) - 配列のアライメントとプライマー設計（パイプライン・ハブ）
- **⑥ Alignment Print Studio** (`6_Alignment_Print_Studio.html`) - 論文・レポート用出力
- **⑦ Virtual BLAST Explorer** (`7_Virtual_BLAST_Explorer.html`) - スコアリングとE-valueの学習・相同性検索
- **⑧ Phylogenetic Tree Builder** (`8_Phylogenetic_Tree_Builder.html`) - 距離行列の計算と系統樹構築。MP法やML法の全探索、ブートストラップ解析をWeb Workerを用いてブラウザ上で完全エミュレートします。

### PHASE 3: 形態ラボ
- **⑨ Morphometrics Studio** (`9_Morphometrics_Studio.html`)
  画像から輪郭を抽出し、Kuhl & Giardina (1982) の楕円フーリエ解析(EFA)と主成分分析(PCA)による幾何学的形態測定を行います。

### PHASE 4: 統合検証ルーム
- **⑩ Integrative Taxonomy Studio (Taxonomy Explorer)** (`10_integrative_taxonomy_studio.html`)
  分子系統樹と形態データを統合（タングルグラム）し、進化の軌跡をたどる形態空間モーフィングを体験します。

### PHASE 5: 統計遺伝学
- **⑪ Statistical Genetics Lab** (`11_Statistical_Genetics_Lab.html`)
  環境データと形態データを結合し、AMMIバイプロットや反応規範、分散分析(ANOVA)を通じて、遺伝×環境相互作用(GxE)を解析します。

### PHASE 6: 構造生物学
- **⑫ Central Dogma Simulator** (`12_Central_Dogma_Simulator.html`) - 転写・翻訳シミュレータ
- **⑬ Protein Structure Explorer** (`13_Protein_Structure_Explorer.html`) - 1D-3D連動型タンパク質構造ビューア

---

## 🎒 EXTRA: Bio-Edu Lab Packs (教材パック)
実際のWet実験（DNA抽出・PCR）と、本スイートのDry解析を統合した「実践的DNA解析パッケージ」を標準収録しています（`lab_packs.html`）。

* **肉種鑑別パック**（標的: cytb）- 食品表示の真偽を特定
* **シーフード偽装 鑑定パック**（標的: COI）- 白身魚フライやネギトロの正体を暴く
* **自分のルーツ探求パック**（標的: cytb）- 現生人類と古代人・類人猿の比較
* **環境DNA (eDNA) 調査パック**（標的: 12S MiFish-U）- コップ一杯の水から外来生物を検出
* **身近な衛生昆虫バーコーディングパック**（標的: COI）- 蚊やマダニの特定
* **アニサキス科線虫の同胞種鑑別パック**（標的: 核DNA ITS領域）- 形態で区別不可能な同胞種のPCR-RFLP鑑別

※「Creator's Lounge」として、Python (Google Colab) を用いてNCBIから必要な遺伝子だけを抽出・アノテーションし、独自のカスタムデータベース（JSONカセット）を自作するガイドも用意しています。

## 🛠️ テクノロジー (Tech Stack)
* **Core:** HTML5, CSS3, Vanilla JavaScript (ES6+)
* **Zero Dependencies:** ローカル環境で完全に動作し、学生のプライバシー（配列データ等）が外部サーバーに送信されることはありません。
* **Bio Math Engine (`bio_math_engine.js`):** EFA演算、NIPALS法によるPCA、Lance-Williams更新式に基づく階層的クラスタリング等をブラウザ上で高速処理します。
* **Phylo Worker (`phylo_worker.js`):** 最大節約法（MP法）におけるFitchのアルゴリズムや、最尤法（ML法）におけるJC69モデル・Felsensteinの尤度計算など、天文学的な計算量になる系統樹探索を **Web Worker** を用いてマルチスレッド処理。UIをフリーズさせることなく本格的なブートストラップ解析（最大1000回）をバックグラウンドで実行します。

## 🚀 使い方 (How to Use)
1. 本リポジトリの `<> Code` ボタンから `Download ZIP` でファイル一式をダウンロードして解凍します。
2. `index.html`（Investigation Dashboard）をブラウザ（Chrome, Safari等）で開きます。
3. 画面の指示に従い、各ラボツールへアクセスして実習を進めてください。

## 👨‍🏫 著者 / 開発者 (Author)
- **SHIBATA Katsumasa**
- [GitHub: KatsumasaSHIBATA/Bio-Edu-Suite](https://github.com/KatsumasaSHIBATA/Bio-Edu-Suite)
