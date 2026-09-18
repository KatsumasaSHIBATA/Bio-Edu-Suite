import os
import re

def audit_files():
    workspace_dir = '.'
    html_files = []
    
    for root, dirs, files in os.walk(workspace_dir):
        # Exclude common directories
        if '.git' in root or 'node_modules' in root or 'venv' in root:
            continue
        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))
                
    results = []
    
    for file_path in html_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
                # Check for script import
                has_js_import = re.search(r'src=["\'].*?session_workspace\.js["\']', content) is not None
                
                # Check for inline implementation
                has_session_storage = 'sessionStorage' in content
                has_events = 'visibilitychange' in content or 'pagehide' in content
                
                passed = has_js_import or (has_session_storage and has_events)
                
                results.append((file_path, passed))
        except Exception as e:
            results.append((file_path, f"ERROR: {e}"))
            
    print(f"{'File':<50} | {'Status':<10}")
    print("-" * 65)
    for file_path, passed in sorted(results):
        if isinstance(passed, bool):
            status = "PASS" if passed else "FAIL"
        else:
            status = passed
        print(f"{file_path:<50} | {status:<10}")

if __name__ == '__main__':
    audit_files()
