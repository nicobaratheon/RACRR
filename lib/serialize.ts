import type { Post, Group, GroupEvent } from "../app/generated/prisma/client";

// Every serializer's output matches the Dart side's fromJson exactly (see
// gza/lib/core/community/models.dart) — no field renames, no extra keys.

type PostWithCounts = Post & {
  likes: { userId: string }[]; // pre-filtered to the requesting user only
  _count: { likes: number };
};

export function serializePost(post: PostWithCounts) {
  return {
    id: post.id,
    authorName: post.authorName,
    body: post.body,
    createdAt: post.createdAt.toISOString(),
    upvotes: post._count.likes,
    likedByMe: post.likes.length > 0,
    commentsCount: post.commentsCount,
    lat: post.lat,
    lng: post.lng,
    groupId: post.groupId,
    imageUrl: post.imageUrl,
  };
}

type GroupWithCounts = Group & {
  memberships: { userId: string }[];
  _count: { memberships: number };
};

export function serializeGroup(group: GroupWithCounts) {
  return {
    id: group.id,
    nameKa: group.nameKa,
    districtKa: group.districtKa,
    members: group._count.memberships,
    joined: group.memberships.length > 0,
  };
}

type EventWithCounts = GroupEvent & {
  attendances: { userId: string }[];
  _count: { attendances: number };
};

export function serializeEvent(event: EventWithCounts) {
  return {
    id: event.id,
    groupId: event.groupId,
    title: event.title,
    place: event.place,
    when: event.when.toISOString(),
    attendees: event._count.attendances,
    going: event.attendances.length > 0,
  };
}
