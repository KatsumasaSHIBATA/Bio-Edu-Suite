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
    // 【未接続（ローカル）】
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
      if (icon) {
        icon.style.color = "var(--phase-color)";
        icon.style.fill = "var(--phase-color)";
      }
      if (text) {
        text.textContent = `${currentRoomCode} (${currentParticipantId})`;
        text.style.color = "var(--phase-color)";
      }
      if (syncBadge) {
        syncBadge.textContent = "🟢 ルーム同期中";
        syncBadge.style.color = "var(--phase-color)";
      }
      if (syncNote) syncNote.style.display = "none";
    } else {
      // 接続中だがオフライン
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


// 認証・通信イベント監視
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

  // 即時UI同期実行
  renderAuthStatus();

  if (typeof showToast === 'function') {
    showToast(`ルーム「${currentRoomCode}」に入室しました`, "success");
  }

  // クラウドから最新データを取得（ハイドレーション）
  syncFromCloud();
}

export function leaveRoom() {
  const oldRoom = currentRoomCode;
  currentRoomCode = "";
  currentParticipantId = "";
  isConnected = false;

  localStorage.removeItem('bio_edu_room_code');
  localStorage.removeItem('bio_edu_participant_id');

  // 即時UI同期実行
  renderAuthStatus();

  if (typeof showToast === 'function') {
    showToast(`ルーム「${oldRoom}」から退出しました`, "info");
  }
}

// 教員マスター課題データの読込
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
        // 現在のアプリの入力要素へ自動展開
        const activeTextarea = document.querySelector('textarea.paste-area, textarea#dnaInput, textarea#fastaInput');
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

// クラウドからの復元
async function syncFromCloud() {
  if (!isConnected || !auth.currentUser) return;
  try {
    const docRef = doc(db, `rooms/${currentRoomCode}/participants`, currentParticipantId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const remoteData = snap.data();
      if (remoteData && remoteData.workspace) {
        // セッションストレージへ反映
        Object.keys(remoteData.workspace).forEach((k) => {
          sessionStorage.setItem(k, remoteData.workspace[k]);
        });
        if (typeof showToast === 'function') showToast("クラウドから作業データを復元しました", "info");
      }
    }
  } catch (e) {
    console.warn("Cloud sync read error:", e);
  }
}

// 初期化多重保護付きクラウド保存
export async function saveCurrentWorkspace() {
  if (!isConnected || !auth.currentUser) return;
  if (window.isResetting === true) {
    console.log("[AuthSync] 初期化フラグ検知のためクラウド保存を安全にスキップ");
    return;
  }

  try {
    const snap = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && (k.startsWith('bio_edu_ws_') || k.startsWith('bio_edu_draft_'))) {
        snap[k] = sessionStorage.getItem(k);
      }
    }
    // 空データ上書き防止
    if (Object.keys(snap).length === 0) return;

    const docRef = doc(db, `rooms/${currentRoomCode}/participants`, currentParticipantId);
    await setDoc(docRef, { workspace: snap, lastUpdated: Date.now() }, { merge: true });
  } catch (e) {
    console.warn("Cloud sync write error:", e);
  }
}

export { app, auth, db };
