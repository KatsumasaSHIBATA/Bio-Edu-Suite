/**
 * Bio-Edu Suite: Session-Persistent Workspace Engine (v35.1)
 * 画面遷移やタブの行き来でも入力・編集状態を完全維持し、ウィンドウ閉鎖または明示的初期化時のみ破棄する。
 * UIへの介入・要素追加は一切行わない。
 */
(() => {
  'use strict';

  // 1. ページ固有キーの決定
  const pageId = location.pathname.split('/').pop().replace(/\.html$/, '') || 'dashboard';
  const STORAGE_KEY = `bio_edu_workspace_${pageId}`;
  let isHydrating = false;
  let saveTimer = null;

  // 2. セレクタ生成ヘルパー（id優先、なければ属性ベース）
  function getElementKey(el, index) {
    if (el.id) return `#${el.id}`;
    if (el.name) return `[name="${el.name}"]`;
    return `${el.tagName.toLowerCase()}_${index}`;
  }

  // 3. 作業空間ステートの抽出と保存
  function collectAndSaveState() {
    if (isHydrating) return;

    try {
      const state = {
        inputs: {},
        textareas: {},
        selects: {},
        timestamp: Date.now()
      };

      // input要素の収集
      const inputs = document.querySelectorAll('input:not([type="button"]):not([type="submit"]):not([type="reset"])');
      inputs.forEach((el, idx) => {
        const key = getElementKey(el, idx);
        if (el.type === 'checkbox' || el.type === 'radio') {
          state.inputs[key] = { checked: el.checked };
        } else {
          state.inputs[key] = { value: el.value };
        }
      });

      // textarea要素の収集（塩基配列、アミノ酸配列、FASTA等）
      const textareas = document.querySelectorAll('textarea');
      textareas.forEach((el, idx) => {
        const key = getElementKey(el, idx);
        state.textareas[key] = { value: el.value };
      });

      // select要素の収集
      const selects = document.querySelectorAll('select');
      selects.forEach((el, idx) => {
        const key = getElementKey(el, idx);
        state.selects[key] = { value: el.value, selectedIndex: el.selectedIndex };
      });

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('[SessionWorkspace] Save skipped or quota exceeded:', err);
    }
  }

  // デバウンス付き保存ハンドラ
  function debouncedSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(collectAndSaveState, 150);
  }

  // 4. ハイドレーション（ステート復元と再描画トリガー）
  function restoreState() {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const state = JSON.parse(raw);
      isHydrating = true;

      // input要素の復元
      const inputs = document.querySelectorAll('input:not([type="button"]):not([type="submit"]):not([type="reset"])');
      inputs.forEach((el, idx) => {
        const key = getElementKey(el, idx);
        if (state.inputs && state.inputs[key] !== undefined) {
          const item = state.inputs[key];
          if (el.type === 'checkbox' || el.type === 'radio') {
            if (el.checked !== item.checked) {
              el.checked = item.checked;
              el.dispatchEvent(new Event('change', { bubbles: true }));
            }
          } else {
            if (el.value !== item.value) {
              el.value = item.value;
              el.dispatchEvent(new Event('input', { bubbles: true }));
              el.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
        }
      });

      // textarea要素の復元
      const textareas = document.querySelectorAll('textarea');
      textareas.forEach((el, idx) => {
        const key = getElementKey(el, idx);
        if (state.textareas && state.textareas[key] !== undefined) {
          const item = state.textareas[key];
          if (el.value !== item.value) {
            el.value = item.value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      });

      // select要素の復元
      const selects = document.querySelectorAll('select');
      selects.forEach((el, idx) => {
        const key = getElementKey(el, idx);
        if (state.selects && state.selects[key] !== undefined) {
          const item = state.selects[key];
          if (el.value !== item.value) {
            el.value = item.value;
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      });
    } catch (err) {
      console.error('[SessionWorkspace] Restoration failed:', err);
    } finally {
      isHydrating = false;
    }
  }

  // 5. 初期化操作の監視（パージ）
  function setupResetListener() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('button, a, [role="button"]');
      if (!target) return;

      const text = (target.textContent || '').trim();
      const id = target.id || '';
      const className = target.className || '';

      // グローバル・ドロワーの初期化、または画面内の初期化・クリアボタンの検知
      const isResetAction = 
        text.includes('データを初期化') || 
        text.includes('初期化') || 
        text.includes('クリア') || 
        text.includes('リセット') ||
        id.includes('reset') || id.includes('clear') ||
        className.includes('reset') || className.includes('clear');

      if (isResetAction) {
        if (text.includes('データを初期化') || id.includes('global-reset')) {
          // 全ワークスペース初期化
          Object.keys(sessionStorage).forEach((k) => {
            if (k.startsWith('bio_edu_workspace_')) {
              sessionStorage.removeItem(k);
            }
          });
        } else {
          // 個別アプリ初期化
          sessionStorage.removeItem(STORAGE_KEY);
        }
      }
    }, true);
  }

  // 6. ライフサイクル結合
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      restoreState();
      setupResetListener();
    });
  } else {
    restoreState();
    setupResetListener();
  }

  document.addEventListener('input', debouncedSave, { passive: true });
  document.addEventListener('change', debouncedSave, { passive: true });
  window.addEventListener('pagehide', collectAndSaveState);
  window.addEventListener('beforeunload', collectAndSaveState);
})();