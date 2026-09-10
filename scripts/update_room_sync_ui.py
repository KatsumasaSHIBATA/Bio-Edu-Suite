import os
import re
import glob

with open('/Users/shibatakatsumasa/Bio-Edu-Suite/scripts/modal.txt', 'r', encoding='utf-8') as f:
    NEW_MODAL = f.read()

with open('/Users/shibatakatsumasa/Bio-Edu-Suite/scripts/script.txt', 'r', encoding='utf-8') as f:
    NEW_SCRIPT = f.read()

def process_html_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'id="roomCodeInput"' in content:
        print(f"Skipping {file_path}")
        return
    
    modal_pattern = r'<div class="modal-overlay" id="accountModal">[\s\S]*?(?=\n*(?:<!--.*?-->\n*)?<div id="toast")'
    content = re.sub(modal_pattern, NEW_MODAL, content, count=1)
    
    script_pattern = r"import\s+\{\s*loginWithGoogle,\s*logoutUser\s*\}\s*from\s*'./auth_sync\.js';\s*window\.handleGoogleLogin\s*=\s*loginWithGoogle;\s*window\.handleLogout\s*=\s*logoutUser;"
    content = re.sub(script_pattern, NEW_SCRIPT, content, count=1)
    
    # script.jsが置換されていなくて、新しいscriptもないならそのまま（今回はすでにscriptは置換されているかもしれないが、べき等性のためにroomCodeInputがあるかどうかでスキップしている）
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Updated {file_path}")

for f in glob.glob('/Users/shibatakatsumasa/Bio-Edu-Suite/*.html'):
    process_html_file(f)

