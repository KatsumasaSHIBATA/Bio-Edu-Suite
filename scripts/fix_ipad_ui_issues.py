import os
import sys

BASE_DIR = "/Users/shibatakatsumasa/Bio-Edu-Suite"
MARKER = "/* Bio-Edu Suite iPad UI Fix v34.4 */"

FILES_TO_PATCH = {
    "2_Thermal_Cycler_Simulator.html": f"""
{MARKER}
.keypad button, .key-ent, .key-btn {{
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    line-height: 1.1;
    padding: 4px 2px;
    box-sizing: border-box;
    font-size: clamp(10px, 1.2vw, 13px);
    word-break: break-all;
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
