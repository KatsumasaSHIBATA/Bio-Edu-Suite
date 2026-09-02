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
/* 左パネル幅の死守（2カラムレイアウト維持・潰れ防止） */
.main-content > .card:first-child, .left-panel, .pipeline-panel, .config-pane {{
    flex: 0 0 340px !important;
    min-width: 340px !important;
    max-width: 400px !important;
}}

.main-content > .card:last-child, .right-panel, .visualizer-panel, .result-pane {{
    flex: 1 1 500px !important;
    min-width: 450px !important;
}}

/* アプリ⑨ UI重なり・浮遊バグ解消および自然なブロックフロー化 */
.main-content > .card:first-child .card-body,
#route-a-controls, 
#route-c-controls {{
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    position: relative !important;
}}

#route-a-controls > *, 
#route-c-controls > *,
.algo-selector,
#active-sample-info {{
    position: relative !important;
    float: none !important;
    clear: both !important;
    width: 100% !important;
    box-sizing: border-box !important;
    height: auto !important;
}}

.algo-selector {{
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 5px !important;
}}

.algo-selector label {{
    position: relative !important;
    min-height: 38px !important;
}}

#route-a-controls .drop-zone, 
#route-c-controls .drop-zone {{
    max-width: 100% !important;
    position: relative !important;
}}

#chain-code-input {{
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    position: relative !important;
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


