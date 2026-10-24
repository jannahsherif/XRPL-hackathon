import { vi } from "vitest";

import type { SettlementAgent } from "../src/agent/settlementAgent.js";
import { config, type Config } from "../src/config.js";
import { EventBus } from "../src/events.js";
import { decimalToCents, centsToDecimal } from "../src/money.js";
import { SettleService } from "../src/settleService.js";
import type { AgentDecision, Ledger, SettleEvent, Tab } from "../src/types.js";

export const testConfig = (overrides: Partial<Config> = {}): Config => ({
  ...config,
  demo: true,
  graceSeconds: 10,
  ledgerMode: "stub",
  agentMode: "local",
  outstandingSeedCents: 34_218_000,
  intentMode: "off",
  ...overrides,
});

let hashCounter = 0;
export const hash = () => (++hashCounter).toString(16).toUpperCase().padStart(64, "0");

type LedgerMocks = { [K in keyof Ledger]: ReturnType<typeof vi.fn> };

/** Instant, inspectable ledger that honours the contract. */
export function fakeLedger(overrides: Partial<LedgerMocks> = {}) {
  let seq = 1;
  const ledger = {
    openTab: vi.fn(async ({ memberId: _m }: { memberId: string; allowance: string }) => {
      const txHash = hash();
      return { escrowSeq: ++seq, txHash, explorerUrl: `https://testnet.xrpl.org/transactions/${txHash}`, ledgerIndex: 100 + seq };
    }),
    settleTab: vi.fn(async ({ tab, amount }: { tab: Tab; amount: string; tipAmount: string }) => {
      const allowance = decimalToCents(tab.allowance);
      const toVenue = Math.min(decimalToCents(amount), allowance);
      return {
        finishTxHash: hash(),
        refundTxHash: allowance - toVenue > 0 ? hash() : null,
        toVenue: centsToDecimal(toVenue),
        toMember: centsToDecimal(allowance - toVenue),
        elapsedMs: 1234,
        explorerUrls: [],
      };
    }),
    cancelTab: vi.fn(async () => ({ txHash: hash() })),
    getBalances: vi.fn(async () => ({ venue: "0.00", members: {} })),
    ...overrides,
  } as LedgerMocks & Ledger;
  return ledger;
}

export type FakeLedger = LedgerMocks & Ledger;

export function fixedAgent(decision: Partial<AgentDecision> = {}): SettlementAgent & { decide: ReturnType<typeof vi.fn> } {
  return {
    decide: vi.fn(async () => ({ action: "settle", tipPct: 20, reason: "ok", source: "agent", ...decision }) as AgentDecision),
  };
}

export function makeService(opts: { ledger?: FakeLedger; agent?: SettlementAgent; config?: Partial<Config> } = {}) {
  const bus = new EventBus();
  const events: SettleEvent[] = [];
  bus.subscribe((e) => events.push(e));
  const ledger = opts.ledger ?? fakeLedger();
  const agent = opts.agent ?? fixedAgent();
  const service = new SettleService(ledger, agent, bus, testConfig(opts.config));
  const ofType = (type: string) => events.filter((e) => e.type === type);
  return { service, bus, events, ledger, agent, ofType };
}

/** Flush pending microtasks (ledger/agent promises) without moving fake time. */
export const flush = async () => {
  for (let i = 0; i < 10; i++) await Promise.resolve();
};
