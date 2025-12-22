import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA8i_OQPaYxPxnlyw8PBaaiT98RPCzblQg",
  authDomain: "chat-box-fac06.firebaseapp.com",
  projectId: "chat-box-fac06",
  storageBucket: "chat-box-fac06.firebasestorage.app",
  messagingSenderId: "83529081314",
  appId: "1:83529081314:web:d05c7f3f389d5f0e6ed9bb",
  measurementId: "G-QX27493210"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const container = document.querySelector(".login-container");
const form = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const signUpBtn = document.getElementById("loginBtn1");
const message = document.getElementById("message");

function getCredentials() {
  const email = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    message.style.color = "red";
    message.textContent = "請輸入帳號與密碼";
    container.classList.add("shake");
    setTimeout(() => container.classList.remove("shake"), 400);
    return null;
  }

  return { email, password };
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const creds = getCredentials();
  if (!creds) return;

  const { email, password } = creds;

  message.style.color = "white";
  message.textContent = "登入中...";
  loginBtn.disabled = true;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      message.textContent = "登入成功，跳轉中...";
      container.style.boxShadow = "0 0 40px white";

      setTimeout(() => {
        window.location.href = "./index2.html";
      }, 1200);
    })
    .catch((error) => {
      loginBtn.disabled = false;
      message.style.color = "red";

      switch (error.code) {
        case "auth/user-not-found":
          message.textContent = "帳號不存在";
          break;
        case "auth/wrong-password":
          message.textContent = "密碼錯誤";
          break;
        case "auth/invalid-email":
          message.textContent = "Email 格式錯誤";
          break;
        default:
          message.textContent = error.message;
      }

      container.classList.add("shake");
      setTimeout(() => container.classList.remove("shake"), 400);
    });
});

signUpBtn.addEventListener("click", () => {
  const creds = getCredentials();
  if (!creds) return;

  const { email, password } = creds;

  message.style.color = "white";
  message.textContent = "建立帳號中...";
  signUpBtn.disabled = true;

  createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;
      
      // 創建用戶個人資料文件
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        displayName: user.email.split('@')[0], // 預設顯示名稱為 email 前綴
        avatarUrl: "", // 預設無頭像
        createdAt: new Date(),
      });

      message.textContent = "帳號建立成功！";
      container.style.boxShadow = "0 0 40px white";

      setTimeout(() => {
        window.location.href = "./index2.html";
      }, 1200);
    })
    .catch((error) => {
      signUpBtn.disabled = false;
      message.style.color = "red";

      switch (error.code) {
        case "auth/email-already-in-use":
          message.textContent = "此帳號已存在";
          break;
        case "auth/weak-password":
          message.textContent = "密碼至少 6 碼";
          break;
        case "auth/invalid-email":
          message.textContent = "Email 格式錯誤";
          break;
        default:
          message.textContent = error.message;
      }

      container.classList.add("shake");
      setTimeout(() => container.classList.remove("shake"), 400);
    });
});

const style = document.createElement("style");
style.innerHTML = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-10px); }
  40%, 80% { transform: translateX(10px); }
}
.shake { animation: shake 0.4s; }

@keyframes glowFadeIn {
  0% {
    border-color: rgba(255, 255, 255, 1);
    box-shadow: 0 0 25px rgba(82, 82, 82, 1);
    background: rgba(0,0,0,0);
  }
  100% {
    border-color: white;
    box-shadow: 0 0 25px white;
    background: rgba(0,0,0,0.7);
  }
}
.glow-active {
  animation: glowFadeIn 2s infinite alternate;
}
`;
document.head.appendChild(style);

function scrambleFlow(elements, speed = 30, maxScramble = 10, onComplete = null) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:',.<>/?";
  const items = elements.map(item => ({ ...item, done: false }));

  items.forEach(item => {
    item.el.textContent = " ".repeat(item.text.length);
  });

  let currentIndex = 0;

  function processNextElement() {
    if (currentIndex >= items.length) {
      if (onComplete) onComplete();
      return;
    }

    const item = items[currentIndex];
    let charIndex = 0;

    function processNextChar() {
      if (charIndex >= item.text.length) {
        currentIndex++;
        setTimeout(processNextElement, 100);
        return;
      }

      const targetChar = item.text[charIndex];
      const randomTimes = Math.floor(Math.random() * maxScramble) + 5;
      let count = 0;

      const interval = setInterval(() => {
        const display = item.el.textContent.split("");
        if (count < randomTimes) {
          display[charIndex] = chars[Math.floor(Math.random() * chars.length)];
          item.el.textContent = display.join("");
          count++;
        } else {
          display[charIndex] = targetChar;
          item.el.textContent = display.join("");
          clearInterval(interval);
          charIndex++;
          processNextChar();
        }
      }, speed);
    }

    processNextChar();
  }

  processNextElement();
}

scrambleFlow([
  { el: document.getElementById("loginTitle"), text: "SIGN IN" },
  { el: document.getElementById("usernameLabel"), text: "email" },
  { el: document.getElementById("passwordLabel"), text: "password" },
  { el: loginBtn, text: "LOGIN" },
  { el: signUpBtn, text: "SIGN UP" },
], 20, 10, () => {
  container.classList.add("glow-active");

  setTimeout(() => {
    document.querySelectorAll(".input-group input").forEach(input => {
      input.classList.add("animate-line");
    });

    setTimeout(() => {
      document.body.classList.add("bg-visible");
    }, 500);
  }, 500);
});
