"use client";

import { useCallback, useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  useAdminUserQuery,
  useAdminUsersQuery,
  UserRole,
  useSetUserRoleMutation,
} from "@/graphql/generated/graphql";

import { formatDate } from "@/lib/format";

import { formatEnumLabel, toErrorMessage } from "@/features/admin/shell";
import {
  AdminConfirmDialog,
  AdminPageHeader,
  toPersonName,
} from "@/features/admin/ui";

import { AdminPersonCard } from "@/features/admin/people/components/AdminPersonCard";
import { AdminPersonRole } from "@/features/admin/people/components/AdminPersonRole";
import { AdminPersonStats } from "@/features/admin/people/components/AdminPersonStats";
import {
  applyPersonRolePatch,
  describeCurrentRole,
  describeRoleChange,
  isOnlyAdmin,
  ONLY_ADMIN_NOTE,
  roleTone,
  toInitials,
  toOppositeRole,
  toPersonLinks,
  toRoleConfirmLabel,
} from "@/features/admin/people/types";

export interface AdminPersonDetailContainerProps {
  personId: number;
}

export function AdminPersonDetailContainer({
  personId,
}: AdminPersonDetailContainerProps) {
  const { data, previousData, loading, error, refetch } = useAdminUserQuery({
    variables: { id: personId },
    fetchPolicy: "cache-and-network",
  });
  const [setUserRole] = useSetUserRoleMutation();
  // How many admins there are decides whether this one may step down.
  const { data: adminsData } = useAdminUsersQuery({
    variables: { filter: { role: UserRole.Admin, page: 1, limit: 1 } },
    fetchPolicy: "cache-and-network",
  });
  const adminCount = adminsData?.adminUsers.page_info.total ?? 2;

  const person = data?.adminUser ?? previousData?.adminUser ?? null;
  const [optimisticPerson, applyRole] = useOptimistic(
    person,
    applyPersonRolePatch,
  );
  const [, startTransition] = useTransition();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const nextRole = optimisticPerson
    ? toOppositeRole(optimisticPerson.role)
    : null;

  // The server owns the rule about not demoting yourself; it just has to be heard.
  const isLastAdmin = optimisticPerson
    ? isOnlyAdmin(optimisticPerson.role, adminCount)
    : false;

  const handleConfirm = useCallback(() => {
    if (!nextRole || isLastAdmin) return;
    setIsConfirmOpen(false);
    setIsSaving(true);
    startTransition(async () => {
      applyRole({ role: nextRole });
      try {
        await setUserRole({ variables: { id: personId, role: nextRole } });
        await refetch();
        toast.success(`Role changed to ${formatEnumLabel(nextRole)}`);
      } catch (roleError) {
        toast.error(toErrorMessage(roleError));
      } finally {
        setIsSaving(false);
      }
    });
  }, [applyRole, isLastAdmin, nextRole, personId, refetch, setUserRole]);

  if (!optimisticPerson && loading) {
    return (
      <div aria-busy="true" className="flex flex-col gap-3">
        <div className="h-16 animate-pulse bg-ash" />
        <div className="h-40 animate-pulse bg-ash" />
      </div>
    );
  }

  if (!optimisticPerson || !nextRole) {
    return (
      <div className="flex flex-col gap-4">
        <AdminPageHeader eyebrow="Studio" title="Person" description={null} />
        <p className="text-[13px]">
          {error
            ? "That person could not be loaded."
            : "No person with that id."}
        </p>
      </div>
    );
  }

  const name = toPersonName(
    optimisticPerson.user.name,
    optimisticPerson.user.email,
  );
  const links = toPersonLinks(personId);

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader eyebrow="Person" title={name} description={null} />
      <AdminPersonCard
        name={name}
        email={optimisticPerson.user.email}
        phone={optimisticPerson.phone}
        imageUrl={optimisticPerson.user.image}
        initials={toInitials(
          optimisticPerson.user.name,
          optimisticPerson.user.email,
        )}
        roleLabel={formatEnumLabel(optimisticPerson.role)}
        roleTone={roleTone(optimisticPerson.role)}
        joinedLabel={formatDate(optimisticPerson.created_at)}
      />
      <AdminPersonStats
        orders={String(optimisticPerson.orders_count)}
        registrations={String(optimisticPerson.registrations_count)}
        bookings={String(optimisticPerson.bookings_count)}
        reviews={String(optimisticPerson.reviews_count)}
        ordersHref={optimisticPerson.orders_count > 0 ? links.orders : null}
        registrationsHref={
          optimisticPerson.registrations_count > 0 ? links.registrations : null
        }
        bookingsHref={
          optimisticPerson.bookings_count > 0 ? links.bookings : null
        }
        reviewsHref={optimisticPerson.reviews_count > 0 ? links.reviews : null}
      />
      <section className="border-t border-ash pt-6">
        <AdminPersonRole
          currentRoleSentence={describeCurrentRole(optimisticPerson.role)}
          explanation={describeRoleChange(nextRole)}
          actionLabel={toRoleConfirmLabel(nextRole)}
          isBusy={isSaving}
          isDisabled={isLastAdmin}
          disabledReason={ONLY_ADMIN_NOTE}
          onChange={() => setIsConfirmOpen(true)}
        />
      </section>
      <AdminConfirmDialog
        isOpen={isConfirmOpen}
        title={`${toRoleConfirmLabel(nextRole)}?`}
        description={describeRoleChange(nextRole)}
        confirmLabel={toRoleConfirmLabel(nextRole)}
        isDestructive={nextRole === UserRole.User}
        isBusy={isSaving}
        onConfirm={handleConfirm}
        onOpenChange={setIsConfirmOpen}
      />
    </div>
  );
}
