#!/usr/bin/env python3
import os

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    index_path = os.path.join(base_dir, "index.html")

    with open(index_path, "r", encoding="utf-8") as f:
        content = f.read()

    start_marker = "    function getDefaultFinchSamples() {"
    end_marker = "    function loadSamples() {"

    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker)

    if start_idx == -1 or end_idx == -1:
        print("ERROR: markers not found")
        return

    partial_func = """    // ガラパゴスフィンチ4種＋外群（ニワトリ）のALX1 CDS配列 デフォルトデータセット
    function getDefaultFinchSamples() {
      return [
        {
          id: "SPECIMEN-00_gallus",
          name: "[外群] ニワトリ (Gallus gallus)",
          envCategory: "家禽（参考外群）",
          envNote: "【系統的位置】鳥類進化の基部近くで分岐したキジ目に属し、スズメ目（フィンチ類）の適応放散を解析する際の分子系統樹の根（ルート）を決定するための外群として使用する。\\n【遺伝子型】ALX1 CDS (987 bp)\\n[Source: App_1_LIMS]",
          morphData: "",
          dnaData: ">Gallus_gallus_Outgroup_ALX1\\nATGATTATGGATTTTCTGAGTGAGAAGTTTGCCCTGAAGAGCCAGCCGAGCAAGAACAGTGACTTTTACATGGGAGCAGGAGGCACTTTGGAGCACGTTATGGAAACTTTGGACAATGAGTCCTTTTATAGCAAAACGTCAGGCAGCAAATGTGTGCAGGCCTTCAACCCTCTGCAAAGGGCTGAGCATCATGTGAGGCTGGACAGGACATCACCCTGCCAAGACAACAACGTGAACTACGGGATTACTAAAGTGGAAGGACAGCCTCTTCACACAGAGCTCAACAGGCCCTTGGACAACTGCAACAATCTCAGGATGTCTCCGGTGAAGGGGATGCAGGAGAAGGGGGAACTGGATGAACTGGGTGATAAGTGTGACAGCAATGTCTCCAGCAGTAAGAAGAGGAGACACAGAACAACTTTCACCAGTTTGCAGCTGGAGGAACTGGAGAAAGTCTTCCAGAAAACTCATTACCCTGATGTCTACGTGAGGGAGCAGCTAGCTCTGAGGACAGAGCTCACCGAGGCCAGAGTCCAGGTTTGGTTCCAGAATAGAAGAGCAAAATGGAGGAAAAGAGAACGCTATGGGCAGATCCAGCAAGCTAAGAGCCATTTTGCTGCCACTTATGATATATCTGTTCTTCCAAGGACTGACAGCTATCCTCAGATTCAGAACAATCTGTGGGCGGGGAACACCGCTAGTGGTTCTGTGGTTACTTCCTGCATGATACCACGAGATACTTCCTCCTGTATGACACCTTATTCCCATTCACCCCGGACAGATTCTGGCTACACAGGCTTTTCAAACCACCAGAATCAGTTCAGCCATGTGCCTCTCAATAATTTTTTCACTGACTCTTTACTTTCTGGGGCAACCAATGGACATGCTTTTGAAACCAAGCCGGAATTTGAAAGGAGATCTTCCAGCATTGCAGTTCTACGGATGAAAGCCAAAGAGCATGCTGCCAATATTTCCTGGGCTATGTAA",
          date: new Date(Date.now() - 50000).toISOString(),
          image_data: "",
          traces: [],
          hasRawSeq: false
        },
"""
    content = content[:start_idx] + partial_func + "\n" + content[end_idx:]

    with open(index_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Part 1 applied successfully")

if __name__ == "__main__":
    main()
