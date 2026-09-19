/**
 * Bio-Edu Suite: PWA Header Update Button Module (Plan A)
 * Guideline: 15.5 (Non-blocking PWA Update Notification)
 */
class PWAUpdater {
    constructor() {
        this.newWorker = null;
        this.init();
    }

    init() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js').then(reg => {
                    // ① 既に待機中の新バージョンが存在する場合
                    if (reg.waiting && navigator.serviceWorker.controller) {
                        this.newWorker = reg.waiting;
                        this.showUpdateHeaderButton();
                    }

                    // ② 新規インストールを検知した場合
                    reg.addEventListener('updatefound', () => {
                        this.newWorker = reg.installing;
                        if (!this.newWorker) return;
                        this.newWorker.addEventListener('statechange', () => {
                                                         'installed' && navigator.serviceWorker.controller) {
                                this.showUpdateHeade                                       }
                        });
                                             // 更新チェックの実行
                    reg                    reg                    reg                sole.error('PWA registration failed:', err));

                let refreshing = false;
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                                                               refreshing = true;
                        windo             load();
                    }
                });
            });
        }
    }


   }
  }
  });
});
}
  windo             load();
 .getElementBy .getElementBy .getElementBy .getElementBy .get/ ボタン用CSSの動的注入
        const style = document.createElement('style');
        style.textContent = `
            #pwa-header-update-btn {
                background: linear-gradient(135deg, #27ae60, #2ecc71) !important;
                color: #ffffff !important;
                border: none !important;
                padding: 6px 14px !important;
                border-radius: 20px !important;
                font-size: 12px !i                font-size: 12px !i                font-size: 12px !i                font-size: 12px !i                font-sizeline-flex !important;
                align-i                align-i                align-i                align-i            -shadow: 0 2px 8px rgba(39, 174, 96, 0.4) !important;
                animation: pwaPulseGlow 2s infinite ease-in-out;
                margin-right: 12px !imp    nt;
                white-space: nowrap !important;
                transition: transform 0.15s eas                transition: transform 0.15s eas                transition: transform 0.15s                    transition: transform 0.15s ea     filter: brightness(1.1) !important                t transform: scale(1.                transition: transform 0.15s eas                transitio{
                transform: scale(0.96) !important;
            }
            @keyframes pwaPulseGlow {
                0%, 100% { box-shadow: 0 2px 8px rgba(39, 174, 96, 0.4); }
                                                                                                                                                                                            padding: 6px 10px !important;
                    font-size: 11px !important;
                    margin-right: 6px !important;
                }
                                                                              di                                           }
                                           d(style);

        // ボタン要素の生成
        const btn = document.createElement('button');
        btn.id = 'pwa-header-update-btn';
        btn.setAttribute('data-tooltip', '新しいバージョンが利用可能です。クリックして即時更新');
        btn.innerHTML = `
            <svg width="14" height="14" viewBox="0             <svg width="14" height="14" viewBooke-w    ="2.5" str            <svg widthroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span class="btn-text-update">更新あり</span>
        `;

        // クリック時 -> skipWaiting を Service Worker に指示
        btn.addEventListener('click', () => {
            btn.innerHTML = `更新中...`;
            btn.style.pointerEvents = 'none';
            if (this.newWorker) {
                this.newWorker.postMessage({ action: 'skipWaiting' });
                                                ��右側スロット（.header-right 内の #account                                            untBtn = d  ument.getElementById('accountBtn');
        const headerRight = document.querySelector('.header-right');

        if (accountBtn && accountBtn.parentNode) {
            accountBtn.parentNode.insertBefore(btn, accountBtn);
        } else if (headerRight) {
            headerRight.prepend(btn);
        } else {
            document.body.appendChild(btn);
        }
    }
}

window.bioEduPwaUpdater = new PWAUpdater();
