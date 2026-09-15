import Link from "next/link";

export interface AnnouncementBarProps {
  text: string;
  href: string | null;
}

export function AnnouncementBar({ text, href }: AnnouncementBarProps) {
  const content = (
    <span className="text-xs font-medium tracking-[0.08em] uppercase">
      {text}
    </span>
  );

  return (
    <div className="flex h-9 items-center justify-center bg-primary px-4 text-primary-foreground">
      {href ? (
        <Link href={href} className="underline-offset-4 hover:underline">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}
