import { prisma } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import { serializeEvent } from "@/lib/serialize";

// Flat list covering both grouped and standalone (groupId: null) events —
// the Flutter client filters by groupId client-side exactly as it does today.
export const GET = withAuth(async (_req, { userId }) => {
  const events = await prisma.groupEvent.findMany({
    orderBy: { when: "asc" },
    include: {
      attendances: { where: { userId } },
      _count: { select: { attendances: true } },
    },
  });
  return jsonResponse(events.map(serializeEvent));
});

export const POST = withAuth(async (req, { userId }) => {
  const body = await req.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const place = typeof body?.place === "string" ? body.place.trim() : "";
  const whenRaw = typeof body?.when === "string" ? new Date(body.when) : null;
  const groupId = typeof body?.groupId === "string" ? body.groupId : null;
  if (!title || !place || !whenRaw || Number.isNaN(whenRaw.getTime())) {
    return errorResponse("missing_fields", 400);
  }

  // Organizer auto-attends — one attendance row in the same request.
  const event = await prisma.groupEvent.create({
    data: {
      title,
      place,
      when: whenRaw,
      groupId,
      organizerUserId: userId,
      attendances: { create: { userId } },
    },
    include: {
      attendances: { where: { userId } },
      _count: { select: { attendances: true } },
    },
  });
  return jsonResponse(serializeEvent(event), 201);
});
