"use client";

import { useCallback, useEffect, useState } from "react";

import type { UploadPurpose } from "@/graphql/generated/graphql";

import { toErrorMessage } from "@/features/admin/shell";
import { ImageCropDialog } from "@/features/admin/uploads/components/ImageCropDialog";
import { ImageDropField } from "@/features/admin/uploads/components/ImageDropField";
import {
  cropToRatio,
  measureFile,
  useConfirmedUpload,
  useImageRequirement,
} from "@/features/admin/uploads/hooks";
import {
  checkDimensions,
  checkFile,
  describeRequirement,
} from "@/features/admin/uploads/types";

export interface ImageUploaderContainerProps {
  id: string;
  label: string;
  purpose: UploadPurpose;
  value: string | null;
  onChange: (url: string | null) => void;
}

interface PendingCrop {
  file: File;
  reason: string;
  previewUrl: string;
  width: number;
  height: number;
}

/**
 * Picks a file, measures it in the browser, offers a fixed-ratio crop when the
 * shape is off, and only hands back a URL the API has confirmed.
 */
export function ImageUploaderContainer({
  id,
  label,
  purpose,
  value,
  onChange,
}: ImageUploaderContainerProps) {
  const requirement = useImageRequirement(purpose);
  const upload = useConfirmedUpload();
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [pending, setPending] = useState<PendingCrop | null>(null);

  // Object URLs for the crop preview outlive the render, so they are revoked by hand.
  useEffect(() => {
    if (!pending) return;
    const url = pending.previewUrl;
    return () => URL.revokeObjectURL(url);
  }, [pending]);

  const send = useCallback(
    async (blob: Blob) => {
      setIsBusy(true);
      try {
        const url = await upload(purpose, blob);
        onChange(url);
        setError(null);
        setPending(null);
      } catch (uploadError) {
        setError(toErrorMessage(uploadError));
      } finally {
        setIsBusy(false);
      }
    },
    [onChange, purpose, upload],
  );

  const handleFilePick = useCallback(
    async (file: File) => {
      if (!requirement) return;
      setError(null);
      const fileProblem = checkFile(
        requirement.contentTypes,
        requirement.maxBytes,
        file.type,
        file.size,
      );
      if (fileProblem) {
        setError(fileProblem);
        return;
      }

      let measured;
      try {
        measured = await measureFile(file);
      } catch {
        setError("That file does not read as an image.");
        return;
      }

      const verdict = checkDimensions(
        requirement.ratio,
        requirement.minWidth,
        requirement.minHeight,
        requirement.ratioLabel,
        measured.width,
        measured.height,
      );

      if (verdict.kind === "too-small") {
        setError(verdict.message);
        return;
      }

      if (verdict.kind === "ok") {
        await send(measured.blob);
        return;
      }

      const cropped = await cropToRatio(file, requirement.ratio ?? 1);
      if (
        cropped.width < requirement.minWidth ||
        cropped.height < requirement.minHeight
      ) {
        setError(
          `Cropped to ${requirement.ratioLabel} that image is ${cropped.width} × ${cropped.height}, under the ${requirement.minWidth} × ${requirement.minHeight} minimum.`,
        );
        return;
      }
      setPending({
        file,
        reason: verdict.message,
        previewUrl: URL.createObjectURL(cropped.blob),
        width: cropped.width,
        height: cropped.height,
      });
    },
    [requirement, send],
  );

  const handleCropConfirm = useCallback(async () => {
    if (!pending || !requirement) return;
    const cropped = await cropToRatio(pending.file, requirement.ratio ?? 1);
    await send(cropped.blob);
  }, [pending, requirement, send]);

  if (!requirement) {
    return (
      <p className="text-[12px] text-muted-foreground">
        Loading the size rules for {label.toLowerCase()}…
      </p>
    );
  }

  return (
    <>
      <ImageDropField
        id={id}
        label={label}
        requirementLine={describeRequirement(
          requirement.ratioLabel,
          requirement.minWidth,
          requirement.minHeight,
          requirement.maxBytes,
        )}
        rendersAt={requirement.rendersAt}
        accept={requirement.contentTypes.join(",")}
        previewUrl={value}
        isBusy={isBusy}
        error={error}
        onFilePick={(file) => void handleFilePick(file)}
        onClear={() => onChange(null)}
      />
      <ImageCropDialog
        isOpen={pending !== null}
        reason={pending?.reason ?? ""}
        ratioLabel={requirement.ratioLabel}
        previewUrl={pending?.previewUrl ?? null}
        cropWidth={pending?.width ?? 0}
        cropHeight={pending?.height ?? 0}
        isBusy={isBusy}
        onConfirm={() => void handleCropConfirm()}
        onOpenChange={(isOpen) => {
          if (!isOpen) setPending(null);
        }}
      />
    </>
  );
}
