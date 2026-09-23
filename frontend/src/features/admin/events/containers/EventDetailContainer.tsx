"use client";

import { useCallback, useOptimistic, useState, useTransition } from "react";
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

import { formatEnumLabel, toErrorMessage } from "@/features/admin/shell";
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
      toast.error(toErrorMessage(copyError));
    }
  }, [duplicateEvent, eventId, router]);

  const [busyAction, setBusyAction] = useState<EventAction | null>(null);
  const [pendingAction, setPendingAction] = useState<EventAction | null>(null);
  const [reason, setReason] = useState("");
  const [, startTransition] = useTransition();

  const event = data?.adminEvent ?? previousData?.adminEvent;
  const [status, setOptimisticStatus] = useOptimistic(
    event?.status ?? EventStatus.Draft,
    (_current: EventStatus, next: EventStatus) => next,
  );

  const runAction = useCallback(
    (action: EventAction, note: string) => {
      setBusyAction(action);
      startTransition(async () => {
        setOptimisticStatus(eventActionStatus(action));
        try {
          if (action === "publish") {
            await publishEvent({ variables: { id: eventId } });
          } else if (action === "unpublish") {
            await unpublishEvent({ variables: { id: eventId } });
          } else if (action === "complete") {
            await completeEvent({ variables: { id: eventId } });
          } else {
            // Cancelling closes every live registration, so the table below is read back too.
            await cancelEvent({
              variables: { id: eventId, reason: note || null },
              refetchQueries: ["AdminEventRegistrations"],
              awaitRefetchQueries: true,
            });
          }
          await refetch();
          toast.success(eventActionDoneMessage(action));
        } catch (actionError) {
          toast.error(toErrorMessage(actionError));
        } finally {
          setBusyAction(null);
        }
      });
    },
    [
      cancelEvent,
      completeEvent,
      eventId,
      publishEvent,
      refetch,
      setOptimisticStatus,
      unpublishEvent,
    ],
  );

  const handleAction = useCallback(
    (action: EventAction) => {
      if (eventActionNeedsReason(action)) {
        setReason("");
        setPendingAction(action);
        return;
      }
      runAction(action, "");
    },
    [runAction],
  );

  const handleConfirm = useCallback(() => {
    if (!pendingAction) return;
    runAction(pendingAction, reason);
    setPendingAction(null);
  }, [pendingAction, reason, runAction]);

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
            busyAction={busyAction}
            isDuplicating={isDuplicating}
            onAction={handleAction}
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
        isOpen={pendingAction !== null}
        title="Cancel this event?"
        description="Everyone registered is told and the seats go back."
        fieldLabel="Reason"
        hint="Optional. It goes out with the notice."
        placeholder="The kiln is down for the week"
        value={reason}
        error={undefined}
        confirmLabel="Cancel event"
        isDestructive
        isRequired={false}
        isBusy={busyAction !== null}
        onValueChange={setReason}
        onConfirm={handleConfirm}
        onOpenChange={(isOpen) => {
          if (!isOpen) setPendingAction(null);
        }}
      />
    </div>
  );
}
