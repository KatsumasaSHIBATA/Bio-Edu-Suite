import os
import re
import glob

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return False

    if 'window.isResetting = true;' in content and 'Storage.prototype.setItem = function() {};' in content:
        return False

    pattern = re.compile(r'([ \t]*)(localStorage\.clear\(\);[\s]*sessionStorage\.clear\(\);)')
    
    def replacer(match):
        indent = match.group(1)
        original = match.group(2)
        return f'{indent}window.isResetting = true;\n{indent}Storage.prototype.setItem = function() {{}};\n{indent}{original}'

    new_content, count = pattern.subn(replacer, content)

    if count == 0:
        pattern2 = re.compile(r'([ \t]*)(sessionStorage\.clear\(\);[\s]*localStorage\.clear\(\);)')
        new_content, count = pattern2.subn(replacer, content)

    if count > 0 and new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {filepath}")
        return True
        
    return False

def main():
    target_files = []
    target_files.extend(glob.glob('*.html'))
    target_files.extend(glob.glob('js/*.js'))
    
    updated_count = 0
    for filepath in target_files:
        if process_file(filepath):
            updated_count += 1
            
    print(f"Total updated files: {updated_count}")

if __name__ == '__main__':
    main()
