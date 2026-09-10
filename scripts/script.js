import { joinRoom, leaveRoom, importMasterPreset } from './auth_sync.js';
    window.handleJoinRoom = function() {
        const rEl = document.getElementById('roomCodeInput');
        const pEl = document.getElementById('participantIdInput');
        const r = rEl ? rEl.value.trim() : '';
        const p = pEl ? pEl.value.trim() : '';
        if (!r || !p) {
            if (typeof showToast === 'function') showToast('ルームコードと参加者IDを入力してください', 'warning');
            return;
        }
        joinRoom(r, p);
        if (typeof closeAccountSettings === 'function') closeAccountSettings();
    };
    window.handleLeaveRoom = function() {
        leaveRoom();
        if (typeof closeAccountSettings === 'function') closeAccountSettings();
    };
    window.handleImportPreset = function() {
        const tEl = document.getElementById('masterTaskCodeInput');
        const t = tEl ? tEl.value.trim() : '';
        if (!t) {
            if (typeof showToast === 'function') showToast('課題コードを入力してください', 'warning');
            return;
        }
        importMasterPreset(t);
    };
