import Image from "next/image";

import { cn } from "@/lib/utils";

export interface AdminPersonAvatarProps {
  imageUrl: string | null;
  initials: string;
  size: "sm" | "lg";
}

/** A person is the one round thing in this console. */
export function AdminPersonAvatar({
  imageUrl,
  initials,
  size,
}: AdminPersonAvatarProps) {
  const box = size === "lg" ? "size-12" : "size-7";
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary",
        box,
      )}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          fill
          sizes={size === "lg" ? "48px" : "28px"}
          className="object-cover"
        />
      ) : (
        <span
          className={cn(
            "text-muted-foreground",
            size === "lg" ? "text-sm" : "text-[11px]",
          )}
        >
          {initials}
        </span>
      )}
    </span>
  );
}
