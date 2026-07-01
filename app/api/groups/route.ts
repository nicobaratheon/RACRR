import { prisma } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import { serializeGroup } from "@/lib/serialize";

export const GET = withAuth(async (_req, { userId }) => {
  const groups = await prisma.group.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      memberships: { where: { userId } },
      _count: { select: { memberships: true } },
    },
  });
  return jsonResponse(groups.map(serializeGroup));
});

export const POST = withAuth(async (req, { userId }) => {
  const body = await req.json().catch(() => null);
  const nameKa = typeof body?.name === "string" ? body.name.trim() : "";
  const districtKa = typeof body?.district === "string" ? body.district.trim() : "";
  if (!nameKa || !districtKa) return errorResponse("missing_fields", 400);

  // Creator auto-joins — one membership row in the same request, no
  // special-casing anywhere else in the read path.
  const group = await prisma.group.create({
    data: {
      nameKa,
      districtKa,
      creatorUserId: userId,
      memberships: { create: { userId } },
    },
    include: {
      memberships: { where: { userId } },
      _count: { select: { memberships: true } },
    },
  });
  return jsonResponse(serializeGroup(group), 201);
});
