import Link from "next/link";

import { Wordmark as BrandWordmark } from "@/components/brand/Wordmark";
import { cn } from "@/lib/utils";

export interface WordmarkProps {
  isReverse?: boolean;
  className?: string;
}

export function Wordmark({ isReverse = false, className }: WordmarkProps) {
  return (
    <Link
      href="/"
      aria-label="Poetry & Pottery home"
      className={cn("inline-flex shrink-0 items-center", className)}
    >
      {/* Heights match the 20/24px serif this replaced, so the header keeps its rhythm. */}
      <BrandWordmark isReverse={isReverse} className="h-[18px] md:h-[22px]" />
    </Link>
  );
}
