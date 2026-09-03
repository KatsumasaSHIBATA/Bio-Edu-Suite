import os
import re
import glob

TARGET_DIR = "."
HTML_FILES = glob.glob(os.path.join(TARGET_DIR, "*.html"))

# 1. 注入するメタタグ定義（未設定または旧設定を置換/補完）
NOTCH_META_TAGS = """    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="theme-color" content="#1a252f">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="BioEdu">"""

# 2. 注入する濃紺同化・セーフエリアCSS
NAVY_SYSTEM_CSS = """
/* === Bio-Edu Suite: 濃紺同化・上下セーフエリア完全統一 (v34.4) === */
html {
    background-color: #1a252f !important; /* 上下バウンス・ノッチ奥の完全濃紺化 */
    height: 100%;
    height: 100dvh;
    overscroll-behavior: none;
}
body {
    background-color: #1a252f !important;
    margin: 0;
    padding: 0;
    height: 100%;
    height: 100dvh;
    overflow: hidden;
}
.header-container {
    background: #1a252f !important;
    padding-top: env(safe-area-inset-top, 0px) !important;
    flex-shrink: 0;
    width: 100%;
}
.footer {
    background: #1a252f !important;
    padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px)) !important;
    flex-shrink: 0;
    width: 100%;
}
.sidebar {
    padding-top: env(safe-area-inset-top, 0px);
    padding-bottom: env(safe-area-inset-bottom, 0px);
}
.content-area {
    background-color: var(--bg-color, #f0f3f4) !important;
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
}
/* Googleフォーム アプリ内モーダル埋め込み用スタイル */
#feedbackModal .modal-content {
    max-width: 640px;
    width: 90vw;
    height: 80vh;
    display: flex;
    flex-direction: column;
    padding: 0;
    overflow: hidden;
    background: #1a252f;
    border: 1px solid #34495e;
}
#feedbackModal .modal-header {
    background: #1a252f;
    color: #ffffff;
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #2c3e50;
}
#feedbackIframe {
    flex: 1;
    width: 100%;
    border: none;
    background: #ffffff;
}
/* === 濃紺同化パッチ 終了 === */
"""


# 3. 注入するGoogleフォーム用モーダルDOM
FEEDBACK_MODAL_HTML = """
<!-- アプリ内Googleフォーム・フィードバックモーダル -->
<div class="modal-overlay" id="feedbackModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 10010; justify-content: center; align-items: center;">
  <div class="modal-content">
    <div class="modal-header">
      <h3 style="margin: 0; font-size: 15px; color: #fff; display: flex; align-items: center; gap: 8px;">
        <svg class="header-icon" style="width: 18px; height: 18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        ご意見・フィードバック
      </h3>
      <button class="modal-close" onclick="closeFeedbackForm(); triggerHapticFeedback();" style="background: transparent; border: none; color: #bdc3c7; cursor: pointer; font-size: 20px;">&times;</button>
    </div>
    <iframe id="feedbackIframe" src="about:blank" loading="lazy"></iframe>
  </div>
</div>
"""

# 4. 注入・更新するフィードバック制御JS関数
FEEDBACK_JS_CODE = """
// Googleフォーム アプリ内モーダル開閉関数 (濃紺コンテキスト維持)
function openFeedbackForm() {
    if (window.innerWidth <= 1024) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.remove('open');
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay) overlay.classList.remove('open');
    }
    const modal = document.getElementById('feedbackModal');
    const iframe = document.getElementById('feedbackIframe');
    const appName = document.title || 'Bio-Edu Suite';
    const baseUrl = "https://docs.google.com/forms/d/e/1FAIpQLSc_EXAMPLE_FORM_ID/viewform"; // 必要に応じて実際のForm IDに置換
    if (modal && iframe) {
        if (iframe.src === 'about:blank' || !iframe.src) {
            iframe.src = `${baseUrl}?embedded=true&entry.12345678=${encodeURIComponent(appName)}`;
        }
        modal.style.display = 'flex';
    } else {
        window.open(`${baseUrl}?entry.12345678=${encodeURIComponent(appName)}`, '_blank');
    }
}
function closeFeedbackForm() {
    const modal = document.getElementById('feedbackModal');
    if (modal) modal.style.display = 'none';
}
"""


def patch_html_file(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    original_content = content

    # A. メタタグの正規化（viewport-fit=cover & theme-color=#1a252f）
    if '<meta name="theme-color"' in content:
        content = re.sub(r'<meta\s+name=["\']theme-color["\'].*?>', '<meta name="theme-color" content="#1a252f">', content)
    else:
        content = content.replace("<head>", '<head>\n    <meta name="theme-color" content="#1a252f">')

    if 'viewport-fit=cover' not in content:
        if '<meta name="viewport"' in content:
            def add_cover(match):
                inner = match.group(1)
                if 'viewport-fit=cover' not in inner:
                    return f'<meta name="viewport" content="{inner}, viewport-fit=cover">'
                return match.group(0)
            content = re.sub(r'<meta\s+name=["\']viewport["\']\s+content=["\'](.*?)["\'].*?>', add_cover, content)
        else:
            # Fallback (Should not happen if all files have viewport)
            content = content.replace("<head>", '<head>\n    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">')


    if 'apple-mobile-web-app-status-bar-style' not in content:
        content = content.replace("</head>", '    <meta name="apple-mobile-web-app-capable" content="yes">\n    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n</head>')


    # B. CSSパッチの注入（多重挿入防止）
    if "Bio-Edu Suite: 濃紺同化・上下セーフエリア完全統一" not in content:
        if "</style>" in content:
            content = content.replace("</style>", f"{NAVY_SYSTEM_CSS}\n</style>", 1)
        else:
            content = content.replace("</head>", f"<style>{NAVY_SYSTEM_CSS}</style>\n</head>", 1)

    # C. Googleフォーム用モーダルDOMの注入（多重挿入防止）
    if 'id="feedbackModal"' not in content:
        if "</body>" in content:
            content = content.replace("</body>", f"{FEEDBACK_MODAL_HTML}\n</body>", 1)

    # D. JS制御関数の注入（多重挿入防止）
    if "openFeedbackForm" in original_content and "feedbackIframe" not in original_content:
        # 既存の openFeedbackForm をアプリ内モーダル対応版へ置換
        # ネストされた {} を考慮して置換する
        start_idx = content.find("function openFeedbackForm")
        if start_idx != -1:
            # { を探す
            brace_start = content.find("{", start_idx)
            if brace_start != -1:
                brace_count = 1
                curr_idx = brace_start + 1
                while brace_count > 0 and curr_idx < len(content):
                    if content[curr_idx] == '{':
                        brace_count += 1
                    elif content[curr_idx] == '}':
                        brace_count -= 1
                    curr_idx += 1
                
                # 置換
                content = content[:start_idx] + FEEDBACK_JS_CODE.strip() + content[curr_idx:]
    elif "openFeedbackForm" not in original_content:
        if "</script>" in content:
            # 最後の </script> の直前に挿入
            last_script_idx = content.rfind("</script>")
            content = content[:last_script_idx] + f"\n{FEEDBACK_JS_CODE}\n" + content[last_script_idx:]




    if content != original_content:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Patched: {file_path}")
    else:
        print(f"Already up-to-date: {file_path}")

def main():
    print(f"Scanning {len(HTML_FILES)} HTML files for navy theme-color synchronization...")
    for html_file in HTML_FILES:
        patch_html_file(html_file)
    print("All apps updated successfully.")

if __name__ == "__main__":
    main()