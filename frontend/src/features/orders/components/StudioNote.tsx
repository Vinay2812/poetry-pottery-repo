import Image from "next/image";

export interface StudioNoteProps {
  body: string;
  imageUrl: string | null;
  writtenOn: string;
}

// One line the studio wrote about this order, with the photo that came with it.
export function StudioNote({ body, imageUrl, writtenOn }: StudioNoteProps) {
  return (
    <li className="flex flex-col gap-3 border-b border-ash py-5 last:border-b-0">
      <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
        {writtenOn}
      </p>
      <p className="text-[15px] leading-relaxed whitespace-pre-line">{body}</p>
      {imageUrl && (
        <span className="relative aspect-square w-full max-w-64 overflow-hidden bg-white">
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="(max-width: 768px) 60vw, 256px"
            className="object-cover"
          />
        </span>
      )}
    </li>
  );
}
