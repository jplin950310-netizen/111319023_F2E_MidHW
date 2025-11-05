// 選取容器
const container = document.querySelector(".login-container");

// 登入表單互動
document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const message = document.getElementById("message");

  if (username === "" || password === "") {
    message.style.color = "red";
    message.textContent = "請輸入帳號與密碼";
  } else {
    message.style.color = "white";
    message.textContent = "登入成功！";
    container.style.boxShadow = "0 0 40px white";

    // 延遲 0.6 秒顯示歡迎提示
    setTimeout(() => {
      // 再延遲一點跳轉到你要的頁面
      setTimeout(() => {
        window.location.href = "../主頁/index.html"; // ← 這裡改成你的目標檔案
      }, 500);
    }, 600);
  }
});

// 動態樣式：光暈 & 抖動
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

// 自然亂碼動畫，逐字完成再到下一字
function scrambleFlow(elements, speed = 30, maxScramble = 10, onComplete = null) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:',.<>/?";

  const items = elements.map(item => ({
    el: item.el,
    text: item.text,
    done: false
  }));

  // 初始化：文字空白
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
        setTimeout(processNextElement, 100); // 元素間稍停
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
          processNextChar(); // 下一個字
        }
      }, speed);
    }

    processNextChar();
  }

  processNextElement();
}

// 初始化元素
const elementsToScramble = [
  { el: document.getElementById("loginTitle"), text: "SIGN IN" },
  { el: document.getElementById("usernameLabel"), text: "username" },
  { el: document.getElementById("passwordLabel"), text: "password" },
  { el: document.getElementById("loginBtn"), text: "LOGIN" }
];

// 呼叫亂碼動畫
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
