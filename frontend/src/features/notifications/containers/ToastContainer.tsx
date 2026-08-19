"use client";

import { useCallback } from "react";

import { useUIStore } from "@/store/ui-store";

import { Toast } from "@/features/notifications/components/Toast";

export function ToastContainer() {
  const toastMessage = useUIStore((state) => state.toastMessage);
  const dismissToast = useUIStore((state) => state.dismissToast);

  const handleDismiss = useCallback(() => {
    dismissToast();
  }, [dismissToast]);

  return (
    <Toast
      isVisible={Boolean(toastMessage)}
      message={toastMessage ?? ""}
      onDismiss={handleDismiss}
    />
  );
}
