import Image from "next/image";
import Link from "next/link";

import { PlaceholderImage } from "@/components/media/PlaceholderImage";

export interface StudioTeaserProps {
  imageUrl: string | null;
  line: string;
  hoursLabel: string;
  daysLabel: string;
  priceLabel: string | null;
  href: string;
  linkLabel: string;
}

interface FactProps {
  label: string;
  value: string;
}

function Fact({ label, value }: FactProps) {
  return (
    <div className="flex justify-between gap-6 border-b border-ash py-3 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}

// Stands in for the event rows when nothing is on the calendar: the wheel's own
// facts beside a piece from it, so the studio's second way in never goes quiet.
export function StudioTeaser({
  imageUrl,
  line,
  hoursLabel,
  daysLabel,
  priceLabel,
  href,
  linkLabel,
}: StudioTeaserProps) {
  return (
    <div className="grid gap-8 md:grid-cols-[1fr_minmax(0,22rem)] md:items-center md:gap-16">
      <div className="flex flex-col gap-6">
        <p className="max-w-md text-[15px] leading-relaxed text-pretty">
          {line}
        </p>
        <dl className="flex max-w-md flex-col border-t border-ash">
          <Fact label="Hours" value={hoursLabel} />
          <Fact label="Days" value={daysLabel} />
          {priceLabel && <Fact label="Price" value={priceLabel} />}
        </dl>
        <Link
          href={href}
          className="w-fit border-b border-ink pb-0.5 text-sm hover:border-primary hover:text-primary"
        >
          {linkLabel}
        </Link>
      </div>
      <div className="relative aspect-square bg-white">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="(min-width: 768px) 22rem, 100vw"
            className="object-cover"
          />
        ) : (
          <PlaceholderImage kind="vase" />
        )}
      </div>
    </div>
  );
}
