"use client";

import { useAuth, useClerk } from "@clerk/nextjs";
import { useCallback, useEffect, useRef, useState } from "react";

import { useMutation } from "@apollo/client/react";
import { CreateCommissionRequestDocument } from "@/graphql/generated/graphql";
import { describeError } from "@/lib/apollo/errors";
import type { CommissionFormValues } from "@/lib/validations/commission";

import { CommissionBriefForm } from "@/features/commissions/components/CommissionBriefForm";
import { CommissionSent } from "@/features/commissions/components/CommissionSent";
import { ReferencePhotosSignIn } from "@/features/commissions/components/ReferencePhotosSignIn";
import type {
  GlazeChoice,
  PieceChoice,
  ReferencePiece,
} from "@/features/commissions/types";
import {
  toBriefSummary,
  toCommissionAskUrl,
  toCommissionInput,
  toPhotoHoldMessage,
  toReferenceBrief,
  toReferenceLine,
} from "@/features/commissions/types";
import { ReferencePhotoPicker } from "@/features/products/components/ReferencePhotoPicker";
import { useReferencePhotos } from "@/features/products/hooks";
import {
  MAX_REFERENCE_PHOTOS,
  REFERENCE_PHOTO_ACCEPT,
  toConfirmedPhotoUrls,
} from "@/features/products/types";

export interface CommissionBriefContainerProps {
  pieces: PieceChoice[];
  glazes: GlazeChoice[];
  whatsappNumber: string;
  referencePiece: ReferencePiece | null;
}

interface SentBrief {
  reference: string;
  summary: string;
  email: string;
}

export function CommissionBriefContainer({
  pieces,
  glazes,
  whatsappNumber,
  referencePiece,
}: CommissionBriefContainerProps) {
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const [sent, setSent] = useState<SentBrief | null>(null);
  const sentHeadingRef = useRef<HTMLHeadingElement>(null);
  const photoPickerRef = useRef<HTMLDivElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sentAskUrl, setSentAskUrl] = useState<string | null>(null);
  const [create, { loading }] = useMutation(CreateCommissionRequestDocument);
  const {
    photos,
    error: photoError,
    setError: setPhotoError,
    addFiles,
    removePhoto,
    clearPhotos,
  } = useReferencePhotos();

  const toAskUrl = useCallback(
    (values: CommissionFormValues) =>
      toCommissionAskUrl(whatsappNumber, values),
    [whatsappNumber],
  );

  const handleSubmit = useCallback(
    async (values: CommissionFormValues) => {
      setErrorMessage(null);
      // Said beside Send and at the picker, which scrolls into view the way a field error would.
      const photoHold = toPhotoHoldMessage(photos);
      if (photoHold) {
        setPhotoError(photoHold);
        setErrorMessage(photoHold);
        photoPickerRef.current?.scrollIntoView({ block: "start" });
        return;
      }
      try {
        const result = await create({
          variables: {
            input: toCommissionInput(values, toConfirmedPhotoUrls(photos)),
          },
        });
        const request = result.data?.createCommissionRequest;
        if (!request) throw new Error("The brief did not reach the studio");
        clearPhotos();
        setSentAskUrl(toCommissionAskUrl(whatsappNumber, values));
        setSent({
          reference: request.id,
          summary: toBriefSummary(
            request.piece_type,
            request.size,
            request.glaze,
          ),
          email: values.email,
        });
      } catch (error) {
        setErrorMessage(
          describeError(
            error,
            "We could not send that just now. Try again in a minute.",
          ),
        );
      }
    },
    [clearPhotos, create, photos, setPhotoError, whatsappNumber],
  );

  // A change to the photos answers the hold message, so it clears along with the picker's own error.
  const handleAddFiles = useCallback(
    (files: File[]) => {
      setErrorMessage(null);
      addFiles(files);
    },
    [addFiles],
  );

  const handleRemovePhoto = useCallback(
    (id: string) => {
      setErrorMessage(null);
      removePhoto(id);
    },
    [removePhoto],
  );

  // The confirmation is far shorter than the form, so bring it into view instead of leaving the footer there.
  useEffect(() => {
    if (!sent) return;
    sentHeadingRef.current?.scrollIntoView({ block: "start" });
    sentHeadingRef.current?.focus({ preventScroll: true });
  }, [sent]);

  if (sent) {
    return (
      <CommissionSent
        reference={sent.reference}
        summary={sent.summary}
        email={sent.email}
        askUrl={sentAskUrl}
        headingRef={sentHeadingRef}
      />
    );
  }

  return (
    <CommissionBriefForm
      pieces={pieces}
      glazes={glazes}
      initialValues={
        referencePiece ? toReferenceBrief(referencePiece, pieces) : undefined
      }
      referenceLine={referencePiece ? toReferenceLine(referencePiece) : null}
      isSubmitting={loading}
      errorMessage={errorMessage}
      toAskUrl={toAskUrl}
      photoPicker={
        isSignedIn ? (
          <div ref={photoPickerRef}>
            <ReferencePhotoPicker
              photos={photos.map((photo) => ({
                id: photo.id,
                name: photo.name,
                previewUrl: photo.previewUrl,
                progress: photo.progress,
                error: photo.error,
                isUploaded: photo.url !== null,
              }))}
              maxPhotos={MAX_REFERENCE_PHOTOS}
              accept={REFERENCE_PHOTO_ACCEPT}
              error={photoError}
              onAddFiles={handleAddFiles}
              onRemove={handleRemovePhoto}
            />
          </div>
        ) : (
          // The modal keeps the page, so whatever is typed survives signing in.
          <ReferencePhotosSignIn onSignIn={() => openSignIn()} />
        )
      }
      onSubmit={(values) => void handleSubmit(values)}
    />
  );
}
