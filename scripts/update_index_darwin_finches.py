#!/usr/bin/env python3
"""
Update index.html with Darwin's Finches 1845 Plate samples and IndexedDB AB1 hydration.
Imports FINCH_DATA directly from scripts/generate_finch_ab1.py.
"""
import os
import sys
import json

from generate_finch_ab1 import FINCH_DATA

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    index_path = os.path.join(base_dir, "index.html")

    with open(index_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Update window.onload to include hydrateAb1Presets
    old_onload = """    window.onload = () => {
      initTooltips();
      window.name = 'bio_edu_dashboard';
      setupDropZone();
      loadSamples();
      renderSamples();
    };"""

    new_onload = """    window.onload = async () => {
      initTooltips();
      window.name = 'bio_edu_dashboard';
      setupDropZone();
      loadSamples();
      renderSamples();
      await hydrateAb1Presets();
    };

    // AB1 プリセット波形データの IndexedDB 自動ハイドレーション
    async function hydrateAb1Presets() {
      try {
        const sampleIds = [
          "SPECIMEN-01_magnirostris",
          "SPECIMEN-02_fortis",
          "SPECIMEN-03_parvulus",
          "SPECIMEN-04_olivacea"
        ];
        let needsHydration = false;
        for (const sid of sampleIds) {
          const existing = await getFromIndexedDB(STORE_SAMPLES, sid);
          if (!existing || !existing.data) {
            needsHydration = true;
            break;
          }
        }
        if (!needsHydration) return;

        const response = await fetch('data/ab1_presets.json');
        if (!response.ok) return;
        const presets = await response.json();
        for (const [id, preset] of Object.entries(presets)) {
          await saveToIndexedDB(STORE_SAMPLES, preset);
        }
        console.log("AB1 presets successfully hydrated into IndexedDB.");
      } catch (err) {
        console.warn("Failed to hydrate AB1 presets:", err);
      }
    }"""

    if old_onload in content:
        content = content.replace(old_onload, new_onload)
        print("Updated window.onload and added hydrateAb1Presets")
    elif "hydrateAb1Presets" in content:
        print("hydrateAb1Presets already present in index.html")
    else:
        print("ERROR: Could not find old window.onload in index.html")
        sys.exit(1)

    # 2. Replace loadSamples and default samples
    target_start = "    // ダーウィン(1845)図版4種"
    if target_start not in content:
        target_start = "    function getDefaultFinchSamples() {"
    if target_start not in content:
        target_start = "    function loadSamples() {"
    target_end = "    // 【パッチ】画像リンク切れ対策用・自動Base64化＆ダミー生成リカバリーロジック"

    start_idx = content.find(target_start)
    end_idx = content.find(target_end)

    if start_idx == -1 or end_idx == -1:
        print("ERROR: Could not locate loadSamples in index.html")
        sys.exit(1)

    samples_js = []
    offsets = [10000, 20000, 30000, 40000]
    for idx, (sid, d) in enumerate(FINCH_DATA.items()):
        fasta_header = (
            f">{sid} [Darwin (1845) p.379 Plate No.{d['plate_no']}] "
            f"{d['species']} (Hist: {d['historical_name']}) ALX1 CDS (987 bp) | "
            f"{d['haplotype']} | {d['ncbi_info']} | {d['paper']}"
        )
        fasta_text = f"{fasta_header}\\n{d['seq']}"
        escaped_note = d['note'].replace('\n', '\\n')
        env_note = f"{escaped_note}\\n[Source: App_1_LIMS]"
        name_str = f"[Plate No.{d['plate_no']}] {d['species']} ({d['name']})"
        
        sample_dict_str = f"""        {{
          id: "{sid}",
          name: "{name_str}",
          envCategory: "{d['island']}",
          envNote: "{env_note}",
          morphData: "",
          dnaData: "{fasta_text}",
          date: new Date(Date.now() - {offsets[idx]}).toISOString(),
          image_data: "{d['image']}",
          hasRawSeq: true
        }}"""
        samples_js.append(sample_dict_str)

    samples_joined = ",\n".join(samples_js)

    new_load_samples = f"""    // ダーウィン(1845)図版4種の実在ALX1 CDS配列（987 bp）デフォルトデータセット（学術リッチメタデータ付き）
    function getDefaultFinchSamples() {{
      return [
{samples_joined}
      ];
    }}

    function loadSamples() {{
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {{
        try {{
          samples = JSON.parse(data);
          const isOld = samples.some(s => 
            !s.id || 
            s.id.includes('_WT_') || 
            s.id.includes('_MUT_') || 
            s.id.includes('_OUTGROUP_') || 
            !s.envNote || 
            !s.envNote.includes('【原著論文】')
          );
          if (isOld || samples.length === 0) {{
            samples = getDefaultFinchSamples();
            saveToStorage();
          }}
        }} catch(e) {{
          samples = getDefaultFinchSamples();
          saveToStorage();
        }}
        runImageSelfHealingPatch();
      }} else {{
        samples = getDefaultFinchSamples();
        saveToStorage();
        runImageSelfHealingPatch();
      }}
    }}
"""

    content = content[:start_idx] + new_load_samples + "\n" + content[end_idx:]
    print("Updated loadSamples with Darwin's Finches 1845 Plate rich academic metadata.")

    # 3. Safeguard runImageSelfHealingPatch
    patch_old = """          } catch (e) {
            console.warn("Base64 auto-conversion failed (likely CORS issue):", e);
            sample.image_data = generateDummyBase64(sample.name);
            requiresSave = true;
          }"""

    patch_new = """          } catch (e) {
            console.warn("Base64 auto-conversion failed (likely CORS issue), retaining original image path:", e);
          }"""

    if patch_old in content:
        content = content.replace(patch_old, patch_new)
        print("Safeguarded runImageSelfHealingPatch against CORS false placeholder fallback.")

    with open(index_path, "w", encoding="utf-8") as f:
        f.write(content)

    print("index.html successfully updated.")

if __name__ == "__main__":
    main()
