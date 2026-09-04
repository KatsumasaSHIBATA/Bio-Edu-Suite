/* js/session_workspace.js - Bio-Edu Suite Session Workspace Runtime */
(function() {
    const APP_ID = window.location.pathname.split('/').pop() || 'index.html';
    const KEY_PREFIX = 'bio_edu_ws_' + APP_ID;

    // 1. 各アプリごとの個別ステート保存/復元フック
    window.BioEduWorkspace = {
        save: function(key, data) {
            try {
                sessionStorage.setItem(KEY_PREFIX + '_' + key, JSON.stringify(data));
            } catch (e) {
                console.warn('[Workspace] Session save failed:', e);
            }
        },
        load: function(key) {
            try {
                const item = sessionStorage.getItem(KEY_PREFIX + '_' + key);
                return item ? JSON.parse(item) : null;
            } catch (e) {
                return null;
            }
        },
        clear: function() {
            Object.keys(sessionStorage).forEach(k => {
                if (k.startsWith(KEY_PREFIX)) {
                    sessionStorage.removeItem(k);
                }
            });
        }
    };

    // 2. アプリ④ Sanger Trace Editor 固有の自動復元 (IndexedDB/SessionStorage連携)
    if (APP_ID.includes('4_Sanger_Trace_Editor')) {
        window.addEventListener('beforeunload', () => {
            if (window.ab1Data && window.currentFileName) {
                // 配列キュレーション状態とファイル名を退避
                window.BioEduWorkspace.save('trace_state', {
                    fileName: window.currentFileName,
                    bases: window.ab1Data.bases,
                    traceLength: window.ab1Data.traceLength
                });
            }
        });
    }

    // 3. 全アプリ共通：DOMテキストエリア & 入力要素の自律保護
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            const inputs = document.querySelectorAll('textarea, input[type="text"], input[type="number"], select');
            const snap = {};
            inputs.forEach(el => {
                if (el.id && !el.closest('#confirmModal') && !el.closest('#accountModal')) {
                    snap[el.id] = el.value;
                }
            });
            window.BioEduWorkspace.save('dom_inputs', snap);
        }
    });

    window.addEventListener('DOMContentLoaded', () => {
        const snap = window.BioEduWorkspace.load('dom_inputs');
        if (snap) {
            Object.keys(snap).forEach(id => {
                const el = document.getElementById(id);
                if (el && (!el.value || el.value.trim() === '')) {
                    el.value = snap[id];
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
        }
    });

    // 初期化モーダル実行時にワークスペースも一括消去
    const origConfirm = window.confirmDataReset;
    if (typeof origConfirm === 'function') {
        window.confirmDataReset = function() {
            window.BioEduWorkspace.clear();
            origConfirm();
        };
    }
})();
