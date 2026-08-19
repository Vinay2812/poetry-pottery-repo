import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        "flex min-h-[120px] w-full resize-y rounded border border-border bg-cream px-4 py-3 text-base transition-colors duration-150 outline-none placeholder:text-muted-foreground",
        "hover:border-neutral-400",
        "focus:border-primary focus:ring-3 focus:ring-primary/10",
        "aria-invalid:border-red-500 aria-invalid:ring-3 aria-invalid:ring-red-500/10",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
