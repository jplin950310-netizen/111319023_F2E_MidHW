// 统一的Firebase初始化和配置
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyA8i_OQPaYxPxnlyw8PBaaiT98RPCzblQg",
  authDomain: "chat-box-fac06.firebaseapp.com",
  projectId: "chat-box-fac06",
  storageBucket: "chat-box-fac06.firebasestorage.app",
  messagingSenderId: "83529081314",
  appId: "1:83529081314:web:d05c7f3f389d5f0e6ed9bb",
  measurementId: "G-QX27493210",
};

let app;
try {
  app = initializeApp(firebaseConfig);
} catch (e) {
  if (e.code !== "app/duplicate-app") throw e;
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
