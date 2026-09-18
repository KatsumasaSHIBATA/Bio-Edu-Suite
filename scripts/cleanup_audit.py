#!/usr/bin/env python3
import os
import sys
import shutil
from pathlib import Path

# Setup paths
PROJECT_ROOT = Path(__file__).resolve().parent.parent
SCRIPTS_DIR = PROJECT_ROOT / "scripts"
ARCHIVE_DIR = SCRIPTS_DIR / "archive"

WHITELIST_EXACT = {
    "index.html", "lab_packs.html", "auth_sync.js", "preset_db.js",
    ".clinerules", "manifest.json", "cleanup_audit.py"
}
WHITELIST_DIRS = {
    "docs", "lib", "js"
}
GARBAGE_EXTENSIONS = {".bak", ".tmp", ".swp", ".orig"}
GARBAGE_NAMES = {".DS_Store", "Thumbs.db", "desktop.ini"}

def is_whitelisted(path: Path) -> bool:
    if path.name in WHITELIST_EXACT:
        return True
    
    name = path.name
    # HTML apps
    if name.endswith(".html"):
        parts = name.split('_')
        if len(parts) >= 2 and parts[0].isdigit() and 1 <= int(parts[0]) <= 14:
            return True
            
    if name.startswith("icon-") and name.endswith(".png"): return True

    try:
        rel_path = path.relative_to(PROJECT_ROOT)
        if len(rel_path.parts) > 0 and rel_path.parts[0] in WHITELIST_DIRS:
            return True
    except ValueError:
        pass
        
    return False

def find_targets():
    to_delete = []
    to_archive = []
    
    for root, dirs, files in os.walk(PROJECT_ROOT):
        if ".git" in dirs:
            dirs.remove(".git")
        root_path = Path(root)
        
        # skip archive dir
        if root_path == ARCHIVE_DIR:
            continue
            
        for file in files:
            file_path = root_path / file
            if is_whitelisted(file_path):
                continue
                
            # OS / Temp / Garbage files
            if file in GARBAGE_NAMES or file.endswith("~") or file_path.suffix in GARBAGE_EXTENSIONS:
                to_delete.append(file_path)
                continue
                
            # Root specific logs and temps
            if root_path == PROJECT_ROOT:
                if file.endswith(".log") or (file.startswith("test_") and file.endswith(".txt")) or file.startswith("temp_"):
                    to_delete.append(file_path)
                    continue
                    
            # Scripts dir: old scripts
            if root_path == SCRIPTS_DIR and file.endswith(".py") and file != "cleanup_audit.py":
                to_archive.append(file_path)
                
    return to_delete, to_archive

def main():
    apply_mode = "--apply" in sys.argv
    to_delete, to_archive = find_targets()
    
    print("=== Cleanup Audit Report ===")
    print(f"Files to delete: {len(to_delete)}")
    total_delete_size = 0
    for p in to_delete:
        try:
            size = p.stat().st_size
            total_delete_size += size
            print(f"  [DELETE] {p.relative_to(PROJECT_ROOT)} ({size} bytes)")
        except FileNotFoundError:
            pass
            
    print(f"Files to archive: {len(to_archive)}")
    for p in to_archive:
        print(f"  [ARCHIVE] {p.relative_to(PROJECT_ROOT)}")
        
    print(f"Total space to free: {total_delete_size} bytes")
    
    if apply_mode:
        print("\n=== Applying Changes ===")
        for p in to_delete:
            try:
                p.unlink()
                print(f"Deleted: {p.relative_to(PROJECT_ROOT)}")
            except Exception as e:
                print(f"Failed to delete {p.relative_to(PROJECT_ROOT)}: {e}")
            
        if to_archive:
            ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
            for p in to_archive:
                try:
                    dest = ARCHIVE_DIR / p.name
                    shutil.move(str(p), str(dest))
                    print(f"Archived: {p.relative_to(PROJECT_ROOT)} -> {dest.relative_to(PROJECT_ROOT)}")
                except Exception as e:
                    print(f"Failed to archive {p.relative_to(PROJECT_ROOT)}: {e}")
        print("Cleanup completed.")
    else:
        print("\nDry-run mode. Run with --apply to execute changes.")

if __name__ == "__main__":
    main()
