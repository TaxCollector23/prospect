import { NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/email/send";
import { welcomeEmail } from "@/lib/email/templates";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function POST(req: Request) {
  const rl = rateLimit(clientKey(req, "welcome"), { limit: 10, windowMs: 60_000 });
  if (!rl.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 422 });
  }

  const { subject, html } = welcomeEmail(parsed.data.name);
  const result = await sendEmail({ to: parsed.data.email, subject, html });
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
