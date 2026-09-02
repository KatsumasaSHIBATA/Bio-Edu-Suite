import re
import sys

file_path = 'app14_comparative_variant_analyzer.html'
try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
except Exception as e:
    print(f"Error reading file: {e}")
    sys.exit(1)

start_tag = '<div class="main-content">'
end_tag = '</div><!-- /.content-area -->'

if start_tag in content and end_tag in content:
    start_idx = content.find(start_tag)
    end_idx = content.find(end_tag)
    pre_end = content.rfind('</div>', start_idx, end_idx)
    
    new_html = """<!-- 差し替え用 HTML コンテンツ -->
<div class="content-area" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; width: 100%;">
    <!-- パネル1: 突然変異 (Mutation) -->
    <div class="card" style="display: flex; flex-direction: column;">
        <div class="card-header">
            1. 突然変異データ (Mutation)
        </div>
        <div class="card-body" style="flex: 1; display: flex; flex-direction: column;">
            <p class="text-sm text-gray-500 mb-3" style="margin-top:0;">各個体の遺伝的特徴量（座標や数値等）をTSVまたはカンマ区切りで入力してください。</p>
            <textarea id="mutation-data" class="paste-area" style="flex: 0 0 100px; margin-bottom: 15px;" placeholder="例:&#10;0.5, 1.2&#10;0.6, 1.1..."></textarea>
            <div style="flex: 1; min-height: 250px; position: relative;">
                <canvas id="mutationChart"></canvas>
            </div>
        </div>
    </div>

    <!-- パネル2: 変異 (Variation) -->
    <div class="card" style="display: flex; flex-direction: column;">
        <div class="card-header">
            2. 変異データ (Variation)
        </div>
        <div class="card-body" style="flex: 1; display: flex; flex-direction: column;">
            <p class="text-sm text-gray-500 mb-3" style="margin-top:0;">各個体の形態的特徴量（表現型データ等）を入力してください。※上のデータと行数が一致する必要があります。</p>
            <textarea id="variation-data" class="paste-area" style="flex: 0 0 100px; margin-bottom: 15px;" placeholder="例:&#10;12.5, 3.2&#10;13.1, 3.4..."></textarea>
            <div style="flex: 1; min-height: 250px; position: relative;">
                <canvas id="variationChart"></canvas>
            </div>
        </div>
    </div>

    <!-- パネル3: 統合相関 (Mantel Test) -->
    <div class="card" style="grid-column: 1 / -1;">
        <div class="card-header">
            3. 統合相関解析 (Mantel Test)
        </div>
        <div class="card-body">
            <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 15px;">
                <button id="run-analysis-btn" class="btn btn-primary" onclick="triggerHapticFeedback();">
                    <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    解析を実行
                </button>
            </div>
            <div id="result-area" style="display: none;">
                <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 4px; padding: 15px; text-align: center; margin-bottom: 15px; font-size: 16px; font-weight: bold; color: var(--primary);">
                    Mantel相関係数: r = <span id="mantel-r">---</span>
                </div>
                <div style="position: relative; height: 350px; width: 100%;">
                    <canvas id="mantelChart"></canvas>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="step-up-card">
    <h3>
        <svg class="header-icon" style="stroke-width: 2.5;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        より高度な解析ツールへ
    </h3>
    <p>実際の生物学的データを用いたMantel検定には、『R』の『vegan』パッケージや、『GenAlEx』などが活用されます。これにより、遺伝的距離と地理的・形態的距離の相関を統計的に評価し、隔離による分化などの進化プロセスを検証できます。</p>
</div>

<div style="margin-top: 20px; margin-bottom: 20px;">
    <details style="cursor: pointer;">
        <summary style="font-weight: bold; color: var(--text-muted); font-size: 13px;">References & Algorithms</summary>
        <div style="padding: 10px 0 0 15px; font-size: 11px; color: var(--text-muted); line-height: 1.6;">
            <p style="margin-bottom: 8px;">本アプリケーションの計算エンジンは、以下のアルゴリズムに基づき実装されています。</p>
            <ul style="padding-left: 20px; margin: 0; display: flex; flex-direction: column; gap: 6px;">
                <li><strong>Mantel Test:</strong> Mantel, N. (1967). The detection of disease clustering and a generalized regression approach. <em>Cancer Research</em>, 27(2 Part 1), 209-220.</li>
                <li><strong>Euclidean Distance Matrix:</strong> Sneath, P. H. A., & Sokal, R. R. (1973). <em>Numerical Taxonomy: The Principles and Practice of Numerical Classification</em>. W. H. Freeman.</li>
            </ul>
        </div>
    </details>
</div>
<!-- 差し替え完了 -->"""

    updated_content = content[:start_idx] + new_html + '\n' + content[pre_end + 6:]
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(updated_content)
    print('Content replaced!')
else:
    print('Tags not found.')
