import Link from "next/link";

export interface AnnouncementBarProps {
  text: string;
  href: string | null;
}

export function AnnouncementBar({ text, href }: AnnouncementBarProps) {
  // Set as the editor wrote it; capitals would make a studio note read like a shop banner.
  const content = <span className="text-[13px]">{text}</span>;

  return (
    // A landmark, so the note above the header is not content adrift of every region.
    // One line keeps the 36px bar; a longer note wraps and the bar grows, scrolling away above the sticky header.
    <aside
      data-print="hide"
      aria-label="Studio announcement"
      className="flex min-h-9 items-center justify-center border-b border-ash bg-background px-4 py-1.5 text-center leading-5 text-foreground"
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
