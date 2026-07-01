import { prisma } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import { serializeEvent } from "@/lib/serialize";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withAuth<Ctx>(async (_req, { userId }, ctx) => {
  const { id: eventId } = await ctx.params;

  const existing = await prisma.eventAttendance.findUnique({
    where: { eventId_userId: { eventId, userId } },
  });
  if (existing) {
    await prisma.eventAttendance.delete({ where: { eventId_userId: { eventId, userId } } });
  } else {
    await prisma.eventAttendance.create({ data: { eventId, userId } });
  }

  const event = await prisma.groupEvent.findUnique({
    where: { id: eventId },
    include: {
      attendances: { where: { userId } },
      _count: { select: { attendances: true } },
    },
  });
  if (!event) return errorResponse("not_found", 404);
  return jsonResponse(serializeEvent(event));
});
