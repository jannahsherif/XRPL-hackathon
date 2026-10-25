import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";

import { Sidebar } from "../components/Sidebar";
import { IconCheck, IconDots, IconPlus, IconWarning } from "../components/icons";
import { Avatar, Button, Eyebrow, Spinner } from "../components/ui";
import { MOCK } from "../lib/config";
import { countdown, hasEscrow, shortName } from "../lib/format";
import { toCents, tokens, usd } from "../lib/money";
import { useSettle } from "../lib/store";
import { byOpenedDesc, canOrder, graceLeft, inGrace } from "../lib/tabs";
import { OPEN_STATUSES, type MenuItem, type Tab } from "../lib/types";

type Chip = "Drinks" | "Wine" | "Food" | "Bottles";
const CHIPS: Chip[] = ["Drinks", "Wine", "Food", "Bottles"];

// A double tap within this window adds one item, not two.
const TAP_DEBOUNCE_MS = 600;

// Grid order mirrors pos.jpg: cocktails, then food, then the anomaly bottle.
const ORDER = ["martini", "old-fashioned", "wine-glass", "oysters", "burger", "fries", "bottle-900", "espresso", "salmon", "steak"];

function chipOf(item: MenuItem): Chip {
  if (item.category === "bottle") return "Bottles";
  if (item.category === "food") return "Food";
  return /wine|sancerre|champagne/i.test(`${item.id} ${item.name}`) ? "Wine" : "Drinks";
}

/** The demo terminal (stands in for Toast / Lightspeed). `embedded` drops the sidebar for the presenter view. */
export function Pos({ embedded = false }: { embedded?: boolean }) {
  return embedded ? (
    <PosMain embedded />
  ) : (
    <div className="flex h-full">
      <Sidebar active="pos" />
      <PosMain />
    </div>
  );
}

function PosMain({ embedded = false }: { embedded?: boolean }) {
  const { state, connected } = useSettle();
  const [params, setParams] = useSearchParams();
  const [localTab, setLocalTab] = useState<string | null>(null);
  const [chip, setChip] = useState<Chip | null>(null);

  const tabs = useMemo(() => [...(state?.tabs ?? [])].sort(byOpenedDesc), [state?.tabs]);
  const fallback = tabs.find(canOrder)?.id ?? null;
  const tabId = (embedded ? localTab : params.get("tab")) ?? fallback;
  const tab = tabs.find((t) => t.id === tabId);
  const setTab = (id: string) => (embedded ? setLocalTab(id) : setParams({ tab: id }, { replace: true }));

  const menu = useMemo(() => {
    const items = [...(state?.menu ?? [])].sort((a, b) => rank(a.id) - rank(b.id));
    return chip ? items.filter((i) => chipOf(i) === chip) : items;
  }, [state?.menu, chip]);

  if (!state) {
    return (
      <main className="flex flex-1 items-center justify-center text-muted">
        <Spinner /> <span className="ml-3">Connecting to the Settle API…</span>
      </main>
    );
  }

  return (
    <main className={`flex min-w-0 flex-1 gap-6 overflow-hidden ${embedded ? "px-8 py-6" : "px-10 py-8"}`}>
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-[52px] leading-[1.05] text-midnight">POS · {tab?.seat ?? "Bar"}</h1>
            <p className="mt-1 text-[19px] text-muted">Demo terminal — stands in for Toast / Lightspeed</p>
          </div>
          <StreamingPill connected={connected} />
        </header>

        <div className="mt-7 flex gap-3">
          {CHIPS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setChip(chip === c ? null : c)}
              aria-pressed={chip === c}
              className={`h-12 w-[124px] rounded-xl border text-[17px] transition-colors ${
                chip === c ? "border-midnight bg-midnight text-ivory" : "border-stone bg-paper text-midnight hover:bg-linen"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-5 min-h-0 flex-1 overflow-auto pr-1 pb-1">
          <div className="grid grid-cols-3 gap-4">
            {menu.map((item) => (
              <MenuTile key={item.id} item={item} tab={tab} />
            ))}
          </div>
        </div>
      </section>

      <OpenTabRail tab={tab} tabs={tabs} onSelect={setTab} />
    </main>
  );
}

function rank(id: string): number {
  const i = ORDER.indexOf(id);
  return i === -1 ? ORDER.length : i;
}

function StreamingPill({ connected }: { connected: boolean }) {
  if (MOCK) {
    return <span className="mt-2 rounded-full border border-dashed border-terracotta-line bg-terracotta-soft px-4 py-2 text-[14px] text-terracotta">Fixture data · not streaming</span>;
  }
  return connected ? (
    <span className="mt-2 inline-flex items-center gap-2.5 rounded-full border border-dashed border-eucalyptus bg-sage-soft/60 px-4 py-2 text-[14px] whitespace-nowrap text-midnight">
      <span className="size-2.5 rounded-full bg-eucalyptus" />
      Streaming line items to Settle
      <IconCheck size={16} />
    </span>
  ) : (
    <span className="mt-2 inline-flex items-center gap-2.5 rounded-full border border-dashed border-stone bg-paper px-4 py-2 text-[14px] text-muted">
      <Spinner size={12} /> Reconnecting to Settle…
    </span>
  );
}

// Which tab the terminal is on, and opening a new one -------------------------------

function TabSelector({ tabs, tab, onSelect }: { tabs: Tab[]; tab?: Tab; onSelect: (id: string) => void }) {
  const live = tabs.filter((t) => OPEN_STATUSES.includes(t.status) || t.id === tab?.id);
  return (
    <select
      value={tab?.id ?? ""}
      onChange={(e) => onSelect(e.target.value)}
      aria-label="Tab this terminal is on"
      className="h-10 min-w-0 flex-1 rounded-xl border border-stone bg-ivory px-3 text-[15px] text-midnight outline-none focus:border-eucalyptus"
    >
      {!tab && <option value="">No open tab</option>}
      {live.map((t) => (
        <option key={t.id} value={t.id}>
          {shortName(t.memberName)} · {t.seat} · {usd(t.totalCents)}
          {canOrder(t) ? "" : ` · ${t.status.replace("_", " ")}`}
        </option>
      ))}
    </select>
  );
}

function NewTabForm({ onOpened, onCancel }: { onOpened: (tabId: string) => void; onCancel: () => void }) {
  const { state, actions } = useSettle();
  const members = state?.members ?? [];
  const [memberId, setMemberId] = useState(members[0]?.id ?? "m1");
  const [seat, setSeat] = useState("Bar 4");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const member = members.find((m) => m.id === memberId);

  const open = async () => {
    setBusy(true);
    setError(null);
    try {
      const tab = await actions.openTab(memberId, seat.trim() || undefined);
      onOpened(tab.id);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="animate-settle-in absolute inset-x-5 top-[76px] z-20 flex flex-col gap-3 rounded-2xl border border-stone bg-paper p-5 shadow-xl">
      <Eyebrow>New tab</Eyebrow>
      <label className="flex flex-col gap-1 text-[13px] text-graphite">
        Member
        <select value={memberId} onChange={(e) => setMemberId(e.target.value)} className="h-11 rounded-xl border border-stone bg-ivory px-3 text-[16px] text-midnight">
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} · {m.tier} · {tokens(m.allowance)}
              {m.credentialed ? "" : " · no credential"}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-[13px] text-graphite">
        Seat
        <input value={seat} onChange={(e) => setSeat(e.target.value)} className="h-11 rounded-xl border border-stone bg-ivory px-3 text-[16px] text-midnight" />
      </label>
      <div className="flex items-center gap-3">
      <Button className="h-11 flex-1 py-0 text-[15px]" onClick={open} busy={busy}>
        {busy ? (
          <>
            <Spinner /> Escrowing {member ? tokens(member.allowance) : ""}…
          </>
        ) : (
          <>Open tab · escrow {member ? tokens(member.allowance) : ""}</>
        )}
      </Button>
      <button type="button" onClick={onCancel} className="h-11 px-2 text-[15px] text-graphite underline underline-offset-4">
        Cancel
      </button>
      </div>
      {error && <p className="text-[14px] text-terracotta">{error}</p>}
    </div>
  );
}

// Menu grid -------------------------------------------------------------------

function MenuTile({ item, tab }: { item: MenuItem; tab?: Tab }) {
  const { actions } = useSettle();
  const [pulse, setPulse] = useState(0);
  const [missing, setMissing] = useState(false);
  const lastTap = useRef(0);
  const inFlight = useRef(false);
  const anomaly = item.category === "bottle";
  // One bottle per tab: a second would push the tab past its escrow, and that hold can't be approved.
  const onTab = anomaly && Boolean(tab?.items.some((i) => i.name === item.name));
  const enabled = Boolean(tab && canOrder(tab)) && !onTab;

  const add = async () => {
    const now = Date.now();
    if (!tab || !enabled || inFlight.current || now - lastTap.current < TAP_DEBOUNCE_MS) return;
    lastTap.current = now;
    inFlight.current = true;
    setPulse((n) => n + 1);
    try {
      await actions.addItem(tab.id, item.id);
    } catch {
      // the store shows the error
    } finally {
      inFlight.current = false;
    }
  };

  return (
    <button
      key={pulse}
      type="button"
      onClick={add}
      disabled={!enabled}
      className={`flex flex-col overflow-hidden rounded-2xl border p-2.5 text-left transition-[transform,background-color,opacity] active:scale-[0.98] disabled:cursor-not-allowed ${onTab ? "opacity-45 saturate-50" : "disabled:opacity-60"} ${
        anomaly ? "border-dashed border-terracotta-line bg-[#fdf5ee]" : "border-stone/50 bg-paper hover:bg-white"
      } ${pulse ? "animate-tile-pulse" : ""}`}
    >
      <div className={`relative aspect-[2/1] overflow-hidden rounded-xl ${anomaly ? "bg-[#fbebe4]" : "bg-[#f3efe6]"}`}>
        {missing ? (
          <div className="flex h-full items-center justify-center bg-stone/70 px-4 text-center font-serif text-[20px] text-graphite italic">{item.name}</div>
        ) : (
          <img src={`/menu/${item.id}.jpg`} alt="" onError={() => setMissing(true)} className="h-full w-full object-cover" />
        )}
        {anomaly && (
          <span className="absolute top-2 right-2 flex size-10 items-center justify-center rounded-lg bg-[#fce2dd] text-terracotta">
            <IconWarning size={22} />
          </span>
        )}
      </div>
      <div className="px-2 pt-3 pb-1.5">
        <div className="text-[18px] leading-snug font-medium text-midnight">{item.name}</div>
        <div className={`mt-0.5 text-[17px] ${anomaly ? "text-terracotta" : "text-muted"}`}>
          {usd(item.priceCents, { trim: true })}
          {anomaly && (onTab ? " · already on this tab" : " · anomaly trigger (DEMO)")}
        </div>
      </div>
    </button>
  );
}

// Right rail --------------------------------------------------------------------

function OpenTabRail({ tab, tabs, onSelect }: { tab?: Tab; tabs: Tab[]; onSelect: (id: string) => void }) {
  const { meta, actions } = useSettle();
  const [opening, setOpening] = useState(false);
  const [sent, setSent] = useState(false);
  const [closing, setClosing] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!tab || !inGrace(tab)) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [tab]);
  useEffect(() => {
    if (!sent) return;
    const id = setTimeout(() => setSent(false), 2000);
    return () => clearTimeout(id);
  }, [sent]);

  const header = (
    <div className="flex items-center gap-3">
      <Eyebrow className="shrink-0 text-graphite">Open tab</Eyebrow>
      <TabSelector tabs={tabs} tab={tab} onSelect={onSelect} />
      <button
        type="button"
        onClick={() => setOpening(!opening)}
        aria-expanded={opening}
        aria-label="New tab"
        title="New tab"
        className="flex size-10 shrink-0 items-center justify-center rounded-full border border-stone text-midnight hover:bg-linen"
      >
        <IconPlus size={18} />
      </button>
      {tab && (
        <Link to={`/dashboard?tab=${tab.id}`} className="flex size-10 shrink-0 items-center justify-center rounded-full border border-stone text-graphite hover:bg-linen" aria-label="Open in dashboard" title="Open in dashboard">
          <IconDots size={20} />
        </Link>
      )}
    </div>
  );
  const newTab = opening && (
    <NewTabForm
      onOpened={(id) => {
        setOpening(false);
        onSelect(id);
      }}
      onCancel={() => setOpening(false)}
    />
  );

  if (!tab) {
    return (
      <aside className="relative flex w-[460px] shrink-0 flex-col rounded-2xl border border-stone/60 bg-paper px-7 pt-7 pb-6">
        {header}
        {newTab}
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p className="font-serif text-[26px] text-midnight">No open tab on this terminal</p>
          <p className="text-[15px] text-graphite">Press + to escrow a member's allowance and start ordering.</p>
        </div>
      </aside>
    );
  }

  const headroom = toCents(tab.allowance) - tab.totalCents;
  const close = async () => {
    setClosing(true);
    try {
      await actions.close(tab.id);
    } catch {
      // the store shows the error
    } finally {
      setClosing(false);
    }
  };

  return (
    <aside className="relative flex w-[460px] shrink-0 flex-col rounded-2xl border border-stone/60 bg-paper px-7 pt-7 pb-6">
      {header}
      {newTab}
      <div className="mt-4 flex items-center gap-4 border-b border-stone/60 pb-5">
        <Avatar name={tab.memberName} size={64} />
        <div className="min-w-0">
          <div className="truncate font-display text-[26px] font-medium tracking-[-0.01em] text-midnight">
            {shortName(tab.memberName)} · {tab.seat}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[16px] text-graphite">
            {hasEscrow(tab) ? (
              <>
                <IconCheck size={17} className="text-eucalyptus" strokeWidth={2.2} /> Allowance {tokens(tab.allowance)} escrowed
              </>
            ) : (
              <>Allowance {tokens(tab.allowance)} · not escrowed</>
            )}
          </div>
        </div>
      </div>

      <TabStatusStrip tab={tab} seconds={graceLeft(tab, meta[tab.id], now)} />

      <ul className="min-h-0 flex-1 divide-y divide-stone/50 overflow-auto">
        {tab.items.map((item) => (
          <li key={item.name} className="animate-settle-in flex justify-between gap-4 py-4 text-[18px] text-midnight">
            <span>
              {item.name}
              {item.qty > 1 && <> × {item.qty}</>}
            </span>
            <span className="tabular">{usd(item.priceCents * item.qty)}</span>
          </li>
        ))}
        {tab.items.length === 0 && <li className="py-4 text-[16px] text-muted">Tap an item to add it to the tab.</li>}
      </ul>

      <div className="mt-4 space-y-2 border-t border-stone/60 pt-5 text-[17px]">
        <div className="flex justify-between text-graphite">
          <span>Subtotal</span>
          <span className="tabular">{usd(tab.totalCents)}</span>
        </div>
        <div className="flex justify-between text-graphite">
          <span>Tip</span>
          <span>set by member rule</span>
        </div>
      </div>

      <div className="mt-4 border-t border-stone/60 pt-5">
        <div className="flex items-baseline justify-between">
          <span className="font-serif text-[40px] leading-none text-midnight">Total</span>
          <span className="font-display text-[36px] leading-none font-semibold text-midnight tabular">{usd(tab.totalCents)}</span>
        </div>
        <div className={`mt-2 text-[16px] ${headroom < 0 ? "text-terracotta" : "text-graphite"}`}>
          {headroom < 0 ? `${tokens(-headroom)} over the escrow` : `${tokens(headroom)} headroom in escrow`}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button className="h-14 text-[18px]" onClick={() => setSent(true)} disabled={!canOrder(tab) || tab.items.length === 0}>
          {sent ? (
            <>
              Sent <IconCheck size={18} />
            </>
          ) : (
            "Send order"
          )}
        </Button>
        <Button variant="dashed" className="h-14 text-[18px]" onClick={close} disabled={!OPEN_STATUSES.includes(tab.status) || tab.status === "reconciling"} busy={closing}>
          {closing ? <Spinner /> : null} Close tab
        </Button>
      </div>
      <p className="mt-4 text-center text-[14px] text-graphite">No card, no pre-auth. Tab settles on exit.</p>
    </aside>
  );
}

function TabStatusStrip({ tab, seconds }: { tab: Tab; seconds: number }) {
  if (canOrder(tab)) return null;
  const look =
    tab.status === "held"
      ? "border-terracotta-line bg-terracotta-soft text-terracotta"
      : tab.status === "closed_manually"
        ? "border-stone bg-linen text-graphite"
        : "border-eucalyptus/60 bg-sage-soft/60 text-midnight";
  const text = inGrace(tab)
    ? `Member left · settling in ${countdown(seconds)}`
    : tab.status === "reconciling"
      ? "Agent reconciling against this terminal…"
      : tab.status === "settled"
        ? `Settled on XRPL · ${tokens(tab.settlement?.toVenue ?? "0")} to the venue`
        : tab.status === "held"
          ? "Held for manager review"
          : "Closed manually · escrow returned";
  return <div className={`mt-4 rounded-xl border px-4 py-3 text-[15px] font-medium ${look}`}>{text}</div>;
}
