import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
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

// 4. ログイン状態と通信状態の統合監視UI更新
let currentUser = null;

function renderAuthStatus(user) {
  const icon = document.getElementById("accountUserIcon");
  const text = document.getElementById("accountStatusText");
  const modalLoggedOut = document.getElementById("modalLoggedOutView");
  const modalLoggedIn = document.getElementById("modalLoggedInView");
  const userNameDisplay = document.getElementById("userNameDisplay");
  const userEmailDisplay = document.getElementById("userEmailDisplay");

  // ① 通信オフライン（機内モード等）のときは最優先で赤色にする
  if (!navigator.onLine) {
    if (icon) icon.style.stroke = "var(--danger)";
    if (text) {
      text.textContent = "オフライン";
      text.style.color = "var(--danger)";
    }
    return;
  }

  // ② オンライン時の通常判定
  if (user && !user.isAnonymous) {
    // 【Googleログイン中】 -> テーマカラー（緑）
    const shortName = user.displayName || (user.email ? user.email.split('@')[0] : "同期中");
    
    if (icon) icon.style.stroke = "var(--phase-color)";
    if (text) {
      text.textContent = shortName;
      text.style.color = "var(--phase-color)";
    }
    if (userNameDisplay) userNameDisplay.textContent = user.displayName || shortName;
    if (userEmailDisplay) userEmailDisplay.textContent = user.email || "";
    if (modalLoggedOut) modalLoggedOut.style.display = "none";
    if (modalLoggedIn) modalLoggedIn.style.display = "block";

  } else if (user && user.isAnonymous) {
    // 【ゲスト（匿名接続）】 -> グレー
    if (icon) icon.style.stroke = "#bdc3c7";
    if (text) {
      text.textContent = "ゲスト";
      text.style.color = "#bdc3c7";
    }
    if (modalLoggedOut) modalLoggedOut.style.display = "block";
    if (modalLoggedIn) modalLoggedIn.style.display = "none";

  } else {
    // 【未接続・初期化中】 -> グレー（自動匿名ログインを試行）
    if (icon) icon.style.stroke = "#bdc3c7";
    if (text) {
      text.textContent = "接続中...";
      text.style.color = "#bdc3c7";
    }
    if (modalLoggedOut) modalLoggedOut.style.display = "block";
    if (modalLoggedIn) modalLoggedIn.style.display = "none";

    signInAnonymously(auth).catch((error) => {
      console.error("匿名ログインエラー:", error);
    });
  }
}

// 認証状態の変化を監視
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  renderAuthStatus(currentUser);
});

// 通信切断（機内モードON）と復帰（機内モードOFF）を即座に検知するリスナー
window.addEventListener("offline", () => {
  renderAuthStatus(currentUser);
});
window.addEventListener("online", () => {
  renderAuthStatus(currentUser);
});

// 5. Googleログイン関数
export function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then((result) => {
      console.log("Googleログイン成功:", result.user.email);
    })
    .catch((error) => {
      console.error("ログインエラー:", error);
      alert("ログインに失敗しました: " + error.message);
    });
}

// 6. ログアウト関数
export function logoutUser() {
  signOut(auth)
    .then(() => {
      // ログアウト後は自動で匿名ゲストに戻す
      signInAnonymously(auth);
    })
    .catch((error) => {
      console.error("ログアウトエラー:", error);
    });
}

export { app, auth, db };
