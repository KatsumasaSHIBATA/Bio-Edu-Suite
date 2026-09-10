import os
import re
import glob

NEW_MODAL = """<!-- ルーム接続・同期設定（Kahoot方式）モーダル v35.4 -->
<div class="modal-overlay" id="accountModal">
  <div class="modal-content" style="max-width: 380px;">
    <div class="modal-header">
      <h3 style="margin: 0; font-size: 16px;">ルーム接続・同期設定</h3>
      <button class="modal-close" onclick="closeAccountSettings(); triggerHapticFeedback();" data-tooltip="閉じる">
        <svg class="btn-icon" style="margin:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>
    <div class="modal-body" style="padding: 20px;">

      <!-- ① 未接続ビュー -->
      <div id="modalLoggedOutView">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
          <span style="font-          <span style="font-          <span style="te     ⚪�       ��         �カ          <span style="font-          <span style="font-          <span style="te     ⚪t-          <span style="font-          <span5;"          <span style="font-          <span style="fo室          <span style="fontア�          <span style="font-          <span style="font-          <span style="t
        </p>

        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px;">
          <div>
            <label style="font-size: 11px; font-weight: bold; color: var(--primary); display: block; margin-bottom: 4px;">ルームコード</label>
            <input type="text" id="roomCodeInput" class="primer-input" placeholder="例: B        style="w    : 100%;            <input type="text" id="roomCodeInput" ;">
          </div>
          <div>
            <label style="font-size: 11px; font-weight: bold; color: var(--primary); display: block; margin-bottom: 4px;">参加�            <label style="font-size: 11px; font-weight: bold; color: var(--primary); display: block; margin-bottom: 4px;">参加�            <label style="font-size: 11px; font-weight: bold; color: var(--primary); display: block; margin-bottom: 4px;">参加�            <label style="font-size: 11px; font-weight: bold; color: var(--primary); display: block; margin-bottom: 4px;">参加�            <label style="font��         ��始
        </button>

        <div style="border-top: 1px dashed var(--border-color); padding-top: 12px;">
                                                                                                                                                    ��ー                                                                                                                                                    ��ー              ���             SK-0      yle="flex: 1; text-transform: uppercase;">
            <button class="btn btn-secondary" style="font-size: 11px; padding: 6px 10px; white-space: nowrap;" onclick="window.handleImportPreset(); triggerHapticFeedback();">読込</button>
          </div>
        </div>
      </div>

      <!-- ② 接続中ビュー -->
      <div id="modalLoggedInView" style="display: none;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
          <span id="syncStatusBadge" style="font-size: 14px; font-weight: bold; color: var(--phase-color);">🟢 ルーム同�          <span id="syncStatusBadge" style="font-size: 14px; font-weight: bold; colli          <span id="syncStatusBadge" style="font-size: 14px; font-weight: bold; color: var(--phase-color);">🟢 ルーム同�          <span id="syncStatusBadge" style="font-size: 14px; font-weight: bold; colli          <span id="syncStatusBadge" style="font-size: 14px; font-weight: bold; color: var(--phase-color);">🟢 ルーム同�          <span id="syncStatusBadge" style="font-is          <span id="syncStatusBadge" style="font-size: 14px; font-weight: bold; color: var(--phase-color);">🟢 ルーム同�          <span id="syncStatusBadge" style="font-size: 14p<butto          <spbtn-        y" styl          <00%          <span id="syncStatusBadge": #f5b7b1;" onclick="window.handleLeaveRoom(); triggerHapticFeedback();">
          ルームから退出（切断）
        </button>
      </div>

    </div>
  </div>
</div>"""

NEW_ICON = """<svg id="accountUserIcon" class="account-user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="7" stroke-width="2.5"></circle>
                </svg>"""

NEW_SCRIPT = """import { joinRoom, leaveRoom, importMasterPreset } from './auth_sync.js';
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
    };"""

def process_html_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    modified = False

    # 1. モーダル置換
    start_str = '<div class="modal-overlay" id="accountModal">'
    start_idx = content.find(start_str)
    
    if start_idx != -1:
        end_idx = -1
        div_count = 0
        i = start_idx
        
        while i < len(content):
            if             if             if             if             if    r content[i+4:i+5] == '>            if             if                         if                   if             ith('</div>', i):
                div_count -= 1
                                                  t == 0                                                  t == 0                else:
                i += 1
                
        if end_idx != -1:
            modal_content = content[start_idx:end_idx]
            if 'id="roomCodeInput"' not in modal_content:
                content = content[:start_idx] + NEW_MODAL + content[end_idx:]
                modified = True

    # 2. アイコン置換
    icon_pattern = r'<svg id="accountUserIcon"[^>]*>.*?</svg>'
                           rn                           rn                   丸アイコン(                           rn     �い�   ��                      �                   �                    ��                   ��して統一する
        new_content = re.sub(icon_pattern, NEW_ICON, content, count=1, flags=re.DOTALL)
        if new_content != content:
            content = new_content
            modified = True

    # 3. スクリプト置換
    script_pattern = r"import\s+\{\s*loginWithG    script_pattern = r"import\s+\{\s*loginWithG    script_pattern = r"import\s+\{\s*loginWithG    script_pattern = r"import\s+\{\s*l c    script_pattern = ent = re.sub(script_pattern, NEW_SCRIPT, cont    script_pattern = r"import\s+\{\s*loginWithG    scd:    script_pattern = r"import\s+\{\s*loginWithG    scripf:    script_pattern = r"import\s+\{\s*loginWithG    script_pattern = r"importn glob.glob('*.html'):
    process_html_file(f)
