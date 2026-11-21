import {
  type AdminStatusTone,
  AdminStatusPill,
} from "@/features/admin/ui/components/AdminStatusPill";

export interface AdminRegistrationStateProps {
  statusLabel: string;
  statusTone: AdminStatusTone;
  // Who closed it, or why, once it is cancelled or turned down.
  closingNote: string | null;
}

export function AdminRegistrationState({
  statusLabel,
  statusTone,
  closingNote,
}: AdminRegistrationStateProps) {
  return (
    <div className="flex flex-col items-start gap-1">
      <AdminStatusPill label={statusLabel} tone={statusTone} />
      {closingNote && (
        <span className="text-[12px] text-muted-foreground">{closingNote}</span>
      )}
    </div>
  );
}
