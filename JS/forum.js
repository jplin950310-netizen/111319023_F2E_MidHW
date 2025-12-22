import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Same Firebase project used by `JS/interactive_login.js`
const firebaseConfig = {
  apiKey: "AIzaSyA8i_OQPaYxPxnlyw8PBaaiT98RPCzblQg",
  authDomain: "chat-box-fac06.firebaseapp.com",
  projectId: "chat-box-fac06",
  storageBucket: "chat-box-fac06.firebasestorage.app",
  messagingSenderId: "83529081314",
  appId: "1:83529081314:web:d05c7f3f389d5f0e6ed9bb",
  measurementId: "G-QX27493210",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatTime(ts) {
  try {
    const d = ts?.toDate ? ts.toDate() : ts ? new Date(ts) : null;
    if (!d || Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function renderMessages(messagesContainer, docs) {
  if (!docs.length) {
    messagesContainer.innerHTML = '<div class="loading">目前還沒有留言</div>';
    return;
  }

  const html = docs
    .map((docSnap) => {
      const data = docSnap.data() || {};
      const username = escapeHtml(data.username || "匿名");
      const subject = escapeHtml(data.subject || "");
      const content = escapeHtml(data.content || "");
      const time = formatTime(data.createdAt);

      return `
        <article class="msg">
          <header class="msg-head">
            <div class="msg-who">
              <strong class="msg-user">${username}</strong>
              ${subject ? `<span class="msg-subject">｜${subject}</span>` : ""}
            </div>
            ${time ? `<time class="msg-time">${time}</time>` : ""}
          </header>
          <p class="msg-content">${content}</p>
        </article>
      `;
    })
    .join("");

  messagesContainer.innerHTML = html;
}

function initForum() {
  const usernameEl = document.getElementById("username");
  const subjectEl = document.getElementById("subject");
  const contentEl = document.getElementById("content");
  const submitBtn = document.getElementById("submit-btn");
  const messagesContainer = document.getElementById("messages-container");
  const formEl = document.getElementById("message-form");

  if (!usernameEl || !subjectEl || !contentEl || !submitBtn || !messagesContainer || !formEl) {
    // Forum DOM not present (or IDs changed)
    return;
  }

  // Realtime listener
  const messagesRef = collection(db, "forumMessages");
  const q = query(messagesRef, orderBy("createdAt", "desc"));

  onSnapshot(
    q,
    (snapshot) => {
      renderMessages(messagesContainer, snapshot.docs);
    },
    (err) => {
      messagesContainer.innerHTML = `<div class="loading">載入失敗：${escapeHtml(err?.message || "未知錯誤")}</div>`;
    }
  );

  async function postMessage() {
    const username = usernameEl.value.trim();
    const subject = subjectEl.value.trim();
    const content = contentEl.value.trim();

    if (!username || !content) return;

    submitBtn.disabled = true;
    try {
      await addDoc(messagesRef, {
        username,
        subject,
        content,
        createdAt: serverTimestamp(),
      });

      contentEl.value = "";
      subjectEl.value = "";
    } catch (e) {
      alert(`送出失敗：${e?.message || e}`);
    } finally {
      submitBtn.disabled = false;
    }
  }

  submitBtn.addEventListener("click", postMessage);
  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    postMessage();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initForum);
} else {
  initForum();
}
