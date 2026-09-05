import sys

file_path = "10_integrative_taxonomy_studio.html"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

start_marker = "<!-- 入力データの一時保存（sessionStorage） v34.3.8 -->"
start_idx = content.find(start_marker)

if start_idx == -1:
    print("Start marker not found.")
    sys.exit(1)

end_marker = "</script>"
end_idx = content.find(end_marker, start_idx)

if end_idx == -1:
    print("End marker not found.")
    sys.exit(1)

end_idx += len(end_marker)

new_block = """<!-- セッション永続化仕様：統合検証ステート・タングルグラム・PCA完全復元 (v35.4) -->
<script>
(function () {
    /* ===================================================================
       【セッション永続化仕様】アプリ⑩ 統合検証ステート・描画完全復元 (v35.4)
       DOM消滅に依存しない実行判定により、タングルグラム・PCA散布図・モーフィングを完全再現
       ==       ==       ==       ==       ================       ==       ==       ==       ==       ='bio_e       ==       ==       ==       ==      eApp10Session() {
        try {
            const molEl = document.getElementById('newick-mol-input');
            co            co           tElementById('hybrid-morph-input');
            const jsonEl = document.getElementById('j            const                    const jsonEl = document.getEl) : '';
            const morphVal = morphEl ? morphEl.value.trim() : '';
            const jsonVal = js            const jsonVal = js            const jsonVal = js            const jsonVal = js            const jsonVal = js          �め、
               実               実               実               実             �� globalTreeRoot の存在で確実に判定する
            const hasSvg = !!document.querySelector('#tree-svg-container svg');
            const isExecuted = hasSvg || (typeof globalTreeRoot !== 'undefined' && globalTreeRoot !== null && globalT            const isExecuted = hasSvg || (typeof globalTreeRoot !== 'undefined' && globalTreeRoot !== null && globalT            const isExecuted = hasSvg || (type     return;
                                                                        .now()                                                                 Val,
                                                                                                                      getElementById('data-direction').value : 'col',
                distType: document.getElementById('dist-type') ? document.getElementById('dist-type').value : 'euclidean',
                linkType: document.getElementById('link-type') ? document.get                linkType: document.getElementById('link-type') ? document.get                linkType: document.getElementById('linAUTOSAVE_KEY, JSON.stringify(state));
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

            // 1. 各            // 1. 各            // 1. 各            // 1. 各            // 1. 各            // 1. 各            // 1. 各         tElementById('hybrid-morph-input');
            const jsonEl = document.getElementById('json-input');

            if (molEl) molEl.value = state.molVal || '';
            if (mor            if (mor            if (mor            if (mor            if (mor            if (mor            if (mor   // 2.             if (mor            if (mor            if (mor            if (mor            if (mor            if (mor            if (mor   // 2.             if (mor            if (mor            if (mor            if (mor            if (mor       }
            if (state.distType && document.getElementById('dist-type')) {
                document.ge                document.ge     = sta   distType;
            }
            if (state.linkType && document.getElementById('link-type')) {
                                       ('link-type').value = state.linkType;
                                                                                                                                                                                                                                                                .includ                                                  type', 'link-type'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.disabled = !isCSV;
                });
            }

            // 4. 解析実行ボタンの活性状態更新
            const runBtn = document.getElementById('run-analysis-btn-10');
            if (runBtn) {
                const hasMol = molEl && molEl.value.                const hasMol = molEl && molEl.value.            morphEl.va                const hasMol = molEl && molEl.value.                cons              runBtn.disabled = !(hasMol && hasMorph);
            }

            // 5. 解�            // 5. 解�            // 5. 解�            // 5. 解恳出し完全再描画
            if (state.isExecuted && typeof runIntegration === 'function') {
                requestAnimationFrame(() => {
                    runIntegration();
                    if (typeof showToast === 'function') {
                        showToast('前回の統合解析データを復元しました', 'info');
                                                                   atch (e) {
            console.warn('[AutoSave] App10 restor    iled:', e);
        }
    }

                                                , () => {
        if (document.visibilityState === 'hidden') saveApp10Session();
    });
    window.addEventListener('pagehide', saveApp10Session);

    // 画面遷移・復帰時の発火保証
    window.addEventListener('pageshow', () => {
        setTimeout(restoreApp10Session, 60);
    });
    window.addEventListener('load', () => {
        setTimeout(restoreApp10Session, 120);
    });

    const origConfirm = window.confirmDataReset;
    if (typeof origConfirm === 'function') {
        w        w        w        w        w        w        w        w    moveItem(AUTOSAVE_KEY);
            origConfirm();
        };
    }
})();
</script>"""

new_cnew_cnew_cnew_cnew_cnew_cnew_cnew_cnew_cnew_cnew_c[end_idx:new_cnew_cnew_cnew_cnew_cnew_cnew_cnew_cnew_cnew_cnew_c[end_idx:new_cnew_cnew_cnew_cnew_cnessfully replaced.")
