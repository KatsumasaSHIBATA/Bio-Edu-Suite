import os
import glob
import re

CSS_CONTENT = """/* --- UNIFIED DISABLED BUTTON MASTER CSS START --- */
/* 操作不可ボタンの完全無効化規格（ガイドライン第11項②） */
button:disabled,
.btn:disabled,
input[type="button"]:disabled,
input[type="submit"]:disabled,
.sidebar-action-btn:disabled {
    opacity: 0.5 !important;
    cursor: not-allowed !important;
    filter: grayscale(50%) !important;
    box-shadow: none !important;
    transform: none !important;
    pointer-events: auto !important;
}
/* ホバー・アクティブ時の意図せぬ変色・沈み込みの物理遮断 */
button:disabled:hover,
.btn:disabled:hover,
input[type="button"]:disabled:hover,
input[type="submit"]:disabled:hover,
button:disabled:active,
.btn:disabled:active,
input[type="button"]:disabled:active,
input[type="submit"]:disabled:active {
    opacity: 0.5 !important;
    cursor: not-allowed !important;
    filter: grayscale(50%) !important;
    box-shadow: none !important;
    transform: none !important;
}
/* ステータス連動型ボタンのマスター規格（ガイドライン第9項②） */
.btn-dynamic:disabled {
    background-color: var(--card-bg) !important;
    color: var(--text-muted) !important;
    border: 1px solid var(--border-color) !important;
    opacity: 0.6 !important;
    cursor: not-allowed !important;
    box-shadow: none !important;
    transform: none !important;
}
.btn-dynamic:not(:disabled) {
    background-color: var(--success);
    color: white;
    border-color: var(--success);
    opacity: 1;
    cursor: pointer;
}
.btn-dynamic:not(:disabled):hover {
    filter: brightness(1.05);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
/* --- UNIFIED DISABLED BUTTON MASTER CSS END --- */"""

def unify_css(html_path):
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # パターン: 既存のマーカーブロックがある場合
    pattern = re.compile(r'/\* --- UNIFIED DISABLED BUTTON MASTER CSS START --- \*/.*?/\* --- UNIFIED DISABLED BUTTON MASTER CSS END --- \*/', re.DOTALL)
    
    if pattern.search(content):
        # 置換
        new_content = pattern.sub(CSS_CONTENT, content)
    else:
        # 挿入 (最後の </style> の直前)
        parts = content.rsplit('</style>', 1)
        if len(parts) == 2:
            new_content = parts[0] + CSS_CONTENT + "\n</style>" + parts[1]
        else:
            print(f"Skipping {html_path}: No </style> found.")
            return False

    if content != new_content:
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {html_path}")
        return True
    return False

def main():
    html_files = glob.glob('*.html')
    updated_count = 0
    for f in html_files:
        if unify_css(f):
            updated_count += 1
    print(f"Total updated files: {updated_count}")

if __name__ == '__main__':
    main()
