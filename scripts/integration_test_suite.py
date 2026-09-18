import os
import re
import sys

def check_html_file(filepath):
    results = {}
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return None
    
    # ① 必須の外箱テンプレート
    has_sidebar = 'class="sidebar"' in content
    has_header = 'class="header"' in content or 'class="header-container"' in content or 'id="main-header"' in content
    has_confirm_modal = 'id="confirmModal"' in content
    has_account_modal = 'id="accountModal"' in content
    
    results['template'] = has_sidebar and has_header and has_confirm_modal and has_account_modal
    
    # ② 認証・同期モジュール or セッション永続化
    has_auth_sync = 'auth_sync.js' in content
    has_session = 'session_workspace.js' in content
    results['auth_session'] = has_auth_sync or has_session
    
    # ③ タイトルタグおよびフッターのバージョン表記
    has_title = '<title>' in content
    has_version = False
    footer_block = re.search(r'<div class="footer".*?</div>', content, re.IGNORECASE | re.DOTALL)
    if footer_block and re.search(r'v\d+\.\d+', footer_block.group(0)):
        has_version = True
    else:
        # footerタグ自体を検索
        footer_block = re.search(r'<footer.*?</footer>', content, re.IGNORECASE | re.DOTALL)
        if footer_block and re.search(r'v\d+\.\d+', footer_block.group(0)):
            has_version = True
            
    results['title_footer'] = has_title and has_version

    # ④ リンク切れ (単純な href="xxx.html")
    hrefs = re.findall(r'href="([^"]+)"', content)
    broken_links = []
    base_dir = os.path.dirname(os.path.abspath(filepath))
    
    for href in hrefs:
        # スキップするもの
        if (href.startswith('http') or href.startswith('#') or href.startswith('javascript:') or 
            href.startswith('data:') or href.startswith('mailto:') or href.startswith('tel:')):
            continue
        
        # 相対パス。クエリパラメータやフラグメントを外す
        file_path = href.split('?')[0].split('#')[0]
        if not file_path:
            continue
        
        target_path = os.path.normpath(os.path.join(base_dir, file_path))
        if not os.path.exists(target_path):
            broken_links.append(href)
            
    results['broken_links'] = broken_links
    
    return results

def main():
    target_files = [
        '1_Master_Mix_Studio.html',
        '2_Thermal_Cycler_Simulator.html',
        '3_Virtual_PCR_RFLP.html',
        '4_Sanger_Trace_Editor.html',
        '5_DNA_Alignment_Studio.html',
        '6_Alignment_Print_Studio.html',
        '7_Virtual_BLAST_Explorer.html',
        '8_Phylogenetic_Tree_Builder.html',
        '9_Morphometrics_Studio.html',
        '10_integrative_taxonomy_studio.html',
        '11_Comparative_Variant_Analyzer.html',
        '12_Statistical_Genetics_Lab.html',
        '13_Central_Dogma_Simulator.html',
        '14_Protein_Structure_Explorer.html',
        'index.html',
        'lab_packs.html',
        'Human_Evolution_Lab.html',
        'Morphological_Evolution_Lab.html'
    ]
    
    html_files = [f for f in os.listdir('.') if f.endswith('.html') and os.path.isfile(f)]
    targets = [f for f in target_files if f in html_files]
    
    all_passed = True
    print("========================================")
    print(" Integration Test Suite (Static Audit)")
    print("========================================")
    
    for f in targets:
        res = check_html_file(f)
        if not res:
            continue
            
        status_template = "PASS" if res['template'] else "FAIL"
        status_auth = "PASS" if res['auth_session'] else "FAIL"
        status_title = "PASS" if res['title_footer'] else "FAIL"
        status_links = "PASS" if len(res['broken_links']) == 0 else "FAIL"
        
        is_pass = res['template'] and res['auth_session'] and res['title_footer'] and len(res['broken_links']) == 0
        if not is_pass:
            all_passed = False
            
        print(f"[{'PASS' if is_pass else 'FAIL'}] {f}")
        
        if not res['template']:
            print(f"  - Template: {status_template} (sidebar, header, confirmModal, accountModal required)")
        if not res['auth_session']:
            print(f"  - Auth/Session: {status_auth} (auth_sync.js or session_workspace.js required)")
        if not res['title_footer']:
            print(f"  - Title/Footer: {status_title} (<title> and footer with vXX.X required)")
        if len(res['broken_links']) > 0:
            print(f"  - Links: {status_links}")
            print(f"    -> Broken Links: {', '.join(res['broken_links'])}")
            
    print("========================================")
    if all_passed:
        print("ALL TESTS PASSED")
        sys.exit(0)
    else:
        print("SOME TESTS FAILED")
        sys.exit(1)

if __name__ == '__main__':
    main()
