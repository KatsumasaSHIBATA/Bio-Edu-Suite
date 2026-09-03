import re
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'function\s+openFeedbackForm\s*\([^)]*\)\s*\{[\s\S]*?(?=\n(?:async\s+)?function|\n</script>)'
m = re.search(pattern, content)
if m:
    print(m.group(0))
else:
    print("Not found")
