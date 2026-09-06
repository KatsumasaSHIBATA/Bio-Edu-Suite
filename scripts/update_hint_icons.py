import os
import re

TARGET_FILES = [
    "8_Phylogenetic_Tree_Builder.html",
    "9_Morphometrics_Studio.html",
    "10_integrative_taxonomy_studio.html",
    "11_Comparative_Variant_Analyzer.html",
    "12_Statistical_Genetics_Lab.html"
]

# 置換対象: 「考察のヒント：」の直前にある電球アイコン(Lightbulb)のSVG
PATTERN = re.compile(
    r'<svg class="btn-icon svg-hint" viewBox="0 0 24 24"[^>]*>.*?<path d="M9 18h6"/>.*?</svg>(\s*考察のヒント：)',
    re.DOTALL
)

# 置換後: 開いた本(Book Open)のSVG (知的な primary カラー)
REPLACEMENT = r'<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; color: var(--primary);"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>\1'

def main():
    for filename in TARGET_FILES:
        filepath = os.path.join(os.getcwd(), filename)
        if not os.path.exists(filepath):
            print(f"File not found: {filename}")
            continue

        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        if PATTERN.search(content):
            new_content = PATTERN.sub(REPLACEMENT, content)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"✅ Updated: {filename}")
        else:
            print(f"ℹ️ Already updated or pattern not found: {filename}")

if __name__ == "__main__":
    main()
