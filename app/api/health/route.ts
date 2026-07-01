import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ ok: true, db: "connected" });
  } catch (e) {
    return Response.json(
      { ok: false, db: "error", message: e instanceof Error ? e.message : "unknown" },
      { status: 500 },
    );
  }
}
