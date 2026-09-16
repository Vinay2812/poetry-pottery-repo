// First tab stop on every page: out of the announcement bar, wordmark, nav and
// five icon controls, straight to the content.
export function SkipLink({ targetId }: { targetId: string }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only bg-ink px-4 py-2 text-[13px] text-clay-white focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50"
    >
      Skip to content
    </a>
  );
}
