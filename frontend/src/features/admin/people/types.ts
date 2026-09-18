import {
  type AdminUserFieldsFragment,
  UserRole,
} from "@/graphql/generated/graphql";

import type { AdminStatusTone } from "@/features/admin/ui";

export type AdminPersonData = AdminUserFieldsFragment;

/** The `user` query key on the other lists; anything but a positive integer means no filter. */
export function toPersonId(raw: string | undefined): number | null {
  const id = Number.parseInt(raw ?? "", 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export interface PersonLinks {
  orders: string;
  registrations: string;
  bookings: string;
  reviews: string;
}

/** Each count on a person leads to the list it was counted from, narrowed to them. */
export function toPersonLinks(personId: number): PersonLinks {
  const query = `?user=${personId}`;
  return {
    orders: `/dashboard/orders${query}`,
    registrations: `/dashboard/events${query}`,
    bookings: `/dashboard/workshops${query}`,
    reviews: `/dashboard/reviews${query}`,
  };
}

export const PEOPLE_PAGE_SIZE = 20;

export function toUserRole(value: string | undefined): UserRole | null {
  const members: string[] = Object.values(UserRole);
  return value && members.includes(value) ? (value as UserRole) : null;
}

/** Two letters in the circle: initials when we have a name, the email when we do not. */
export function toInitials(name: string | null, email: string): string {
  const source = name && name.trim().length > 0 ? name.trim() : email;
  const words = source.split(/[\s@._-]+/).filter(Boolean);
  const letters = words.slice(0, 2).map((word) => word[0]);
  return letters.join("").toUpperCase() || "?";
}

export function roleTone(role: UserRole): AdminStatusTone {
  return role === UserRole.Admin ? "live" : "quiet";
}

/** "Admin" needs "an", so the whole sentence is built here rather than glued in the view. */
export function describeCurrentRole(role: UserRole): string {
  return role === UserRole.Admin
    ? "They are an admin today."
    : "They are a customer today.";
}

/** The one sentence the confirm dialog needs: what this change actually does. */
export function describeRoleChange(role: UserRole): string {
  return role === UserRole.Admin
    ? "They will be able to open the studio admin."
    : "They will lose access to the studio admin.";
}

export function toRoleConfirmLabel(role: UserRole): string {
  return role === UserRole.Admin ? "Make an admin" : "Make a customer";
}

export function toOppositeRole(role: UserRole): UserRole {
  return role === UserRole.Admin ? UserRole.User : UserRole.Admin;
}

export interface AdminPersonPatch {
  role: UserRole;
}

export function applyPersonRolePatch(
  person: AdminPersonData | null,
  patch: AdminPersonPatch,
): AdminPersonData | null {
  if (!person) return person;
  return { ...person, role: patch.role };
}
