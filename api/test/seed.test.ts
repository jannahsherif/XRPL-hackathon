import { describe, expect, it } from "vitest";

import { decimalToCents } from "../src/money.js";
import { SEED_MEMBERS, SEED_MENU, SEED_POLICY, SEED_TABS } from "../src/seed.js";

describe("seed data (plan B8)", () => {
  it("has 6 members and 6 open tabs", () => {
    expect(SEED_MEMBERS).toHaveLength(6);
    expect(SEED_TABS).toHaveLength(6);
  });

  it("credentials m1-m5; m6 is the lapsed, display-only member with no tab", () => {
    expect(SEED_MEMBERS.filter((m) => m.credentialed).map((m) => m.id)).toEqual(["m1", "m2", "m3", "m4", "m5"]);
    expect(SEED_TABS.some((t) => t.memberId === "m6")).toBe(false);
  });

  it("uses unique ids", () => {
    for (const list of [SEED_MEMBERS, SEED_MENU, SEED_TABS]) {
      const ids = list.map((x) => x.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("only references members that exist", () => {
    const ids = new Set(SEED_MEMBERS.map((m) => m.id));
    for (const tab of SEED_TABS) expect(ids.has(tab.memberId)).toBe(true);
  });

  it("only uses open or ordering statuses for seeded tabs", () => {
    for (const tab of SEED_TABS) expect(["open", "ordering"]).toContain(tab.status);
  });

  it("marks tabs with items as ordering and empty tabs as open", () => {
    for (const tab of SEED_TABS) expect(tab.status).toBe(tab.items.length ? "ordering" : "open");
  });

  it("keeps every seeded tab within its member's allowance", () => {
    for (const tab of SEED_TABS) {
      const member = SEED_MEMBERS.find((m) => m.id === tab.memberId)!;
      const total = tab.items.reduce((s, i) => s + i.priceCents * i.qty, 0);
      expect(total).toBeLessThanOrEqual(decimalToCents(member.allowance));
    }
  });

  it("has valid allowances, typical spend and history", () => {
    for (const member of SEED_MEMBERS) {
      expect(decimalToCents(member.allowance)).toBeGreaterThanOrEqual(20000);
      expect(decimalToCents(member.allowance)).toBeLessThanOrEqual(100000);
      expect(member.typicalSpendCents).toBeGreaterThan(0);
      expect(member.history.length).toBeGreaterThan(0);
      for (const h of member.history) {
        expect(h.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(h.totalCents).toBeGreaterThan(0);
      }
    }
  });

  it("has positive integer menu prices", () => {
    for (const item of SEED_MENU) {
      expect(Number.isInteger(item.priceCents)).toBe(true);
      expect(item.priceCents).toBeGreaterThan(0);
    }
  });

  it("includes the $900 bottle for the anomaly demo", () => {
    expect(SEED_MENU.find((m) => m.id === "bottle-900")).toMatchObject({ priceCents: 90000, category: "bottle" });
  });

  it("has a low-spend member whose allowance covers the bottle but trips the 3x rule", () => {
    const pike = SEED_MEMBERS.find((m) => m.id === "m5")!;
    expect(90000).toBeGreaterThan(pike.typicalSpendCents * SEED_POLICY.holdIfTotalOverTypicalX);
    expect(90000).toBeLessThanOrEqual(decimalToCents(pike.allowance));
  });

  it("matches the policy JSON in the interface contract", () => {
    expect(SEED_POLICY).toEqual({
      graceSeconds: 10,
      defaultTipPct: 20,
      holdIfTotalOverTypicalX: 3,
      holdIfItemOverAllowance: true,
      splitBySeat: true,
    });
  });
});
