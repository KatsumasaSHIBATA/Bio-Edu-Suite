import os
import re
import glob

def find_file_by_patterns(patterns):
    for p in patterns:
        matches = glob.glob(p)
        if matches:
            return matches[0]
    return None

def patch_app_05(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    if "YOUR_FORM_ID" in content:
        content = re.sub(
            r"const\s+baseUrl\s*=\s*[\"\u0027]https://docs\.google\.com/forms/d/e/[^\"\u0027]+/viewform[\"\u0027];",
            "const baseUrl = \"https://docs.google.com/forms/d/e/1FAIpQLScX_sample_feedback_form/viewform\";",
            content
        )
    
    if "function openFeedbackForm" not in content:
        script_insert = """
function openFeedbackForm() {
    const baseUrl = "https://docs.google.com/forms/d/e/1FAIpQLScX_sample_feedback_form/viewform";
    const appName = document.title;
    window.open(`${baseUrl}?usp=pp_url&entry.appName=${encodeURIComponent(appName)}`, "_blank");
}
"""
        content = content.replace("</script>", script_insert + "\n</script>", 1)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"[OK] App 05 patched: {filepath}")

def patch_app_08(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    css_patch = """
/* アプリ8 バケツリレー＆保存ボタングループ右寄せ規格 */
.export-btn-group, #exportButtonGroup, .tree-export-actions {
    display: flex !important;
    justify-content: flex-end !important;
    align-items: center !important;
    gap: 8px !important;
    width: 100% !important;
    margin-left: auto !important;
}
"""
    if "アプリ8 バケツリレー＆保存ボタングループ右寄せ規格" not in content:
        content = content.replace("</style>", css_patch + "\n</style>", 1)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"[OK] App 08 patched: {filepath}")

def patch_app_09(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    css_patch = """
/* アプリ9 バケツリレーボタングループ（幅同期・右寄せ） */
.morpho-export-group, #morphoExportGroup, .export-btn-group {
    display: flex !important;
    justify-content: flex-end !important;
    align-items: center !important;
    gap: 8px !important;
    width: 100% !important;
    margin-left: auto !important;
}
.morpho-export-group .btn, #morphoExportGroup .btn, .export-btn-group .btn-secondary {
    min-width: 110px !important; /* 一番文字数の長い「JSONコピー」基準 */
    text-align: center !important;
    justify-content: center !important;
    box-sizing: border-box !important;
}
"""
    if "アプリ9 バケツリレーボタングループ（幅同期・右寄せ）" not in content:
        content = content.replace("</style>", css_patch + "\n</style>", 1)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"[OK] App 09 patched: {filepath}")

def patch_app_10(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    content = content.replace("統合解析を実行", "解析を実行")

    css_patch = """
/* アプリ10 解析実行ボタン（未解析時無効化・白） */
#runTaxonomyBtn:disabled, #runAnalysisBtn:disabled, .btn-run-analysis:disabled {
    background-color: #ffffff !important;
    color: #bdc3c7 !important;
    border: 1px solid #bdc3c7 !important;
    opacity: 0.7 !important;
    cursor: not-allowed !important;
    box-shadow: none !important;
    filter: none !important;
}
"""
    if "アプリ10 解析実行ボタン" not in content:
        content = content.replace("</style>", css_patch + "\n</style>", 1)

    js_patch = """
// アプリ10 初期ガードレール補正
document.addEventListener("DOMContentLoaded", () => {
    const runBtn = document.getElementById("runTaxonomyBtn") || document.getElementById("runAnalysisBtn") || document.querySelector(".btn-run-analysis");
    if (runBtn) {
        runBtn.disabled = true;
    }
    // タングルグラム・モーフィング切替ボタンを強制無効化しない
    const toggleBtns = document.querySelectorAll(".view-toggle-btn, .tab-btn");
    toggleBtns.forEach(btn => {
        if (!btn.classList.contains("analysis-trigger")) {
            btn.disabled = false;
        }
    });
});
"""
    if "アプリ10 初期ガードレール補正" not in content:
        content = content.replace("</script>", js_patch + "\n</script>", 1)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"[OK] App 10 patched: {filepath}")

def patch_app_11(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    css_patch = """
/* アプリ11 解析実行ボタン（未解析時無効化・白） */
#runVariantAnalysisBtn:disabled, #runAnalysisBtn:disabled, .btn-run-analysis:disabled {
    background-color: #ffffff !important;
    color: #bdc3c7 !important;
    border: 1px solid #bdc3c7 !important;
    opacity: 0.7 !important;
    cursor: not-allowed !important;
    box-shadow: none !important;
}
"""
    if "アプリ11 解析実行ボタン" not in content:
        content = content.replace("</style>", css_patch + "\n</style>", 1)

    js_patch = """
// アプリ11 初期ガードレール補正
document.addEventListener("DOMContentLoaded", () => {
    const runBtn = document.getElementById("runVariantAnalysisBtn") || document.getElementById("runAnalysisBtn") || document.querySelector(".btn-run-analysis");
    if (runBtn) {
        runBtn.disabled = true;
    }
});
"""
    if "アプリ11 初期ガードレール補正" not in content:
        content = content.replace("</script>", js_patch + "\n</script>", 1)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"[OK] App 11 patched: {filepath}")

def main():
    files_map = {
        5: find_file_by_patterns(["*05*.html", "*alignment*.html", "apps/*05*.html", "5_DNA_Alignment_Studio.html"]),
        8: find_file_by_patterns(["*08*.html", "*phylogen*.html", "apps/*08*.html", "8_Phylogenetic_Tree_Builder.html"]),
        9: find_file_by_patterns(["*09*.html", "*morpho*.html", "apps/*09*.html", "9_Morphometrics_Studio.html"]),
        10: find_file_by_patterns(["*10*.html", "*taxonomy*.html", "apps/*10*.html", "10_integrative_taxonomy_studio.html"]),
        11: find_file_by_patterns(["*11*.html", "*variant*.html", "apps/*11*.html", "11_Comparative_Variant_Analyzer.html"])
    }

    if files_map[5]: patch_app_05(files_map[5])
    if files_map[8]: patch_app_08(files_map[8])
    if files_map[9]: patch_app_09(files_map[9])
    if files_map[10]: patch_app_10(files_map[10])
    if files_map[11]: patch_app_11(files_map[11])

if __name__ == "__main__":
    main()
