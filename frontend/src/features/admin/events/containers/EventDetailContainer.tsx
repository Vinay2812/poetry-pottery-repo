"use client";

import { useCallback, useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  EventStatus,
  useAdminEventQuery,
  useCancelEventMutation,
  useCompleteEventMutation,
  usePublishEventMutation,
  useUnpublishEventMutation,
} from "@/graphql/generated/graphql";

import { formatEnumLabel, toErrorMessage } from "@/features/admin/shell";
import { AdminPageHeader, eventStatusTone } from "@/features/admin/ui";

import { EventStatusActions } from "@/features/admin/events/components/EventStatusActions";
import { ReasonDialog } from "@/features/admin/events/components/ReasonDialog";
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
  const { data, previousData, loading, error, refetch } = useAdminEventQuery({
    variables: { id: eventId },
    fetchPolicy: "cache-and-network",
  });
  const [publishEvent] = usePublishEventMutation();
  const [unpublishEvent] = useUnpublishEventMutation();
  const [completeEvent] = useCompleteEventMutation();
  const [cancelEvent] = useCancelEventMutation();

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
            await cancelEvent({
              variables: { id: eventId, reason: note || null },
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
            onAction={handleAction}
          />
        }
      />
      <EventFormContainer
        key={event.id}
        eventId={event.id}
        defaultValues={toEventFormValues(event)}
        submitLabel="Save changes"
      />
      <EventRegistrationsContainer eventId={event.id} />
      <ReasonDialog
        isOpen={pendingAction !== null}
        title="Cancel this event?"
        description="Everyone registered is told and the seats go back."
        confirmLabel="Cancel event"
        reason={reason}
        isBusy={busyAction !== null}
        onReasonChange={setReason}
        onConfirm={handleConfirm}
        onOpenChange={(isOpen) => {
          if (!isOpen) setPendingAction(null);
        }}
      />
    </div>
  );
}
