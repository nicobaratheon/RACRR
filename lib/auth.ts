import { jwtVerify, SignJWT } from "jose";

function secret(): Uint8Array {
  const value = process.env.JWT_SECRET;
  if (!value) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(value);
}

export class AuthError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function signSession(userId: string, email: string): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
}

/** Reads + verifies the Bearer JWT on a request. Throws AuthError(401) on anything wrong. */
export async function requireUser(req: Request): Promise<{ userId: string; email: string }> {
  const header = req.headers.get("authorization");
  const token = header?.match(/^Bearer (.+)$/)?.[1];
  if (!token) throw new AuthError(401, "missing token");

  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.sub !== "string" || typeof payload.email !== "string") {
      throw new AuthError(401, "invalid token payload");
    }
    return { userId: payload.sub, email: payload.email };
  } catch (e) {
    if (e instanceof AuthError) throw e;
    throw new AuthError(401, "invalid or expired token");
  }
}

type AuthedUser = { userId: string; email: string };

/**
 * Wraps a Next.js route handler with `requireUser`, so every community route
 * doesn't hand-repeat the same try/catch. `ctx` is forwarded as-is (Next
 * passes `{ params: Promise<...> }` for dynamic `[id]` routes, nothing
 * meaningful for static routes).
 */
export function withAuth<Ctx>(
  handler: (req: Request, user: AuthedUser, ctx: Ctx) => Promise<Response>,
) {
  return async (req: Request, ctx: Ctx): Promise<Response> => {
    try {
      const user = await requireUser(req);
      return await handler(req, user, ctx);
    } catch (e) {
      if (e instanceof AuthError) {
        return Response.json({ error: "unauthorized", message: e.message }, { status: e.status });
      }
      throw e;
    }
  };
}
