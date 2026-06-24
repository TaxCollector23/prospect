/**
 * Seed Firestore with the demo opportunity set.
 *
 *   FIREBASE_SERVICE_ACCOUNT_KEY='{...}' pnpm seed
 *
 * Requires Firebase Admin credentials (see .env.example). Safe to re-run — it
 * upserts by id.
 */
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { SEED_OPPORTUNITIES } from "../src/lib/data/seed";

function credential() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (raw) {
    const json = JSON.parse(raw);
    return cert({
      projectId: json.project_id,
      clientEmail: json.client_email,
      privateKey: (json.private_key as string).replace(/\\n/g, "\n"),
    });
  }
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } =
    process.env;
  if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
    return cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    });
  }
  return null;
}

async function main() {
  const cred = credential();
  if (!cred) {
    console.error(
      "✗ No Firebase Admin credentials found. Set FIREBASE_SERVICE_ACCOUNT_KEY.",
    );
    process.exit(1);
  }

  const app = getApps().length ? getApps()[0]! : initializeApp({ credential: cred });
  const db = getFirestore(app);

  console.log(`Seeding ${SEED_OPPORTUNITIES.length} opportunities…`);
  let batch = db.batch();
  let count = 0;
  for (const o of SEED_OPPORTUNITIES) {
    const { id, ...data } = o;
    batch.set(db.collection("opportunities").doc(id), data, { merge: true });
    count++;
    if (count % 400 === 0) {
      await batch.commit();
      batch = db.batch();
    }
  }
  await batch.commit();
  console.log(`✓ Seeded ${count} opportunities.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
