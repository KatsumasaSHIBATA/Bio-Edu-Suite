import os
import re

def fix_html_files():
    html_files = []
    for root, dirs, files in os.walk('.'):
        if 'node_modules' in root: continue
        for file in files:
            if file.endswith('.html'):
                html_files.append(os.path.join(root, file))

    icon_rep = '''<svg id="accountUserIcon" class="account-user-icon" viewBox="0 0 24 24" style="width: 12px; height: 12px; flex-shrink: 0; margin-right: 2px;">
  <circle cx="12" cy="12" r="8" fill="currentColor"></circle>
</svg>'''

    mod_rep = '''<script type="module">
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
    window.handleRegisterPreset = function(taskCode, payload) {
        registerMasterPreset(taskCode, payload);
    };
</script>'''

    for filepath in html_files:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        orig = content
        content = re.sub(r'<svg[^>]*id="accountUserIcon"[^>]*>.*?</svg>', icon_rep, content, flags=re.DOTALL)
        content = re.sub(r'(<span[^>]*id="accountStatusText"[^>]*>).*?(</span>)', r'\1未接続（ローカル）\2', content, flags=re.DOTALL)
        
        # mod_rep
        if '<script type="module">' in content:
            content = re.sub(r'<script type="module">.*?</script>', mod_rep, content, flags=re.DOTALL)
            
        # background color
        content = re.sub(r'background:\s*rgba\(0,\s*0,\s*0,\s*0\.5\)', 'background: rgba(0, 0, 0, 0.6)', content)

        if content != orig:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {filepath}")

if __name__ == '__main__':
    fix_html_files()
