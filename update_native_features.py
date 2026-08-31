import os
import glob
import re

def process_html_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    modified = False

    # 1. メタタグ・ビューポートの補完
    if 'viewport-fit=cover' not in content:
        content = re.sub(r'<meta name="viewport" content="([^"]+)">', r'<meta name="viewport" content="\1, viewport-fit=cover">', content)
        modified = True
    
    meta_tags = """
  <!-- PWA & Native Meta Tags -->
  <link rel="manifest" href="manifest.json">
  <meta name="theme-color" content="#1a252f">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="BioEdu">
  <link rel="apple-touch-icon" href="icon-192.png">"""
    
    if 'apple-mobile-web-app-capable' not in content:
        content = content.replace('</head>', meta_tags + '\n</head>')
        modified = True

    # 2. CSSの安全な注入 (ラバーバンド効果封印、View Transitions)
    css_injection = """
    /* Native UX CSS */
    html, body {
      overscroll-behavior: none;
      overscroll-behavior-x: none;
      touch-action: manipulation;
    }
    @view-transition { navigation: auto; }
    ::view-transition-old(root) { animation: 90ms cubic-bezier(0.4, 0, 1, 1) both fade-out; }
    ::view-transition-new(root) { animation: 210ms cubic-bezier(0, 0, 0.2, 1) 90ms both fade-in; }
    @keyframes fade-out { from { opacity: 1; } to { opacity: 0; } }
    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
"""
    if 'overscroll-behavior: none;' not in content and '@view-transition' not in content:
        if '</style>' in content:
            content = content.replace('</style>', css_injection + '  </style>')
        else:
            content = content.replace('</head>', '  <style>' + css_injection + '  </style>\n</head>')
        modified = True

    # 3 & 4. JSの注入 (長押し封印、Page Visibility APIによるステート・リストア)
    js_injection = """
  <!-- Native UX & State Restore JS -->
  <script>
    // 長押し・右クリックメニューの完全封印
    document.addEventListener('contextmenu', (e) => {
      if (!e.target.closest('input, textarea, [contenteditable]')) {
        e.preventDefault();
      }
    });

    // Page Visibility APIによる瞬間ドラフト保存 ＆ ステート・リストア
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        const inputs = document.querySelectorAll('input, textarea, select');
        const draft = {};
        inputs.forEach(input => {
          if (input.id) {
            if (input.type === 'checkbox' || input.type === 'radio') {
              draft[input.id] = input.checked;
            } else {
              draft[input.id] = input.value;
            }
          }
        });
        sessionStorage.setItem('draft_' + window.location.pathname, JSON.stringify(draft));
      }
    });

    window.addEventListener('DOMContentLoaded', () => {
      const draftStr = sessionStorage.getItem('draft_' + window.location.pathname);
      if (draftStr) {
        try {
          const draft = JSON.parse(draftStr);
          for (const key in draft) {
            const el = document.getElementById(key);
            if (el) {
              if (el.type === 'checkbox' || el.type === 'radio') {
                el.checked = draft[key];
              } else {
                el.value = draft[key];
              }
              // 復元後にイベントを発火させてUIを同期
              el.dispatchEvent(new Event('change', { bubbles: true }));
              el.dispatchEvent(new Event('input', { bubbles: true }));
            }
          }
        } catch(e) {
          console.error("Draft restore failed", e);
        }
      }
    });
  </script>"""
    
    if "document.addEventListener('contextmenu'" not in content:
        content = content.replace('</body>', js_injection + '\n</body>')
        modified = True

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")

def main():
    html_files = glob.glob('**/*.html', recursive=True)
    if not html_files:
        print("HTML files not found.")
        return

    for filepath in html_files:
        process_html_file(filepath)
    
    print("All HTML files processed successfully.")

if __name__ == '__main__':
    main()
