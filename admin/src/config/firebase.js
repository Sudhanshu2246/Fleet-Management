import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported as isMessagingSupported,
} from "firebase/messaging";
import api from "../api/axios";

// ── Web App's Firebase Configuration ──────────────────────────────────────────
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Web Push Certificate Key Pair (VAPID key)
export const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

// ── Initialize Firebase ───────────────────────────────────────────────────────
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Analytics safely
export let analytics = null;
if (typeof window !== "undefined") {
  isAnalyticsSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// ── Initialize Messaging Safely (Browser Dependent) ───────────────────────────
let messagingInstance = null;

export const getFirebaseMessaging = async () => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return null;
  }
  try {
    const supported = await isMessagingSupported();
    if (supported) {
      if (!messagingInstance) {
        messagingInstance = getMessaging(app);
      }
      return messagingInstance;
    }
  } catch (err) {
    console.warn("⚠️ [Firebase] Messaging is not supported in this browser:", err.message);
  }
  return null;
};

/**
 * Request Web Push Notification Permission & Retrieve FCM Token
 */
export const requestNotificationPermission = async () => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.warn("⚠️ Push notifications are not supported in this environment");
    return { success: false, reason: "unsupported" };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { success: false, reason: "permission_denied", permission };
    }

    // Register Service Worker if not registered
    let swRegistration = null;
    if ("serviceWorker" in navigator) {
      const swParams = new URLSearchParams({
        apiKey: firebaseConfig.apiKey || "",
        authDomain: firebaseConfig.authDomain || "",
        projectId: firebaseConfig.projectId || "",
        storageBucket: firebaseConfig.storageBucket || "",
        messagingSenderId: firebaseConfig.messagingSenderId || "",
        appId: firebaseConfig.appId || "",
      });
      swRegistration = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${swParams.toString()}`);
      await navigator.serviceWorker.ready;
    }

    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      return { success: false, reason: "messaging_unsupported" };
    }

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    });

    if (token) {
      console.log("🔥 [Firebase] FCM Device Token obtained successfully:", token.substring(0, 20) + "...");
      // Persist locally
      localStorage.setItem("fleetiq_fcm_token", token);
      
      // Register with backend for server-initiated push
      try {
        await api.post("/alerts/fcm-token", { token });
      } catch (apiErr) {
        // Backend optional sync
        console.warn("Could not sync token to backend:", apiErr.message);
      }

      return { success: true, token, permission };
    } else {
      return { success: false, reason: "no_token" };
    }
  } catch (error) {
    console.error("❌ [Firebase] Error retrieving FCM token:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Listen for Foreground Web Push Notifications
 */
export const onForegroundMessage = async (callback) => {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    console.log("🔔 [Firebase] Foreground Message received:", payload);
    if (callback) {
      callback(payload);
    }
  });
};

// ── Firestore Real-Time Alerts Subscription ──────────────────────────────────
/**
 * Subscribe to the real-time 'alerts' collection in Firestore
 */
export const subscribeToAlerts = (onData, onError) => {
  try {
    const alertsRef = collection(db, "alerts");

    const unsubscribe = onSnapshot(
      alertsRef,
      (snapshot) => {
        const alertsList = [];
        snapshot.forEach((docSnap) => {
          const raw = docSnap.data();
          alertsList.push({
            id: docSnap.id,
            ...raw,
            createdAt: raw.createdAt?.toDate ? raw.createdAt.toDate().toISOString() : (raw.createdAtIso || new Date().toISOString()),
            time: formatTimeAgo(raw.createdAt?.toDate ? raw.createdAt.toDate() : (raw.createdAtIso ? new Date(raw.createdAtIso) : new Date())),
          });
        });

        // Client-side sort by date descending
        alertsList.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.createdAtIso || 0);
          const dateB = new Date(b.createdAt || b.createdAtIso || 0);
          return dateB - dateA;
        });

        onData(alertsList);
      },
      (error) => {
        console.warn("⚠️ [Firebase] Firestore snapshot error, using fallback:", error.message);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.error("❌ [Firebase] Failed to setup Firestore listener:", err);
    if (onError) onError(err);
    return () => {};
  }
};

/**
 * Add a new alert to Firestore
 */
export const addFirestoreAlert = async (alertData) => {
  try {
    const id = alertData.id || `ALT-${Date.now().toString().slice(-6)}`;
    const docRef = doc(db, "alerts", String(id));

    const payload = {
      ...alertData,
      id: String(id),
      status: alertData.status || "Active",
      createdAt: serverTimestamp(),
      createdAtIso: new Date().toISOString(),
    };

    const writePromise = setDoc(docRef, payload, { merge: true });
    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 2500));

    await Promise.race([writePromise, timeoutPromise]);
    console.log(`✅ [Firebase] Alert ${id} saved to Firestore`);
    return { success: true, id };
  } catch (error) {
    console.warn("⚠️ [Firebase] addFirestoreAlert non-blocking error:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Resolve an alert in Firestore
 */
export const resolveFirestoreAlert = async (alertId, resolvedBy = "Admin") => {
  try {
    const docRef = doc(db, "alerts", String(alertId));
    const writePromise = updateDoc(docRef, {
      status: "Resolved",
      resolvedBy,
      resolvedAt: serverTimestamp(),
    });
    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 2500));

    await Promise.race([writePromise, timeoutPromise]);
    console.log(`✅ [Firebase] Alert ${alertId} resolved`);
    return { success: true };
  } catch (error) {
    console.warn(`⚠️ [Firebase] resolveFirestoreAlert non-blocking error:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Dismiss an alert in Firestore
 */
export const dismissFirestoreAlert = async (alertId) => {
  try {
    const docRef = doc(db, "alerts", String(alertId));
    const writePromise = updateDoc(docRef, {
      status: "Dismissed",
    });
    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 2500));

    await Promise.race([writePromise, timeoutPromise]);
    console.log(`✅ [Firebase] Alert ${alertId} dismissed`);
    return { success: true };
  } catch (error) {
    console.warn(`⚠️ [Firebase] dismissFirestoreAlert non-blocking error:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Delete an alert from Firestore
 */
export const deleteFirestoreAlert = async (alertId) => {
  try {
    const docRef = doc(db, "alerts", String(alertId));
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error("❌ [Firebase] deleteFirestoreAlert error:", error);
    return { success: false, error: error.message };
  }
};

// ── Time Ago Formatter Helper ────────────────────────────────────────────────
function formatTimeAgo(date) {
  if (!date) return "Just now";
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffSec = Math.floor((now - d) / 1000);

  if (diffSec < 45) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}
