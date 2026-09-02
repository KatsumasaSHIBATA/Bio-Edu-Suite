import os
import sys

BASE_DIR = "/Users/shibatakatsumasa/Bio-Edu-Suite"
MARKER = "/* Bio-Edu Suite iPad UI Fix v34.4 */"

FILES_TO_PATCH = {
    "2_Thermal_Cycler_Simulator.html": f"""
{MARKER}
/* テンキー・キートップ専用の文字収縮・見切れ防止パッチ */
.key-ent, [data-key="enter"], button.key:last-child, .keypad button, .key-btn, button[onclick*="'ENT'"], .hardware-panel .hw-btn {{
    min-height: auto !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    text-align: center !important;
    line-height: 1.0 !important;
    padding: 2px 0 !important;
    font-size: 11px !important;
    overflow: visible !important;
}}
""",
    "5_DNA_Alignment_Studio.html": f"""
{MARKER}
@media (max-width: 1024px) {{
    .header-container .header .header-left .mobile-hamburger {{
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-width: 44px !important;
        min-height: 44px !important;
        flex-shrink: 0 !important;
    }}
}}
""",
    "9_Morphometrics_Studio.html": f"""
{MARKER}
/* タブレット・狭小幅での1カラム縦スクロール化 */
@media (max-width: 1024px) {{
    .main-container, .workbench-container, .columns-wrapper, .main-content {{
        display: flex !important;
        flex-direction: column !important;
        width: 100% !important;
        gap: 24px !important;
    }}
    .left-panel, .pipeline-panel, .config-pane, .main-content > .card {{
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        flex: none !important;
    }}
    .right-panel, .visualizer-panel, .result-pane {{
        width: 100% !important;
        max-width: 100% !important;
        flex: none !important;
    }}
    .algo-selector {{
        grid-template-columns: 1fr !important;
    }}
}}

/* アプリ⑨ iPad表示時のUI重なり崩れ防止パッチ */
#route-a-controls, #route-c-controls {{
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
}}
#route-a-controls > div, #route-c-controls > div {{
    position: relative !important;
    float: none !important;
    clear: both !important;
    width: 100% !important;
    box-sizing: border-box !important;
}}
#route-a-controls .drop-zone, #route-c-controls .drop-zone {{
    max-width: 100% !important;
}}
#chain-code-input {{
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
}}
"""
}

def patch_file(filename, css_patch):
    filepath = os.path.join(BASE_DIR, filename)
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if MARKER in content:
        print(f"Already patched (skipping): {filename}")
        return

    # Find the last </style> tag to append the new CSS just before it
    style_end_index = content.rfind('</style>')
    if style_end_index == -1:
        print(f"Error: </style> tag not found in {filename}")
        return

    # Insert patch before the last </style>
    new_content = content[:style_end_index] + f"\n{css_patch}\n" + content[style_end_index:]

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"Successfully patched: {filename}")

if __name__ == "__main__":
    print("Starting iPad UI Fix (v34.4) patching process...")
    for filename, css_patch in FILES_TO_PATCH.items():
        patch_file(filename, css_patch)
    print("Patching process completed.")

