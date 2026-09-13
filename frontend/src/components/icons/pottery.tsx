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

export function MugIcon({ className }: PotteryIconProps) {
  return (
    <Drawn className={className}>
      <path d="M7.5 10.2c4.6-.7 9.3-.7 13.9 0 .3 4.2.1 8.4-.7 12.5-.2 1.2-1.3 2-2.6 2.1-2.5.2-5 .2-7.4 0-1.3-.1-2.4-.9-2.6-2.1-.8-4.1-1-8.3-.6-12.5Z" />
      <path d="M21.4 13.1c2.6-.6 4.4.5 4.5 2.9.1 2.5-1.6 4-4.3 3.8" />
    </Drawn>
  );
}

export function BowlIcon({ className }: PotteryIconProps) {
  return (
    <Drawn className={className}>
      <path d="M4.2 13.4c7.9-.9 15.8-.9 23.6 0-.6 5.3-4.6 9.6-9.9 10.4-1.3.2-2.6.2-3.9 0-5.3-.8-9.3-5.1-9.8-10.4Z" />
      <path d="M11.2 23.9c3.3.6 6.6.6 9.8-.1" />
    </Drawn>
  );
}

export function PlateIcon({ className }: PotteryIconProps) {
  return (
    <Drawn className={className}>
      <path d="M16 6.2c6 0 10.9 4.2 10.8 9.6-.1 5.5-4.9 9.9-11 9.9S4.8 21.4 5 15.9C5.2 10.5 10 6.2 16 6.2Z" />
      <path d="M16 10.1c3.6-.1 6.6 2.4 6.6 5.6 0 3.3-3 5.9-6.7 5.8-3.6 0-6.5-2.6-6.4-5.9.1-3.1 3-5.5 6.5-5.5Z" />
    </Drawn>
  );
}

export function VaseIcon({ className }: PotteryIconProps) {
  return (
    <Drawn className={className}>
      <path d="M13.3 4.7c1.8-.3 3.7-.3 5.5 0-.3 1.9-.4 3.8-.2 5.7 3.9 2.1 6.2 6.3 5.8 10.7-.2 2.6-1.9 4.4-4.4 5.1-2.4.6-4.9.6-7.3 0-2.5-.7-4.2-2.5-4.4-5.1-.4-4.4 1.9-8.6 5.8-10.7.2-1.9-.5-3.8-.8-5.7Z" />
      <path d="M13.4 10.2c1.9.5 3.9.5 5.8 0" />
      <path d="M12.8 25.4c2.2.6 4.5.6 6.7-.1" />
    </Drawn>
  );
}

export function PlanterIcon({ className }: PotteryIconProps) {
  return (
    <Drawn className={className}>
      <path d="M5.6 12.7c6.9-.9 13.9-.9 20.8 0l-2.3 11.4c-.2 1-1 1.7-2 1.8-4.1.4-8.2.4-12.2 0-1-.1-1.9-.8-2-1.8L5.6 12.7Z" />
      <path d="M16 12.4c-.2-3 .8-5.3 3.1-6.9m-3.1 6.9c-1.4-1.7-3.2-2.5-5.4-2.4" />
    </Drawn>
  );
}

export function ServingDishIcon({ className }: PotteryIconProps) {
  return (
    <Drawn className={className}>
      <path d="M7.4 12.6c5.8-.8 11.5-.8 17.3 0 .2 4-2.3 7.5-6.1 8.5-1.7.4-3.5.4-5.2 0-3.8-1-6.3-4.5-6-8.5Z" />
      <path d="M7.4 15.4c-2.2.2-3.5-.5-3.6-2m20.9 2c2.2.2 3.5-.5 3.6-2M11 21.9c3.3.7 6.7.7 10-.1" />
    </Drawn>
  );
}

export function SmallThingsIcon({ className }: PotteryIconProps) {
  return (
    <Drawn className={className}>
      <path d="M11.6 5.3c.6 2.2 1.9 3.6 4.1 4.2-2.2.7-3.5 2.1-4.1 4.3-.7-2.2-2-3.6-4.2-4.3 2.2-.6 3.5-2 4.2-4.2Z" />
      <path d="M21.4 13.9c.5 1.7 1.5 2.7 3.1 3.2-1.6.5-2.6 1.6-3.1 3.2-.5-1.6-1.5-2.7-3.1-3.2 1.6-.5 2.6-1.5 3.1-3.2Z" />
      <path d="M11 19.4c.4 1.3 1.1 2.1 2.4 2.5-1.3.4-2 1.2-2.4 2.5-.4-1.3-1.2-2.1-2.5-2.5 1.3-.4 2.1-1.2 2.5-2.5Z" />
    </Drawn>
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

const ICONS: Record<
  PotteryIconKind,
  (props: PotteryIconProps) => React.ReactElement
> = {
  mug: MugIcon,
  bowl: BowlIcon,
  plate: PlateIcon,
  vase: VaseIcon,
  planter: PlanterIcon,
  "serving-dish": ServingDishIcon,
  "small-things": SmallThingsIcon,
};

export function PotteryIcon({
  kind,
  className,
}: PotteryIconProps & { kind: PotteryIconKind }) {
  const Icon = ICONS[kind];
  return <Icon className={className} />;
}

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

// Category slugs and product names both map onto the same small set of drawn shapes.
export function toPotteryIconKind(value: string): PotteryIconKind {
  const text = value.toLowerCase();
  for (const [keyword, kind] of KIND_BY_KEYWORD) {
    if (text.includes(keyword)) return kind;
  }
  return "small-things";
}
