import {
  type AdminStatusTone,
  AdminStatusPill,
} from "@/features/admin/ui/components/AdminStatusPill";

export interface AdminRegistrationStateProps {
  statusLabel: string;
  statusTone: AdminStatusTone;
  // Who closed it or why, or that a request went unanswered past its date.
  statusNote: string | null;
}

export function AdminRegistrationState({
  statusLabel,
  statusTone,
  statusNote,
}: AdminRegistrationStateProps) {
  return (
    <div className="flex flex-col items-start gap-1">
      <AdminStatusPill label={statusLabel} tone={statusTone} />
      {statusNote && (
        <span className="text-[12px] text-muted-foreground">{statusNote}</span>
      )}
    </div>
  );
}
