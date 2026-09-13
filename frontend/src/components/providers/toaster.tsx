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
            "rounded-none! border-0! bg-ink! font-sans! text-sm! text-white! shadow-none!",
          actionButton: "rounded-none! bg-white! text-ink!",
        },
      }}
    />
  );
}
