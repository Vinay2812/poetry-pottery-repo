"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useState } from "react";

import { useCreateCommissionRequestMutation } from "@/graphql/generated/graphql";
import type { CommissionFormValues } from "@/lib/validations/commission";

import { CommissionBriefForm } from "@/features/commissions/components/CommissionBriefForm";
import { CommissionSent } from "@/features/commissions/components/CommissionSent";
import type { GlazeChoice, PieceChoice } from "@/features/commissions/types";
import {
  toBriefSummary,
  toCommissionAskUrl,
  toCommissionInput,
} from "@/features/commissions/types";
import { toServerMessage } from "@/features/content/types";
import { ReferencePhotoPicker } from "@/features/products/components/ReferencePhotoPicker";
import { useReferencePhotos } from "@/features/products/hooks";
import {
  isPhotoUploadPending,
  MAX_REFERENCE_PHOTOS,
  REFERENCE_PHOTO_ACCEPT,
  toConfirmedPhotoUrls,
} from "@/features/products/types";

export interface CommissionBriefContainerProps {
  pieces: PieceChoice[];
  glazes: GlazeChoice[];
  whatsappNumber: string;
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
}: CommissionBriefContainerProps) {
  const { isSignedIn } = useAuth();
  const [sent, setSent] = useState<SentBrief | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sentAskUrl, setSentAskUrl] = useState<string | null>(null);
  const [create, { loading }] = useCreateCommissionRequestMutation();
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
      if (isPhotoUploadPending(photos)) {
        setPhotoError("Wait for the photos to finish uploading");
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
          toServerMessage(
            error,
            "We could not send that just now. Try again in a minute.",
          ),
        );
      }
    },
    [clearPhotos, create, photos, setPhotoError, whatsappNumber],
  );

  if (sent) {
    return (
      <CommissionSent
        reference={sent.reference}
        summary={sent.summary}
        email={sent.email}
        askUrl={sentAskUrl}
      />
    );
  }

  return (
    <CommissionBriefForm
      pieces={pieces}
      glazes={glazes}
      isSubmitting={loading}
      errorMessage={errorMessage}
      toAskUrl={toAskUrl}
      photoPicker={
        isSignedIn ? (
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
            onAddFiles={addFiles}
            onRemove={removePhoto}
          />
        ) : (
          // Uploads are signed; send the photos on WhatsApp instead of asking for an account.
          <p className="text-[13px] text-muted-foreground">
            Sign in to attach reference photos, or send them on WhatsApp with
            your brief.
          </p>
        )
      }
      onSubmit={(values) => void handleSubmit(values)}
    />
  );
}
