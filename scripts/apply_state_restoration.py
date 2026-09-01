#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bio-Edu Suite ネイティブライクな状態復元規格（State Restoration）一括適用スクリプト
ガイドライン docs/guideline.md 第7.3項準拠
"""
import os, sys

TARGET_APPS = [
    '1_Master_Mix_Studio.html',
    '2_Thermal_Cycler_Simulator.html',
    '3_Virtual_PCR_RFLP.html',
    '4_Sanger_Trace_Editor.html',
    '5_DNA_Alignment_Studio.html',
    '6_Alignment_Print_Studio.html',
    '7_Virtual_BLAST_Explorer.html',
    '8_Phylogenetic_Tree_Builder.html',
    '9_Morphometrics_Studio.html',
    '10_integrative_taxonomy_studio.html',
    '11_Statistical_Genetics_Lab.html',
    '12_Central_Dogma_Simulator.html',
    '13_Protein_Structure_Explorer.html',
    'lab_packs.html'
]

DASHBOARD_FILE = 'index.html'

APP_RECORDING_SNIPPET = """
    // 最終アクセスアプリの記憶（State Restoration）
    try {
      localStorage.setItem('bio_suite_last_app', window.location.pathname);
    } catch (e) {
      console.warn('State restoration unavailable:', e);
    }
"""

DASHBOARD_ROUTING_SNIPPET = """  <!-- PWA起動時ルーティング（State Restoration - ガイドライン第7.3項） -->
  <script>
    (function() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('reset') === 'true' || urlParams.get('from') === 'nav') {
          localStorage.removeItem('bio_suite_last_app');
          return;
        }
        // 同一サイト内からの内部ナビゲーション（リンク・メニュー遷移）時はダッシュボードを表示
        if (document.referrer && (document.referrer.includes(window.location.host) || document.referrer.includes(window.location.hostname))) {
          localStorage.removeItem('bio_suite_last_app');
          return;
        }
        const lastApp = localStorage.getItem('bio_suite_last_app');
        if (lastApp && lastApp !== window.location.pathname && (lastApp.endsWith('.html') || lastApp.includes('.html')) && !lastApp.endsWith('index.html')) {
          window.location.replace(lastApp);
        }
      } catch (e) {
        console.warn('State routing unavailable:', e);
      }
    })();
  </script>"""

def patch_app_file(filepath):
    print(f"[*] Processing App: {filepath}...")
    if not os.path.exists(filepath):
        print(f"  [!] Warning: {filepath} not found. Skipping.")
        return False

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if "bio_suite_last_app" in content:
        print(f"  [-] Already contains State Restoration snippet. Skipping.")
        return True

    original_content = content

    target_marker = "<!-- Firebase 認証"
    if target_marker in content:
        parts = content.split(target_marker, 1)
        last_script_close = parts[0].rfind("</script>")
        if last_script_close != -1:
            content = parts[0][:last_script_close] + APP_RECORDING_SNIPPET + parts[0][last_script_close:] + target_marker + parts[1]
        else:
            content = parts[0] + "<script>\n" + APP_RECORDING_SNIPPET + "\n</script>\n\n" + target_marker + parts[1]
    else:
        # フォールバック: </body> の直前に挿入
        last_body_close = content.rfind("</body>")
        if last_body_close != -1:
            content = content[:last_body_close] + f"<script>\n{APP_RECORDING_SNIPPET}\n</script>\n" + content[last_body_close:]

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  [✓] Successfully updated {filepath}")
    else:
        print(f"  [-] No changes applied to {filepath}")
    return True

def patch_dashboard_file(filepath):
    print(f"[*] Processing Dashboard: {filepath}...")
    if not os.path.exists(filepath):
        print(f"  [!] Warning: {filepath} not found. Skipping.")
        return False

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if "bio_suite_last_app" in content:
        print(f"  [-] Already contains State Restoration snippet. Skipping.")
        return True

    original_content = content

    # <head> 内の </head> 直前に挿入
    if "</head>" in content:
        content = content.replace("</head>", DASHBOARD_ROUTING_SNIPPET + "</head>", 1)
    else:
        # フォールバック: <body> 直後
        content = content.replace("<body>", "<body>\n" + DASHBOARD_ROUTING_SNIPPET, 1)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  [✓] Successfully updated {filepath}")
    else:
        print(f"  [-] No changes applied to {filepath}")
    return True

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(base_dir)
    print(f"=== Bio-Edu Suite State Restoration Batch Sync ===\n")

    # 1. ダッシュボードの更新
    dashboard_path = os.path.join(base_dir, DASHBOARD_FILE)
    dash_ok = patch_dashboard_file(dashboard_path)

    # 2. 各アプリの更新
    app_count = 0
    for app in TARGET_APPS:
        app_path = os.path.join(base_dir, app)
        if patch_app_file(app_path):
            app_count += 1

    print(f"\n=================================================")
    print(f"Sync complete. Dashboard: {'OK' if dash_ok else 'FAILED'}, Apps: {app_count}/{len(TARGET_APPS)} processed successfully.")

if __name__ == '__main__':
    main()
