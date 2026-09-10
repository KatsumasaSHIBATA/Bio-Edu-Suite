import re

with open('1_Master_Mix_Studio.html', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'<div class="modal-overlay" id="accountModal">[\s\S]*?</div>\n</div>\n*(?=(?:<!--.*?-->\n)*<div id="toast")'
# または
pattern2 = r'<div class="modal-overlay" id="accountModal">[\s\S]*?(?=\n*(?:<!--.*?-->\n*)?<div id="toast")'

match = re.search(pattern2, content)
if match:
    print("Found! Length:", len(match.group(0)))
else:
    print("Not found")
