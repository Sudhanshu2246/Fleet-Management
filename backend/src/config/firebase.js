require("dotenv").config();
const path = require("path");
const fs = require("fs");
const admin = require("firebase-admin");
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

let app = null;
let db = null;
let messaging = null;
let isInitialized = false;

try {
  let credential = null;
  let projectId = process.env.FIREBASE_PROJECT_ID;

  // 1. Try loading full service account JSON from env (e.g. CI/CD or docker container)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const parsed =
        typeof process.env.FIREBASE_SERVICE_ACCOUNT_KEY === "string"
          ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
          : process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      credential = cert(parsed);
      projectId = parsed.project_id || projectId;
    } catch (parseErr) {
      console.warn("⚠️ [Firebase Admin] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON:", parseErr.message);
    }
  }

  // 2. Try loading individual credentials from environment variables
  if (!credential && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    credential = cert({
      projectId,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Replace literal \n with actual newlines when loaded from .env
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    });
  }

  // 3. Fallback to local serviceAccountKey.json if present
  if (!credential) {
    const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
      ? path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
      : path.join(__dirname, "serviceAccountKey.json");

    if (fs.existsSync(keyPath)) {
      try {
        const serviceAccount = require(keyPath);
        credential = cert(serviceAccount);
        projectId = serviceAccount.project_id || projectId;
      } catch (keyErr) {
        console.warn("⚠️ [Firebase Admin] Could not load local key file:", keyErr.message);
      }
    }
  }

  if (credential) {
    if (!getApps().length) {
      app = initializeApp({
        credential,
        projectId,
      });
    } else {
      app = getApps()[0];
    }

    db = getFirestore(app);
    messaging = getMessaging(app);
    isInitialized = true;
    console.log("🔥 [Firebase Admin] Initialized successfully for project:", projectId);
  } else {
    console.warn("⚠️ [Firebase Admin] No Firebase credentials found in environment or key file.");
  }
} catch (error) {
  console.error("⚠️ [Firebase Admin] Initialization error:", error.message);
}

// In-memory or Redis-backed active FCM tokens
const registeredTokens = new Set();

/**
 * Register an admin device FCM token
 */
function registerFcmToken(token) {
  if (token && typeof token === "string") {
    registeredTokens.add(token);
    return true;
  }
  return false;
}

/**
 * Sync Alert to Firestore
 */
async function syncAlertToFirestore(alertData) {
  if (!isInitialized || !db) {
    console.warn("⚠️ [Firebase Admin] Firestore not initialized, skipping sync");
    return null;
  }

  try {
    const alertRef = db.collection("alerts").doc(String(alertData.id || alertData.alertId || Date.now()));
    const payload = {
      ...alertData,
      status: alertData.status || "Active",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await alertRef.set(payload, { merge: true });
    console.log(`✅ [Firebase Admin] Alert synced to Firestore with ID: ${alertRef.id}`);
    return alertRef.id;
  } catch (error) {
    console.error("❌ [Firebase Admin] Firestore alert sync failed:", error.message);
    return null;
  }
}

/**
 * Resolve Alert in Firestore
 */
async function resolveAlertInFirestore(alertId, resolvedBy = "Admin") {
  if (!isInitialized || !db) return false;

  try {
    const alertRef = db.collection("alerts").doc(String(alertId));
    await alertRef.set(
      {
        status: "Resolved",
        resolvedBy,
        resolvedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    console.log(`✅ [Firebase Admin] Alert ${alertId} resolved in Firestore`);
    return true;
  } catch (error) {
    console.error(`❌ [Firebase Admin] Failed to resolve alert ${alertId} in Firestore:`, error.message);
    return false;
  }
}

/**
 * Send Web Push Notification via FCM
 */
async function sendPushNotification({ title, body, data = {}, token = null }) {
  if (!isInitialized || !messaging) {
    console.warn("⚠️ [Firebase Admin] Messaging not initialized, skipping push");
    return { success: false, reason: "uninitialized" };
  }

  // Stringify all data values for FCM protocol compliance
  const safeData = {};
  for (const [key, value] of Object.entries(data)) {
    safeData[key] = typeof value === "object" ? JSON.stringify(value) : String(value ?? "");
  }

  const payload = {
    notification: {
      title,
      body,
    },
    data: safeData,
    webpush: {
      notification: {
        title,
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        requireInteraction: true,
      },
      fcmOptions: {
        link: "/dashboard/alerts",
      },
    },
  };

  const tokensToSend = token ? [token] : Array.from(registeredTokens);

  if (tokensToSend.length === 0) {
    console.log("ℹ️ [Firebase Admin] No registered FCM device tokens to send push notification to");
    return { success: true, count: 0 };
  }

  let successCount = 0;
  for (const t of tokensToSend) {
    try {
      await messaging.send({ ...payload, token: t });
      successCount++;
    } catch (err) {
      console.warn(`⚠️ [Firebase Admin] Failed to send push to token ${t.substring(0, 15)}...:`, err.message);
      if (err.code === "messaging/registration-token-not-registered" || err.code === "messaging/invalid-registration-token") {
        registeredTokens.delete(t);
      }
    }
  }

  console.log(`📢 [Firebase Admin] Sent Web Push to ${successCount}/${tokensToSend.length} devices`);
  return { success: true, count: successCount };
}

module.exports = {
  admin,
  app,
  db,
  messaging,
  isInitialized,
  registerFcmToken,
  syncAlertToFirestore,
  resolveAlertInFirestore,
  sendPushNotification,
};
