# 🧬 Bio-Edu Suite

## 🎯 概要 (Overview)
Bio-Edu Suiteは、高等学校および大学の生物学・バイオインフォマティクス実習のために開発された、**ブラウザだけで完結する教育用ウェブアプリケーション群（v35.5）**です。
DNAの抽出・PCR反応液の最適化から、電気泳動・制限酵素消化シミュレーション、シーケンス波形編集、多重配列整列（アライメント）、系統樹推定（UPGMA/NJ/MP/ML）、幾何学的形態測定（EFA/PCA）、遺伝×環境相互作用（GxE）、そしてタンパク質の3D立体構造解析まで、現代の生物科学における一連の探究パイプラインをシームレスに体験できます。

サーバー構築やPython環境のインストールは一切不要。Chromebook、iPad、PCなどのブラウザでHTMLを開くだけで、本格的なWet/Dry統合実習を即座に開始できます。

---

## 💡 基本哲学 (Our Philosophy)
1. **「なぜ？」を必ず示す (Rationale System)** 
   操作のブラックボックス化を防ぐため、熱力学的根拠やアルゴリズムの数学的背景を「現場のコツ」やオンデマンドな解説ポップオーバー（[?]ボタン）としてUI随所に提示しています。
2. **手動バケツリレーの教育的価値 (Pedagogical Bucket Relay)** 
   アプリ間の安易な自動データ受け渡しを排し、生徒自らの手で解析結果（TSV/JSON/FASTA等）をクリップボードにコピーして次の解析ツールへ持ち寄る「手動バケツリレー」を徹底。データの所在と変換プロセスを体感させます。
3. **プロツールへの架け橋 (Bridge to Professional)** 
   ブラウザ内でMEGA、MAFFT、ImageJ、PyMOL相当のアルゴリズムを忠実にエミュレートして基礎を学んだ後、研究現場で使われるプロ向け専門ソフトウェアへステップアップできるよう誘導する足場掛け（Scaffolding）を備えています。
4. **最新の教育基準への厳格準拠 (Academic Standard)**
   日本学術会議の公式資料「高等学校の生物教育における重要用語の選定について（2025年版）」に完全準拠。「突然変異 (mutation)」と「変異 (variation)」の厳格な区別、優性・劣性に代わる「顕性・潜性」の採用、平仮名表記（血しょう、かく乱など）など、現代の学術基準に合致した正確な用語体系を貫いています。

---

## 🏫 学校現場特化の通信・同期設計 (Classroom-Ready Architecture / v35.5)
学校のICT実習における「ログインできない」「パスワードを忘れた」「外部認証が学校のセキュリティで弾かれる」といった授業開始時のトラブルを根絶するため、Kahoot方式の通信アーキテクチャを標準搭載しています。

* **ゼロ・ログイン ＆ プライバシー完全保護 (Zero-Login & Privacy-First):**
  メールアドレスや氏名、パスワードの登録は一切不要。Firebase匿名認証を基盤とし、生徒の個人情報を一切収集・保持しないため、教育委員会や学校の厳格なセキュリティポリシーを即座にクリアします。
* **個人／班ハイブリッド同期 (Hybrid Connection Modes):**
  - **班協働モード**: 班番号（例: `Team-02`）を入力して入室することで、班員全員の手元端末へ解析ステート（塩基配列、アライメント結果等）がリアルタイムに共有されます。
  - **個人・自宅引き継ぎモード**: 出席番号（例: `No-15`）で入室すれば、学校の実習端末で途中まで進めた解析データを、自宅のPCやタブレットから同一コードを入れるだけでシームレスに再開可能です。
* **隠れ教師モード ＆ 課題プリセット一発配信 (Secret Teacher Mode & Instant Preset):**
  教員が参加者IDの先頭に `TEACHER`（例: `TEACHER` または `TEACHER-山田`）と入力して入室すると、シークレット管理権限が自動解放。教員端末の画面上の教材データを課題コード（例: `TASK-ALX1`）としてクラウド発行でき、生徒はコードを入力するだけで一瞬で教材データを手元画面へ一括展開できます。重いファイルの配布やダウンロード操作は不要です。
* **初期化多重保護規格 (Multi-Layer Reset Protection):**
  生徒が誤って端末の「データを初期化」ボタンを押しても、消去されるのはローカルキャッシュのみに限定されます。クラウド上の班・個人データの上書き消去を物理遮断しているため、同一コードで再入室すれば直前の状態へ即座に復旧できます。
* **同一セッション内ステート完全保持規格 (Session-Persistent Workspace Standard / v35.1):**
  アプリ間を自由に行き来しても入力した塩基配列や編集状態が初期化されないよう、ブラウザウィンドウ生存期間中は `sessionStorage` を介して作業空間が完全永続化されます。

---

## 🎨 UI/UX デザイン規格 (v35.5)
本スイートは最新のWebテクノロジーを用い、ネイティブアプリに匹敵する操作感と没入感を提供します。

* **シームレスな画面遷移 (View Transitions API):** 複数ページ構成（MPA）でありながら、SPAのような滑らかなスライド・フェードアニメーションを標準搭載。
* **適材適所のViewport制御:** ダッシュボードや一部の入力系アプリはスマートフォンにも対応するレスポンシブ設計（`width=device-width`）。高度な解析アプリは視認性と操作領域を担保するため `1024px` 固定表示とし、端末に応じた最適なレイアウトを提供。
* **洗練されたグローバル・ドロワー (Peg Menu):** 画面幅 `1024px` 以下ではドロワーを完全隠蔽して画面を広く使い、`1025px` 以上ではホバー展開やピン留めが可能な高度なナビゲーション。
* **ネイティブアプリライクな端末制御:** 厳格なタッチターゲット（最小44/48px）の確保、スクロールバウンス（ラバーバンド効果）の完全排除、誤操作を防ぐ長押し・右クリックメニューの封印（コンテキストメニュー制御）、数値専用キーパッドの自動呼出（`inputmode`）など、細部まで徹底的に磨き上げられたUX設計。

---
## 📦 収録アプリケーション (v35.5 全14アプリ)

ダッシュボードを中心とした全6フェーズ＋拡張パッケージで構成されています。

### PHASE 1: 収集・ハブ
- **Investigation Dashboard** (`index.html`)
  各アプリへのハブとなるデジタル野帳（LIMS）。採集したサンプルと環境メタデータを登録・管理し、各解析アプリへデータを送り出します。

### PHASE 2: DNAラボ
- **① PCR Master Mix Studio** (`1_Master_Mix_Studio.html`) - 反応液量・試薬濃度の精密計算とスケールダウン最適化
- **② Thermal Cycler Simulator** (`2_Thermal_Cycler_Simulator.html`) - 酵素特性と増幅長に基づく熱プロファイル設計・論理的トラブルシューティング
- **③ Virtual PCR & RFLP** (`3_Virtual_PCR_RFLP.html`) - アガロースゲル電気泳動バンドシミュレーションと制限酵素による消化断片解析
- **④ Sanger Trace Editor** (`4_Sanger_Trace_Editor.html`) - ABI/SCF波形データの可視化とノイズ手動修正・ベースコール
- **⑤ DNA Alignment Studio** (`5_DNA_Alignment_Studio.html`) - 複数塩基配列のアライメント、トリミング、プライマー設計（パイプライン・ハブ）
- **⑥ Alignment Print Studio** (`6_Alignment_Print_Studio.html`) - 論文・レポート提出用のアライメント図版出力
- **⑦ Virtual BLAST Explorer** (`7_Virtual_BLAST_Explorer.html`) - スコアリングマトリクス、E-valueの学習および配列相同性検索
- **⑧ Phylogenetic Tree Builder** (`8_Phylogenetic_Tree_Builder.html`) - UPGMA法、近隣結合法（NJ法）、最大節約法（MP法）、最尤法（ML法）の全探索およびブートストラップ解析をWeb Workerで完全エミュレートする系統樹推定ツール

### PHASE 3: 形態ラボ
- **⑨ Morphometrics Studio** (`9_Morphometrics_Studio.html`)
  生物画像から輪郭・ランドマークを抽出し、Kuhl & Giardina (1982) の楕円フーリエ解析(EFA)および一般化プロクラステス解析(GPA)、主成分分析(PCA)による幾何学的形態測定を実施。

### PHASE 4: 統合検証ルーム
- **⑩ Integrative Taxonomy Studio** (`10_integrative_taxonomy_studio.html`)
  分子系統樹と形態デンドログラムを対比（タングルグラム）させ、系統と形態の進化速度の不一致や形態空間モーフィングを検証。
- **⑪ Comparative Variant Analyzer** (`11_Comparative_Variant_Analyzer.html`)
  遺伝的距離と形態的距離の相関をMantel検定によって統計的に比較検証。

### PHASE 5: 統計遺伝学
- **⑫ Statistical Genetics Lab** (`12_Statistical_Genetics_Lab.html`)
  環境データと形態測定値を結合し、AMMIバイプロット、反応規範（Reaction Norm）、二元配置分散分析(ANOVA)を通じて、遺伝×環境相互作用(GxE)と適応度の逆転を解析。

### PHASE 6: 構造生物学
- **⑬ Central Dogma Simulator** (`13_Central_Dogma_Simulator.html`) - 転写・翻訳シミュレーションおよびコドン変化に伴うアミノ酸物性急変の検出
- **⑭ Protein Structure Explorer** (`14_Protein_Structure_Explorer.html`) - PDB実測値およびAlphaFold DBと連動した3D立体構造ビューア。突然変異部位のマッピング、周辺5Å相互作用解析、ハイドロパシー表面可視化に対応。

---

## 🎒 EXTRA: Bio-Edu Lab Packs (教材パック)
実際のWet実験（DNA抽出・PCR・制限酵素処理）と本スイートのDry解析を有機的に結びつけた実践的パッケージです（`lab_packs.html`）。

* **1-A. 食肉偽装の真実を暴け**（標的: ミトコンドリアDNA cytb遺伝子） - 「豚肉100%」のミンチ肉に隠された異種DNAをPCR-RFLPと配列解読で特定。
* **1-B. 鎌状赤血球症のHbと哺乳類の進化**（標的: HbA / HbB遺伝子、cytb遺伝子） - 1塩基の突然変異によるタンパク質構造異常（ミクロ）と種の適応進化（マクロ）を解明。
* **2-A. フライドチキンから辿る哺乳類の腕**（対象: 前肢骨格・関連遺伝子） - 手羽先の骨格標本と各種動物の3Dデータを突き合わせ、相同器官と適応放散を証明。
* **2-B. 見た目のそっくりは本当の親戚か？**（対象: 頭骨形態・関連遺伝子） - タヌキ、アライグマ、ハクビシンの頭骨形態とDNAの矛盾から、収斂進化のドラマを解き明かす。
* **3-A. アニサキス科線虫の同胞種鑑別**（標的: 核DNA ITS領域） - 形態で区別不可能な同胞種をPCR-RFLPと微細計測多変量解析で鑑別し、宿主転換の歴史を追跡。
* **3-B. 自分のルーツ探求**（対象: 自身のDNA・顔角データ） - 自身のデータと古代人・類人猿を比較し、人類特有の脳拡大と顔面平坦化の進化を証明。

---

## 🛠️ テクノロジー (Tech Stack)
* **Core:** HTML5, CSS3, Vanilla JavaScript (ES6+)
* **Zero Server Dependencies:** すべての計算・描画がブラウザ内部で完結。
* **Cloud & Realtime Sync:** Firebase (Authentication 匿名認証, Cloud Firestore, IndexedDB Persistence)
* **Visualization & Math:** D3.js (v7), 3Dmol.js, Numeric.js
* **Bio Math Engine (`bio_math_engine.js`):** フーリエ変換、NIPALS法によるPCA、プロクラステス重ね合わせ、Lance-Williams更新式に基づくクラスタリング等をブラウザ上で高速処理。
* **Phylo Worker (`phylo_worker.js`):** 最大節約法（Fitchアルゴリズム）や最尤法（JC69モデル尤度計算）など、重負荷な系統樹探索をWeb Workerでマルチスレッド並列処理。UIをフリーズさせずに本格的なブートストラップ解析を実行。

---

## 🚀 使い方 (How to Use)
1. 本リポジトリの `<> Code` ボタンから `Download ZIP` でファイル一式をダウンロードして解凍（または `git clone`）します。
2. `index.html`（Investigation Dashboard）をブラウザ（Chrome, Safari, Edge等）で開きます。
3. ヘッダー右上の接続ボタンから「ルームコード」と「参加者ID」を入力するだけで、直ちにクラウド同期・協働解析が開始されます。

---

## 👨‍🏫 著者 / 開発者 (Author)
- **SHIBATA Katsumasa**
- [GitHub: KatsumasaSHIBATA/Bio-Edu-Suite](https://github.com/KatsumasaSHIBATA/Bio-Edu-Suite)
- [License: MIT]
