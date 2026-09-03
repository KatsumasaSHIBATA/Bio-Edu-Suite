import os
import re
import glob

CORRECT_FORM_BASE = "https://docs.google.com/forms/d/e/1FAIpQLSet9LJgsTO0aZ6pbdekLr4fBeeDPAxREk8xmzY1f-gTcDnFrQ/viewform"

def repair_open_feedback_func(content, entry_key):
    correct_func = f"""function openFeedbackForm() {{
    const baseUrl = "{CORRECT_FORM_BASE}";
    const appName = document.title;
    window.open(`${{baseUrl}}?usp=pp_url&{entry_key}=${{encodeURIComponent(appName)}}`, '_blank');
}}"""
    
    # より安全で確実な正規表現
    pattern = r'function\s+openFeedbackForm\s*\([^)]*\)\s*\{[\s\S]*?(?=\n(?:async\s+)?function|\n</script>)'
    if re.search(pattern, content):
        content = re.sub(pattern, correct_func, content)
    else:
        content = content.replace("</script>", correct_func + "\n</script>", 1)
    return content

def unify_confirm_modal_ui(content):
    modal_btn_css = """
/* 【ガイドライン第8項・第11項準拠】データ初期化確認モーダル ボタンUI規格 */
#confirmModal .modal-footer {
    border-top: none !important;
    background: #ffffff !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    gap: 12px !important;
    padding: 0 20px 30px !important;
}
#confirmModal .modal-footer .btn {
    min-width: 120px !important;
    min-height: 44px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 8px 16px !important;
    font-size: 13px !important;
    font-weight: bold !important;
    border-radius: 4px !important;
    box-shadow: none !important;
    cursor: pointer !important;
    transition: 0.2s ease !important;
    box-sizing: border-box !important;
}
#confirmModal .modal-footer .btn-secondary {
    background-color: #fdfefe !important;
    color: #2c3e50 !important;
    border: 1px solid #bdc3c7 !important;
}
#confirmModal .modal-footer .btn-secondary:hover {
    background-color: #f2f4f4 !important;
    filter: brightness(0.98) !important;
}
#confirmModal .modal-footer #confirmOkBtn,
#confirmModal .modal-footer .btn-danger {
    background-color: var(--danger, #e74c3c) !important;
    color: #ffffff !important;
    border: 1px solid var(--danger, #e74c3c) !important;
}
#confirmModal .modal-footer #confirmOkBtn:hover,
#confirmModal .modal-footer .btn-danger:hover {
    filter: brightness(1.08) !important;
    box-shadow: 0 2px 6px rgba(231, 76, 60, 0.3) !important;
}
#confirmModal .modal-footer .btn:active {
    transform: scale(0.98) !important;
}
@media (max-width: 1024px) {
    #confirmModal .modal-footer .btn {
        min-height: 48px !important;
    }
}
"""
    if "データ初期化確認モーダル ボタンUI規格" not in content:
        if "</style>" in content:
            content = content.replace("</style>", modal_btn_css + "\n</style>", 1)

    target_footer = """    <div class="modal-footer" style="border-top: none; background: white; justify-content: center; gap: 12px; padding-bottom: 30px;">
      <button class="btn btn-secondary" onclick="closeConfirm(); triggerHapticFeedback();">キャンセル</button>
      <button class="btn btn-danger" id="confirmOkBtn" style="background: var(--danger); color: white;">初期化する</button>
    </div>"""

    confirm_block_match = re.search(r'(<div[^>]*id=["\']confirmModal["\'][\s\S]*?)(<div\s+class=["\']modal-footer["\'][^>]*>[\s\S]*?<\/div>)([\s\S]*?<\/div>\s*<\/div>)', content)
    if confirm_block_match:
        before = confirm_block_match.group(1)
        after = confirm_block_match.group(3)
        content = content[:confirm_block_match.start()] + before + target_footer + after + content[confirm_block_match.end():]

    return content

def main():
    patterns = ["*.html", "apps/*.html", "**/*.html"]
    html_files = set()
    for p in patterns:
        for f in glob.glob(p, recursive=True):
            if "node_modules" not in f and ".git" not in f:
                html_files.add(f)

    html_files = sorted(list(html_files))
    print(f"対象HTMLファイル数: {len(html_files)}")

    entry_key = "entry.1969218085"
    print(f"使用するフォーム連携パラメータ: {entry_key}")

    updated_count = 0
    for fpath in html_files:
        with open(fpath, 'r', encoding='utf-8') as f:
            original = f.read()

        content = repair_open_feedback_func(original, entry_key)
        content = unify_confirm_modal_ui(content)

        if content != original:
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(content)
            updated_count += 1
            print(f"[PATCHED] {fpath}")

    print(f"\n完了: {updated_count} / {len(html_files)} ファイルを一括更新しました。")

if __name__ == "__main__":
    main()
