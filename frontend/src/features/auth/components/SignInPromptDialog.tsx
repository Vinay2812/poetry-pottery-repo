import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface SignInPromptDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
}

export function SignInPromptDialog({
  isOpen,
  onOpenChange,
  onConfirm,
}: SignInPromptDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-normal">
            Sign in to continue
          </DialogTitle>
          <DialogDescription>
            Your cart, wishlist and bookings are saved to your account so they
            follow you between devices.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Not now
          </Button>
          <Button onClick={onConfirm}>Sign in</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
