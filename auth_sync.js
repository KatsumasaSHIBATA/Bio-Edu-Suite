import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
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
      // 必要に応じて色を変更するスタイルを追加できます
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

// 他のファイルから呼び出せるようにエクスポート
export { app, auth, db };
