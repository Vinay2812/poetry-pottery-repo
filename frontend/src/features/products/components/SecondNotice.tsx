import Image from "next/image";

import { SECOND_HEADING } from "@/features/products/types";

export interface SecondNoticeProps {
  flawNote: string;
  flawPhotoUrl: string | null;
  name: string;
}

// The honest block on a marked piece: what happened to it, and the photograph of it.
export function SecondNotice({
  flawNote,
  flawPhotoUrl,
  name,
}: SecondNoticeProps) {
  return (
    <section className="flex flex-col gap-4 border-t border-ash pt-6">
      <h3 className="font-heading text-xl tracking-tight">{SECOND_HEADING}</h3>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {flawPhotoUrl && (
          <div className="relative aspect-square w-full shrink-0 bg-white sm:w-40">
            <Image
              src={flawPhotoUrl}
              alt={`The mark on this ${name}`}
              fill
              sizes="(min-width: 640px) 160px, 100vw"
              className="object-cover"
            />
          </div>
        )}
        <p className="text-[15px] leading-relaxed">{flawNote}</p>
      </div>
    </section>
  );
}
