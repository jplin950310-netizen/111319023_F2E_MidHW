import { auth, db, storage } from "./firebase-init.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { getUserProfile, getDisplayName, getAvatarUrl } from "./user-service.js";

let currentUser = null;
let currentUserProfile = null;

function initProfile() {
  const loginPrompt = document.getElementById("login-prompt");
  const profileContent = document.getElementById("profile-content");
  const profileDisplayName = document.getElementById("profile-displayName");
  const profileEmail = document.getElementById("profile-email");
  const profileAvatar = document.getElementById("profile-avatar");
  const profileAvatarPlaceholder = document.getElementById("profile-avatar-placeholder");
  const updateDisplayNameBtn = document.getElementById("update-displayName");
  const uploadAvatarBtn = document.getElementById("upload-avatar");
  const newDisplayNameInput = document.getElementById("new-displayName");
  const avatarFileInput = document.getElementById("avatar-file");
  const logoutBtn = document.getElementById("logout-btn");
  const loginBtnLink = document.getElementById("loginBtnLink");
  const loginBtn = loginBtnLink ? loginBtnLink.closest(".loginbtn") : null;

  // 監聽登入狀態
  onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (user) {
      // 已登入
      currentUserProfile = await getUserProfile(user.uid);

      if (loginPrompt) loginPrompt.style.display = "none";
      if (profileContent) profileContent.style.display = "flex";

      if (currentUserProfile) {
        // 更新顯示
        if (profileDisplayName) profileDisplayName.textContent = currentUserProfile.displayName || user.email.split('@')[0];
        if (profileEmail) profileEmail.textContent = user.email;

        if (currentUserProfile.avatarUrl) {
          if (profileAvatar) {
            profileAvatar.src = currentUserProfile.avatarUrl;
            profileAvatar.style.display = "block";
          }
          if (profileAvatarPlaceholder) {
            profileAvatarPlaceholder.style.display = "none";
          }
        } else {
          if (profileAvatarPlaceholder) {
            const displayName = currentUserProfile.displayName || user.email.split('@')[0];
            profileAvatarPlaceholder.textContent = displayName.charAt(0).toUpperCase();
          }
        }

        // 更新 loginbtn：顯示頭像或顯示名稱（與 auth-ui 行為一致）
        if (loginBtnLink) {
          const displayName = getDisplayName(currentUserProfile, user);
          const avatarUrl = getAvatarUrl(currentUserProfile, user);

          if (avatarUrl) {
            loginBtnLink.innerHTML = `<img src="${avatarUrl}" alt="${displayName}">`;
            if (loginBtn) loginBtn.classList.add("has-avatar");
          } else {
            loginBtnLink.textContent = displayName;
            if (loginBtn) loginBtn.classList.remove("has-avatar");
          }
          loginBtnLink.href = "./profile.html";
        }
      }
    } else {
      // 未登入
      if (loginPrompt) loginPrompt.style.display = "block";
      if (profileContent) profileContent.style.display = "none";

      if (loginBtnLink) {
        loginBtnLink.textContent = "LOGIN";
        loginBtnLink.href = "./signin.html";
        if (loginBtn) loginBtn.classList.remove("has-avatar");
      }
    }
  });

  // 更新顯示名稱
  if (updateDisplayNameBtn && newDisplayNameInput) {
    updateDisplayNameBtn.addEventListener("click", async () => {
      if (!currentUser) return;

      const newName = newDisplayNameInput.value.trim();
      if (!newName) {
        alert("請輸入新的顯示名稱");
        return;
      }

      try {
        await setDoc(doc(db, "users", currentUser.uid), {
          displayName: newName,
        }, { merge: true });

        currentUserProfile = currentUserProfile || {};
        currentUserProfile.displayName = newName;
        profileDisplayName.textContent = newName;
        newDisplayNameInput.value = "";
        
        // 更新 placeholder
        if (profileAvatarPlaceholder && !currentUserProfile.avatarUrl) {
          profileAvatarPlaceholder.textContent = newName.charAt(0).toUpperCase();
        }
        
        alert("顯示名稱已更新！");
      } catch (e) {
        alert(`更新失敗：${e.message}`);
      }
    });
  }

  // 上傳並更新頭像
  if (uploadAvatarBtn && avatarFileInput) {
    uploadAvatarBtn.addEventListener("click", async () => {
      if (!currentUser) return;

      const file = avatarFileInput.files?.[0];
      if (!file) {
        alert("請選擇要上傳的圖片");
        return;
      }

      try {
        uploadAvatarBtn.disabled = true;
        const originalText = uploadAvatarBtn.textContent;
        uploadAvatarBtn.textContent = "上傳中...";

        const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
        const avatarRef = ref(storage, `avatars/${currentUser.uid}/${Date.now()}_${safeName}`);
        console.log("Starting upload to:", avatarRef.fullPath);
        const snapshot = await uploadBytes(avatarRef, file);
        console.log("Upload complete, getting download URL...");
        const downloadUrl = await getDownloadURL(snapshot.ref);
        console.log("Download URL obtained:", downloadUrl);

        await setDoc(doc(db, "users", currentUser.uid), {
          avatarUrl: downloadUrl,
        }, { merge: true });

        currentUserProfile = currentUserProfile || {};
        currentUserProfile.avatarUrl = downloadUrl;
        if (profileAvatar) {
          profileAvatar.src = downloadUrl;
          profileAvatar.style.display = "block";
        }
        if (profileAvatarPlaceholder) {
          profileAvatarPlaceholder.style.display = "none";
        }

        const loginBtnLink = document.getElementById("loginBtnLink");
        if (loginBtnLink) {
          loginBtnLink.innerHTML = `<img src="${downloadUrl}" alt="Profile">`;
          const loginBtn = loginBtnLink.closest(".loginbtn");
          if (loginBtn) loginBtn.classList.add("has-avatar");
        }

        avatarFileInput.value = "";
        alert("頭像已更新！");
        uploadAvatarBtn.textContent = originalText;
        uploadAvatarBtn.disabled = false;
      } catch (e) {
        console.error("Avatar upload/update failed:", e);
        console.error("Error code:", e.code);
        console.error("Error message:", e.message);
        let errorMsg = e.message || "未知錯誤";
        if (e.code === "storage/unauthorized") {
          errorMsg = "無權上傳：請檢查 Firebase Storage 規則";
        } else if (e.code === "storage/invalid-argument") {
          errorMsg = "檔案或路徑無效";
        } else if (e.code === "storage/retry-limit-exceeded") {
          errorMsg = "上傳逾時，請檢查網路";
        }
        alert(`更新失敗：${errorMsg}`);
        uploadAvatarBtn.disabled = false;
        uploadAvatarBtn.textContent = originalText || "上傳並更新";
      }
    });
  }

  // 登出
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      signOut(auth).then(() => {
        window.location.href = "./index.html";
      }).catch((error) => {
        alert(`登出失敗：${error.message}`);
      });
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initProfile);
} else {
  initProfile();
}
