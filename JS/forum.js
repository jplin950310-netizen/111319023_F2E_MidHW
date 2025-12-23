import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getUserProfile } from "./user-service.js";

let currentUser = null;
let currentUserProfile = null;

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
      const username = escapeHtml(data.displayName || data.username || "匿名");
      const subject = escapeHtml(data.subject || "");
      const content = escapeHtml(data.content || "");
      const time = formatTime(data.createdAt);
      const avatarUrl = data.avatarUrl || "";

      // 頭像顯示：有頭像用圖片，無頭像顯示首字母
      const avatarHtml = avatarUrl 
        ? `<img src="${escapeHtml(avatarUrl)}" alt="avatar" class="msg-avatar">`
        : `<div class="msg-avatar-placeholder">${username.charAt(0).toUpperCase()}</div>`;

      return `
        <article class="msg">
          <header class="msg-head">
            <div class="msg-who">
              ${avatarHtml}
              <div class="msg-info">
                <strong class="msg-user">${username}</strong>
                ${subject ? `<span class="msg-subject">｜${subject}</span>` : ""}
              </div>
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

  // 監聽登入狀態
  onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    
    if (user) {
      // 已登入：讀取用戶資料
      currentUserProfile = await getUserProfile(user.uid);
      
      if (currentUserProfile) {
        usernameEl.value = currentUserProfile.displayName || user.email;
        usernameEl.disabled = true;
        usernameEl.placeholder = "已登入";
      }
    } else {
      // 未登入：允許手動輸入
      usernameEl.disabled = false;
      usernameEl.placeholder = "你的暱稱（未登入）";
      usernameEl.value = "";
    }
  });

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
      const messageData = {
        username,
        subject,
        content,
        createdAt: serverTimestamp(),
      };
      
      // 如果已登入，附加用戶資料
      if (currentUser && currentUserProfile) {
        messageData.userId = currentUser.uid;
        messageData.displayName = currentUserProfile.displayName || currentUser.email;
        messageData.avatarUrl = currentUserProfile.avatarUrl || "";
      }
      
      await addDoc(messagesRef, messageData);

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
