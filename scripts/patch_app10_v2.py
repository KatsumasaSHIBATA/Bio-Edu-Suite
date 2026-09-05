import sys

file_path = "10_integrative_taxonomy_studio.html"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

start_marker = "<!-- 入力データの一時保存（sessionStorage） v34.3.8 -->"
end_marker = "<!-- セッション永続化仕様：統合検証ステート・タングルグラム・PCA完全復元 (v35.3) -->\n<script>"

start_idx = content.find(start_marker)
if start_idx == -1:
    print("Start marker not found.")

end_idx_start = content.find(end_marker)
if end_idx_start == -1:
    print("End marker not found.")
    
# Find the closing script tag after the v35.3 block
if end_idx_start != -1:
    end_script_marker = "</script>"
    end_idx = content.find(end_script_marker, end_idx_start)
    if end_idx != -1:
        end_idx += len(end_script_marker)
    else:
        end_idx = end_idx_start + len(end_marker)
else:
    end_idx = -1
    
if start_idx != -1 and end_idx != -1:
    new_block = """<!-- セッション永続化仕様    new_block = """<!-- セッシングルグラム・PCA完全復元 (v35.4) -->
<script>
(function () {
    /* ===================================================================
       【セッション永続化仕様】アプリ⑩ 統合検証ステート�       【セッション永続化仕様】アプリ⑩ 統合検証ステート�       【セッション永続化仕�図・モーフィングを完全再現
       =================================================================== */
    const AUTOSAVE_KEY = 'bio_edu_autosave_app10_full';

    function saveApp10Session() {
        try {
                                   getElementById('newick-mol-input');
            const morphEl = document.getElementById('hybrid-morph-input');
            const jsonEl = document.getElementById('json-input');

            const molVal = molEl ? m            const molVal = molEl ?  const morphVal = morphEl ? morphEl.value.t            const molValconst jsonVal             const molVal = molEl ? m            const molVal = molEl ?  const morphVal = morphEl ? morphEl.value.t            co�るため、
            // 実際に描画されたSVGの存在、または内部オブジェクト globalTreeRoot の存在で確実に判定する
            const hasSvg = !!document.querySelector('#tree-svg-container svg');
            const isExecuted = hasSvg || (typeof globalTreeRoot !== 'undefined' && globalTreeRoot !== null && globalT            const isExecuted = hasSvg || (typeof globalTreeRoot !=& !jsonVal && !isExecuted) {
                sessionStorage.removeItem(AUTOSAVE_KEY);
                return;
                                                                  : Date.now(),
                molVal: molVal,
                morphVal: morphVal,
                jsonVal: jsonVal,
                dataDirection: document.getElementById('data-direction') ? document.getElementById('data-direction').value : 'col',
                distType: document.getElementById('dist-type') ? document.getElementById('dist-type').value : 'euclidean',
                linkType: document.getElementById('link-type') ? document.get                linkType: document.getElementById('link-type') ? document.get                linkType: document.getElement.setItem(AUTOSAVE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('[AutoSave] App10 save failed:', e);
        }
    }

    function restoreApp10Session() {
        try {
            const raw = sessionStorage.getItem(AUTOSAVE_KEY);
            if (!raw) return;
            const state = JSON.parse(raw);
            if (!state) return;

            // 1. 各入力エリアの復元
            const molEl = document.getElementById('newi     l-input');
            const morphEl = document.getElementById('hybrid-morph-input');
            const jsonEl = document.getElementById('json-input');

            if (molEl) molEl.value = state.molVal || '';
            if (morphEl) morphEl.value = state.morphVal || '';
            if (jsonEl) jsonEl.value = state.jsonVal || '';

            // 2. クラスタリング条件セレクトボックスの復元
            if (state.dataDirection && document.getElementById('data-direction')) {
                document.getElementById('data-direction').value = state.dataDirection;
            }
            if (state.distType && document.getElementById('dist-type')) {
                document.getElementById('dist-type').value = state.distType;
                                                          etEle                     ) {
                document.getElementById('link-type').value = state.linkType;
            }

            // 3. CSV判定連動�            // 3. CSV判定連動�            // 3. CSV判�(state.morphVal) {
                const val = state.morphVal.trim();
                                                                 (') && val.includes(',');
                ['data-direction', 'dist-type', 'link-type'].forEach(id => {
                    const el = doc                    const el = doc                el) el.disabled = !isCSV;
                });
            }

            // 4. 解析実�            // 4. 解析実�            // 4. 解析実�            // 4mentById('            // 4. 解析実�            // 4. 解析実�            // 4. 解 molEl && molEl.value.trim().length > 0;
                const hasMorph = (morphEl && morphEl.value.trim().length > 0) || (jsonEl && jsonEl.value.trim().length > 0);
                runBtn.disabled = !(hasMol && hasMorph);
            }

            // 5. 解析実行済みだった場合は、即座に runIntegration() を呼び出し完全再描画
            if (state.isExecuted && typeof runIntegration === 'function') {
                requestAnimationFrame((                requestAnimationFrame(ion();
                    if (typeof showToast === 'function') {
                        showToast('前                        showToast('前                        showT             }
                });
            }
        } catch (e) {
            console.warn('[AutoSave] App10 restore failed:', e);
        }
    }

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') saveApp10Session();
    });
    window.addEventListener('pagehide', saveApp10Session);

    // 画面遷移・復帰時の発�    // 画面遷移・復帰時の発�    // 画面遷移・復帰時の発�    // 画面遷移・復帰時の    window.addE    // 画面遷移・復帰時の発�   imeout(restoreApp10Session, 120);
    });

    const origConfirm = window.confirmDataReset;
    if (typeof origConfirm === 'function') {
        window.confirmDataReset = function() {
            sessionStorage.removeItem(AUTOSAVE_KEY);
            origConfirm();
        };
    }
})();
</script>"""

    new_content = content[:start_idx] + new_block + content[end_idx:]
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Successfully replace    
