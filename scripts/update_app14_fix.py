import re
import sys

file_path = 'app14_comparative_variant_analyzer.html'
try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
except Exception as e:
    print(e)
    sys.exit(1)

# 1. Remove D3.js
content = re.sub(r'<script src="https://d3js\.org/d3\.v7\.min\.js"></script>\n?', '', content)

# 2. Update Nav Menu Phase 4
with open('tmp_nav.txt', 'r', encoding='utf-8') as f:
    new_nav = f.read()

content = re.sub(
    r'<div class="nav-header p4"><span class="nav-header-text">Phase 4.*?</a>',
    new_nav,
    content,
    flags=re.DOTALL
)

# 3. Main content replacement
with open('tmp_html.txt', 'r', encoding='utf-8') as f:
    main_content = f.read()

pattern_content = r'<!-- 差し替え用 HTML コンテンツ -->.*?<!-- 差し替え完了 -->'
if re.search(pattern_content, content, re.DOTALL):
    content = re.sub(pattern_content, main_content, content, flags=re.DOTALL)
else:
    print("WARNING: Could not find HTML content block to replace.")

# 4. update confirmDataReset
with opwn('tmp_script.txt', 'r', encoding='utf-8') as f:
    new_func = f.read()

old_func = r'    // --- データ初期化（ネイティブ confirm\(\) は使用禁止） ---\n    function conold_func = r' (\) \{.*?\n    \}'
if re.search(old_func, content, re.DOTALL):
    content = re.sub(old_func, new_func, content, flags=re.DOTALL)
else:
    print(    print( onfirmDataReset not found.")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Success!")
