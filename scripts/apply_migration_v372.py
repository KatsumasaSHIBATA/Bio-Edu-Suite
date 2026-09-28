import os

def main():
    path = "index.html"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    old_load_sample_block = """    function loadSamples() {
      let loaded = null;
      try {
        const sessionData = sessionStorage.getItem(SESSION_WORKSPACE_KEY);
        if (sessionData !== null) {
          loaded = JSON.parse(sessionData);
        }
      } catch(e) {}

      if (loaded === null) {
        try {
          const localData = localStorage.getItem(STORAGE_KEY);
          if (localData !== null) {
            loaded = JSON.parse(localData);
          }
        } catch(e) {}
      }

      const isCleared = localStorage.getItem('bio_edu_samples_cleared') === 'true';

      if (Array.isArray(loaded)) {
        samples = loaded;
      } else if (isCleared) {
        samples = [];
      } else {
        samples = getDefaultFinchSamples();
        saveToStorage();
      }

      // 起動直後からセッションワークスペースに保持させて同期対象とする
      try {
        sessionStorage.setItem(SESSION_WORKSPACE_KEY, JSON.stringify(samples));
      } catch(e) {}
      
      renderSamples();
    }"""

    new_load_sample_block = """    function loadSamples() {
      let loaded = null;
      try {
        const sessionData = sessionStorage.getItem(SESSION_WORKSPACE_KEY);
        if (sessionData !== null) {
          loaded = JSON.parse(sessionData);
        }
      } catch(e) {}

      if (loaded === null) {
        try {
          const localData = localStorage.getItem(STORAGE_KEY);
          if (localData !== null) {
            loaded = JSON.parse(localData);
          }
        } catch(e) {}
      }

      const isCleared = localStorage.getItem('bio_edu_samples_cleared') === 'true';

      if (Array.isArray(loaded)) {
        samples = loaded;
      } else if (isCleared) {
        samples = [];
      } else {
        samples = getDefaultFinchSamples();
        localStorage.setItem('bio_edu_finch_alx1_version', 'v37.2');
        saveToStorage();
      }

      // ストレージキャッシュの自律マイグレーション (v37.2)
      const currentVer = localStorage.getItem('bio_edu_finch_alx1_version');
      if (currentVer !== 'v37.2' && Array.isArray(samples)) {
        const defaults = getDefaultFinchSamples();
        let migrated = false;
        samples = samples.map(s => {
          const matchDef = defaults.find(d => d.id === s.id);
          if (matchDef) {
            s.dnaData = matchDef.dnaData;
            s.sequences = parseFastaMarkers(s.dnaData);
            migrated = true;
          }
          return s;
        });
        localStorage.setItem('bio_edu_finch_alx1_version', 'v37.2');
        if (migrated) {
          saveToStorage();
        }
      }

      // 起動直後からセッションワークスペースに保持させて同期対象とする
      try {
        sessionStorage.setItem(SESSION_WORKSPACE_KEY, JSON.stringify(samples));
      } catch(e) {}
      
      renderSamples();
    }"""

    if old_load_sample_block in content:
        content = content.replace(old_load_sample_block, new_load_sample_block)
        print("Updated loadSamples successfully.")
    else:
        print("WARNING: old_load_sample_block not found.")

    old_restore = """    function restoreDefaultSamples() {
      localStorage.removeItem('bio_edu_samples_cleared');
      samples = getDefaultFinchSamples();
      saveToStorage();
      renderSamples();
      syncTracesFromIndexedDB();
      if (typeof showToast === 'function') {
        showToast("初期サンプル（4種）を復元しました", "success");
      }
    }"""

    new_restore = """    function restoreDefaultSamples() {
      localStorage.removeItem('bio_edu_samples_cleared');
      localStorage.setItem('bio_edu_finch_alx1_version', 'v37.2');
      samples = getDefaultFinchSamples();
      saveToStorage();
      renderSamples();
      syncTracesFromIndexedDB();
      if (typeof showToast === 'function') {
        showToast("初期サンプル（5種）を復元しました", "success");
      }
    }"""

    if old_restore in content:
        content = content.replace(old_restore, new_restore)
        print("Updated restoreDefaultSamples successfully.")
    else:
        print("WARNING: old_restore not found.")

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Migration patch applied.")

if __name__ == "__main__":
    main()
