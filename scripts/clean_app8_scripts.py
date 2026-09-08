#!/usr/bin/env python3
import sys

def main():
    filepath = '8_Phylogenetic_Tree_Builder.html'
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # 検証: 行1977, 1978, 4893, 4894
    assert '<script src="lib/phylo_ui.js"></script>' in lines[1976], f"Unexpected line 1977: {lines[1976]}"
    assert lines[1977].strip() == '<script>', f"Unexpected line 1978: {lines[1977]}"
    assert lines[4892].strip() == '</script>', f"Unexpected line 4893: {lines[4892]}"
    assert '<!-- カスタム確認ダイアログ（データ初期化用等） -->' in lines[4893], f"Unexpected line 4894: {lines[4893]}"

    # 検証: 行5041, 5248, 5250
    assert '<!-- 入力データ・系統樹ステート完全一時保存（sessionStorage） v35.2 -->' in lines[5040], f"Unexpected line 5041: {lines[5040]}"
    assert lines[5247].strip() == '</script>', f"Unexpected line 5248: {lines[5247]}"
    assert '<!-- Firebase 認証・クラウド同期（ガイドライン第7項） -->' in lines[5249], f"Unexpected line 5250: {lines[5249]}"

    # 1. 1978行目(index 1977)〜4893行目(index 4892)を削除
    # 2. 5039行目(index 5038)の </script> の直前に state restoration コードを挿入
    # 3. 5041行目〜5248行目を削除

    new_lines = []
    
    # 0 〜 1976 (Line 1 〜 1977)
    new_lines.extend(lines[:1977])
    new_lines.append('\n')

    # 4893 〜 5038 (Line 4894 〜 5039の手前)
    # lines[5038] is '</script>\n'
    for i in range(4893, 5038):
        new_lines.append(lines[i])

    state_restoration = """
    // 最終アクセスアプリの記憶（State Restoration）
    try {
      localStorage.setItem('bio_suite_last_app', window.location.pathname);
    } catch (e) {
      console.warn('State restoration unavailable:', e);
    }
"""
    new_lines.append(state_restoration)
    new_lines.append(lines[5038]) # '</script>\n'
    new_lines.append('\n')

    # 5249 〜 末尾 (Line 5250 〜 末尾)
    new_lines.extend(lines[5249:])

    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

    print(f"Successfully cleaned up {filepath}.")
    print(f"Original lines: {len(lines)}, New lines: {len(new_lines)}")

if __name__ == '__main__':
    main()
