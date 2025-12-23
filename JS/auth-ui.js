import { auth } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getUserProfile, getDisplayName, getAvatarUrl } from "./user-service.js";

// 更新 loginbtn 顯示
function initLoginButton() {
  // 支援有 id 或只有 .loginbtn a 的頁面
  const loginBtnLink = document.getElementById("loginBtnLink") || document.querySelector(".loginbtn a");
  if (!loginBtnLink) return;
  const loginBtn = loginBtnLink.closest(".loginbtn");

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // 已登入
      const userProfile = await getUserProfile(user.uid);
      const displayName = getDisplayName(userProfile, user);
      const avatarUrl = getAvatarUrl(userProfile, user);

      if (avatarUrl) {
        loginBtnLink.innerHTML = `<img src="${avatarUrl}" alt="${displayName}">`;
        if (loginBtn) loginBtn.classList.add("has-avatar");
      } else {
        loginBtnLink.textContent = displayName;
        if (loginBtn) loginBtn.classList.remove("has-avatar");
      }
      loginBtnLink.href = "./profile.html";
    } else {
      // 未登入
      loginBtnLink.textContent = "LOGIN";
      loginBtnLink.href = "./signin.html";
      if (loginBtn) loginBtn.classList.remove("has-avatar");
    }
  });
}

// 自動初始化
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLoginButton);
} else {
  initLoginButton();
}
