// 1. 引入 Firebase 必要功能
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
// 2. 貼上你的 Firebase 配置
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
const container = document.querySelector(".login-container");

document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const email = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const message = document.getElementById("message");
  const loginBtn = document.getElementById("loginBtn");

  // 基本驗證
  if (email === "" || password === "") {
    message.style.color = "red";
    message.textContent = "請輸入帳號與密碼";
    container.classList.add("shake");
    setTimeout(() => container.classList.remove("shake"), 400);
    return;
  }

  // 開始註冊邏輯
  message.style.color = "white";
  message.textContent = "正在同步至 Firebase...";
  loginBtn.disabled = true; // 防止重複點擊

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // 成功註冊並寫入 Authenticator
      message.style.color = "white";
      message.textContent = "帳號建立成功！正在跳轉...";
      
      // 保留你原本的發光效果
      container.style.boxShadow = "0 0 40px white";

      setTimeout(() => {
        window.location.href = "./index.html";
      }, 1500);
    })
    .catch((error) => {
      loginBtn.disabled = false;
      message.style.color = "red";
      
      // 處理常見錯誤
      switch (error.code) {
        case 'auth/email-already-in-use':
          message.textContent = "此帳號已存在，請直接登入";
          break;
        case 'auth/invalid-email':
          message.textContent = "Email 格式不正確";
          break;
        case 'auth/weak-password':
          message.textContent = "密碼太弱（至少需 6 位數）";
          break;
        default:
          message.textContent = "發生錯誤：" + error.message;
      }

      // 錯誤時觸發原本的抖動動畫
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

  const items = elements.map(item => ({
    el: item.el,
    text: item.text,
    done: false
  }));

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
        item.done = true;
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

const elementsToScramble = [
  { el: document.getElementById("loginTitle"), text: "SIGN IN" },
  { el: document.getElementById("usernameLabel"), text: "username" },
  { el: document.getElementById("passwordLabel"), text: "password" },
  { el: document.getElementById("loginBtn"), text: "LOGIN" }
];

scrambleFlow(elementsToScramble, 20, 10, () => {
  // 文字完成後先觸發光暈
  container.classList.add("glow-active");

  // 延遲 500ms 再開始輸入框線條動畫
  setTimeout(() => {
    document.querySelectorAll(".input-group input").forEach(input => {
      input.classList.add("animate-line");
    });

    // 再延遲 500ms 觸發背景顯示
    setTimeout(() => {
      document.body.classList.add("bg-visible");
    }, 500); // 調整這個時間控制背景出現的節奏
  }, 500);
});
