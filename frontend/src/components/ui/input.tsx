import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          // Tall airy field, 16px at every width (also keeps iOS Safari from zooming on focus).
          "flex h-[54px] w-full rounded border border-border bg-cream px-4 py-3 text-base transition-colors duration-150",
          "placeholder:text-muted-foreground",
          "hover:border-neutral-400",
          "focus:border-primary focus:ring-3 focus:ring-primary/10 focus:outline-none",
          "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "aria-invalid:border-red-500 aria-invalid:ring-3 aria-invalid:ring-red-500/10",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
