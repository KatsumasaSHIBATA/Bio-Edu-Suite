# **🎨 Bio-Edu Suite 統合UI/UX・開発ガイドライン (v34.4_2026-08-31:最新版)**

本ガイドラインは、Bio-Edu Suite内の全アプリケーションにおける視覚的な一貫性（UI）、操作感の統一（UX）、データ連携、および日本学術会議の公式資料「高等学校の生物教育における重要用語の選定について（2025年版）」に完全に準拠した教育的価値を担保するための「共通規格書（絶対の法律）」です。

## **【改訂・サルベージ履歴】**

* **v34.4 (2026-08-31):** MPAのSPA風画面遷移（View Transitions API）の標準化、タブレット縦表示のドロワー完全隠蔽、フレキシブルグリッドの導入、タッチターゲットの厳格化、ラバーバンド効果の完全排除。
  * **\[MPAのSPA風画面遷移（View Transitions API）\]**: `@view-transition { navigation: auto; }` および `::view-transition-old/new` によるシームレスなスライド・フェードアニメーションを共通規格として標準化。
  * **\[タブレット縦表示のドロワー完全隠蔽\]**: スマホ用完全隠蔽（`-280px`）のブレイクポイントを `max-width: 1024px` へ引き上げ、タブレット縦表示（Portrait）およびスマホ表示時の共通仕様として再定義。PC用のホバー展開は1025px以上のみに限定。
  * **\[フレキシブル・グリッドの導入\]**: 左右分割の固定比率（35:65）に加え、`grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));` 等のフレキシブル・グリッドを標準レイアウトとして定義し、狭い画面での自動縦スクロール移行を義務化。
  * **\[タッチターゲットの厳格化\]**: Apple/Googleのヒューマンインタフェースガイドラインに準拠し、タップ可能な要素（ボタン等）は最小高さ44px（モバイルでは48px）を確保する厳格ルールを制定。
  * **\[ラバーバンド効果の完全排除\]**: `html, body` に対する `overscroll-behavior: none;` の完全適用により、iOS Safari等のスクロールバウンス（ゴム紐現象）を完全に無効化。
* **v34.3.3 (2026-08-28):** ハンバーガーボタンの配色と、ドロワー内アイコンの縦センターラインを規定。ホバー時は背景のみ変化させテキスト色は変えない。閉鎖時（幅60px）のハンバーガー・ナビ・最下部アクションの全アイコン中心を **30px（サイドバー中央）** に揃える。
* **v34.3.2 (2026-08-28):** ハンバーガーアイコンの切り替え条件を訂正。**ホバーでは切り替えない**（未固定・ホバー時はいずれも「≡」を維持し、`.pinned` / `.open` のときのみ「×」へ切り替える）。これに伴い第5項-2 および v34.1／v34.3.1 の「ホバー時も×へ切り替える」規定を撤回する。
* **v34.3.1 (2026-08-28):** グローバル・ドロワー内のデザインと開閉挙動の統一（第5項へ「ドロワー内 区切り線・ハンバーガー状態管理」の補完規格を新設）。
  * **\[区切り線カラーの一元化\]**: `.nav-header` および `.sidebar-footer-actions` の区切り線をフェーズカラーから共通の薄い灰色 `rgba(255,255,255,0.05)` へ統一。旧世代の `.nav-header.pN { border-top-color: rgba(<フェーズ色>,0.2) }` が詳細度で勝ち残る問題を明記し、上書き時の必要詳細度を規定。
  * **\[区切り線の開閉連動\]**: 閉鎖時（幅60pxのアイコンのみ表示）は区切り線を隠し、展開時（`:hover` / `.pinned` / `.open`）のみ表示する。
  * **\[ハンバーガー状態管理の厳格化\]**: 閉鎖時は「≡」、展開時（`:hover` / `.pinned` / `.open`）は「×」のみを表示。`:hover` を含めることを必須とし、×の色は `.hamburger-btn` から継承（白）で統一。
* **v34.3 (2026-08-27):** PWAネイティブUIの極致化とクロスアプリ認証の永続化。  
  * **\[ネイティブUIの完コピ規格\]**: iOSステータスバー同化メタタグ、100dvh固定によるフッター押し出しバグ修正、スクロールバウンス抑制などの完全なコードを第15項へ追加。  
  * **\[ドロワー＆ヘッダーのHTML固定\]**: `index.html` を見ずとも全アプリでUIを完全再現できるよう、第5項へグローバル・ドロワーとヘッダーの完全なHTML構造（ご意見箱、データ初期化含む）を明記。  
  * **\[認証の永続化とモーダル規格\]**: `auth_sync.js` のセッション復旧に対応（自動匿名化の廃止）し、タブやアプリを跨いでもログイン状態を完全に維持するため、第7項および第8項にログインパネルのHTMLと必須ID群、モジュール読み込みロジックを完全規定。  
* **v34.2 :** グローバル・ドロワーのUX極致化とフルードレイアウト完全移行。   
  * **\[Peg Menuの完全統一\]**: ダッシュボードを含む全アプリでHTML構造を統一し、`<body>`のクラスで制御。ハンバーガーアイコンはドロワー最上部右端へ移設し、展開状態に応じて「≡」から「×」へ切り替える（スマホ時は完全に画面外へ隠蔽し、ヘッダーに開閉ボタンを新設）。   
  * **\[フルードレイアウトとフリッカー対策\]**: ヘッダーの `max-width` を撤廃し左右端寄せを徹底。また、ホバープレビューのガタつき（無限点滅）を防ぐため `pointer-events: none` とGPUアクセラレーションを義務化。  
  * **\[ネイティブConfirm全廃とフッター統一\]**: ブラウザ標準の警告アラートを禁止しカスタムモーダルへ移行。フッターはダークテーマの `.footer` へ統一。  
  * **\[アプリ番号とSVGの規格\]**: ドロワー内のナビテキストにはアプリ番号（①、②等）を明記する。Phase 1（ダッシュボード）の公式SVGを解禁。  
* **v34.1 :** UIのフリッカーバグ解消とフルードレイアウトへの完全移行。   
  * **\[ヘッダーのフルード化\]**: 大画面閲覧時でもヘッダー要素が不自然に中央へ寄らないよう、`max-width` 制限を完全に撤廃。100%幅で左右両端（flex-start / flex-end）へ確実に吸い付く設計へ改定。   
  * **\[フリッカー現象の完全排除\]**: サンプル画像ホバー時の無限点滅（画面全体のガタつき）を防ぐため、プレビューUIに対する `pointer-events: none;` （当たり判定の無効化）の適用を義務化。あわせて主要カード要素に GPUアクセラレーション (`will-change: transform`) を規定。   
  * **\[ドロワーUXの極致化\]**: 展開時のナビ見出し（Phase等）にテーマカラーを復元。また、ハンバーガーアイコンはすべての展開状態（ホバー、ピン留め、スマホ表示時）において「≡」を完全に隠蔽し、「×」のみを表示するよう状態管理を厳格化。  
* **v34.0 :** ハンバーガーアイコンの回帰とスマホUIの最適化。   
  * **\[ハンバーガーアイコンの挙動\]**: 奇をてらったアイコンを廃止し、オーソドックスな「三本線（≡）」へ回帰。ピン留め（固定）時はアイコンを「×（閉じる）」へ変化させる。   
  * **\[ヘッダーの左寄せとスマート化\]**: ヘッダー内のタイトルグループを「常に左寄せ（flex-start）」に固定。右上のアカウントボタンは、スマホ表示時にテキストを隠し「👤アイコンのみ」へ縮小するレスポンシブ設計を導入。   
  * **\[スマホ時のPeg Menu無効化\]**: スマホ表示時（768px以下）は「付箋のチラ見せ（60px幅）」を完全に廃止し、画面外（-280px）へ完全に隠蔽するオーソドックスなドロワー挙動へ回帰。  
* **v33.9 :** UIの最終仕上げとハリボテの解消。   
  * **\[フッターの完全統一\]**: `lab_packs_2.html` の洗練されたフッター（1pxの控えめなボーダーと色合い）を全アプリ共通の `.footer` 規格として制定。   
  * **\[アカウント・同期設定の実装\]**: ヘッダー右上のボタンをハリボテから実働するモーダル呼び出し（`openAccountSettings`）へ変更。アイコンは特例として `👤` 絵文字を許可。  
* **v33.8 :** Peg MenuのUXマイクロチューニング。   
  * **\[スクロールバーの隠蔽\]**: ドロワー閉鎖時（60px幅）に発生する醜い縦スクロールバーをCSS（`::-webkit-scrollbar`）で完全に不可視化し、美観と操作性を両立。  
  * **\[ハンバーガーのアンカー固定と回転\]**: 開閉によるアイコンの「ズレ」を防ぐため、ハンバーガーボタンを「常に左から16px」に固定。ピン留め・展開時には90度回転（`rotate(90deg)`）するアニメーションを追加。   
  * **\[アプリ番号の復活\]**: アプリ内の説明との整合性を保つため、展開時のナビゲーションテキスト（.nav-text）にアプリ番号（①、②等）を復活。  
* **v33.7:** 次世代ドロワー（Peg Menu）の完全体への進化。  
  * **\[Peg MenuのUX極致化\]**: 第5項を刷新。ハンバーガーボタンをドロワー最上部へ移設し、ナビゲーションアイテムを「SVGアイコン＋テキスト」の構成に変更。閉鎖時（60px）はSVGのみが残る付箋（Sticky）UIを規格化。  
  * **\[ガタつきの完全排除\]**: メインコンテンツに `margin-left: 60px` を確保し、展開時はコンテンツを押し退けずオーバーレイする滑らかなアニメーション（cubic-bezier(0.25, 1, 0.5, 1)）を規定。  
  * **\[フッターとタイトルの洗練\]**: アプリ番号（①②等）をナビや `<title>` から全廃。フッターを `lab_packs.html` 準拠の `.footer` クラスへ完全統一。  
*   
* **v33.6:** プロトタイプ検証に基づくUIのスマート化。  
  * **\[Peg Menuの完全統一\]**: 第5項の「ダッシュボード時の固定特例」を廃止し、全アプリで幅60pxの細帯スタート＋ハンバーガー開閉に統一。  
  * **\[ヘッダー・フッターの洗練\]**: グローバルフッター（.system-status）をダークテーマに規定。ヘッダー内の `[?]` ポップオーバー設置を禁止。ヘッダー右上のアカウント機能は1つのボタンへ集約。  
  * **\[Phase 1 SVGの解禁\]**: 第2項および第9項において禁止されていたダッシュボードのSVGアイコンを解禁し、専用のダッシュボードSVGを公式制定。  
* **v33.5 (2026-08-25):** クラウド連携のハイブリッド化とネイティブアプリUI/UXへの完全昇華。  
  * **\[外箱の完全共通化とPeg Menu\]**: 第5項を改訂。ダッシュボードを含む全アプリでヘッダー・ドロワーのHTML構造を統一し、`<body>`のクラス（.dashboard-mode / .app-mode）で振る舞いを制御。「ぬるっと」展開するペグ・メニュー（ホバー展開＆クリック固定）規格を制定。  
  * **\[二重UIの排除とアクション集約\]**: ドロワー内の簡易ヘッダー・フッターを全廃し、ドロワー最下部へ「💬 ご意見箱（Googleフォーム動的連携）」と「🗑️ データ初期化（要確認ダイアログ）」を集約。  
  * **\[ハイブリッド・クラウド連携\]**: 第7項にFirebase（Firestore/Auth）を用いたリアルタイム同期と、学校のネットワーク制限を回避する「完全オフライン・ファースト（ローカル自動フォールバック）」のハイブリッド設計を明文化。  
  * **\[PWAネイティブ質感の追求\]**: 第15項を新設。ブラウザ特有の挙動（テキスト選択、バウンススクロール）をCSSで封印し、マイクロインタラクション（沈み込み・振動）とノッチ同化による「本物のアプリ体験」を義務化。  
* **v33.4:** UIノイズの低減とヘッダーレイアウトの厳密化。   
  * **\[バージョン表記の集約\]**: ダッシュボード（アプリ①）以外の全アプリにおいて、ヘッダー右上のバージョンバッジ（`.version-badge`）を廃止し、フッターのみの表記へ集約。   
  * **\[ヘッダーレイアウトの固定化\]**: トップバー内のハンバーガーボタン、アプリタイトル、副題（Phase説明）の配置、余白、フォントサイズに関するCSS規定を明確化。  
* **v33.3:** シングルページ・エコシステムの確立とナビゲーションの刷新。   
  * **\[別タブ遷移の全廃\]**: スイート全体を一つの学習空間として統合するため、ダッシュボードから各アプリへの `target="_blank"` による別タブ遷移を原則禁止。   
  * **\[グローバル・ドロワーの規格化\]**: 第5項を大幅改編し、全アプリ共通の「ハンバーガーメニュー（ドロワー）」の挙動を規格化。ダッシュボードは「デフォルト展開（玄関）」、個別アプリは「デフォルト格納・クリックでピン留め（作業領域最大化）」のUXを厳格に定義。  
* **v33.2 (2026-08-23):** 開発効率とUXの最適化。   
  * **\[出力プロトコルの最適化\]**: 第0項に、コードサイズが150KB未満の場合のMVC分離適用除外ルール、および数箇所の軽微な修正におけるスニペット（Before/After）出力の原則を明文化。   
  * **\[SVGアイコン重複の解消\]**: 第2項の「EXTRA (Lab Packs用)」SVGアイコンがPhase 6（六角形）と類似・重複していた問題を解消し、新たに「アーカイブ型」のSVGを公式規定。   
  * **\[スマートフォンUXの最適化\]**: 第5項に、スマートフォン閲覧時のレイアウト崩壊を防ぐため、`viewport`による強制PC表示（width=1024）および、JS駆動による警告オーバーレイ（突破ボタン付き）の実装を大部分の解析アプリアプリに義務化。  
* **v33.1 (2026-08-22):** 学術プラットフォームとしての信頼性を担保するため、第9項⑥に「学術クレジット（References）のUI規格」を新設。計算エンジンに用いられている原著論文を、UIのノイズにならないアコーディオン形式で明記することを義務化。  
* **v33.0 (2026-08-21)**: アプリ⑧（Phylogenetic Tree Builder）の実装過程におけるAIの出力限界と教育的偽装（ハリボテ）問題を根本から解決するためのパラダイムシフト。   
  *  **\[HTML/JSの完全MVC分離\]**: AIの息切れを防ぐため、HTMLからUI制御JSを外部ファイル（`_ui.js`）へ完全分離するルールを第0項に制定。   
  *  **\[計算の偽装禁止とプレキャッシュ\]**: スライダー等のUIを軽くするための「二次関数や固定値による偽装」を厳禁とし、本物の数学ロジックと「事前計算（プレキャッシュ）」を用いる規格を第14項に新設。  
  *  **\[UIガードレールとWorker分離\]**: 重負荷計算のWeb Workerへの完全分離と、計算量に応じたUI側での動的な制限（リミッター）の連動を第14項に規定。   
  *  **\[教育的UXの極致\]**: 思考を奪う「解答表示ボタン」の原則禁止、および文脈（選択アルゴリズム）に応じた\[?\]パネルの動的切り替えルールを第6項に新設。  
* **v32.2 (2026-08-18)**: 手動バケツリレー時のデータ迷子を完全に防止するため、第7項に「連携データのメタデータ自動刻印」規格を新設。コピーされるJSONやTSVファイル内にデータの出所（source）を必ず含め、ペースト先のUIで出所を明示する仕組みを義務化。  
* **v32.1 (2026-08-14)**: 現場の違和感に基づくUI/UX手動チューニングと、日本学術会議2025年版重要用語規格の絶対防衛プロトコルを統合。   
  *  **\[ヘッダーSVG崩れの解消\]**: 第2項に、SVGが親要素の影響で巨大化するのを防ぐ `.header-icon` の絶対寸法指定（`width: 24px; height: 24px; flex-shrink: 0;`）を規定。   
  *  **\[ステータス連動型ボタン\]**: 第9項②に、条件クリア前（無効時）の不要なホバー発色を完全に封じる「動的発色ルール」を追加。   
  *  **\[スマートフィットの例外許可\]**: 第11項②のフィット規定を緩和し、サイドパネル内の主要実行ボタンに限り、クリック領域最大化による操作性向上のための `width: 100%;` を明示的に許可。   
* **v32.0 (最新2026-08-13)**: システムアーキテクチャおよびUI/UXの根本的パラダイムシフトを反映。  
  * **\[アーキテクチャの進化\]**: 第0項に「共通数学エンジンへのMVC集約」、第7項に「LIMS思想と手動バケツリレー規格」を追記し、自動連携を原則禁止。  
  * **\[タイポグラフィ・絵文字の廃止\]**: `<title>` およびヘッダーにおける装飾絵文字を完全廃止し、アプリ番号（①〜⑬）を冠する形式に統一（ダッシュボード・Lab Packsは例外）。  
  * **\[SVGアイコンの厳格化\]**: 各Phaseを象徴するSVGアイコンコードを第2項に完全固定化。Phase 1はアイコン無し、Extraは専用キューブ型を指定。  
  * **\[UIパーツの寸法定義\]**: 第9項①にて、実行ボタン（▶︎）、ドロップゾーン（2px dashed, 横並び1行, max-width: 450px）、貼り付け枠（1px solid, min-height: 100px）のCSS/UX仕様を厳密に定義（Alignment Print Studioの横幅例外を含む）。  
* **v31.0 (2026-08-07)**: 現場の違和感からの進化を反映。第6項①のポップオーバー見出しに「【】（隅付き括弧）」を用いた柔軟な小見出しルールを新設。第11項②にトグル・類似機能ボタンの「ボタングループの幅同期（スマートアライメント）」を規定。  
* **v30.0 (2026-08-06)**: 開発プロセスの標準化とバージョン管理の厳格化。第0項に「チートシートに基づく開発フローの遵守」を追加。第9項④に「アプリのバージョン表記と適用ガイドラインバージョンの完全同期」を絶対ルールとして規定。第13項のオートスクロール計算式を、より滑らかな線形補間方式（Phase 5ベース）へ標準化。  
* **v29.2 (2026-08-04)**: 第6項⑦および第9項③において、ステップアップUIのテキストを「より高度な解析ツールへ」へ厳格に修正・統一。先祖返りを防ぐための完全リカバーを実施。  
* **v29.1 (2026-08-04)**: 第6項①「根拠 (Rationale ポップオーバー)」にテキスト・書式規定を新設。配色・フォントサイズ（11px）の明文化と、UI手順（丸数字）との混同を避けるための「・（中黒）」による箇条書きルールを厳格化。  
* **v29.0 (2026-08-04)**: UIの視覚的洗練と情報構造の明確化。第9項に「見出しの階層的ナンバリング（ローマ数字→アラビア数字→丸数字）」を規定。第11項に「ボタン・入力窓の文字へのフィット（固定幅の禁止）」および「ボタン形状（角丸4px、通常時影なし）の厳格化」を追記。  
* **v28.1 (2026-08-04)**: バイオインフォマティクスツールとしての正確性を担保するため、第11項のタイポグラフィ規定を厳格化。「通常の文字フォント（全角日本語・半角英数字）」と「塩基配列・アミノ酸配列表示用の等幅フォント」の使い分けを明文化。  
* **v28.0 (2026-08-03)**: 長大な配列データ（Sanger Trace等）を扱うビュアーの操作感向上のため、第13項として「インタラクション＆描画修正 仕様書」を新設。requestAnimationFrame を用いた可変スピード型エッジオートスクロールの計算・発火条件を規格化。  
* **v27.0 (2026-08-03)**: UIの微細な揺らぎを排除するため、共通UIコンポーネント（第9項）、レイアウト・余白（第10項）、タイポグラフィ・状態（第11項）、Z-index階層（第12項）の4項目を新設。既存の第2項・第4項・第6項と重複する箇所を整理し、完全なマスター規格として統合。  
* **v26.5 (2026-08-03)**: ユーザーの心理的安全性と操作の直感性を担保するため、第4項として「ボタン・カラー意味論（トーン＆マナー規定）」を新設。全アプリにおけるボタン配色の決定基準を5つの機能（Primary, Success, Danger, Theme/Info, Secondary）に厳格化。  
* **v26.4 (2026-08-03)**: UIの役割明確化のため、青い左ライン（border-left）を持つパネルを「現場のコツ（.bench-tip）」専用デザインとして定義。また「発展学習」のUIを .step-up-card として刷新。共通のヘッダー（SVGアイコン＋タイトル）と可変の紹介テキストという構造を全アプリ共通の規格として制定。  
* **v26.3 (2026-08-02)**: インフォメーションアイコン（ℹ️のsvg）のカラー同期ルールを追加。.svg-info の色指定を color: inherit; とし、アイコンが独立して発色（緑色等）せず、親要素である隣接テキスト（赤やオレンジ等）と自然に同化する仕様へと洗練化。  
* **v26.2 (2026-08-02)**: ユーザーフィードバックに基づき、UIのノイズ低減と情報レイヤーの明確化を実施。「.dynamic-hint のフラットデザイン化とアイコン撤廃」を新設。HTML上のインラインスタイルの完全削除、およびJSからのSVG挿入廃止を規定（※.bench-tip は維持）。  
* **v26.1 (2026-08-02 リカバー版)**: 2025年版PDFの精読に基づき、第1項に「常用漢字外の平仮名表記（血しょう、かく乱等）」および「T/Bリンパ球等の同義語の扱い」をサルベージして追記。同時にSVGアイコン（💡, ℹ️）の役割に対応する厳密な色定義と専用CSSクラス（.svg-hint, .svg-info, .svg-danger）を第2項に統合。  
* **v26.0 (2026-08-01)**: ユーザーフィードバックに基づく【追加8項目】を適用。装飾絵文字の完全廃止とインラインSVGへの移行、ポップオーバーの動的幅算出と尻尾の追加、title属性の全廃、モーダル幅や出力ファイル名、アプリ相互参照テキストの修正など、各種UI/UX仕様を完全統一。  
* **v25.1 (2026-07-31)**: ツールチップの white-space 規定修正（日本語長文の折り返し対応）、連携キー仕様の確定（timestampの内包、デモデータのみの自動破棄ルール）など、実装上の齟齬を反映。

## **0\. 開発基本理念（Anti-Hallucination & Zero-Modification）**

* **破壊なき進化 (Zero-Modification)**: 既存のHTML構造、CSSの基本レイアウト、D3.js等の描画・アニメーションロジック、および計算エンジンは、**指定がない限り1文字も変更してはならない**。ガイドラインに基づくUI/UXのパッチ適用（局所置換・追記）のみを厳格に行う。  
* **勝手なリファクタリングの禁止**: AIによる「コードの近代化」「CSSの整理」「独自の装飾追加」など、ユーザーの明示的な指示がない改変はバグの温床となるため一切禁ずる。  
* **チートシートに基づく開発フローの遵守【v30.0 新設】**: 本ガイドラインを適用した機能追加・改修・監査をAIに指示する際は、必ず別途定める「Bio-Edu Suite AI開発ワークフロー（完全版チートシート）」の4つの状況別プロンプトを使用し、必ず新しいチャットで実行すること。AIのコンテキスト崩壊によるハルシネーションを未然に防ぐための絶対ルールとする。  
* **共通エンジンへのMVC集約 (v32.0 新設)**: 各アプリ（View）のHTML/JSファイル内に固有の高度な数学計算（PCA、フーリエ変換等）やデータ処理ロジックを直接記述することを禁ずる。すべての重い計算と描画用補間ロジックは、必ず共通ライブラリである `lib/bio_math_engine.js` (Model/Controller) に集約し、各アプリはそれを呼び出して描画するだけの純粋なビューワーとして設計すること。  
* **教育的ハリボテ（計算の偽装）の絶対禁止【v33.0 新設】**: 教育シミュレーターにおいて、スライダーやアニメーションの「滑らかさ（60fps）」を優先するあまり、裏側のロジックを固定値や簡易な二次関数ででっち上げる（偽装する）行為を固く禁ずる。UIがどうであれ、裏側では「本物の数学・確率モデル（フェルゼンスタインのアルゴリズム等）」を確実に回し、真の算出結果を生徒に提示しなければならない。  
* **HTML/JSの完全MVC分離（180KBの壁対策）【v33.0 新設 / v33.2 改訂】**: AIのコンテキストウィンドウ圧迫による「コードの省略・息切れ・ハルシネーション」を防ぐため、140KBを超えるファイルについては、HTMLからUI制御JSを \[app\_name\]\_ui.js (Controller) へ物理的に完全に分離して開発を進めること。**※ただし、ファイルサイズが140KBを下回る場合は、分離のオーバーヘッドを避けるため1つのHTMLファイル内で完結させること。また、修正が数箇所の単純な変更で済む場合は、ファイル全体を出力するのではなく「変更前・変更後のコードスニペット」のみを提示し、手動コピペで対応させること。**  
* **広域一括改修時のトークン制限回避プロトコル（v34.4知見の法制化）**: 全アプリ（15ファイル以上）にまたがるCSS/HTML/JSの共通パッチ適用において、AiderやClineのコンテキストに全HTMLファイルを直接読み込ませることは、トークン上限（100万トークン）の逼迫・出力制限エラーの原因となるため原則禁止とする。複数ファイルの一括更新は、AIに安全な正規表現と二重適用防止ガードを備えた単一の実行スクリプト（`apply_patch.py`等）を出力させ、ターミナルで実行して一括置換を完了させる方式を標準SOPとする。スクリプト実行後は、存在しないファイルによる参照ループを防ぐため、速やかにスクリプトを削除し、簡潔な英語コミットメッセージでGit保存を確定させる。

## **1\. 日本学術会議（2025年版）用語・概念規格【絶対死守】**

「高等学校の生物教育における重要用語の選定について（2025年版）」に基づき、UI上のテキスト、ラベル、プレースホルダー、教育テキストは以下の基準を強制適用する。

1. **mutation と variation の厳格な区別 (PDF 注1・注4 準拠)**:  
   * **mutation**: 遺伝情報（塩基配列）が変化するプロセスそのもの。語名:**突然変異** / 別名:**変異**  
   * **variation**: mutationの結果として生じた、集団内における形質の違いや多様性。語名:**変異** / 別名:**多様性**  
   * **mutant**: 突然変異/変異によって生じた通常の形質とは異なる形質を持つ生物。語名:**突然変異体** / 別名:**変異体**  
2. **免疫系の表記 (PDF p.3\~4 準拠)**:  
   * 「細胞性免疫」「液性免疫」は重要語から削除されたため優先しない。  
   * 病原体に反応する **自然免疫** と、特異的な **獲得免疫（適応免疫）** の協調を最重要語として優先記述する。  
3. **分類群と遺伝 (PDF p.4\~5, 注2 準拠)**:  
   * 「古細菌」は現在の系統分類学的な理解と異なるため使用不可（注記2）。**アーキア** に統一。  
   * 「優性・劣性」は別名。語名である **顕性**・**潜性** に統一。  
4. **対象分子・配列の表記**:  
   * 「1D配列」「Sequence」等のIT用語は使用禁止。  
   * 総称としての「核酸」で濁さず、対象が明確な場合は **DNA**、**mRNA**、**タンパク質** と記述する。  
   * 配列は **塩基配列**、**アミノ酸配列** と表記する。  
    * **※例外事項**: ヘッダーの英語サブタイトル、学術クレジット（References）における原著論文名、およびプログラム内部の変数名・APIパラメーターにおける `Sequence` 等の使用は適用外（許容）とする。
5. **漢字・平仮名表記の規定 (PDF p.5 準拠)【v26.1 新規サルベージ】**:  
   * 学習指導要領や教科書での表記を優先し、常用漢字外の語については平仮名表記を語名とする。  
   * 例: UIテキストやラベルにおいて「血漿」→**血しょう**、「攪乱」→**かく乱**、「胚囊」→**胚のう** と記述すること。難解な漢字を強制してはならない。  
6. **同義語・別名の扱い (PDF p.4\~5 準拠)【v26.1 新規サルベージ】**:  
   * 免疫系: 「T細胞 / B細胞」は「Tリンパ球 / Bリンパ球」の別名でも広く知られているため使用可とするが、アプリ内では表記を統一すること。  
   * 遺伝・細胞: 「アレル (対立遺伝子)」「細胞質基質 (サイトゾル)」「調節タンパク質 (転写調節因子/転写因子)」などは、原則としてPDFの語名を優先し、必要に応じて括弧書きで別名を補足する。

## **2\. アイコン(SVG)およびタイポグラフィ規格**

* **絵文字の完全廃止 (v32.0 改定)**: HTML内のテキスト、ブラウザのタブ（`<title>`）、ヘッダー（`<h1>`）等、すべての場所において装飾目的のネイティブ絵文字（🧬、📊など）の使用を\*\*一切禁止（全廃）\*\*とする。  
* **インラインSVGへの完全移行**: 機能や意味を示す視覚要素は、外部フォントを使わず、親要素に同期する（`stroke="currentColor"` 等）シャープな「インラインSVG線画アイコン」に完全に置き換える。

**【システム標準インラインSVGの役割とカラー定義】**

SVGはネイティブ絵文字と異なり色を持たないため、アイコンが周囲のテキストと同化しないよう、以下の専用CSSクラスを用いて厳密なカラーリング（意味づけ）を行うこと。SVG要素には必ず `stroke="currentColor"` を指定し、親要素またはSVG自体に以下のクラスを付与する。

/\* インラインSVGアイコン用 共通カラークラス */ .svg-hint { color: var(--warning); } /* 💡 気づき・推奨用 (\#f39c12) */ .svg-info { color: inherit; } /* ℹ️ 情報・ルール用 (親要素のテキスト色を継承し自然に同化) */ .svg-danger { color: var(--danger); } /* 🚨 警告・エラー用 (\#e74c3c) \*/

**① 💡（ライトバルブ）相当のSVG: 「気づき」と「推奨ノウハウ」**

* **適用クラス**: `.svg-hint` （var(--warning) 暖色系オレンジ）  
* **使用SVG**: `<svg class="svg-hint" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1.45.62 2.84 1.5 3.5.76.76 1.23 1.52 1.41 2.5"/></svg>`  
* **使用場面**: `.bench-tip`（現場のコツ）のタイトル部分など。

**② ℹ️（インフォメーション）相当のSVG: 「仕様・ルール・通知」**

* **適用クラス**: `.svg-info` （親要素のテキストカラーに同期）  
* **使用SVG**: `<svg class="svg-info" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`  
* **使用場面**: アシストパネル内の補足テキストなど。

**③ アクション・操作用 SVGの完全固定化 (v32.0 規定)**

* **\[実行\] ボタン (▶︎)**: `<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`  
* **\[データ読込 / ドラッグ＆ドロップ\] エリア**: `<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>`

**【各フェーズのヘッダー公式SVG (v32.0 固定版)】** 各アプリのヘッダー `<h1>` 内で使用するSVGアイコンは、Phaseごとに以下のものを**一字一句違わず**使用すること。 また、SVGが親要素の影響を受けて巨大化しレイアウトが崩れるのを防ぐため、必ずCSSに `.header-icon { width: 24px; height: 24px; flex-shrink: 0; }` を定義しておくこと。

* **PHASE 1 (ダッシュボード)**: **PHASE 1 (ダッシュボード)**: `<svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`  
* **PHASE 2**: `<svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M8 3c0 4.5 8 4.5 8 9s-8 4.5-8 9"/><path d="M16 3c0 4.5-8 4.5-8 9s8 4.5 8 9"/><path d="M10 7.5h4M10 16.5h4"/></svg>`  
* **PHASE 3**: `<svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 21h18L3 3z"/><path d="M7 21v-2M11 21v-2M15 21v-2"/></svg>`  
* **PHASE 4**: `<svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3v18M8 21h8M4 7h16"/><path d="M4 7l-2 5h4z"/><path d="M20 7l-2 5h4z"/></svg>`  
* **PHASE 5**: `<svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 21h18"/><path d="M7 21V10M12 21V4M17 21V14"/></svg>`  
* **PHASE 6 (六角形)**: `<svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`  
* **EXTRA (Lab Packs用・アーカイブ型)**: `<svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="4" width="18" height="4" rx="2" ry="2"/><path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>`

## **3\. テーマカラー規格 (CSS Variables)**

各アプリの :root に以下の変数を必ず定義すること。

:root {    
  /\* 【共通】ベースカラー・ステータスカラー \*/    
  \--primary: \#2c3e50;      /\* ダークネイビー (主要テキスト) \*/    
  \--secondary: \#34495e;    /\* ネイビー (サブヘッダー) \*/    
  \--bg-color: \#f0f3f4;     /\* ライトグレー (背景) \*/    
  \--card-bg: \#ffffff;      /\* ホワイト (カード背景) \*/    
  \--text-main: \#2c3e50;    /\* メインテキスト \*/    
  \--text-muted: \#7f8c8d;   /\* 補足テキスト \*/    
  \--border-color: \#bdc3c7; /\* ボーダー \*/    
  \--success: \#27ae60;      /\* 成功・保存 \*/    
  \--danger: \#e74c3c;       /\* エラー・警告 \*/    
  \--warning: \#f39c12;      /\* ヒント・教育ポップオーバー \*/    
    
  /\* 【アプリ個別】フェーズカラー (--phase-color) の設定例 \*/    
  /\* Phase 1 & 2: \#1abc9c, Phase 3: \#3498db, Phase 4: \#8e44ad, Phase 5: \#e74c3c, Phase 6: \#e67e22 \*/    
}  

## **4\. ボタン・カラー意味論（トーン＆マナー規定）**

ボタンやアイコンの配色は「見た目の好み」ではなく「機能と結果（ユーザーの心理的安全性）」に基づいて以下の5つのルールに厳格に分類・統一する。これにより、「解析ボタンは何色か」「クリアボタンは目立たせるべきか」といった実装時の迷いを排除する。

1. 🟦 **Primary（青色系 / \#3498db 等）＝「前進・主要アクション」**  
   * **役割**: その画面における標準的な操作や、次のステップへ進むためのメインアクション。  
   * **適用例**: \[検索\] \[解析を実行\] \[次へ\] \[アライメント開始\]  
   * **心理効果**: 安全、標準、システムの実行。ユーザーが最も迷わず押せる色。  
2. 🟩 **Success（緑色系 / var(--success) / \#27ae60）＝「完了・保存・出力」**  
   * **役割**: 作業のゴール（最終成果物）を得るためのポジティブなアクション。  
   * **適用例**: \[FASTA保存\] \[PDFダウンロード\] \[結果を出力\]  
   * **心理効果**: 達成感、完了、手元に残る安心感。  
3. 🟥 **Danger（赤色系 / var(--danger) / \#e74c3c）＝「破壊・削除・警告」**  
   * **役割**: データが失われる、元に戻せない、またはデータの一部を切り捨てるような危険・注意を伴うアクション。  
   * **適用例**: \[削除\] \[初期化\] 手動カット(テキストやアイコンのアクセントとして)  
   * **心理効果**: 警告、立ち止まっての確認。（※ボタン全体を赤くするのは「本当に全て消える時」など最小限に留める）  
4. 🩵 **Theme / Info（テーマカラー / var(--phase-color) 等）＝「案内・教育的ヘルプ」**  
   * **役割**: 各Phaseのアイデンティティを示す色、または操作に影響を与えない「説明・学び」を引き出すアクション。  
   * **適用例**: \[?\]ボタン、現場のコツの枠線、ヘッダーライン  
   * **心理効果**: 知的、中立、助け舟。  
5. ⬜ **Secondary（白・グレー系 / \#fdfefe 等）＝「補助・キャンセル・サブアクション」**  
   * **役割**: メインアクションの横に置かれる控えめな操作。  
   * **適用例**: \[クリア\] \[FASTAコピー\] \[キャンセル\]  
   * **心理効果**: 目立たない、やり直し。

## **5\. 共通レイアウトと「グローバル・ドロワー（Peg Menu）」規格【v34.2 完全統合版】**

1. **別タブ遷移と戻るボタンの徹底排除**: スイート全体を一つのエコシステムとして統合するため、アプリを別タブで開く仕様（target="\_blank"）を全廃する。各アプリへの移動はすべて同一タブ内で行い、画面左上のドロワーを介して行う。ブラウザの「戻る」ボタンへの依存を防ぐため、各アプリ内に独自の戻るボタンを設置することは引き続き固く禁ずる。  
2. **外箱（HTML構造）の全アプリ共通化**: ダッシュボードを含め、すべてのアプリでヘッダー・ドロワー・フッターのDOM構造を完全に統一する。表示・挙動の切り替えは `<body class="dashboard-mode">` または `<body class="app-mode">` のクラス制御のみで行う。  
3. **二重ヘッダー・フッターの全廃**: ドロワー内部にあった簡易ヘッダーおよびフッター表記は全廃する。画面全体の「グローバルヘッダー」「グローバルフッター」「左端ドロワー」のみに一本化する。  
4. **ヘッダー右側スロット（.header-right）の役割分担**:  
   1. **ダッシュボード (`.dashboard-mode`)**: 3つのボタンを並べるようなUIノイズを禁ずる。「👤 アカウント・同期設定」という1つの統合ボタンのみを配置し、詳細設定はモーダル内で完結させること。スマホ時はアイコンのみとなる。  
   2. **各解析アプリ (`.app-mode`)**: 解析作業の邪魔にならないよう、コンパクトな同期インジケーター（例: `🟢 班B-02`）のみを配置する。バージョンバッジは廃止しフッターへ集約する。  
5. **グローバルヘッダーの制約**: グローバルヘッダー内に `[?]` ボタン（.rationale-btn）を配置することは、デザイン性を損なうため固く禁ずる。

**【次世代グローバル・ドロワー (Peg Menu) のUI/UX挙動定義】** ダッシュボードを含むすべてのアプリで例外なく以下の挙動とする。

1. **構造とフルードレイアウト**: 画面全体を `<div class="sidebar">` と `<div class="main-wrapper">` に二分する。PC環境では `main-wrapper` に `margin-left: 60px;` を設定しドロワー領域を確保する。ヘッダーは `max-width` 制限を撤廃し、画面両端にビシッと寄る100%幅（フルードレイアウト）とする。  
2. **開閉アイコンとアニメーション**: ハンバーガーボタンは**ドロワー（.sidebar）の最上部の右端**に配置する。アイコンは標準的な「三本線（≡）」とし、すべての展開状態（ホバー時・ピン留め時・スマホ展開時）において「≡」を完全に隠蔽し、「×（閉じる）」アイコンのみを表示する。 **【v34.3.2 訂正】この「ホバー時も×へ切り替える」規定は撤回する。ホバー時は「≡」を維持し、ピン留め時（`.pinned`）とスマホ展開時（`.open`）のみ「×」へ切り替えること（詳細は本項末尾の【補完規格 v34.3.1】第4項を参照）。**  
3. **付箋 (Sticky) UIとアプリ番号**: ナビアイテムの左側には必ずPhase SVGを配置し、右側のテキストには**必ずアプリ番号（①、②等）を明記**する。PC表示時は閉鎖時（幅60px）にスクロールバーを完全に隠蔽しアイコンのみが並び、展開時にテキストがフワッと表示される。  
4. **スマホ表示時の完全隠蔽（【v34.4 改訂】タブレット縦表示・スマホ表示時の共通仕様へ引き上げ）**: スマートフォンおよびタブレット縦表示時（1024px以下: `max-width: 1024px`）は付箋UI（60px幅のチラ見せ）を禁止し、**ドロワーを完全に画面外（left: -280px）へ隠す**こと。ホバー展開はPC（1025px以上: `min-width: 1025px`）のみに限定する。これに伴い、1024px以下の環境ではヘッダーの左端（`.header-left` 内）のハンバーガーボタンで開閉するトグル挙動へ統合すること。  
5. **最下部のアクションとネイティブConfirmの禁止**: ドロワー最下部には「💬 ご意見・フィードバック」と「🗑️ データを初期化」を配置する。初期化時の確認にはブラウザ標準の `confirm()` を使用せず、必ずカスタムモーダルを使用すること。

/\* \--------------------------------------------------- 共通ヘッダー＆レイアウト補正 CSS \--------------------------------------------------- \*/

/\* 改行崩れ・テキスト折り返しの補正 \*/

\* { box-sizing: border-box; }  

body, .card, p, div, .bench-tip, .step-up-card, .rationale-text, .assist-panel, .dynamic-hint { word-break: normal; overflow-wrap: anywhere; line-height: 1.6; }  

.label-title, .no-wrap { white-space: nowrap; }

/\* ガタつき防止の全体ラッパー設定と GPU アクセラレーション \*/

body { display: flex; margin: 0; overflow: hidden; background-color: var(--bg-color); }

.main-wrapper { flex: 1; margin-left: 60px; display: flex; flex-direction: column; height: 100vh; overflow-y: auto; overflow-x: hidden; transition: margin-left 0.4s cubic-bezier(0.25, 1, 0.5, 1); }

.card, .sample-thumbnail { will-change: transform; backface-visibility: hidden; } /\* ホバー時のフリッカー完全防止 \*/

/\* グローバルヘッダー規格 (フルード化・完全左右端寄せ) \*/  

.header-container { width: 100%; background: \#1a252f; border-bottom: 4px solid var(--phase-color); z-index: 30; box-shadow: 0 2px 10px rgba(0,0,0,0.15); flex-shrink: 0; }  

.header { width: 100%; margin: 0; padding: 12px 24px; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; }


/\* タイトルグループは常に左寄せ \*/

.header-left { display: flex; align-items: center; gap: 12px; flex: 1; justify-content: flex-start; }

.header h1 { margin: 0; font-size: 20px; font-weight: 700; color: \#fff; white-space: nowrap; display: flex; align-items: center; gap: 8px; }  

.header p { margin: 4px 0 0 0; font-size: 11px; color: var(--phase-color); font-weight: 600; }


/\* ログインボタンのスマホ時アイコン化と右寄せ確保 \*/

.header-right { display: flex; justify-content: flex-end; }

.header-right .btn-primary { display: flex; align-items: center; gap: 6px; padding: 6px 16px; font-size: 12px; border-radius: 20px; white-space: nowrap; }

@media (max-width: 768px) {

    .header-right .btn-text { display: none; }

    .header-right .btn-primary { padding: 8px; border-radius: 50%; width: 36px; height: 36px; justify-content: center; font-size: 16px; }

}

/\* \--------------------------------------------------- CSS実装規格: グローバル・ドロワー (Peg Menu) \--------------------------------------------------- \*/ 

/\* ドロワー本体とスクロールバーの隠蔽 \*/ 

.sidebar { 

    position: fixed; top: 0; left: 0; bottom: 0; width: 60px; 

    background-color: var(--primary); color: white; display: flex; flex-direction: column; 

    z-index: 1002; transition: width 0.4s cubic-bezier(0.25, 1, 0.5, 1), left 0.4s cubic-bezier(0.25, 1, 0.5, 1); 

    box-shadow: 4px 0 15px rgba(0,0,0,0.1); overflow-x: hidden; scrollbar-width: none; \-ms-overflow-style: none; 

}

.sidebar::-webkit-scrollbar { display: none; }

/\* サイドバーヘッダー (ハンバーガーボタンを右端へ) \*/

.sidebar-header { 

    height: 60px; display: flex; align-items: center; justify-content: flex-end; padding-right: 12px; 

    border-bottom: 1px solid rgba(255,255,255,0.05); flex-shrink: 0;

}

.sidebar-hamburger { 

    background: transparent; border: none; color: \#fff; cursor: pointer; padding: 6px; 

    display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: background 0.2s;

}

.sidebar-hamburger:hover { background: rgba(255, 255, 255, 0.1); color: var(--phase-color); }

/\* ヘッダー内ハンバーガー (スマホ専用) \*/

.mobile-hamburger { display: none; background: transparent; border: none; color: \#fff; cursor: pointer; padding: 4px; border-radius: 4px; margin-left: \-8px;}

.mobile-hamburger:hover { background: rgba(255, 255, 255, 0.1); color: var(--phase-color); }

/\* アイコン切り替え (展開時には≡を隠して×を出す) \*/

.icon-menu { display: block; }

.icon-close { display: none; }

.sidebar:hover .icon-menu, .sidebar.pinned .icon-menu, .sidebar.open .icon-menu { display: none; }

.sidebar:hover .icon-close, .sidebar.pinned .icon-close, .sidebar.open .icon-close { display: block; color: var(--text-muted); }

/* PC表示（1025px以上）: ホバー時・ピン留め時の展開 */

@media (min-width: 1025px) {

    .sidebar:hover, .sidebar.pinned { width: 280px; }

}

/* タブレット縦表示・スマホ表示（1024px以下）: 完全に隠蔽し、ヘッダー側にボタンを出す */

@media (max-width: 1024px) {

    .sidebar { left: -280px; width: 280px; }

    .sidebar.open { left: 0; }

    .main-wrapper { margin-left: 0; padding-left: 0; }

    .sidebar-header { display: none; }

    .mobile-hamburger { display: flex; align-items: center; justify-content: center; }

}

/\* ナビアイテムと付箋化 \*/

.nav-menu { flex: 1; padding: 15px 0; overflow-y: auto; overflow-x: hidden; scrollbar-width: none; \-ms-overflow-style: none; }

.nav-menu::-webkit-scrollbar { display: none; }

.nav-header { font-size: 11px; font-weight: bold; color: var(--phase-color); padding: 15px 20px 5px; text-transform: uppercase; letter-spacing: 1px; white-space: nowrap; opacity: 0; transition: opacity 0.3s; }

.sidebar:hover .nav-header, .sidebar.pinned .nav-header, .sidebar.open .nav-header { opacity: 1; }

.nav-item { padding: 12px 20px; display: flex; align-items: center; gap: 15px; color: \#bdc3c7; text-decoration: none; font-size: 13px; transition: 0.2s; white-space: nowrap; }

.nav-item svg { width: 20px; height: 20px; flex-shrink: 0; }

.nav-text, .sidebar-action-text { opacity: 0; transition: opacity 0.3s cubic-bezier(0.25, 1, 0.5, 1); }

.sidebar:hover .nav-text, .sidebar.pinned .nav-text, .sidebar.open .nav-text,

.sidebar:hover .sidebar-action-text, .sidebar.pinned .sidebar-action-text, .sidebar.open .sidebar-action-text { opacity: 1; }

.nav-item:hover { background-color: rgba(255,255,255,0.05); color: white; }

.nav-item.active { border-left: 4px solid var(--phase-color); padding-left: 16px; color: white; background-color: rgba(255,255,255,0.05); font-weight: bold; }

/\* ドロワー内ナビゲーション：各フェーズのテーマカラー同期 \*/

.nav-header.p1 { color: \#1abc9c; }

.nav-item.p1:hover, .nav-item.p1.active { color: \#1abc9c; border-left-color: \#1abc9c; background-color: rgba(255,255,255,0.05); font-weight: bold; }

.nav-header.p2 { color: \#1abc9c; }

.nav-item.p2:hover, .nav-item.p2.active { color: \#1abc9c; border-left-color: \#1abc9c; background-color: rgba(255,255,255,0.05); font-weight: bold; }

.nav-header.p3 { color: \#3498db; }

.nav-item.p3:hover, .nav-item.p3.active { color: \#3498db; border-left-color: \#3498db; background-color: rgba(255,255,255,0.05); font-weight: bold; }

.nav-header.p4 { color: \#8e44ad; }

.nav-item.p4:hover, .nav-item.p4.active { color: \#8e44ad; border-left-color: \#8e44ad; background-color: rgba(255,255,255,0.05); font-weight: bold; }

.nav-header.p5 { color: \#e74c3c; }

.nav-item.p5:hover, .nav-item.p5.active { color: \#e74c3c; border-left-color: \#e74c3c; background-color: rgba(255,255,255,0.05); font-weight: bold; }

.nav-header.p6 { color: \#e67e22; }

.nav-item.p6:hover, .nav-item.p6.active { color: \#e67e22; border-left-color: \#e67e22; background-color: rgba(255,255,255,0.05); font-weight: bold; }

.nav-header.extra { color: \#f1c40f; }

.nav-item.extra:hover, .nav-item.extra.active { color: \#f1c40f; border-left-color: \#f1c40f; background-color: rgba(255,255,255,0.05); font-weight: bold; }

/\* HTML実装時の注意 \*/

※ \<div class="nav-header p3"\> のように、必ず対応するフェーズのクラス（p1〜p6, extra）を付与すること。

/\* ドロワー最下部アクション \*/

.sidebar-footer-actions { padding: 10px 0; border-top: 1px solid rgba(255,255,255,0.05); }

.sidebar-action-btn { display: flex; align-items: center; width: 100%; gap: 15px; padding: 12px 18px; background: transparent; border: none; color: \#bdc3c7; cursor: pointer; text-align: left; transition: 0.2s; font-size: 13px; white-space: nowrap; }

.sidebar-action-btn svg { width: 20px; height: 20px; flex-shrink: 0; }

.sidebar-action-btn:hover { background: rgba(255,255,255,0.05); color: \#fff; }

.sidebar-action-btn.danger:hover { color: var(--danger); }

/\* \--------------------------------------------------- 共通フッター (.footer) \--------------------------------------------------- \*/

.footer { width: 100%; background: \#1a252f; padding: 12px 20px; text-align: center; font-size: 11px; color: \#7f8c8d; letter-spacing: 1px; margin-top: auto; border-top: 1px solid \#2c3e50; flex-shrink: 0; }

/* --------------------------------------------------- JS実装規格: ドロワー制御 --------------------------------------------------- */ 

function toggleSidebarPin() { 

    const sidebar = document.querySelector('.sidebar');

    const overlay = document.querySelector('.sidebar-overlay');

    const isMobile = window.innerWidth <= 1024; // v34.4: タブレット縦表示(1024px以下)も含めてモバイル判定

    

    if (!isMobile) {

        sidebar.classList.toggle('pinned');

        document.body.classList.toggle('has-pinned-sidebar', sidebar.classList.contains('pinned'));

    } else {

        sidebar.classList.toggle('open');

        if(overlay) overlay.classList.toggle('open', sidebar.classList.contains('open'));

    }

}

function openFeedbackForm() {

    const baseUrl \= "https://docs.google.com/forms/d/e/YOUR\_FORM\_ID/viewform";

    const appName \= document.title;

    window.open(\`${baseUrl}?entry.12345678=${encodeURIComponent(appName)}\`, '\_blank');

}

function confirmDataReset() {

    showConfirm("⚠️ 【確認】すべての入力データおよびローカル保存データを初期化しますか？\\nこの操作は取り消せません。", () \=\> {

        localStorage.clear(); sessionStorage.clear(); location.reload();

    }, "初期化する");

}

/\* \--------------------------------------------------- スマホ閲覧時の強制PC表示と警告 \--------------------------------------------------- \*/

* **スマートフォン閲覧時の強制PC表示と警告オーバーレイ (v33.2 サルベージ)**: Investigation Dashboard（ポータル）とアプリ①、アプリ②およびBio-Edu Lab Packs以外の各解析アプリは広い作業領域を前提とするため、レスポンシブな縦積みレイアウトへの変更は行わない。スマートフォン（iOS/Android等）からのアクセスに対しては、以下の2点を用いてPC環境での閲覧を促しつつ、強制的にPC版レイアウトを縮小表示させること。  
1. **強制PC表示**: `<head>` 内の viewport を `<meta name="viewport" content="width=1024">` と指定し、強制的にPC幅でレンダリングさせる。  
2. **警告オーバーレイと突破ボタン**: `<body>` の直下に以下のコードを必ず配置し、JSで端末判定を行って警告画面を表示する（操作を強行したいユーザーのための非推奨突破ボタンも備える）。

\<\!-- 📱 スマホアクセス警告＆PC強制レイアウト (JS判定版) \--\>

\<div id="mobile-warning-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(44, 62, 80, 0.95); z-index: 999999; flex-direction: column; justify-content: center; align-items: center; color: white; text-align: center; padding: 30px; box-sizing: border-box; backdrop-filter: blur(5px);"\>

    \<svg viewBox="0 0 24 24" fill="none" stroke="\#e74c3c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 60px; height: 60px; margin-bottom: 20px;"\>

        \<rect x="5" y="2" width="14" height="20" rx="2" ry="2"\>\</rect\>\<line x1="12" y1="18" x2="12.01" y2="18"\>\</line\>

    \</svg\>

    \<h2 style="margin:0 0 10px 0; font-size:24px;"\>スマートフォン非対応\</h2\>

    \<p style="font-size: 15px; color: \#ecf0f1; line-height: 1.6; margin-bottom: 30px;"\>

        この解析ツールは情報量が多いため、\<br\>PCまたはタブレットでの操作を前提としています。\<br\>

        スマートフォンでは文字が極端に小さくなり、\<br\>正常に操作できない可能性があります。

    \</p\>

    \<button onclick="document.getElementById('mobile-warning-overlay').style.display='none'" style="background: transparent; color: \#bdc3c7; border: 1px solid \#7f8c8d; padding: 10px 20px; border-radius: 4px; font-size: 13px; cursor: pointer;"\>

        警告を無視して強制的に開く (非推奨)

    \</button\>

\</div\>

\<script\>

    if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {

        document.getElementById('mobile-warning-overlay').style.display \= 'flex';

    }

\</script\>

\<\!-- 警告ここまで →

### **【補完規格 v34.3.1】ドロワー内 区切り線・ハンバーガーの状態管理**

ドロワー内の見た目と開閉挙動は、全アプリ・ダッシュボード・Lab Packs で例外なく以下に統一する。

1. **区切り線カラーの一元化**: `.nav-header`（各Phase見出しの上）と `.sidebar-footer-actions`（「💬 ご意見・フィードバック」の上）の区切り線は、**共通の薄い灰色 `rgba(255,255,255,0.05)` のみ**とする。フェーズカラーを区切り線へ用いること（`border-top-color: rgba(26,188,156,0.2)` 等）は固く禁ずる。フェーズカラーは見出しの**文字色**のみに用いる。
2. **区切り線の開閉連動**: 閉鎖時（幅60px・アイコンのみ）は区切り線を表示しない。展開時（`.sidebar:hover` / `.sidebar.pinned` / `.sidebar.open`）のみ表示する。レイアウトを動かさないため `display` や `border-width` ではなく `border-top-color` を `transparent` と灰色の間で遷移させること。
3. **先頭見出しの例外**: `.nav-header.p1`（＝`.nav-menu` の先頭要素）は区切り線を持たない（`border-top: none`）。
4. **ハンバーガーの状態管理【v34.3.2 訂正】**: **ホバーでは切り替えない**。未固定（デフォルト）および `.sidebar:hover` ではいずれも「≡」を維持し、**固定・展開時（`.sidebar.pinned` / `.sidebar.open`）のみ「×」へ切り替える**。旧世代アプリには `:hover` で切り替える記述（`.sidebar:hover .icon-menu { display: none; }` 等）が残っているため、`:hover` 側で「≡」を明示的に維持して打ち消すこと。また `:hover` と `.pinned` / `.open` は同詳細度になるため、「ピン留め中にホバーした」場合に「×」が勝つよう `.pinned` / `.open` の規則を必ず後方に置くこと。×の色は `.hamburger-btn` の `color: white` を継承させ、`var(--text-muted)` 等でグレーにしないこと。

**【重要・上書き時の詳細度】** 旧世代アプリには `.nav-header.p1`〜`.extra`（詳細度 0,2,0）でフェーズカラーの区切り線を指定した記述が残っている。`<style>` 末尾に `.nav-header`（0,1,0）を追記しても**負けて上書きできない**ため、Zero-Modification を守りつつ確実に上書きするには以下の詳細度で記述すること。

/\* ①② 区切り線：共通の薄い灰色。閉鎖時は透明にして隠す \*/

.sidebar .nav-menu .nav-header,

.sidebar .sidebar-footer-actions { border-top-color: transparent; transition: border-top-color 0.25s ease; }

.sidebar:hover .nav-menu .nav-header, .sidebar.pinned .nav-menu .nav-header, .sidebar.open .nav-menu .nav-header,

.sidebar:hover .sidebar-footer-actions, .sidebar.pinned .sidebar-footer-actions, .sidebar.open .sidebar-footer-actions { border-top-color: rgba(255, 255, 255, 0.05); }

/\* ③ 先頭見出しは区切り線なし（この規則は必ず上記より後方に置く） \*/

.sidebar .nav-menu .nav-header.p1, .sidebar .nav-menu .nav-header:first-child { border-top: none; }

/\* ④ ハンバーガー：未固定・ホバー時 ≡ ／ 固定・展開時（pinned・open）のみ × \*/

.sidebar .hamburger-btn .icon-menu { display: block; }

.sidebar .hamburger-btn .icon-close { display: none; }

.sidebar .hamburger-btn .icon-menu, .sidebar .hamburger-btn .icon-close { color: inherit; }

/\* ホバー時も ≡ を維持（切り替えない） \*/

.sidebar:hover .hamburger-btn .icon-menu { display: block; }

.sidebar:hover .hamburger-btn .icon-close { display: none; }

/\* 固定・展開時のみ × へ。※必ず上記 :hover 規則より後方に置くこと \*/

.sidebar.pinned .hamburger-btn .icon-menu, .sidebar.open .hamburger-btn .icon-menu { display: none; }

.sidebar.pinned .hamburger-btn .icon-close, .sidebar.open .hamburger-btn .icon-close { display: block; }

### **【補完規格 v34.3.3】ハンバーガーボタンの配色とアイコン縦センターライン**

1. **ホバー時の配色**: `.hamburger-btn:hover` では**背景のみ**を変化させる（`background: rgba(255, 255, 255, 0.1);`）。`color: var(--phase-color)` 等でテキスト（＝SVGの `currentColor`）を変色させることを禁ずる。
2. **アイコンの縦センターライン**: サイドバー閉鎖時（幅60px）において、ハンバーガー・ナビ・ドロワー最下部アクションの**全アイコンの中心を 30px（サイドバー中央）に揃える**。内訳は以下のとおりで、`.sidebar-header { padding-right: 12px; }` は維持する。

| 要素 | 計算 | 中心 |
| :---- | :---- | :---- |
| `.hamburger-btn`（`padding: 6px`、アイコン24px） | 右端 60−12=48 → 48−6−12 | **30px** |
| `.nav-item`（`border-left: 4px` ＋ `padding-left: 16px`、`.nav-icon` 20px） | 4＋16＋10 | **30px** |
| `.sidebar-action-btn`（`padding: 12px 20px`、アイコン20px） | 20＋10 | **30px** |

3. **よくある不整合**: `.hamburger-btn { padding: 8px; }` ではボタン幅が 40px となり中心が **28px** となって左に2pxずれる。また `.nav-item` に横ズレ防止の `border-left: 4px solid transparent` が入っている場合、`padding-left: 20px` のままでは中心が **34px** となりハンバーガーと4pxずれる。**枠線を常時4px確保したまま `padding-left` を 16px にする**こと（active 切り替え時の横ズレも同時に防げる）。

/\* ハンバーガー：ホバーは背景のみ。padding 6px でセンターを 30px に \*/

.sidebar .hamburger-btn { padding: 6px; }

.sidebar .hamburger-btn:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }

/\* ナビ：透明枠線4pxを常時確保し padding-left 16px でセンターを 30px に \*/

.sidebar .nav-menu .nav-item { border-left: 4px solid transparent; padding-left: 16px; }

### **【補完規格 v34.4】タブレット縦表示・スマホ表示時のドロワー完全隠蔽とブレイクポイント引き上げ (1024px)**

1. **ブレイクポイントの引き上げ**: スマホ表示用の完全隠蔽（`-280px`）のブレイクポイントを従来の `768px` から `1024px`（`max-width: 1024px`）へ引き上げ、**iPad等のタブレット縦表示（Portrait）およびスマホ表示時**の共通仕様として再定義する。
2. **ホバー展開の制限**: PC用のホバー展開・付箋チラ見せ（60px幅）は **PC環境（1025px以上: `@media (min-width: 1025px)`）のみに限定**し、タッチデバイスやタブレット縦表示での誤爆展開を防止する。
3. **トグル開閉への統合**: 1024px以下の環境では、ドロワーを画面外（`left: -280px`）へ完全隠蔽し、ヘッダー左端のハンバーガーボタン（`.mobile-hamburger`）から `.sidebar.open` および `.sidebar-overlay.open` によるトグル開閉を行う。

/* v34.4 タブレット縦表示・スマホ表示（1024px以下）共通CSS */
@media (max-width: 1024px) {
    .sidebar { left: -280px; width: 280px; }
    .sidebar.open { left: 0; }
    .main-wrapper { margin-left: 0; padding-left: 0; }
    .sidebar-header { display: none; }
    .mobile-hamburger { display: flex; align-items: center; justify-content: center; }
}

@media (min-width: 1025px) {
    .sidebar:hover, .sidebar.pinned { width: 280px; }
    .mobile-hamburger { display: none; }
}

### **【マスターテンプレート】外箱HTML構造（全アプリ共通）**

全アプリでUIを完全に一致させるため、`<body>` 直下のHTML構造は以下のコードを**一字一句改変せずにそのままコピーして使用すること**（アプリ名、Phase番号、固有SVG、`.nav-menu` 内のリンクのみ各アプリに合わせて書き換える）

\<\!-- 1\. ドロワー用オーバーレイ \--\>

\<div class="sidebar-overlay" onclick="toggleSidebarPin(); triggerHapticFeedback();"\>\</div\>

\<\!-- 2\. グローバル・ドロワー (Peg Menu) \--\>

\<div class="sidebar"\>

  \<div class="sidebar-header"\>

    \<button class="hamburger-btn" onclick="toggleSidebarPin(); triggerHapticFeedback();" aria-label="メニューを開く/閉じる"\>

      \<\!-- ≡ アイコン \--\>

      \<svg class="icon-menu" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"\>\<line x1="3" y1="12" x2="21" y2="12"\>\</line\>\<line x1="3" y1="6" x2="21" y2="6"\>\</line\>\<line x1="3" y1="18" x2="21" y2="18"\>\</line\>\</svg\>

      \<\!-- × アイコン \--\>

      \<svg class="icon-close" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"\>\<line x1="18" y1="6" x2="6" y2="18"\>\</line\>\<line x1="6" y1="6" x2="18" y2="18"\>\</line\>\</svg\>

    \</button\>

  \</div\>

  \<div class="nav-menu"\>

    \<\!-- ※ここに各アプリへのリンク（.nav-item）を配置 \--\>

  \</div\>


  \<\!-- ドロワー最下部アクション（ご意見箱 ＆ データ初期化パネル） \--\>

  \<div class="sidebar-footer-actions"\>

    \<button class="sidebar-action-btn" onclick="openFeedbackForm(); triggerHapticFeedback();"\>

      \<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"\>\<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"\>\</path\>\</svg\>

      \<span class="sidebar-action-text"\>ご意見・フィードバック\</span\>

    \</button\>

    \<button class="sidebar-action-btn danger" onclick="confirmDataReset(); triggerHapticFeedback();"\>

      \<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"\>\<polyline points="3 6 5 6 21 6"\>\</polyline\>\<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"\>\</path\>\</svg\>

      \<span class="sidebar-action-text"\>データを初期化\</span\>

    \</button\>

  \</div\>

\</div\>

\<\!-- 3\. メインコンテンツラッパー \--\>

\<div class="main-wrapper"\>


  \<\!-- グローバルヘッダー \--\>

  \<div class="header-container"\>

    \<div class="header"\>

      \<div class="header-left"\>

        \<\!-- スマホ用ヘッダーハンバーガー \--\>

        \<button class="mobile-hamburger" onclick="toggleSidebarPin(); triggerHapticFeedback();" aria-label="メニューを開く"\>

          \<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"\>\<line x1="3" y1="12" x2="21" y2="12"\>\</line\>\<line x1="3" y1="6" x2="21" y2="6"\>\</line\>\<line x1="3" y1="18" x2="21" y2="18"\>\</line\>\</svg\>

        \</button\>

        

        \<div class="header-title-group"\>

          \<h1\>

            \<\!-- ※ここに各Phaseの公式SVGを配置 \--\>

            \<svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"\>...\</svg\>

            アプリ名をここに記述

          \</h1\>

          \<p\>Bio-Edu Suite: Phase X / サブタイトル\</p\>

        \</div\>

      \</div\>

      

      \<\!-- ヘッダー右側（ログインアイコン・アカウント統合ボタン） \--\>

      \<div class="header-right"\>

        \<button id="accountBtn" class="account-btn" onclick="openAccountSettings(); triggerHapticFeedback();" data-tooltip="アカウント・同期設定"\>

          \<svg id="accountUserIcon" class="account-user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"\>

            \<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"\>\</path\>

            \<circle cx="12" cy="7" r="4"\>\</circle\>

          \</svg\>

          \<span id="accountStatusText" class="btn-text" style="font-size: 13px; font-weight: bold; color: \#bdc3c7;"\>接続中...\</span\>

        \</button\>

      \</div\>

    \</div\> 

  \</div\> 

  \<\!-- コンテンツエリア \--\>

  \<div class="content-area"\>

    \<\!-- ※ここに各アプリの機能（パネルや結果エリア等）を記述 \--\>

  \</div\>


  \<\!-- ダークテーマ・フッター規格 \--\>

  \<div class="footer"\>

    \&copy; 2026 Bio-Edu Suite v34.4 | Developed for Bioinformatics & Wet-Lab Education

  \</div\>


\</div\>

## **6\. 教育的UIモジュールの完全標準化 (CSS/JS仕様) 【最重要】**

各アプリの \<style\> および \<script\> 内に以下のコードを追記し、UIモジュールを標準化する。

### **① 根拠 (Rationale ポップオーバー)**

マウスホバー (:hover) はタッチデバイスで機能しないため**使用禁止**。必ずクリック駆動とし、見切れ防止のフリップ計算と、要素の幅（offsetWidth）を用いた親要素追従の安全な計算ロジック（固定幅廃止）を実装すること。吹き出しの「尻尾（.pop-arrow）」をCSSで追加する。

**【テキスト・書式規定 (v31.0 改定)】**

* **配色とフォント**: 背景は薄い黄色（\#fef9e7）、文字色は可読性の高いダークブラウン（\#7e5109）、サイズは 11px に完全統一する（※以下のCSSで定義済み）。  
* **見出しの記述と装飾（柔軟性の許可）**: ポップオーバー内の見出し（小見出し含む）は、出現する行数や位置を問わず、必ず \<strong\> タグを使用し、テキストを「【】（隅付き括弧）」で括って記述すること。これにより、CSSでアクセントのオレンジ（\#d35400 / 12px）が自動適用され、情報の区切りが明確になる。  
* **見出しの内容（揺らぎの許容）**: 最初の見出しは \<strong\>【根拠：〇〇】\</strong\> を基本とするが、操作の補助や補足知識が必要な場合、同フォーマットを用いて \<strong\>【キーボード操作・ショートカット】\</strong\> や \<strong\>【参考：〇〇】\</strong\>、\<strong\>【注意：〇〇】\</strong\> といった多様な小見出しを複数配置することを許可する。  
* **箇条書きのルール**: 複数の項目を列挙する場合は、UIの操作手順（丸数字 ①② 等）との混同を避けるため、必ず「・（中黒）」を用いて箇条書きにすること。

/\* CSS実装: 根拠 (Rationale) \*/    
.rationale-btn { background: var(--phase-color); color: white; border-radius: 50%; width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; cursor: pointer; margin-left: 5px; border: none; font-weight: bold; transition: 0.2s; flex-shrink: 0; }    
.rationale-btn:hover { transform: scale(1.1); filter: brightness(1.2); }    
    
.rationale-text { position: fixed; background: \#fef9e7; border: 1px solid var(--warning); padding: 12px; border-radius: 6px; font-size: 11px; color: \#7e5109; line-height: 1.5; box-shadow: 0 4px 15px rgba(0,0,0,0.2); z-index: 9000; width: max-content; max-width: min(320px, calc(100vw \- 24px)); opacity: 0; visibility: hidden; transition: opacity 0.2s, transform 0.2s; transform: translateY(-10px); margin: 0; pointer-events: none; box-sizing: border-box; }    
.rationale-text.show { opacity: 1; visibility: visible; transform: translateY(0); pointer-events: auto; }    
.rationale-text strong { color: \#d35400; display: block; margin-bottom: 4px; font-size: 12px; }    
    
/\* 吹き出しの尻尾 (三角形) \*/    
.rationale-text::after { content: ''; position: absolute; border-width: 6px; border-style: solid; left: var(--arrow-left, 50%); }    
.rationale-text.arrow-top::after { top: \-12px; border-color: transparent transparent \#fef9e7 transparent; }    
.rationale-text.arrow-bottom::after { bottom: \-12px; border-color: \#fef9e7 transparent transparent transparent; }    
.rationale-text::before { content: ''; position: absolute; border-width: 7px; border-style: solid; left: calc(var(--arrow-left, 50%) \- 1px); }    
.rationale-text.arrow-top::before { top: \-14px; border-color: transparent transparent var(--warning) transparent; }    
.rationale-text.arrow-bottom::before { bottom: \-14px; border-color: var(--warning) transparent transparent transparent; }  

// JS実装: 動的幅算出・フリップ計算付き表示ロジック    
function toggleRationale(event, id) {    
  event.stopPropagation();    
  const el \= document.getElementById(id);    
  const btn \= event.currentTarget;    
  const isShown \= el.classList.contains('show');    
    
  // 他のポップオーバーを閉じる    
  document.querySelectorAll('.rationale-text').forEach(e \=\> {    
    e.classList.remove('show', 'arrow-top', 'arrow-bottom');    
  });    
    
  if(\!isShown) {    
    if (el.parentNode \!== document.body) document.body.appendChild(el);    
    el.style.top \= '0px'; el.style.left \= '0px';    
    el.classList.add('show');    
    
    // フリップ計算による絶対配置 (offsetWidthを用いた親要素追従)    
    const elHeight \= el.offsetHeight;     
    const elWidth \= el.offsetWidth;    
    const rect \= btn.getBoundingClientRect();     
    
    let topPos \= rect.bottom \+ 12;     
    let arrowClass \= 'arrow-top';    
    
    // 画面下端に見切れる場合は上側に配置     
    if (rect.bottom \+ elHeight \+ 20 \> window.innerHeight) {     
      topPos \= rect.top \- elHeight \- 12;     
      arrowClass \= 'arrow-bottom';    
    }     
    el.classList.add(arrowClass);    
    el.style.top \= topPos \+ 'px';     
    
    // 左右位置の調整 (offsetWidth を使用してはみ出し防止)    
    let leftPos \= rect.left \- (elWidth / 2\) \+ (rect.width / 2);     
    if (leftPos \+ elWidth \> window.innerWidth) leftPos \= window.innerWidth \- elWidth \- 10;     
    if (leftPos \< 10\) leftPos \= 10;     
    el.style.left \= leftPos \+ 'px';     
    
    // 尻尾の水平位置をボタン中央に合わせるカスタムプロパティ    
    const arrowOffset \= rect.left \- leftPos \+ (rect.width / 2\) \- 6;    
    el.style.setProperty('--arrow-left', arrowOffset \+ 'px');    
  }    
}    
    
// 外部クリック・スクロールで閉じる    
document.addEventListener('click', (e) \=\> {    
  if (\!e.target.closest('.rationale-text') && \!e.target.closest('.rationale-btn')) {    
    document.querySelectorAll('.rationale-text').forEach(el \=\> {    
      el.classList.remove('show', 'arrow-top', 'arrow-bottom');    
    });    
  }    
});    
    
document.addEventListener('scroll', () \=\> {    
  document.querySelectorAll('.rationale-text').forEach(el \=\> {    
    el.classList.remove('show', 'arrow-top', 'arrow-bottom');    
  });    
}, true);  

### **② 現場のコツ (Bench Tip) の専用デザイン化**

視覚的な情報を明確に分けるため、**左側に青いアクセントライン（border-left）を持つデザインは、この「現場のコツ（.bench-tip）」のみの専用デザインとして定義する**。システムからの動的ヒントやエラー通知にこのデザインを流用してはならない。見出しアイコンにはインラインSVG（💡等）を使用し、適切なカラークラスを付与すること。

/\* CSS実装: 現場のコツ (専用デザイン) \*/    
.bench-tip { background: \#f0f8ff; border-left: 4px solid \#3498db; padding: 12px 15px; border-radius: 0 4px 4px 0; font-size: 12px; color: var(--text-main); line-height: 1.6; margin: 15px 0; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }    
.bench-tip strong { color: \#2980b9; display: flex; align-items: center; gap: 6px; margin-bottom: 4px; font-size: 13px; }  

### **③ アシストパネル (行動ガードレール)**

データの不足や生物学的なエラーが生じた際に表示する警告パネルの統一レイアウト。

/\* CSS実装: アシストパネル \*/    
.assist-panel { background: \#fadbd8; border-left: 4px solid var(--danger); padding: 15px; margin-top: 15px; border-radius: 4px; }    
.assist-title { font-weight: bold; color: \#c0392b; display: flex; align-items: center; gap: 5px; font-size: 14px;}    
.assist-reason { font-size: 13px; color: \#7f8c8d; margin-top: 5px; }    
.assist-fix { font-size: 13px; color: var(--primary); font-weight: bold; margin-top: 8px; background: \#fff; padding: 10px; border-radius: 4px; border: 1px solid var(--danger); }  

### **④ カスタムツールチップ (data-tooltip)**

* **title 属性の全廃**: HTML内の全 title="..." 属性を削除し、本ガイドラインの data-tooltip へ完全に移行すること。ネイティブツールチップの表示は無効化（禁止）とする。  
* **【white-space 規定】** 本文が日本語のため、実測で最長52文字のツールチップが存在する。**white-space: nowrap は使用しないこと**。white-space: normal と width: max-content、max-width: min(320px, 90vw) を併用して折り返させるのが正規仕様である。

/\* CSS実装: ツールチップ \*/    

.custom-tooltip { position: fixed; top: 0; left: 0; background: rgba(44, 62, 80, 0.95); color: \#fff; padding: 6px 10px; border-radius: 4px; font-size: 11px; pointer-events: none; z-index: 9999; opacity: 0; transition: opacity 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.2); font-weight: normal; line-height: 1.4; display: none; white-space: normal; width: max-content; max-width: min(320px, 90vw); text-align: center; box-sizing: border-box; }    

.custom-tooltip::after { content: ''; position: absolute; border-width: 5px; border-style: solid; left: 50%; transform: translateX(-50%); }    

.custom-tooltip.show-top::after { top: 100%; border-color: rgba(44, 62, 80, 0.95) transparent transparent transparent; }    

.custom-tooltip.show-bottom::after { bottom: 100%; border-color: transparent transparent rgba(44, 62, 80, 0.95) transparent; }

// JS実装: ツールチップ初期化ロジック (必ず実装すること)    
function initTooltips() {    
  const tooltip \= document.createElement('div');    
  tooltip.className \= 'custom-tooltip';    
  document.body.appendChild(tooltip);    
    
  document.body.addEventListener('mouseover', (e) \=\> {    
    const target \= e.target.closest('\[data-tooltip\]');    
    if (target && \!target.classList.contains('rationale-btn')) {    
      tooltip.innerHTML \= target.getAttribute('data-tooltip');    
      tooltip.style.display \= 'block';    
      const rect \= target.getBoundingClientRect();    
      const ttRect \= tooltip.getBoundingClientRect();    
      let topPos \= rect.top \- ttRect.height \- 8;    
      let leftPos \= rect.left \+ (rect.width / 2);    
      let arrowClass \= 'show-top';    
      if (topPos \< 0\) { topPos \= rect.bottom \+ 8; arrowClass \= 'show-bottom'; }    
      if (leftPos \- ttRect.width / 2 \< 5\) leftPos \= 5 \+ ttRect.width / 2;    
      else if (leftPos \+ ttRect.width / 2 \> window.innerWidth \- 5\) leftPos \= window.innerWidth \- ttRect.width / 2 \- 5;    
      tooltip.className \= \`custom-tooltip ${arrowClass}\`;    
      tooltip.style.top \= topPos \+ 'px';    
      tooltip.style.left \= leftPos \+ 'px';    
      tooltip.style.transform \= 'translateX(-50%)';    
      tooltip.style.opacity \= '1';    
    }    
  });    
  document.body.addEventListener('mouseout', (e) \=\> {    
    if (e.target.closest('\[data-tooltip\]')) {    
      tooltip.style.opacity \= '0';    
      setTimeout(() \=\> { if (tooltip.style.opacity \=== '0') tooltip.style.display \= 'none'; }, 200);    
    }    
  });    
}  

### **⑤ トースト通知 (ネイティブAlert全廃)**

alert() は使用禁止。全アプリ共通で以下のトーストUIを使用する。

/\* CSS実装: トースト通知 \*/    
\#toast { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(100px); background: var(--success); color: white; padding: 12px 24px; border-radius: 30px; font-weight: bold; font-size: 13px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); opacity: 0; transition: all 0.3s cubic-bezier(0.68, \-0.55, 0.265, 1.55); z-index: 100000; pointer-events: none; text-align: center; max-width: 90vw; box-sizing: border-box; word-break: auto-phrase; }    
\#toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }    
\#toast.error { background: var(--danger); }    
\#toast.warning { background: var(--warning); color: \#7e5109; }    
\#toast.info { background: var(--phase-color); }  

### **⑥ 動的ヒント (Dynamic Hint) のフラットデザイン化とプレーンテキスト化**

JSによって動的に生成されるシステム通知や仕様の警告（.dynamic-hint）は、視覚的なノイズを減らし、実践的ノウハウ（.bench-tip）との情報レイヤーを明確に分離するため、**赤枠のフラットデザインへ統一し、アイコンの挿入を一切禁止**する。

**【CSS実装】**

既存の border-left 等を用いた装飾は廃止し、以下のプロパティへ完全に上書きすること。

.dynamic-hint {    
  background: \#fdf2f2;    
  border: 1px solid \#f8d7da;    
  color: \#721c24;    
  padding: 10px 12px;    
  border-radius: 6px;    
  font-weight: bold;    
  font-size: 11px;    
  text-align: left;    
}  

**【HTML実装の禁止事項】**

\#cycleHintText 等の要素に直接記述されているインラインスタイルは、CSSの上書きを妨げるため**完全に削除**すること。

**【JS実装の禁止事項】**

JS内で .dynamic-hint に対して innerHTML でテキストを挿入する際、「💡」や SVG などのアイコンを含めることを**固く禁ずる**。プレーンな文章のみを出力すること。

### **⑦ より高度な解析ツールへ枠 (.step-up-card) のUI共通化**

Bio-Edu Suiteでの学習を終えたユーザーを、研究現場のプロフェッショナル向けソフトウェアへ導くための専用UI。

**【共通ルール】**

* **配置規定**: 必ずアプリの .main-content 内の「一番最後（最下部）」に配置すること。  
* 題名（\<h3\>タグ内）のテキストは **「より高度な解析ツールへ」** に厳格に固定・統一すること。テキストの改変や省略は禁止する。SVGアイコンも全アプリで共通とする。  
* 内容（\<p\>タグ内）の文章と、紹介するツールのリストは、各アプリの学習内容に合わせて変更してよい。

/\* CSS実装: より高度な解析ツールへ枠 (.step-up-card) \*/    
.step-up-card { background: \#f8f9fa; border: 1px solid \#d1d5db; padding: 20px; border-radius: 8px; margin-top: 25px; color: \#2c3e50; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }    
.step-up-card h3 { color: \#2c3e50; margin-top: 0; font-size: 15px; display: flex; align-items: center; border-bottom: 1px solid \#e5e7eb; padding-bottom: 10px; margin-bottom: 12px; }    
.step-up-card h3 svg { margin-right: 8px; width: 20px; height: 20px; flex-shrink: 0; }    
.step-up-card h3 span { font-size: 0.8em; opacity: 0.7; margin-left: 8px; font-weight: normal; }    
.step-up-card p { margin: 0; font-size: 13px; line-height: 1.6; }    
.step-up-card p span { display: block; margin-top: 4px; }    
.step-up-card p span:first-of-type { margin-top: 6px; }  

### **⑧ 解説・ヒントUIの動的文脈適応 (Cognitive Load Reduction) 【v33.0 新設】**

アルゴリズムや設定を切り替えた際、過去の選択肢に関する\[?\]ポップオーバー（.rationale-text）や現場のコツ（.bench-tip）が画面上に残留することは、ユーザーに深刻な認知負荷（混乱）を与える。 UIの状態が変化した場合は、JSを用いて必ず\*\*「現在の文脈に合致する説明文への動的書き換え」**または**「不要なヒントの非表示化（style.display \= 'none'）」\*\*を行い、画面上の情報に一切の矛盾を生じさせないこと。

### **⑨ 安易な「解答表示」ボタンの原則禁止 【v33.0 新設】**

教育的シミュレーター（発展学習モジュール等）において、ユーザーに試行錯誤（パラメータの調整や正解の探索）を促す場面では、ワンクリックで正解状態にしてしまう「解答表示」ボタンの設置を原則禁止とする。 生徒自身の手で仮説を立て、スライダーを動かし、間違えながら「山の頂上（最適解）」を探り当てるプロセスそのものを最大の教育的価値として保護すること。

## **7\. データ連携・手動バケツリレー・LIMS規格 (v32.0 全面刷新)**

Bio-Edu Suiteは「生徒にデータ構造と思考プロセスを体験させる教育環境」であるため、**アプリ間のブラックボックスな自動連携（裏側でのAPI通信やlocalStorageの過度な同期）を原則禁止**とする。

**① デジタル野帳（LIMS）としてのダッシュボード（アプリ①）**

* ダッシュボードはDNA配列だけでなく、「採取地」「温度」などの環境メタデータ（デジタル野帳）を一元管理する起点とする。  
* `localStorage` を用いたデータの永続化は、このダッシュボード（アプリ①）における「生徒自身のメタデータ・生データの保存」にのみ許可される。

**② 手動バケツリレーの徹底（データ移動の可視化）**

* **初期分配（sessionStorage）**: ダッシュボードから一次処理工場（⑤ DNA Alignment, ⑨ Morphometrics）へ生データを送る一括送信時のみ、`sessionStorage` の使用を許可する。  
* **コピペによる連携**: ⑤や⑨で処理されたデータは、必ず生徒自身の手でクリップボードにコピーさせ、次のアプリの「入力エリア」へペーストさせること。

**③ 終着点アプリの「空箱化」**

* 統合ビューワー（⑩）や統計ラボ（⑪）には、デモデータを内包させない。生徒がコピペで持ち込んだデータを表示する「純粋なビューワー」として設計すること。

**④ 連携データのメタデータ自動刻印 (v32.2 新設)**

* **刻印の義務化**: 生徒の手によるバケツリレー（クリップボード経由のコピペ連携）で生じる「データ迷子」を防ぐため、各アプリから出力・コピーされるテキストデータ（JSONやTSV）には、必ずデータの出所と処理時刻を示すメタデータを自動で刻印すること。  
  * JSONの例: ルート階層に `"source": "App_9_GPA"`, `"timestamp": "..."` 等を含める。  
  * TSVの例: ヘッダー行や先頭のコメント行（\#）に出所を明記する。  
* **出所の視覚的フィードバック**: データを受け取る終着点アプリ（⑩や⑪など）の入力UIは、ペーストされたデータのメタデータを読み取り、「アプリ⑨のGPA解析データを受信しました」のように、どの手法から持ち込まれたデータであるかをUI上（トースト通知やアシストパネル等）で明確にユーザーへフィードバックすること。

**⑤ ハイブリッド・クラウド同期と認証 (Firebase)【v33.5 新設】**

* **認証基盤**: 授業現場でのアカウント管理負担をなくすため、「Googleログイン」および「匿名認証＋ルームコード（Kahoot方式）」を標準規格とする。  
* **オフライン・ファーストの徹底**: 学校のネットワーク制限や野外実習での通信遮断によるデータ消失を防ぐため、以下の設計を義務化する。  
  * アプリの書き込みは常にローカル (`localStorage` / `IndexedDB`) を正とする。  
  * クラウド (Firestore) への同期はバックグラウンドで行い、オフラインキャッシュを有効化する。  
* **同期ステータスの明示**: ヘッダー右上の `.header-right` に、通信状態（「🟢 班B-02 (同期中)」「🟠 ローカル保存中 (オフライン)」）を自動表示する。

**⑥ クロスアプリ認証の永続化とモジュール読み込み (v34.3 新設)** `auth_sync.js` がFirebase Authのセッションを非同期で復旧する際、一瞬の未接続状態（`user === null`）を検知して自動で匿名ログイン（`signInAnonymously`）を実行する処理は、Googleログイン状態を上書き破壊するため**完全に禁止（削除）とする。 すべてのアプリにおいて、タブを跨いだログイン状態の維持と操作を可能にするため、各アプリのHTMLファイルの一番最後（`</body>`の直前）には必ず以下のモジュール読み込みスクリプトを配置**すること。

\<\!-- 認証モジュールの読み込みとグローバル展開 \--\>  
\<script type="module"\>  
  import { loginWithGoogle, logoutUser } from './auth\_sync.js';  
  window.handleGoogleLogin \= loginWithGoogle;  
  window.handleLogout \= logoutUser;  
\</script\>


### 【第7項改定】ネイティブ化必須要件：オートセーブ＆ハイドレーション仕様
1. **Page Visibility API による瞬間ドラフト保存**:
   - ユーザーの離脱・画面切替時（`visibilitychange` イベント発火時、`document.visibilityState === 'hidden'`）に、全入力ステート（スライダー、テキスト、セレクト等）を `sessionStorage`（キー: `bio_edu_draft_<app_name>`）へ瞬間シリアライズする。
2. **起動時のハイドレーション（UI復元）**:
   - ページ読み込み時（`DOMContentLoaded`）にドラフトデータを検知し、初期UIを直前の状態へ自動復元して `input`/`change` イベントをトリガーする。
3. **BFCache（Back/Forward Cache）の完全有効化**:
   - BFCacheを阻害するレガシーな `unload` / `beforeunload` リスナーをコードベースから排除し、ネイティブアプリ同様の瞬間復帰を担保する。
4. **手動バケツリレー原則の堅持**:
   - 本仕様は単一アプリ内でのローカルステート復元に限定され、アプリ間でのブラックボックスな自動データ連携は引き続き厳禁とする。

### 7.3 ネイティブライクな状態復元規格（State Restoration）
- **目的**: PWA環境やモバイルブラウザにおけるサスペンド・バックグラウンド移行からの復帰時、ネイティブアプリ同等の体験（直前の作業画面へのシームレスな再開）を提供する。
- **基本原則**:
  1. **教育的データの境界維持**: 生データ（DNA配列、mRNA配列、アミノ酸配列、トレース波形データ等）のアプリ間自動同期は引き続き禁止し、「手動連携（コピー＆ペースト／ファイル読み込み）」の教育的哲学を厳格に保持する。
  2. **UIステート限定の永続化**: 各アプリ内で操作中の「スライダー値」「ズーム・スクロール位置」「表示トグル状態」および「最終アクセスアプリのパス」に限り、`localStorage`（プレフィックス `bio_edu_state_` 等）への常時記録を許可する。
  3. **PWA起動時ルーティング**: ルートアクセス時（アプリ① ダッシュボード起動時）、ローカルストレージ内に有効な最終アクセス履歴が存在する場合は、直前まで作業していたアプリ画面へスムーズに遷移・状態復元（State Restoration）を行う。
  4. **リセット導線の確保**: ダッシュボードおよび各アプリヘッダーには「初期状態に戻す（State Clear）」ボタンを配置し、ユーザーが意図して初期状態から再開できる手段を常に提供する。

## **8\. モーダル・ファイル出力・アプリ間連携のUI/UX改訂規定**

* **モーダル幅の完全統一**: \#enzymeModal 等の各モーダルに設定されていた width: 300px \!important などの強制指定・固定値を廃止し、width: 400px（\!importantなし）に統一する。  
* **FASTA エクスポート名の定数化**: 出力ファイル名は **BioEdu\_Export\_YYYYMMDD.fasta** の形式に固定する。  
* **ホバーカラーの統一**: ホバー時の背景色やテキストカラー、アクセントラインの色はハードコードを避け、各アプリの :root で定義された個別のテーマカラー（--primary または \--phase-color）に連動・統一させること。  
* **破壊的アクション用 確認ダイアログ（Confirm Modal）の完全統一**: データの初期化や削除など、Danger（赤色）アクションを実行する際の確認ダイアログは、UIの揺らぎを防ぐため、以下のHTMLおよびJSを**一字一句改変せずにそのまま**使用すること（独自のCSSクラス追加やDOM構造の変更は厳禁）。  
* **アカウント・同期設定（ログインパネル）の完全統一 (v34.3 新設)** 全アプリの画面上に表示される同期設定モーダルは、`auth_sync.js` が状態を描画するための必須ID群（`modalLoggedOutView`, `userNameDisplay`等）を含んでいる。全アプリの `</body>` 直前に以下のHTMLとJSを**そのまま**配置すること。

\<\!-- アカウント・同期設定モーダル \--\>

\<div class="modal-overlay" id="accountModal"\>

  \<div class="modal-content" style="max-width: 380px;"\>

    \<div class="modal-header"\>

      \<h3 style="margin: 0; font-size: 16px;"\>アカウント・同期設定\</h3\>

      \<button class="modal-close" onclick="closeAccountSettings(); triggerHapticFeedback();"\>\<svg class="btn-icon" style="margin:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"\>\<path d="M18 6L6 18M6 6l12 12"/\>\</svg\>\</button\>

    \</div\>

    \<div class="modal-body" style="padding: 20px;"\>

      \<\!-- 未ログイン時 \--\>

      \<div id="modalLoggedOutView"\>

        \<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;"\>\<span style="font-size: 14px; font-weight: bold; color: var(--text-muted);"\>⚪️ ゲストモード\</span\>\</div\>

        \<p style="font-size: 12px; color: var(--text-muted); margin: 0 0 16px 0; line-height: 1.6;"\>現在は端末内のみにデータが保存されています。Googleアカウントでログインすると自動同期できます。\</p\>

        \<button class="btn btn-primary" style="width: 100%;" onclick="window.handleGoogleLogin(); triggerHapticFeedback();"\>Googleアカウントでログイン\</button\>

      \</div\>

      \<\!-- ログイン中 \--\>

      \<div id="modalLoggedInView" style="display: none;"\>

        \<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;"\>\<span id="syncStatusBadge" style="font-size: 14px; font-weight: bold; color: var(--phase-color);"\>🟢 クラウド同期中\</span\>\</div\>

        \<div style="background: \#f8f9fa; border: 1px solid \#e1e8ed; border-radius: 6px; padding: 12px; margin-bottom: 16px;"\>

          \<div id="userNameDisplay" style="font-weight: bold; font-size: 14px; color: var(--primary);"\>\</div\>

          \<div id="userEmailDisplay" style="font-size: 11px; color: var(--text-muted); margin-top: 2px;"\>\</div\>

          \<div id="syncStatusNote" style="font-size: 11px; color: var(--danger); margin-top: 6px; display: none;"\>※オフライン中です。\</div\>

        \</div\>

        \<button class="btn btn-secondary" style="width: 100%; color: var(--danger); border-color: \#f5b7b1;" onclick="window.handleLogout(); triggerHapticFeedback();"\>ログアウト\</button\>

      \</div\>

    \</div\>

  \</div\>

\</div\>

/\* JS実装規格（グローバル関数化） \*/

function openAccountSettings() { document.getElementById('accountModal').style.display \= 'flex'; }

function closeAccountSettings() { document.getElementById('accountModal').style.display \= 'none'; }

### **【マスターテンプレート】システム必須モーダル構造（全アプリ共通）**

データ初期化時の確認や、アカウントログインパネルを呼び出すためのシステムモーダル群である。`auth_sync.js`等からID指定でDOM操作されるため、全アプリの `</body>` タグの直前に、以下のHTMLを**一字一句改変せずに必ず配置すること。**

\<\!-- カスタム確認ダイアログ（データ初期化用等） \--\>

\<div class="modal-overlay" id="confirmModal"\>

  \<div class="modal-content" style="max-width: 400px; border-top: none; text-align: center;"\>

    \<div class="modal-body" style="padding: 30px 20px 10px;"\>

      \<svg class="svg-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 42px; height: 42px; margin-bottom: 12px; opacity: 0.9;"\>\<circle cx="12" cy="12" r="10"\>\</circle\>\<line x1="12" y1="8" x2="12" y2="12"\>\</line\>\<line x1="12" y1="16" x2="12.01" y2="16"\>\</line\>\</svg\>

      \<h3 id="confirmTitle" style="margin: 0 0 10px 0; font-size: 16px; color: var(--primary);"\>確認\</h3\>

      \<div id="confirmMessage" style="font-size: 13px; line-height: 1.6; color: var(--text-main);"\>\</div\>

    \</div\>

    \<div class="modal-footer" style="border-top: none; background: white; justify-content: center; gap: 12px; padding-bottom: 30px;"\>

      \<button class="btn btn-secondary" onclick="closeConfirm(); triggerHapticFeedback();"\>キャンセル\</button\>

      \<button class="btn" id="confirmOkBtn" style="background: var(--danger); color: white;"\>実行する\</button\>

    \</div\>

  \</div\>

\</div\>

\<\!-- アカウント・同期設定（ログインパネル）モーダル \--\>

\<div class="modal-overlay" id="accountModal"\>

  \<div class="modal-content" style="max-width: 380px;"\>

    \<div class="modal-header"\>

      \<h3 style="margin: 0; font-size: 16px;"\>アカウント・同期設定\</h3\>

      \<button class="modal-close" onclick="closeAccountSettings(); triggerHapticFeedback();" data-tooltip="閉じる"\>

        \<svg class="btn-icon" style="margin:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"\>\<path d="M18 6L6 18M6 6l12 12"/\>\</svg\>

      \</button\>

    \</div\>

    \<div class="modal-body" style="padding: 20px;"\>

      

      \<\!-- ① 未ログイン時（ゲスト）ビュー \--\>

      \<div id="modalLoggedOutView"\>

        \<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;"\>

          \<span style="font-size: 14px; font-weight: bold; color: var(--text-muted);"\>⚪️ ゲストモード\</span\>

        \</div\>

        \<p style="font-size: 12px; color: var(--text-muted); margin: 0 0 16px 0; line-height: 1.6;"\>

          現在は端末内のみにデータが保存されています。Googleアカウントでログインすると、自宅のPCや他の端末とデータを自動同期できます。

        \</p\>

        \<button class="btn btn-primary" style="width: 100%;" onclick="window.handleGoogleLogin(); triggerHapticFeedback();"\>

          Googleアカウントでログイン

        \</button\>

      \</div\>

      \<\!-- ② ログイン中ビュー \--\>

      \<div id="modalLoggedInView" style="display: none;"\>

        \<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;"\>

          \<span id="syncStatusBadge" style="font-size: 14px; font-weight: bold; color: var(--phase-color);"\>🟢 クラウド同期中\</span\>

        \</div\>

        

        \<div style="background: \#f8f9fa; border: 1px solid \#e1e8ed; border-radius: 6px; padding: 12px; margin-bottom: 16px;"\>

          \<div id="userNameDisplay" style="font-weight: bold; font-size: 14px; color: var(--primary);"\>\</div\>

          \<div id="userEmailDisplay" style="font-size: 11px; color: var(--text-muted); margin-top: 2px;"\>\</div\>

          \<\!-- オフライン時の状態メッセージ領域 \--\>

          \<div id="syncStatusNote" style="font-size: 11px; color: var(--danger); margin-top: 6px; display: none;"\>

            ※オフライン中です。データは端末内に一時保存され、再接続時に自動同期されます。

          \</div\>

        \</div\>

        \<button class="btn btn-secondary" style="width: 100%; color: var(--danger); border-color: \#f5b7b1;" onclick="window.handleLogout(); triggerHapticFeedback();"\>

          ログアウト

        \</button\>

      \</div\>

    \</div\>

  \</div\>

\</div\>

## **9\. 共通UIコンポーネント・マスター規格**

各アプリ間で発生しているUIパーツの「揺らぎ」を完全に排除し、スイート全体で1つのソフトウェアとしての統一感を担保するため、以下のコンポーネント規格を絶対ルールとする。

**① データ読込（ファイルドロップゾーンと貼り付け枠） (v32.0 厳格化)**

データの入り口となるUIは、視覚的ノイズを減らし1行に美しく収めるため、以下の仕様で完全に統一する。

* **ドロップゾーン (Drop Zone) のCSS構造**:

.drop-zone {

    border: 2px dashed var(--border-color); /\* 種類: dashed, 太さ: 2px \*/

    border-radius: 8px;

    padding: 16px;

    background: \#f8f9fa;

    display: flex;

    flex-direction: row;      /\* 横並び \*/

    flex-wrap: nowrap;        /\* 1行に収める \*/

    align-items: center;

    justify-content: center;

    gap: 8px;

    width: 100%;

    max-width: 450px;         /\* 幅の制限 (Print Studioは例外) \*/

    min-height: 60px;         /\* 高さの最低値 \*/

    box-sizing: border-box;

    cursor: pointer;

    transition: 0.2s;

    overflow: hidden;         /\* はみ出し防止 \*/

}

.drop-zone p {

    margin: 0;

    font-size: 12px;

    font-weight: bold;

    color: var(--text-muted);

    white-space: nowrap;      /\* 1行に収める \*/

    overflow: hidden;

    text-overflow: ellipsis;  /\* はみ出た分は「...」 \*/

    pointer-events: none;

}

.drop-zone svg {

    flex-shrink: 0;           /\* SVGが潰れないようにする \*/

}

* アイコンと文言: 第2項に定義されたドキュメント＋矢印のSVGを使用し、文言は ここをクリック、または \[対象データ名\] をドラッグ＆ドロップ に固定。

* 直下のテキスト貼り付け枠 (Textarea) のCSS構造:

.paste-area { border: 1px solid var(--border-color); /\* 種類: solid, 太さ: 1px */ border-radius: 4px; padding: 12px; background: \#fdfefe; width: 100%; max-width: 450px;         /* 幅の制限 (Print Studioは例外) */ min-height: 100px;        /* 高さの最低値 \*/ font-family: 'Courier New', Consolas, monospace; font-size: 12px; resize: vertical; box-sizing: border-box; }

**② 保存・出力・サブアクションボタンの書式**

第4項の「ボタン・カラー意味論」に基づき、データのフォーマット名に応じた命名規則とアイコン配置を統一する。

* **保存（🟩 Success）**: \[FASTA保存\] \[CLUSTAL保存\] 等。左に保存用SVGアイコンを配置。  
* **コピー（⬜ Secondary）**: \[FASTAコピー\] 等。左にクリップボード用SVGアイコンを配置。  
* **ステータス連動型ボタン（動的発色）**: 解析完了後などに「押せるようになったこと」を強調したいボタン（例：\[系統樹(Newick)をコピー\]）は、無効時（`:disabled`）は背景を白（Secondary）としてホバー時の色変化を完全に無効化し、有効時（`:not(:disabled)`）にのみ背景を緑（Success）などに発色させる専用スタイルを適用すること。

**③ より高度な解析ツールへ枠**

* **配置**: 必ず .main-content 内の「一番最後（最下部）」に配置する。  
* **クラス名**: .step-up-card に完全統一。  
* **見出し**: \<svg\> より高度な解析ツールへ に固定。（※デザイン定義は第6項⑦を参照）

**④ タイトル・メタ情報の書式 (v32.0 改定)**

* **ブラウザタブ `<title>` の絵文字廃止と丸数字化**: ブラウザのタブタイトルから絵文字を全廃止し、アプリ番号の丸数字（①〜⑬）を先頭に付与する。（ただし、`<h1>`にはアプリ番号の丸数字①〜⑬を先頭に付与しない）  
  * **書式**: `[アプリ番号] [アプリ名] | Bio-Edu Suite` （例: `① PCR Master Mix Studio | Bio-Edu Suite`）  
  * **例外**: 「Investigation Dashboard」と「Lab Packs (教材パック)」については、丸数字のみ使用せずプレーンなテキストとすること。ただしヘッダー内の公式SVGは使用してよい。  
* **アプリタイトル (h1/h2)**: ネイティブ絵文字の混入を全面禁止。プレーンテキストおよび第2項に準拠した各Phase公式のインラインSVGのみで構成する。  
* **サブタイトル**: `Bio-Edu Suite: Phase [X] / [英語の機能説明]` のフォーマットでPhaseを明記。  
* **ステータスバー**: `ステータス: [状況] | [メタデータ1] | [メタデータ2]` の記述順に固定。  
* **バージョンバッジの廃止とフッター表記への集約**: ダッシュボード（Investigation Dashboard）のサイドバーを除き、各アプリのヘッダー右上に配置されていた `.version-badge` は視覚的ノイズとなるため**完全に廃止**する。バージョン情報はフッター（`.footer` または `.system-status`）の「© 2026 Bio-Edu Suite v\[バージョン番号\]」の記述のみに集約し、適用されたガイドラインのバージョンと完全に同期させること。

**⑤ セクション見出しの階層的ナンバリング規定**

UIの階層（情報の深さ）をユーザーに直感的に伝えるため、見出しのプレフィックス（番号）を以下のルールで厳格に統一する。⚙️や📊などの装飾的ネイティブ絵文字は禁止する。

* **大階層（主要セクション / 紺色パネル上部等）**: ローマ数字（Ⅰ., Ⅱ., Ⅲ....）を使用する。（例: Ⅰ. 解析設定）  
* **中階層（パネル内の各項目）**: アラビア数字（1., 2., 3....）を使用する。（例: 1\. プライマー設計）

**⑥ 学術クレジット (References & Algorithms) のUI規格【v33.1 新設】** 本スイートが単なる教育用モックではなく、原著論文に基づく本物の数学的アルゴリズムで稼働していることを明示するため、解析ロジックを含む全アプリにおいて、以下のルールで引用文献を明記すること。

* **配置**: `.step-up-card` (より高度な解析ツールへ) の直下。  
* **デザイン**: 視覚的ノイズを抑えるため、装飾アイコン（SVG等）は使用せず、プレーンなアコーディオン（`<details>` と `<summary>`）を使用する。  
* **書式**: 論文リストは省略を一切許さず、雑誌名・巻号・ページ数を含む完全な「APAスタイル」で記述すること。 

/\* HTML実装規格（テンプレート） \*/  
\<div style="margin-top: 20px; width: 100%; text-align: left;"\>  
    \<details style="cursor: pointer;"\>  
        \<summary style="font-weight: bold; color: var(--text-muted); font-size: 13px;"\>  
            References & Algorithms  
        \</summary\>  
        \<div style="padding: 10px 0 0 15px; font-size: 11px; color: var(--text-muted); line-height: 1.6;"\>  
            \<p style="margin-bottom: 8px;"\>本アプリケーションの計算エンジンは、以下のアルゴリズムおよび進化モデルに基づき実装されています。\</p\>  
            \<ul style="padding-left: 20px; margin: 0; display: flex; flex-direction: column; gap: 6px;"\>  
                \<li\>\<strong\>\[手法名\]:\</strong\> \[完全なAPAフォーマットの引用表記\]\</li\>  
            \</ul\>  
        \</div\>  
    \</details\>  
\</div\>

## **10\. 左右分割レイアウトと余白（Spacing）規格**

**① デスクトップ表示時の黄金比率**

* **パターンA（シミュレーター・エディタ型）**: \[設定パネル 35% : 結果描画エリア 65%\]（または flex: 3.5 と flex: 6.5）。  
* **パターンB（データ比較・リスト型）**: \[左パネル 50% : 右パネル 50%\]。

**② ブレイクポイントとレスポンシブ挙動**

* **ブレイクポイント**: 900px を境界とし、これ以下は左右分割を解除して「上下の縦積み（1カラム）」へ強制的に切り替える。  
* **横並びの保護**: スマホ表示時、入力フォームと検索ボタン等の隣接要素はラッパーに display: flex; flex-wrap: nowrap; を適用し、ボタン側は white-space: nowrap; を設定して不自然な分断を防ぐ。

**③ 余白（Spacing）の 8px 倍数ルール**

UI要素間のマージンやパディングは、視覚的リズムを整えるため原則として **8の倍数（8px, 16px, 24px, 32px）** で構成する。

* **セクション間の余白** (gap や margin-bottom): 24px または 16px  
* **要素内のゆとり** (padding): 8px 16px (ボタン等) または 16px (カード等)  
* **細かい隙間**: 4px (例外的な微調整用) または 8px

**④ フレキシブル・グリッド標準レイアウト（v34.4 追記・義務化）**

* **レスポンシブ・フレキシブル化**: 左右分割の固定比率（35:65）に加え、`display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;` 等のフレキシブル・グリッドを標準レイアウトとして追記・採用する。
* **縦スクロール移行の自動化**: 固定幅による画面見切れや横スクロールの発生を防ぐため、画面幅が狭いデバイス（タブレット縦表示やスマホ）では自動的に 1カラムの縦スクロール型（積み重ねレイアウト）へ安全に移行する設計を義務化する。

## **11\. タイポグラフィと形状（Morphology）・状態（ステート）規格**

**① タイポグラフィ（フォント指定の厳格化）**

* **通常テキスト（全角日本語・半角英数字）**: 和文と欧文の美しさ、可読性を担保するため、以下のプロポーショナルフォント指定をベースとする。  
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif, 'Noto Sans JP'; font-size: 14px; color: var(--text-main); line-height: 1.6; }  

* **等幅フォント（塩基配列・アミノ酸配列）**: アライメント崩れを完全に防ぐため、必ず以下の等幅フォントを適用する。  
  .sequence-text { font-family: 'Courier New', Consolas, monospace; letter-spacing: 1px; }  

**② ボタンの形状寸法（Morphology）とフィット規定 (v32.0 改定)**

* **基本形状（角丸と影の厳格化）**: 角の丸みは border-radius: 4px; に完全に統一する。デフォルト（通常状態）での**影（box-shadow）は原則禁止**とし、フラットなデザインとする。  
* **単一ボタンの文字へのフィット**: width を強制的なピクセル（例: width: 200px）で固定することを禁止する。display: inline-flex; と padding: 8px 16px; を用いるか、width: fit-content; を適用し、単独で存在する独立したボタンは**ボタン内の文字数に自然にフィットする（過不足のない）大きさ**を動的に保つこと。   
  *  **【例外許可】**: ただし、サイドパネル内の主要な実行アクション（例：\[行列作成\] や \[結合\] など）において、**ユーザーのクリック領域を最大化し操作性を直感的に向上させる目的がある場合**に限り、`width: 100%;` の使用を明示的に許可する。  
* **ボタングループの幅同期（スマートアライメント）**: トグルボタンや、同列に配置される類似機能のボタン（例：\[FASTA保存\] と \[CLUSTAL保存\] 等）において、個別に文字へフィットさせると幅がガタつき視覚的ノイズとなる。これらのグループは、「文字数が最も多いボタンの幅」を基準とし、グループ内の全ボタンの幅を等しく統一すること（CSSの display: grid; による等幅割り付けや、同一の min-width を用いて実装する）。  
* **ホバー（:hover）**: ユーザーに「押せる」ことを伝えるため、ホバー時にのみ微細な影（例: box-shadow: 0 2px 4px rgba(0,0,0,0.1);）と僅かな明るさの変化（filter: brightness(1.05);）を許可する。  
* **アクティブ（:active）**: クリック時の沈み込みとして transform: scale(0.98); を適用する。  
* **無効化（:disabled）**: 操作不可状態は opacity: 0.6; cursor: not-allowed; filter: grayscale(50%); box-shadow: none; とし、ホバーエフェクトを無効化する。

**③ 入力フォーム（Input / Select）のフォーカスとフィット規定**

* **サイズ（文字へのフィット）**: 入力窓の幅をむやみに width: 100%; にして間延びさせることを禁止する。プレースホルダー（透けている文字）や、想定される入力文字数に合わせて適切な幅（例: width: 120px; や max-width）を設定し、情報の密度を保つこと。  
* **フォーカス（:focus）**: ブラウザ標準の青枠を消し、テーマカラーに連動させる。  
  outline: none; border-color: var(--phase-color); box-shadow: 0 0 0 2px rgba(26, 188, 156, 0.2);  

* **エラー状態（.input-error）**: 入力値が不正な場合のハイライトを規定。  
  border-color: var(--danger); box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2); background-color: #fdf2f2;  

**④ タッチターゲット要件の厳格化（v34.4 追記・義務化）**

* **ヒューマンインタフェースガイドライン準拠**: タッチデバイスでの誤操作やタップミスを防止するため、Apple Human Interface Guidelines および Google Material Design に準拠し、「タップ可能な全要素（`.btn`, `.sidebar-action-btn`, `.nav-item`, `.hamburger-btn`, セレクトボックス, 入力フォーム等）」は**最小高さ 44px（モバイル環境では 48px）を必ず確保する**設計を厳格に義務化する。
  ```css
  /* タッチターゲット寸法の厳格化 (v34.4) */
  .btn, .sidebar-action-btn, .nav-item, .hamburger-btn, select, input[type="button"], input[type="submit"] {
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      box-sizing: border-box;
  }

  @media (max-width: 1024px) {
      .btn, .sidebar-action-btn, .nav-item, .hamburger-btn, select {
          min-height: 48px;
      }
  }
  ```

## **12\. Z-index 階層管理規格**

各UIパーツに直接数値をハードコードする（無作為な9999等）ことを禁止し、全体を統括する階層スケールを以下の数値に厳格に固定する。

* z-index: 10 : 通常のフローから浮くUI（固定サイドバーなど）  
* z-index: 30 : ヘッダー (.header-container)  
* z-index: 100 : ドロップダウンメニュー / カスタムセレクト  
* z-index: 1000 : モーダル背景（オーバーレイ / \#modal-overlay 等）  
* z-index: 1010 : モーダル本体 (\#enzymeModal 等)  
* z-index: 9000 : 根拠ポップオーバー (.rationale-text)  
* z-index: 9999 : ツールチップ (.custom-tooltip)  
* z-index: 100000 : トースト通知 (\#toast) \- 常に最前面

## **13\. インタラクション＆描画修正 仕様書**

長大な塩基配列や波形データを扱うビュアー（Sanger Trace Editor等）において、ユーザーが直感的かつストレスなくデータを範囲選択できるよう、以下の「可変スピード型エッジオートスクロール」の実装を定義する。

### **① 可変スピード型 エッジオートスクロール仕様（線形補間ロジック採用）**

ブラウザ標準のテキストエリアのような「枠外へのドラッグによる自動スクロール」をカスタムCanvas/Div上で再現し、さらにプロ仕様の「距離に応じた加速」を実装する。

* **発火条件と検知エリア**  
  * **検知エリア**: スクロールコンテナの左右両端から **内側 50px** を「スクロール発火エリア」とする。  
  * **監視イベント**: mousedown（ドラッグ開始）が発火した状態での mousemove を監視し、カーソルのX座標が発火エリアに侵入、またはコンテナの枠外（外側）へ出た場合にスクロールループを起動する。  
  * **解除イベント**: mouseup またはコンテナから完全にカーソルが外れた（mouseleave）瞬間に、スクロールループを停止する。  
* **可変スピード（加速）の計算ロジック**  
  一定速度のスクロールによるユーザーのフラストレーションを防ぐため、カーソルが「発火エリアの奥へどれだけ侵入しているか（超過距離）」を計算し、動的にスクロール速度を変化させる。（※Phase 5 DNA Alignment Studioの線形補間方式を標準規格とする）  
  * **超過距離の算出**: 発火エリアの境界線から、現在のマウスカーソルまでのピクセル距離を算出する。  
  * **速度計算式**: スクロール速度 \= (超過距離 / 検知エリア幅) × 最大速度  
    これにより、端に触れた瞬間は滑らかに始まり、押し込むにつれて最大速度へシームレスに加速するプロ仕様の操作感を実現する。  
  * **最大速度の制限（リミッター）**: 速度が無制限に上がりすぎて制御不能になるのを防ぐため、最大速度を **30px/フレーム**（1秒間に約1800pxの移動相当）に制限する。  
* **実行メソッド**  
  * ガタつきのない滑らかな描画を維持するため、setInterval ではなく必ず requestAnimationFrame を用いて scrollLeft の値を毎フレーム更新すること。

**実装参考コード（JS）**

function checkAutoScroll() {    
    if (\!isDragging) return;    
    const wrap \= document.getElementById('scrollContainer');    
    const rect \= wrap.getBoundingClientRect();    
        
    const scrollTriggerArea \= 50; // 検知エリア幅    
    const maxSpeed \= 30;          // 最大速度    
    let scrollSpeed \= 0;    
        
    // 右端の検知    
    if (currentMouseX \> rect.right \- scrollTriggerArea) {    
        let dist \= currentMouseX \- (rect.right \- scrollTriggerArea); // 超過距離    
        scrollSpeed \= Math.min(maxSpeed, (dist / scrollTriggerArea) \* maxSpeed); // 線形補間    
    }     
    // 左端の検知    
    else if (currentMouseX \< rect.left \+ scrollTriggerArea) {    
        let dist \= (rect.left \+ scrollTriggerArea) \- currentMouseX; // 超過距離    
        scrollSpeed \= \-Math.min(maxSpeed, (dist / scrollTriggerArea) \* maxSpeed); // 線形補間    
    }    
        
    // スクロール実行と再帰ループ    
    if (scrollSpeed \!== 0\) {    
        wrap.scrollLeft \+= scrollSpeed;    
        // ※必要に応じてここで選択範囲の更新処理を呼ぶ    
    }    
    autoScrollFrame \= requestAnimationFrame(checkAutoScroll);    
}  

## **14\. Web Workerと計算エンジンのアーキテクチャ規格【v33.0 新設】**

系統推定（最尤法・最大節約法）やブートストラップ解析など、O(n\!) で計算量が爆発するアルゴリズムをブラウザ上で実行するための安全規格。

**① Web Workerへの完全分離** メインスレッド（UIの描画）をフリーズさせないため、数秒以上の処理が見込まれる重負荷計算は、必ず専用のWeb Worker（例: `phylo_worker.js`）に分離してバックグラウンドで実行させること。また、長時間の計算（例: ブートストラップ1000回）では、Workerからメインスレッドへ定期的に `PROGRESS` イベントを送信し、UI上に滑らかな進捗バーや完了回数を表示してユーザーの不安を払拭すること。

**② 計算リミッターと動的UIガードレール** ブラウザのクラッシュを防ぐため、Worker側には必ず「入力配列数がX個を超えたら計算を拒否してエラーを返す」というハードリミット（安全装置）を設けること。 さらに、UI（HTML/JS）側でも「最尤法を選んだら、ブートストラップは10回までしか選べなくする（100回以上は disabled）」といった**動的なUIガードレール**を敷き、ユーザーが計算不能な設定を実行できないよう事前に防ぐこと。

**③ 60fps UIのための「事前計算（プレキャッシュ）」アーキテクチャ** スライダー（`<input type="range">`）をドラッグしてリアルタイムに結果を変動させるシミュレーターにおいて、スライダーが動くたびに重い本物の計算（フェルゼンスタイン計算等）を走らせるとUIがガタつく（スタッターが生じる）。 これを回避しつつ「本物の数式」を担保するため、以下のプレキャッシュ方式を標準規格とする。

1. シミュレーター起動時（または条件変更時）に、スライダーの最小値から最大値までの全パターン（例：0.01刻みで100段階）の「本物の計算結果」を、ループ処理またはWorkerを用いて**事前に一括計算**し、JSの配列変数に格納（プレキャッシュ）しておく。  
2. スライダー操作時（`oninput`）は再計算を一切行わず、プレキャッシュされた配列から「インデックスに対応する結果を取り出して描画するだけ」の超軽量処理 O(1) に留める。

## **15\. PWA・ネイティブアプリ化（質感・触覚）規格【v33.5 新設】**

**【完全版】ネイティブ体験を構築するメタタグ＆CSS規格 (v34.4 改訂)** ブラウザ特有の「白飛び・ゴム紐バウンス・不要なテキスト選択・フッターの押し出しバグ」を完全に防ぎ、MPAのままSPA風の滑らかな画面遷移を実現するため、全アプリの `<head>` と `<style>` に以下のコードを強制適用する。

① `<head>` 内のメタタグ

\<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"\>

\<link rel="manifest" href="manifest.json"\>

\<meta name="theme-color" content="\#1a252f"\>

\<meta name="apple-mobile-web-app-capable" content="yes"\>

\<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"\>

\<meta name="apple-mobile-web-app-title" content="BioEdu"\>

\<link rel="apple-touch-icon" href="icon-192.png"\>

② `<style>` 内の共通CSSレイアウト補正

/\* 画面読み込み・遷移時の白飛び防止 \*/

html { background-color: \#1a252f; }

body { background-color: var(--bg-color); animation: pageFadeIn 0.15s ease-out forwards; }

@keyframes pageFadeIn { from { opacity: 0.85; } to { opacity: 1; } }

/\* ラバーバンド効果の完全排除（バウンス抑制の徹底） \*/

html, body {
  overscroll-behavior: none;
}

/\* タップハイライト無効化・ダブルタップズーム防止・100dvh完全固定 \*/

\*, \*::before, \*::after { box-sizing: border-box; \-webkit-tap-highlight-color: transparent; }

html, body { touch-action: manipulation; height: 100%; height: 100dvh; }

/\* 不要なテキスト選択の禁止（入力欄のみ許可） \*/

body.no-select-ui { user-select: none; \-webkit-user-select: none; \-webkit-touch-callout: none; }

input, textarea { user-select: text; \-webkit-user-select: text; }

/\* セーフエリア対応と慣性スクロール・バウンス抑制 \*/

.sidebar { padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px); }

.header-container { padding-top: env(safe-area-inset-top, 0px); }

.footer { padding: 15px 20px calc(15px \+ env(safe-area-inset-bottom, 0px)) 20px; }

.content-area { 

  flex: 1; overflow-y: auto; 

  \-webkit-overflow-scrolling: touch; 

  overscroll-behavior-y: contain; 

  padding-bottom: calc(120px \+ env(safe-area-inset-bottom, 0px)); 

}

/\* --------------------------------------------------- MPA用SPA風シームレス画面遷移 (View Transitions API / v34.4 義務化) --------------------------------------------------- \*/

@view-transition {
  navigation: auto;
}

::view-transition-old(root) {
  animation: 90ms cubic-bezier(0.4, 0, 1, 1) both fade-out;
}

::view-transition-new(root) {
  animation: 210ms cubic-bezier(0, 0, 0.2, 1) 90ms both fade-in;
}

@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/\* メインラッパーのフッター押し出しバグ修正 \*/

.main-wrapper { display: flex; flex-direction: column; overflow: hidden; position: relative; padding-left: 60px; height: 100dvh; max-height: 100dvh; transition: padding-left 0.3s; box-sizing: border-box; width: 100%; }

/\* ボタンの沈み込み（ハプティクス連動用） \*/

.btn:active, .sidebar-action-btn:active { transform: scale(0.97); }

③ ハプティクス連動JS関数

// 触覚（Haptic）フィードバック共通関数（全アプリの \<script\> 内に配置）

function triggerHapticFeedback() {

    if (navigator.vibrate) {

        navigator.vibrate(10); // 10msの極小振動

    }

}



## **大規模一括改修におけるPython一括更新スクリプト活用の原則（トークン枯渇防止SOP）**

* **背景:** 全15ファイル等の複数アプリ・ファイルに対する直接書き換え指示は、トークン上限の枯渇およびコンテキスト破綻を招く深刻なボトルネックとなる。
* **対策原則（Pythonスクリプト駆動型一括同期）:** 複数ファイルにまたがる一括改修や置換を行う際は、AIに直接各ファイルを多重編集させるのではなく、ローカル環境で安全に動作する「一括更新用Pythonスクリプト」を生成させ、それを実行して同期するアプローチを標準作業手順（SOP）とする。
* **適用手順:**
  1. 司令塔よりPythonスクリプトの仕様とコードを提示・生成させる。
  2. ローカル環境にてスクリプトファイルを配置・実行し、一括置換・同期を行う。
  3. 実行ログを検証し、無限ループやコンテキスト破綻を完全に回避する。

