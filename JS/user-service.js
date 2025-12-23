// 共用的用户服务函数
import { db } from "./firebase-init.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function getUserProfile(userId) {
  if (!userId) return null;
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (e) {
    console.error("Error fetching user profile:", e);
    return null;
  }
}

export function getDisplayName(userProfile, user) {
  return (
    (userProfile && (userProfile.displayName || userProfile.name)) ||
    user?.displayName ||
    (user?.email ? user.email.split("@")[0] : "User")
  );
}

export function getAvatarUrl(userProfile, user) {
  return (userProfile && userProfile.avatarUrl) || user?.photoURL || null;
}
