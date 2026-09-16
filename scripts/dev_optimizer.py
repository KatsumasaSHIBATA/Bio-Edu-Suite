import argparse
import sys
import os
import re

def create_skeleton(file_path):
    """
    機能A: JS/HTMLファイルの骨格テキスト抽出
    関数の中身を ... に置き換え。
    簡易的な正規表現と波括弧カウントアプローチを使用。
    """
    if not os.path.exists(file_path):
        print(f"Error: File not found: {file_path}")
        return

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.read().split('\n')
    except Exception as e:
        print(f"Error reading file: {e}")
        return

    skeleton_lines = []
    brace_count = 0
    in_function_body = False

    for line in lines:
        stripped = line.strip()
        
        # HTMLやJSのコメント行はそのまま出力
        if stripped.startswith('//') or stripped.startswith('<!--') or stripped.startswith('/*') or stripped.startswith('*') or stripped.endswith('*/'):
            skeleton_lines.append(line)
            continue
            
        open_braces = line.count('{')
        close_braces = line.count('}')
        
        # 関数やクラス、メソッド宣言っぽい行
        is_declaration = re.search(r'\b(function|class|const|let|var)\b.*\{|=>\s*\{|\)\s*\{', line)
        
        if is_declaration and brace_count == 0:
            skeleton_lines.append(line)
            brace_count += open_braces - close_braces
            if brace_count > 0:
                in_function_body = True
                skeleton_lines.append("  // ... ")
        elif in_function_body:
            brace_count += open_braces - close_braces
            if brace_count <= 0:
                in_function_body = False
                skeleton_lines.append(line)
        else:
            skeleton_lines.append(line)

    print("\n".join(skeleton_lines))


def truncate_file(file_path):
    """
    機能B: 先頭5行と末尾5行を残し、中間を切り詰める
    """
    if not os.path.exists(file_path):
        print(f"Error: File not found: {file_path}")
        return

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.read().splitlines()
    except Exception as e:
        print(f"Error reading file: {e}")
        return

    total_lines = len(lines)
    if total_lines <= 10:
        print("\n".join(lines))
    else:
        first_5 = lines[:5]
        last_5 = lines[-5:]
        
        for line in first_5:
            print(line)
        
        print(f"\n... [中略: 総行数 {total_lines}] ...\n")
        
        for line in last_5:
            print(line)

def clean_log(file_path):
    """
    機能C: ログからエラーの核心部を抽出
    """
    if not os.path.exists(file_path):
        print(f"Error: File not found: {file_path}")
        return

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.read().splitlines()
    except Exception as e:
        print(f"Error reading file: {e}")
        return

    # エラーメッセージ、ファイル名、行番号にマッチする正規表現
    error_pattern = re.compile(r'(Error|Exception|TypeError|ReferenceError|SyntaxError):?\s*(.*)', re.IGNORECASE)
    file_line_pattern = re.compile(r'(at\s+.*|in\s+.*)?\b([\w\.\-/]+):(\d+):?(\d+)?')
    
    extracted = []
    
    for line in lines:
        err_match = error_pattern.search(line)
        if err_match:
            extracted.append(line.strip())
            continue
            
        loc_match = file_line_pattern.search(line)
        if loc_match:
            extracted.append(line.strip())

    if not extracted:
        print("No specific error patterns found.")
    else:
        print("\n".join(extracted))

def main():
    parser = argparse.ArgumentParser(description="Bio-Edu Suite Developer Optimizer CLI - トークン極限圧縮＆ハルシネーション物理防止ツール")
    parser.add_argument('--skeleton', metavar='FILE', help="JS/HTMLファイルを解析し、関数の中身を省略して骨格テキストを出力する")
    parser.add_argument('--truncate', metavar='FILE', help="巨大なファイルの先頭5行と末尾5行を残して切り詰める")
    parser.add_argument('--clean-log', metavar='FILE', help="ログからエラーの核心部（Error名、ファイル、行番号）を抽出する")
    
    args = parser.parse_args()
    
    if args.skeleton:
        create_skeleton(args.skeleton)
    elif args.truncate:
        truncate_file(args.truncate)
    elif args.clean_log:
        clean_log(args.clean_log)
    else:
        parser.print_help()

if __name__ == '__main__':
    main()
