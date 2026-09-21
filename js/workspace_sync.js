// js/workspace_sync.js
// Bio-Edu Suite: Session-Persistent Workspace Standard (v36.4 準拠)
// 全アプリ共通の作業状態永続化・自動ハイドレーション機構

(function() {
    // 1. キーの動的生成
    const APP_ID = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    const STORE_KEY = 'bio_edu_workspace_' + APP_ID;
    
    let saveTimeout;
    
    // 2. 状態収集関数
    function collectState() {
        const state = {};
        document.querySelectorAll('input, select, textarea').forEach(el => {
            if (!el.id && !el.name) return; // id/nameがない要素は除外
            // セキュリティおよび構造的に保存不要なものを除外
            if (['password', 'file', 'submit', 'button'].includes(el.type)) return;
            
            const key = el.id || el.name;
            if (el.type === 'checkbox' || el.type === 'radio') {
                state[key] = el.checked;
            } else {
                state[key] = el.value;
            }
        });
        return state;
    }

    // 3. デバウンス付き保存（入力中）
    function saveWorkspace() {
        if (window.isResetting) return;
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            sessionStorage.setItem(STORE_KEY, JSON.stringify(collectState()));
        }, 150);
    }

    // 4. 瞬間保存（離脱時）
    function instantSave() {
        if (window.isResetting) return;
        sessionStorage.setItem(STORE_KEY, JSON.stringify(collectState()));
    }

    // 5. ハイドレーション（復元）
    function restoreWorkspace() {
        const stored = sessionStorage.getItem(STORE_KEY);
        if (!stored) return;
        
        window.isHydrating = true;
        try {
            const state = JSON.parse(stored);
            Object.keys(state).forEach(key => {
                const el = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
                if (el) {
                    if (el.type === 'checkbox' || el.type === 'radio') {
                        el.checked = state[key];
                    } else {
                        el.value = state[key];
                    }
                }
            });
            // 復元後、D3.js等の描画関数をキックするためのカスタムイベントをディスパッチ
            window.dispatchEvent(new CustomEvent('bio_edu_workspace_restored', { detail: state }));
        } catch (e) {
            console.error("Workspace restore error:", e);
        }
        window.isHydrating = false;
    }

    // 6. ライフサイクルイベントの監視
    document.addEventListener('input', saveWorkspace);
    document.addEventListener('change', saveWorkspace);
    
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') instantSave();
    });
    window.addEventListener('pagehide', instantSave);
    
    document.addEventListener('DOMContentLoaded', restoreWorkspace);
    
    // BFCache (戻る/進む) 対策
    window.addEventListener('pageshow', (e) => {
        if (e.persisted) restoreWorkspace();
    });

    // 7. 初期化処理時の物理遮断（Anti-Rollback / パージ対応）
    // 既存の confirmDataReset などのリセット関数が呼ばれた際に連動してセッションもパージする
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.sidebar-action-btn.danger');
        if(btn && btn.textContent.includes('データを初期化')) {
            window.isResetting = true;
            // 一時的にStorageへの書き込みを無力化してレースコンディションを防ぐ
            Storage.prototype.setItem = function() {}; 
            sessionStorage.removeItem(STORE_KEY);
        }
    });
})();
