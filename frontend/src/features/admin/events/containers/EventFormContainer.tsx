"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { useMutation } from "@apollo/client/react";
import {
  type AdminEventInput,
  CreateEventDocument,
  UpdateEventDocument,
  UploadPurpose,
} from "@/graphql/generated/graphql";

import { useOptimisticAction } from "@/lib/use-optimistic-action";
import type { EventFormValues } from "@/lib/validations/admin/event";

import {
  ImageListUploaderContainer,
  ImageUploaderContainer,
} from "@/features/admin/uploads";

import { EventForm } from "@/features/admin/events/components/EventForm";
import { toEventInput } from "@/features/admin/events/types";

export interface EventFormContainerProps {
  eventId: number | null;
  defaultValues: EventFormValues;
  submitLabel: string;
}

export function EventFormContainer({
  eventId,
  defaultValues,
  submitLabel,
}: EventFormContainerProps) {
  const router = useRouter();
  const [createEvent] = useMutation(CreateEventDocument);
  const [updateEvent] = useMutation(UpdateEventDocument);

  // Resolves with the new event's id on create, null on update.
  const { execute: save, isPending: isSubmitting } = useOptimisticAction({
    run: async (input: AdminEventInput): Promise<number | null> => {
      if (eventId === null) {
        const { data } = await createEvent({ variables: { input } });
        const created = data?.createEvent;
        if (!created) throw new Error("The event was not created");
        return created.id;
      }
      await updateEvent({ variables: { id: eventId, input } });
      return null;
    },
    messages: {
      success: (_input, createdId) =>
        createdId === null ? "Event saved" : "Event created",
      failure: "The event could not be saved",
    },
    onSuccess: (createdId) => {
      if (createdId !== null) router.push(`/dashboard/events/${createdId}`);
    },
  });

  const handleSubmit = useCallback(
    (values: EventFormValues) => save(toEventInput(values)),
    [save],
  );

  return (
    <EventForm
      defaultValues={defaultValues}
      isSubmitting={isSubmitting}
      submitLabel={submitLabel}
      renderCoverField={(value, onChange) => (
        <ImageUploaderContainer
          id="event-cover"
          label="Cover photo"
          purpose={UploadPurpose.Event}
          value={value || null}
          onChange={onChange}
        />
      )}
      renderGalleryField={(urls, onChange) => (
        <ImageListUploaderContainer
          id="event-gallery"
          label="Add a gallery photo"
          purpose={UploadPurpose.Event}
          urls={urls}
          onChange={onChange}
        />
      )}
      onSubmit={handleSubmit}
    />
  );
}
