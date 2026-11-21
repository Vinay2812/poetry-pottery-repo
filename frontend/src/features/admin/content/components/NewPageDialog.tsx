"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { AdminField, adminFieldMessageId } from "@/features/admin/ui";

const SLUG_HINT = "Lowercase letters, digits and dashes, like care-guide.";

export interface NewPageDialogProps {
  isOpen: boolean;
  slug: string;
  error: string | null;
  onSlugChange: (slug: string) => void;
  onSubmit: () => void;
  onOpenChange: (isOpen: boolean) => void;
}

export function NewPageDialog({
  isOpen,
  slug,
  error,
  onSlugChange,
  onSubmit,
  onOpenChange,
}: NewPageDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form
          noValidate
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>New page</DialogTitle>
            <DialogDescription>
              The slug is the address the page lives at.
            </DialogDescription>
          </DialogHeader>
          <AdminField
            id="new-page-slug"
            label="Slug"
            hint={SLUG_HINT}
            error={error ?? undefined}
          >
            <Input
              id="new-page-slug"
              className="h-9 text-[13px] md:text-[13px]"
              autoComplete="off"
              autoFocus
              value={slug}
              aria-invalid={Boolean(error)}
              aria-describedby={adminFieldMessageId(
                "new-page-slug",
                SLUG_HINT,
                error ?? undefined,
              )}
              onChange={(event) => onSlugChange(event.target.value)}
            />
          </AdminField>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Open editor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
