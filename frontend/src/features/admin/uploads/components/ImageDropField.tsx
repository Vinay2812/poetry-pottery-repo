"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface ImageDropFieldProps {
  id: string;
  label: string;
  requirementLine: string;
  rendersAt: string;
  accept: string;
  previewUrl: string | null;
  // A gallery shows its photos in a strip above, so its picker has no preview box.
  hasPreview: boolean;
  isBusy: boolean;
  error: string | null;
  onFilePick: (file: File) => void;
  onClear: () => void;
}

export function ImageDropField({
  id,
  label,
  requirementLine,
  rendersAt,
  accept,
  previewUrl,
  hasPreview,
  isBusy,
  error,
  onFilePick,
  onClear,
}: ImageDropFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </span>
      <p id={`${id}-requirement`} className="text-[12px] text-muted-foreground">
        {requirementLine} · shows on {rendersAt}
      </p>
      <div className="flex items-start gap-3">
        {hasPreview && (
          <div className="flex size-20 shrink-0 items-center justify-center border border-ash bg-white">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="" className="size-full object-cover" />
            ) : (
              <span className="text-[11px] text-muted-foreground">
                No photo
              </span>
            )}
          </div>
        )}
        <div className="flex min-w-0 flex-col gap-2">
          {/* The real input stays focusable but hidden; its label is the button people see. */}
          <input
            id={id}
            type="file"
            accept={accept}
            disabled={isBusy}
            aria-label={label}
            aria-describedby={`${id}-requirement`}
            className="peer sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onFilePick(file);
              event.target.value = "";
            }}
          />
          <Label
            htmlFor={id}
            className={cn(
              buttonVariants({ variant: "secondary", size: "sm" }),
              "w-fit cursor-pointer peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-disabled:pointer-events-none peer-disabled:opacity-50",
            )}
          >
            {isBusy
              ? "Uploading…"
              : previewUrl
                ? "Replace image"
                : "Choose an image"}
          </Label>
          {previewUrl && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-fit"
              onClick={onClear}
            >
              Remove
            </Button>
          )}
        </div>
      </div>
      {error && (
        <p role="alert" className="text-[12px] text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
