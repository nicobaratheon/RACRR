import { prisma } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import { serializeGroup } from "@/lib/serialize";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withAuth<Ctx>(async (_req, { userId }, ctx) => {
  const { id: groupId } = await ctx.params;

  const existing = await prisma.groupMembership.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });
  if (existing) {
    await prisma.groupMembership.delete({ where: { groupId_userId: { groupId, userId } } });
  } else {
    await prisma.groupMembership.create({ data: { groupId, userId } });
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      memberships: { where: { userId } },
      _count: { select: { memberships: true } },
    },
  });
  if (!group) return errorResponse("not_found", 404);
  return jsonResponse(serializeGroup(group));
});
