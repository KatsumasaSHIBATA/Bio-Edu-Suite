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

// 教員用：マスター課題データの登録・発行
export async function registerMasterPreset(taskCode, payload) {
  if (!taskCode || !payload) return;
  const cleanCode = taskCode.toUpperCase().trim();
  try {
    const docRef = doc(db, "master_tasks", cleanCode);
    await setDoc(docRef, {
      taskCode: cleanCode,
      payload: payload,
      creatorRoom: currentRoomCode,
      creatorId: currentParticipantId,
      createdAt: Date.now()
    });
    if (typeof showToast === 'function') {
      showToast(`課題「${cleanCode}」をクラウドに登録・発行しました`, "success");
    }
  } catch (e) {
    console.error("Master task registration error:", e);
    if (typeof showToast === 'function') {
      showToast("課題の登録に失敗しました", "error");
    }
  }
}

// 生徒用：教員マスター課題データの読込・展開
export async function importMasterPreset(taskCode) {
  if (!taskCode) return;
  const cleanCode = taskCode.toUpperCase().trim();
  try {
    if (typeof showToast === 'function') showToast(`課題「${cleanCode}」を取得中...`, "info");
    const taskRef = doc(db, "master_tasks", cleanCode);
    const snap = await getDoc(taskRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.payload) {
        // ① アクティブなテキストエリアへ展開
        const activeTextarea = document.querySelector('textarea.paste-area, textarea#dnaInput, textarea#fastaInput, textarea#chain-code-input, textarea#pasteArea, input#pdbId');
        if (activeTextarea && data.payload.sequence) {
          activeTextarea.value = data.payload.sequence;
          activeTextarea.dispatchEvent(new Event('input', { bubbles: true }));
          activeTextarea.dispatchEvent(new Event('change', { bubbles: true }));
        }
        // ② セッションワークスペースデータが存在する場合は展開
        if (data.payload.sessionData) {
          Object.keys(data.payload.sessionData).forEach((k) => {
            sessionStorage.setItem(k, data.payload.sessionData[k]);
          });
        }
        window.dispatchEvent(new CustomEvent('bio_edu_preset_loaded', { detail: { taskCode: cleanCode, payload: data.payload } }));
        if (typeof showToast === 'function') showToast(`課題「${cleanCode}」を展開しました`, "success");
      }
    } else {
      if (typeof showToast === 'function') showToast(`課題コード「${cleanCode}」が見つかりませんでした`, "error");
    }
  } catch (e) {
    console.error("Preset import error:", e);
    if (typeof showToast === 'function') showToast("課題の取得に失敗しました", "error");
  }
}

// [Bio-Edu Suite v36.2] Teacher Live Sync & Hydration Engine
function startRoomListener() {
  if (!isConnected || !auth.currentUser || isTeacher) return;
  if (typeof unsubscribeRoomListener === 'function') {
    unsubscribeRoomListener();
  }
  try {
    const roomRef = doc(db, "rooms", currentRoomCode);
    unsubscribeRoomListener = onSnapshot(roomRef, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      if (data && data.teacherLiveState) {
        let changed = false;
        Object.keys(data.teacherLiveState).forEach((k) => {
          if (sessionStorage.getItem(k) !== data.teacherLiveState[k]) {
            sessionStorage.setItem(k, data.teacherLiveState[k]);
            changed = true;
          }
        });
        if (changed) {
          window.dispatchEvent(new CustomEvent('bio_edu_cloud_synced', { detail: data.teacherLiveState }));
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

    // 【同一セッション内ステート保護】ローカルに作業中データが存在する場合の調停
    let hasLocalWork = false;
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && (k.startsWith('bio_edu_ws_') || k.startsWith('bio_edu_draft_') || k.startsWith('bio_edu_autosave_') || k.startsWith('bio_edu_workspace_'))) {
        const val = sessionStorage.getItem(k);
        if (val && val !== '[]' && val !== '{}' && val !== '""') {
          hasLocalWork = true;
          break;
        }
      }
    }

    // 初回入室直後フラグの確認（入室直後はクラウドからの初回展開を優先し、以降のアプリ間遷移ではローカル最新を維持）
    const isJustJoined = sessionStorage.getItem('bio_edu_just_joined') === 'true';
    if (isJustJoined) {
      sessionStorage.removeItem('bio_edu_just_joined');
    }

    // 教員モード、または生徒モードでアプリ間遷移時（!isJustJoined）にローカル作業が存在する場合、
    // クラウドからの過去スナップショットダウンロード（巻き戻し・復活バグ）を遮断し、ローカルを確定保存
    if (hasLocalWork && (isTeacher || !isJustJoined)) {
      await saveCurrentWorkspace();
      return;
    }

    const [roomSnap, userSnap] = await Promise.all([getDoc(roomRef), getDoc(docRef)]);
    let targetWorkspace = null;

    if (userSnap.exists() && userSnap.data()?.workspace && Object.keys(userSnap.data().workspace).length > 0) {
      targetWorkspace = userSnap.data().workspace;
    } else if (!isTeacher && roomSnap.exists() && roomSnap.data()?.teacherLiveState) {
      targetWorkspace = roomSnap.data().teacherLiveState;
    }

    if (targetWorkspace) {
      Object.keys(targetWorkspace).forEach((k) => {
        sessionStorage.setItem(k, targetWorkspace[k]);
      });
      window.dispatchEvent(new CustomEvent('bio_edu_cloud_synced', { detail: targetWorkspace }));
      if (typeof showToast === 'function') showToast("最新の作業状態を同期しました", "info");
    } else {
      await saveCurrentWorkspace();
    }
  } catch (e) {
    console.warn("Cloud sync read error:", e);
  }
}

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
                if (copy.image_data && copy.image_data.startsWith('data:image')) {
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

    // 親ドキュメント（rooms/{roomCode}）を実体化して教員ステートをブロードキャスト
    const roomRef = doc(db, "rooms", currentRoomCode);
    const roomPayload = { roomCode: currentRoomCode, lastActive: Date.now() };
    if (isTeacher) {
      roomPayload.teacherLiveState = snap;
      roomPayload.teacherId = currentParticipantId;
      roomPayload.teacherUpdatedAt = Date.now();
    }
    await setDoc(roomRef, roomPayload, { merge: true });

    const docRef = doc(db, `rooms/${currentRoomCode}/participants`, currentParticipantId);
    await setDoc(docRef, { workspace: snap, participantId: currentParticipantId, isTeacher: isTeacher, lastUpdated: Date.now() }, { merge: true });
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
