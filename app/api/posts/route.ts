import { prisma } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import { serializePost } from "@/lib/serialize";
import { validatePost } from "@/lib/moderation";

export const GET = withAuth(async (_req, { userId }) => {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      likes: { where: { userId } },
      _count: { select: { likes: true } },
    },
  });
  return jsonResponse(posts.map(serializePost));
});

export const POST = withAuth(async (req, { userId, email }) => {
  const body = await req.json().catch(() => null);
  const text = typeof body?.body === "string" ? body.body : "";
  const rejection = validatePost(text);
  if (rejection) return errorResponse(rejection, 422);

  // authorName is resolved server-side, never trusted from the client.
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const authorName = user.displayName ?? email.split("@")[0];

  const post = await prisma.post.create({
    data: {
      authorName,
      body: text.trim(),
      authorUserId: userId,
      lat: typeof body?.lat === "number" ? body.lat : undefined,
      lng: typeof body?.lng === "number" ? body.lng : undefined,
      groupId: typeof body?.groupId === "string" ? body.groupId : undefined,
      imageUrl: typeof body?.imageUrl === "string" ? body.imageUrl : undefined,
    },
    include: {
      likes: { where: { userId } },
      _count: { select: { likes: true } },
    },
  });
  return jsonResponse(serializePost(post), 201);
});
