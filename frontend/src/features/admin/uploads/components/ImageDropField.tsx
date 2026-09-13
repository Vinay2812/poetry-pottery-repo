"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export interface ImageDropFieldProps {
  id: string;
  label: string;
  requirementLine: string;
  rendersAt: string;
  accept: string;
  previewUrl: string | null;
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
  isBusy,
  error,
  onFilePick,
  onClear,
}: ImageDropFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label
        htmlFor={id}
        className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase"
      >
        {label}
      </Label>
      <p className="text-[12px] text-muted-foreground">
        {requirementLine} · shows on {rendersAt}
      </p>
      <div className="flex items-start gap-3">
        <div className="flex size-20 shrink-0 items-center justify-center border border-ash bg-white">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="" className="size-full object-cover" />
          ) : (
            <span className="text-[11px] text-muted-foreground">No photo</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            id={id}
            type="file"
            accept={accept}
            disabled={isBusy}
            className="max-w-full text-[13px] file:mr-3 file:border file:border-ash file:bg-transparent file:px-3 file:py-1.5 file:text-[13px]"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onFilePick(file);
              event.target.value = "";
            }}
          />
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
      {isBusy && (
        <p className="text-[12px] text-muted-foreground">Uploading…</p>
      )}
      {error && (
        <p role="alert" className="text-[12px] text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
