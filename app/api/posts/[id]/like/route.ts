import { prisma } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import { serializePost } from "@/lib/serialize";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withAuth<Ctx>(async (_req, { userId }, ctx) => {
  const { id: postId } = await ctx.params;

  const existing = await prisma.postLike.findUnique({
    where: { postId_userId: { postId, userId } },
  });
  if (existing) {
    await prisma.postLike.delete({ where: { postId_userId: { postId, userId } } });
  } else {
    await prisma.postLike.create({ data: { postId, userId } });
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      likes: { where: { userId } },
      _count: { select: { likes: true } },
    },
  });
  if (!post) return errorResponse("not_found", 404);
  return jsonResponse(serializePost(post));
});
