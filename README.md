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
4. **最新の教育基準への準拠 (Academic Standard)**
   日本学術会議の公式資料「高等学校の生物教育における重要用語の選定について（2025年版）」に完全準拠。「mutation(突然変異)」と「variation(変異)」の厳格な区別、優性・劣性に代わる「顕性・潜性」の採用、平仮名表記（血しょう、かく乱など）など、正しい科学用語で学べる環境を徹底しています。

## 🎨 UI/UX デザイン規格 (v34.4 最新規格準拠)
本スイートは最新のWebテクノロジーを用い、ネイティブアプリに匹敵する極上の操作感を提供します。

* **シームレスな画面遷移 (View Transitions API):** 複数ページ構成（MPA）でありながら、SPA（シングルページアプリケーション）のような滑らかなスライド・フェードアニメーションを標準搭載。
* **適材適所のViewport制御:** ダッシュボードや一部の入力系アプリ（Phase 1, 2の一部, Lab Packs）はスマートフォンにも対応する完全レスポンシブ設計（`width=device-width`）。高度な解析アプリは視認性を担保するため `1024px` 固定表示とし、用途に応じた最適なレイアウトを提供。
* **洗練されたグローバル・ドロワー (Peg Menu):** 画面幅 `1024px` 以下ではドロワーを完全隠蔽して画面を広く使い、`1025px` 以上ではホバー展開やピン留めが可能な高度なナビゲーション。ブロック状全幅ハイライトにより、直感的な操作を実現。
* **PWA・ネイティブアプリライクな没入感:** 厳格なタッチターゲット（最小44/48px）の確保、スクロールバウンス（ラバーバンド効果）の完全排除、フリッカー（画面のガタつき）防止など、細部まで徹底的に磨き上げられたUX設計。

## 📦 収録アプリケーション (v34.4)

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
- **⑪ Comparative Variant Analyzer** (`11_Comparative_Variant_Analyzer.html`)
  複数サンプルの変異を比較解析します。

### PHASE 5: 統計遺伝学
- **⑫ Statistical Genetics Lab** (`12_Statistical_Genetics_Lab.html`)
  環境データと形態データを結合し、AMMIバイプロットや反応規範、分散分析(ANOVA)を通じて、遺伝×環境相互作用(GxE)を解析します。

### PHASE 6: 構造生物学
- **⑬ Central Dogma Simulator** (`13_Central_Dogma_Simulator.html`) - 転写・翻訳シミュレータ
- **⑭ Protein Structure Explorer** (`14_Protein_Structure_Explorer.html`) - 1D-3D連動型タンパク質構造ビューア

---

## 🎒 EXTRA: Bio-Edu Lab Packs (教材パック)
実際のWet実験（DNA抽出・PCR等）と、本スイートのDry解析を統合した「実践的パッケージ」を標準収録しています（`lab_packs.html`）。

* **1-A. 食肉偽装の真実を暴け**（標的: ミトコンドリアDNA cytb遺伝子） - 「豚肉100%」のミンチ肉に隠された異種DNAを特定し、食品偽装を暴く。
* **1-B. 鎌状赤血球症のHbと哺乳類の進化**（標的: HbA / HbB遺伝子） - 突然変異によるタンパク質構造異常（ミクロ）と種の進化（マクロ）のダイナミズムを解明。
* **2-A. フライドチキンから辿る哺乳類の腕**（対象: 前肢骨格・関連遺伝子） - 手羽先の骨格とコウモリやイルカのデータを突き合わせ、適応放散の軌跡を証明。
* **2-B. 見た目のそっくりは本当の親戚か？**（対象: 頭骨形態・関連遺伝子） - タヌキやアライグマの「形態」と「DNA」の矛盾から、収斂進化の罠を暴く。
* **3-A. アニサキス科線虫の同胞種鑑別**（標的: 核DNA ITS領域） - 形態で区別不可能な同胞種をPCR-RFLPと多変量解析で鑑別し、宿主転換の歴史を探る。
* **3-B. 自分のルーツ探求**（対象: 自身のDNA・顔角データ） - 自身のデータと古代人・類人猿を比較し、人類特有の進化を自らの身体で証明。

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
