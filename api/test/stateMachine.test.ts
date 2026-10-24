import { describe, expect, it } from "vitest";

import { OPEN_STATUSES, TransitionError, assertTransition, canTransition } from "../src/stateMachine.js";
import type { TabStatus } from "../src/types.js";

const ALL: TabStatus[] = ["open", "ordering", "exit_detected", "grace", "reconciling", "settled", "held", "closed_manually"];

const ALLOWED: [TabStatus, TabStatus][] = [
  ["open", "ordering"],
  ["open", "exit_detected"],
  ["open", "held"],
  ["open", "closed_manually"],
  ["ordering", "exit_detected"],
  ["ordering", "held"],
  ["ordering", "closed_manually"],
  ["exit_detected", "grace"],
  ["exit_detected", "held"],
  ["exit_detected", "closed_manually"],
  ["grace", "reconciling"],
  ["grace", "held"],
  ["grace", "closed_manually"],
  ["reconciling", "settled"],
  ["reconciling", "held"],
  ["held", "reconciling"],
  ["held", "closed_manually"],
];

describe("tab state machine", () => {
  it.each(ALLOWED)("allows %s -> %s", (from, to) => {
    expect(canTransition(from, to)).toBe(true);
    expect(() => assertTransition(from, to)).not.toThrow();
  });

  const allowedSet = new Set(ALLOWED.map(([a, b]) => `${a}->${b}`));
  const disallowed = ALL.flatMap((from) => ALL.map((to) => [from, to] as [TabStatus, TabStatus])).filter(
    ([a, b]) => !allowedSet.has(`${a}->${b}`),
  );

  it.each(disallowed)("rejects %s -> %s", (from, to) => {
    expect(canTransition(from, to)).toBe(false);
    expect(() => assertTransition(from, to)).toThrow(TransitionError);
  });

  it("treats settled and closed_manually as terminal", () => {
    for (const to of ALL) {
      expect(canTransition("settled", to)).toBe(false);
      expect(canTransition("closed_manually", to)).toBe(false);
    }
  });

  it("never settles without reconciling first", () => {
    for (const from of ALL.filter((s) => s !== "reconciling")) {
      expect(canTransition(from, "settled")).toBe(false);
    }
  });

  it("TransitionError carries a 409 and a readable message", () => {
    const err = new TransitionError("settled", "open");
    expect(err.statusCode).toBe(409);
    expect(err.message).toBe("Cannot move tab from settled to open");
  });

  it("counts every non-terminal status as open", () => {
    expect(OPEN_STATUSES.sort()).toEqual(ALL.filter((s) => s !== "settled" && s !== "closed_manually").sort());
  });
});
