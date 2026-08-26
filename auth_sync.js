import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// 4. ログイン状態の監視とステータスバッジの書き換え
onAuthStateChanged(auth, (user) => {
  const badge = document.getElementById("sync-status-badge");
  
  if (user) {
    // ログイン（同期）成功時
    console.log("Firebaseに接続しました (UID:", user.uid, ")");
    if (badge) {
      badge.textContent = "🟢 同期中";
    }
  } else {
    // ログアウト（未接続）時
    console.log("未接続。匿名ログインを試みます...");
    if (badge) {
      badge.textContent = "🔴 オフライン";
    }
    // 自動的に匿名ログインを実行
    signInAnonymously(auth).catch((error) => {
      console.error("ログインエラー:", error);
    });
  }
});

// 5. Googleアカウントでのポップアップログイン関数
export function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then((result) => {
      console.log("Googleログイン成功:", result.user.email);
      alert("Googleアカウントでログインしました！");
    })
    .catch((error) => {
      console.error("ログインエラー:", error);
      alert("ログインに失敗しました: " + error.message);
    });
}

// 6. ルーム参加コード（Kahoot方式）の処理用関数
export function joinRoomCode() {
  const codeInput = document.getElementById("roomCodeInput");
  if (!codeInput) return;
  const roomCode = codeInput.value.trim();
  
  if (!roomCode) {
    alert("ルームコードを入力してください。");
    return;
  }
  
  localStorage.setItem("bio_edu_room_code", roomCode);
  alert(`ルーム「${roomCode}」に参加しました！`);
  console.log("ルーム参加コード:", roomCode);
}

// 他のファイルから呼び出せるようにエクスポート（重複なし）
export { app, auth, db, loginWithGoogle, joinRoomCode };
