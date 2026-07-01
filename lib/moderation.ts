// Server-side mirror of gza/lib/core/community/moderation.dart's blocklist —
// defense in depth, since the client-side check is trivially bypassed once
// this endpoint is directly reachable. Keep both lists in sync.
const BLOCKLIST = [
  // English
  "fuck", "shit", "bitch", "asshole",
  // Russian (transliteration-resistant common roots)
  "блядь", "сука", "хуй", "пизд",
  // Georgian
  "ფიდარა", "ყლე", "მუდი",
];

export function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase();
  return BLOCKLIST.some((word) => lower.includes(word));
}

export type PostRejection = "empty" | "too_long" | "profanity";

export function validatePost(body: string): PostRejection | null {
  const trimmed = body.trim();
  if (trimmed.length === 0) return "empty";
  if (trimmed.length > 500) return "too_long";
  if (containsProfanity(trimmed)) return "profanity";
  return null;
}
