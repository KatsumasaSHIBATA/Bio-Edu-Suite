import os
import re

auth_sync_path = "auth_sync.js"
session_workspace_path = "js/session_workspace.js"

auth_sync_content = """import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
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
const db = getFirestore(app);const db = getFirestore(app);（Iconst db�const db���const db = getFirestosistence(dbconst db = getFirestore(app);const db = getFirest��同期の有効化に失敗しました:", err.code);
});

// 4. ログイン状態と通信状態の統合監視UI// 4. ログイン状態と通信状態の統合監視UI// 4. ログイン状態と通信状態の統合監視UI// 4. ログイン�loc// 4. ログイン状態と通信状態の統合監視UI// 4. ログイン状態と通信状態の統合監視UI// 4. ログイン状態と通roomCode, participantId) {
    currentRoomCode = roomCode;
    currentParticipantId = participantId;
    isConnected = true;
    localStorage.setItem('bio_edu_room_code', roomCode);
    localStorage.setItem('bio_edu_participant_id', participan    localStorage.setItem('bio_rentUse    localStorage.setItem('bio_edu_participant_i functi    localStorage.setIterrentRoomCode    localStorage.setItemicipantId = null;
    isConnected = false;
                           ('bio_edu_room_code');
    localStorage.removeItem('bio_edu_participant_id');
    renderAuthStatus(currentUser);
}
window.handleLeaveRoom = leaveRoom;

function renderAuthStatus(user) {
  const icon = document.getElementById("ac  const icon = document.getElementById("ac  const icon = document.getElementById("ac  const icon = document.getElementById("ac  const icon = document.getElementById("ac  const icon = document.getElementById("ac  const icon = document.getElementById("ac  const icon = document.getElementById("ac  const icon = document.getElementById("ac  const icon = documey");
  const syncBadge = document.  const syncBadge = document.  const synst  const syncBadge = doet  const syncBadge = document.  const syncBadge = documega  const syncBadge = document.  const syncBadge = document.  const synst  const syncBadge = doet  const syncBadge = document.  const syncBadge = documega  const syncBadge = document.  const syncBadge = document.  const synsイン";
      text.style.color =      text.style.color =      text.style.colo��ン      text.style.color =      text.style.color =    r && isConnected && currentRoomCode && currentParticipantId) {
    if (isOnli    if (isOnli    if (isOnli    .s    if (isOnli    if (isOnli    if (isOnli    .s    if (isOnli    if (isOnli    if (isOnli    .s    if (isOnli    if (isOnli    if (isOnli    .s    if (isOnli    if (isOnli    if (isOnli    .s    if (isOnli    if (isOnli    if (isOnli    .s    if (isOnli    if (isOnli    if (isOnli    .s    if (isOnli    if (isOnli    if (isOnli    .s    if (isOnli    if (isOnli    if (isOnli    .s    if (isOnli      if (syncBadge) {
        syncBadge.textContent = "🔴 オフライン（一時停止）";
        syncBadge.style.color = "var(--danger)";
      }
      if (syncNote) syncNote.style.display = "block";
    }

    if (userNameDisplay) userNameDisplay.textContent = `${currentRoomCode} (${currentParticipantId})`;
    if (userEmailDisplay) userEmailDisplay.textContent = "";
    if (mo    if (mo    if (mo    if (mo    if (mo    if (mo    if (mo    if (mo    if (mo    if (mo    if (mo    if (mo    if (mo    if (mo    if (mo    if (mo    if (mo    if (mo    if (mo    if 
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
                                                                �証エラ�                                               ��ードON）と復帰（機内モードOFF）を即座に検知するリスナー
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
        if (window.isRes        if (window.isRes        if (window.|| Object.keys(data).l        if (window.isRes        if (�             i        if (window.isRes        if (window.isRes        if (w re        if (window.isRes        if (window.isRes        ifren  oomCo        if (window.isRes        ip        if (window.isRes    Ref, { workspace: data,        if (window.now() }, { merge: true })
            .catch(err =>            .catch(err =>            .catch(err =>            .catch(err =>            .catch(err =>            .catch(err =>            .catch(err =>            .catch(err =>            .catch(err => task            .catch(err =>            .catasks/${taskCode}`);
            let taskSnap = await getDoc(taskRef);
                                                      taskRef = doc(db, `mast                                            Snap                                                       taskRef = doc(db, `mast                             p.dat                                        
            console.error("プリセット取得エラー:", e);
        }
        return null;
    }
};

export const { saveCurrentWorkspace, importMasterPreset } = window.BioEduAuthSync;

export { app, auth, db };
"""

with open(auth_sync_path, "w", encoding="utf-8") as f:
    f.write(auth_sync_content)
    
print("auth_sync.js updated.")
