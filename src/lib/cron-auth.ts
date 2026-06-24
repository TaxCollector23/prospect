/**
 * Validates a cron request. Vercel Cron sends `Authorization: Bearer
 * $CRON_SECRET`. When CRON_SECRET is unset (e.g. local/demo) we allow the call
 * so flows can be exercised.
 */
export function isAuthorizedCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}`;
}
