import { cn } from "@/lib/utils";

export interface PotteryIconProps {
  className?: string;
}

// Paths wobble a little on purpose, so the shapes read as drawn rather than traced.
function Drawn({
  className,
  children,
}: PotteryIconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn(
        "size-8 [&_*]:[vector-effect:non-scaling-stroke]",
        className,
      )}
    >
      {children}
    </svg>
  );
}

export function WedgeIcon({ className }: PotteryIconProps) {
  return (
    <Drawn className={className}>
      <path d="M6.9 21.4c-.5-4.5 2.6-8.4 7.2-9 4.7-.7 9 2.2 9.9 6.6.2 1 .1 1.9-.5 2.5-5.3 1.1-10.8 1.1-16.1.1-.3-.1-.5-.1-.5-.2Z" />
      <path d="M9.6 25.2c4.3.6 8.6.6 12.9 0" />
    </Drawn>
  );
}

export function ThrowIcon({ className }: PotteryIconProps) {
  return (
    <Drawn className={className}>
      <path d="M11.8 6.9c2.8-.6 5.6-.6 8.4 0-.5 4.2-.4 8.4.4 12.5-3.1.8-6.2.8-9.3 0 .8-4.1.9-8.3.5-12.5Z" />
      <path d="M4.6 24.1c7.6 1.4 15.3 1.4 22.9 0" />
    </Drawn>
  );
}

export function FireIcon({ className }: PotteryIconProps) {
  return (
    <Drawn className={className}>
      <path d="M16.2 4.4c3.6 3.3 5.5 6.7 5.6 10.2 3.1 3.2 2.6 8-1.2 10.2-2.9 1.7-6.6 1.6-9.4-.2-3.6-2.3-4-7-.9-10 0-3.5 2-6.9 5.9-10.2Z" />
      <path d="M16.1 14.3c1.7 1.7 2.6 3.4 2.5 5.1-.1 2-1.3 3.1-3.1 3-1.6-.1-2.6-1.3-2.5-3 .1-1.6 1.1-3.3 3.1-5.1Z" />
    </Drawn>
  );
}

export function GlazeIcon({ className }: PotteryIconProps) {
  return (
    <Drawn className={className}>
      <path d="M9.3 5.8c4.4-.6 8.9-.6 13.3 0-.3 1.7-.6 3.4-.7 5.1-3.9.8-7.9.8-11.8 0-.2-1.7-.5-3.4-.8-5.1Z" />
      <path d="M12.2 11.4c-.7 4.8.4 9.4 3.4 13.9m0 0c1 1.4 2.5 1.6 3.6.6 1-1 1.1-2.5.2-3.6-1.3-1.2-2.6-1.2-3.8 3Z" />
    </Drawn>
  );
}

export type PotteryIconKind =
  | "mug"
  | "bowl"
  | "plate"
  | "vase"
  | "planter"
  | "serving-dish"
  | "small-things";

const KIND_BY_KEYWORD: [string, PotteryIconKind][] = [
  ["mug", "mug"],
  ["cup", "mug"],
  ["bowl", "bowl"],
  ["plate", "plate"],
  ["vase", "vase"],
  ["planter", "planter"],
  ["serve", "serving-dish"],
  ["dish", "serving-dish"],
];

// Product names map onto the same small set of drawn pieces.
export function toPotteryIconKind(value: string): PotteryIconKind {
  const text = value.toLowerCase();
  for (const [keyword, kind] of KIND_BY_KEYWORD) {
    if (text.includes(keyword)) return kind;
  }
  return "small-things";
}
