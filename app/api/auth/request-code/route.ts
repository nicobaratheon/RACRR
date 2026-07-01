import { createHash, randomInt } from "crypto";
import { Resend } from "resend";
import { prisma } from "@/lib/db";
import { errorResponse, jsonResponse } from "@/lib/http";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COOLDOWN_MS = 60_000;
const OTP_TTL_MS = 10 * 60_000;

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : null;
  if (!email || !EMAIL_RE.test(email)) {
    return errorResponse("invalid_email", 400);
  }

  // Never reveal whether this email already has an account — same 200 either way.
  const existing = await prisma.emailOtp.findUnique({ where: { email } });
  if (existing && Date.now() - existing.requestedAt.getTime() < COOLDOWN_MS) {
    return jsonResponse({ ok: true });
  }

  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  const now = new Date();
  const data = {
    codeHash: hashCode(code),
    expiresAt: new Date(now.getTime() + OTP_TTL_MS),
    attempts: 0,
    requestedAt: now,
  };
  await prisma.emailOtp.upsert({
    where: { email },
    create: { email, ...data },
    update: data,
  });

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    // Resend's shared sandbox sender — works without verifying a custom
    // domain. Swap to a verified domain address before real production use.
    from: "racr <onboarding@resend.dev>",
    to: email,
    subject: "Your racr sign-in code",
    text: `Your code is ${code}. It expires in 10 minutes.`,
  });

  return jsonResponse({ ok: true });
}
