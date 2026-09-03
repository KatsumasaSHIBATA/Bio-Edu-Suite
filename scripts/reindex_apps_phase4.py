import os
import glob
import re

# 1. ファイルリネーム（存在確認を行って実行）
renames = [
    ('13_Protein_Structure_Explorer.html', '14_Protein_Structure_Explorer.html'),
    ('12_Central_Dogma_Simulator.html', '13_Central_Dogma_Simulator.html'),
    ('11_Statistical_Genetics_Lab.html', '12_Statistical_Genetics_Lab.html'),
    ('app14_comparative_variant_analyzer.html', '11_Comparative_Variant_Analyzer.html'),
    ('js/app14_ui.js', 'js/app11_ui.js')
]

for src, dst in renames:
    if os.path.exists(src) and not os.path.exists(dst):
        os.rename(src, dst)
        print(f"[RENAME] {src} -> {dst}")

# 2. 全HTMLファイルのドロワーおよび参照の更新
html_files = glob.glob('*.html')

# 新しい Phase 4 〜 Phase 6 の正規ナビゲーションブロック
new_nav_block = """    <div class="nav-header p4"><span class="nav-header-text">Phase 4: 統合検証ルーム</span></div>
    <a href="10_integrative_taxonomy_studio.html" class="nav-item p4">
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3v18M8 21h8M4 7h16"/><path d="M4 7l-2 5h4z"/><path d="M20 7l-2 5h4z"/></svg>
      <span class="nav-text">⑩ Integrative Taxonomy Studio</span>
    </a>
    <a href="11_Comparative_Variant_Analyzer.html" class="nav-item p4">
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3v18M8 21h8M4 7h16"/><path d="M4 7l-2 5h4z"/><path d="M20 7l-2 5h4z"/></svg>
      <span class="nav-text">⑪ Comparative Variant Analyzer</span>
    </a>

    <div class="nav-header p5"><span class="nav-header-text">Phase 5: 統計遺伝学</span></div>
    <a href="12_Statistical_Genetics_Lab.html" class="nav-item p5">
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 21h18"/><path d="M7 21V10M12 21V4M17 21V14"/></svg>
      <span class="nav-text">⑫ Statistical Genetics Lab</span>
    </a>

    <div class="nav-header p6"><span class="nav-header-text">Phase 6: 構造生物学</span></div>
    <a href="13_Central_Dogma_Simulator.html" class="nav-item p6">
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
      <span class="nav-text">⑬ Central Dogma Simulator</span>
    </a>
    <a href="14_Protein_Structure_Explorer.html" class="nav-item p6">
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
      <span class="nav-text">⑭ Protein Structure Explorer</span>
    </a>"""

# Phase 4開始からPhase 6終了（Extra直前）までを置換する正規表現パターン
nav_pattern = re.compile(
    r'<div class="nav-header p4">.*?<div class="nav-header extra">',
    re.DOTALL
)

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # ドロワーの一括更新
    if nav_pattern.search(content):
        content = nav_pattern.sub(new_nav_block + '\n\n    <div class="nav-header extra">', content)

    # 自身へのリンクを active にする
    filename = os.path.basename(filepath)
    # 一旦該当エリアのactiveを外して、自身のhrefにactiveを付与
    content = re.sub(rf'<a href="{filename}" class="nav-item ([^"]*?)"', rf'<a href="{filename}" class="nav-item \1 active"', content)
    # 重複した active active を解消
    content = content.replace('active active', 'active')

    # ファイル自身のタイトル・ヘッダー・JSパスの同期
    if filename == '11_Comparative_Variant_Analyzer.html':
        content = content.replace('⑭ Comparative Variant Analyzer', '⑪ Comparative Variant Analyzer')
        content = content.replace('app14_ui.js', 'app11_ui.js')
        content = content.replace('app14', 'app11')
    elif filename == '12_Statistical_Genetics_Lab.html':
        content = content.replace('⑪ Statistical Genetics Lab', '⑫ Statistical Genetics Lab')
    elif filename == '13_Central_Dogma_Simulator.html':
        content = content.replace('⑫ Central Dogma Simulator', '⑬ Central Dogma Simulator')
    elif filename == '14_Protein_Structure_Explorer.html':
        content = content.replace('⑬ Protein Structure Explorer', '⑭ Protein Structure Explorer')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"[SYNCHRONIZED] {filepath}")