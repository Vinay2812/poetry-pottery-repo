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
  toReferenceBrief,
  toReferenceLine,
} from "@/features/commissions/types";
import { ReferencePhotoPicker } from "@/features/products/components/ReferencePhotoPicker";
import { useReferencePhotos } from "@/features/products/hooks";
import {
  MAX_REFERENCE_PHOTOS,
  REFERENCE_PHOTO_ACCEPT,
  toConfirmedPhotoUrls,
  toPhotoHoldMessage,
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
  // Set once a send is held back; the words then follow the photos as they finish or fail.
  const [isPhotoHoldShown, setIsPhotoHoldShown] = useState(false);
  const [sentAskUrl, setSentAskUrl] = useState<string | null>(null);
  const [create, { loading }] = useMutation(CreateCommissionRequestDocument);
  const {
    photos,
    error: photoError,
    addFiles,
    removePhoto,
    clearPhotos,
  } = useReferencePhotos();
  const photoHold = isPhotoHoldShown ? toPhotoHoldMessage(photos) : null;

  const toAskUrl = useCallback(
    (values: CommissionFormValues) =>
      toCommissionAskUrl(whatsappNumber, values),
    [whatsappNumber],
  );

  const handleSubmit = useCallback(
    async (values: CommissionFormValues) => {
      setErrorMessage(null);
      // Shown beside Send and at the picker, which scrolls into view the way a field error would.
      if (toPhotoHoldMessage(photos)) {
        setIsPhotoHoldShown(true);
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
    [clearPhotos, create, photos, whatsappNumber],
  );

  // A new photo starts fresh, so the hold waits for the next send before it speaks again.
  const handleAddFiles = useCallback(
    (files: File[]) => {
      setIsPhotoHoldShown(false);
      addFiles(files);
    },
    [addFiles],
  );

  const handleSignIn = useCallback(() => {
    void openSignIn();
  }, [openSignIn]);

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
      photoHoldMessage={photoHold}
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
              error={photoHold ?? photoError}
              onAddFiles={handleAddFiles}
              onRemove={removePhoto}
            />
          </div>
        ) : (
          // The modal keeps the page, so whatever is typed survives signing in.
          <ReferencePhotosSignIn onSignIn={handleSignIn} />
        )
      }
      onSubmit={(values) => void handleSubmit(values)}
    />
  );
}
