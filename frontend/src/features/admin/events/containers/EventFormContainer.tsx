"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";

import { useMutation } from "@apollo/client/react";
import {
  CreateEventDocument,
  UpdateEventDocument,
  UploadPurpose,
} from "@/graphql/generated/graphql";

import type { EventFormValues } from "@/lib/validations/admin/event";

import { toErrorMessage } from "@/features/admin/shell";
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
  const [createEvent, { loading: isCreating }] =
    useMutation(CreateEventDocument);
  const [updateEvent, { loading: isUpdating }] =
    useMutation(UpdateEventDocument);

  const handleSubmit = useCallback(
    (values: EventFormValues) => {
      const input = toEventInput(values);
      void (async () => {
        try {
          if (eventId === null) {
            const { data } = await createEvent({ variables: { input } });
            const created = data?.createEvent;
            if (!created) throw new Error("The event was not created");
            toast.success("Event created");
            router.push(`/dashboard/events/${created.id}`);
            return;
          }
          await updateEvent({ variables: { id: eventId, input } });
          toast.success("Event saved");
        } catch (error) {
          toast.error(toErrorMessage(error));
        }
      })();
    },
    [createEvent, eventId, router, updateEvent],
  );

  return (
    <EventForm
      defaultValues={defaultValues}
      isSubmitting={isCreating || isUpdating}
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
