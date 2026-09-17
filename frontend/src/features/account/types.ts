const MEMBER_SINCE = new Intl.DateTimeFormat("en-IN", {
  month: "long",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

export function toDisplayName(name: string | null, email: string): string {
  const trimmed = name?.trim();
  if (trimmed) return trimmed;
  return email.split("@")[0]?.trim() || "Potter";
}

export function toInitials(displayName: string): string {
  const words = displayName.trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.charAt(0) ?? "";
  const last =
    words.length > 1 ? (words[words.length - 1]?.charAt(0) ?? "") : "";
  return `${first}${last}`.toUpperCase() || "P";
}

export function toMemberSince(createdAt: Date | string | null): string {
  if (!createdAt) return "recently";
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime()) ? "recently" : MEMBER_SINCE.format(date);
}
