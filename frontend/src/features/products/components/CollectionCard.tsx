import Image from "next/image";
import Link from "next/link";

export interface CollectionCardProps {
  href: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  productCount: number;
  endsLabel: string | null;
}

export function CollectionCard({
  href,
  name,
  description,
  imageUrl,
  productCount,
  endsLabel,
}: CollectionCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex aspect-4/3 flex-col justify-end overflow-hidden rounded-3xl bg-primary-light p-5 text-white shadow-soft transition-all hover:-translate-y-1 hover:shadow-card md:aspect-3/2"
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt=""
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      )}
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent"
      />
      <span className="relative flex flex-col gap-1">
        {endsLabel && (
          <span className="text-[11px] font-semibold tracking-[0.14em] text-terracotta-light uppercase">
            {endsLabel}
          </span>
        )}
        <span className="font-heading text-2xl md:text-3xl">{name}</span>
        {description && (
          <span className="line-clamp-2 max-w-md text-sm text-white/85">
            {description}
          </span>
        )}
        <span className="text-xs text-white/70">
          {productCount} {productCount === 1 ? "piece" : "pieces"}
        </span>
      </span>
    </Link>
  );
}
