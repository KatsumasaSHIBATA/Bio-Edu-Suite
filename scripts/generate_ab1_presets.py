#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/generate_ab1_presets.py
実機キャピラリーシーケンサー由来の複数の生AB1ファイルから
ダッシュボード用のプリセットJSON (data/ab1_presets.json) を生成する。
4種のプリセット（SPECIMEN-01〜04）にそれぞれ異なるリアルなシーケンスデータを割り当てる。
"""

import os
import glob
import base64
import json

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fixtures_dir = os.path.join(base_dir, "tests", "fixtures")
    
    # tests/fixtures/ 配下の .ab1 ファイルを自動探索・収集
    ab1_files = sorted(glob.glob(os.path.join(fixtures_dir, "*.ab1")))
    if not ab1_files:
        raise FileNotFoundError(f"No .ab1 file found in {fixtures_dir}")
    
    sample_ids = [
        "SPECIMEN-01_magnirostris",
        "SPECIMEN-02_fortis",
        "SPECIMEN-03_parvulus",
        "SPECIMEN-04_olivacea"
    ]
    
    presets = {}
    for idx, sid in enumerate(sample_ids):
        # 異なるAB1ファイルを順番に各IDへ割り当て
        file_path = ab1_files[idx % len(ab1_files)]
        file_name = os.path.basename(file_path)
        print(f"Assigning {file_name} to {sid}")
        
        with open(file_path, "rb") as f:
            ab1_bytes = f.read()
        
        b64_str = base64.b64encode(ab1_bytes).decode('ascii')
        
        presets[sid] = {
            "id": sid,
            "fileName": file_name,
            "data": f"data:application/octet-stream;base64,{b64_str}"
        }
        
    output_path = os.path.join(base_dir, "data", "ab1_presets.json")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(presets, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully generated {output_path} with {len(presets)} distinct samples.")

if __name__ == "__main__":
    main()

