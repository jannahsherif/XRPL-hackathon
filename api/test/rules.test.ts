import { describe, expect, it } from "vitest";

import { applyHardRules, fallbackDecision } from "../src/agent/rules.js";
import { SEED_POLICY } from "../src/seed.js";
import type { Member, Policy, Tab } from "../src/types.js";

const member = (overrides: Partial<Member> = {}): Member => ({
  id: "m",
  name: "Jordan Pike",
  tier: "standard",
  allowance: "1000.00",
  typicalSpendCents: 12000,
  history: [],
  ...overrides,
});

const tab = (items: Tab["items"], overrides: Partial<Tab> = {}): Tab => ({
  id: "t",
  memberId: "m",
  memberName: "Jordan Pike",
  seat: "Bar 1",
  status: "reconciling",
  items,
  totalCents: items.reduce((s, i) => s + i.priceCents * i.qty, 0),
  tipCents: 0,
  allowance: "1000.00",
  escrow: { seq: 1, txHash: "H", explorerUrl: null },
  settlement: null,
  hold: null,
  graceEndsAt: null,
  openedAt: new Date().toISOString(),
  ...overrides,
});

const policy = (overrides: Partial<Policy> = {}): Policy => ({ ...SEED_POLICY, ...overrides });
const line = (priceCents: number, qty = 1, name = "Item") => ({ name, qty, priceCents });

describe("applyHardRules", () => {
  it("lets a normal tab through to the agent", () => {
    expect(applyHardRules(tab([line(2600), line(1900, 2)]), member(), policy())).toBeNull();
  });

  it("holds a single item priced above the allowance", () => {
    const decision = applyHardRules(tab([line(90000, 1, "Bottle")], { allowance: "300.00" }), member({ typicalSpendCents: 500000 }), policy());
    expect(decision).toMatchObject({ action: "hold", source: "rules" });
    expect(decision?.reason).toMatch(/Bottle \(\$900\.00\) is above the escrowed allowance of \$300\.00/);
  });

  it("checks unit price, not line total, for the item-over-allowance rule", () => {
    // 4 x $100 = $400 exceeds a $300 allowance, but no single item does.
    const decision = applyHardRules(tab([line(10000, 4)], { allowance: "300.00" }), member({ typicalSpendCents: 500000 }), policy());
    expect(decision?.reason).toMatch(/exceeds the escrowed allowance/);
  });

  it("can disable the item-over-allowance rule", () => {
    const decision = applyHardRules(
      tab([line(90000)], { allowance: "300.00" }),
      member({ typicalSpendCents: 500000 }),
      policy({ holdIfItemOverAllowance: false }),
    );
    // Still held, but by the total-over-allowance backstop.
    expect(decision?.reason).toMatch(/exceeds the escrowed allowance/);
  });

  it("holds a total above N x typical spend and names the largest line", () => {
    const decision = applyHardRules(tab([line(90000, 1, "Dom Pérignon"), line(600, 1, "Espresso")]), member(), policy());
    expect(decision?.action).toBe("hold");
    expect(decision?.reason).toMatch(/over 3x Jordan's typical \$120\.00/);
    expect(decision?.reason).toMatch(/largest line is Dom Pérignon/);
  });

  it("does not hold exactly at the N x typical boundary", () => {
    expect(applyHardRules(tab([line(36000)]), member(), policy())).toBeNull();
    expect(applyHardRules(tab([line(36001)]), member(), policy())?.action).toBe("hold");
  });

  it("respects a custom multiplier", () => {
    expect(applyHardRules(tab([line(30000)]), member(), policy({ holdIfTotalOverTypicalX: 5 }))).toBeNull();
    expect(applyHardRules(tab([line(30000)]), member(), policy({ holdIfTotalOverTypicalX: 2 }))?.action).toBe("hold");
  });

  it("skips the typical-spend rule for members with no history baseline", () => {
    expect(applyHardRules(tab([line(50000)]), member({ typicalSpendCents: 0 }), policy())).toBeNull();
  });

  it("checks rules in order: item over allowance wins over typical spend", () => {
    const decision = applyHardRules(tab([line(90000)], { allowance: "500.00" }), member(), policy());
    expect(decision?.reason).toMatch(/is above the escrowed allowance/);
  });

  it("holds an empty-but-over-allowance edge case never (empty tab is fine)", () => {
    expect(applyHardRules(tab([]), member(), policy())).toBeNull();
  });
});

describe("fallbackDecision", () => {
  it("settles with the default tip", () => {
    expect(fallbackDecision(tab([line(2000)]), policy())).toMatchObject({ action: "settle", tipPct: 20, source: "fallback" });
  });

  it("uses the policy default tip", () => {
    expect(fallbackDecision(tab([line(2000)]), policy({ defaultTipPct: 18 })).tipPct).toBe(18);
  });

  it.each(["Table 4, Table 5", "Bar 1 & Bar 2", "Seat 1 + Seat 2"])("splits multi-seat tabs (%s)", (seat) => {
    expect(fallbackDecision(tab([line(2000)], { seat }), policy()).action).toBe("split");
  });

  it("does not split when splitBySeat is off", () => {
    expect(fallbackDecision(tab([line(2000)], { seat: "Table 4, Table 5" }), policy({ splitBySeat: false })).action).toBe("settle");
  });

  it("includes the total in the reason", () => {
    expect(fallbackDecision(tab([line(123456)]), policy()).reason).toMatch(/\$1,234\.56/);
  });
});
