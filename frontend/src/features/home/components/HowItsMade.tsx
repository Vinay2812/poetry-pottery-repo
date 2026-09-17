import {
  FireIcon,
  GlazeIcon,
  ThrowIcon,
  WedgeIcon,
} from "@/components/icons/pottery";

const STEPS = [
  { label: "Wedge", Icon: WedgeIcon },
  { label: "Throw", Icon: ThrowIcon },
  { label: "Fire", Icon: FireIcon },
  { label: "Glaze", Icon: GlazeIcon },
] as const;

export function HowItsMade() {
  return (
    <ol className="grid grid-cols-4 gap-4 border-t border-ash pt-5">
      {STEPS.map(({ label, Icon }) => (
        <li key={label} className="flex flex-col items-start gap-2">
          <Icon className="size-8 text-ink" />
          <span className="text-[13px]">{label}</span>
        </li>
      ))}
    </ol>
  );
}
