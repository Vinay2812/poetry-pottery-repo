"use client";

import { useCallback, useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  useAdminUserQuery,
  UserRole,
  useSetUserRoleMutation,
} from "@/graphql/generated/graphql";

import { formatDate } from "@/lib/format";

import { formatEnumLabel, toErrorMessage } from "@/features/admin/shell";
import { AdminConfirmDialog, AdminPageHeader } from "@/features/admin/ui";

import { AdminPersonCard } from "@/features/admin/people/components/AdminPersonCard";
import { AdminPersonRole } from "@/features/admin/people/components/AdminPersonRole";
import { AdminPersonStats } from "@/features/admin/people/components/AdminPersonStats";
import {
  applyPersonRolePatch,
  describeRoleChange,
  roleTone,
  toInitials,
  toOppositeRole,
  toPersonName,
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
  const handleConfirm = useCallback(() => {
    if (!nextRole) return;
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
  }, [applyRole, nextRole, personId, refetch, setUserRole]);

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
      />
      <section className="border-t border-ash pt-6">
        <AdminPersonRole
          currentRoleLabel={formatEnumLabel(optimisticPerson.role)}
          explanation={describeRoleChange(nextRole)}
          actionLabel={toRoleConfirmLabel(nextRole)}
          isBusy={isSaving}
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
