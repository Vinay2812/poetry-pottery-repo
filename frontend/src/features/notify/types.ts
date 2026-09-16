export type NotifyState = "idle" | "waiting" | "error";

export interface NotifyResult {
  state: NotifyState;
  message: string | null;
}

export const IDLE_NOTIFY: NotifyResult = { state: "idle", message: null };

export const WAITING_LINE =
  "We will write the moment it comes out of the kiln.";

export const ALREADY_WAITING_LINE =
  "You are already on the list for this piece.";

// The optimistic reducer is a straight swap: the pending answer replaces the current one.
export function applyNotifyResult(
  _current: NotifyResult,
  next: NotifyResult,
): NotifyResult {
  return next;
}

// The form only offers itself for a piece nobody can buy right now.
export function canWatchPiece(
  stock: number,
  isCustomizable: boolean,
  isArchived: boolean,
): boolean {
  if (isArchived) return true;
  return !isCustomizable && stock <= 0;
}
