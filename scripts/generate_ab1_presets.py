#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/generate_ab1_presets.py
実機キャピラリーシーケンサー由来の生AB1ファイルから
ダッシュボード用のプリセットJSON (data/ab1_presets.json) を生成する。
"""

import os
import glob
import base64
import json

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fixtures_dir = os.path.join(base_dir, "tests", "fixtures")
    
    # 生AB1ファイルの探索
    target_fixture = os.path.join(fixtures_dir, "1I1_F_P1815443_047.ab1")
    if not os.path.exists(target_fixture):
        ab1_files = glob.glob(os.path.join(fixtures_dir, "*.ab1"))
        if not ab1_files:
            raise FileNotFoundError(f"No .ab1 file found in {fixtures_dir}")
        target_fixture = ab1_files[0]
    
    print(f"Reading raw AB1 fixture: {target_fixture}")
    with open(target_fixture, "rb") as f:
        ab1_bytes = f.read()
        
    b64_str = base64.b64encode(ab1_bytes).decode('ascii')
    
    sample_ids = [
        "SPECIMEN-01_magnirostris",
        "SPECIMEN-02_fortis",
        "SPECIMEN-03_parvulus",
        "SPECIMEN-04_olivacea"
    ]
    
    presets = {}
    for sid in sample_ids:
        presets[sid] = {
            "id": sid,
            "fileName": f"{sid}.ab1",
            "data": f"data:application/octet-stream;base64,{b64_str}"
        }
        
    output_path = os.path.join(base_dir, "data", "ab1_presets.json")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(presets, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully generated {output_path} with {len(presets)} samples.")

if __name__ == "__main__":
    main()
