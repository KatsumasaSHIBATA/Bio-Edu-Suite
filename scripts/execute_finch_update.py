#!/usr/bin/env python3
import os
import sys

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "archive"))
from generate_finch_ab1 import FINCH_DATA

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

    g_note = "【系統的位置】鳥類進化の基部近くで分岐したキジ目に属し、スズメ目（フィンチ類）の適応放散を解析する際の分子系統樹の根（ルート）を決定するための外群として使用する。\n【遺伝子型】ALX1 CDS (987 bp)\n[Source: App_1_LIMS]"
    g_dna = ">Gallus_gallus_Outgroup_ALX1\nATGATTATGGATTTTCTGAGTGAGAAGTTTGCCCTGAAGAGCCAGCCGAGCAAGAACAGTGACTTTTACATGGGAGCAGGAGGCACTTTGGAGCACGTTATGGAAACTTTGGACAATGAGTCCTTTTATAGCAAAACGTCAGGCAGCAAATGTGTGCAGGCCTTCAACCCTCTGCAAAGGGCTGAGCATCATGTGAGGCTGGACAGGACATCACCCTGCCAAGACAACAACGTGAACTACGGGATTACTAAAGTGGAAGGACAGCCTCTTCACACAGAGCTCAACAGGCCCTTGGACAACTGCAACAATCTCAGGATGTCTCCGGTGAAGGGGATGCAGGAGAAGGGGGAACTGGATGAACTGGGTGATAAGTGTGACAGCAATGTCTCCAGCAGTAAGAAGAGGAGACACAGAACAACTTTCACCAGTTTGCAGCTGGAGGAACTGGAGAAAGTCTTCCAGAAAACTCATTACCCTGATGTCTACGTGAGGGAGCAGCTAGCTCTGAGGACAGAGCTCACCGAGGCCAGAGTCCAGGTTTGGTTCCAGAATAGAAGAGCAAAATGGAGGAAAAGAGAACGCTATGGGCAGATCCAGCAAGCTAAGAGCCATTTTGCTGCCACTTATGATATATCTGTTCTTCCAAGGACTGACAGCTATCCTCAGATTCAGAACAATCTGTGGGCGGGGAACACCGCTAGTGGTTCTGTGGTTACTTCCTGCATGATACCACGAGATACTTCCTCCTGTATGACACCTTATTCCCATTCACCCCGGACAGATTCTGGCTACACAGGCTTTTCAAACCACCAGAATCAGTTCAGCCATGTGCCTCTCAATAATTTTTTCACTGACTCTTTACTTTCTGGGGCAACCAATGGACATGCTTTTGAAACCAAGCCGGAATTTGAAAGGAGATCTTCCAGCATTGCAGTTCTACGGATGAAAGCCAAAGAGCATGCTGCCAATATTTCCTGGGCTATGTAA"

    finches = [
        ("SPECIMEN-01_olivacea", "キマユムシクイフィンチ (Certhidea olivacea)", "サンチャゴ島など", "【生態・形態】極細の嘴を持つ。細枝の隙間から昆虫を捕食する、全フィンチ類の中で最も初期に分岐した基底種。\n【遺伝子型】ALX1 鋭端型ハプロタイプ (Pointed P)\n[Source: App_1_LIMS]", "9.8, 4.1, 3.9", ">Certhidea_olivacea_ALX1\n" + FINCH_DATA["SPECIMEN-04_olivacea"]["seq"], "images/finch_4_olivacea.jpg", 40000),
        ("SPECIMEN-02_parvulus", "コガラパゴスフィンチ (Camarhynchus parvulus)", "サンタ・クルス島", "【生態・形態】小型の嘴を持つ樹上フィンチ。樹皮下の昆虫を捕食する。\n【遺伝子型】ALX1 鋭端型ハプロタイプ (Pointed P)\n[Source: App_1_LIMS]", "7.3, 6.7, 6.2", ">Camarhynchus_parvulus_ALX1\n" + FINCH_DATA["SPECIMEN-03_parvulus"]["seq"], "images/finch_3_parvulus.jpg", 30000),
        ("SPECIMEN-03_fortis", "中型地上フィンチ (Geospiza fortis)", "ダフネ・マヨル島", "【生態・形態】中型の嘴を持つ。環境変動に伴う自然選択が追跡されたモデル生物。\n【遺伝子型】ALX1 鈍端型ハプロタイプ (Blunt B)\n[Source: App_1_LIMS]", "11.2, 9.8, 9.0", ">Geospiza_fortis_ALX1\n" + FINCH_DATA["SPECIMEN-02_fortis"]["seq"], "images/finch_2_fortis.jpg", 20000),
        ("SPECIMEN-04_magnirostris", "オオガラパゴスフィンチ (Geospiza magnirostris)", "ヘノベサ島", "【生態・形態】頑丈で極太の嘴を持つ。大型の硬い種子を破砕して採食する。\n【遺伝子型】ALX1 鈍端型ハプロタイプ (Blunt B)\n[Source: App_1_LIMS]", "15.9, 17.5, 15.5", ">Geospiza_magnirostris_ALX1\n" + FINCH_DATA["SPECIMEN-01_magnirostris"]["seq"], "images/finch_1_magnirostris.jpg", 10000)
    ]

    nl = "\\n"
    samples_js = [f"""        {{
          id: "SPECIMEN-00_gallus",
          name: "[外群] ニワトリ (Gallus gallus)",
          envCategory: "家禽（参考外群）",
          envNote: "{g_note.replace(chr(10), nl)}",
          morphData: "",
          dnaData: "{g_dna.replace(chr(10), nl)}",
          date: new Date(Date.now() - 50000).toISOString(),
          image_data: "",
          traces: [],
          hasRawSeq: false
        }}"""]

    for sid, name, cat, note, morph, dna, img, offset in finches:
        samples_js.append(f"""        {{
          id: "{sid}",
          name: "{name}",
          envCategory: "{cat}",
          envNote: "{note.replace(chr(10), nl)}",
          morphData: "{morph}",
          dnaData: "{dna.replace(chr(10), nl)}",
          date: new Date(Date.now() - {offset}).toISOString(),
          image_data: "{img}",
          traces: [],
          hasRawSeq: false
        }}""")

    joined = ",\n".join(samples_js)
    new_func = f"""    // ガラパゴスフィンチ4種＋外群（ニワトリ）のALX1 CDS配列 デフォルトデータセット
    function getDefaultFinchSamples() {{
      return [
{joined}
      ];
    }}
    """

    content = content[:start_idx] + new_func + "\n\n" + content[end_idx:]
    with open(index_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Successfully updated getDefaultFinchSamples.")

if __name__ == "__main__":
    main()
