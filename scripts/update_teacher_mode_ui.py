import os
import re
import glob

html_files = glob.glob('*.html')

TEACHER_SECTION = """
        <!-- 教員専用：マスター課題データ発行パネル（isTeacher時のみ動的表示） -->
        <div id="teacherPresetSection" style="display: none; border-top: 1px dashed var(--border-color); padding-top: 12px; margin-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
            <span style="font-size: 12px; font-weight: bold; color: #d35400;">👑 教員専用：現在の画面を課題として発行</span>
          </div>
          <p style="font-size: 11px; color: var(--text-muted); margin: 0 0 8px 0; line-height: 1.4;">
            現在の画面の入力データを、生徒が一括インポートできる課題コードとしてクラウドに登録します。
          </p>
          <div style="display: flex; gap: 6px;">
            <input type="text" id="newMasterTaskCodeInput" class="primer-input" placeholder="新課題コード (例: TASK-01)" style="flex: 1; text-transform: uppercase;">
            <button class="btn btn-primary" style="font-size: 11px; padding: 6px 12px; white-space: nowrap; background: #e67e22; border-color: #d35400;" onclick="window.handleRegisterCurrentPreset(); triggerHapticFeedback();">登録・発行</button>
          </div>
        </div>
"""

SCRIPT_REPLACEMENT = """<script type="module">
    import { joinRoom, leaveRoom, importMasterPreset, registerMasterPreset } from './auth_sync.js';
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
    window.handleRegisterCurrentPreset = function() {
        const tEl = document.getElementById('newMasterTaskCodeInput');
        const t = tEl ? tEl.value.trim() : '';
        if (!t) {
            if (typeof showToast === 'function') showToast('発行する課題コードを入力してください', 'warning');
            return;
        }
        // 現在の画面のテキストエリアおよびセッションデータを収集
        const activeTextarea = document.querySelector('textarea.paste-area, textarea#dnaInput, textarea#fastaInput, textarea#chain-code-input, textarea#pasteArea');
        const seq = activeTextarea ? activeTextarea.value.trim() : '';
        const sessionSnap = {};
        for (let i = 0; i < sessionStorage.length; i++) {
            const k = sessionStorage.key(i);
            if (k) sessionSnap[k] = sessionStorage.getItem(k);
        }
        const payload = {
            sequence: seq,
            sessionData: sessionSnap,
            appName: document.title,
            registeredAt: Date.now()
        };
        registerMasterPreset(t, payload);
    };
</script>"""

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    modified = False

    # Insert teacherPresetSection if not exists
    if 'id="teacherPresetSection"' not in content:
        pattern = re.compile(r'(<button class="btn btn-secondary"[^>]*>[\s\n]*ルームから退出（切断）[\s\n]*</button>)', re.IGNORECASE)
        content, n = pattern.subn(TEACHER_SECTION + r'\1', content)
        if n == 0:
            print(f"Failed to find leave button in {file}")
        else:
            modified = True

    # Replace the <script type="module"> block containing auth_sync.js
    script_pattern = re.compile(r'<script type="module">\s*import\s+\{\s*joinRoom[^}]*\}\s+from\s+[\'"]\./auth_sync\.js[\'"];[\s\S]*?</script>', re.IGNORECASE)
    content, n = script_pattern.subn(SCRIPT_REPLACEMENT, content)
    if n == 0:
        print(f"Failed to find script module in {file}")
    else:
        modified = True

    if modified:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file}")

print("Done")