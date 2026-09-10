import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, enableIndexedDbPersistence, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

export function renderAuthStatus() {
  const icon = document.getElementById("accountUserIcon");
  const text = document.getElementById("accountStatusText");
  const modalLoggedOut = document.getElementById("modalLoggedOutView");
  const modalLoggedIn = document.getElementById("modalLoggedInView");
  const roomDisplay = document.getElementById("roomDisplay");
  const participantDisplay = document.getElementById("participantDisplay");
  const syncBadge = document.getElementById("syncStatusBadge");
  const syncNote = document.getElementById("syncStatusNote");

  const isOnline = navigator.onLine;

  if (!isConnected) {
    // 【未接続（ローカル）】: 単一の薄灰色丸ランプ
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
  } else {
    // 【ルーム接続中】
    if (isOnline) {
      // 接続中: 単一の鮮やかな緑色丸ランプ
      if (icon) {
        icon.style.color = "#2ecc71";
        icon.style.fill = "#2ecc71";
      }
      if (text) {
        text.textContent = `${currentRoomCode} (${currentParticipantId})`;
        text.style.color = "var(--phase-color)";
      }
      if (syncBadge) {
        syncBadge.textContent = "🟢 ルーム同期中";
        syncBadge.style.color = "#2ecc71";
      }
      if (syncNote) syncNote.style.display = "none";
    } else {
      // オフライン: 赤色丸ランプ
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
      participantDisplay.textContent = `参加者ID: ${currentParticipantId}`;
      participantDisplay.style.display = "block";
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

  localStorage.setItem('bio_edu_room_code', currentRoomCode);
  localStorage.setItem('bio_edu_participant_id', currentParticipantId);

  renderAuthStatus();

  if (typeof showToast === 'function') {
    showToast(`ルーム「${currentRoomCode}」に入室しました`, "success");
  }

  syncFromCloud();
}

export function leaveRoom() {
  const oldRoom = currentRoomCode;
  currentRoomCode = "";
  currentParticipantId = "";
  isConnected = false;

  localStorage.removeItem('bio_edu_room_code');
  localStorage.removeItem('bio_edu_participant_id');

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
        const activeTextarea = document.querySelector('textarea.paste-area, textarea#dnaInput, textarea#fastaInput, textarea#chain-code-input');
        if (activeTextarea && data.payload.sequence) {
          activeTextarea.value = data.payload.sequence;
          activeTextarea.dispatchEvent(new Event('input', { bubbles: true }));
          activeTextarea.dispatchEvent(new Event('change', { bubbles: true }));
        }
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
async function syncFromCloud() {
  if (!isConnected || !auth.currentUser) return;
  try {
    const docRef = doc(db, `rooms/${currentRoomCode}/participants`, currentParticipantId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const remoteData = snap.data();
      if (remoteData && remoteData.workspace) {
        Object.keys(remoteData.workspace).forEach((k) => {
          sessionStorage.setItem(k, remoteData.workspace[k]);
        });
        if (typeof showToast === 'function') showToast("クラウドから最新の作業状態を復元しました", "info");
      }
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
      if (k && (k.startsWith('bio_edu_ws_') || k.startsWith('bio_edu_draft_') || k.startsWith('bio_edu_autosave_'))) {
        snap[k] = sessionStorage.getItem(k);
      }
    }
    if (Object.keys(snap).length === 0) return;

    const docRef = doc(db, `rooms/${currentRoomCode}/participants`, currentParticipantId);
    await setDoc(docRef, { workspace: snap, lastUpdated: Date.now() }, { merge: true });
  } catch (e) {
    console.warn("Cloud sync write error:", e);
  }
}

export { app, auth, db };

