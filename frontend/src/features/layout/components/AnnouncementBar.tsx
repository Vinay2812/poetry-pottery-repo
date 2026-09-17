import Link from "next/link";

export interface AnnouncementBarProps {
  text: string;
  href: string | null;
}

export function AnnouncementBar({ text, href }: AnnouncementBarProps) {
  const content = (
    <span className="text-[11px] tracking-[0.18em] uppercase">{text}</span>
  );

  return (
    // A landmark, so the one line above the header is not content adrift of every region.
    <aside
      aria-label="Studio announcement"
      className="flex h-9 items-center justify-center border-b border-ash bg-background px-4 text-foreground"
    >
      {href ? (
        <Link href={href} className="underline-offset-4 hover:underline">
          {content}
        </Link>
      ) : (
        content
      )}
    </aside>
  );
}
