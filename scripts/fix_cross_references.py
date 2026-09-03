# -*- coding: utf-8 -*-
import os
import glob

# 置換対象ファイルの収集（HTMLおよびJS）
target_files = glob.glob('*.html') + glob.glob('js/*.js')

# 置換マッピング（必ず「後ろの番号から順に」定義する）
replace_pairs = [
    # 1. 旧13番（Protein Structure Explorer）の繰り下げ -> 14番へ
    ('⑬ Protein Structure Explorer', '⑭ Protein Structure Explorer'),
    ('13_Protein_Structure_Explorer.html', '14_Protein_Structure_Explorer.html'),
    ('App_13', 'App_14'),
    ('アプリ⑬', 'アプリ⑭'),
    ('アプリ13', 'アプリ14'),

    # 2. 旧12番（Central Dogma Simulator）の繰り下げ -> 13番へ
    ('⑫ Central Dogma Simulator', '⑬ Central Dogma Simulator'),
    ('12_Central_Dogma_Simulator.html', '13_Central_Dogma_Simulator.html'),
    ('App_12', 'App_13'),
    ('アプリ⑫', 'アプリ⑬'),
    ('アプリ12', 'アプリ13'),

    # 3. 旧11番（Statistical Genetics Lab）の繰り下げ -> 12番へ
    ('⑪ Statistical Genetics Lab', '⑫ Statistical Genetics Lab'),
    ('11_Statistical_Genetics_Lab.html', '12_Statistical_Genetics_Lab.html'),
    ('App_11', 'App_12'),
    ('アプリ⑪', 'アプリ⑫'),
    ('アプリ11', 'アプリ12'),
]

for filepath in target_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    modified = False
    new_content = content

    for old_str, new_str in replace_pairs:
        if old_str in new_content:
            new_content = new_content.replace(old_str, new_str)
            modified = True

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"[REPLACED CROSS-REF] {filepath}")
    else:
        print(f"[NO CHANGE] {filepath}")
