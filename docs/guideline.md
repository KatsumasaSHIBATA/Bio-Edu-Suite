# **🎨 Bio-Edu Suite 統合UI/UX・開発ガイドライン (v38.2_2026-11-01: 純粋統合マスター版)**

本ガイドラインは、Bio-Edu Suite内の全アプリケーションにおける視覚的な一貫性（UI）、操作感の統一（UX）、データ連携、および日本学術会議の公式資料「高等学校の生物教育における重要用語の選定について（2025年版）」に完全に準拠した教育的価値を担保するための「共通規格書（絶対の法律）」である。

> **【ドキュメント運用・改訂原則（ゾンビ規定の物理遮断）】**
> * 過去の改訂履歴（v25.1〜v38.1）はコンテキスト汚染を防ぐため `docs/changelog.md` へ分離保管している。本ファイルには**現在有効な最新規定のみ**を記載する。
> * 今後、仕様変更や新規定の法制化を行う際は、廃止・撤回された旧規定をそのまま残して追記するのではなく、**必ず該当箇所を最新仕様へ上書き統合（置換）し、ファイル内に新旧規定の矛盾を残さないこと**。

---

## **0. 開発基本理念（Anti-Hallucination & Zero-Modification）**

* **破壊なき進化 (Zero-Modification)**: 既存のHTML構造、CSSの基本レイアウト、D3.js等の描画・アニメーションロジック、および計算エンジンは、**指定がない限り1文字も変更してはならない**。ガイドラインに基づくUI/UXのパッチ適用（局所置換・追記）のみを厳格に行う。
* **勝手なリファクタリングの禁止**: AIによる「コードの近代化」「CSSの整理」「独自の装飾追加」など、ユーザーの明示的な指示がない改変はバグの温床となるため一切禁ずる。
* **共通エンジンへのMVC集約**: 各アプリ（View）のHTML/JSファイル内に固有の高度な数学計算（PCA、フーリエ変換、ダイアレル分析等）やデータ処理ロジックを直接記述することを禁ずる。すべての重い計算と描画用補間ロジックは、必ず共通ライブラリである `lib/bio_math_engine.js` (Model/Controller) に集約し、各アプリはそれを呼び出して描画するだけの純粋なビューワーとして設計すること。
* **教育的ハリボテ（計算の偽装）の絶対禁止**: 教育シミュレーターにおいて、スライダーやアニメーションの「滑らかさ（60fps）」を優先するあまり、裏側のロジックを固定値や簡易な二次関数ででっち上げる（偽装する）行為を固く禁ずる。UIがどうであれ、裏側では「本物の数学・確率モデル（フェルゼンスタインのアルゴリズム等）」を確実に回し、真の算出結果を生徒に提示しなければならない。
* **広域一括改修時のトークン制限回避プロトコル（Pythonスクリプト駆動ハイブリッドSOP）**: 全14アプリにまたがる共通パッチ適用や広域改修において、AIのコンテキストに全ファイルを直接読み込ませて多重編集を行うことを固く禁止する。複数ファイルの一括更新は、「Pythonスクリプト駆動型一括更新（冪等性対応）」を唯一の標準作業手順（SOP）とする。実行方式は以下の二段構えとする。
  1. **手動コピペ実行ルート（第一推奨・APIコスト完全0円）**: 司令塔が100%完成させたPythonコードをユーザーが `scripts/_patch_runner.py` にペーストし、ターミナルで `python3 scripts/_patch_runner.py` を手動実行する。推論はWeb側（Gemini）で完了しているため、ClineのAPIトークン消費は完全に0円となり、通信エラーや上位モデル誤投入のリスクもゼロとなる。
  2. **Cline無人代行ルート（半自動実行）**: 完全自動で差分検証まで完結させたい場合、Cline（Level 0: `gemini-3.6-flash`）にスクリプト作成から実行・監査までを代行させる。
  * ※いずれのルートにおいても、実行後は必ず `git diff` で差分を監査し、`python3 scripts/cleanup_audit.py --apply` で作業スクリプト `scripts/_patch_runner.py` を即時自動消去し、`scripts/` 内は常駐2ファイル（`master_compliance_audit.py` と `cleanup_audit.py`）のみのクリーン状態を維持すること（`scripts/archive/` への蓄積は廃止）。
  * **【3箇所ルールのPython強制昇格】**: 単一ファイル内であっても、修正箇所が3箇所以上に及ぶ場合はActモードの直接Diff編集を禁止し、上記Pythonスクリプト駆動型一括更新へ強制昇格させること。
* **知見・設計合意の即時法制化原則 (Constitutional Synchronization)**:
  * チャット上の議論や口頭で確立された新たなアーキテクチャ設計、AIハルシネーション防止策、およびデータ連携の仕様変更を、会話履歴や作業者の記憶の中だけにとどめておくことを固く禁ずる。
  * 新たな運用ルールや設計方針が合意された際は、実際のコード実装に着手する前に、必ず最優先で `docs/guideline.md`、`docs/workflow.md`、`docs/instruction.md`（および `.clinerules` / `CLAUDE.md`）へ明文化（法制化）し、プロジェクトの「憲法」として同期・恒久化しなければならない。
* **事前法制化の原則（Rule-First Deployment）**:
  全14アプリに及ぶ共通UI変更、データ構造変更、用語規格の更新等の大規模改修は、該当コードの改修スクリプトを走らせる前に、必ず本ガイドライン（`docs/guideline.md`）へ仕様・禁止事項を明文化して確定（コミット）させなければならない。ルール無き先行実装は一切認めない。
* **コード受領前の先行プロンプト生成禁止（Anti-Rushing Protocol）**:
  司令塔（統括アーキテクト）は、改修対象となるアプリコードの実態（または骨格・該当関数ブロック）をユーザーから受け取り、構造を精査する前にCline実装指示書（差分パッチ指示）を発行してはならない。想像によるコード指定やフライング出力を固く禁ずる。
* **改修完了後の三位一体監査（Triad Review）**:
  各アプリの実装・検証が完了した直後、司令塔は必ず「本ガイドライン（`docs/guideline.md`）」「開発フロー（`docs/workflow.md`）」「カスタム指示書（`docs/instruction.md`）」の3点について、運用のズレや新仕様の追従改変が必要かを点検し、改変案をユーザーへ提示することを義務付ける。

---

## **1. 日本学術会議（2025年版）用語・概念規格【絶対死守】**

「高等学校の生物教育における重要用語の選定について（2025年版）」に基づき、UI上のテキスト、ラベル、プレースホルダー、教育テキストは以下の基準を強制適用する。

1. **mutation と variation の厳格な区別 (PDF 注1・注4 準拠)**:
   * **mutation**: 遺伝情報（塩基配列）が変化するプロセスそのもの。語名: **突然変異** / 別名: **変異**
   * **variation**: mutationの結果として生じた、集団内における形質の違いや多様性（複数の派生型・異型がある状態）。語名: **変異** / 別名: **多様性**
   * **mutant**: 突然変異/変異によって生じた通常の形質とは異なる形質を持つ生物。語名: **突然変異体** / 別名: **変異体**
   * ※なお、`biodiversity` の訳語である「**生物多様性**」は生物の違いの豊かさや種類の多さ（diversity）を指し、`variation` とは明確に区別する。
2. **免疫系の表記 (PDF p.3〜4 準拠)**:
   * 「細胞性免疫」「液性免疫（体液性免疫）」は重要語から削除されたため優先しない。
   * 病原体に反応する **自然免疫** と、特異的な **獲得免疫（適応免疫）** の協調を最重要語として優先記述する。
3. **分類群と遺伝 (PDF p.4〜5, 注2 準拠)**:
   * 「古細菌」は現在の系統分類学的な理解と異なるため使用不可（注記2）。**アーキア** に統一する。
   * 「優性・劣性」は使用禁止。語名である **顕性**・**潜性** に完全統一する（「顕性効果」「顕性分散」等も同様）。
4. **対象分子・配列の表記**:
   * 「1D配列」「Sequence」等のIT用語はUI上で使用禁止。
   * 総称としての「核酸」で濁さず、対象が明確な場合は **DNA**、**mRNA**、**タンパク質** と記述する。
   * 配列は **塩基配列**、**アミノ酸配列** と表記する。
   * **※例外事項**: ヘッダーの英語サブタイトル、学術クレジット（References）における原著論文名、およびプログラム内部の変数名・APIパラメーターにおける `Sequence` 等の使用は適用外（許容）とする。
5. **漢字・平仮名表記の規定 (PDF p.5 準拠)**:
   * 学習指導要領や教科書での表記を優先し、常用漢字外の語については平仮名表記を語名とする。
   * 例: UIテキストやラベルにおいて「血漿」→ **血しょう**、「攪乱」→ **かく乱**、「胚囊」→ **胚のう** と記述すること。難解な漢字を強制してはならない。
6. **同義語・別名の扱い (PDF p.4〜5 準拠)**:
   * 免疫系: 「T細胞 / B細胞」は「Tリンパ球 / Bリンパ球」の別名でも広く知られているため使用可とするが、アプリ内では表記を統一すること。
   * 遺伝・細胞・生態: 「**複製** (DNA複製)」「**細胞質基質** (サイトゾル)」「**調節タンパク質** (転写調節因子/転写因子/転写制御因子)」「**アレル** (対立遺伝子)」「**遺伝子座** (座/座位)」「**遺伝子頻度** (アレル頻度/対立遺伝子頻度)」「**個体群** (集団)」「**生息場所** (ハビタット)」「**バイオマス** (現存量/生物量)」などは、原則としてPDFの語名を優先し、必要に応じて括弧書きで別名を補足する。

---

## **2. アイコン(SVG)およびタイポグラフィ規格**

* **絵文字の完全廃止**: HTML内のテキスト、ブラウザのタブ（`<title>`）、ヘッダー（`<h1>`）等、すべての場所において装飾目的のネイティブ絵文字（🧬、📊など）の使用を**一切禁止（全廃）**とする。
* **インラインSVGへの完全移行**: 機能や意味を示す視覚要素は、外部フォントを使わず、親要素に同期する（`stroke="currentColor"` 等）シャープな「インラインSVG線画アイコン」に完全に置き換える。
* **ヘッダーSVGの寸法固定**: ヘッダー内のSVGが親要素の影響で巨大化・変形するのを防ぐため、`.header-icon` には必ず絶対寸法指定（`width: 24px; height: 24px; flex-shrink: 0;`）を適用する。

### **【システム標準インラインSVGの役割とカラー定義】**

SVG要素には必ず `stroke="currentColor"` を指定し、親要素またはSVG自体に以下のクラスを付与する。

```css
/* インラインSVGアイコン用 共通カラークラス */
.svg-hint { color: var(--warning); }   /* 💡 気づき・推奨用 (#f39c12) */
.svg-info { color: inherit; }          /* ℹ️ 情報・ルール用 (親要素のテキスト色を継承し自然に同化) */
.svg-danger { color: var(--danger); }  /* 🚨 警告・エラー用 (#e74c3c) */
.header-icon { width: 24px; height: 24px; flex-shrink: 0; }

```

**① 💡（ライトバルブ）相当のSVG: 「気づき」と「推奨ノウハウ」**

* **適用クラス**: `.svg-hint`（`var(--warning)` 暖色系オレンジ） / **使用場面**: `.bench-tip`（現場のコツ）のタイトル部分など。
* **使用SVG**:
`<svg class="svg-hint" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1.45.62 2.84 1.5 3.5.76.76 1.23 1.52 1.41 2.5"/></svg>`

**② ℹ️（インフォメーション）相当のSVG: 「仕様・ルール・通知」**

* **適用クラス**: `.svg-info`（親要素のテキストカラーに同期） / **使用場面**: アシストパネル内の補足テキストなど。
* **使用SVG**:
`<svg class="svg-info" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`

**③ アクション・操作用 SVGの完全固定化（セマンティクス厳格分離）**

* **[実行] ボタン (▶︎)**:
`<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`
* **[データ読込 / ドラッグ＆ドロップ] エリア（ドキュメント＋矢印型）**: 配列データやFASTAファイル、LIMSデータのインポート用途に厳格に固定。
`<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>`
* **[コピー] ボタン (Copy / 二重シート型)**: クリップボードへのデータ書き出し（テキスト・配列コピー）専用に固定。他の用途への流用を禁止。
`<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`
* **[保存 / ダウンロード] ボタン (Save / フロッピー型)**: ローカルファイル保存・エクスポート（FASTA、CSV、TSV、Newick、JSON、画像保存）専用に固定。
`<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>`

**④ 各Phase公式ヘッダー＆ナビゲーションSVG**

* **PHASE 1 (ダッシュボード)**:
`<svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`
* **PHASE 2 (Wet-Lab / 分子生物学的処理)**:
`<svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M8 3c0 4.5 8 4.5 8 9s-8 4.5-8 9"/><path d="M16 3c0 4.5-8 4.5-8 9s8 4.5 8 9"/><path d="M10 7.5h4M10 16.5h4"/></svg>`
* **PHASE 3 (Dry-Lab / 系統・形態解析)**:
`<svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 21h18L3 3z"/><path d="M7 21v-2M11 21v-2M15 21v-2"/></svg>`
* **PHASE 4 (統合検証ルーム)**:
`<svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3v18M8 21h8M4 7h16"/><path d="M4 7l-2 5h4z"/><path d="M20 7l-2 5h4z"/></svg>`
* **PHASE 5 (統計遺伝学ラボ)**:
`<svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 21h18"/><path d="M7 21V10M12 21V4M17 21V14"/></svg>`
* **PHASE 6 (分子構造・セントラルドグマ / 六角形)**:
`<svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`
* **EXTRA (Lab Packs用・アーカイブ型)**:
`<svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="4" width="18" height="4" rx="2" ry="2"/><path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>`

---

## **3. テーマカラー規格 (CSS Variables)**

各アプリの `:root` に以下の変数を必ず定義すること。

```css
:root {
  /* 【共通】ベースカラー・ステータスカラー */
  --primary: #2c3e50;      /* ダークネイビー (主要テキスト・ドロワー背景) */
  --secondary: #34495e;    /* ネイビー (サブヘッダー) */
  --bg-color: #f0f3f4;     /* ライトグレー (全体背景) */
  --card-bg: #ffffff;      /* ホワイト (カード背景) */
  --text-main: #2c3e50;    /* メインテキスト */
  --text-muted: #7f8c8d;   /* 補足テキスト */
  --border-color: #bdc3c7; /* ボーダー */
  --success: #27ae60;      /* 成功・保存 */
  --danger: #e74c3c;       /* エラー・警告・破壊的アクション */
  --warning: #f39c12;      /* ヒント・教育ポップオーバー */

  /* 【アプリ個別】フェーズカラー (--phase-color) の設定 */
  /* Phase 1 & 2: #1abc9c, Phase 3: #3498db, Phase 4: #8e44ad, Phase 5: #e74c3c, Phase 6: #e67e22, Extra: #f1c40f */
}

```

---

## **4. ボタン・カラー意味論（トーン＆マナー規定）**

ボタンやアイコンの配色は「機能と結果（ユーザーの心理的安全性）」に基づいて以下の5つのルールに厳格に分類・統一する。

1. 🟦 **Primary（青色系 / `#3498db` 等）＝「前進・主要アクション」**
* **役割**: その画面における標準的な操作や、次のステップへ進むためのメインアクション。
* **適用例**: `[検索]` `[解析を実行]` `[次へ]` `[アライメント開始]`


2. 🟩 **Success（緑色系 / `var(--success)` / `#27ae60`）＝「完了・保存・出力」**
* **役割**: 作業のゴール（最終成果物・ファイル保存）を得るためのポジティブなアクション。
* **適用例**: `[FASTA保存]` `[CSV保存]` `[PDFダウンロード]` `[結果を出力]`


3. 🟥 **Danger（赤色系 / `var(--danger)` / `#e74c3c`）＝「破壊・削除・警告」**
* **役割**: データが失われる、元に戻せない、またはデータの一部を切り捨てるような危険・注意を伴うアクション。
* **適用例**: `[削除]` `[初期化]` 手動カット（テキストやアイコンのアクセントとして）


4. 🩵 **Theme / Info（テーマカラー / `var(--phase-color)` 等）＝「案内・教育的ヘルプ」**
* **役割**: 各Phaseのアイデンティティを示す色、または操作に影響を与えない「説明・学び」を引き出すアクション。
* **適用例**: `[?]` ボタン、現場のコツの枠線、ヘッダーライン


5. ⬜ **Secondary（白・グレー系 / `#fdfefe` 等）＝「補助・キャンセル・サブアクション」**
* **役割**: メインアクションの横に置かれる控えめな操作、およびクリップボードへのコピー操作。
* **適用例**: `[クリア]` `[FASTAコピー]` `[Newickコピー]` `[キャンセル]`



---

## **5. 共通レイアウトと「グローバル・ドロワー（Peg Menu）」規格**

1. **別タブ遷移と戻るボタンの徹底排除**: スイート全体を一つのエコシステムとして統合するため、アプリを別タブで開く仕様（`target="_blank"`）を全廃する（外部Googleフォーム等を除く）。各アプリへの移動はすべて同一タブ内で画面左のドロワーを介して行い、アプリ内に独自の「戻る」ボタンを設置することは固く禁ずる。
2. **外箱（HTML構造）の全アプリ共通化**: ダッシュボードを含め、すべてのアプリでヘッダー・ドロワー・フッターのDOM構造を完全に統一する。表示・挙動の切り替えは `<body class="dashboard-mode">` または `<body class="app-mode">` のクラス制御のみで行う。
3. **二重ヘッダー・フッターの全廃**: ドロワー内部にあった簡易ヘッダーおよびフッター表記は全廃し、画面全体の「グローバルヘッダー」「グローバルフッター」「左端ドロワー」のみに一本化する。
4. **ヘッダー右側スロット（`.header-right`）の統一**:
* 「アカウント・同期設定（`#accountBtn`）」の統合ボタン1つのみを配置し、ルーム接続・クラウド保存/復元・課題発行/読込はすべてモーダル（`#accountModal`）内で完結させる。スマホ表示時（768px以下）はテキストを隠しアイコンのみに縮小する。
* グローバルヘッダー内に `[?]` ボタン（`.rationale-btn`）や `.version-badge` を配置することは固く禁ずる（バージョン表記はフッターへ集約）。



### **【グローバル・ドロワー (Peg Menu) のUI/UX絶対仕様】**

1. **構造とフルードレイアウト**: 画面全体を `<div class="sidebar">` と `<div class="main-wrapper">` に二分する。PC環境（1025px以上）では `main-wrapper` に左余白（60px）を確保し、ヘッダーは `max-width` 制限を撤廃して画面両端に吸い付く100%幅（フルードレイアウト）とする。
2. **ハンバーガーアイコンの状態管理と配色**:
* ハンバーガーボタン（`.hamburger-btn`）はドロワー最上部の右端（`.sidebar-header` 内）に配置する。
* **ホバーではアイコンを切り替えない**。未固定（デフォルト）および `.sidebar:hover` ではいずれも「≡（`.icon-menu`）」を維持し、**ピン留め固定時（`.sidebar.pinned`）とモバイル展開時（`.sidebar.open`）のみ「×（`.icon-close`）」へ切り替える**。
* ホバー時（`.hamburger-btn:hover`）は背景のみを変化させ（`background: rgba(255, 255, 255, 0.1);`）、テキスト・アイコン色は白（`#fff`）を維持する（フェーズカラーに変色させない）。


3. **アイコン縦センターライン（30px統一）**:
* サイドバー閉鎖時（幅60px）において、ハンバーガー・ナビアイテム・最下部アクションの全アイコンの中心を **左端から30px（サイドバー中央）** に厳密に揃える。
* `.hamburger-btn` は `padding: 6px`（アイコン24px、右余白12px → 中心30px）、`.nav-item` は常時 `border-left: 4px solid transparent; padding-left: 16px;`（アイコン20px → 中心30px）、`.sidebar-action-btn` は `padding: 12px 20px`（アイコン20px → 中心30px）とする。


4. **区切り線のカラーと開閉連動**:
* `.nav-header` および `.sidebar-footer-actions` の上枠線（区切り線）は、フェーズカラーではなく**共通の薄い灰色 `rgba(255, 255, 255, 0.05)` のみ**とする。
* 閉鎖時（幅60px）は `border-top-color: transparent` として区切り線を隠し、展開時（`:hover` / `.pinned` / `.open`）のみ表示する。先頭見出し（`.nav-header.p1` / `:first-child`）は区切り線を持たない（`border-top: none`）。


5. **ブレイクポイント（1024px境界）**:
* **PC表示（`min-width: 1025px`）**: 60px幅の付箋（Sticky）UIとし、ホバーまたはピン留めで `280px` に展開する。ナビテキストには必ずアプリ番号（①〜⑭）を明記する。
* **タブレット縦表示・スマホ表示（`max-width: 1024px`）**: 60pxのチラ見せを禁止し、ドロワーを画面外（`left: -280px`）へ完全隠蔽する。開閉はヘッダー左端の `.mobile-hamburger` によるトグル操作で行う。



```css
/* ---------------------------------------------------
   共通ヘッダー＆グローバル・ドロワー (Peg Menu) 完成形CSS
--------------------------------------------------- */
* { box-sizing: border-box; }
body, .card, p, div, .bench-tip, .step-up-card, .rationale-text, .assist-panel, .dynamic-hint {
    word-break: normal; overflow-wrap: anywhere; line-height: 1.6;
}
.label-title, .no-wrap { white-space: nowrap; }

body { display: flex; margin: 0; overflow: hidden; background-color: var(--bg-color); }
.main-wrapper {
    flex: 1; margin-left: 60px; display: flex; flex-direction: column;
    height: 100dvh; max-height: 100dvh; overflow-y: auto; overflow-x: hidden;
    position: relative; width: 100%; box-sizing: border-box;
    transition: margin-left 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}
.card, .sample-thumbnail { will-change: transform; backface-visibility: hidden; }

/* グローバルヘッダー (フルード・左右両端寄せ) */
.header-container {
    width: 100%; background: #1a252f; border-bottom: 4px solid var(--phase-color);
    z-index: 30; box-shadow: 0 2px 10px rgba(0,0,0,0.15); flex-shrink: 0;
    padding-top: env(safe-area-inset-top, 0px);
}
.header {
    width: 100%; margin: 0; padding: 12px 24px; box-sizing: border-box;
    display: flex; align-items: center; justify-content: space-between;
}
.header-left { display: flex; align-items: center; gap: 12px; flex: 1; justify-content: flex-start; }
.header h1 { margin: 0; font-size: 20px; font-weight: 700; color: #fff; white-space: nowrap; display: flex; align-items: center; gap: 8px; }
.header p { margin: 4px 0 0 0; font-size: 11px; color: var(--phase-color); font-weight: 600; }
.header-right { display: flex; justify-content: flex-end; }
.header-right .btn-primary, .header-right .account-btn {
    display: flex; align-items: center; gap: 6px; padding: 6px 16px;
    font-size: 12px; border-radius: 20px; white-space: nowrap;
}
@media (max-width: 768px) {
    .header-right .btn-text { display: none; }
    .header-right .btn-primary, .header-right .account-btn {
        padding: 8px; border-radius: 50%; width: 36px; height: 36px; justify-content: center; font-size: 16px;
    }
}

/* ドロワー本体 */
.sidebar {
    position: fixed; top: 0; left: 0; bottom: 0; width: 60px;
    background-color: var(--primary); color: white; display: flex; flex-direction: column;
    z-index: 1002; transition: width 0.4s cubic-bezier(0.25, 1, 0.5, 1), left 0.4s cubic-bezier(0.25, 1, 0.5, 1);
    box-shadow: 4px 0 15px rgba(0,0,0,0.1); overflow-x: hidden;
    scrollbar-width: none; -ms-overflow-style: none;
    padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px);
}
.sidebar::-webkit-scrollbar { display: none; }

/* サイドバーヘッダー＆ハンバーガー (中心30px統一・ホバー時文字色白維持) */
.sidebar-header {
    height: 60px; display: flex; align-items: center; justify-content: flex-end; padding-right: 12px;
    border-bottom: 1px solid rgba(255,255,255,0.05); flex-shrink: 0;
}
.sidebar .hamburger-btn {
    background: transparent; border: none; color: #fff; cursor: pointer; padding: 6px;
    display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: background 0.2s;
}
.sidebar .hamburger-btn:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }

/* ハンバーガーアイコン切替: 未固定・ホバー時は ≡ を維持し、pinned / open 時のみ × へ */
.sidebar .hamburger-btn .icon-menu { display: block; color: inherit; }
.sidebar .hamburger-btn .icon-close { display: none; color: inherit; }
.sidebar:hover .hamburger-btn .icon-menu { display: block; }
.sidebar:hover .hamburger-btn .icon-close { display: none; }
.sidebar.pinned .hamburger-btn .icon-menu, .sidebar.open .hamburger-btn .icon-menu { display: none; }
.sidebar.pinned .hamburger-btn .icon-close, .sidebar.open .hamburger-btn .icon-close { display: block; }

/* モバイル・タブレット縦用ヘッダーハンバーガー */
.mobile-hamburger {
    display: none; background: transparent; border: none; color: #fff;
    cursor: pointer; padding: 4px; border-radius: 4px; margin-left: -8px;
}
.mobile-hamburger:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }

/* ナビメニュー＆区切り線連動 */
.nav-menu { flex: 1; padding: 15px 0; overflow-y: auto; overflow-x: hidden; scrollbar-width: none; -ms-overflow-style: none; }
.nav-menu::-webkit-scrollbar { display: none; }
.nav-header {
    font-size: 11px; font-weight: bold; color: var(--phase-color); padding: 15px 20px 5px;
    text-transform: uppercase; letter-spacing: 1px; white-space: nowrap; opacity: 0;
    border-top: 1px solid transparent; transition: opacity 0.3s, border-top-color 0.25s ease;
}
.sidebar:hover .nav-header, .sidebar.pinned .nav-header, .sidebar.open .nav-header { opacity: 1; }
.sidebar .nav-menu .nav-header, .sidebar .sidebar-footer-actions {
    border-top: 1px solid transparent; transition: border-top-color 0.25s ease;
}
.sidebar:hover .nav-menu .nav-header, .sidebar.pinned .nav-menu .nav-header, .sidebar.open .nav-menu .nav-header,
.sidebar:hover .sidebar-footer-actions, .sidebar.pinned .sidebar-footer-actions, .sidebar.open .sidebar-footer-actions {
    border-top-color: rgba(255, 255, 255, 0.05);
}
.sidebar .nav-menu .nav-header.p1, .sidebar .nav-menu .nav-header:first-child { border-top: none; }

/* ナビアイテム (透明左枠線4px＋左余白16pxでアイコン中心30px統一) */
.sidebar .nav-menu .nav-item {
    padding: 12px 20px 12px 16px; border-left: 4px solid transparent;
    display: flex; align-items: center; gap: 15px; width: 100%; box-sizing: border-box;
    color: #bdc3c7; text-decoration: none; font-size: 13px; transition: 0.2s; white-space: nowrap;
}
.nav-item svg { width: 20px; height: 20px; flex-shrink: 0; }
.nav-text, .sidebar-action-text { opacity: 0; transition: opacity 0.3s cubic-bezier(0.25, 1, 0.5, 1); }
.sidebar:hover .nav-text, .sidebar.pinned .nav-text, .sidebar.open .nav-text,
.sidebar:hover .sidebar-action-text, .sidebar.pinned .sidebar-action-text, .sidebar.open .sidebar-action-text { opacity: 1; }
.nav-item:hover { background-color: rgba(255,255,255,0.05); color: white; }
.nav-item.active { border-left: 4px solid var(--phase-color); padding-left: 16px; color: white; background-color: rgba(255,255,255,0.05); font-weight: bold; }

/* 各フェーズのテーマカラー同期 */
.nav-header.p1, .nav-header.p2 { color: #1abc9c; }
.nav-item.p1:hover, .nav-item.p1.active, .nav-item.p2:hover, .nav-item.p2.active { color: #1abc9c; border-left-color: #1abc9c; background-color: rgba(255,255,255,0.05); font-weight: bold; }
.nav-header.p3 { color: #3498db; }
.nav-item.p3:hover, .nav-item.p3.active { color: #3498db; border-left-color: #3498db; background-color: rgba(255,255,255,0.05); font-weight: bold; }
.nav-header.p4 { color: #8e44ad; }
.nav-item.p4:hover, .nav-item.p4.active { color: #8e44ad; border-left-color: #8e44ad; background-color: rgba(255,255,255,0.05); font-weight: bold; }
.nav-header.p5 { color: #e74c3c; }
.nav-item.p5:hover, .nav-item.p5.active { color: #e74c3c; border-left-color: #e74c3c; background-color: rgba(255,255,255,0.05); font-weight: bold; }
.nav-header.p6 { color: #e67e22; }
.nav-item.p6:hover, .nav-item.p6.active { color: #e67e22; border-left-color: #e67e22; background-color: rgba(255,255,255,0.05); font-weight: bold; }
.nav-header.extra { color: #f1c40f; }
.nav-item.extra:hover, .nav-item.extra.active { color: #f1c40f; border-left-color: #f1c40f; background-color: rgba(255,255,255,0.05); font-weight: bold; }

/* ドロワー最下部アクション (padding 12px 20px でアイコン中心30px統一) */
.sidebar-footer-actions { padding: 10px 0; }
.sidebar-action-btn {
    display: flex; align-items: center; width: 100%; box-sizing: border-box;
    gap: 15px; padding: 12px 20px; background: transparent; border: none;
    color: #bdc3c7; cursor: pointer; text-align: left; transition: 0.2s; font-size: 13px; white-space: nowrap;
}
.sidebar-action-btn svg { width: 20px; height: 20px; flex-shrink: 0; }
.sidebar-action-btn:hover { background: rgba(255,255,255,0.05); color: #fff; }
.sidebar-action-btn.danger:hover { color: var(--danger); }

/* ブレイクポイント制御 (1025px以上: PCホバー・ピン留め / 1024px以下: 完全隠蔽＆ヘッダートグル) */
@media (min-width: 1025px) {
    .sidebar:hover, .sidebar.pinned { width: 280px; }
    .mobile-hamburger { display: none; }
}
@media (max-width: 1024px) {
    .sidebar { left: -280px; width: 280px; }
    .sidebar.open { left: 0; }
    .main-wrapper { margin-left: 0; padding-left: 0; }
    .sidebar-header { display: none; }
    .mobile-hamburger { display: flex; align-items: center; justify-content: center; }
}

/* 共通フッター (.footer) */
.footer {
    width: 100%; background: #1a252f;
    padding: 15px 20px calc(15px + env(safe-area-inset-bottom, 0px)) 20px;
    text-align: center; font-size: 11px; color: #7f8c8d; letter-spacing: 1px;
    margin-top: auto; border-top: 1px solid #2c3e50; flex-shrink: 0;
}

```

```javascript
/* ---------------------------------------------------
   JS実装規格: ドロワー制御
--------------------------------------------------- */
function toggleSidebarPin() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const isMobile = window.innerWidth <= 1024;

    if (!isMobile) {
        sidebar.classList.toggle('pinned');
        const isPinned = sidebar.classList.contains('pinned');
        document.body.classList.toggle('has-pinned-sidebar', isPinned);
        localStorage.setItem('bio_edu_sidebar_pinned', isPinned);
    } else {
        sidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('open', sidebar.classList.contains('open'));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const isMobile = window.innerWidth <= 1024;
    if (!isMobile && localStorage.getItem('bio_edu_sidebar_pinned') === 'true') {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.add('pinned');
            document.body.classList.add('has-pinned-sidebar');
        }
    }
});

function openFeedbackForm() {
    const baseUrl = "[https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform](https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform)";
    const appName = document.title;
    window.open(`${baseUrl}?entry.12345678=${encodeURIComponent(appName)}`, '_blank');
}

```

### **【マスターテンプレート】外箱HTML構造（全アプリ共通）**

全アプリでUIを完全に一致させるため、`<body>` 直下のHTML構造は以下のコードを**一字一句改変せずにそのまま使用すること**（アプリ名、Phase番号、固有SVG、`.nav-menu` 内の `.active` クラスのみ各アプリに合わせて設定する）。

```html
<!-- 1. ドロワー用オーバーレイ -->
<div class="sidebar-overlay" onclick="toggleSidebarPin(); triggerHapticFeedback();"></div>

<!-- 2. グローバル・ドロワー (Peg Menu) -->
<div class="sidebar">
  <div class="sidebar-header">
    <button class="hamburger-btn" onclick="toggleSidebarPin(); triggerHapticFeedback();" aria-label="メニューを開く/閉じる">
      <!-- ≡ アイコン -->
      <svg class="icon-menu" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      <!-- × アイコン -->
      <svg class="icon-close" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
  </div>

  <div class="nav-menu">
    <!-- ※ここに各Phase見出し（.nav-header.p1〜.extra）と各アプリへのリンク（.nav-item）を配置 -->
  </div>

  <!-- ドロワー最下部アクション（ご意見箱 ＆ データ初期化パネル） -->
  <div class="sidebar-footer-actions">
    <button class="sidebar-action-btn" onclick="openFeedbackForm(); triggerHapticFeedback();">
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      <span class="sidebar-action-text">ご意見・フィードバック</span>
    </button>
    <button class="sidebar-action-btn danger" onclick="confirmDataReset(); triggerHapticFeedback();">
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      <span class="sidebar-action-text">データを初期化</span>
    </button>
  </div>
</div>

<!-- 3. メインコンテンツラッパー -->
<div class="main-wrapper">

  <!-- グローバルヘッダー -->
  <div class="header-container">
    <div class="header">
      <div class="header-left">
        <!-- タブレット縦・スマホ用ヘッダーハンバーガー -->
        <button class="mobile-hamburger" onclick="toggleSidebarPin(); triggerHapticFeedback();" aria-label="メニューを開く">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>

        <div class="header-title-group">
          <h1>
            <!-- ※ここに各Phaseの公式SVGを配置 -->
            <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">...</svg>
            アプリ名をここに記述
          </h1>
          <p>Bio-Edu Suite: Phase X / サブタイトル</p>
        </div>
      </div>

      <!-- ヘッダー右側（ルーム・同期設定統合ボタン） -->
      <div class="header-right">
        <button id="accountBtn" class="account-btn" onclick="openAccountSettings(); triggerHapticFeedback();" data-tooltip="ルーム・同期設定">
          <svg id="accountUserIcon" class="account-user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span id="accountStatusText" class="btn-text" style="font-size: 13px; font-weight: bold; color: #bdc3c7;">ローカル保存中</span>
        </button>
      </div>
    </div>
  </div>

  <!-- コンテンツエリア -->
  <div class="content-area">
    <!-- ※ここに各アプリの機能（パネルや結果エリア等）を記述 -->
  </div>

  <!-- ダークテーマ・フッター規格 -->
  <div class="footer">
    &copy; 2026 Bio-Edu Suite v38.2 | Developed for Bioinformatics &amp; Wet-Lab Education
  </div>

</div>

```

---

## **6. 教育的UIモジュールの完全標準化 (CSS/JS仕様) 【最重要】**

### **① 根拠 (Rationale ポップオーバー)**

* マウスホバー (`:hover`) はタッチデバイスで機能しないため**使用禁止**。必ずクリック駆動とし、見切れ防止のフリップ計算と、要素の幅（`offsetWidth`）を用いた親要素追従の安全な計算ロジック（固定幅廃止）を実装すること。吹き出しの「尻尾」をCSSで描画する。
* **【ポップオーバー内マークアップ規格】**:
* **見出しの記述と装飾**: ポップオーバー内の見出し（小見出し含む）は、必ず `<strong>` タグを使用し、テキストを「【】（隅付き括弧）」で括って記述すること（例: `<strong>【根拠：〇〇】</strong>`、`<strong>【注意：〇〇】</strong>`）。CSSによりアクセントのオレンジ（`#d35400` / 12px / `display: block; margin-bottom: 4px;`）が自動適用されるため、**見出し直後に不要な `<br>` タグや空行を挿入してはならない**。
* **インライン強調の制限**: 箇条書きの項目内や文中のインライン強調には `<strong>` を使用してはならず（ブロック要素化による不自然な改行を防ぐため）、必ず **`<b>` タグ**を使用すること。
* **箇条書きのルール**: 複数の項目を列挙する場合は、UIの操作手順（丸数字 ①② 等）との混同を避けるため、必ず「・（中黒）」を用いて箇条書きにすること。



```css
/* CSS実装: 根拠 (Rationale) */
.rationale-btn { background: var(--phase-color); color: white; border-radius: 50%; width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; cursor: pointer; margin-left: 5px; border: none; font-weight: bold; transition: 0.2s; flex-shrink: 0; }
.rationale-btn:hover { transform: scale(1.1); filter: brightness(1.2); }

.rationale-text { position: fixed; background: #fef9e7; border: 1px solid var(--warning); padding: 12px; border-radius: 6px; font-size: 11px; color: #7e5109; line-height: 1.5; box-shadow: 0 4px 15px rgba(0,0,0,0.2); z-index: 9000; width: max-content; max-width: min(320px, calc(100vw - 24px)); opacity: 0; visibility: hidden; transition: opacity 0.2s, transform 0.2s; transform: translateY(-10px); margin: 0; pointer-events: none; box-sizing: border-box; }
.rationale-text.show { opacity: 1; visibility: visible; transform: translateY(0); pointer-events: auto; }
.rationale-text strong { color: #d35400; display: block; margin-bottom: 4px; font-size: 12px; }

/* 吹き出しの尻尾 (三角形) */
.rationale-text::after { content: ''; position: absolute; border-width: 6px; border-style: solid; left: var(--arrow-left, 50%); }
.rationale-text.arrow-top::after { top: -12px; border-color: transparent transparent #fef9e7 transparent; }
.rationale-text.arrow-bottom::after { bottom: -12px; border-color: #fef9e7 transparent transparent transparent; }
.rationale-text::before { content: ''; position: absolute; border-width: 7px; border-style: solid; left: calc(var(--arrow-left, 50%) - 1px); }
.rationale-text.arrow-top::before { top: -14px; border-color: transparent transparent var(--warning) transparent; }
.rationale-text.arrow-bottom::before { bottom: -14px; border-color: var(--warning) transparent transparent transparent; }

```

```javascript
// JS実装: 動的幅算出・フリップ計算付き表示ロジック
function toggleRationale(event, id) {
  event.stopPropagation();
  const el = document.getElementById(id);
  const btn = event.currentTarget;
  const isShown = el.classList.contains('show');

  document.querySelectorAll('.rationale-text').forEach(e => {
    e.classList.remove('show', 'arrow-top', 'arrow-bottom');
  });

  if (!isShown) {
    if (el.parentNode !== document.body) document.body.appendChild(el);
    el.style.top = '0px'; el.style.left = '0px';
    el.classList.add('show');

    const elHeight = el.offsetHeight;
    const elWidth = el.offsetWidth;
    const rect = btn.getBoundingClientRect();

    let topPos = rect.bottom + 12;
    let arrowClass = 'arrow-top';

    if (rect.bottom + elHeight + 20 > window.innerHeight) {
      topPos = rect.top - elHeight - 12;
      arrowClass = 'arrow-bottom';
    }
    el.classList.add(arrowClass);
    el.style.top = topPos + 'px';

    let leftPos = rect.left - (elWidth / 2) + (rect.width / 2);
    if (leftPos + elWidth > window.innerWidth) leftPos = window.innerWidth - elWidth - 10;
    if (leftPos < 10) leftPos = 10;
    el.style.left = leftPos + 'px';

    const arrowOffset = rect.left - leftPos + (rect.width / 2) - 6;
    el.style.setProperty('--arrow-left', arrowOffset + 'px');
  }
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.rationale-text') && !e.target.closest('.rationale-btn')) {
    document.querySelectorAll('.rationale-text').forEach(el => {
      el.classList.remove('show', 'arrow-top', 'arrow-bottom');
    });
  }
});

document.addEventListener('scroll', () => {
  document.querySelectorAll('.rationale-text').forEach(el => {
    el.classList.remove('show', 'arrow-top', 'arrow-bottom');
  });
}, true);

```

### **② 現場のコツ (Bench Tip) の専用デザイン化**

左側に青いアクセントライン（`border-left: 4px solid #3498db`）を持つデザインは、この「現場のコツ（`.bench-tip`）」のみの専用デザインとして定義する。見出しアイコンにはインラインSVG（`.svg-hint`）を使用すること。

```css
/* CSS実装: 現場のコツ (専用デザイン) */
.bench-tip { background: #f0f8ff; border-left: 4px solid #3498db; padding: 12px 15px; border-radius: 0 4px 4px 0; font-size: 12px; color: var(--text-main); line-height: 1.6; margin: 15px 0; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
.bench-tip strong { color: #2980b9; display: flex; align-items: center; gap: 6px; margin-bottom: 4px; font-size: 13px; }

```

### **③ アシストパネル (行動ガードレール)**

データの不足や生物学的なエラーが生じた際に表示する警告パネルの統一レイアウト。

```css
/* CSS実装: アシストパネル */
.assist-panel { background: #fadbd8; border-left: 4px solid var(--danger); padding: 15px; margin-top: 15px; border-radius: 4px; }
.assist-title { font-weight: bold; color: #c0392b; display: flex; align-items: center; gap: 5px; font-size: 14px; }
.assist-reason { font-size: 13px; color: #7f8c8d; margin-top: 5px; }
.assist-fix { font-size: 13px; color: var(--primary); font-weight: bold; margin-top: 8px; background: #fff; padding: 10px; border-radius: 4px; border: 1px solid var(--danger); }

```

### **④ カスタムツールチップ (`data-tooltip`)**

* **`title` 属性の全廃**: HTML内の全 `title="..."` 属性を削除し、`data-tooltip` へ完全に移行すること。
* **【`white-space` 規定】**: 日本語長文に対応するため `white-space: nowrap` は使用せず、`white-space: normal` と `width: max-content; max-width: min(320px, 90vw);` を併用して折り返させること。

```css
/* CSS実装: ツールチップ */
.custom-tooltip { position: fixed; top: 0; left: 0; background: rgba(44, 62, 80, 0.95); color: #fff; padding: 6px 10px; border-radius: 4px; font-size: 11px; pointer-events: none; z-index: 9999; opacity: 0; transition: opacity 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.2); font-weight: normal; line-height: 1.4; display: none; white-space: normal; width: max-content; max-width: min(320px, 90vw); text-align: center; box-sizing: border-box; }
.custom-tooltip::after { content: ''; position: absolute; border-width: 5px; border-style: solid; left: 50%; transform: translateX(-50%); }
.custom-tooltip.show-top::after { top: 100%; border-color: rgba(44, 62, 80, 0.95) transparent transparent transparent; }
.custom-tooltip.show-bottom::after { bottom: 100%; border-color: transparent transparent rgba(44, 62, 80, 0.95) transparent; }

```

```javascript
// JS実装: ツールチップ初期化ロジック
function initTooltips() {
  const tooltip = document.createElement('div');
  tooltip.className = 'custom-tooltip';
  document.body.appendChild(tooltip);

  document.body.addEventListener('mouseover', (e) => {
    const target = e.target.closest('[data-tooltip]');
    if (target && !target.classList.contains('rationale-btn')) {
      tooltip.innerHTML = target.getAttribute('data-tooltip');
      tooltip.style.display = 'block';
      const rect = target.getBoundingClientRect();
      const ttRect = tooltip.getBoundingClientRect();
      let topPos = rect.top - ttRect.height - 8;
      let leftPos = rect.left + (rect.width / 2);
      let arrowClass = 'show-top';
      if (topPos < 0) { topPos = rect.bottom + 8; arrowClass = 'show-bottom'; }
      if (leftPos - ttRect.width / 2 < 5) leftPos = 5 + ttRect.width / 2;
      else if (leftPos + ttRect.width / 2 > window.innerWidth - 5) leftPos = window.innerWidth - ttRect.width / 2 - 5;
      tooltip.className = `custom-tooltip ${arrowClass}`;
      tooltip.style.top = topPos + 'px';
      tooltip.style.left = leftPos + 'px';
      tooltip.style.transform = 'translateX(-50%)';
      tooltip.style.opacity = '1';
    }
  });
  document.body.addEventListener('mouseout', (e) => {
    if (e.target.closest('[data-tooltip]')) {
      tooltip.style.opacity = '0';
      setTimeout(() => { if (tooltip.style.opacity === '0') tooltip.style.display = 'none'; }, 200);
    }
  });
}

```

### **⑤ トースト通知 (ネイティブAlert全廃)**

`alert()` は使用禁止。全アプリ共通で以下のトーストUIを使用する。

```css
/* CSS実装: トースト通知 */
#toast { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(100px); background: var(--success); color: white; padding: 12px 24px; border-radius: 30px; font-weight: bold; font-size: 13px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); opacity: 0; transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55); z-index: 100000; pointer-events: none; text-align: center; max-width: 90vw; box-sizing: border-box; word-break: auto-phrase; }
#toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
#toast.error { background: var(--danger); }
#toast.warning { background: var(--warning); color: #7e5109; }
#toast.info { background: var(--phase-color); }

```

### **⑥ 動的ヒント (Dynamic Hint) のフラットデザイン化とプレーンテキスト化**

JSによって動的に生成されるシステム通知や仕様の警告（`.dynamic-hint`）は、赤枠のフラットデザインへ統一し、HTML上のインラインスタイルおよびJSからの絵文字・SVGアイコンの挿入を**一切禁止**する（プレーンテキストのみ）。

```css
.dynamic-hint {
  background: #fdf2f2;
  border: 1px solid #f8d7da;
  color: #721c24;
  padding: 10px 12px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 11px;
  text-align: left;
}

```

### **⑦ より高度な解析ツールへ枠 (`.step-up-card`) のUI共通化**

* **配置規定**: 必ずアプリの `.main-content`（または `.content-area`）内の「一番最後（Referencesの直前）」に配置すること。
* 題名（`<h3>` タグ内）のテキストは **「より高度な解析ツールへ」** に厳格に固定・統一し、SVGアイコンも全アプリで共通とする。

```css
/* CSS実装: より高度な解析ツールへ枠 (.step-up-card) */
.step-up-card { background: #f8f9fa; border: 1px solid #d1d5db; padding: 20px; border-radius: 8px; margin-top: 25px; color: #2c3e50; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
.step-up-card h3 { color: #2c3e50; margin-top: 0; font-size: 15px; display: flex; align-items: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 12px; }
.step-up-card h3 svg { margin-right: 8px; width: 20px; height: 20px; flex-shrink: 0; }
.step-up-card h3 span { font-size: 0.8em; opacity: 0.7; margin-left: 8px; font-weight: normal; }
.step-up-card p { margin: 0; font-size: 13px; line-height: 1.6; }
.step-up-card p span { display: block; margin-top: 4px; }
.step-up-card p span:first-of-type { margin-top: 6px; }

```

### **⑧ 解説・ヒントUIの動的文脈適応 (Cognitive Load Reduction)**

アルゴリズムや設定を切り替えた際、過去の選択肢に関する `[?]` ポップオーバー（`.rationale-text`）や現場のコツ（`.bench-tip`）が残留しないよう、JSを用いて必ず「現在の文脈に合致する説明文への動的書き換え」または「不要なヒントの非表示化」を行うこと。

### **⑨ 安易な「解答表示」ボタンの原則禁止**

教育的シミュレーターにおいて、ユーザーに試行錯誤を促す場面では、ワンクリックで正解状態にしてしまう「解答表示」ボタンの設置を原則禁止とする。

---

## **7. データ連携・手動バケツリレー・ローカル要塞＆オンデマンド同期規格 (v38.0 統合版)**

### **7.1 デジタル野帳（LIMS）としてのダッシュボード（アプリ①）と手動バケツリレー原則**

Bio-Edu Suiteは「生徒にデータ構造と思考プロセスを体験させる教育環境」であるため、**解析アプリ間のブラックボックスな自動連携を原則禁止**とする。

1. **ダッシュボード（アプリ①）の役割限定**:
* ダッシュボードは純粋なデジタル野帳（LIMS）として、未処理の生データ（サンガー波形 `.ab1`、塩基配列・アミノ酸配列、形態画像、採取地・温度等の環境メタデータ）の一元保管に徹する。（※以前検討された「ダッシュボードへの直接的な最終解析データ生成ディスパッチャーの埋め込み」方針は撤回済み）。


2. **終着点・解析アプリの「完全空箱化」**:
* 各解析アプリ（⑤〜⑭）内にデモデータ呼び出しボタンや固定プリセットを配置することは固く禁ずる。生徒が持ち込んだデータを解析・表示する純粋なスタジオとして設計する。


3. **手動バケツリレーの徹底（データ移動の可視化）**:
* **初期分配**: ダッシュボードから一次処理アプリ（④ Sanger Trace Editor, ⑤ DNA Alignment, ⑨ Morphometrics等）へ生データを送る一括送信時のみ、`sessionStorage` および `IndexedDB` を介したディスパッチを行う。
* **コピペまたはファイルドロップによる連携**: ⑤や⑧、⑨で処理・導出されたデータは、必ず生徒自身の手で「クリップボードへコピー＆ペースト」または「ローカルファイル保存＆次アプリへドラッグ＆ドロップ」させること。


4. **連携データのメタデータ自動刻印と視覚的フィードバック**:
* 各アプリから出力されるテキストデータ（JSONやTSV）には、必ずデータの出所と処理時刻を示すメタデータ（JSONの `"source": "App_9_GPA"`, `"timestamp": "..."` や、TSV先頭の `# Source` コメント行）を自動刻印し、受入先アプリでトースト通知等により出所をフィードバックすること。


5. **Phase 1 → Phase 4/5 共通環境TSV連携パイプライン**:
* ダッシュボードの「⑩・⑫ 環境TSVをコピー」から出力される `# Source` 付き3列TSV（`Sample_ID \t 系統・個体群 \t 環境カテゴリ`）は、アプリ⑩（タングルグラムおよびPCAの環境カラーマッピング）およびアプリ⑫（統計遺伝学 G×E 相互作用解析）の双方が直接受け入れ可能な共通フォーマットとする。


6. **マルチデータセットのサンプルIDベース内部結合（Inner Join）および欠損自動除外規格**:
* アプリ⑪（Comparative Variant Analyzer）等の統合解析ツールにおいて、突然変異データ（Mutation）と形態変異データ（Variation）等を統合する際は、暗黙的な行順序ではなく、必ず共通の `Sample_ID` に基づく内部結合（Inner Join）を行ってから行列計算・相関解析に回すこと。片方にしか存在しないサンプルはエラーで停止させず安全に自動除外し、トースト警告を提示すること。



### **7.2 階層型サンプルハブ（Multi-file Sample Hub）＆スマート・ディスパッチ規格**

1. **階層型データ構造（Nested Entity）**:
ダッシュボードで管理する各サンプルは、1サンプルに対し複数のファイルを保持できる以下の階層構造JSONオブジェクトとして定義する。
* `id`: 一意のサンプルID（例: `Sample-01`）
* `name` / `species`: 生物名または系統名（日本学術会議2025年版に準拠）
* `metadata`: 採取地、環境要因、生息場所（ハビタット）などのデジタル野帳情報
* `traces`: サンガーシーケンス波形データ群（`.ab1`。リード方向 `direction: 'forward' | 'reverse'`、遺伝子マーカー名を含む）
* `sequences`: 確定した塩基配列・アミノ酸配列群（FASTA。マーカー遺伝子タグ `marker: 'CO1' | 'Cytb' | ...` を含む）
* `images`: 形態測定・同定用画像データ群（Base64またはObject URL）


2. **スマート・ディスパッチ（マーカー選択送信）**:
ダッシュボードから解析アプリ（④, ⑤等）へデータを一括送信する際、対象サンプル内に複数種類のマーカー遺伝子（CO1とCytb等）が混在する場合は、直ちに送信せず「送信対象マーカーの選択モーダル（例: ☑ CO1 のみ送信）」を表示し、選択されたマーカーの配列のみを抽出（ヘッダー `>[Sample_ID]_[Marker] [Species]`）して送信すること。
3. **初期サンプル復元導線**:
ストレージ未保存時（かつ初期化済みフラグ `bio_edu_samples_cleared` が存在しない場合）の初期サンプル自動復元と、空状態（`.empty-state`）におけるワンクリック手動復元ボタン（`restoreDefaultSamples`）を常時配備する。

### **7.3 ローカル要塞化（Local Fortress）＆同一セッション内ステート完全保持規格**

1. **アプリ遷移時の100%ローカル完結**:
日常の作業状態および同一セッション（ウィンドウ・タブ生存期間）内でのアプリ間画面遷移におけるデータ保持は、外部ネットワーク通信を一切介さず、100%端末内のローカルストレージ領域（`localStorage` / `sessionStorage` / `IndexedDB`）への即時自動保存とハイドレーション（復元）で完結させる。
2. **ストレージキー命名規則と正規化**:
* 全アプリ共通の保存キーは `bio_edu_workspace_<app_name>` とするが、ルートアクセス（パスが空）または `index.html` の場合は動的に `bio_edu_workspace_dashboard` に正規化し、キーの衝突・すれ違いを防止する。
* フォーム変更時（`input`, `change` の150msデバウンス）および画面離脱時（`pagehide`, `visibilitychange`）に瞬間保存し、`DOMContentLoaded` 時に初期化ガードフラグ（`isHydrating = true`）を立ててUI値および解析描画をサイレント完全復元する。BFCacheを阻害する `unload` / `beforeunload` は使用しない。


3. **リッチデータ構造体の完全シリアライズ義務**:
主要テキストエリアの文字列だけでなく、描画を構成する全オブジェクト（アプリ⑧の `clusters`, `distanceMatrix`, `algo`, `bootstrap`, `outgroup`, `newick`、アプリ⑦の `localDB`, `currentResults`, スコアリングパラメータ等）を完全シリアライズして保存・復元すること。
4. **大容量データの `IndexedDB` 定着と上書き遮断**:
* 5MB制限のある `sessionStorage` のパンクを防ぐため、アプリ④の未処理・編集済み `.ab1` 波形データや、アプリ⑦の外部カスタムデータベース（`localDB` カセット）等の大容量データは、端末内の `IndexedDB`（`BioEdu_IndexedDB`）へ確実に自動保存・復元させること。
* 専用フルステート保存機能を持つアプリ（①, ④, ⑤, ⑦, ⑧, ⑩等）において、汎用DOM保存スクリプト（`workspace_sync.js` 等）の古い初期キャッシュが専用ステートを上書き・リセットすることを物理遮断すること。


5. **長時間処理（重負荷計算・外部通信）中の離脱警告モーダル**:
アプリ⑤・⑦・⑧等でWeb Worker計算や外部API通信の「進行中」にドロワー等から別アプリへ遷移しようとした場合、第8項の確認ダイアログ（`#confirmModal`）で「現在処理中です。アプリを移動すると進行中の処理はキャンセルされ元の状態に戻ります。移動しますか？」と警告し、同意時は計算開始前の状態へリセットして遷移させること（※すでに完了した結果ステートは絶対に破棄せず維持する）。

### **7.4 全アプリ共通「コピー」＋「ローカルファイル保存（ダウンロード）」ペア義務化規格**

1. **出力ボタンのペア設置義務**:
クリップボード消失やブラウザトラブル時にも絶対に実験・授業を止めないため、データを出力するすべてのアプリにおいて、「コピーボタン（二重シート型SVG / `.btn-secondary`）」の横に必ず「ローカルファイル保存ボタン（フロッピー型SVG / `.btn-success` または `.btn-secondary`：`.fasta`, `.csv`, `.tsv`, `.nwk`, `.json`, `.txt` 等）」をペアで並置することを義務付ける。
2. **ファイルドロップによる完全復帰保証**:
保存されたローカルファイルは、次工程アプリのファイルドロップゾーン（`.drop-zone`）へドラッグ＆ドロップ（またはファイル選択）することで、クリップボードを介さずとも100%同一の解析を継続できる冗長性を担保すること。
3. **ダッシュボード全体のローカルファイルバックアップ**:
ダッシュボード（アプリ①）には、登録済みの全サンプルデータ（塩基配列・アミノ酸配列、波形、画像、環境メタデータ）を単一のJSONファイルとして端末へダウンロード保存・復元できるローカルバックアップ導線を備えること。

### **7.5 Kahoot方式ルーム接続＆完全手動（オンデマンド）クラウド同期規格**

1. **Google OAuthログインの完全廃止とKahoot方式への一本化**:
* Googleアカウント認証は**完全廃止**する。
* Firebase匿名認証を基盤とし、「ルームコード（例: `BIO-101`）」＋「参加者ID（班ID `Team-A` または個人出席番号 `No-12`）」のみで入室するKahoot方式へ一本化する。


2. **バックグラウンド自動クラウド通信の全面禁止とオンデマンド手動化 (v38.0 最重要規律)**:
* アプリ間遷移時や入力変更時の自動クラウド送受信（`onSnapshot` 常時監視、`bio_edu_request_save` によるデバウンス自動送信、入室時の自動クラウド上書き）は**完全廃止・全面禁止**する。
* クラウド（Firestore）との通信は、ユーザーが `#accountModal` 内の明示的な操作ボタン（「現在の作業をクラウドに保存」「クラウドから作業を復元」「課題として登録・発行」「課題データを読込」）を**手動でクリックした時のみ**実行する。
* 通信実行時はボタン上に進行状態（「保存中...」「読込中...」）を明示し、完了またはエラーをトースト通知でフィードバックすること。
* クラウドからの復元完了時、および課題プリセット読込完了時には、それぞれ `bio_edu_cloud_synced` / `bio_edu_preset_loaded` カスタムイベントをディスパッチし、全アプリで `restoreWorkspace()` 等の再描画関数をサイレント実行して画面へ即時反映させること。


3. **隠れ教師モード（Secret Teacher Mode）と教材マスター（`/master_tasks`）単一正本化規格**:
* **教員ロール判定**: 参加者IDの先頭が大文字・小文字を問わず「`TEACHER`」（例: `TEACHER`, `TEACHER-01`）の場合、教員端末（`isTeacher = true`）として認識し、モーダル内の「教員専用：課題プリセット発行パネル（`#teacherPresetSection`）」を動的に表示（`display: block`）する（生徒端末では完全不可視化）。
* **単一正本の原則（Single Source of Truth）**: 教員が発行する教材データ（`registerMasterPreset`）は、Firestoreのルートコレクション `/master_tasks/{taskCode}` のみに保存する（ペイロード構造: `{ sequence, sessionData, appName, registeredAt }`）。ルーム配下（`rooms/{roomCode}/tasks`）への二重保存や分散探索は一切禁止する。
* **入室中オンデマンド課題読込窓の常設**: 未入室時・ルーム入室中（`#modalLoggedInView`）を問わず、生徒・教員が任意のタイミングで課題コードを入力して `importMasterPreset` を実行できる読込パネルをモーダル内に常設する。
* **インポート時 `IndexedDB` 自動ハイドレーション義務**: 課題インポート（`bio_edu_preset_loaded`）受信時、サンプル内に `.ab1` 波形バイナリ（`traces[].data` 等）が含まれている場合は、バックグラウンド非同期処理で直ちに端末内 `IndexedDB`（`BioEdu_IndexedDB` の `sample_binaries` ストア）へ自動書き込みを行い、保存ボタンを押さずとも即座に「④ .ab1 を送る」が機能することを保証する。


4. **Firestore 通信安全防壁（キーサニタイズ・型コンフリクト自己修復・重量分離・非破壊画像保護）**:
* **キーサニタイズ自動化**: `sessionStorage` キー名に含まれる `.`（ドット）は Firestore のネストパス誤認（`invalid nested entity`）を引き起こすため、送信時に `.` を `__dot__`（または `.html` → `_html`）へサニタイズし、受信時に元へ復元する。
* **型コンフリクト自己修復**: `setDoc({ merge: true })` は必ず `try-catch` で保護し、型コンフリクトエラー発生時は直ちに `merge: true` を外した完全上書きモードで再試行する。
* **超重量バイナリの分離と15万文字画像許容枠**: クラウド保存ペイロードに数百KB〜数MBの `.ab1` バイナリ等を直接含めることを禁じ、軽量な作業ステート（指示書）と端末内 `IndexedDB` / マスター原本をハイドレーション結合する。画像データは **150,000文字（約110KB）以下** をクラウド同期許容枠とし、これを超える巨大画像は通信ペイロード上でのみ間引き、端末内のローカル実データは非破壊で保護・自動マージすること。


5. **`auth_sync.js` グローバル関数バインド＆DOM操作安全防壁規格**:
* **グローバル関数（`window.*`）の完全バインド義務**: 全アプリの `#accountModal` 内のボタン（`onclick` 属性）から確実に呼び出せるよう、`auth_sync.js` は初期化時および `DOMContentLoaded` 時に以下の全関数を `window` オブジェクトへバインドしなければならない。
  `window.joinRoom`, `window.leaveRoom`, `window.importMasterPreset`, `window.registerMasterPreset`, `window.saveCurrentWorkspace`, `window.syncFromCloud`, `window.manualSaveToCloud`, `window.manualLoadFromCloud`, `window.handleJoinRoom`, `window.handleLeaveRoom`, `window.handleImportPreset`, `window.handleRegisterCurrentPreset`, `window.handleManualCloudSave`, `window.handleManualCloudLoad`
* **引数省略呼び出し時のDOM自律解決とID両対応**: `joinRoom()`, `importMasterPreset()`, `registerMasterPreset()` が引数なしで呼び出された場合は、モーダル内の入力欄（`#roomCodeInput`, `#participantIdInput`, `#presetTaskCodeInput` [旧 `#masterTaskCodeInput`], `#publishTaskCodeInput` [旧 `#newMasterTaskCodeInput` / `#loggedInMasterTaskCodeInput`]）から自律的に値を取得し、処理完了後に `closeAccountSettings()` でモーダルを自動クローズすること。また、ステータス表示要素は `#roomDisplay` / `#userNameDisplay` および `#participantDisplay` / `#userEmailDisplay` の双方に対応させること。
* **動的ボタン注入の冪等性と `insertBefore` クラッシュ防止**: `#modalLoggedInView` 内に静的ボタン（`#manualCloudSaveBtn` 等）が既に存在する場合は動的生成（`ensureManualSyncButtons`）をスキップすること。フォールバックで動的挿入を行う際も、参照ノードが親要素の直接の子要素（`Array.from(loggedInView.children)`）であることを必ず確認し、入れ子要素に対する `insertBefore` の `NotFoundError` 例外を物理的に遮断すること。



### **7.6 スマート初期化・ルーム解散・デッドロック防止＆ゾンビ復活遮断規格**

ドロワー最下部の「データを初期化（`confirmDataReset`）」実行時は、以下の安全規格を厳守する。

1. **ダイアログキャンセル時の保存機能リカバリ保証**:
確認ダイアログ（`#confirmModal`）を表示した段階では保存機能を止めず、ユーザーがダイアログ内で「初期化する（OK）」を押したコールバック内で初めて `window.isResetting = true;` および `Storage.prototype.setItem = function() {};` を発動させること（キャンセル押下時に保存機能が死んだままになるバグを物理遮断する）。
2. **`IndexedDB` 消去のデッドロック防止と初期サンプル復活遮断**:
* `localStorage.clear()` および `sessionStorage.clear()` 実行直後、ネイティブの `setItem` 参照を用いて `localStorage.setItem('bio_edu_samples_cleared', 'true');` と `localStorage.setItem('bio_edu_finch_alx1_version', 'v37.3');` の**両フラグ**を即座に再書き込みし、リロード後に初期サンプル（ニワトリ＋フィンチ4種）が勝手にゾンビ復活する現象を物理遮断する。
* `IndexedDB`（`BioEdu_IndexedDB`）の完全クリア時は、非同期トランザクションのデッドロックによるフリーズを防ぐため、必ずタイムアウト（例: 800ms）付きのPromiseフェイルセーフを設け、確実に `location.reload()` へ到達させること。


3. **ロール別クラウド初期化・ルーム解散ハイブリッド処理**:
* **生徒ロール**: ローカル初期化に加え、Firestore上の「該当参加者ID自身の作業スナップショット」のみを削除してルームを退出する。
* **教員ロール（`TEACHER-*`）**: ローカル初期化に加え、Firestore上の該当ルーム（`rooms/{roomCode}`）ドキュメント全体を一括消去（パージ）してルームを解散する（※ `/master_tasks` の教材原本は完全保護される）。



### **7.7 外部解析APIとのハイブリッド・デュアルエンジン規格（BLAST検索等）**

1. **デュアルエンジン構成**: 軽量なローカルJSエンジン（Web Worker等）による「オフライン・ファーストモード」と、外部公開REST API（NCBI QBLAST API等）を叩く「オンライン・探究モード」を同一UI内でシームレスに切り替え可能とする。
2. **自動フォールバックと共通データモデル**: オンラインモードで通信遮断やタイムアウトが発生した際は即座にトーストで通知してローカルエンジンへ安全に誘導し、返却データは共通インターフェースに正規化して描画Viewを完全共通化する。

---

## **8. モーダル・ファイル出力のUI/UX規格とシステム必須モーダル構造**

* **モーダル幅の完全統一**: `#enzymeModal` 等の各モーダルに設定されていた `width: 300px !important` 等の強制指定を廃止し、`width: 400px`（または `max-width: 400px`、`!important` なし）に統一する。
* **FASTA エクスポート名の定数化**: 出力ファイル名は **`BioEdu_Export_YYYYMMDD.fasta`** の形式に固定する。
* **ホバーカラーの統一**: ホバー時の背景色やアクセントラインの色はハードコードを避け、`:root` の `--primary` または `--phase-color` に連動させること。

### **【マスターテンプレート】システム必須モーダル構造（全アプリ共通 / v38.0 Kahoot＆手動同期対応版）**

データ初期化時の確認ダイアログ（`#confirmModal`）およびルーム接続・手動クラウド同期・課題配信パネル（`#accountModal`）は、`auth_sync.js` からID指定でDOM操作されるため、全アプリの `</body>` タグ直前に以下のHTMLおよび開閉関数を配置すること（※旧Googleログイン用モーダルHTMLは使用禁止）。

```html
<!-- 1. カスタム確認ダイアログ（データ初期化・計算中離脱警告用） -->
<div class="modal-overlay" id="confirmModal">
  <div class="modal-content" style="max-width: 400px; border-top: none; text-align: center;">
    <div class="modal-body" style="padding: 30px 20px 10px;">
      <svg class="svg-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 42px; height: 42px; margin-bottom: 12px; opacity: 0.9;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      <h3 id="confirmTitle" style="margin: 0 0 10px 0; font-size: 16px; color: var(--primary);">確認</h3>
      <div id="confirmMessage" style="font-size: 13px; line-height: 1.6; color: var(--text-main);"></div>
    </div>
    <div class="modal-footer" style="border-top: none; background: white; justify-content: center; gap: 12px; padding-bottom: 30px;">
      <button class="btn btn-secondary" onclick="closeConfirm(); triggerHapticFeedback();">キャンセル</button>
      <button class="btn" id="confirmOkBtn" style="background: var(--danger); color: white;">実行する</button>
    </div>
  </div>
</div>

<!-- 2. ルーム・同期・課題設定モーダル (Kahoot方式 ＆ v38.0 完全手動クラウド同期規格) -->
<div class="modal-overlay" id="accountModal">
  <div class="modal-content" style="max-width: 400px;">
    <div class="modal-header">
      <h3 style="margin: 0; font-size: 16px;">ルーム接続・クラウド同期・課題設定</h3>
      <button class="modal-close" onclick="closeAccountSettings(); triggerHapticFeedback();" data-tooltip="閉じる">
        <svg class="btn-icon" style="margin:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>
    <div class="modal-body" style="padding: 20px;">

      <!-- ① 未入室時（ローカル要塞モード）ビュー -->
      <div id="modalLoggedOutView">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
          <span style="font-size: 14px; font-weight: bold; color: var(--text-main);"><svg class="btn-icon" style="width:16px;height:16px;vertical-align:-3px;margin-right:4px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>ローカル自動保存モード（端末内保存）</span>
        </div>
        <p style="font-size: 12px; color: var(--text-muted); margin: 0 0 12px 0; line-height: 1.6;">
          日常の作業は通信なしで端末内に自動保存されます。班での共有や別端末への引き継ぎを行う場合は、ルームコードとIDを入力して入室してください。
        </p>
        <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px;">
          <input type="text" id="roomCodeInput" placeholder="ルームコード (例: BIO-101)" style="width: 100%; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 4px; font-size: 13px;">
          <input type="text" id="participantIdInput" placeholder="参加者ID (例: Team-A / No-12)" style="width: 100%; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 4px; font-size: 13px;">
        </div>
        <button class="btn btn-primary" style="width: 100%; justify-content: center;" onclick="if(window.joinRoom) window.joinRoom(); triggerHapticFeedback();">
          ルームに入室する
        </button>
      </div>

      <!-- ② ルーム入室中（オンデマンド手動同期）ビュー -->
      <div id="modalLoggedInView" style="display: none;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
          <span id="syncStatusBadge" style="font-size: 14px; font-weight: bold; color: var(--phase-color);"><svg class="btn-icon" style="width:12px;height:12px;vertical-align:-1px;margin-right:4px;" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><circle cx="12" cy="12" r="8"/></svg>ルーム接続中</span>
        </div>
        <div style="background: #f8f9fa; border: 1px solid #e1e8ed; border-radius: 6px; padding: 12px; margin-bottom: 12px;">
          <div id="userNameDisplay" style="font-weight: bold; font-size: 14px; color: var(--primary);"></div>
          <div id="userEmailDisplay" style="font-size: 11px; color: var(--text-muted); margin-top: 2px;"></div>
          <div id="syncStatusNote" style="font-size: 11px; color: var(--danger); margin-top: 6px; display: none;"></div>
        </div>

        <!-- 手動クラウドセーブ＆ロードボタン群 (v38.0) -->
        <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
          <button id="manualCloudSaveBtn" class="btn btn-primary" style="width: 100%; justify-content: center;" onclick="if(window.manualSaveToCloud) window.manualSaveToCloud(); triggerHapticFeedback();">
            <svg class="btn-icon" style="width:16px;height:16px;margin-right:6px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/></svg>現在の作業をクラウドに保存
          </button>
          <button id="manualCloudLoadBtn" class="btn btn-secondary" style="width: 100%; justify-content: center;" onclick="if(window.manualLoadFromCloud) window.manualLoadFromCloud(); triggerHapticFeedback();">
            <svg class="btn-icon" style="width:16px;height:16px;margin-right:6px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>クラウドから作業を復元
          </button>
        </div>

        <button class="btn btn-secondary" style="width: 100%; justify-content: center; color: var(--danger); border-color: #f5b7b1;" onclick="if(window.leaveRoom) window.leaveRoom(); else if(window.handleLogout) window.handleLogout(); triggerHapticFeedback();">
          ルームから退出する
        </button>
      </div>

      <!-- ③ オンデマンド課題プリセット読込パネル（常設 / v36.9） -->
      <div id="presetImportSection" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e1e8ed;">
        <div style="font-size: 12px; font-weight: bold; color: var(--primary); margin-bottom: 8px;"><svg class="btn-icon" style="width:15px;height:15px;vertical-align:-2px;margin-right:4px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>課題データを読込（教員プリセット展開）</div>
        <div style="display: flex; gap: 8px;">
          <input type="text" id="presetTaskCodeInput" placeholder="課題コード (例: TASK-01)" style="flex: 1; padding: 8px 10px; border: 1px solid var(--border-color); border-radius: 4px; font-size: 13px;">
          <button id="importPresetBtn" class="btn btn-secondary" onclick="if(window.importMasterPreset) window.importMasterPreset(); triggerHapticFeedback();">読込</button>
        </div>
      </div>

      <!-- ④ 隠れ教師モード専用：課題プリセット登録・発行パネル（TEACHER-* 入室時のみ表示 / v35.5） -->
      <div id="teacherPresetSection" style="display: none; margin-top: 16px; padding-top: 16px; border-top: 2px dashed var(--warning);">
        <div style="font-size: 12px; font-weight: bold; color: #d35400; margin-bottom: 8px;"><svg class="btn-icon" style="width:15px;height:15px;vertical-align:-2px;margin-right:4px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>教員専用：現在の画面データを課題として発行</div>
        <div style="display: flex; gap: 8px;">
          <input type="text" id="publishTaskCodeInput" placeholder="発行コード (例: TASK-01)" style="flex: 1; padding: 8px 10px; border: 1px solid var(--warning); border-radius: 4px; font-size: 13px;">
          <button id="publishPresetBtn" class="btn btn-primary" style="background: var(--warning); border-color: var(--warning); color: #fff;" onclick="if(window.registerMasterPreset) window.registerMasterPreset(); triggerHapticFeedback();">登録・発行</button>
        </div>
      </div>

    </div>
  </div>
</div>

```

```javascript
/* JS実装規格: モーダル開閉グローバル関数 */
function openAccountSettings() { document.getElementById('accountModal').style.display = 'flex'; }
function closeAccountSettings() { document.getElementById('accountModal').style.display = 'none'; }

```

---

## **9. 共通UIコンポーネント・マスター規格**

### **① データ読込（ファイルドロップゾーンと貼り付け枠）**

* **ドロップゾーン (`.drop-zone`)**: 第2項の「ドキュメント＋矢印型」SVGを使用し、文言は `ここをクリック、または [対象データ名] をドラッグ＆ドロップ` に固定する。

```css
.drop-zone {
    border: 2px dashed var(--border-color);
    border-radius: 8px;
    padding: 16px;
    background: #f8f9fa;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    max-width: 450px; /* Alignment Print Studioは例外 */
    min-height: 60px;
    box-sizing: border-box;
    cursor: pointer;
    transition: 0.2s;
    overflow: hidden;
}
.drop-zone p {
    margin: 0;
    font-size: 12px;
    font-weight: bold;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    pointer-events: none;
}
.drop-zone svg { flex-shrink: 0; }

.paste-area {
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 12px;
    background: #fdfefe;
    width: 100%;
    max-width: 450px; /* Alignment Print Studioは例外 */
    min-height: 100px;
    font-family: 'Courier New', Consolas, monospace;
    font-size: 12px;
    resize: vertical;
    box-sizing: border-box;
}

```

### **② 保存・出力・サブアクションボタンと動的発色（`.btn-dynamic`）**

* **保存（🟩 Success）**: `[FASTA保存]` `[CSV保存]` 等。左にフロッピー型SVGアイコンを配置。
* **コピー（⬜ Secondary）**: `[FASTAコピー]` 等。左に二重シート型SVGアイコンを配置。
* **ステータス連動型ボタン（`.btn-dynamic`）**: 解析完了後に押せるようになったことを強調したいボタンは、無効時（`:disabled`）は白背景、有効時（`:not(:disabled)`）のみ緑（Success）等に発色させる。

```css
/* 動的発色ボタンの基本（無効時） */
.btn-dynamic:disabled {
    background-color: var(--card-bg) !important;
    color: var(--text-muted) !important;
    border: 1px solid var(--border-color) !important;
    opacity: 0.6;
    cursor: not-allowed !important;
    box-shadow: none !important;
    transform: none !important;
}
/* 動的発色ボタンの有効時（:not(:disabled)） */
.btn-dynamic:not(:disabled) {
    background-color: var(--success);
    color: white;
    border-color: var(--success);
    opacity: 1;
    cursor: pointer;
}
.btn-dynamic:not(:disabled):hover {
    filter: brightness(1.05);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

```

### **③ タイトル・メタ情報の書式**

* **ブラウザタブ `<title>**`: 絵文字を全廃し、アプリ番号の丸数字（①〜⑭）を先頭に付与する。
* **書式**: `[アプリ番号] [アプリ名] | Bio-Edu Suite`（例: `② PCR Master Mix Studio | Bio-Edu Suite`）
* **例外**: 「Investigation Dashboard」と「Lab Packs (教材パック)」は丸数字を付与せずプレーンテキストとする。


* **アプリタイトル (`<h1>`)**: 丸数字（①〜⑭）や絵文字は付与せず、各Phase公式のインラインSVGとプレーンテキストのみで構成する。
* **サブタイトル**: `Bio-Edu Suite: Phase [X] / [英語の機能説明]` のフォーマットで明記する。
* **ステータスバー**: `ステータス: [状況] | [メタデータ1] | [メタデータ2]` の記述順に固定する。

### **④ セクション見出しの階層的ナンバリング規定**

* **大階層（主要セクション / 紺色パネル上部等）**: ローマ数字（`Ⅰ.`, `Ⅱ.`, `Ⅲ.` ...）を使用する（例: `Ⅰ. 解析設定`）。
* **中階層（パネル内の各項目）**: アラビア数字（`1.`, `2.`, `3.` ...）を使用する（例: `1. プライマー設計`）。

### **⑤ 学術クレジット (References & Algorithms) のUI規格**

* **配置**: `.step-up-card` (より高度な解析ツールへ) の直下。
* **書式**: 装飾アイコンは使用せず、プレーンな `<details>` と `<summary>` を用いて、省略のない完全な「APAスタイル」で原著論文を記述する。

```html
<div style="margin-top: 20px; width: 100%; text-align: left;">
    <details style="cursor: pointer;">
        <summary style="font-weight: bold; color: var(--text-muted); font-size: 13px;">
            References &amp; Algorithms
        </summary>
        <div style="padding: 10px 0 0 15px; font-size: 11px; color: var(--text-muted); line-height: 1.6;">
            <p style="margin-bottom: 8px;">本アプリケーションの計算エンジンは、以下のアルゴリズムおよび進化モデルに基づき実装されています。</p>
            <ul style="padding-left: 20px; margin: 0; display: flex; flex-direction: column; gap: 6px;">
                <li><strong>[手法名]:</strong> [完全なAPAフォーマットの引用表記]</li>
            </ul>
        </div>
    </details>
</div>

```

---

## **10. 左右分割レイアウト・余白（Spacing）・アプリ連番体系規格**

### **① デスクトップ表示時の黄金比率とフレキシブル・グリッド**

* **パターンA（シミュレーター・エディタ型）**: `[設定パネル 35% : 結果描画エリア 65%]`（または `flex: 3.5` と `flex: 6.5`）。
* **パターンB（データ比較・リスト型）**: `[左パネル 50% : 右パネル 50%]`。
* **フレキシブル・グリッド標準レイアウト**: 左右分割に加え、`display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;` を標準採用し、900px以下の画面幅では自動的に1カラムの縦積み（縦スクロール）へ安全に移行させる。スマホ表示時、隣接する入力フォームとボタンは `display: flex; flex-wrap: nowrap;` と `white-space: nowrap;` で不自然な分断を防ぐ。

### **② 余白（Spacing）の 8px 倍数ルール**

* **セクション間の余白** (`gap` や `margin-bottom`): `24px` または `16px`
* **要素内のゆとり** (`padding`): `8px 16px` (ボタン等) または `16px` (カード等)
* **細かい隙間**: `4px` または `8px`

### **③ 正式アプリ連番体系（Phase 4〜Phase 6）とバケツリレー用ボタングループ規格**

1. **Phase 4〜6 正式連番・テーマカラー**:
* **⑩ Integrative Taxonomy Studio** (Phase 4 / テーマカラー: `#8e44ad`)
* **⑪ Comparative Variant Analyzer** (Phase 4 / テーマカラー: `#8e44ad` / 突然変異 `mutation` と形態変異 `variation` のクロス対比)
* **⑫ Statistical Genetics Lab** (Phase 5 / テーマカラー: `#e74c3c`)
* **⑬ Central Dogma Simulator** (Phase 6 / テーマカラー: `#e67e22`)
* **⑭ Protein Structure Explorer** (Phase 6 / テーマカラー: `#e67e22`)


2. **バケツリレー用ボタングループ規格（`.export-btn-group`）と解析ステータス連動**:
* 他アプリへ結果を持ち出すボタン群（コピー＆ローカル保存ペア群）は横並びの `.export-btn-group` として配置する。
* 初期状態はすべて `disabled`（非活性）とし、解析計算・描画が完了したタイミングでのみ一括活性化させ、入力変更や再解析開始時には直ちに `disabled` へ戻すガードレールを義務付ける。



---

## **11. タイポグラフィ・形状（Morphology）・状態（ステート）・テーブル規格**

### **① タイポグラフィ（フォント指定の厳格化）**

* **通常テキスト（全角日本語・半角英数字）**:
`body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif, 'Noto Sans JP'; font-size: 14px; color: var(--text-main); line-height: 1.6; }`
* **等幅フォント（塩基配列・アミノ酸配列）**:
`.sequence-text { font-family: 'Courier New', Consolas, monospace; letter-spacing: 1px; }`

### **② ボタンの形状寸法と UNIFIED DISABLED MASTER CSS**

* **基本形状**: `border-radius: 4px;` に統一し、通常状態の `box-shadow` は原則禁止（フラットデザイン）。ホバー時のみ微細な影（`0 2px 4px rgba(0,0,0,0.1)`）と `filter: brightness(1.05)`、アクティブ時は `transform: scale(0.97)` を適用する。
* **文字へのフィットと例外**: 単独ボタンは `width: fit-content`（または `inline-flex`）とする。ただしサイドパネル内の主要実行ボタンは `width: 100%` を許可する。同列のボタングループは最大文字数ボタンに合わせて幅を揃える。
* **非アクティブUIの完全同一化（UNIFIED DISABLED MASTER CSS）**:
無効化（`:disabled`）されたボタン、`select:disabled`、および `.form-select:disabled` は、すべて寸分違わぬ白背景・淡グレー枠・淡グレー文字・操作不可カーソルに統一し、ホバーや沈み込みを物理遮断する。

```css
/* UNIFIED DISABLED MASTER CSS */
button:disabled, .btn:disabled, select:disabled, .form-select:disabled, input:disabled {
    background-color: #ffffff !important;
    color: #bdc3c7 !important;
    border: 1px solid #d5dbdb !important;
    opacity: 0.6;
    cursor: not-allowed !important;
    filter: grayscale(50%);
    box-shadow: none !important;
    transform: none !important;
}

```

### **③ 入力フォーム（Input / Select）のフォーカスとフィット規定**

* 入力窓はむやみに `width: 100%` にせず、想定文字数に応じた適切な幅（`width: 120px` や `max-width`）を設定する。
* **フォーカス（`:focus`）**: `outline: none; border-color: var(--phase-color); box-shadow: 0 0 0 2px rgba(26, 188, 156, 0.2);`
* **エラー状態（`.input-error`）**: `border-color: var(--danger); box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2); background-color: #fdf2f2;`

### **④ タッチターゲット要件の厳格化**

タップ可能な全要素（`.btn`, `.sidebar-action-btn`, `.nav-item`, `.hamburger-btn`, `select` 等）は最小高さ 44px（1024px以下のモバイル・タブレット環境では 48px）を必ず確保する。

```css
.btn, .hamburger-btn, select, input[type="button"], input[type="submit"] {
    min-height: 44px; display: inline-flex; align-items: center; box-sizing: border-box;
}
.nav-item, .sidebar-action-btn {
    min-height: 44px; display: flex; align-items: center; width: 100%; box-sizing: border-box;
}
@media (max-width: 1024px) {
    .btn, .sidebar-action-btn, .nav-item, .hamburger-btn, select { min-height: 48px; }
}

```

### **⑤ テーブル行アクティブ・ハイライト ＆ 解析ログ・タイムマシン復元規格**

1. **ボーダーレス・ハイライト（`.active-log`）**:
テーブル内の選択行を示す際、セル境界の縦線や段差ノイズを防ぐため、上下左右のボーダーを一切付与せず、**フラットな背景色（`background-color: #d1f2eb !important;`）のみ**で塗りつぶすこと（ホバー時は `#f2f4f4`）。
2. **解析ログ・タイムマシン完全スナップショット保持**:
* 比較ログテーブルの表示ラッパーには `max-height: 380px` を確保し、スクロール不要で3〜5件以上を俯瞰可能にする。
* ログ配列（`analysisLogs`）内に系統樹根ノード、距離行列、アルゴリズム、外群等の完全なスナップショットをディープコピーして保持し、過去ログ行クリック時にキャンバス描画およびエクスポート用データ（Newick/TSV等）を過去ステートへ完全再充填すること。



---

## **12. Z-index 階層管理規格**

無作為な数値のハードコードを禁止し、以下の階層スケールに厳格に固定する。

* `z-index: 10` : 通常のフローから浮くUI
* `z-index: 30` : グローバルヘッダー (`.header-container`)
* `z-index: 100` : ドロップダウンメニュー / カスタムセレクト
* `z-index: 1000` : モーダル背景（`.modal-overlay` / `.sidebar-overlay`）
* `z-index: 1002` : グローバル・ドロワー (`.sidebar`)
* `z-index: 1010` : モーダル本体 (`.modal-content`)
* `z-index: 9000` : 根拠ポップオーバー (`.rationale-text`)
* `z-index: 9999` : カスタムツールチップ (`.custom-tooltip`) ＆ PWA更新バナー
* `z-index: 99999` : 2Dデジタイザ全画面オーバーレイ
* `z-index: 100000` : トースト通知 (`#toast`) - 常に最前面

---

## **13. インタラクション＆描画修正 仕様書（可変スピード型エッジオートスクロール）**

長大な塩基配列や波形データを扱うビュアー（Sanger Trace Editor、DNA Alignment Studio等）において、範囲選択ドラッグ中に滑らかに加速スクロールする線形補間方式を標準実装とする。

* **検知エリア**: スクロールコンテナの左右両端から **内側 50px**（`scrollTriggerArea = 50`）。
* **速度計算式**: `スクロール速度 = (超過距離 / 50) × 最大速度(30px/フレーム)`。`setInterval` ではなく必ず `requestAnimationFrame` を用いる。

```javascript
function checkAutoScroll() {
    if (!isDragging) return;
    const wrap = document.getElementById('scrollContainer');
    const rect = wrap.getBoundingClientRect();
    const scrollTriggerArea = 50;
    const maxSpeed = 30;
    let scrollSpeed = 0;

    if (currentMouseX > rect.right - scrollTriggerArea) {
        let dist = currentMouseX - (rect.right - scrollTriggerArea);
        scrollSpeed = Math.min(maxSpeed, (dist / scrollTriggerArea) * maxSpeed);
    } else if (currentMouseX < rect.left + scrollTriggerArea) {
        let dist = (rect.left + scrollTriggerArea) - currentMouseX;
        scrollSpeed = -Math.min(maxSpeed, (dist / scrollTriggerArea) * maxSpeed);
    }

    if (scrollSpeed !== 0) {
        wrap.scrollLeft += scrollSpeed;
    }
    autoScrollFrame = requestAnimationFrame(checkAutoScroll);
}

```

---

## **14. Web Workerと計算エンジンのアーキテクチャ規格**

1. **Web Workerへの完全分離**: 最尤法・最大節約法・ブートストラップ解析など数秒以上を要する重負荷計算は、必ず専用Web Worker（例: `phylo_worker.js`）に分離し、定期的に `PROGRESS` イベントを送信して進捗バーを更新すること。
2. **計算リミッターと動的UIガードレール**: Worker側に配列数上限のハードリミットを設けるとともに、UI側でも「最尤法選択時はブートストラップ100回以上を `disabled` にする」等の動的ガードレールを敷くこと。
3. **60fps UIのための「事前計算（プレキャッシュ）」アーキテクチャ**: スライダー操作でリアルタイム変動するシミュレーターでは、起動時または条件変更時に全ステップの本物の計算結果を配列へ事前一括計算（プレキャッシュ）し、`oninput` 時は配列参照 `O(1)` のみで60fps描画を行うこと。

---

## **15. PWA・ネイティブアプリ化（質感・触覚・端末制御・Service Worker自律更新）規格**

### **15.1 メタタグ＆共通CSSレイアウト補正（View Transitions API 統合）**

全アプリの `<head>` と `<style>`、`<script>` に以下を標準適用する。

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#1a252f">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="BioEdu">
<link rel="apple-touch-icon" href="icon-192.png">

```

```css
/* 白飛び防止・ラバーバンド（バウンス）完全排除・100dvh固定 */
html { background-color: #1a252f; overscroll-behavior: none; touch-action: manipulation; height: 100%; height: 100dvh; }
body { background-color: var(--bg-color); overscroll-behavior: none; touch-action: manipulation; height: 100%; height: 100dvh; animation: pageFadeIn 0.15s ease-out forwards; }
@keyframes pageFadeIn { from { opacity: 0.85; } to { opacity: 1; } }
*, *::before, *::after { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

/* 不要なテキスト選択の封印（入力欄のみ許可） */
body.no-select-ui { user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
input, textarea, [contenteditable="true"] { user-select: text; -webkit-user-select: text; }

.content-area {
  flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain; padding-bottom: calc(120px + env(safe-area-inset-bottom, 0px));
}

/* MPA用SPA風シームレス画面遷移 (View Transitions API) */
@view-transition { navigation: auto; }
::view-transition-old(root) { animation: 90ms cubic-bezier(0.4, 0, 1, 1) both fade-out; }
::view-transition-new(root) { animation: 210ms cubic-bezier(0, 0, 0.2, 1) 90ms both fade-in; }
@keyframes fade-out { from { opacity: 1; } to { opacity: 0; } }
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }

/* ボタンの沈み込み（ハプティクス連動） */
.btn:active, .sidebar-action-btn:active { transform: scale(0.97); }

```

```javascript
function triggerHapticFeedback() {
    if (navigator.vibrate) navigator.vibrate(10);
}

```

### **15.2 ネイティブアプリライクUI/UX・端末制御7大規格**

1. **長押し・右クリックメニューの完全封印**: `<input>`, `<textarea>`, `[contenteditable="true"]` 以外での `contextmenu` イベントを `preventDefault()` で抑制する。
2. **OSネイティブキーボードの最適化**: 数値入力欄には `inputmode="numeric"` または `inputmode="decimal"`、検索・送信欄には `enterkeyhint="search"` / `"go"` を付与する。
3. **スワイプバック（エッジスワイプ）の無効化**: `overscroll-behavior-x: none;` によりブラウザの履歴バックジェスチャーと波形操作等の干渉を防ぐ。
4. **スクロールバーの極細化・非表示化**: `::-webkit-scrollbar` でiOS風の極細バーまたは非表示に統一する。
5. **Web Share API の活用**: 共有機能には `navigator.share({ title, text, url })` を使用する。
6. **画面スリープ防止（Screen Wake Lock API）**: 長時間計算中は `navigator.wakeLock.request('screen')` で画面暗転を防止する。
7. **Sticky Hover 対策**: `@media (hover: hover)` を用いてマウス環境のみホバーを有効化し、タッチ端末でのホバー残り現象を防ぐ。

### **15.3 PWA Service Worker自律更新検知＆非侵入型アップデート通知UI規格**

* 共通基盤モジュール `js/pwa_updater.js` およびルート `sw.js` で一元管理する。
* 新規 Service Worker の `waiting` 検知時、授業操作を妨げない画面下部フローティングバナー（`z-index: 9999`）に「新しいバージョンが利用可能です」＋ `[今すぐ更新]` `[後で]` ボタンを表示する。
* `[今すぐ更新]` 押下時のみ `{ action: 'skipWaiting' }` を送り、リロード後も第7.3項のローカル要塞データから100%作業状態を復元（Zero Data Loss）させる。

---

## **16. 教育的シミュレーション・分野別専用UX規格**

* **5大UX基本原則**:
1. **ソフトな足場掛け（Soft Scaffolding）**: 作業を止める「解答必須クイズ（ハードブロック）」は原則採用せず、`[?]` ポップオーバーとオンデマンド解説パネルで思考を支援する。
2. **動的解釈パネル**: 算出された統計値（$p$値やMantel $r$値等）に応じた生物学的推測シナリオを動的に提示する。
3. **ブラッシング＆リンキング**: 多変量プロットや系統樹の枝へのホバーを別プロットへリアルタイム連動させる。
4. **What-If 仮説検証**: D3.jsによるドラッグ・シークバー操作でのリアルタイムモーフィングを提供する。
5. **Progressive UI/UX（カセット方式）**: 機器シミュレーションでは「① レガシー・ハードウェア型（テンキー手打ち）」「② 直感・タッチスクリーン型（ノード直接ドラッグ）」「③ PCソフトウェア・高機能型（一括設定・俯瞰比較）」の段階的切り替えを推奨する。



### **16.1 2Dデジタイザ画像計測・直感連携規格（Fluid Digitizer UX Standard）**

1. **初期ステート未選択の徹底**: デジタイザ起動時や画像読込直後は、部位計測モード（A/B/C等）を未選択（グレーの `.btn-secondary`）とし、誤クリック描画を防止する。
2. **部位ボタン押下時の自動全画面化（Zero-Click Fullscreen）**: 画像が存在する状態で部位ボタン（A/B/C等）が押された瞬間、ボタンのアクティブ化（黄色 `.btn-primary`）と同時に全画面ダークオーバーレイ（`fixed inset-0 z-[99999] bg-slate-950/95`）へ自動拡大移行させる（独立した全画面ボタンの常時配置は禁止）。
3. **ツールバーの右寄せ配置**: 左側に「計測部位:」ラベル、右側に部位ボタン群（A/B/C）と「クリア」ボタンを `justify-between` で配置する。
4. **数値インライン点灯＆ワンクリック自動復帰（Instant Copy & Restore）**: 計測点（2点または角度4点）のプロット完了時、数値テキスト（`○○.○ px` / `○○.○°`）そのものをテーマカラー黄色（`#f1c40f`）で点滅発光（`animate-pulse`）させる。この点滅数値をタップした瞬間、純粋な数値のみをクリップボードへコピーすると同時に全画面を自動縮小して元の画面へ復帰させ、復帰後は点滅を停止（`text-slate-800`）させる。
5. **クリアによる初期化復帰**: 全画面表示中に「クリア」が押された場合は、計測点と部位選択をリセットして通常画面へ自動復帰させる。

### **16.2 3Dタンパク質複合体・内部構造可視化規格（Trans-Surface Standard）**

1. **ワンクリック到達**: 「表示スタイル」のボタングループに独立した「半透明表面」モードを設置し、スライダー調整なしのワンクリックで到達可能にする。
2. **教育的複合描画（内部骨格の明示）**: 「半透明の分子表面（Molecular Surface）」と、その内部の「不透明なリボンモデル（Cartoon）」を必ず重ねて複合描画し、四次構造のボリューム感と二次構造の配置を同時に視覚化する。
3. **リガンドおよび突然変異部位の空間的強調**: ヘム等のリガンド、結合DNA、および指定された「突然変異部位（アミノ酸残基）」は、不透明で目立つ色の空間充填（Sphere）やスティック（Stick）で描画し、半透明表面を透過・貫通して明確に視認させる。

### **16.3 環境メタデータ動的カラーマッピング＆絵文字フリー学術凡例（Legend）規格**

1. **動的カラーマッピング**: アプリ⑩（Integrative Taxonomy Studio）において、外部メタデータ（環境TSV）を受け入れ、タングルグラムのリーフノード（円・文字）およびPCA散布図のプロット点を環境要因ごとに動的着色する。
2. **絵文字フリー学術凡例（`.env-legend`）**: 装飾絵文字を全廃し、SVG上部に「半径5pxの塗りつぶし円（`<circle r="5">`）＋ 11px太字テキスト（`<text>`）」を横並びで整然と自動描画する。
3. **ハイブリッド入力調停エンジン**: アプリ⑩の第4入力枠において、2列目の値が形態系統樹のリーフ名と一致する場合は「宿主-寄生虫対応表」、一致しない場合は「環境メタデータ」として自律判別・処理する。

---

## **17. トークン極限圧縮＆ハルシネーション物理防止アーキテクチャ規格**

AI（Gemini / Cline）を活用した持続可能な開発、APIコストの極限圧縮、およびコンテキスト破綻・ハルシネーションの物理遮断のため、以下の15項目を絶対法とする。

### **17.1 キャッシュ＆マルチLLMルーティング最適化**

1. **コンテキストキャッシュ規格**: 不変の指示書・本ガイドライン・用語規格はサーバーサイドキャッシュを前提とし、反復読み込みトークンを遮断する。
2. **モデル・ルーティング最適化規格**:
* **Web側司令塔（デュアル／トライコア運用）**: 日常・UI調整・指示書生成は前衛頭脳 `gemini-3.8-flash`（または `4 Argon` 標準）をメインとし、複雑な量的遺伝学数理設計や難解バグ解析時のみ後衛頭脳 `gemini-3.1-pro-preview`（または `4 Argon 思考レベル：高値`）を召喚する（※「Web側は常にPro固定」の旧規律は破棄）。
* **Cline現場職人（ファストフェイル運用）**: `gemini-3.6-flash`（Level 0）を標準巡航とし、1回の失敗または長考ループの兆候を検知した際は直ちに `gemini-3.8-flash`（Level 1〜2）へ昇格させて一撃で完了させる。
* **Level Local（オフライン・制限時フォールバック）**: 完全オフライン環境やAPIレート制限到達時は、ローカルLLM（`Ollama` / `qwen2.5-coder:32b`）への一時切り替えを許可する（1ファイル・1関数のマイクロタスク限定）。
* **Level 4（緊急外科手術）**: モジュール崩壊や難解なD3.js競合時のみ、Cline上で `Anthropic API (Claude 3.7 Sonnet)` を単一ファイル限定で特例召喚する。**上位モデル切替時は雪だるま式課金を防ぐため、必ず直前のClineチャットをClearしてから投入し、完了後は即座にLevel 0へ復帰させること。**


3. **非同期バッチ処理規格（Batch API）**: 即時性を要しない全アプリ一括テスト生成等はバッチAPI（50%OFF）を活用する。
4. **ハイブリッド・ルーティング規格**: 構文Lintや単純整形はローカルスクリプトで処理し、クラウドAPIリクエストを最小化する。

### **17.2 入出力コンテキスト極小化・保護**

5. **ポインタ参照・差分指定規格**: Clineでの100行超ファイル全体読込を禁止し、行番号指定または `git diff` 差分のみを受け渡す（※Web版Geminiへの初期相談時におけるファイル全文貼付はユーザー負担軽減のため特例許容し、司令塔側で自律的に骨格化する）。
6. **コード骨格化規格**: 設計把握時は実装を省略したインターフェース骨格のみを扱う。
7. **AST関数スコープ限定抽出規格**: 複雑なロジック改修は抽象構文木（AST）単位で対象関数のみを切り出し、周囲のコードの巻き添え破壊を遮断する。
8. **プロンプトXML・記号化規格**: Cline指示書は `<task>`, `<instruction>` 等の高密度XML構造で記述する。

### **17.3 データ・ログ前処理と運用防壁**

9. **前処理・ログ要約とWeb側生ログ全文受容特例**: Web版Gemini（司令塔）へのエラー報告時は、ユーザーに切り抜き作業を強いることを禁じ、ターミナル生ログやCline報告書の丸ごと貼付・添付を受け入れて司令塔側が原因を特定・蒸留する。
10. **巨大データ強制トランケーション規格**: 長大なFASTA塩基配列・アミノ酸配列・Base64・JSONは、生データ全投入を禁じ、先頭5行・末尾5行＋`... [中略: 配列長N] ...` に切り詰める。
11. **ワンショット・コンテキストリセット規格（リカバリー継続特例付き）**: 1タスク完了（Case A）または白紙撤回（Case C）ごとにチャット履歴を必ずClearする。修正・リカバリー継続中（Case B）のみ文脈保持のためチャットを継続する。
12. **ワークスペース自律クリーンアップ＆2ファイル常駐規格**: 一括改修スクリプトは常に単一の `scripts/_patch_runner.py` を再利用し、実行後は直ちに `python3 scripts/cleanup_audit.py --apply` で自動消去する。`scripts/` 内は `master_compliance_audit.py` と `cleanup_audit.py` の2ファイル常駐制とし、アーカイブ蓄積を全面禁止する。
13. **検証後ネクストアクション3分岐規格**: 司令塔が出力するすべての指示書末尾には、動作確認後の行動指針（Case A: Git Commit & Push / Case B: 生ログ丸ごとリカバリー / Case C: `git restore .` による即時白紙撤回）とチャットClear/継続指定を必ず明記する。

### **17.4 クレジット安全運用およびマルチLLM統合防壁（`.clinerules` / `CLAUDE.md`）**

14. **Google AI Studioクレジット安全運用**: コンソール上で必ず上限予算設定（Usage Limits / Budget Alerts）を有効化し、APIキーの権限最小化と流出防止を徹底する。
15. **マルチLLM統合防壁とコア資産ホワイトリスト保護**: いかなるLLMが接続された場合でも本ガイドラインが自動適用されるよう、ルート直下の `.clinerules` および `CLAUDE.md` を常時同期配備し、コア資産（全14アプリHTML、`lib/`、`js/`、`docs/`）をホワイトリスト保護する。

---

## **18. ダイアレル交配分析（Diallel Analysis）・G×Eモデル拡張規格**

Phase 5: Statistical Genetics Lab（アプリ⑫）において、ゲノム育種・量的遺伝学の重要概念である「組合せ能力」および「相加的・非相加的遺伝変異」をシミュレーションするため、以下の規格を制定する。

### **18.1 ダイアレル分析の数理モデル規格**

1. **標準採用モデル（Griffing Method 2 / Model I）**:
* 親系統 $p$ 系統およびそのF1後代（正逆交配を含まない片側交配：合計 $p(p+1)/2$ 組合せ）を対象とする「Griffingの第2法・固定効果モデル」を標準計算エンジン（`lib/bio_math_engine.js` に実装）とする。


2. **出力指標と数理要件**:
* **一般組合せ能力（GCA: General Combining Ability）**: 各親系統の相加的遺伝効果（相加的変異）を反映したGCA効果値 $\hat{g}_i$ を算出する。
* **特定組合せ能力（SCA: Specific Combining Ability）**: 特定ペア間における顕性効果（dominance effect）および非相加的相互作用を反映したSCA効果値 $\hat{s}_{ij}$ を算出する。
* **高親ヘテロシス（High-Parent Heterosis）**: 両親のうち高い方の親に対するF1の優越率（雑種強勢度合い）を百分率（%）で算出する。
* **ダイアレル分散分析表（Diallel ANOVA）**: GCA要因、SCA要因、および誤差分散（または反復間誤差）に対する平方和（SS）、自由度（df）、平均平方（MS）、$F$値を算出して表形式で提示する。



### **18.2 用語規格の厳格死守（日本学術会議2025年版準拠）**

* 「優性」「優性効果」「優性分散」の表記を**完全禁止**とする。
* ヘテロ接合体における非相加的効果およびSCA効果の解説においては、必ず「**顕性効果（dominance effect）**」「**顕性分散**」「**相加的効果（相加的変異）**」の用語を使用すること。

### **18.3 UI設計およびコンテキスト分離規格**

1. **解析モード切替（Tabs/Radio）**: アプリ⑫の上部に「G×E 相互作用解析（AMMI / 反応規範）」と「ダイアレル交配分析（Diallel）」の切り替えUIを配置し、作業コンテキストを完全に分離する。
2. **ダイアレル入力インターフェース**: 親系統×親系統のハーフマトリクスグリッド入力、またはTSV貼り付け枠（`Parent_1`, `Parent_2`, `Trait_Value`）を採用し、データフォーマット不一致時のアシストパネルを配備する。
3. **可視化モジュール**: 親系統ごとのGCA効果棒グラフ、組合せごとのSCA効果ヒートマップ／散布図、およびダイアレルANOVA表を統合提示する。