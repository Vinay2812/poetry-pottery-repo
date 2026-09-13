import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface ReviewDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  onOpenChange: (isOpen: boolean) => void;
  children: React.ReactNode;
}

export function ReviewDialog({
  isOpen,
  title,
  description,
  onOpenChange,
  children,
}: ReviewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-normal tracking-tight">
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
