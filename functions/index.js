/**
 * Prospect Cloud Functions — architecture scaffold.
 *
 * These triggers keep search in sync and recompute quality scores as
 * opportunities change. They are intentionally lightweight; the heavier
 * ingestion + email flows run as Next.js route handlers + Vercel Cron
 * (see src/app/api). Deploy with: `firebase deploy --only functions`.
 */
const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");

initializeApp();

/**
 * Mirror opportunity writes into Algolia (when configured). Wire up the
 * Algolia admin client here using functions config / secrets.
 */
exports.syncOpportunityToAlgolia = onDocumentWritten(
  "opportunities/{id}",
  async (event) => {
    const after = event.data?.after?.data();
    if (!after) {
      // Document deleted — remove from the index here.
      return;
    }
    // TODO: index `after` into Algolia using ALGOLIA_ADMIN_KEY.
    return;
  },
);
