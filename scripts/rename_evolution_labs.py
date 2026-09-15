import os
import subprocess

# --- 設定 ---
# ファイル名のリネーム定義
RENAME_MAP = {
    "lab_packs_evolution.html": "Morphological_Evolution_Lab.html",
    "Human_Evolution_Digital_Lab.html": "Human_Evolution_Lab.html"
}

# HTMLの<title>タグ内の文字列置換定義
TITLE_REPLACE_MAP = {
    "Morphological Evolution Digital Lab | Bio-Edu Suite": "Morphological Evolution Lab | Bio-Edu Suite",
    "Human Evolution Digital Lab | Bio-Edu Suite": "Human Evolution Lab | Bio-Edu Suite"
}

# --- 関数 ---

def safe_git_rename(src, dst):
    """
    ファイルが存在する場合に `git mv` を実行する。冪等性を担保。
    `git mv` 失敗時は `os.rename` にフォールバックする。
    """
    if os.path.exists(src) and not os.path.exists(dst):
        try:
            subprocess.run(["git", "mv", src, dst], check=True, capture_output=True, text=True)
            print(f"✅ Git mv successful: {src} -> {dst}")
        except subprocess.CalledProcessError as e:
            print(f"⚠️ Git mv failed (Exit Code: {e.returncode}): {e.stderr.strip()}")
            print(f"   Fallback to os.rename...")
            try:
                os.rename(src, dst)
                print(f"✅ os.rename successful: {src} -> {dst}")
            except OSError as os_err:
                print(f"❌ os.rename also failed: {os_err}")
        except Exception as e:
            print(f"❌ An unexpected error occurred during rename: {e}")

    elif os.path.exists(dst):
        print(f"☑️ Already renamed: {dst} exists.")
    else:
        print(f"ℹ️ Source file not found, skipping rename: {src}")


def update_file_content(filepath):
    """
    単一のファイルを読み込み、リンクとタイトルを置換して書き込む。
    """
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
    except IOError as e:
        print(f"❌ Error reading file {filepath}: {e}")
        return

    original_content = content

    # 1. リンク・ファイル参照の置換
    for old_name, new_name in RENAME_MAP.items():
        content = content.replace(old_name, new_name)

    # 2. タイトルの置換
    for old_title, new_title in TITLE_REPLACE_MAP.items():
        content = content.replace(old_title, new_title)

    if content != original_content:
        try:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"✅ Updated references in: {filepath}")
        except IOError as e:
            print(f"❌ Error writing to file {filepath}: {e}")
    else:
        # print(f"ℹ️ No changes needed for: {filepath}") # Verbose
        pass


# --- メイン処理 ---

if __name__ == "__main__":
    print("--- Step 1: Renaming files ---")
    for src, dst in RENAME_MAP.items():
        safe_git_rename(src, dst)

    print("\n--- Step 2: Updating all HTML file references ---")
    
    # プロジェクトルートの全HTMLファイルを取得
    try:
        all_html_files = [f for f in os.listdir(".") if f.endswith(".html")]
        
        # リネーム後のファイルもリストに含める（リネーム前のファイルは除外）
        current_html_files = set(all_html_files)
        current_html_files.difference_update(RENAME_MAP.keys())
        current_html_files.update(RENAME_MAP.values())

    except FileNotFoundError:
        print("❌ Error: Could not list files in the current directory. Aborting.")
        exit(1)

    for filename in sorted(list(current_html_files)):
        if os.path.exists(filename):
             update_file_content(filename)

    print("\n✅ All tasks completed successfully.")
