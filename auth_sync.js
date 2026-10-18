import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, enableIndexedDbPersistence, doc, setDoc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAFJ8dH4K50MCLAkHgaS6pqdvsTNUzAzHk",
  authDomain: "bio-edu-suite.firebaseapp.com",
  projectId: "bio-edu-suite",
  storageBucket: "bio-edu-suite.firebasestorage.app",
  messagingSenderId: "908113234082",
  appId: "1:908113234082:web:c091f57a7ea365ca70affb",
  measurementId: "G-D3B95LYZDQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

enableIndexedDbPersistence(db).catch((err) => {
  console.warn("オフライン永続化の警告:", err.code);
});

let currentRoomCode = localStorage.getItem('bio_edu_room_code') || "";
let currentParticipantId = localStorage.getItem('bio_edu_participant_id') || "";
let isConnected = !!(currentRoomCode && currentParticipantId);
let isTeacher = currentParticipantId.toUpperCase().startsWith("TEACHER");

// [ガイドライン第2項準拠] 絵文字を完全排除したインラインSVG線画アイコン
const SVG_CLOUD_UPLOAD = `<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path><polyline points="16 16 12 12 8 16"></polyline><line x1="12" y1="12" x2="12" y2="21"></line></svg>`;
const SVG_CLOUD_DOWNLOAD = `<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path><polyline points="8 17 12 21 16 17"></polyline><line x1="12" y1="12" x2="12" y2="21"></line></svg>`;

// [v38.0] モーダル内への手動クラウド保存・復元ボタンの動的配備（インラインSVG搭載・完全冪等）
// [全アプリ共通規格] #accountModal の余白バグ解消＆入力フォントの完全統一 (Segoe UI / Noto Sans JP)
function ensureAccountModalUnifiedStyles() {
  if (document.getElementById("bio_edu_account_modal_unified_styles")) return;
  const style = document.createElement("style");
  style.id = "bio_edu_account_modal_unified_styles";
  style.textContent = `
    #accountModal > .modal-content {
      padding: 0 !important;
      border-radius: 8px !important;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2) !important;
      overflow: hidden !important;
    }
    #accountModal .modal-header {
      padding: 15px 20px !important;
      background: #f8f9f9 !important;
      border-bottom: 1px solid #ecf0f1 !important;
      margin: 0 !important;
    }
    #accountModal .modal-body {
      padding: 20px !important;
    }
    #accountModal input,
    #accountModal .primer-input {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif, 'Noto Sans JP' !important;
      font-size: 13px !important;
      font-weight: 600 !important;
      letter-spacing: 0.5px !important;
      padding: 8px 10px !important;
      border: 1px solid var(--border-color, #bdc3c7) !important;
      border-radius: 4px !important;
      background: #fafafa !important;
      color: var(--text-main, #2c3e50) !important;
      box-sizing: border-box !important;
      outline: none !important;
    }
    #accountModal input:focus,
    #accountModal .primer-input:focus {
      border-color: var(--phase-color, #1abc9c) !important;
      background: #ffffff !important;
      box-shadow: 0 0 0 2px rgba(26, 188, 156, 0.2) !important;
    }
  `;
  document.head.appendChild(style);
}

function ensureManualSyncButtons() {
  const loggedInView = document.getElementById("modalLoggedInView");
  if (!loggedInView || document.getElementById("manualCloudSyncSection")) return;

  const section = document.createElement("div");
  section.id = "manualCloudSyncSection";
  section.style.cssText = "border-top: 1px dashed var(--border-color); padding-top: 12px; margin-bottom: 14px;";
  section.innerHTML = `
    <label style="font-size: 11px; font-weight: bold; color: var(--primary); display: block; margin-bottom: 6px;">手動クラウド同期（セーブ／ロード）</label>
    <div style="display: flex; gap: 8px; width: 100%;">
      <button type="button" id="btnManualCloudSave" class="btn btn-primary" style="flex: 1; font-size: 12px; padding: 8px 10px; justify-content: center; background: #27ae60; border-color: #1e8449; color: #fff;" onclick="window.handleManualCloudSave && window.handleManualCloudSave()">
        ${SVG_CLOUD_UPLOAD}
        <span>クラウドに保存</span>
      </button>
      <button type="button" id="btnManualCloudLoad" class="btn btn-secondary" style="flex: 1; font-size: 12px; padding: 8px 10px; justify-content: center;" onclick="window.handleManualCloudLoad && window.handleManualCloudLoad()">
        ${SVG_CLOUD_DOWNLOAD}
        <span>クラウドから復元</span>
      </button>
    </div>
    <div style="font-size: 10px; color: var(--text-muted); margin-top: 4px; line-height: 1.4;">
      ※アプリ移動時のデータ消失を防ぐため自動通信は停止しています。別端末へ引き継ぐ際やバックアップ時に押してください。
    </div>
  `;

  const teacherSec = document.getElementById("teacherPresetSection");
  if (teacherSec && teacherSec.parentNode === loggedInView) {
    loggedInView.insertBefore(section, teacherSec);
  } else {
    const leaveBtn = loggedInView.querySelector("button:last-of-type");
    if (leaveBtn) loggedInView.insertBefore(section, leaveBtn);
    else loggedInView.appendChild(section);
  }
}

export function renderAuthStatus() {
  ensureAccountModalUnifiedStyles();
  ensureManualSyncButtons();

  const icon = document.getElementById("accountUserIcon");
  const text = document.getElementById("accountStatusText");
  const modalLoggedOut = document.getElementById("modalLoggedOutView");
  const modalLoggedIn = document.getElementById("modalLoggedInView");
  const roomDisplay = document.getElementById("roomDisplay");
  const participantDisplay = document.getElementById("participantDisplay");
  const syncBadge = document.getElementById("syncStatusBadge");
  const syncNote = document.getElementById("syncStatusNote");
  const teacherSection = document.getElementById("teacherPresetSection");

  const isOnline = navigator.onLine;

  if (!isConnected) {
    if (icon) {
      icon.style.color = "#bdc3c7";
      icon.style.fill = "#bdc3c7";
    }
    if (text) {
      text.textContent = "未接続（ローカル）";
      text.style.color = "#bdc3c7";
    }
    if (modalLoggedOut) modalLoggedOut.style.display = "block";
    if (modalLoggedIn) modalLoggedIn.style.display = "none";
    if (teacherSection) teacherSection.style.display = "none";
  } else {
    if (isOnline) {
      if (icon) {
        icon.style.color = isTeacher ? "#f39c12" : "#2ecc71";
        icon.style.fill = isTeacher ? "#f39c12" : "#2ecc71";
      }
      if (text) {
        text.textContent = isTeacher 
          ? `${currentRoomCode} (${currentParticipantId}) [教員]` 
          : `${currentRoomCode} (${currentParticipantId})`;
        text.style.color = isTeacher ? "#f39c12" : "var(--phase-color)";
      }
      if (syncBadge) {
        syncBadge.textContent = isTeacher ? "🟢 教員モード接続中（手動同期）" : "🟢 ルーム接続中（手動同期）";
        syncBadge.style.color = isTeacher ? "#f39c12" : "#2ecc71";
      }
      if (syncNote) syncNote.style.display = "none";
    } else {
      if (icon) {
        icon.style.color = "var(--danger)";
        icon.style.fill = "var(--danger)";
      }
      if (text) {
        text.textContent = "オフライン（ローカル要塞稼働中）";
        text.style.color = "var(--danger)";
      }
      if (syncBadge) {
        syncBadge.textContent = "🔴 オフライン（ローカル保存のみ）";
        syncBadge.style.color = "var(--danger)";
      }
      if (syncNote) syncNote.style.display = "block";
    }

    if (roomDisplay) {
      roomDisplay.textContent = `ルーム: ${currentRoomCode}`;
      roomDisplay.style.display = "block";
    }
    if (participantDisplay) {
      participantDisplay.textContent = `参加者ID: ${currentParticipantId} ${isTeacher ? '（教員権限）' : ''}`;
      participantDisplay.style.display = "block";
    }

    if (teacherSection) {
      teacherSection.style.display = isTeacher ? "block" : "none";
    }

    if (modalLoggedOut) modalLoggedOut.style.display = "none";
    if (modalLoggedIn) modalLoggedIn.style.display = "block";
  }
}

onAuthStateChanged(auth, (user) => {
  if (!user) {
    signInAnonymously(auth).catch((e) => console.warn("匿名認証待機:", e));
  }
  renderAuthStatus();
});

window.addEventListener("offline", renderAuthStatus);
window.addEventListener("online", renderAuthStatus);
document.addEventListener("DOMContentLoaded", renderAuthStatus);

export function joinRoom(roomCode, participantId) {
  if (!roomCode || !participantId) return;
  currentRoomCode = roomCode.toUpperCase().trim();
  currentParticipantId = participantId.trim();
  isConnected = true;
  isTeacher = currentParticipantId.toUpperCase().startsWith("TEACHER");

  localStorage.setItem('bio_edu_room_code', currentRoomCode);
  localStorage.setItem('bio_edu_participant_id', currentParticipantId);

  renderAuthStatus();

  if (typeof showToast === 'function') {
    const roleMsg = isTeacher ? "【教員モード】" : "";
    showToast(`${roleMsg}ルーム「${currentRoomCode}」に接続しました（手動同期モード）`, "success");
  }
}

export function leaveRoom() {
  const oldRoom = currentRoomCode;
  currentRoomCode = "";
  currentParticipantId = "";
  isConnected = false;
  isTeacher = false;

  localStorage.removeItem('bio_edu_room_code');
  localStorage.removeItem('bio_edu_participant_id');

  renderAuthStatus();

  if (typeof showToast === 'function') {
    showToast(`ルーム「${oldRoom}」から退出しました`, "info");
  }
}

function getUtf8ByteSize(str) {
  try {
    return new Blob([str]).size;
  } catch (e) {
    return str ? str.length * 2 : 0;
  }
}

function flushCurrentAppSession() {
  try {
    if (typeof window.saveApp4Session === 'function') window.saveApp4Session();
    if (typeof window.saveApp7Session === 'function') window.saveApp7Session();
    if (typeof window.saveWorkspaceDraft === 'function') window.saveWorkspaceDraft();
    if (typeof window.saveApp8Session === 'function') window.saveApp8Session();
    if (typeof window.saveApp10Session === 'function') window.saveApp10Session();
  } catch (e) {
    console.warn("Flush session warning:", e);
  }
}

function triggerCurrentAppRestore() {
  try {
    if (typeof window.restoreApp4Session === 'function') window.restoreApp4Session(true);
    if (typeof window.restoreApp7Session === 'function') {
      window.restoreApp7Session();
      setTimeout(() => window.restoreApp7Session(), 120);
    }
    if (typeof window.restoreFromAutosave === 'function') window.restoreFromAutosave();
    if (typeof window.restoreApp8Session === 'function') window.restoreApp8Session();
    if (typeof window.restoreApp10Session === 'function') window.restoreApp10Session();
    if (typeof window.loadSamples === 'function' && typeof window.renderSamples === 'function') {
      window.loadSamples();
      window.renderSamples();
    }
  } catch (e) {
    console.warn("Restore trigger warning:", e);
  }
}

function sanitizeSessionMap(rawSessionObj) {
  if (!rawSessionObj || typeof rawSessionObj !== 'object') return {};
  const cleaned = {};
  const allOrigKeys = Object.keys(rawSessionObj).map(k => k.replace(/__dot__/g, '.'));

  const hasApp4 = allOrigKeys.includes('bio_edu_workspace_app4');
  const hasApp5 = allOrigKeys.includes('bio_edu_autosave_app5');
  const hasApp7 = allOrigKeys.includes('bio_edu_autosave_app7_full');
  const hasApp8 = allOrigKeys.includes('bio_edu_autosave_app8_full');
  const hasApp10 = allOrigKeys.includes('bio_edu_autosave_app10_full');

  Object.keys(rawSessionObj).forEach((rawKey) => {
    const origKey = rawKey.replace(/__dot__/g, '.');
    if (origKey === 'bio_edu_just_joined' || origKey === 'bio_edu_last_user_edit') {
      return;
    }

    if (hasApp4 && origKey.includes('4_Sanger_Trace_Editor')) return;
    if (hasApp5 && origKey.includes('5_DNA_Alignment_Studio')) return;
    if (hasApp7 && origKey.includes('7_Virtual_BLAST_Explorer')) return;
    if (hasApp8 && (origKey.includes('8_Phylogenetic_Tree_Builder') || origKey === 'bio_edu_workspace_app8_custom')) return;
    if (hasApp10 && origKey.includes('10_integrative_taxonomy_studio')) return;

    let val = rawSessionObj[rawKey];
    if (typeof val !== 'string') {
      try { val = JSON.stringify(val); } catch (e) { val = ""; }
    }
    if (!val) return;

    if (origKey === 'bio_edu_workspace_app4') {
      try {
        const app4 = JSON.parse(val);
        if (app4 && Array.isArray(app4.queue)) {
          app4.queue = app4.queue.map(item => {
            const copy = { ...item };
            if (copy.editedAb1Data && copy.editedAb1Data.traces && copy.editedAb1Data.bases) {
              copy.data = null;
              copy.savedHistoryStack = [];
              copy.savedHistoryIndex = 0;
            }
            return copy;
          });
          val = JSON.stringify(app4);
        }
      } catch (e) {}
    }
    else if (origKey === 'bio_edu_autosave_app7_full' || (val && val.includes('"localDB"'))) {
      try {
        const app7 = JSON.parse(val);
        if (app7 && typeof app7 === 'object') {
          app7.alignmentHtml = "";
          app7.ncbiLinkHtml = "";
          val = JSON.stringify(app7);
        }
      } catch (e) {}
    }
    else if (origKey.includes('dashboard_samples')) {
      try {
        const arr = JSON.parse(val);
        if (Array.isArray(arr)) {
          const sanitizedArr = arr.map(item => {
            const copy = { ...item };
            if (copy.image_data && typeof copy.image_data === 'string' && copy.image_data.length > 120000) {
              copy.image_data = "";
            }
            return copy;
          });
          val = JSON.stringify(sanitizedArr);
        }
      } catch (e) {}
    }
    else if (val.length > 150000) {
      try {
        const parsed = JSON.parse(val);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          ['uploadedImage', 'image_data', 'image', 'rawData', 'fullCoeffs', 'alignmentHtml'].forEach(prop => {
            if (parsed[prop] && typeof parsed[prop] === 'string' && parsed[prop].length > 100000) {
              parsed[prop] = "";
            }
          });
          val = JSON.stringify(parsed);
        }
      } catch (e) {}
    }

    const safeKey = origKey.replace(/\./g, '__dot__');
    cleaned[safeKey] = val;
  });

  if (getUtf8ByteSize(JSON.stringify(cleaned)) > 850000) {
    const dsKey = 'bio_edu_workspace_dashboard_samples';
    if (cleaned[dsKey]) {
      try {
        const arr = JSON.parse(cleaned[dsKey]);
        if (Array.isArray(arr)) {
          arr.forEach(s => {
            s.image_data = "";
            if (cleaned['bio_edu_workspace_app4'] && Array.isArray(s.traces)) {
              s.traces.forEach(t => { if (t && t.data && t.data.length > 100000) t.data = ""; });
            }}
          );
          cleaned[dsKey] = JSON.stringify(arr);
        }
      } catch (e) {}
    }
  }

  return cleaned;
}

export async function registerMasterPreset(taskCode, payload) {
  if (!taskCode || !payload) return;
  const cleanCode = taskCode.toUpperCase().trim();
  try {
    flushCurrentAppSession();
    const freshSessionSnap = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k) freshSessionSnap[k] = sessionStorage.getItem(k);
    }
    if (!freshSessionSnap['bio_edu_workspace_dashboard_samples']) {
      const lsSamples = localStorage.getItem('bio_edu_samples');
      if (lsSamples && lsSamples !== '[]') {
        freshSessionSnap['bio_edu_workspace_dashboard_samples'] = lsSamples;
      }
    }

    const sanitizedPayload = JSON.parse(JSON.stringify(payload));
    sanitizedPayload.sessionData = sanitizeSessionMap(freshSessionSnap);

    if (sanitizedPayload.samples && sanitizedPayload.sessionData['bio_edu_workspace_dashboard_samples']) {
      delete sanitizedPayload.samples;
    }
    if (sanitizedPayload.traces) {
      delete sanitizedPayload.traces;
    }

    const taskData = {
      taskCode: cleanCode,
      payload: sanitizedPayload,
      creatorRoom: currentRoomCode || "",
      creatorId: currentParticipantId || "",
      createdAt: Date.now()
    };

    const globalDocRef = doc(db, "master_tasks", cleanCode);
    await setDoc(globalDocRef, taskData);

    if (typeof showToast === 'function') {
      showToast(`課題「${cleanCode}」をクラウドに登録・発行しました`, "success");
    }
  } catch (e) {
    console.error("Master task registration error:", e);
    if (typeof showToast === 'function') {
      showToast("課題の登録に失敗しました: " + (e.message || e), "error");
    }
    throw e;
  }
}

function applySessionMapToBrowser(sessionSource, remoteTime) {
  if (!sessionSource || typeof sessionSource !== 'object') return false;
  const merged = mergeLocalImageData({ ...sessionSource });
  const metaSkip = ['taskCode', 'payload', 'creatorRoom', 'creatorId', 'createdAt', 'sequence', 'appName', 'registeredAt'];
  let changed = false;

  Object.keys(merged).forEach((k) => {
    if (metaSkip.includes(k)) return;
    const restoredKey = k.replace(/__dot__/g, '.');
    const val = typeof merged[k] === 'string' ? merged[k] : JSON.stringify(merged[k]);
    if (val !== undefined && val !== null && val !== "") {
      sessionStorage.setItem(restoredKey, val);
      if (restoredKey === 'bio_edu_workspace_dashboard_samples') {
        try { localStorage.setItem('bio_edu_samples', val); } catch (e) {}
      } else if (restoredKey === 'bio_edu_workspace_app4' || restoredKey === 'bio_edu_autosave_app7_full') {
        try { localStorage.setItem(restoredKey + '_backup', val); } catch (e) {}
      }
      changed = true;
    }
  });

  if (sessionStorage.getItem('bio_edu_autosave_app7_full')) {
    sessionStorage.removeItem('bio_edu_workspace_7_Virtual_BLAST_Explorer');
    sessionStorage.removeItem('bio_edu_ws_7_Virtual_BLAST_Explorer.html_dom_inputs');
    sessionStorage.removeItem('bio_edu_draft_7_Virtual_BLAST_Explorer.html');
  }
  if (sessionStorage.getItem('bio_edu_workspace_app4')) {
    sessionStorage.removeItem('bio_edu_workspace_4_Sanger_Trace_Editor');
    sessionStorage.removeItem('bio_edu_ws_4_Sanger_Trace_Editor.html_dom_inputs');
    sessionStorage.removeItem('bio_edu_draft_4_Sanger_Trace_Editor.html');
  }
  if (sessionStorage.getItem('bio_edu_autosave_app5')) {
    sessionStorage.removeItem('bio_edu_workspace_5_DNA_Alignment_Studio');
    sessionStorage.removeItem('bio_edu_ws_5_DNA_Alignment_Studio.html_dom_inputs');
    sessionStorage.removeItem('bio_edu_draft_5_DNA_Alignment_Studio.html');
  }

  const ts = (remoteTime || Date.now()).toString();
  localStorage.setItem('bio_edu_last_user_edit', ts);
  sessionStorage.setItem('bio_edu_last_user_edit', ts);

  return changed;
}

export async function importMasterPreset(taskCode) {
  if (!taskCode) return;
  const cleanCode = taskCode.toUpperCase().trim();
  try {
    if (typeof showToast === 'function') showToast(`課題「${cleanCode}」を取得中...`, "info");

    const globalTaskRef = doc(db, "master_tasks", cleanCode);
    const snap = await getDoc(globalTaskRef);

    if (snap.exists()) {
      const data = snap.data();
      let payload = data.payload || data;
      if (typeof payload === 'string') {
        try { payload = JSON.parse(payload); } catch (e) {}
      }
      if (payload) {
        if (payload.sequence && payload.appName && payload.appName === document.title) {
          const activeTextarea = document.querySelector('textarea.paste-area, textarea#dnaInput, textarea#chain-code-input, textarea#pasteArea, textarea#queryInput, input#pdbId');
          if (activeTextarea && activeTextarea.id !== 'fastaInput') {
            activeTextarea.value = payload.sequence;
            activeTextarea.dispatchEvent(new Event('input', { bubbles: true }));
            activeTextarea.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }

        const sessionSource = (payload.sessionData && typeof payload.sessionData === 'object') ? payload.sessionData : payload;
        applySessionMapToBrowser(sessionSource, data.createdAt || Date.now());

        if (payload.samples && !sessionStorage.getItem('bio_edu_workspace_dashboard_samples')) {
          const sJson = JSON.stringify(payload.samples);
          sessionStorage.setItem('bio_edu_workspace_dashboard_samples', sJson);
          try { localStorage.setItem('bio_edu_samples', sJson); } catch (e) {}
        }

        window.dispatchEvent(new CustomEvent('bio_edu_preset_loaded', { detail: { taskCode: cleanCode, payload: payload } }));
        window.dispatchEvent(new CustomEvent('bio_edu_cloud_synced', { detail: sessionSource }));
        triggerCurrentAppRestore();

        if (typeof showToast === 'function') showToast(`課題「${cleanCode}」を展開しました`, "success");
      }
    } else {
      if (typeof showToast === 'function') showToast(`課題コード「${cleanCode}」が見つかりませんでした`, "error");
    }
  } catch (e) {
    console.error("Preset import error:", e);
    if (typeof showToast === 'function') showToast("課題の取得に失敗しました", "error");
    throw e;
  }
}

function parseWorkspacePayload(raw) {
  if (!raw) return null;
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch (e) { return null; }
  }
  return raw;
}

function mergeLocalImageData(targetWorkspace) {
  if (!targetWorkspace || typeof targetWorkspace !== 'object') return targetWorkspace;
  try {
    const rawLocalSamples = localStorage.getItem('bio_edu_samples');
    if (!rawLocalSamples) return targetWorkspace;
    const localSamples = JSON.parse(rawLocalSamples);
    if (!Array.isArray(localSamples)) return targetWorkspace;

    const imgMap = {};
    const traceMap = {};
    localSamples.forEach(s => {
      if (s && s.id) {
        if (s.image_data) imgMap[s.id] = s.image_data;
        if (Array.isArray(s.traces) && s.traces.length > 0) traceMap[s.id] = s.traces;
      }
    });

    Object.keys(targetWorkspace).forEach(k => {
      if (k.includes('dashboard_samples') && targetWorkspace[k]) {
        try {
          const wsSamples = typeof targetWorkspace[k] === 'string' ? JSON.parse(targetWorkspace[k]) : targetWorkspace[k];
          if (Array.isArray(wsSamples)) {
            let patched = false;
            wsSamples.forEach(ws => {
              if (ws && ws.id) {
                if ((!ws.image_data || ws.image_data === '') && imgMap[ws.id]) {
                  ws.image_data = imgMap[ws.id];
                  patched = true;
                }
                if (traceMap[ws.id] && Array.isArray(ws.traces)) {
                  ws.traces.forEach((tr, idx) => {
                    if (tr && (!tr.data || tr.data === '') && traceMap[ws.id][idx] && traceMap[ws.id][idx].data) {
                      tr.data = traceMap[ws.id][idx].data;
                      patched = true;
                    }
                  });
                }
              }
            });
            if (patched) {
              targetWorkspace[k] = JSON.stringify(wsSamples);
            }
          }
        } catch (e) {}
      }
    });
  } catch (e) {
    console.warn("mergeLocalImageData error:", e);
  }
  return targetWorkspace;
}

export async function syncFromCloud(isManual = false) {
  if (!isManual) return;
  if (!isConnected || !auth.currentUser) {
    if (typeof showToast === 'function') showToast("先にルームへ入室してください", "warning");
    return;
  }
  const btn = document.getElementById("btnManualCloudLoad");
  const origHtml = btn ? btn.innerHTML : "";
  if (btn) { btn.disabled = true; btn.innerText = "復元中..."; }
  try {
    const roomRef = doc(db, "rooms", currentRoomCode);
    const docRef = doc(db, `rooms/${currentRoomCode}/participants`, currentParticipantId);

    const [roomSnap, userSnap] = await Promise.all([getDoc(roomRef), getDoc(docRef)]);

    let remoteUpdatedAt = 0;
    let targetWorkspace = null;

    if (userSnap.exists() && userSnap.data()?.workspace) {
      targetWorkspace = parseWorkspacePayload(userSnap.data().workspace);
      remoteUpdatedAt = userSnap.data().lastUpdated || Date.now();
    } else if (roomSnap.exists() && roomSnap.data()?.teacherLiveState) {
      targetWorkspace = parseWorkspacePayload(roomSnap.data().teacherLiveState);
      remoteUpdatedAt = roomSnap.data().teacherUpdatedAt || roomSnap.data().lastActive || Date.now();
    }

    if (targetWorkspace && typeof targetWorkspace === 'object' && Object.keys(targetWorkspace).length > 0) {
      applySessionMapToBrowser(targetWorkspace, remoteUpdatedAt);
      window.dispatchEvent(new CustomEvent('bio_edu_cloud_synced', { detail: targetWorkspace }));
      triggerCurrentAppRestore();
      if (typeof showToast === 'function') showToast("クラウドから作業状態を復元しました", "success");
      if (typeof closeAccountSettings === 'function') closeAccountSettings();
    } else {
      if (typeof showToast === 'function') showToast("クラウド上に保存されたデータがありません", "warning");
    }
  } catch (e) {
    console.error("Cloud manual load error:", e);
    if (typeof showToast === 'function') showToast("クラウドからの復元に失敗しました: " + (e.message || e), "error");
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = origHtml; }
  }
}

export async function saveCurrentWorkspace(isManual = false) {
  if (window.isResetting === true) return;
  if (isManual !== true) return;

  if (!isConnected || !auth.currentUser) {
    if (typeof showToast === 'function') showToast("先にルームへ入室してください", "warning");
    return;
  }

  const btn = document.getElementById("btnManualCloudSave");
  const origHtml = btn ? btn.innerHTML : "";
  if (btn) { btn.disabled = true; btn.innerText = "保存中..."; }

  try {
    flushCurrentAppSession();

    const rawSession = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k) rawSession[k] = sessionStorage.getItem(k);
    }
    if (!rawSession['bio_edu_workspace_dashboard_samples']) {
      const lsSamples = localStorage.getItem('bio_edu_samples');
      if (lsSamples && lsSamples !== '[]') {
        rawSession['bio_edu_workspace_dashboard_samples'] = lsSamples;
      }
    }

    const snap = sanitizeSessionMap(rawSession);
    const nowTime = Date.now();
    localStorage.setItem('bio_edu_last_user_edit', nowTime.toString());
    sessionStorage.setItem('bio_edu_last_user_edit', nowTime.toString());

    const roomRef = doc(db, "rooms", currentRoomCode);
    if (isTeacher) {
      const roomPayload = {
        roomCode: currentRoomCode,
        lastActive: nowTime,
        teacherId: currentParticipantId,
        teacherUpdatedAt: nowTime,
        teacherLiveState: snap
      };
      await setDoc(roomRef, roomPayload);
    } else {
      await setDoc(roomRef, { roomCode: currentRoomCode, lastActive: nowTime }, { merge: true });
    }

    const docRef = doc(db, `rooms/${currentRoomCode}/participants`, currentParticipantId);
    await setDoc(docRef, {
      workspace: snap,
      participantId: currentParticipantId,
      isTeacher: isTeacher,
      lastUpdated: nowTime
    });

    if (typeof showToast === 'function') showToast("現在の作業状態をクラウドに保存しました", "success");
    if (typeof closeAccountSettings === 'function') closeAccountSettings();
  } catch (e) {
    console.error("Cloud manual write error:", e);
    if (typeof showToast === 'function') showToast("クラウド保存エラー: " + (e.message || e), "error");
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = origHtml; }
  }
}

window.saveCurrentWorkspace = saveCurrentWorkspace;
window.handleManualCloudSave = () => saveCurrentWorkspace(true);
window.handleManualCloudLoad = () => syncFromCloud(true);

export async function executeHybridReset() {
  if (!isConnected || !auth.currentUser) return;
  try {
    const targetRoom = currentRoomCode;
    const targetId = currentParticipantId;
    const wasTeacher = isTeacher;

    currentRoomCode = "";
    currentParticipantId = "";
    isConnected = false;
    isTeacher = false;

    if (wasTeacher) {
      const roomRef = doc(db, "rooms", targetRoom);
      await deleteDoc(roomRef);
      if (typeof showToast === 'function') showToast(`ルーム「${targetRoom}」を解散しました`, "success");
    } else {
      const docRef = doc(db, `rooms/${targetRoom}/participants`, targetId);
      await deleteDoc(docRef);
      if (typeof showToast === 'function') showToast("自分のクラウドデータを消去しました", "success");
    }
  } catch (e) {
    console.warn("Hybrid reset error:", e);
  }
}
window.executeHybridReset = executeHybridReset;

export { app, auth, db };
