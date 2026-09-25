import glob

html_files = glob.glob('*.html')
count = 0

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 最初の </html> を探す
    end_idx = content.find('</html>')
    
    if end_idx != -1:
        # 最初の </html> までの正しい内容を抽出 (+7 は </html> の文字数)
        clean_content = content[:end_idx + 7]
        
        # 不要なゴミ（多重化されたHTML）が存在する場合は上書きして削除
        if len(clean_content) < len(content.strip()):
            with open(filepath, 'w', encoding='utf-8') as f:
                # 念のため末尾に改行を付与してクリーンに保存
                f.write(clean_content + '\n')
            print(f"Cleaned up duplicated HTML in: {filepath}")
            count += 1

print(f"完了しました。合計 {count} 個のファイルから多重化された不正なHTMLブロックを削除しました。")
