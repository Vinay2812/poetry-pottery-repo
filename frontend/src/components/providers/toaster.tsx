"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="bottom-center"
      offset={{ bottom: 80 }}
      mobileOffset={{ bottom: 80 }}
      duration={3500}
      toastOptions={{
        classNames: {
          toast:
            "rounded-2xl! bg-foreground! text-background! shadow-card! border-0! font-sans! text-sm!",
          actionButton: "bg-primary! text-primary-foreground! rounded-full!",
        },
      }}
    />
  );
}
