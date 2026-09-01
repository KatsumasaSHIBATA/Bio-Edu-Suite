#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bio-Edu Suite 第10項 ネイティブアプリライクUI/UX・端末制御規格 一括同期スクリプト
Native-like Mobile UX Standards (7大端末制御規格の一括適用)
"""

import os
import re
import shutil

TARGET_FILES = [
    'index.html',
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
CSS_SNIPPET = """    /* ===================================================================
       【第10項 CSS規格】ネイティブアプリライクUI/UX・端末制御スタイル
       =================================================================== */
    html, body {
      overscroll-behavior-x: none;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      user-select: none;
    }

    input, textarea, [contenteditable="true"] {
      -webkit-user-select: text;
      user-select: text;
    }

    /* スクロールバーのネイティブ化（極細・半透明） */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.15);
      border-radius: 3px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.3);
    }

    /* タッチ端末でのSticky Hover対策と:activeフィードバック */
    @media (hover: none) {
      button:active, .btn:active, .tab-btn:active, .control-btn:active, .sidebar-action-btn:active, .action-btn:active {
        transform: scale(0.97);
        opacity: 0.9;
      }
    }
"""

JS_SNIPPET = """    /* ===================================================================
       【第10項 JS規格】長押し・右クリックメニューの封印 (input/textarea/contenteditable除外)
       =================================================================== */
    (function() {
        document.addEventListener('contextmenu', function(e) {
            if (e.target.closest('input, textarea, [contenteditable="true"], [contenteditable=""]')) {
                return;
            }
            e.preventDefault();
        }, { passive: false });
    })();
"""

def optimize_input_tag(match):
    tag = match.group(0)
    is_self_closing = tag.endswith('/>')
    end_chars = '/>' if is_self_closing else '>'
    tag_body = tag[:-2] if is_self_closing else tag[:-1]
    tag_lower = tag.lower()
    
    excluded_types = ['type="hidden"', "type='hidden'", 'type="file"', "type='file'", 
                      'type="checkbox"', "type='checkbox'", 'type="radio"', "type='radio'", 
                      'type="range"', "type='range'"]
    if any(t in tag_lower for t in excluded_types):
        return tag
    
    # 1. inputmode 最適化
    if 'inputmode=' not in tag_lower:
        if 'type="number"' in tag_lower or "type='number'" in tag_lower:
            if 'step="1"' in tag_lower or "step='1'" in tag_lower:
                tag_body += ' inputmode="numeric"'
            else:
                tag_body += ' inputmode="decimal"'
    
    # 2. enterkeyhint 最適化
    if 'enterkeyhint=' not in tag_lower:
        search_keywords = ['search', 'ncbi', 'accession', 'pdbid', 'query', 'find']
        go_keywords = ['primer', 'pf', 'pr', 'residuelist', 'breakkeyword']
        done_keywords = ['samplename', 'sampleid', 'envcategory']
        
        if any(k in tag_lower for k in search_keywords):
            tag_body += ' enterkeyhint="search"'
        elif any(k in tag_lower for k in go_keywords):
            tag_body += ' enterkeyhint="go"'
        elif any(k in tag_lower for k in done_keywords):
            tag_body += ' enterkeyhint="done"'
            
    return tag_body + end_chars

def apply_native_ux(filepath):
    print(f"[*] Processing {filepath}...")
    if not os.path.exists(filepath):
        print(f"  [!] File not found: {filepath}")
        return False

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # 1. CSS注入（既存の第10項ブロックがあれば置換、なければ最後の </style> 直前に挿入）
    css_marker = "【第10項 CSS規格】"
    if css_marker in content:
        content = re.sub(
            r'/\*\s*={10,}\s*【第10項 CSS規格】.*?={10,}\s*\*/.*?(?=(</style>|/\* =+|$))',
            CSS_SNIPPET.strip() + "\n\n",
            content,
            flags=re.DOTALL
        )
        print("  [+] Updated CSS Section (第10項 CSS規格)")
    else:
        last_style_close = content.rfind("</style>")
        if last_style_close != -1:
            content = content[:last_style_close] + CSS_SNIPPET + content[last_style_close:]
            print("  [+] Injected CSS Section (第10項 CSS規格)")
        else:
            print("  [!] Warning: No </style> found.")

    # 2. JavaScript注入（長押し・右クリックメニューの封印）
    js_marker = "【第10項 JS規格】"
    if js_marker in content:
        print("  [-] JS Section already contains contextmenu preventDefault.")
    else:
        last_script_close = content.rfind("</script>")
        if last_script_close != -1:
            content = content[:last_script_close] + "\n" + JS_SNIPPET + "\n" + content[last_script_close:]
            print("  [+] Injected JS Section (第10項 JS規格)")
        else:
            body_close = content.rfind("</body>")
            if body_close != -1:
                content = content[:body_close] + f"<script>\n{JS_SNIPPET}\n</script>\n" + content[body_close:]
                print("  [+] Injected JS Section before </body>")

    # 3. HTML input 属性の最適化
    new_content = re.sub(r'<input\b[^>]*>', optimize_input_tag, content, flags=re.IGNORECASE)
    if new_content != content:
        print("  [+] Optimized HTML <input> tags (inputmode / enterkeyhint)")
        content = new_content

    if content != original_content:
        backup_path = filepath + '.bak'
        shutil.copy2(filepath, backup_path)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  [✓] Successfully updated {filepath}")
        return True
    else:
        print(f"  [-] No modifications needed for {filepath}")
        return True

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(base_dir)
    print("===================================================================")
    print("=== Bio-Edu Suite: Apply Native UX Standards (Section 10)       ===")
    print("===================================================================\n")
    
    updated_files = []
    for filename in TARGET_FILES:
        filepath = os.path.join(base_dir, filename)
        if apply_native_ux(filepath):
            updated_files.append(filename)

    print("\n===================================================================")
    print(f"Native UX Batch Update Completed. Processed {len(updated_files)}/{len(TARGET_FILES)} files.")
    print("===================================================================")

if __name__ == '__main__':
    main()

