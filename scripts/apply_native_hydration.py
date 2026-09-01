#!/usr/bin/env python3
# -*- coding: utf-8 -*-

### 修正版 `scripts/apply_native_hydration.py`
```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bio-Edu Suite ネイティブ化必須要件：オートセーブ＆ハイドレーション仕様一括適用スクリプト
"""
import os, glob, shutil, re

TARGET_FILES = [
    'index.html',
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
    '11_Statistical_Genetics_Lab.html',
    '12_Central_Dogma_Simulator.html',
    '13_Protein_Structure_Explorer.html',
    'lab_packs.html'
]

HYDRATION_SNIPPET = """
    /* ===================================================================
       【第7項改定】ネイティブ化必須要件：オートセーブ＆ハイドレーション仕様
       Page Visibility API による瞬間ドラフト保存とステート復元
       =================================================================== */
    (function() {
        const DRAFT_KEY = 'bio_edu_draft_' + (window.location.pathname.split('/').pop() || 'index.html');

        function serializeUIState() {
            try {
                const inputs = document.querySelectorAll('input, textarea, select');
                const draft = {};
                inputs.forEach(el => {
                    if (el.id && !el.closest('#confirmModal') && !el.closest('#accountModal')) {
                        if (el.type === 'checkbox' || el.type === 'radio') {
                            draft[el.id] = el.checked;
                        } else if (el.type !== 'file' && el.type !== 'password') {
                            draft[el.id] = el.value;
                        }
                    }
                });
                sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
            } catch (e) {
                console.warn('UIステートのシリアライズに失敗しました:', e);
            }
        }

        function hydrateUIState() {
            try {
                const draftStr = sessionStorage.getItem(DRAFT_KEY);
                if (!draftStr) return;
                const draft = JSON.parse(draftStr);
                for (const id in draft) {
                    const el = document.getElementById(id);
                    if (el && !el.closest('#confirmModal') && !el.closest('#accountModal')) {
                        if (el.type === 'checkbox' || el.type === 'radio') {
                            el.checked = draft[id];
                        } else if (el.type !== 'file' && el.type !== 'password') {
                            el.value = draft[id];
                        }
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
            } catch (e) {
                console.warn('UIステートのハイドレーションに失敗しました:', e);
            }
        }

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                serializeUIState();
            }
        });

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', hydrateUIState);
        } else {
            hydrateUIState();
        }
    })();
"""

def process_file(filepath):
    print(f"[*] Processing {filepath}...")
    if not os.path.exists(filepath):
        print(f"  [!] Warning: {filepath} not found. Skipping.")
        return False

    backup_path = filepath + '.bak'
    shutil.copy2(filepath, backup_path)
    print(f"  [+] Backup created: {backup_path}")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # beforeunload / unload リスナーを安全に無効化（記法揺れ対応）
    content = re.sub(r'window\.addEventListener\s*\(\s*[\'"](beforeunload\vert{}unload)[\'"].*?\);?', '// [BFCache最適化により削除]', content, flags=re.DOTALL)
    content = re.sub(r'window\.on(before)?unload\s*=.*?;', '// [BFCache最適化により削除]', content)

    if "bio_edu_draft_" in content or "【第7項改定】ネイティブ化必須要件：オートセーブ＆ハイドレーション仕様" in content:
        print(f"  [-] Already contains native hydration specification.")
    else:
        target_marker = "<!-- Firebase 認証"
        if target_marker in content:
            parts = content.split(target_marker, 1)
            last_script_close = parts[0].rfind("</script>")
            if last_script_close != -1:
                content = parts[0][:last_script_close] + HYDRATION_SNIPPET + "\n</script>\n\n" + target_marker + parts[1]
            else:
                content = parts[0] + "<script>" + HYDRATION_SNIPPET + "</script>\n\n" + target_marker + parts[1]
        else:
            content = content.replace("</body>", f"<script>{HYDRATION_SNIPPET}</script>\n</body>")
        print(f"  [+] Injected Native Hydration snippet.")

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  [✓] Successfully updated {filepath}")
    else:
        print(f"  [-] No changes required for {filepath}")
    return True

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(base_dir)
    print(f"=== Bio-Edu Suite Native Hydration Batch Sync ===\n")
    success_count = sum(1 for target in TARGET_FILES if process_file(os.path.join(base_dir, target)))
    print(f"\n=================================================")
    print(f"Sync complete. {success_count}/{len(TARGET_FILES)} files processed successfully.")

if __name__ == '__main__':
    main()