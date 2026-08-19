import { UserRole, type MeQuery } from "@/graphql/generated/graphql";

export type ProfileUser = MeQuery["me"];

const ROLE_LABEL: Record<UserRole, string> = {
  [UserRole.Admin]: "Admin",
  [UserRole.User]: "Member",
};

const MEMBER_SINCE_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function toDisplayName(user: ProfileUser): string {
  const name = user.name?.trim();
  if (name) return name;

  const localPart = user.email.split("@")[0]?.trim();
  return localPart || "Potter";
}

export function toInitial(displayName: string): string {
  return displayName.charAt(0).toUpperCase();
}

export function toMemberSince(createdAt: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return MEMBER_SINCE_FORMAT.format(date);
}

export function toRoleLabel(role: UserRole): string {
  return ROLE_LABEL[role];
}
