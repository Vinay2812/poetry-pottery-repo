import Image from "next/image";

export interface ReviewPhotoStripProps {
  urls: string[];
  label: string;
}

export function ReviewPhotoStrip({ urls, label }: ReviewPhotoStripProps) {
  if (urls.length === 0) {
    return <span className="text-muted-foreground">{label}</span>;
  }

  return (
    <ul aria-label={label} className="flex items-center gap-1">
      {urls.map((url) => (
        <li key={url} className="relative size-8 overflow-hidden bg-white">
          <Image src={url} alt="" fill sizes="32px" className="object-cover" />
        </li>
      ))}
    </ul>
  );
}
