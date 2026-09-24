"use client";

import { useCallback, useOptimistic } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  AdminEventDocument,
  CancelEventDocument,
  DuplicateEventDocument,
  CompleteEventDocument,
  EventStatus,
  PublishEventDocument,
  UnpublishEventDocument,
} from "@/graphql/generated/graphql";

import { describeError } from "@/lib/apollo/errors";
import { useReasonAction } from "@/lib/use-reason-action";

import { formatEnumLabel } from "@/features/admin/shell";
import {
  AdminPageHeader,
  AdminReasonDialog,
  eventStatusTone,
} from "@/features/admin/ui";

import { EventStatusActions } from "@/features/admin/events/components/EventStatusActions";
import { EventFormContainer } from "@/features/admin/events/containers/EventFormContainer";
import { EventRegistrationsContainer } from "@/features/admin/events/containers/EventRegistrationsContainer";
import {
  type EventAction,
  allowedEventActions,
  describeSeats,
  describeWhen,
  eventActionDoneMessage,
  eventActionNeedsReason,
  eventActionStatus,
  toEventFormValues,
} from "@/features/admin/events/types";

export interface EventDetailContainerProps {
  eventId: number;
}

export function EventDetailContainer({ eventId }: EventDetailContainerProps) {
  const { data, previousData, loading, error, refetch } = useQuery(
    AdminEventDocument,
    {
      variables: { id: eventId },
      fetchPolicy: "cache-and-network",
    },
  );
  const [publishEvent] = useMutation(PublishEventDocument);
  const [unpublishEvent] = useMutation(UnpublishEventDocument);
  const [completeEvent] = useMutation(CompleteEventDocument);
  const [cancelEvent] = useMutation(CancelEventDocument);
  const [duplicateEvent, { loading: isDuplicating }] = useMutation(
    DuplicateEventDocument,
  );
  const router = useRouter();

  const handleDuplicate = useCallback(async () => {
    try {
      const { data: copy } = await duplicateEvent({
        variables: { id: eventId },
        refetchQueries: ["AdminEvents"],
      });
      if (!copy) throw new Error("The copy did not come back");
      toast.success("Draft copy made; set its date and publish");
      router.push(`/dashboard/events/${copy.duplicateEvent.id}`);
    } catch (copyError) {
      toast.error(describeError(copyError, "The event could not be copied"));
    }
  }, [duplicateEvent, eventId, router]);

  const event = data?.adminEvent ?? previousData?.adminEvent;
  const [status, setOptimisticStatus] = useOptimistic(
    event?.status ?? EventStatus.Draft,
    (_current: EventStatus, next: EventStatus) => next,
  );

  const move = useReasonAction({
    patch: ({ target }) => setOptimisticStatus(eventActionStatus(target)),
    run: ({ target, reason }) => {
      if (target === "publish") {
        return publishEvent({ variables: { id: eventId } });
      }
      if (target === "unpublish") {
        return unpublishEvent({ variables: { id: eventId } });
      }
      if (target === "complete") {
        return completeEvent({ variables: { id: eventId } });
      }
      // Cancelling closes every live registration, so the table below is read back too.
      return cancelEvent({
        variables: { id: eventId, reason },
        refetchQueries: ["AdminEventRegistrations"],
      });
    },
    refresh: refetch,
    policy: (target: EventAction) =>
      eventActionNeedsReason(target) ? "optional" : "none",
    requiredMessage: "Say why this event is being cancelled",
    messages: {
      success: ({ target }) => eventActionDoneMessage(target),
      failure: "The event could not be moved",
    },
  });

  if (!event && loading) {
    return (
      <div aria-busy="true" className="flex flex-col gap-3">
        <div className="h-20 animate-pulse bg-ash" />
        <div className="h-96 animate-pulse bg-ash" />
      </div>
    );
  }

  if (!event) {
    return (
      <p className="text-[13px]">
        {error
          ? "This event could not be loaded."
          : "This event is not in the studio any more."}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Events"
        title={event.title}
        description={`${describeWhen(event.starts_at, event.ends_at)} · ${event.location} · ${describeSeats(event.available_seats, event.total_seats)} seats left`}
        actions={
          <EventStatusActions
            statusLabel={formatEnumLabel(status)}
            statusTone={eventStatusTone(status)}
            actions={allowedEventActions(status)}
            busyAction={move.pending}
            isDuplicating={isDuplicating}
            onAction={move.start}
            onDuplicate={() => void handleDuplicate()}
          />
        }
      />
      <EventFormContainer
        key={event.id}
        eventId={event.id}
        defaultValues={toEventFormValues(event)}
        submitLabel="Save changes"
      />
      <EventRegistrationsContainer
        eventId={event.id}
        isEventCancelled={status === EventStatus.Cancelled}
      />
      <AdminReasonDialog
        isOpen={move.target !== null}
        title="Cancel this event?"
        description="Everyone registered is told and the seats go back."
        fieldLabel="Reason"
        hint="Optional. It goes out with the notice."
        placeholder="The kiln is down for the week"
        value={move.reason}
        error={move.error}
        confirmLabel="Cancel event"
        isDestructive
        isRequired={false}
        isBusy={move.isPending}
        onValueChange={move.setReason}
        onConfirm={move.confirm}
        onOpenChange={(isOpen) => {
          if (!isOpen) move.close();
        }}
      />
    </div>
  );
}
