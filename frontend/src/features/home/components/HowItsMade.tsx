import {
  FireIcon,
  GlazeIcon,
  ThrowIcon,
  WedgeIcon,
} from "@/components/icons/pottery";

const DRAWINGS = [
  { key: "wedge", Icon: WedgeIcon },
  { key: "throw", Icon: ThrowIcon },
  { key: "fire", Icon: FireIcon },
  { key: "glaze", Icon: GlazeIcon },
] as const;

// Decoration only: the editor's numbered steps below it carry the words.
export function HowItsMade() {
  return (
    <div
      aria-hidden
      className="flex items-center justify-start gap-10 text-ink md:gap-16"
    >
      {DRAWINGS.map(({ key, Icon }) => (
        <Icon key={key} className="size-8" />
      ))}
    </div>
  );
}
