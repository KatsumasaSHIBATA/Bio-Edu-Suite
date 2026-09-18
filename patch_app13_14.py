import re

def update_13():
    with open('13_Central_Dogma_Simulator.html', 'r', encoding='utf-8') as f:
        content = f.read()

    content = re.sub(
        r'(let mutPositions = \[\];)',
        r'\1\n    let mutationPayload = [];',
        content,
        count=1
    )

    old_code_1 = """      // 突然変異判定 (PDF規格準拠)
      let isMutated = (currentMRNAs.length > 1 && aaMut !== aaWT && aaWT !== 'X' && aaMut !== 'X');

      if (isMutated) mutPositions.push(pos);

      let aaData = aminoAcids[aaMut] || { code3: 'Unk', name: 'Unknown', property: '不明', groupClass: 'aa-unknown' };

      let div = document.createElement('div');
      let className = `codon-box ${aaData.groupClass}`;"""

    new_code_1 = """      // 突然変異判定 (PDF規格準拠)
      let isMutated = (currentMRNAs.length > 1 && aaMut !== aaWT && aaWT !== 'X' && aaMut !== 'X');

      let aaData = aminoAcids[aaMut] || { code3: 'Unk', name: 'Unknown', property: '不明', groupCla      let aaData = aminoAcids[aisMutated) {
        mutPositi        mutPositi        mutPositi        mutPositi        mutPositi property:        mutPositi    mutationPayload.push({
            pos: pos,
            wt: dWT.code3,
            mut: aaData.code3,
                        property,
            mutProp: aaData.property
        });
      }

      let div = document.      let div = document.      let div = document.      let div = document.      let div = documecode_1 in content:
        content = content.replace(old_code_1, new_code_1)
    else:
        print("Failed to replace old_code_1 in app13")

    old_code_2 = """    // アラート出力 (ハリボテ排除・カラールールに基づくクラス適用)
    const alertBox = document.getElementById('mutationAlertContainer');
    if (mutPosi    if (mutPosi    if (mutPosi    if (mutPosi    if (mutPosi    if (mutPosi    if (mutPosi    iitions));
      alertBox.style.display = 'block';
      alertBox.className = 'dynamic-hint'; // Danger系 (赤)
      // 用語統一: 突然変異残�      // 用語統一: 突然変異残�      // 用語統一: 突然変異残�      // 用語統一: 突然変異残�      // ${mutPosition      /h} 箇所検出しました。<br>突然変異残基番号: ${mutPositions.join(', ')}<br><br>この突然�      // 用語統一: 突然変ステムに保存され�      // 用語統一: 突然変異残�      // 用語統一: 突然変異残�      // 用語統一: 突然変異残�      // 用語統� } e      // 用語統一: 突然変異残�      // 用語= """    // �      // 用語統一: 突然変異残�      // 甫ールに基づくクラス適用)
    const alertBox = document.getElementById('mutationAlertContainer');
    if (mutPositions.length > 0) {
      localStorage.setItem('bio_edu_suite_mutation      localStorage.setItem('bio_edu_suite_mutation      localStorage.setItem('bio_edu_suite_mutation      localStortionP      localStorage.setIttorage.setItem('      localStorage.setItem('bio_edu_suite_mutatioutationPayloa      localStorage.setItem('bio_edu_suite_mutation      localStorage.setItem('bio_edu_suite_mutation      localStorage.setItem('bio_edu_suite_mutation      localStortionP      localStorage.setIttorage.setItem('      localStorage.setItem('bio_edu_suite_mutatioutationPayloa      localStorage.setItem('bio_edu_suite_mutation      localStorage.setItem('bio_edu_suite_mutation      localStorage.setItem('bio_edu_suite_mutation      localStortionP      localStorage.setIttorage.setItem('      localStorage.setItem('bio_edu_suite_mutatioutationPayloa      localStorage.setItem('bio_edu_suite_mutation      localStorage.setItem('bio_edu_suite_mutatioass="btn btn-outline-danger btn-sm" target="_blank" style="text-decoration:none; display:inline-block; padding:6px 12px; margin-top:8px;"><svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>⑭ 3D構造で突然変異を確認する</a>`;
    } else if (currentMRNAs.length > 1) {"""

    if old_code_2 in content:
        content = content.replace(old_code_2, new_code_2)
    else:
        print("Failed to replace old_code_2 in app13")

    with open('13_Central_Dogma_Simulator.html', 'w', encoding='utf-8') as f:
        f.write(content)


def update_14():
    with open('14_Protein_Structure_Explorer.html', 'r', encoding='utf-8') as f:
        content = f.read()

    old_html = """            <div class="input-group-row">
              <input type="text" id="residueList" class="primer-input flex-1" placeholder="アミノ酸番号 (カンマ区切り)" onkeypress="if(event.keyCode===13) highlightFromInput()" enterkeyhint="go">
              <button class="btn btn-secondary min-w-80" onclick="highlightFromInput()" data-tooltip="入力したアミノ酸番号を赤色で強調表示します">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                追加
              </button>
            </div>"""

    new_html = """            <div class="input-    new_html = """            <div class="inpid="residueList" class="primer-input flex-1" placeholder="アミノ酸番号     new_html = """            <div class="input-    new_html = """      put()" enterkeyhint="go">
              <button class="btn btn-secondary min-w-80" onclick="highl              <button class="btn btn-secondary min-w-80" onclick="highl              <button class="btn btn-secondary min-w-80" onclick="highl              <button class="btn btn-secondary min-w-80" on="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                追加
              </b              </b              </b              </b              </b              </b              </b              </b              </b              </b              </b              </b              </b              </b              
        print("Failed to replace old_html in app14")

    old_onload = """  window.onload = function() {
    setTimeout(() => {
      const data = localStorage.getItem('bio_edu_suite_mutations');
      const timestamp = localStorage.getItem('bio_edu_suite_mutations_timestamp');
      const now = new Date().getTime();

      if (data && timestamp) {
        if (now - parseInt(timestamp) > 3600000) { // 1時間(3600000ms)経過
          localStorage.removeItem('bio_edu_suite_mutations');
          localStorage.removeItem('bio_edu_suite_mutations_timestamp');
          showToast("前回のデータから1時間以上経過したため、古いデモデータを自動破棄しました。", "warning");
        } else {
          // データ同期 (値のセットのみ)
          try {
            let mutations = JSON.parse(data);
            if (Array.isArray(mutations)) {
              document.getElementById('residueList').value = mutations.join(', ');
            } else {
              document.getElementById('residueList').value = data;
            }
          } catch(e) {
            document.getElementById('residueList').value = data;
          }
          showToast("アプリ⑤または⑫で�          showToast("アプリ⑤または⑫で�          showToast("アプリ��          showToast("アプリ⑤�グし          showToast( "info");
                                                                     onload = fu                                                     localStor                                                          dData = localStorage.getItem('bio_edu_suite_mutation_payload') || sessionStorage.getItem('bio_edu_suite_mutation_payload');
      const timestamp = localStorage.getItem('bio_edu_suite_mutations_timestamp');
      const now = new    e().getTime();

      if (data && timestamp) {
        if (now - parseInt(timestamp) > 3600000) { // 1�        if (now - parseInt(timestamp) > 3600000) { // 1�        if (now - tations')        if  localStorage.removeItem('bio_edu_suite_mutations_timestamp');
          localStorage.remov          lodu_suite_mutation_payload');
          sessionStorage.removeItem('bio_edu_suite_mutation          sessionStorage.removeItem('bio_edu_suite_mutation          sessionStorage.removeItem('bio_edu_suite_mutation          sessionStorage.removeItem('bio_edu_suite_mutation          sessionSt同期
          try {
            let mutations = JSON.parse(data);
            if (Array.isArray(mutations)) {
              document.getElementById('residueList').value = mutations.join(', ');
            } else {
              document.getElementById('residueList').value = data;
            }
          } catch(e) {
                                                                                          wToast("突然変異部位のデータを受�                       。", "info");

          // ペイロード（物性変化メタデータ）の展開
          if (payloadData) {
            try {
              const payload = JSON.parse(payloadData);
              let feedbackHtml =              let feedbackHtml =              let feedbackHtmtrong><br>`;
              payload.forEach(m => {
                let propChange = m.wtProp === m.mutProp ? `性質維持 (${m.wtProp})` : `<strong>性質変化 (${m.wtProp} ➔ ${m.mutProp})</strong>`;
                feedbackHtml += `残基 ${m.pos}: ${m.wt} ➔ ${m.mut} [${propChange}]<br>`;
              });
              feedbackHtml += `この物性変化が、タンパク質の3D構造や立体機能にどう影響するか観察してください。`;
              
                                                  yId('mutation_payload_info');
              if (hintDiv              if (hintDiv              if (hintDiv              if (hintDiv              if (hintDiv              if (hintDiv              if (hintDiv        console.error("Payload parse error", e);
            }
          }

          // 自動          // 自�実行（ユーザーに手�          // 自動          // 自�実行（        if (typeof highlightFromInput === 'function') {
            highlightFromInput();
          }
        }
                         """

    if old_onload in content:
        content = content.replace(old_onload, new_onload)
    else:
        print("Failed to replace old_onload in app14")

    with     with     with     with     with     with     with     with     with     with     with  te    wif __name__ == '__main__':
    update_13()
    update_14()
