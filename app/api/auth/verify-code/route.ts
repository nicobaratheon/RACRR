import { createHash } from "crypto";
import { prisma } from "@/lib/db";
import { errorResponse, jsonResponse } from "@/lib/http";
import { signSession } from "@/lib/auth";

const MAX_ATTEMPTS = 5;

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : null;
  const code = typeof body?.code === "string" ? body.code.trim() : null;
  if (!email || !code) return errorResponse("missing_fields", 400);

  const invalid = () =>
    errorResponse("invalid_code", 401, "Invalid or expired code");

  const otp = await prisma.emailOtp.findUnique({ where: { email } });
  if (!otp) return invalid();
  if (otp.expiresAt.getTime() < Date.now()) return invalid();
  if (otp.attempts >= MAX_ATTEMPTS) return invalid();

  if (otp.codeHash !== hashCode(code)) {
    await prisma.emailOtp.update({
      where: { email },
      data: { attempts: { increment: 1 } },
    });
    return invalid();
  }

  // Single-use — clear it before issuing a session.
  await prisma.emailOtp.delete({ where: { email } });

  const user = await prisma.user.upsert({
    where: { email },
    create: { email },
    update: {},
  });

  const token = await signSession(user.id, user.email);
  return jsonResponse({
    token,
    user: { id: user.id, email: user.email, displayName: user.displayName },
  });
}
