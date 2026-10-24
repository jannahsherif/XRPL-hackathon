import type { Member, MenuItem, Policy, Tab } from "./types.js";

export const SEED_POLICY: Policy = {
  graceSeconds: 10,
  defaultTipPct: 20,
  holdIfTotalOverTypicalX: 3,
  holdIfItemOverAllowance: true,
  splitBySeat: true,
};

export const SEED_MENU: MenuItem[] = [
  { id: "oysters", name: "East Coast Oysters (6)", priceCents: 2400, category: "food" },
  { id: "burger", name: "Club Burger", priceCents: 2600, category: "food" },
  { id: "salmon", name: "Seared Salmon", priceCents: 3800, category: "food" },
  { id: "steak", name: "Dry-Aged Ribeye", priceCents: 6800, category: "food" },
  { id: "fries", name: "Truffle Fries", priceCents: 1400, category: "food" },
  { id: "martini", name: "House Martini", priceCents: 1900, category: "drink" },
  { id: "old-fashioned", name: "Old Fashioned", priceCents: 2000, category: "drink" },
  { id: "wine-glass", name: "Glass of Sancerre", priceCents: 1800, category: "drink" },
  { id: "espresso", name: "Espresso", priceCents: 600, category: "drink" },
  { id: "bottle-900", name: "Dom Pérignon P2 (bottle)", priceCents: 90000, category: "bottle" },
];

const history = (typical: number, days: number[]) =>
  days.map((d, i) => ({
    date: new Date(Date.UTC(2026, 9, 24 - d)).toISOString().slice(0, 10),
    totalCents: Math.round(typical * (0.8 + ((i * 37) % 40) / 100)),
  }));

const card = (memberId: string, last4: string) => ({
  brand: "Mastercard" as const,
  last4,
  srcDigitalCardId: `MVCT${memberId.toUpperCase()}${last4}000000000000US`,
});

export const SEED_MEMBERS: Member[] = [
  { id: "m1", name: "Eleanor Vance", tier: "founder", allowance: "1000.00", typicalSpendCents: 42000, history: history(42000, [3, 10, 17, 24]), card: card("m1", "5100"), fundedCents: 0 },
  { id: "m2", name: "Marcus Hale", tier: "premier", allowance: "600.00", typicalSpendCents: 18000, history: history(18000, [5, 12, 26]), card: card("m2", "5204"), fundedCents: 0 },
  { id: "m3", name: "Priya Raman", tier: "premier", allowance: "600.00", typicalSpendCents: 15500, history: history(15500, [2, 9, 16, 30]), card: card("m3", "5308"), fundedCents: 0 },
  { id: "m4", name: "Theo Laurent", tier: "standard", allowance: "300.00", typicalSpendCents: 9000, history: history(9000, [7, 21]), card: card("m4", "5412"), fundedCents: 0 },
  // Low-spend member for the anomaly demo: a $900 bottle is >3x typical, so the agent holds it.
  { id: "m5", name: "Jordan Pike", tier: "founder", allowance: "1000.00", typicalSpendCents: 12000, history: history(12000, [4, 18, 32]), card: card("m5", "5516"), fundedCents: 0 },
];

type SeedTab = Omit<Tab, "memberName" | "allowance" | "escrow" | "settlement" | "hold" | "graceEndsAt" | "totalCents" | "tipCents" | "mandate" | "ap4m"> & {
  minutesAgo: number;
};

const item = (id: string, qty = 1) => {
  const m = SEED_MENU.find((x) => x.id === id)!;
  return { name: m.name, qty, priceCents: m.priceCents };
};

// Six open tabs for the dashboard. t6 is a second seat on m1's party.
export const SEED_TABS: SeedTab[] = [
  { id: "t1", memberId: "m1", seat: "Bar 3", status: "ordering", items: [item("martini", 2), item("oysters")], openedAt: "", minutesAgo: 52 },
  { id: "t2", memberId: "m2", seat: "Table 12", status: "ordering", items: [item("steak"), item("wine-glass", 2)], openedAt: "", minutesAgo: 41 },
  { id: "t3", memberId: "m3", seat: "Terrace 4", status: "open", items: [], openedAt: "", minutesAgo: 8 },
  { id: "t4", memberId: "m4", seat: "Bar 7", status: "ordering", items: [item("burger"), item("old-fashioned")], openedAt: "", minutesAgo: 33 },
  { id: "t5", memberId: "m5", seat: "Library 2", status: "ordering", items: [item("salmon"), item("espresso")], openedAt: "", minutesAgo: 27 },
  { id: "t6", memberId: "m1", seat: "Bar 4", status: "ordering", items: [item("fries"), item("martini")], openedAt: "", minutesAgo: 49 },
];
