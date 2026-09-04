/* js/session_workspace.js - Bio-Edu Suite Session Workspace Runtime (v35.2) */
(function() {
    const PATH = window.location.pathname;
    const APP_FILE = PATH.split('/').pop() || 'index.html';
    const KEY_PREFIX = 'bio_edu_ws_' + APP_FILE;

    // --- 1. 共通セッションストレージAPI ---
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
                if (k.startsWith('bio_edu_ws_')) {
                    sessionStorage.removeItem(k);
                }
            });
        }
    };

    // --- 2. アプリ④ Sanger Trace Editor 専用の波形・キュレーション完全永続化 ---
    if (APP_FILE.includes('4_Sanger_Trace_Editor')) {
        function saveApp4Workspace() {
            try {
                if (window.ab1Data && window.currentFileName) {
                    const serializedTraces = {};
                    if (window.ab1Data.traces) {
                        ['A', 'T', 'G', 'C'].forEach(base => {
                            if (window.ab1Data.traces[base]) {
                                serializedTraces[base] = Array.from(window.ab1Data.traces[base]);
                            }
                        });
                    }

                    const payload = {
                        savedAt: Date.now(),
                        currentFileName: window.currentFileName,
                        scaleX: document.getElementById('scaleX') ? document.getElementById('scaleX').value : "1.0",
                        scaleY: document.getElementById('scaleY') ? document.getElementById('scaleY').value : "1.5",
                        ab1Data: {
                            bases: window.ab1Data.bases,
                            traces: serializedTraces,
                            maxVal: window.ab1Data.maxVal,
                            traceLength: window.ab1Data.traceLength
                        },
                        currentQueueIndex: typeof window.currentQueueIndex !== 'undefined' ? window.currentQueueIndex : 0
                    };

                    window.BioEduWorkspace.save('app4_state', payload);
                }
            } catch (e) {
                console.warn('[Workspace] App4 save failed:', e);
            }
        }
        function restoreApp4Workspace() {
            try {
                const saved = window.BioEduWorkspace.load('app4_state');
                if (!saved || !saved.ab1Data) return;
                if (window.ab1Data) return; // 既に新規ファイル読込済みの場合はスキップ

                window.currentFileName = saved.currentFileName;
                
                const restoredTraces = {};
                if (saved.ab1Data.traces) {
                    ['A', 'T', 'G', 'C'].forEach(base => {
                        if (saved.ab1Data.traces[base]) {
                            restoredTraces[base] = new Int16Array(saved.ab1Data.traces[base]);
                        }
                    });
                }

                window.ab1Data = {
                    bases: saved.ab1Data.bases,
                    traces: restoredTraces,
                    maxVal: saved.ab1Data.maxVal,
                    traceLength: saved.ab1Data.traceLength
                };

                const scaleXEl = document.getElementById('scaleX');
                const scaleYEl = document.getElementById('scaleY');
                if (scaleXEl) { scaleXEl.value = saved.scaleX; scaleXEl.disabled = false; }
                if (scaleYEl) { scaleYEl.value = saved.scaleY; scaleYEl.disabled = false; }

                const searchInput = document.getElementById('searchInput');
                const btnQC = document.getElementById('btnQC');
                const btnExport = document.getElementById('btnExport');
                const btnCopyFasta = document.getElementById('btnCopyFasta');

                if (searchInput) searchInput.disabled = false;
                if (btnQC) btnQC.disabled = false;
                if (btnExport) btnExport.disabled = false;
                if (btnCopyFasta) btnCopyFasta.disabled = false;

                const statusText = document.getElementById('statusText');
                const fileInfoText = document.getElementById('fileInfoText');
                if (statusText) statusText.innerText = "ステータス: 前回の作業状態を復元しました。波形を確認して修正してください。";
                if (fileInfoText) fileInfoText.innerText = `File: ${window.currentFileName}`;

                window.historyStack = [JSON.stringify(window.ab1Data.bases)];
                window.historyIndex = 0;
                window.selectedBaseIndex = -1;
                window.dragStartIndex = -1;
                window.dragEndIndex = -1;

                if (typeof window.redrawAll === 'function') {
                    window.redrawAll();
                }
                if (typeof window.showToast === 'function') {
                    window.showToast("前回の波形データを復元しました", "info");
                }
            } catch (e) {
                console.warn('[Workspace] App4 restore failed:', e);
            }
        }

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') saveApp4Workspace();
        });
        window.addEventListener('pagehide', saveApp4Workspace);

        window.addEventListener('DOMContentLoaded', () => {
            setTimeout(restoreApp4Workspace, 100);
        });
    }



    // --- 3. アプリ⑦ Virtual BLAST Explorer 専用のローカルDB自動永続化 ---
    if (APP_FILE.includes('7_Virtual_BLAST_Explorer')) {
        function saveApp7Workspace() {
            try {
                if (Array.isArray(window.localDB) && window.localDB.length > 0) {
                    window.BioEduWorkspace.save('app7_local_db', {
                        db: window.localDB,
                        infoText: document.getElementById('currentLoadedDataInfo') ? document.getElementById('currentLoadedDataInfo').innerText : ""
                    });
                }
            } catch (e) {
                console.warn('[Workspace] App7 save failed:', e);
            }
        }

        function restoreApp7Workspace() {
            try {
                const saved = window.BioEduWorkspace.load('app7_local_db');
                if (!saved || !Array.isArray(saved.db) || saved.db.length === 0) return;
                if (Array.isArray(window.localDB) && window.localDB.length > 0) return;

                window.localDB = saved.db;
                if (typeof window.updateDBCount === 'function') window.updateDBCount();
                const infoEl = document.getElementById('currentLoadedDataInfo');
                if (infoEl && saved.infoText) infoEl.innerText = saved.infoText;
            } catch (e) {
                console.warn('[Workspace] App7 restore failed:', e);
            }
        }

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') saveApp7Workspace();
        });
        window.addEventListener('pagehide', saveApp7Workspace);

        window.addEventListener('DOMContentLoaded', () => {
            setTimeout(restoreApp7Workspace, 100);
        });
    }

    // --- 4. 全アプリ共通：標準フォーム要素（textarea / input）の自律保護 ---
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            const inputs = document.querySelectorAll('textarea, input[type="text"], input[type="number"], select');
            const snap = {};
            inputs.forEach(el => {
                if (el.id && !el.closest('#confirmModal') && !el.closest('#accountModal') && el.id !== 'pdbId') {
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

        // 初期化ボタンが押された時のみセッションストレージを完全破棄
        const confirmOkBtn = document.getElementById('confirmOkBtn');
        if (confirmOkBtn) {
            confirmOkBtn.addEventListener('click', () => {
                window.BioEduWorkspace.clear();
            });
        }
    });
})();