import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";

import fixtureEvents from "../fixtures/events.json";
import fixtureState from "../fixtures/state.json";
import { api } from "./api";
import { MOCK } from "./config";
import { toCents } from "./money";
import type { AgentDecision, Balances, MemberPush, SettleEvent, SettleState, Tab, TabStatus } from "./types";
import { useEventStream } from "./useEventStream";

/** What only events know about a tab (the tab object itself has no ledger index or exit time). */
export interface TabMeta {
  ledgerIndex?: number;
  exitAt?: string;
  push?: MemberPush;
  secondsLeft?: number;
  decision?: AgentDecision & { at: string };
  tipPct?: number;
  settledAt?: string;
  /** The decision tab.settled carried ("Approved by manager" after a hold). */
  settleDecision?: AgentDecision;
  closedReason?: string;
}

export interface SettledNotice {
  tabId: string;
  at: string;
  toVenueCents: number;
}

interface Store {
  state: SettleState | null;
  meta: Record<string, TabMeta>;
  balances: Balances | null;
  connected: boolean;
  /** Server time of the last snapshot; replayed events are older than this. */
  snapshotAt: string | null;
  lastSettled: SettledNotice | null;
  /** Tab the member phone follows: the first one to emit exit_detected, until its settle is over. */
  memberFocus: string | null;
  /** Tab the manager phone follows: the first one held, until it's no longer held. */
  heldFocus: string | null;
  /** The last live member.push, so the presenter view can bring the member phone up. */
  lastPush: { tabId: string; at: string } | null;
  error: { message: string; at: number } | null;
}

type Action =
  | { kind: "snapshot"; at: string; state: SettleState }
  | { kind: "event"; event: SettleEvent }
  | { kind: "tab"; tab: Tab }
  | { kind: "balances"; balances: Balances }
  | { kind: "connected"; value: boolean }
  | { kind: "error"; message: string | null };

const initial: Store = {
  state: null,
  meta: {},
  balances: null,
  connected: false,
  snapshotAt: null,
  lastSettled: null,
  memberFocus: null,
  heldFocus: null,
  lastPush: null,
  error: null,
};

function upsertTab(state: SettleState | null, tab: Tab | undefined): SettleState | null {
  if (!state || !tab) return state;
  const i = state.tabs.findIndex((t) => t.id === tab.id);
  const tabs = i === -1 ? [...state.tabs, tab] : state.tabs.map((t, j) => (j === i ? tab : t));
  return { ...state, tabs };
}

function withMeta(store: Store, tabId: string, patch: Partial<TabMeta>): Record<string, TabMeta> {
  return { ...store.meta, [tabId]: { ...store.meta[tabId], ...patch } };
}

/** True while `focusId` names another tab that is still in one of `statuses`. */
function stillFocused(store: Store, focusId: string | null, statuses: TabStatus[], incomingId?: string): boolean {
  if (!focusId || focusId === incomingId) return false;
  const focused = store.state?.tabs.find((t) => t.id === focusId);
  return Boolean(focused && statuses.includes(focused.status));
}

function reduceEvent(store: Store, event: SettleEvent): Store {
  // Events older than the snapshot are replays: take their timestamps, not their tab objects.
  const live = !store.snapshotAt || event.at >= store.snapshotAt;
  const d = event.data as Record<string, unknown>;
  const tab = d.tab as Tab | undefined;
  const state = live ? upsertTab(store.state, tab) : store.state;

  switch (event.type) {
    case "tab.opened":
      return {
        ...store,
        state,
        meta: withMeta(store, tab!.id, { ledgerIndex: d.ledgerIndex as number }),
      };
    case "tab.item_added":
      return { ...store, state };
    case "tab.exit_detected":
      return {
        ...store,
        state,
        meta: withMeta(store, tab!.id, { exitAt: event.at }),
        // Stay on a tab whose exit is still playing out; otherwise follow this one.
        memberFocus: stillFocused(store, store.memberFocus, ["exit_detected", "grace", "reconciling"]) ? store.memberFocus : tab!.id,
      };
    case "member.push": {
      const push = d as unknown as MemberPush;
      return {
        ...store,
        meta: withMeta(store, push.tabId, live ? { push, secondsLeft: push.secondsLeft } : { push }),
        lastPush: live ? { tabId: push.tabId, at: event.at } : store.lastPush,
      };
    }
    case "tab.grace_tick":
      // A replayed tick is stale; the countdown falls back to graceEndsAt until a live one lands.
      return live ? { ...store, meta: withMeta(store, d.tabId as string, { secondsLeft: d.secondsLeft as number }) } : store;
    case "agent.decision": {
      const { tabId, ...decision } = d as unknown as AgentDecision & { tabId: string };
      return { ...store, meta: withMeta(store, tabId, { decision: { ...decision, at: event.at } }) };
    }
    case "tab.held":
      return { ...store, state, heldFocus: stillFocused(store, store.heldFocus, ["held"], tab!.id) ? store.heldFocus : tab!.id };
    case "tab.settled": {
      const settled = tab!;
      const notice = live
        ? { tabId: settled.id, at: event.at, toVenueCents: toCents(settled.settlement?.toVenue ?? "0") }
        : store.lastSettled;
      // A manager approval settles without an agent.decision event; its decision rides on tab.settled.
      return {
        ...store,
        state,
        lastSettled: notice,
        meta: withMeta(store, settled.id, { settledAt: event.at, settleDecision: d.decision as AgentDecision }),
      };
    }
    case "metrics.updated":
      return live && store.state ? { ...store, state: { ...store.state, metrics: d as unknown as SettleState["metrics"] } } : store;
    case "tab.updated": {
      if (d.change === "reset") {
        return live ? { ...initial, connected: store.connected, snapshotAt: event.at, state: d.state as SettleState, balances: store.balances } : store;
      }
      if (!tab) return store;
      if (d.change === "tip") return { ...store, state, meta: withMeta(store, tab.id, { tipPct: d.tipPct as number }) };
      if (d.change === "closed_manually") return { ...store, state, meta: withMeta(store, tab.id, { closedReason: d.reason as string }) };
      return { ...store, state };
    }
    default:
      return store;
  }
}

function reducer(store: Store, action: Action): Store {
  switch (action.kind) {
    case "snapshot":
      return { ...store, state: action.state, snapshotAt: action.at };
    case "event":
      return reduceEvent(store, action.event);
    case "tab":
      return { ...store, state: upsertTab(store.state, action.tab) };
    case "balances":
      return { ...store, balances: action.balances };
    case "connected":
      return { ...store, connected: action.value };
    case "error":
      return { ...store, error: action.message ? { message: action.message, at: Date.now() } : null };
  }
}

export interface Actions {
  openTab(memberId: string, seat?: string): Promise<Tab>;
  addItem(tabId: string, menuItemId: string): Promise<Tab>;
  exit(tabId: string): Promise<Tab>;
  tip(tabId: string, pct: number): Promise<Tab>;
  dispute(tabId: string, note?: string): Promise<Tab>;
  approve(tabId: string): Promise<Tab>;
  reject(tabId: string): Promise<Tab>;
  close(tabId: string): Promise<Tab>;
  reset(): Promise<void>;
  clearError(): void;
}

const SettleContext = createContext<(Store & { actions: Actions }) | null>(null);

export function SettleProvider({ children }: { children: ReactNode }) {
  const [store, dispatch] = useReducer(reducer, initial);
  const balancesTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const refreshBalances = useCallback(() => {
    if (MOCK) return;
    clearTimeout(balancesTimer.current);
    // Debounced: in module mode /balances reads testnet.
    balancesTimer.current = setTimeout(() => {
      api<Balances>("/balances")
        .then((balances) => dispatch({ kind: "balances", balances }))
        .catch(() => undefined);
    }, 400);
  }, []);

  const onEvent = useCallback(
    (event: SettleEvent) => {
      if (event.type === "snapshot") {
        dispatch({ kind: "snapshot", at: event.at, state: event.data as SettleState });
        refreshBalances();
        return;
      }
      dispatch({ kind: "event", event });
      const change = (event.data as { change?: string }).change;
      if (["tab.opened", "tab.settled"].includes(event.type) || (event.type === "tab.updated" && ["closed_manually", "reset", "escrow_opened"].includes(change ?? ""))) {
        refreshBalances();
      }
    },
    [refreshBalances],
  );

  const connected = useEventStream(onEvent, !MOCK);
  useEffect(() => dispatch({ kind: "connected", value: connected }), [connected]);

  // Mock mode: the fixtures stand in for the stream. Events go first, as if live, so the countdown,
  // focus and timeline meta are filled; then the snapshot, which is the truth for the tabs.
  useEffect(() => {
    if (!MOCK) return;
    for (const event of fixtureEvents as SettleEvent[]) dispatch({ kind: "event", event });
    const capturedAt = (fixtureState as { capturedAt?: string }).capturedAt ?? new Date().toISOString();
    dispatch({ kind: "snapshot", at: capturedAt, state: fixtureState as unknown as SettleState });
    const balances = (fixtureState as { balances?: Balances }).balances;
    if (balances) dispatch({ kind: "balances", balances });
  }, []);

  const actions = useMemo<Actions>(() => {
    // `quiet` leaves the error to the caller (the POS new-tab form shows it inline).
    const run = async (path: string, body?: unknown, quiet = false): Promise<Tab> => {
      try {
        const tab = await api<Tab>(path, { method: "POST", body: body ?? {} });
        dispatch({ kind: "tab", tab });
        return tab;
      } catch (err) {
        if (!quiet) dispatch({ kind: "error", message: (err as Error).message });
        throw err;
      }
    };
    return {
      openTab: (memberId, seat) => run("/tabs", { memberId, seat }, true),
      addItem: (tabId, menuItemId) => run(`/tabs/${tabId}/items`, { menuItemId, qty: 1 }),
      exit: (tabId) => run(`/tabs/${tabId}/exit`),
      tip: (tabId, pct) => run(`/tabs/${tabId}/tip`, { pct }),
      dispute: (tabId, note) => run(`/tabs/${tabId}/dispute`, note ? { note } : {}),
      approve: (tabId) => run(`/tabs/${tabId}/approve`),
      reject: (tabId) => run(`/tabs/${tabId}/reject`),
      close: (tabId) => run(`/tabs/${tabId}/close`),
      reset: async () => {
        try {
          await api("/demo/reset", { method: "POST", body: {} });
        } catch (err) {
          dispatch({ kind: "error", message: (err as Error).message });
          throw err;
        }
      },
      clearError: () => dispatch({ kind: "error", message: null }),
    };
  }, []);

  const value = useMemo(() => ({ ...store, actions }), [store, actions]);
  return <SettleContext.Provider value={value}>{children}</SettleContext.Provider>;
}

export function useSettle() {
  const ctx = useContext(SettleContext);
  if (!ctx) throw new Error("useSettle outside SettleProvider");
  return ctx;
}

export function useTab(tabId: string | null | undefined): Tab | undefined {
  const { state } = useSettle();
  return tabId ? state?.tabs.find((t) => t.id === tabId) : undefined;
}
