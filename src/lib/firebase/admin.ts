import "server-only";
import {
  getApps,
  initializeApp,
  cert,
  getApp,
  type App,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function buildCredential() {
  // Option A: full service-account JSON in one env var.
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (raw) {
    try {
      const json = JSON.parse(raw);
      return cert({
        projectId: json.project_id,
        clientEmail: json.client_email,
        privateKey: (json.private_key as string)?.replace(/\\n/g, "\n"),
      });
    } catch {
      /* fall through */
    }
  }

  // Option B: discrete fields.
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (projectId && clientEmail && privateKey) {
    return cert({ projectId, clientEmail, privateKey });
  }
  return null;
}

let adminApp: App | null = null;
let adminAuthInstance: Auth | null = null;
let adminDbInstance: Firestore | null = null;

export const isAdminConfigured = Boolean(buildCredential());

if (isAdminConfigured) {
  const credential = buildCredential();
  adminApp = getApps().length
    ? getApp()
    : initializeApp({ credential: credential! });
  adminAuthInstance = getAuth(adminApp);
  adminDbInstance = getFirestore(adminApp);
}

export const adminAuth = adminAuthInstance;
export const adminDb = adminDbInstance;
export { adminApp };
