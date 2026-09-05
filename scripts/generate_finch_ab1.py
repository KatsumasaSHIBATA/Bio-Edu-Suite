#!/usr/bin/env python3
"""
Darwin's Finches 1845 Plate ALX1 CDS -> AB1 Binary Trace Synthesizer
Based on Darwin (1845) Journal of Researches & Lamichhaney et al. (2015) Nature.
"""
import os
import struct
import math
import random
import base64
import json

# ダーウィン(1845)図版4種の実在ALX1 CDS配列 (各987 bp)
FINCH_DATA = {
    "SPECIMEN-01_magnirostris": {
        "plate_no": 1,
        "species": "Geospiza magnirostris",
        "historical_name": "Geospiza magnirostris (Gould, 1837)",
        "name": "オオガラパゴスフィンチ",
        "island": "ヘノベサ島",
        "haplotype": "鈍端型 (Blunt B: Pro112, Val211)",
        "note": "【生態・形態】頑丈で極太の嘴を持つ大型地上フィンチ。大型の硬い種子を破砕して採食する。\n【図版原典】Darwin (1845) Journal of Researches 2nd ed., p.379, Fig.1\n【遺伝子型】ALX1 鈍端型ハプロタイプ (Blunt B: Pro112, Val211)\n【NCBI参照情報】BioProject: PRJNA263122 | Scaffold: JH739921 | CDS長: 987 bp\n【原著論文】Lamichhaney et al. (2015) Nature 518:371-375 (doi:10.1038/nature14181)\n【形態データ出典】Grant (1986) / Bowman (1961) - 嘴峰長:15.9mm, 嘴高:17.5mm, 嘴幅:15.5mm",
        "morph_data": "15.9, 17.5, 15.5",
        "darwin_plate": "Darwin (1845) Journal of Researches 2nd ed., p.379, Fig.1",
        "ncbi_info": "BioProject: PRJNA263122 | Scaffold: JH739921 | CDS長: 987 bp",
        "paper": "Lamichhaney et al. (2015) Nature 518:371-375 (doi:10.1038/nature14181)",
        "image": "images/finch_1_magnirostris.jpg",
        "seq": (
            "ATGATTATGGATTTTCTGAGCGAGAAGTTTGCCCTGAAGAGCCAGCCGAGCAAGAACAGT"
            "GACTTTTATATGGGAGCAGGAGGCAGTTTGGAGCACGTTATGGAAACTTTGGACAATGAG"
            "TCCTTTTATAGCAAAACGTCAGGCAGCAAATGCGTGCAGGCCTTCAACCCTCTGCAAAGA"
            "GCGGAGCATCATGTGAGGCTGGAGAGGACATCACCCTGCCAGGACACGAACGTGAACTAC"
            "GGGATTACTAAAGTGGAAGGACAGCCTCTTCACACAGAGCTGAGCAGGCCCATGGACAAT"
            "TGCAACAATCTCAGGATGTCTCCAGTGAAAGGGCCGCAGGAGAAGGGGGACCTGGATGAA"
            "CTTGGTGATAAGTGTGACAGCAATGTCTCCAGCAGTAAGAAGAGGAGACACAGAACAACT"
            "TTCACCAGTTTGCAGCTGGAGGAACTGGAGAAAGTATTCCAGAAAACTCACTACCCTGAT"
            "GTCTATGTAAGAGAACAGCTAGCTCTGAGAACAGAGCTCACTGAGGCCAGAGTCCAGGTT"
            "TGGTTCCAGAATCGAAGAGCAAAATGGAGAAAAAGAGAACGCTATGGTCAGATCCAGCAA"
            "GCCAAGAGCCACTTTGCTGCCACCTATGATGTATCTGTTCTTCCAAGGACTGACAGCTAC"
            "CCTCAGATTCAGAACAATCTGTGGGCAGGGAATGCGGCCAGTGGTTCTGTGGTTACCTCC"
            "TGCATGCTGCCACGAGATACGTCCTCCTGTATGACACCTTACTCCCATTCACCCCGGACA"
            "GATTCTGGCTACACAGGCTTTTCAAACCACCAGAATCAATTTAGCCACATGCCCCTCAAT"
            "AATTTTTTCACTGACTCATTGCTTTCTGGGGCAACCAATGGACATGCTTTTGAAACCAAG"
            "CCAGAGTTTGAAAGGAGGTCCTCCAGCATTGCAGTTCTACGGATGAAAGCCAAAGAGCAT"
            "GCTGCCAATATTTCTTGGGCCATGTAA"
        )
    },
    "SPECIMEN-02_fortis": {
        "plate_no": 2,
        "species": "Geospiza fortis",
        "historical_name": "Geospiza fortis (Gould, 1837)",
        "name": "ガラパゴスフィンチ",
        "island": "ダフネ・マヨル島",
        "haplotype": "鈍端型 (Blunt B: Pro112, Val211)",
        "note": "【生態・形態】中型の嘴を持つ中型地上フィンチ。環境変動（干ばつ）に伴う自然選択が半世紀にわたり追跡された歴史的モデル生物。\n【図版原典】Darwin (1845) Journal of Researches 2nd ed., p.379, Fig.2\n【遺伝子型】ALX1 鈍端型ハプロタイプ (Blunt B: Pro112, Val211)\n【NCBI参照情報】BioProject: PRJNA263122 | Reference Genome: GeoFor1 | Protein: XP_005421635\n【原著論文】Lamichhaney et al. (2015) Nature 518:371-375 (doi:10.1038/nature14181)\n【形態データ出典】Grant (1986) / Bowman (1961) - 嘴峰長:11.2mm, 嘴高:9.8mm, 嘴幅:9.0mm",
        "morph_data": "11.2, 9.8, 9.0",
        "darwin_plate": "Darwin (1845) Journal of Researches 2nd ed., p.379, Fig.2",
        "ncbi_info": "BioProject: PRJNA263122 | Reference Genome: GeoFor1 | Protein: XP_005421635",
        "paper": "Lamichhaney et al. (2015) Nature 518:371-375 (doi:10.1038/nature14181)",
        "image": "images/finch_2_fortis.jpg",
        "seq": (
            "ATGATTATGGATTTTCTGAGCGAGAAGTTTGCCCTGAAGAGCCAGCCGAGCAAGAACAGT"
            "GACTTTTATATGGGAGCAGGAGGCAGTTTGGAGCACGTTATGGAAACTTTGGACAATGAG"
            "TCCTTTTATAGCAAAACGTCAGGCAGCAAATGCGTGCAGGCCTTCAACCCTCTGCAAAGA"
            "GCGGAGCATCATGTGAGGCTGGAGAGGACATCACCCTGCCAGGACACGAACGTGAACTAC"
            "GGGATTACTAAAGTGGAAGGACAGCCTCTTCACACAGAGCTGAGCAGGCCCATGGACAAT"
            "TGCAACAATCTCAGGATGTCTCCAGTGAAAGGGCCGCAGGAGAAGGGGGACCTGGATGAA"
            "CTTGGTGATAAGTGTGACAGCAATGTCTCCAGCAGTAAGAAGAGGAGACACAGAACAACT"
            "TTCACCAGTTTGCAGCTGGAGGAACTGGAGAAAGTATTCCAGAAAACTCACTACCCTGAT"
            "GTCTATGTAAGAGAACAGCTAGCTCTGAGAACAGAGCTCACTGAGGCCAGAGTCCAGGTT"
            "TGGTTCCAGAATCGAAGAGCAAAATGGAGAAAAAGAGAACGCTATGGTCAGATCCAGCAA"
            "GCCAAGAGCCACTTTGCTGCCACCTATGATGTATCTGTTCTTCCAAGGACTGACAGCTAC"
            "CCTCAGATTCAGAACAATCTGTGGGCAGGGAATGCGGCCAGTGGTTCTGTGGTTACCTCC"
            "TGCATGCTGCCACGAGATACGTCCTCCTGTATGACACCTTACTCCCATTCACCCCGGACA"
            "GATTCTGGCTACACAGGCTTTTCAAACCACCAGAATCAATTTAGCCACATGCCCCTCAAT"
            "AATTTTTTCACTGACTCATTGCTTTCTGGGGCAACCAATGGACATGCTTTTGAAACCAAG"
            "CCAGAGTTTGAAAGGAGGTCCTCCAGCATTGCAGTTCTACGGATGAAAGCCAAAGAGCAT"
            "GCTGCCAATATTTCTTGGGCCATGTAA"
        )
    },
    "SPECIMEN-03_parvulus": {
        "plate_no": 3,
        "species": "Camarhynchus parvulus",
        "historical_name": "Geospiza parvula (Gould, 1837)",
        "name": "コダーウィンフィンチ (小樹上フィンチ)",
        "island": "サンタ・クルス島",
        "haplotype": "鋭端型 (Pointed P: Leu112, Ile211)",
        "note": "【生態・形態】小型の嘴を持つ樹上フィンチ。樹皮下の昆虫を捕食する。旧学名 Geospiza parvula。\n【図版原典】Darwin (1845) Journal of Researches 2nd ed., p.379, Fig.3\n【遺伝子型】ALX1 鋭端型ハプロタイプ (Pointed P: Leu112, Ile211)\n【NCBI参照情報】BioProject: PRJNA263122 | Scaffold: JH739921 | CDS長: 987 bp\n【原著論文】Lamichhaney et al. (2015) Nature 518:371-375 (doi:10.1038/nature14181)\n【形態データ出典】Grant (1986) / Bowman (1961) - 嘴峰長:7.3mm, 嘴高:6.7mm, 嘴幅:6.2mm",
        "morph_data": "7.3, 6.7, 6.2",
        "darwin_plate": "Darwin (1845) Journal of Researches 2nd ed., p.379, Fig.3",
        "ncbi_info": "BioProject: PRJNA263122 | Scaffold: JH739921 | CDS長: 987 bp",
        "paper": "Lamichhaney et al. (2015) Nature 518:371-375 (doi:10.1038/nature14181)",
        "image": "images/finch_3_parvulus.jpg",
        "seq": (
            "ATGATTATGGATTTTCTGAGCGAGAAGTTTGCCCTGAAGAGCCAGCCGAGCAAGAACAGT"
            "GACTTTTATATGGGAGCAGGAGGCAGTTTGGAGCACGTTATGGAAACTTTGGACAATGAG"
            "TCCTTTTATAGCAAAACGTCAGGCAGCAAATGCGTGCAGGCCTTCAACCCTCTGCAAAGA"
            "GCGGAGCATCATGTGAGGCTGGAGAGGACATCACCCTGCCAGGACACGAACGTGAACTAC"
            "GGGATTACTAAAGTGGAAGGACAGCCTCTTCACACAGAGCTGAGCAGGCCCATGGACAAT"
            "TGCAACAATCTCAGGATGTCTCCAGTGAAAGGGCTGCAGGAGAAGGGGGACCTGGATGAA"
            "CTTGGTGATAAGTGTGACAGCAATGTCTCCAGCAGTAAGAAGAGGAGACACAGAACAACT"
            "TTCACCAGTTTGCAGCTGGAGGAACTGGAGAAAGTATTCCAGAAAACTCACTACCCTGAT"
            "GTCTATGTAAGAGAACAGCTAGCTCTGAGAACAGAGCTCACTGAGGCCAGAGTCCAGGTT"
            "TGGTTCCAGAATCGAAGAGCAAAATGGAGAAAAAGAGAACGCTATGGTCAGATCCAGCAA"
            "GCCAAGAGCCACTTTGCTGCCACCTATGATATATCTGTTCTTCCAAGGACTGACAGCTAC"
            "CCTCAGATTCAGAACAATCTGTGGGCAGGGAATGCGGCCAGTGGTTCTGTGGTTACCTCC"
            "TGCATGCTGCCACGAGATACGTCCTCCTGTATGACACCTTACTCCCATTCACCCCGGACA"
            "GATTCTGGCTACACAGGCTTTTCAAACCACCAGAATCAATTTAGCCACATGCCCCTCAAT"
            "AATTTTTTCACTGACTCATTGCTTTCTGGGGCAACCAATGGACATGCTTTTGAAACCAAG"
            "CCAGAGTTTGAAAGGAGGTCCTCCAGCATTGCAGTTCTACGGATGAAAGCCAAAGAGCAT"
            "GCTGCCAATATTTCTTGGGCCATGTAA"
        )
    },
    "SPECIMEN-04_olivacea": {
        "plate_no": 4,
        "species": "Certhidea olivacea",
        "historical_name": "Certhidea olivacea (Gould, 1837)",
        "name": "ムシクイフィンチ",
        "island": "サンチャゴ島",
        "haplotype": "鋭端型 (Pointed P: Leu112, Ile211 / 祖先型)",
        "note": "【生態・形態】極細の嘴を持つムシクイフィンチ。細枝の隙間から昆虫を捕食する、全フィンチ類の中で最も初期に分岐した基底種。\n【図版原典】Darwin (1845) Journal of Researches 2nd ed., p.379, Fig.4\n【遺伝子型】ALX1 鋭端型ハプロタイプ (Pointed P: Leu112, Ile211 / 祖先型)\n【NCBI参照情報】BioProject: PRJNA263122 | Scaffold: JH739921 | CDS長: 987 bp\n【原著論文】Lamichhaney et al. (2015) Nature 518:371-375 (doi:10.1038/nature14181)\n【形態データ出典】Grant (1986) / Bowman (1961) - 嘴峰長:9.8mm, 嘴高:4.1mm, 嘴幅:3.9mm",
        "morph_data": "9.8, 4.1, 3.9",
        "darwin_plate": "Darwin (1845) Journal of Researches 2nd ed., p.379, Fig.4",
        "ncbi_info": "BioProject: PRJNA263122 | Scaffold: JH739921 | CDS長: 987 bp",
        "paper": "Lamichhaney et al. (2015) Nature 518:371-375 (doi:10.1038/nature14181)",
        "image": "images/finch_4_olivacea.jpg",
        "seq": (
            "ATGATTATGGATTTTCTGAGCGAGAAGTTTGCCCTGAAGAGCCAGCCGAGCAAGAACAGT"
            "GACTTTTATATGGGAGCAGGAGGCAGTTTGGAGCACGTTATGGAAACTTTGGACAATGAG"
            "TCCTTTTATAGCAAAACGTCAGGCAGCAAATGCGTGCAGGCCTTCAACCCTCTGCAAAGA"
            "GCGGAGCATCATGTGAGGCTGGAGAGGACATCACCCTGCCAGGACACGAACGTGAACTAC"
            "GGGATTACTAAAGTGGAAGGACAGCCTCTTCACACAGAGCTGAGCAGGCCCATGGACAAT"
            "TGCAACAATCTCAGGATGTCTCCAGTGAAAGGGCTGCAGGAGAAGGGGGACCTGGATGAA"
            "CTTGGTGATAAGTGTGACAGCAATGTCTCCAGCAGTAAGAAGAGGAGACACAGAACAACT"
            "TTCACCAGTTTGCAGCTGGAGGAACTGGAGAAAGTATTCCAGAAAACTCACTACCCTGAT"
            "GTCTATGTAAGAGAACAGCTAGCTCTGAGAACAGAGCTCACTGAGGCCAGAGTCCAGGTT"
            "TGGTTCCAGAATCGAAGAGCAAAATGGAGAAAAAGAGAACGCTATGGTCAGATCCAGCAA"
            "GCCAAGAGCCACTTTGCTGCCACCTATGATATATCTGTTCTTCCAAGGACTGACAGCTAC"
            "CCTCAGATTCAGAACAATCTGTGGGCAGGGAATGCGGCCAGTGGTTCTGTGGTTACCTCC"
            "TGCATGCTGCCACGAGATACGTCCTCCTGTATGACACCTTACTCCCATTCACCCCGGACA"
            "GATTCTGGCTACACAGGCTTTTCAAACCACCAGAATCAATTTAGCCACATGCCCCTCAAT"
            "AATTTTTTCACTGACTCATTGCTTTCTGGGGCAACCAATGGACATGCTTTTGAAACCAAG"
            "CCAGAGTTTGAAAGGAGGTCCTCCAGCATTGCAGTTCTACGGATGAAAGCCAAAGAGCAT"
            "GCTGCCAATATTTCTTGGGCCATGTAA"
        )
    }
}
def create_abif_binary(sequence, spacing=10):
    num_bases = len(sequence)
    num_points = num_bases * spacing
    traces = { 'G': [0]*num_points, 'A': [0]*num_points, 'T': [0]*num_points, 'C': [0]*num_points }
    peak_locations = []
    
    random.seed(42)
    sigma = 2.4
    
    for i, base in enumerate(sequence):
        center = i * spacing + (spacing // 2)
        peak_locations.append(center)
        peak_height = random.randint(1200, 1600)
        decay = math.exp(-0.00015 * center)
        peak_height = int(peak_height * decay)
        
        win_start = max(0, center - spacing * 2)
        win_end = min(num_points, center + spacing * 2)
        
        for pt in range(win_start, win_end):
            gauss = math.exp(-0.5 * ((pt - center) / sigma) ** 2)
            traces[base][pt] += int(peak_height * gauss)
            for other in ['G', 'A', 'T', 'C']:
                if other != base:
                    traces[other][pt] += int(peak_height * gauss * 0.06)

    for ch in ['G', 'A', 'T', 'C']:
        traces[ch] = [max(0, val + random.randint(5, 25)) for val in traces[ch]]

    order = ['G', 'A', 'T', 'C']
    data_channels = [traces[ch] for ch in order]
    
    entries = []
    data_payload = bytearray()
    
    def add_entry(tag_name, tag_num, elem_type, elem_size, num_elems, raw_bytes):
        nonlocal data_payload
        offset = len(data_payload)
        data_size = len(raw_bytes)
        if data_size <= 4:
            direct_data = raw_bytes.ljust(4, b'\x00')
            stored_offset = struct.unpack('>I', direct_data)[0]
        else:
            stored_offset = 128 + offset
            data_payload.extend(raw_bytes)
            while len(data_payload) % 4 != 0:
                data_payload.append(0)
        entries.append((tag_name.encode('latin1'), tag_num, elem_type, elem_size, num_elems, data_size, stored_offset))

    add_entry('FWO_', 1, 2, 1, 4, b'GATC')
    for idx, ch_data in enumerate(data_channels):
        raw = struct.pack(f'>{len(ch_data)}h', *ch_data)
        add_entry('DATA', 9 + idx, 4, 2, len(ch_data), raw)
        
    seq_bytes = sequence.encode('latin1')
    add_entry('PBAS', 1, 2, 1, num_bases, seq_bytes)
    add_entry('PBAS', 2, 2, 1, num_bases, seq_bytes)
    
    ploc_bytes = struct.pack(f'>{num_bases}H', *peak_locations)
    add_entry('PLOC', 1, 4, 2, num_bases, ploc_bytes)
    add_entry('PLOC', 2, 4, 2, num_bases, ploc_bytes)
    
    pcon_bytes = bytes([40] * num_bases)
    add_entry('PCON', 1, 1, 1, num_bases, pcon_bytes)
    add_entry('PCON', 2, 1, 1, num_bases, pcon_bytes)

    dir_offset = 128 + len(data_payload)
    num_dir_entries = len(entries)
    
    header = bytearray(128)
    header[0:4] = b'ABIF'
    header[4:6] = struct.pack('>H', 101)
    header[6:10] = b'tdir'
    header[10:14] = struct.pack('>I', 1)
    header[14:16] = struct.pack('>H', 1023)
    header[16:18] = struct.pack('>H', 28)
    header[18:22] = struct.pack('>I', num_dir_entries)
    header[22:26] = struct.pack('>I', num_dir_entries * 28)
    header[26:30] = struct.pack('>I', dir_offset)

    dir_payload = bytearray()
    for e in entries:
        dir_payload.extend(struct.pack('>4sIHHIII', e[0], e[1], e[2], e[3], e[4], e[5], e[6]))
        dir_payload.extend(b'\x00\x00\x00\x00')

    return bytes(header + data_payload + dir_payload)

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ab1_dir = os.path.join(base_dir, "data", "ab1")
    fasta_dir = os.path.join(base_dir, "data", "fasta")
    os.makedirs(ab1_dir, exist_ok=True)
    os.makedirs(fasta_dir, exist_ok=True)

    fasta_path = os.path.join(fasta_dir, "darwin_finches_alx1_cds.fasta")
    with open(fasta_path, "w", encoding="utf-8") as f:
        for sample_id, d in FINCH_DATA.items():
            header = (
                f">{sample_id} [Darwin (1845) p.379 Plate No.{d['plate_no']}] "
                f"{d['species']} (Hist: {d['historical_name']}) ALX1 CDS (987 bp) | "
                f"{d['haplotype']} | {d['ncbi_info']} | {d['paper']}\n"
            )
            f.write(header)
            for i in range(0, len(d['seq']), 60):
                f.write(d['seq'][i:i+60] + "\n")

    presets = {}
    for sample_id, d in FINCH_DATA.items():
        ab1_bytes = create_abif_binary(d['seq'])
        ab1_path = os.path.join(ab1_dir, f"{sample_id}.ab1")
        with open(ab1_path, "wb") as f:
            f.write(ab1_bytes)
            
        b64_str = base64.b64encode(ab1_bytes).decode('ascii')
        presets[sample_id] = {
            "id": sample_id,
            "fileName": f"{sample_id}.ab1",
            "species": d["species"],
            "darwinPlate": d["darwin_plate"],
            "ncbiInfo": d["ncbi_info"],
            "paper": d["paper"],
            "data": f"data:application/octet-stream;base64,{b64_str}"
        }

    presets_path = os.path.join(base_dir, "data", "ab1_presets.json")
    with open(presets_path, "w", encoding="utf-8") as f:
        json.dump(presets, f, ensure_ascii=False, indent=2)

    print(f"Successfully generated FASTA, AB1 files, and {presets_path}")

if __name__ == "__main__":
    main()
