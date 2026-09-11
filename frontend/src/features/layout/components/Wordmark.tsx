import Link from "next/link";

import { cn } from "@/lib/utils";

export interface WordmarkProps {
  className?: string;
}

export function Wordmark({ className }: WordmarkProps) {
  return (
    <Link
      href="/"
      aria-label="Poetry & Pottery home"
      className={cn(
        "font-heading text-xl leading-none tracking-tight text-primary md:text-2xl",
        className,
      )}
    >
      Poetry <span className="font-script text-terracotta italic">&amp;</span>{" "}
      Pottery
    </Link>
  );
}
