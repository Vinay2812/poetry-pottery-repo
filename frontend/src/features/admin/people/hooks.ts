"use client";

import { useAdminUserQuery } from "@/graphql/generated/graphql";

import { toPersonName } from "@/features/admin/ui";

import { toPersonId } from "@/features/admin/people/types";

export interface PersonFilter {
  personId: number | null;
  personName: string | null;
}

/** Resolves the `user` query key on a list into the person it names, for the notice above the table. */
export function usePersonFilter(raw: string | undefined): PersonFilter {
  const personId = toPersonId(raw);
  const { data } = useAdminUserQuery({
    variables: { id: personId ?? 0 },
    skip: personId === null,
  });
  const person = data?.adminUser ?? null;
  return {
    personId,
    personName: person
      ? toPersonName(person.user.name, person.user.email)
      : null,
  };
}
