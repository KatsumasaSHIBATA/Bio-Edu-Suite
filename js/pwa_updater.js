/**
 * Bio-Edu Suite: PWA Header Update Button Module (Chrome Style)
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
                    if (reg.waiting && navigator.serviceWorker.controller) {
                        this.newWorker = reg.waiting;
                        this.showUpdateHeaderButton();
                    }

                    reg.addEventListener('updatefound', () => {
                        this.newWorker = reg.installing;
                        if (!this.newWorker) return;
                        this.newWorker.addEventListener('statechange', () => {
                            if (this.newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                this.showUpdateHeaderButton();
                            }
                        });
                    });

                    reg.update().catch(() => {});
                }).catch(err => console.error('PWA registration failed:', err));

                let refreshing = false;
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    if (!refreshing) {
                        refreshing = true;
                        window.location.reload();
                    }
                });
            });
        }
    }

    showUpdateHeaderButton() {
        if (document.getElementById('pwa-header-update-btn')) return;

        const style = document.createElement('style');
        style.textContent = `
            #pwa-header-update-btn {
                background-color: #1abc9c !important;
                color: #ffffff !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                padding: 6px 14px !important;
                border-radius: 20px !important;
                font-size: 12px !important;
                font-weight: bold !important;
                cursor: pointer !important;
                display: inline-flex !important;
                align-items: center !important;
                gap: 6px !important;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
                animation: pwaChromePulse 2.5s infinite ease-in-out;
                margin-right: 12px !important;
                white-space: nowrap !important;
                transition: transform 0.15s ease, filter 0.2s ease !important;
                vertical-align: middle;
            }
            #pwa-header-update-btn:hover {
                filter: brightness(1.1) !important;
                transform: scale(1.02) !important;
            }
            #pwa-header-update-btn:active {
                transform: scale(0.97) !important;
            }
            @keyframes pwaChromePulse {
                0%, 100% { box-shadow: 0 2px 8px rgba(26, 188, 156, 0.3); }
                50% { box-shadow: 0 2px 14px rgba(26, 188, 156, 0.7); }
            }
            @media (max-width: 768px) {
                #pwa-header-update-btn {
                    padding: 5px 10px !important;
                    font-size: 11px !important;
                    margin-right: 6px !important;
                }
                #pwa-header-update-btn .btn-text-chrome {
                    display: none;
                }
            }
        `;
        document.head.appendChild(style);

        const btn = document.createElement('button');
        btn.id = 'pwa-header-update-btn';
        btn.setAttribute('data-tooltip', '新しいバージョンが利用可能です。クリックして即時更新');
        btn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span class="btn-text-chrome">新しいバージョンをご利用いただけます</span>
        `;

        btn.addEventListener('click', () => {
            btn.innerHTML = `更新中...`;
            btn.style.pointerEvents = 'none';
            if (this.newWorker) {
                this.newWorker.postMessage({ action: 'skipWaiting' });
            }
        });

        const accountBtn = document.getElementById('accountBtn');
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
