import type { TabStatus } from "./types.js";

/**
 * open -> ordering -> exit_detected -> grace -> reconciling -> settled,
 * with held and closed_manually branches.
 */
const TRANSITIONS: Record<TabStatus, TabStatus[]> = {
  open: ["ordering", "exit_detected", "held", "closed_manually"],
  ordering: ["exit_detected", "held", "closed_manually"],
  exit_detected: ["grace", "held", "closed_manually"],
  grace: ["reconciling", "held", "closed_manually"],
  reconciling: ["settled", "held"],
  held: ["reconciling", "closed_manually"],
  settled: [],
  closed_manually: [],
};

export const OPEN_STATUSES: TabStatus[] = ["open", "ordering", "exit_detected", "grace", "reconciling", "held"];

export class TransitionError extends Error {
  readonly statusCode = 409;
  constructor(from: TabStatus, to: TabStatus) {
    super(`Cannot move tab from ${from} to ${to}`);
  }
}

export function canTransition(from: TabStatus, to: TabStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function assertTransition(from: TabStatus, to: TabStatus): void {
  if (!canTransition(from, to)) throw new TransitionError(from, to);
}
