import os
import re
import glob

def find_app_file(pattern_list):
    for p in pattern_list:
        matches = glob.glob(p, recursive=True)
        if matches:
            return matches[0]
    return None

def clean_src_scripts(content):
    # src属性を持つscriptタグ内に誤って混入したインラインJSを除去
    return re.sub(r'(<script\s+src="[^"]+">)[\s\S]*?(</script>)', r'\1\2', content)

def patch_app_10(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. 外部スクリプトタグ内の不正なJSをクリーンアップ
    content = clean_src_scripts(content)

    # 2. アプリ⑩ タングルグラム・モーフィング表示パネルのインライン白化を解除
    content = re.sub(
        r'(<div class="viewer-container" id="viewer-area"[^>]*)style="opacity:\s*0\.5;\s*pointer-events:\s*none;\s*transition:\s*0\.3s;"',
        r'\1style="transition: 0.3s;"',
        content
    )

    # 3. ボタンのID付与・クラス統一・初期disabled設定
    # 既存の解析ボタンを探して置換
    btn_pattern = r'<button\s+(?:id=["\'][^"\']+["\']\s+)?class=["\'][^"\']*btn-primary[^"\']*["\'][^>]*onclick=["\']runIntegration\(\)["\'][^>]*>[\s\S]*?解析を実行\s*<\/button>'
    new_btn = '''<button id="run-analysis-btn-10" class="btn btn-primary" onclick="runIntegration()" disabled>
                    <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    解析を実行
                </button>'''
    content = re.sub(btn_pattern, new_btn, content)

    # 4. ガイドライン準拠のボタンCSS注入（ID直接指定で確実に上書き）
    css_patch = """
/* 【ガイドライン準拠】アプリ⑩ 解析実行ボタン（未解析時: 白・無効）規格 */
#run-analysis-btn-10 {
    background-color: #3498db !important;
    color: #ffffff !important;
    border: 1px solid #2980b9 !important;
    border-radius: 4px !important;
    padding: 8px 16px !important;
    font-size: 13px !important;
    font-weight: bold !important;
    cursor: pointer !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 6px !important;
    box-shadow: none !important;
    transition: all 0.2s ease !important;
    width: fit-content !important;
    min-height: 44px !important;
    box-sizing: border-box !important;
}
#run-analysis-btn-10:hover:not(:disabled) {
    background-color: #2980b9 !important;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
}
#run-analysis-btn-10:disabled {
    background-color: #ffffff !important;
    color: #bdc3c7 !important;
    border: 1px solid #d5dbdb !important;
    cursor: not-allowed !important;
    opacity: 0.8 !important;
    box-shadow: none !important;
    filter: none !important;
    transform: none !important;
}
"""
    if "【ガイドライン準拠】アプリ⑩ 解析実行ボタン" not in content:
        content = content.replace("</style>", css_patch + "\n</style>", 1)

    # 5. 正確な入力監視JS（独立したscriptタグ）の注入
    js_patch = """
<script>
// アプリ⑩ 解析実行ボタンのリアルタイム監視ガードレール
document.addEventListener('DOMContentLoaded', () => {
    const runBtn = document.getElementById('run-analysis-btn-10');
    
    function checkApp10Inputs() {
        if (!runBtn) return;
        const molInput = document.getElementById('newick-mol-input');
        const morphInput = document.getElementById('hybrid-morph-input');
        const jsonInput = document.getElementById('json-input');

        const hasMol = molInput && molInput.value.trim().length > 0;
        const hasMorph = (morphInput && morphInput.value.trim().length > 0) || (jsonInput && jsonInput.value.trim().length > 0);

        runBtn.disabled = !(hasMol && hasMorph);
    }

    ['newick-mol-input', 'hybrid-morph-input', 'json-input'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', checkApp10Inputs);
            el.addEventListener('change', checkApp10Inputs);
        }
    });

    // 初期化チェック
    checkApp10Inputs();
});
</script>
"""
    if "アプリ⑩ 解析実行ボタンのリアルタイム監視ガードレール" not in content:
        content = content.replace("</body>", js_patch + "\n</body>", 1)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"[OK] App 10 patched: {filepath}")

def patch_app_11(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. 外部スクリプトタグ内の不正なJSをクリーンアップ
    content = clean_src_scripts(content)

    # 2. ボタン要素に初期disabledを付与
    btn_pattern = r'(<button\s+id=["\']run-analysis-btn["\'][^>]*?class=["\'][^"\']*btn[^"\']*["\'][^>]*?)(>)'
    def add_disabled(match):
        tag = match.group(1)
        if 'disabled' not in tag:
            tag += ' disabled'
        return tag + match.group(2)
    content = re.sub(btn_pattern, add_disabled, content)


    # 3. ガイドライン準拠のボタンCSS注入
    css_patch = """
/* 【ガイドライン準拠】アプリ⑪ 解析実行ボタン（未解析時: 白・無効）規格 */
#run-analysis-btn {
    background-color: #3498db !important;
    color: #ffffff !important;
    border: 1px solid #2980b9 !important;
    border-radius: 4px !important;
    padding: 8px 16px !important;
    font-size: 13px !important;
    font-weight: bold !important;
    cursor: pointer !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 6px !important;
    box-shadow: none !important;
    transition: all 0.2s ease !important;
    width: fit-content !important;
    min-height: 44px !important;
    box-sizing: border-box !important;
}
#run-analysis-btn:hover:not(:disabled) {
    background-color: #2980b9 !important;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
}
#run-analysis-btn:disabled {
    background-color: #ffffff !important;
    color: #bdc3c7 !important;
    border: 1px solid #d5dbdb !important;
    cursor: not-allowed !important;
    opacity: 0.8 !important;
    box-shadow: none !important;
    filter: none !important;
    transform: none !important;
}
"""
    if "【ガイドライン準拠】アプリ⑪ 解析実行ボタン" not in content:
        content = content.replace("</style>", css_patch + "\n</style>", 1)

    # 4. 正確な入力監視JS（独立したscriptタグ）の注入
    js_patch = """
<script>
// アプリ⑪ 解析実行ボタンのリアルタイム監視ガードレール
document.addEventListener('DOMContentLoaded', () => {
    const runBtn = document.getElementById('run-analysis-btn');

    function checkApp11Inputs() {
        if (!runBtn) return;
        const mutInput = document.getElementById('mutation-data');
        const varInput = document.getElementById('variation-data');

        const hasMut = mutInput && mutInput.value.trim().length > 0;
        const hasVar = varInput && varInput.value.trim().length > 0;

        runBtn.disabled = !(hasMut && hasVar);
    }

    ['mutation-data', 'variation-data'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', checkApp11Inputs);
            el.addEventListener('change', checkApp11Inputs);
        }
    });

    // 初期化チェック
    checkApp11Inputs();
});
</script>
"""
    if "アプリ⑪ 解析実行ボタンのリアルタイム監視ガードレール" not in content:
        content = content.replace("</body>", js_patch + "\n</body>", 1)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"[OK] App 11 patched: {filepath}")

def main():
    app10_file = find_app_file(["*10*.html", "apps/*10*.html", "*taxonomy*.html", "apps/*taxonomy*.html"])
    app11_file = find_app_file(["*11*.html", "apps/*11*.html", "*variant*.html", "apps/*variant*.html"])

    if app10_file: patch_app_10(app10_file)
    if app11_file: patch_app_11(app11_file)

if __name__ == "__main__":
    main()
