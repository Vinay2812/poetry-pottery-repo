import { SECOND_HEADING } from "@/features/products/types";

export interface SecondNoticeProps {
  flawNote: string;
}

// The honest block on a marked piece. No photo until the catalogue carries a real flaw shot.
export function SecondNotice({ flawNote }: SecondNoticeProps) {
  return (
    <section className="flex flex-col gap-4 border-t border-ash pt-6">
      <h3 className="font-heading text-xl tracking-tight">{SECOND_HEADING}</h3>
      <p className="text-[15px] leading-relaxed">{flawNote}</p>
    </section>
  );
}
