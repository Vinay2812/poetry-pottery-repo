"use client";

import { useCallback, useMemo } from "react";

import { useAdminUsersQuery, UserRole } from "@/graphql/generated/graphql";

import { formatDate } from "@/lib/format";

import { formatEnumLabel, useAdminQueryState } from "@/features/admin/shell";
// useSearchDraft is not re-exported by the shell barrel yet.
import { useSearchDraft } from "@/features/admin/shell/hooks";
import {
  AdminPageHeader,
  AdminPagination,
  enumOptions,
} from "@/features/admin/ui";

import {
  AdminPeopleTable,
  type AdminPeopleTableRow,
} from "@/features/admin/people/components/AdminPeopleTable";
import { AdminPeopleToolbar } from "@/features/admin/people/components/AdminPeopleToolbar";
import {
  PEOPLE_PAGE_SIZE,
  roleTone,
  toInitials,
  toPersonName,
  toUserRole,
} from "@/features/admin/people/types";

const ROLE_OPTIONS = enumOptions(UserRole);

export function AdminPeopleContainer() {
  const { values, page, isPending, patch } = useAdminQueryState();
  const search = values.q ?? "";
  const role = toUserRole(values.role);

  const handleSearchCommit = useCallback(
    (value: string) => patch({ q: value.trim() || null }),
    [patch],
  );
  const [searchDraft, handleSearchChange] = useSearchDraft(
    search,
    handleSearchCommit,
  );

  const { data, previousData, loading, error } = useAdminUsersQuery({
    variables: {
      filter: {
        page,
        limit: PEOPLE_PAGE_SIZE,
        search: search || null,
        role,
      },
    },
    fetchPolicy: "cache-and-network",
  });

  const result = data?.adminUsers ?? previousData?.adminUsers;

  const rows = useMemo<AdminPeopleTableRow[]>(
    () =>
      (result?.items ?? []).map((person) => ({
        id: person.user.id,
        name: toPersonName(person.user.name, person.user.email),
        email: person.user.email,
        imageUrl: person.user.image,
        initials: toInitials(person.user.name, person.user.email),
        roleLabel: formatEnumLabel(person.role),
        roleTone: roleTone(person.role),
        ordersCount: person.orders_count,
        registrationsCount: person.registrations_count,
        bookingsCount: person.bookings_count,
        reviewsCount: person.reviews_count,
        joinedLabel: formatDate(person.created_at),
      })),
    [result],
  );

  const handlePageChange = useCallback(
    (next: number) => patch({ page: next > 1 ? String(next) : null }),
    [patch],
  );

  if (!result && error) {
    return (
      <div className="flex flex-col gap-8">
        <AdminPageHeader eyebrow="Studio" title="People" description={null} />
        <p className="text-[13px]">The people could not be loaded.</p>
      </div>
    );
  }

  const pageInfo = result?.page_info;

  return (
    <div className="flex flex-col gap-2">
      <AdminPageHeader
        eyebrow="Studio"
        title="People"
        description="Everyone who has an account here."
      />
      <AdminPeopleToolbar
        search={searchDraft}
        role={role ?? ""}
        roleOptions={ROLE_OPTIONS}
        onSearchChange={handleSearchChange}
        onRoleChange={(value) => patch({ role: value || null })}
      />
      <AdminPeopleTable
        rows={rows}
        isBusy={isPending || (loading && rows.length > 0)}
        emptyMessage={
          loading ? "Looking for people" : "No people match those filters"
        }
      />
      <AdminPagination
        page={pageInfo?.page ?? page}
        limit={pageInfo?.limit ?? PEOPLE_PAGE_SIZE}
        total={pageInfo?.total ?? 0}
        hasMore={pageInfo?.has_more ?? false}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
