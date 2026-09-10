import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, enableIndexedDbPersistence, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 1. Firebaseの設定情報
const firebaseConfig = {
  apiKey: "AIzaSyAFJ8dH4K50MCLAkHgaS6pqdvsTNUzAzHk",
  authDomain: "bio-edu-suite.firebaseapp.com",
  projectId: "bio-edu-suite",
  storageBucket: "bio-edu-suite.firebasestorage.app",
  messagingSenderId: "908113234082",
  appId: "1:908113234082:web:c091f57a7ea365ca70affb",
  measurementId: "G-D3B95LYZDQ"
};

// 2. Firebaseの初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 3. オフライン機能（IndexedDB）の有効化
enableIndexedDbPersistence(db).catch((err) => {
  console.error("オフライン同期の有効化に失敗しました:", err.code);
});

// 4. ログイン状態と通信状態の統合監視UI更新
let currentUser = null;
let currentRoomCode = localStorage.getItem('bio_edu_room_code') || null;
let currentParticipantId = localStorage.getItem('bio_edu_participant_id') || null;
let isConnected = !!(currentRoomCode && currentParticipantId);

export function joinRoom(roomCode, participantId) {
    currentRoomCode = roomCode;
    currentParticipantId = participantId;
    isConnected = true;
    localStorage.setItem('bio_edu_room_code', roomCode);
    localStorage.setItem('bio_edu_participant_id', participantId);
    renderAuthStatus(currentUser);
}
window.handleJoinRoom = joinRoom;

export function leaveRoom() {
    currentRoomCode = null;
    currentParticipantId = null;
    isConnected = false;
    localStorage.removeItem('bio_edu_room_code');
    localStorage.removeItem('bio_edu_participant_id');
    renderAuthStatus(currentUser);
}
window.handleLeaveRoom = leaveRoom;

function renderAuthStatus(user) {
  const icon = document.getElementById("accountUserIcon");
  const text = document.getElementById("accountStatusText");
  const modalLoggedOut = document.getElementById("modalLoggedOutView");
  const modalLoggedIn = document.getElementById("modalLoggedInView");
  const userNameDisplay = document.getElementById("userNameDisplay");
  const userEmailDisplay = document.getElementById("userEmailDisplay");
  const syncBadge = document.getElementById("syncStatusBadge");
  const syncNote = document.getElementById("syncStatusNote");

  const isOnline = navigator.onLine;

  // ① アイコン & ヘッダーテキストの更新（オフライン最優先）
  if (!isOnline) {
    if (icon) icon.style.stroke = "var(--danger)";
    if (text) {
      text.textContent = "オフライン";
      text.style.color = "var(--danger)";
    }
  }

  // ② ログイン状態に応じたモーダル表示制御
  if (user && isConnected && currentRoomCode && currentParticipantId) {
    if (isOnline) {
      if (icon) icon.style.stroke = "var(--phase-color)";
      if (text) {
        text.textContent = `🟢 ${currentRoomCode} (${currentParticipantId})`;
        text.style.color = "var(--phase-color)";
      }
      if (syncBadge) {
        syncBadge.textContent = "🟢 クラウド同期中";
        syncBadge.style.color = "var(--phase-color)";
      }
      if (syncNote) syncNote.style.display = "none";
    } else {
      if (syncBadge) {
        syncBadge.textContent = "🔴 オフライン（一時停止）";
        syncBadge.style.color = "var(--danger)";
      }
      if (syncNote) syncNote.style.display = "block";
    }

    if (userNameDisplay) userNameDisplay.textContent = `${currentRoomCode} (${currentParticipantId})`;
    if (userEmailDisplay) userEmailDisplay.textContent = "";
    if (modalLoggedOut) modalLoggedOut.style.display = "none";
    if (modalLoggedIn) modalLoggedIn.style.display = "block";

  } else {
    // 【未接続（ローカル）】
    if (isOnline) {
      if (icon) icon.style.stroke = "#bdc3c7";
      if (text) {
        text.textContent = "⚪️ 未接続（ローカル）";
        text.style.color = "#bdc3c7";
      }
    }
    if (modalLoggedOut) modalLoggedOut.style.display = "block";
    if (modalLoggedIn) modalLoggedIn.style.display = "none";
  }
}

// 認証状態の変化を監視
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    renderAuthStatus(currentUser);
  } else {
    signInAnonymously(auth).catch(err => console.error("匿名認証エラー:", err));
  }
});

// 通信切断（機内モードON）と復帰（機内モードOFF）を即座に検知するリスナー
window.addEventListener("offline", () => {
  renderAuthStatus(currentUser);
});
window.addEventListener("online", () => {
  renderAuthStatus(currentUser);
});

// 5. ログアウト関数
export function logoutUser() {
  leaveRoom();
}

// 6. クラウド同期機能 (初期化多重保護、教員プリセット配信)
window.BioEduAuthSync = {
    saveCurrentWorkspace: function(data) {
        if (window.isResetting === true) return;
        if (!data || Object.keys(data).length === 0) return; // 空データ保護
        if (!isConnected || !currentRoomCode || !currentParticipantId) return;
        
        const docRef = doc(db, `rooms/${currentRoomCode}/participants/${currentParticipantId}`);
        setDoc(docRef, { workspace: data, lastUpdated: Date.now() }, { merge: true })
            .catch(err => console.error("クラウド保存エラー:", err));
    },
    importMasterPreset: async function(taskCode) {
        if (!isConnected || !currentRoomCode) return null;
        try {
            let taskRef = doc(db, `rooms/${currentRoomCode}/tasks/${taskCode}`);
            let taskSnap = await getDoc(taskRef);
            if (!taskSnap.exists()) {
                taskRef = doc(db, `master_tasks/${taskCode}`);
                taskSnap = await getDoc(taskRef);
            }
            if (taskSnap.exists()) {
                return taskSnap.data();
            }
        } catch (e) {
            console.error("プリセット取得エラー:", e);
        }
        return null;
    }
};

export const { saveCurrentWorkspace, importMasterPreset } = window.BioEduAuthSync;

export { app, auth, db };

