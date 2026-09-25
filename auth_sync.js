import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, enableIndexedDbPersistence, doc, setDoc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
let unsubscribeRoomListener = null; // [Bio-Edu Suite v36.2] Teacher Live Sync

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

    // 教員モード時のみシークレット登録パネルを動的解放
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
    // 認証完了時、すでに入室情報があればクラウド同期を実行
    if (isConnected) {
      syncFromCloud();
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

// 教員用：マスター課題データの登録・発行 (軽量化・ルーム二重保存・完全堅牢化)
export async function registerMasterPreset(taskCode, payload) {
  if (!taskCode || !payload) return;
  const cleanCode = taskCode.toUpperCase().trim();
  try {
    const sanitizedPayload = JSON.parse(JSON.stringify(payload));
    
    // サンプル内の巨大画像を適正サイズ（150,000文字 ≒ 110KB以下）は保持し、それ以上の超巨大画像のみ間引く
    if (sanitizedPayload.samples && Array.isArray(sanitizedPayload.samples)) {
      sanitizedPayload.samples = sanitizedPayload.samples.map(item => {
        const copy = { ...item };
        if (copy.image_data && typeof copy.image_data === 'string' && copy.image_data.length > 150000) {
          copy.image_data = "";
        }
        return copy;
      });
    }

    // sessionData内の不要な巨大データをパージして軽量化
    if (sanitizedPayload.sessionData && typeof sanitizedPayload.sessionData === 'object') {
      const cleanSessionData = {};
      Object.keys(sanitizedPayload.sessionData).forEach((k) => {
        let val = sanitizedPayload.sessionData[k];
        if (typeof val === 'string' && val.length > 150000) {
          val = "";
        }
        cleanSessionData[k] = val;
      });
      sanitizedPayload.sessionData = cleanSessionData;
    }

    const serializedPayload = JSON.stringify(sanitizedPayload);
    const taskData = {
      taskCode: cleanCode,
      payload: serializedPayload,
      creatorRoom: currentRoomCode || "",
      creatorId: currentParticipantId || "",
      createdAt: Date.now()
    };

    // ① ルートコレクション master_tasks への書き込み
    const globalDocRef = doc(db, "master_tasks", cleanCode);
    const p1 = setDoc(globalDocRef, taskData, { merge: true });

    // ② 書き込み実績が確実に保証されている rooms/{currentRoomCode}/tasks にも二重保存（フェイルセーフ）
    let p2 = Promise.resolve();
    if (currentRoomCode) {
      const roomTaskRef = doc(db, `rooms/${currentRoomCode}/tasks`, cleanCode);
      p2 = setDoc(roomTaskRef, taskData, { merge: true });
    }

    await Promise.all([p1, p2]);

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

// 生徒用：教員マスター課題データの読込・展開 (グローバル＆ルーム内ハイブリッド探索)
export async function importMasterPreset(taskCode) {
  if (!taskCode) return;
  const cleanCode = taskCode.toUpperCase().trim();
  try {
    if (typeof showToast === 'function') showToast(`課題「${cleanCode}」を取得中...`, "info");
    
    // 1. まず master_tasks から探索
    const globalTaskRef = doc(db, "master_tasks", cleanCode);
    let snap = await getDoc(globalTaskRef);

    // 2. 見つからない場合は現在のルーム内の tasks からフェイルセーフ探索
    if (!snap.exists() && currentRoomCode) {
      const roomTaskRef = doc(db, `rooms/${currentRoomCode}/tasks`, cleanCode);
      snap = await getDoc(roomTaskRef);
    }

    if (snap.exists()) {
      const data = snap.data();
      let payload = data.payload;
      if (typeof payload === 'string') {
        try { payload = JSON.parse(payload); } catch(e) {}
      }
      if (payload) {
        const activeTextarea = document.querySelector('textarea.paste-area, textarea#dnaInput, textarea#fastaInput, textarea#chain-code-input, textarea#pasteArea, input#pdbId');
        if (activeTextarea && payload.sequence) {
          activeTextarea.value = payload.sequence;
          activeTextarea.dispatchEvent(new Event('input', { bubbles: true }));
          activeTextarea.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (payload.sessionData) {
          Object.keys(payload.sessionData).forEach((k) => {
            const restoredKey = k.replace(/__dot__/g, '.');
            sessionStorage.setItem(restoredKey, payload.sessionData[k]);
          });
        }
        window.dispatchEvent(new CustomEvent('bio_edu_preset_loaded', { detail: { taskCode: cleanCode, payload: payload } }));
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
    try { return JSON.parse(raw); } catch(e) { return null; }
  }
  return raw;
}

// [Bio-Edu Suite v36.2] Teacher Live Sync & Hydration Engine
let lastSentTimestamp = 0;

function mergeLocalImageData(targetWorkspace) {
  if (!targetWorkspace || typeof targetWorkspace !== 'object') return targetWorkspace;
  try {
    const rawLocalSamples = localStorage.getItem('bio_edu_samples');
    if (!rawLocalSamples) return targetWorkspace;
    const localSamples = JSON.parse(rawLocalSamples);
    if (!Array.isArray(localSamples)) return targetWorkspace;
    
    // local map by id
    const imgMap = {};
    localSamples.forEach(s => {
      if (s && s.id && s.image_data) {
        imgMap[s.id] = s.image_data;
      }
    });
    if (Object.keys(imgMap).length === 0) return targetWorkspace;

    Object.keys(targetWorkspace).forEach(k => {
      if (k.includes('dashboard_samples') && targetWorkspace[k]) {
        try {
          const wsSamples = typeof targetWorkspace[k] === 'string' ? JSON.parse(targetWorkspace[k]) : targetWorkspace[k];
          if (Array.isArray(wsSamples)) {
            let patched = false;
            wsSamples.forEach(ws => {
              if (ws && ws.id && (!ws.image_data || ws.image_data === '') && imgMap[ws.id]) {
                ws.image_data = imgMap[ws.id];
                patched = true;
              }
            });
            if (patched) {
              targetWorkspace[k] = JSON.stringify(wsSamples);
            }
          }
        } catch(e) {}
      }
    });
  } catch(e) {
    console.warn("mergeLocalImageData error:", e);
  }
  return targetWorkspace;
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
      
      // 自身が直前に送信した更新は無視するガード
      if (data?.teacherId === currentParticipantId && (Date.now() - lastSentTimestamp < 3000)) {
        return;
      }

      const liveState = parseWorkspacePayload(data?.teacherLiveState);
      if (liveState && typeof liveState === 'object') {
        const mergedLiveState = mergeLocalImageData(liveState);
        let changed = false;
        Object.keys(mergedLiveState).forEach((k) => {
          if (sessionStorage.getItem(k) !== mergedLiveState[k]) {
            sessionStorage.setItem(k, mergedLiveState[k]);
            changed = true;
          }
        });
        if (changed) {
          window.dispatchEvent(new CustomEvent('bio_edu_cloud_synced', { detail: mergedLiveState }));
        }
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
    
    // 編集時刻の取得（未編集の場合は 0）
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

    // LWW (Last-Write-Wins) 判定: クラウドがローカルより新しい場合（またはローカル未編集/初回入室時）
    if (targetWorkspace && typeof targetWorkspace === 'object' && (remoteUpdatedAt >= localEditTime || localEditTime === 0)) {
      targetWorkspace = mergeLocalImageData(targetWorkspace);
      Object.keys(targetWorkspace).forEach((k) => {
        sessionStorage.setItem(k, targetWorkspace[k]);
      });
      window.dispatchEvent(new CustomEvent('bio_edu_cloud_synced', { detail: targetWorkspace }));
      if (typeof showToast === 'function') showToast("最新の作業状態を同期しました", "info");
    } else if (localEditTime > remoteUpdatedAt && localEditTime > 0) {
      // ローカルの方が新しい場合はローカルの作業状態をクラウドへ保存
      await saveCurrentWorkspace();
    } else if (targetWorkspace && typeof targetWorkspace === 'object') {
      targetWorkspace = mergeLocalImageData(targetWorkspace);
      Object.keys(targetWorkspace).forEach((k) => {
        sessionStorage.setItem(k, targetWorkspace[k]);
      });
      window.dispatchEvent(new CustomEvent('bio_edu_cloud_synced', { detail: targetWorkspace }));
    } else {
      await saveCurrentWorkspace();
    }
  } catch (e) {
    console.warn("Cloud sync read error:", e);
  }
}

// ワークスペース自動同期 (画像許容枠を150,000文字へ拡大)
export async function saveCurrentWorkspace() {
  if (!isConnected || !auth.currentUser) return;
  if (window.isResetting === true) return;

  try {
    const snap = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && (k.startsWith('bio_edu_ws_') || k.startsWith('bio_edu_draft_') || k.startsWith('bio_edu_autosave_') || k.startsWith('bio_edu_workspace_'))) {
        let val = sessionStorage.getItem(k);
        if (k.includes('dashboard_samples') && val) {
          try {
            const arr = JSON.parse(val);
            if (Array.isArray(arr)) {
              const sanitized = arr.map(item => {
                const copy = { ...item };
                // 150,000文字（約110KB）を超える異常な巨大画像のみ除外し、通常の軽量画像は確実に通す
                if (copy.image_data && copy.image_data.startsWith('data:image') && copy.image_data.length > 150000) {
                  copy.image_data = "";
                }
                return copy;
              });
              val = JSON.stringify(sanitized);
            }
          } catch(e) {}
        }
        snap[k] = val;
      }
    }
    if (Object.keys(snap).length === 0) return;

    const serializedPayload = JSON.stringify(snap);
    const nowTime = Date.now();
    lastSentTimestamp = nowTime;

    const roomRef = doc(db, "rooms", currentRoomCode);
    const roomPayload = { roomCode: currentRoomCode, lastActive: nowTime };
    if (isTeacher) {
      roomPayload.teacherLiveState = serializedPayload;
      roomPayload.teacherId = currentParticipantId;
      roomPayload.teacherUpdatedAt = nowTime;
    }
    await setDoc(roomRef, roomPayload, { merge: true });

    const docRef = doc(db, `rooms/${currentRoomCode}/participants`, currentParticipantId);
    await setDoc(docRef, { workspace: serializedPayload, participantId: currentParticipantId, isTeacher: isTeacher, lastUpdated: nowTime }, { merge: true });
  } catch (e) {
    console.warn("Cloud sync write error:", e);
  }
}

// グローバル window オブジェクトへ saveCurrentWorkspace を公開し、他スクリプトから遅延なく即時保存を呼び出せるようにする
window.saveCurrentWorkspace = saveCurrentWorkspace;

export { app, auth, db };
// [Bio-Edu Suite v36.2] 各アプリからの即時保存要求リスナー
let saveDebounceTimer = null;
window.addEventListener('bio_edu_request_save', () => {
  if (!isConnected || !auth.currentUser) return;
  clearTimeout(saveDebounceTimer);
  saveDebounceTimer = setTimeout(() => {
    saveCurrentWorkspace();
  }, 250);
});
