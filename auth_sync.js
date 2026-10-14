import { initializeApp } from "[https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js](https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js)";
import { getAuth, onAuthStateChanged, signInAnonymously } from "[https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js](https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js)";
import { getFirestore, enableIndexedDbPersistence, doc, setDoc, getDoc, onSnapshot, deleteDoc } from "[https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js](https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js)";

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
let unsubscribeRoomListener = null;
let lastSentTimestamp = 0;


export function renderAuthStatus() {
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
        syncBadge.textContent = isTeacher ? "🟢 教員モード同期中" : "🟢 ルーム同期中";
        syncBadge.style.color = isTeacher ? "#f39c12" : "#2ecc71";
      }
      if (syncNote) syncNote.style.display = "none";
    } else {
      if (icon) {
        icon.style.color = "var(--danger)";
        icon.style.fill = "var(--danger)";
      }
      if (text) {
        text.textContent = "オフライン";
        text.style.color = "var(--danger)";
      }
      if (syncBadge) {
        syncBadge.textContent = "🔴 オフライン（一時停止）";
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
  } else {
    if (isConnected) {
      syncFromCloud();
      startRoomListener();
    }
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
  sessionStorage.setItem('bio_edu_just_joined', 'true');

  localStorage.setItem('bio_edu_room_code', currentRoomCode);
  localStorage.setItem('bio_edu_participant_id', currentParticipantId);

  renderAuthStatus();

  if (typeof showToast === 'function') {
    const roleMsg = isTeacher ? "【教員モード】" : "";
    showToast(`${roleMsg}ルーム「${currentRoomCode}」に入室しました`, "success");
  }

  if (auth.currentUser) {
    syncFromCloud();
  }
  startRoomListener();
}

export function leaveRoom() {
  const oldRoom = currentRoomCode;
  currentRoomCode = "";
  currentParticipantId = "";
  isConnected = false;
  isTeacher = false;

  localStorage.removeItem('bio_edu_room_code');
  localStorage.removeItem('bio_edu_participant_id');

  if (typeof unsubscribeRoomListener === 'function') {
    unsubscribeRoomListener();
    unsubscribeRoomListener = null;
  }

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

// 構造維持型スマートサニタイザー（カセットlocalDBやサンプル構造を絶対に破壊せず、巨大画像・HTMLキャッシュ・重複キーのみを軽量化）
function sanitizeSessionMap(rawSessionObj) {
  if (!rawSessionObj || typeof rawSessionObj !== 'object') return {};
  const cleaned = {};
  const hasApp7Full = Object.keys(rawSessionObj).some(k => k.includes('autosave_app7_full'));

  Object.keys(rawSessionObj).forEach((rawKey) => {
    const origKey = rawKey.replace(/__dot__/g, '.');
    if (
      !origKey.startsWith('bio_edu_ws_') &&
      !origKey.startsWith('bio_edu_draft_') &&
      !origKey.startsWith('bio_edu_autosave_') &&
      !origKey.startsWith('bio_edu_workspace_')
    ) {
      return;
    }

    // アプリ⑦の三重重複保存キーがある場合、autosave_app7_full に一本化して容量浪費を防ぐ
    if (hasApp7Full && (origKey.includes('workspace_7_Virtual_BLAST') || origKey.includes('ws_7_Virtual_BLAST'))) {
      return;
    }

    let val = rawSessionObj[rawKey];
    if (typeof val !== 'string') {
      try { val = JSON.stringify(val); } catch (e) { val = ""; }
    }

    // 1. ダッシュボードサンプル一覧：構造と塩基配列は100%死守し、超巨大画像や過剰バイナリのみ軽量化
    if (origKey.includes('dashboard_samples') && val) {
      try {
        const arr = JSON.parse(val);
        if (Array.isArray(arr)) {
          const sanitizedArr = arr.map(item => {
            const copy = { ...item };
            if (copy.image_data && typeof copy.image_data === 'string' && copy.image_data.length > 100000) {
              copy.image_data = "";
            }
            if (Array.isArray(copy.images)) {
              copy.images = copy.images.map(img => {
                if (typeof img === 'string' && img.length > 100000) return "";
                if (img && typeof img === 'object' && img.data && img.data.length > 100000) return { ...img, data: "" };
                return img;
              });
            }
            return copy;
          });
          val = JSON.stringify(sanitizedArr);
          // もし .ab1 波形バイナリ(traces)が複数入って単一キーで550KBを超える場合のみ、tracesの巨大Base64を間引く
          if (getUtf8ByteSize(val) > 550000) {
            const slimArr = sanitizedArr.map(item => {
              const copy = { ...item };
              if (Array.isArray(copy.traces)) {
                copy.traces = copy.traces.map(tr => {
                  if (tr && tr.data && tr.data.length > 120000) {
                    return { ...tr, data: "" };
                  }
                  return tr;
                });
              }
              return copy;
            });
            val = JSON.stringify(slimArr);
          }
        }
      } catch (e) {}
    }
    // 2. アプリ⑦ BLAST：localDB（カセット）とクエリは絶対に保護し、再計算可能なHTML塊のみ除去
    else if ((origKey.includes('autosave_app7') || (val && val.includes('"localDB"'))) && val) {
      try {
        const app7 = JSON.parse(val);
        if (app7 && typeof app7 === 'object') {
          app7.alignmentHtml = "";
          app7.ncbiLinkHtml = "";
          if (getUtf8ByteSize(JSON.stringify(app7)) > 250000) {
            app7.currentResults = [];
          }
          val = JSON.stringify(app7);
        }
      } catch (e) {}
    }
    // 3. その他のアプリデータ：120KB超の埋め込み画像や巨大キャッシュのみ軽量化
    else if (val && val.length > 120000) {
      try {
        const parsed = JSON.parse(val);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          ['uploadedImage', 'image_data', 'image', 'rawData', 'fullCoeffs', 'alignmentHtml'].forEach(prop => {
            if (parsed[prop] && typeof parsed[prop] === 'string' && parsed[prop].length > 80000) {
              parsed[prop] = "";
            }
          });
          val = JSON.stringify(parsed);
        }
      } catch (e) {}
      if (getUtf8ByteSize(val) > 250000) {
        val = "";
      }
    }

    const safeKey = origKey.replace(/\./g, '__dot__');
    cleaned[safeKey] = val;
  });

  // 最終防壁：全体で750KBを超える場合、コアデータ（dashboard_samples, autosave_app7）以外から優先的にダイエット
  let totalBytes = getUtf8ByteSize(JSON.stringify(cleaned));
  if (totalBytes > 750000) {
    const keys = Object.keys(cleaned);
    keys.sort((a, b) => {
      const isCoreA = a.includes('dashboard_samples') || a.includes('autosave_app7') ? 1 : 0;
      const isCoreB = b.includes('dashboard_samples') || b.includes('autosave_app7') ? 1 : 0;
      if (isCoreA !== isCoreB) return isCoreA - isCoreB; // 非コアを先に削る
      return (cleaned[b] ? cleaned[b].length : 0) - (cleaned[a] ? cleaned[a].length : 0);
    });
    for (const k of keys) {
      if (getUtf8ByteSize(JSON.stringify(cleaned)) <= 750000) break;
      if (k.includes('dashboard_samples')) {
        try {
          const arr = JSON.parse(cleaned[k]);
          if (Array.isArray(arr)) {
            arr.forEach(s => {
              s.image_data = "";
              if (Array.isArray(s.traces)) s.traces.forEach(t => { if (t) t.data = ""; });
            });
            cleaned[k] = JSON.stringify(arr);
          }
        } catch (e) { cleaned[k] = "[]"; }
      } else {
        cleaned[k] = "";
      }
    }
  }

  return cleaned;
}

// 教員用：マスター課題データの登録・発行（merge: true を廃止し、過去の残留ゴミデータを完全一掃）
export async function registerMasterPreset(taskCode, payload) {
  if (!taskCode || !payload) return;
  const cleanCode = taskCode.toUpperCase().trim();
  try {
    const sanitizedPayload = JSON.parse(JSON.stringify(payload));

    // sessionDataのスマート軽量化
    const rawSession = sanitizedPayload.sessionData || {};
    sanitizedPayload.sessionData = sanitizeSessionMap(rawSession);

    // もしトップレベルに samples や traces がある場合の二重持ち・容量超過を防止
    if (sanitizedPayload.samples && Array.isArray(sanitizedPayload.samples)) {
      sanitizedPayload.samples = sanitizedPayload.samples.map(item => {
        const copy = { ...item };
        if (copy.image_data && typeof copy.image_data === 'string' && copy.image_data.length > 100000) {
          copy.image_data = "";
        }
        return copy;
      });
      // sessionData側と完全に重複して750KBを超える場合は、sessionData側に一本化
      if (getUtf8ByteSize(JSON.stringify(sanitizedPayload)) > 750000 && sanitizedPayload.sessionData['bio_edu_workspace_dashboard_samples']) {
        delete sanitizedPayload.samples;
      }
    }
    if (sanitizedPayload.traces && getUtf8ByteSize(JSON.stringify(sanitizedPayload)) > 750000) {
      delete sanitizedPayload.traces;
    }

    const taskData = {
      taskCode: cleanCode,
      payload: sanitizedPayload,
      creatorRoom: currentRoomCode || "",
      creatorId: currentParticipantId || "",
      createdAt: Date.now()
    };

    // ルートコレクション master_tasks への完全上書き（merge: true を使わないことで過去データとの合算1MB超過＆型コンフリクトを根絶）
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

// 生徒用：教員マスター課題データの読込・展開
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
        const activeTextarea = document.querySelector('textarea.paste-area, textarea#dnaInput, textarea#fastaInput, textarea#chain-code-input, textarea#pasteArea, textarea#queryInput, input#pdbId');
        if (activeTextarea && payload.sequence) {
          activeTextarea.value = payload.sequence;
          activeTextarea.dispatchEvent(new Event('input', { bubbles: true }));
          activeTextarea.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // セッションデータの展開（ラップ構造・フラット構造の両対応）
        const sessionSource = (payload.sessionData && typeof payload.sessionData === 'object') ? payload.sessionData : payload;
        Object.keys(sessionSource).forEach((k) => {
          if (
            k.startsWith('bio_edu_ws_') ||
            k.startsWith('bio_edu_workspace_') ||
            k.startsWith('bio_edu_draft_') ||
            k.startsWith('bio_edu_autosave_')
          ) {
            const restoredKey = k.replace(/__dot__/g, '.');
            const val = typeof sessionSource[k] === 'string' ? sessionSource[k] : JSON.stringify(sessionSource[k]);
            if (val !== undefined && val !== null) {
              sessionStorage.setItem(restoredKey, val);
            }
          }
        });

        // ダッシュボードサンプルが含まれている場合は localStorage 側にも確実に同期してアプリ④等への導線を確保
        const sampleJson = sessionStorage.getItem('bio_edu_workspace_dashboard_samples') || (payload.samples ? JSON.stringify(payload.samples) : null);
        if (sampleJson && sampleJson !== '""' && sampleJson !== '[]') {
          try {
            localStorage.setItem('bio_edu_samples', sampleJson);
            sessionStorage.setItem('bio_edu_workspace_dashboard_samples', sampleJson);
          } catch (e) {}
        }

        const nowTime = Date.now().toString();
        localStorage.setItem('bio_edu_last_user_edit', nowTime);
        sessionStorage.setItem('bio_edu_last_user_edit', nowTime);

        window.dispatchEvent(new CustomEvent('bio_edu_preset_loaded', { detail: { taskCode: cleanCode, payload: payload } }));
        window.dispatchEvent(new CustomEvent('bio_edu_cloud_synced', { detail: sessionSource }));
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

function applyWorkspaceToSession(workspaceObj, remoteTime) {
  if (!workspaceObj || typeof workspaceObj !== 'object') return false;
  const merged = mergeLocalImageData(workspaceObj);
  let changed = false;
  Object.keys(merged).forEach((k) => {
    const restoredKey = k.replace(/__dot__/g, '.');
    if (
      restoredKey.startsWith('bio_edu_ws_') ||
      restoredKey.startsWith('bio_edu_workspace_') ||
      restoredKey.startsWith('bio_edu_draft_') ||
      restoredKey.startsWith('bio_edu_autosave_')
    ) {
      const val = merged[k];
      if (val !== undefined && val !== null && val !== "" && sessionStorage.getItem(restoredKey) !== val) {
        sessionStorage.setItem(restoredKey, val);
        if (restoredKey === 'bio_edu_workspace_dashboard_samples') {
          try { localStorage.setItem('bio_edu_samples', val); } catch (e) {}
        }
        changed = true;
      }
    }
  });
  if (changed) {
    const ts = (remoteTime || Date.now()).toString();
    localStorage.setItem('bio_edu_last_user_edit', ts);
    sessionStorage.setItem('bio_edu_last_user_edit', ts);
    window.dispatchEvent(new CustomEvent('bio_edu_cloud_synced', { detail: merged }));
  }
  return changed;
}

function startRoomListener() {
  if (!isConnected || !auth.currentUser) return;
  if (typeof unsubscribeRoomListener === 'function') {
    unsubscribeRoomListener();
  }
  try {
    const roomRef = doc(db, "rooms", currentRoomCode);
    unsubscribeRoomListener = onSnapshot(roomRef, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();

      if (data?.teacherId === currentParticipantId && (Date.now() - lastSentTimestamp < 3000)) {
        return;
      }

      const liveState = parseWorkspacePayload(data?.teacherLiveState);
      if (liveState && typeof liveState === 'object') {
        applyWorkspaceToSession(liveState, data.teacherUpdatedAt);
      }
    }, (err) => {
      console.warn("Room listener warning:", err);
    });
  } catch (e) {
    console.warn("Start room listener error:", e);
  }
}

async function syncFromCloud() {
  if (!isConnected || !auth.currentUser) return;
  try {
    const roomRef = doc(db, "rooms", currentRoomCode);
    const docRef = doc(db, `rooms/${currentRoomCode}/participants`, currentParticipantId);

    const [roomSnap, userSnap] = await Promise.all([getDoc(roomRef), getDoc(docRef)]);

    const localEditTime = parseInt(localStorage.getItem('bio_edu_last_user_edit') || sessionStorage.getItem('bio_edu_last_user_edit') || '0', 10);

    let remoteUpdatedAt = 0;
    let targetWorkspace = null;

    if (userSnap.exists() && userSnap.data()?.workspace) {
      targetWorkspace = parseWorkspacePayload(userSnap.data().workspace);
      remoteUpdatedAt = userSnap.data().lastUpdated || 0;
    } else if (roomSnap.exists() && roomSnap.data()?.teacherLiveState) {
      targetWorkspace = parseWorkspacePayload(roomSnap.data().teacherLiveState);
      remoteUpdatedAt = roomSnap.data().teacherUpdatedAt || roomSnap.data().lastActive || 0;
    }

    const isJustJoined = sessionStorage.getItem('bio_edu_just_joined') === 'true';

    if (targetWorkspace && typeof targetWorkspace === 'object' && (isJustJoined || remoteUpdatedAt > localEditTime || localEditTime === 0)) {
      applyWorkspaceToSession(targetWorkspace, remoteUpdatedAt);
      if (isJustJoined) sessionStorage.removeItem('bio_edu_just_joined');
      if (typeof showToast === 'function') showToast("最新の作業状態を同期しました", "info");
    } else if (localEditTime > remoteUpdatedAt && localEditTime > 0) {
      await saveCurrentWorkspace();
    } else if (targetWorkspace && typeof targetWorkspace === 'object') {
      applyWorkspaceToSession(targetWorkspace, remoteUpdatedAt);
      if (isJustJoined) sessionStorage.removeItem('bio_edu_just_joined');
    } else {
      await saveCurrentWorkspace();
    }
  } catch (e) {
    console.warn("Cloud sync read error:", e);
  }
}

// ワークスペース自動同期（merge: true による過去ゴミデータの蓄積・1.5MB膨張を完全遮断）
export async function saveCurrentWorkspace() {
  if (!isConnected || !auth.currentUser) return;
  if (window.isResetting === true) return;

  try {
    const rawSession = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k) rawSession[k] = sessionStorage.getItem(k);
    }

    const snap = sanitizeSessionMap(rawSession);
    const hasData = Object.keys(snap).length > 0;
    if (!hasData && !isTeacher) return;

    const nowTime = Date.now();
    lastSentTimestamp = nowTime;
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
      // merge: true を使わず完全置換することで、過去の古いセッションキーの残留・1.5MB膨張を根絶
      await setDoc(roomRef, roomPayload);
    } else {
      await setDoc(roomRef, { roomCode: currentRoomCode, lastActive: nowTime }, { merge: true });
    }

    if (hasData || isTeacher) {
      const docRef = doc(db, `rooms/${currentRoomCode}/participants`, currentParticipantId);
      await setDoc(docRef, {
        workspace: snap,
        participantId: currentParticipantId,
        isTeacher: isTeacher,
        lastUpdated: nowTime
      });
    }
  } catch (e) {
    console.warn("Cloud sync write error:", e);
  }
}

window.saveCurrentWorkspace = saveCurrentWorkspace;

export async function executeHybridReset() {
  if (!isConnected || !auth.currentUser) return;
  try {
    if (typeof unsubscribeRoomListener === 'function') {
      unsubscribeRoomListener();
      unsubscribeRoomListener = null;
    }
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

let saveDebounceTimer = null;
window.addEventListener('bio_edu_request_save', () => {
  if (!isConnected || !auth.currentUser) return;
  clearTimeout(saveDebounceTimer);
  saveDebounceTimer = setTimeout(() => {
    saveCurrentWorkspace();
  }, 250);
});
