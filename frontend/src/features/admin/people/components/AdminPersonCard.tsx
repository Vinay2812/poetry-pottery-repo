import { type AdminStatusTone, AdminStatusPill } from "@/features/admin/ui";

import { AdminPersonAvatar } from "@/features/admin/people/components/AdminPersonAvatar";

export interface AdminPersonCardProps {
  name: string;
  email: string;
  phone: string | null;
  imageUrl: string | null;
  initials: string;
  roleLabel: string;
  roleTone: AdminStatusTone;
  joinedLabel: string;
}

export function AdminPersonCard({
  name,
  email,
  phone,
  imageUrl,
  initials,
  roleLabel,
  roleTone,
  joinedLabel,
}: AdminPersonCardProps) {
  return (
    <div className="flex items-start gap-4">
      <AdminPersonAvatar imageUrl={imageUrl} initials={initials} size="lg" />
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm">{name}</span>
          <AdminStatusPill label={roleLabel} tone={roleTone} />
        </div>
        <span className="text-[13px] text-muted-foreground">{email}</span>
        <span className="text-[13px] text-muted-foreground tnum">
          {phone ?? "No phone on file"}
        </span>
        <span className="text-[12px] text-muted-foreground">
          Joined {joinedLabel}
        </span>
      </div>
    </div>
  );
}
