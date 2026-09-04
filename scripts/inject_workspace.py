import os
import re

TARGET_FILES = [
    "4_Sanger_Trace_Editor.html",
    "5_DNA_Alignment_Studio.html",
    "7_Virtual_BLAST_Explorer.html",
    "8_Phylogenetic_Tree_Builder.html",
    "9_Morphometrics_Studio.html",
    "10_integrative_taxonomy_studio.html",
    "11_Comparative_Variant_Analyzer.html",
    "12_Statistical_Genetics_Lab.html",
    "13_Central_Dogma_Simulator.html",
    "14_Protein_Structure_Explorer.html"
]

SCRIPT_TAG = '  <!-- /* [Bio-Edu Suite v35.1] Session-Persistent Workspace Standard */ -->\n  <script src="js/session_workspace.js"></script>\n</body>'

def inject():
    for fname in TARGET_FILES:
        if not os.path.exists(fname):
            continue
        with open(fname, 'r', encoding='utf-8') as f:
            content = f.read()

        if 'session_workspace.js' in content:
            print(f"[SKIP] Already injected: {fname}")
            continue

        if '</body>' in content:
            new_content = content.replace('</body>', SCRIPT_TAG)
            with open(fname, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"[OK] Injected workspace into: {fname}")
        else:
            print(f"[WARN] No </body> tag in: {fname}")

if __name__ == '__main__':
    inject()
