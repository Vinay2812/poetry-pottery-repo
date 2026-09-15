import { cn } from "@/lib/utils";

export type AdminStatusTone = "neutral" | "live" | "warn" | "quiet";

export interface AdminStatusPillProps {
  label: string;
  tone: AdminStatusTone;
}

const TONE_CLASS: Record<AdminStatusTone, string> = {
  neutral: "border-ink/30 text-foreground",
  live: "border-primary text-primary",
  warn: "border-terracotta text-terracotta-dark",
  quiet: "border-ash text-muted-foreground",
};

export function AdminStatusPill({ label, tone }: AdminStatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center border px-1.5 text-[11px] tracking-[0.08em] uppercase",
        TONE_CLASS[tone],
      )}
    >
      {label}
    </span>
  );
}
