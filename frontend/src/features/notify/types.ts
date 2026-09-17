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

// Only a listed piece can come back, so a retired one is never offered the form the API refuses.
export function canWatchPiece(
  stock: number,
  isCustomizable: boolean,
  isActive: boolean,
): boolean {
  return isActive && !isCustomizable && stock <= 0;
}
