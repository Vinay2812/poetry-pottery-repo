import Link from "next/link";

export interface AnnouncementBarProps {
  text: string;
  href: string | null;
}

export function AnnouncementBar({ text, href }: AnnouncementBarProps) {
  // Set as the editor wrote it; capitals would make a studio note read like a shop banner.
  const content = <span className="text-[13px]">{text}</span>;

  return (
    // A landmark, so the one line above the header is not content adrift of every region.
    <aside
      data-print="hide"
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
