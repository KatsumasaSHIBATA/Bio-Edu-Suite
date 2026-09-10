import os
import glob
import re

def main():
    html_files = glob.glob('*.html')
    
    svg_pattern = re.compile(r'<svg\s+id="accountUserIcon".*?</svg>', re.DOTALL)
    new_svg = '''<svg id="accountUserIcon" class="account-user-icon" viewBox="0 0 24 24" style="width: 14px; height: 14px; flex-shrink: 0;">
  <circle cx="12" cy="12" r="7" fill="currentColor"></circle>
</svg>'''

    text_pattern = re.compile(r'(<span[^>]*id="accountStatusText"[^>]*>)[^<]*(</span>)', re.DOTALL)

    for html_file in html_files:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()

        new_content = content
        
        # 1. Replace SVG
        new_content = svg_pattern.sub(new_svg, new_content)
        
        # 2. Replace text content inside accountStatusText
        new_content = text_pattern.sub(r'\g<1>未接続（ローカル）\g<2>', new_content)
        
        # 3. If lab_packs.html, replace modal-overlay background
        if html_file == 'lab_packs.html':
            new_content = new_content.replace('background: rgba(44, 62, 80, 0.85);', 'background: rgba(0, 0, 0, 0.6);')

        if content != new_content:
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {html_file}")

if __name__ == '__main__':
    main()
