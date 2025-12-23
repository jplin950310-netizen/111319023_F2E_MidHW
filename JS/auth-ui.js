import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA8i_OQPaYxPxnlyw8PBaaiT98RPCzblQg",
  authDomain: "chat-box-fac06.firebaseapp.com",
  projectId: "chat-box-fac06",
  storageBucket: "chat-box-fac06.firebasestorage.app",
  messagingSenderId: "83529081314",
  appId: "1:83529081314:web:d05c7f3f389d5f0e6ed9bb",
  measurementId: "G-QX27493210",
};

let app, auth, db;

// Try to get existing app, or create new one
try {
  app = initializeApp(firebaseConfig);
} catch (e) {
  if (e.code === "app/duplicate-app") {
    app = window.firebase.app();
  } else {
    throw e;
  }
}

auth = getAuth(app);
db = getFirestore(app);

async function getUserProfile(userId) {
  if (!userId) return null;
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (e) {
    console.error("Error fetching user profile:", e);
    return null;
  }
}

// 更新 loginbtn 顯示
function initLoginButton() {
  const loginBtnLink = document.getElementById("loginBtnLink");
  
  if (!loginBtnLink) {
    return;
  }

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // 已登入
      const userProfile = await getUserProfile(user.uid);
      
      if (userProfile) {
        if (userProfile.avatarUrl) {
          // 有頭像：顯示頭像圖片
          loginBtnLink.innerHTML = `<img src="${userProfile.avatarUrl}" alt="Profile">`;
        } else {
          // 無頭像：顯示"匿名"
          loginBtnLink.textContent = "anonymous";
        }
        loginBtnLink.href = "./profile.html";
      }
    } else {
      // 未登入
      loginBtnLink.textContent = "LOGIN";
      loginBtnLink.href = "./signin.html";
    }
  });
}

// 自動初始化
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLoginButton);
} else {
  initLoginButton();
}
