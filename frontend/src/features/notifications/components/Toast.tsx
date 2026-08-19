import { Button } from "@/components/ui/button";

export interface ToastProps {
  isVisible: boolean;
  message: string;
  onDismiss: () => void;
}

export function Toast({ isVisible, message, onDismiss }: ToastProps) {
  if (!isVisible) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-6 z-50 mx-auto flex max-w-sm items-center gap-3 rounded-2xl bg-primary px-4 py-3 text-sm text-cream shadow-card"
    >
      <p className="flex-1">{message}</p>
      <Button
        variant="ghost"
        size="sm"
        className="text-cream hover:bg-primary-hover hover:text-cream"
        onClick={onDismiss}
      >
        Dismiss
      </Button>
    </div>
  );
}
