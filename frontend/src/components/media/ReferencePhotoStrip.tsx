import Image from "next/image";

export interface ReferencePhotoStripProps {
  urls: string[];
  label: string;
}

// No lightbox exists yet, so each square opens the full photo in a new tab.
export function ReferencePhotoStrip({ urls, label }: ReferencePhotoStripProps) {
  if (urls.length === 0) return null;
  return (
    <ul aria-label={label} className="mt-1.5 flex flex-wrap gap-1.5">
      {urls.map((url, index) => (
        <li key={url}>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            aria-label={`${label} ${index + 1}`}
            className="relative block size-10 overflow-hidden border border-ash bg-white hover:border-ink"
          >
            <Image
              src={url}
              alt=""
              fill
              sizes="40px"
              className="object-cover"
            />
          </a>
        </li>
      ))}
    </ul>
  );
}
