import { UserRole } from "@/graphql/generated/graphql";

const ROLE_LABEL: Record<UserRole, string> = {
  [UserRole.Admin]: "Admin",
  [UserRole.User]: "Member",
};

const MEMBER_SINCE_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function toDisplayName(name: string | null, email: string): string {
  const trimmed = name?.trim();
  if (trimmed) return trimmed;

  const localPart = email.split("@")[0]?.trim();
  return localPart || "Potter";
}

export function toInitial(displayName: string): string {
  return displayName.charAt(0).toUpperCase();
}

export function toMemberSince(createdAt: Date | string | null): string {
  if (!createdAt) return "Unknown";
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return MEMBER_SINCE_FORMAT.format(date);
}

// Role metadata is absent until the API provisions the user, so default to the member label.
export function toRoleLabel(role: UserRole | undefined): string {
  return role ? ROLE_LABEL[role] : ROLE_LABEL[UserRole.User];
}
