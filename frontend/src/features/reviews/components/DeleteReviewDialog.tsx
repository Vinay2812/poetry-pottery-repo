import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface DeleteReviewDialogProps {
  isOpen: boolean;
  subjectName: string;
  isSubmitting: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
}

export function DeleteReviewDialog({
  isOpen,
  subjectName,
  isSubmitting,
  onOpenChange,
  onConfirm,
}: DeleteReviewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-normal tracking-tight">
            Remove your review?
          </DialogTitle>
          <DialogDescription>
            Your words and photos for {subjectName} go for good.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Keep it
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Removing…" : "Remove review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
