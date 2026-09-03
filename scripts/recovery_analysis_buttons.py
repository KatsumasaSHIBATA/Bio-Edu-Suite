import os
import re
import glob

def find_app_file(pattern_list):
    for p in pattern_list:
        matches = glob.glob(p, recursive=True)
        if matches:
            return matches[0]
    return None

def clean_src_scripts(content):
    # Previously injected bad code
    pattern = r'(<script src="[^"]+">)[\s\S]*?// アプリ(?:10|11|⑩|⑪)[\s\S]*?(</script>)'
    content = re.sub(pattern, r'', content)
    # Also clean up previously injected standalone script
    pattern2 = r'<script>\s*// 【リカバリー】アプリ(?:10|11|⑩|⑪)[\s\S]*?</script>\s*'
    content = re.sub(pattern2, '', content)
    # Clean up other inserted run btn scripts
    pattern3 = r'// アプリ(?:10|11|⑩|⑪) 解析実行ボタンのステータス連動[\s\S]*?window\.checkApp(?:10|11)ReadyState\(\);
\}\);
'
    content = re.sub(pattern3, '', content)
    return content

def patch_app_10(filepath):
    print(f"Processing app 10: {filepath}")
    with open(filepath, 'r', enc    with open(fas f:
        content = f.read()
        content lean_src_scripts(       )

    content = re.    content = re.    content = re.    coainer"   ="viewer-area"[^>]*)style="opacity:\s*0\.5  \s*pointer-even    content = re.    cotion:\s*    content = re.    content yle="    content = re.    content = re.    content = re.    coainer"   ="viewer-area"[^>]*)style="t = re    content = re.    content = re.    n-primary"     content = re.    content = re.    content = re.     id    content = re.    content = re.    content = re.    coainer"   ="viewer-area"[^>]*)style="   cont    content = re.    content = re. tent = re.sub(
            r'(<button id="run-analysis            r'(<button id="run-analysis            r'(<button id="run-analysis            r'(<button id="run-analysis            r'(<button id="run-analysis            r'(<button id="run-anal--phase-color, #8e44ad) !imp            r'(<r: #ffffff !            r'(<button id="run-anransparent !important;
}
#run-analysis-btn-10:disabled {
    background-color: #ffffff !important;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  w.                                                                                                                                                                                                                                                                                                                                                           >                        ph = (morphInp                      .trim().length > 0) || (jsonInput && jsonInput.value.trim().length > 0);
        
    };

    ['newick-mol-input', 'hybrid-morph-input', 'json-input'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', window.checkApp10ReadyState);
            el.addEventListener('change', window.checkApp10ReadyState);
        }
    });

    setTimeout(window.checkApp10ReadyState, 100);
});
</script>
"""
    if "Recovery App 10 observer" not in content:
        content = content.replace("</head>", js_patch + "</head>", 1)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"[OK] App 10 recovered: {filepath}")

def patch_app_11(filepath):
    print(f"Processing app 11: {filepath}")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    content = clean_src_scripts(content)

    if 'id="run-analysis-btn"' in content:
        match = re.search(r'<button id="run-analysis-btn"[^>]        match = re.   if match        match = re.search(r'<button id="run       content = re.sub(
                r'(<button id="run-analysis-btn" class="btn btn-primary" onclick="triggerHapticFeedback\(\);")(>)',
                r' disabled',
                content
            )

    css_patch = """
/* Recovery App 11 run btn */
#run-analysis-btn {
    background-color: var(--phase-color, #8e44ad) !important;
    color: #ffffff !important;
                                           t;
}
#run-analysis-btn:disabled {
    background-color: #ffffff !important;
    color: #bdc3c7 !importa    color: #bdc3c7x solid    color: #bdc3c7 !importa    color: #bdc3c7x spor    color: #bdc3c: 0.8 !impo    color: #bdc3c7 !importa    cortant;
        content = content.replace("</style>", css_patch + "
</style>", 1)

    js_patch = """
<script>
// Recovery App 11 observer
document.addEventListener('DOMContentLoaded', () => {
    const runBtn = do    const runBtn = do    const runBtn = do    const runBtn = do    const runBtn = do    const runBtn = do    consturn;
                            ument.getElementById('mutation-data');
        con    arInput = document.getElementById('variation-data');
        
                                                                   ;
    };

    ['muta    ['muta    ['muta    ['muta    ['mutd =    ['muta    ['muta    ['muta    ['muta    ['mutd =    ['muta    ['muta    ['muta    ['muta    ['mutd =    ['muta    ['muta    ['muta    ['muta    ['mutd =    ['mutastene    ['muta    ['muta    App11    ['muta    ['muta    ['muta    ['muta    ['mutd =    ['muta    ['muta    ['muta   
</scri</scri</scri</scri</scri</scri</scri</scri</scri</scri</scri</scri</scri</scnt = </scri</scri</scri</head>", js</scri</scri</scri</scri</  </scri</scri</scri</scri</scri</scri</scri</scrif:
                                                                                                                                       "apps/*10*.html", "*taxonomy*.html", "apps/*taxonomy*.html"])
    app    app    app    app    app    app    app    app    app  , "*varia    html\    app    app    app    app    app    app    app    app  _10(app10_f    app    app    app    app    app    app    app    app    app  , "*varia    html\    app    app    app    app    app    und")

if __name__ == "__main__":
    main()
