import os
import re
import glob

def find_app_file(pattern_list):
    for p in pattern_list:
        matches = glob.glob(p, recursive=True)
        if matches:
            return matches[0]
    return None

def patch_app_10(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    content = re.sub(r'統合解析を実行', '解析を実行', content)

    css_patch = """
/* 【ガイドライン準拠】アプリ⑩ 解析実行ボタン（未解析時: 白・無効）およびパネル白化解除 */
.btn-run-analysis, #runTaxonomyBtn, #runAnalysisBtn {
    background-color: var(--phase-color, #8e44ad);
    color: #ffffff;
    border: 1px solid transparent;
    border-radius: 4px;
    padding: 10px 16px;
    font-size: 13px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
    box-sizing: border-box;
}
.btn-run-analysis:hover:not(:disabled), #runTaxonomyBtn:hover:not(:disabled), #runAnalysisBtn:hover:not(:disabled) {
    filter: brightness(1.08);
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}
/* 未解析時: 白っぽく押せないスタイル */
.btn-run-analysis:disabled, #runTaxonomyBtn:disabled, #runAnalysisBtn:disabled {
    background-color: #ffffff !important;
    color: #bdc3c7 !important;
    border: 1px solid #d5dbdb !important;
    cursor: not-allowed !important;
    opacity: 0.8 !important;
    box-shadow: none !important;
    filter: none !important;
    transform: none !important;
}

/* タングルグラム・モーフィング表示パネルの白化解除（常時クリア表示） */
#tanglegramPanel, #morphingPanel, .tanglegram-container, .morphing-container, .chart-panel {
    opacity: 1 !important;
    filter: none !important;
    pointer-events: auto !important;
}
.panel-disabled-overlay, .inactive-overlay, .panel-mask {
    display: none !important;
}
"""
    if "アプリ⑩ 解析実行ボタン（未解析時: 白・無効）およびパネル白化解除" not in content:
        content = content.replace("</style>", css_patch + "\n</style>", 1)

    def disable_button(match):
        tag = match.group(0)
        if "disabled" not in tag:
            tag = tag[:-1] + " disabled>"
        return tag

    content = re.sub(r'<button[^>]+id=["\'](?:runTaxonomyBtn|runAnalysisBtn)["\'][^>]*>', disable_button, content)
    content = re.sub(r'<button[^>]+class=["\'][^"\']*btn-run-analysis[^"\']*["\'][^>]*>', disable_button, content)

    js_patch = """
// アプリ⑩ 解析実行ボタンのステータス連動＆パネル白化防止ガード
document.addEventListener('DOMContentLoaded', () => {
    const runBtn = document.getElementById('runTaxonomyBtn') || document.getElementById('runAnalysisBtn') || document.querySelector('.btn-run-analysis');
    window.checkApp10ReadyState = function() {
        if (!runBtn) return;
        const treeInput = document.getElementById('treeInput') || document.getElementById('newickInput');
        const morphoInput = document.getElementById('morphoInput') || document.getElementById('tsvInput');
        const hasTreeData = treeInput ? treeInput.value.trim().length > 0 : (window.currentTreeData != null);
        const hasMorphoData = morphoInput ? morphoInput.value.trim().length > 0 : (window.currentMorphoData != null);
        runBtn.disabled = !(hasTreeData && hasMorphoData);
    };
    ['treeInput', 'newickInput', 'morphoInput', 'tsvInput'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', window.checkApp10ReadyState);
            el.addEventListener('change', window.checkApp10ReadyState);
        }
    });
    window.checkApp10ReadyState();
});
"""
    if "アプリ⑩ 解析実行ボタンのステータス連動＆パネル白化防止ガード" not in content:
        content = content.replace("</script>", js_patch + "\n</script>", 1)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"[OK] App 10 updated: {filepath}")

def patch_app_11(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    css_patch = """
/* 【ガイドライン準拠】アプリ⑪ 解析実行ボタン（未解析時: 白・無効）規格 */
.btn-run-analysis, #runVariantAnalysisBtn, #runAnalysisBtn {
    background-color: var(--phase-color, #8e44ad);
    color: #ffffff;
    border: 1px solid transparent;
    border-radius: 4px;
    padding: 10px 16px;
    font-size: 13px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
    box-sizing: border-box;
}
.btn-run-analysis:hover:not(:disabled), #runVariantAnalysisBtn:hover:not(:disabled), #runAnalysisBtn:hover:not(:disabled) {
    filter: brightness(1.08);
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}
/* 未解析時: 白っぽく押せないスタイル */
.btn-run-analysis:disabled, #runVariantAnalysisBtn:disabled, #runAnalysisBtn:disabled {
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
    if "アプリ⑪ 解析実行ボタン（未解析時: 白・無効）規格" not in content:
        content = content.replace("</style>", css_patch + "\n</style>", 1)

    def disable_button(match):
        tag = match.group(0)
        if "disabled" not in tag:
            tag = tag[:-1] + " disabled>"
        return tag

    content = re.sub(r'<button[^>]+id=["\'](?:runVariantAnalysisBtn|runAnalysisBtn)["\'][^>]*>', disable_button, content)
    content = re.sub(r'<button[^>]+class=["\'][^"\']*btn-run-analysis[^"\']*["\'][^>]*>', disable_button, content)

    js_patch = """
// アプリ⑪ 解析実行ボタンのステータス連動ガード
document.addEventListener('DOMContentLoaded', () => {
    const runBtn = document.getElementById('runVariantAnalysisBtn') || document.getElementById('runAnalysisBtn') || document.querySelector('.btn-run-analysis');
    window.checkApp11ReadyState = function() {
        if (!runBtn) return;
        const mutInput = document.getElementById('mutationInput') || document.getElementById('fastaInput');
        const varInput = document.getElementById('variationInput') || document.getElementById('morphoInput') || document.getElementById('tsvInput');
        const hasMut = mutInput ? mutInput.value.trim().length > 0 : (window.currentMutationData != null);
        const hasVar = varInput ? varInput.value.trim().length > 0 : (window.currentVariationData != null);
        runBtn.disabled = !(hasMut && hasVar);
    };
    ['mutationInput', 'fastaInput', 'variationInput', 'morphoInput', 'tsvInput'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', window.checkApp11ReadyState);
            el.addEventListener('change', window.checkApp11ReadyState);
        }
    });
    window.checkApp11ReadyState();
});
"""
    if "アプリ⑪ 解析実行ボタンのステータス連動ガード" not in content:
        content = content.replace("</script>", js_patch + "\n</script>", 1)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"[OK] App 11 updated: {filepath}")

def main():
    app10_file = find_app_file(["*10*.html", "apps/*10*.html", "*taxonomy*.html", "apps/*taxonomy*.html"])
    app11_file = find_app_file(["*11*.html", "apps/*11*.html", "*variant*.html", "apps/*variant*.html"])

    if app10_file:
        patch_app_10(app10_file)
    else:
        print("[WARN] App 10 file not found.")

    if app11_file:
        patch_app_11(app11_file)
    else:
        print("[WARN] App 11 file not found.")

if __name__ == "__main__":
    main()

