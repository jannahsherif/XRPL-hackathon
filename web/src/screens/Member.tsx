import { useState, type ReactNode } from "react";
import { useParams } from "react-router";

import { PhoneFrame } from "../components/PhoneFrame";
import { AppIcon } from "../components/brand";
import { IconAlertCircle, IconCard, IconCheck, IconChevronDown, IconChevronUp, IconPin } from "../components/icons";
import { ExplorerLink, Spinner } from "../components/ui";
import { TOKEN, VENUE } from "../lib/config";
import { clockTime, countdown, explorerFor, itemCount, itemSummary, longDate, secondsBetween, shortHash, useNow } from "../lib/format";
import { cappedTipCents, tipCentsFor, toCents, tokens, usd } from "../lib/money";
import { useSettle, useTab } from "../lib/store";
import { canOrder, graceLeft, inGrace } from "../lib/tabs";
import type { Tab } from "../lib/types";


/** /member/:tabId: the member's lock screen, framed as a phone. */
export function MemberRoute() {
  const { tabId } = useParams();
  return (
    <div className="h-full bg-[#efebe3] p-6">
      <PhoneFrame>
        <MemberScreen tabId={tabId ?? null} />
      </PhoneFrame>
    </div>
  );
}

/** The phone's content. The presenter view renders it with the tab it follows. */
export function MemberScreen({ tabId }: { tabId: string | null }) {
  const { state } = useSettle();
  const tab = useTab(tabId);
  const now = useNow();
  const date = new Date(now);

  return (
    <div className="flex flex-col gap-3 px-3.5">
      <div className="pt-3 pb-3 text-center">
        <div className="font-serif text-[17px] text-graphite">{longDate(date)}</div>
        <div className="mt-0.5 font-serif text-[74px] leading-[0.95] tracking-[-0.02em] text-midnight tabular">{clockTime(date, false)}</div>
      </div>
      {!state ? (
        <Card>
          <p className="flex items-center gap-2 text-[15px] text-graphite">
            <Spinner /> Connecting…
          </p>
        </Card>
      ) : !tab ? (
        <Card>
          <p className="font-serif text-[17px] text-midnight">{tabId ? `No tab “${tabId}”.` : "Nothing yet."}</p>
          <p className="mt-1 text-[13px] text-graphite">{tabId ? "Open one on the POS, then come back here." : "The phone lights up when a member leaves."}</p>
        </Card>
      ) : (
        <TabNotification tab={tab} now={now} />
      )}
    </div>
  );
}

function TabNotification({ tab, now }: { tab: Tab; now: number }) {
  const { meta } = useSettle();
  const m = meta[tab.id];

  if (canOrder(tab)) return <CheckedIn tab={tab} />;
  if (inGrace(tab) || tab.status === "reconciling") {
    return (
      <>
        {/* Keyed by tab: a second tab's push must not inherit the first one's tip or dispute state. */}
        <PushCard key={tab.id} tab={tab} seconds={graceLeft(tab, m, now)} />
        <GeofenceNote />
      </>
    );
  }
  if (tab.status === "settled") return <SettledCard tab={tab} />;
  if (tab.status === "held") return <HeldCard tab={tab} />;
  return (
    <Card>
      <Header when="now" />
      <p className="mt-3 font-serif text-[17px] leading-snug text-midnight">
        Your tab was closed by staff. Your {tokens(tab.allowance)} escrow went back to your house balance.
      </p>
    </Card>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`animate-settle-in rounded-[22px] bg-paper px-4 py-3.5 shadow-[0_1px_2px_rgb(15_31_29/0.06)] ${className}`}>{children}</section>;
}

function Header({ when }: { when: string }) {
  return (
    <div className="flex items-center gap-3">
      <AppIcon size={36} />
      <span className="flex-1 text-[15px] font-semibold text-midnight">Settle · {VENUE}</span>
      <span className="text-[13px] text-muted">{when}</span>
    </div>
  );
}

function CheckedIn({ tab }: { tab: Tab }) {
  return (
    <>
      <Card>
        <Header when="open" />
        <p className="mt-3 font-serif text-[17px] leading-snug text-midnight">
          You're checked in at {VENUE}. Your tab is <b className="font-semibold">{usd(tab.totalCents)}</b> so far
          {itemCount(tab) ? ` · ${itemCount(tab)} items` : ""}.
        </p>
        <p className="mt-2 text-[13px] text-graphite">Nothing to do: it settles on its own when you leave.</p>
      </Card>
      <GeofenceNote />
    </>
  );
}

// Grace: the push, the tip card, the countdown -----------------------------------------

function PushCard({ tab, seconds }: { tab: Tab; seconds: number }) {
  const { state, meta, balances, actions } = useSettle();
  const policy = state!.policy;
  const settling = tab.status === "reconciling";
  const [expanded, setExpanded] = useState(true);
  const [other, setOther] = useState(false);
  const [otherValue, setOtherValue] = useState("");
  const [picked, setPicked] = useState<number | null>(null);
  const [disputing, setDisputing] = useState(false);

  const tipPct = picked ?? meta[tab.id]?.tipPct ?? policy.defaultTipPct;
  // The choices the API offered in member.push; "Other" is appended below.
  const options = meta[tab.id]?.push?.tipOptions ?? [policy.defaultTipPct];
  const tip = cappedTipCents(tab.totalCents, tipPct, tab.allowance);
  const balance = balances?.members[tab.memberId];

  const setTip = async (pct: number) => {
    setPicked(pct);
    try {
      await actions.tip(tab.id, pct);
    } catch {
      setPicked(null);
    }
  };
  const dispute = async () => {
    setDisputing(true);
    try {
      await actions.dispute(tab.id);
    } catch {
      setDisputing(false);
    }
  };

  return (
    <>
      <Card>
        <Header when="now" />
        {settling ? (
          <p className="mt-3 flex items-center gap-2.5 font-serif text-[19px] leading-snug text-midnight">
            <Spinner size={16} /> Settling… <span className="text-graphite">{usd(tab.totalCents + tip)}</span>
          </p>
        ) : (
          <p className="mt-2.5 font-serif text-[18px] leading-snug text-midnight">
            Looks like you've left {VENUE}. We'll settle your tab for <b className="font-semibold">{usd(tab.totalCents)}</b> in{" "}
            <b className="font-semibold tabular">{countdown(seconds)}</b>.
          </p>
        )}
        <p className="mt-1.5 text-[13px] leading-snug text-muted">{itemSummary(tab.items)}</p>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            disabled={settling}
            className="h-11 rounded-xl bg-midnight text-[16px] font-medium text-ivory disabled:opacity-50"
          >
            Add tip
          </button>
          <button
            type="button"
            onClick={dispute}
            disabled={settling || disputing}
            className="h-11 rounded-xl border border-stone bg-paper text-[16px] font-medium text-midnight disabled:opacity-50"
          >
            {disputing ? <Spinner /> : "Dispute"}
          </button>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-sage-soft text-midnight">
            <IconCard size={18} />
          </span>
          <span className="flex-1 text-[12.5px] font-medium tracking-[0.16em] text-graphite uppercase">Expanded · Tip</span>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex size-8 items-center justify-center rounded-full bg-linen text-midnight"
            aria-label={expanded ? "Collapse tip" : "Expand tip"}
          >
            {expanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          </button>
        </div>

        {expanded && (
          <>
            <div className="mt-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length + 1}, minmax(0, 1fr))` }}>
              {options.map((pct) => (
                <TipButton key={pct} selected={!other && tipPct === pct} disabled={settling} onClick={() => (setOther(false), setTip(pct))}>
                  {pct}%
                </TipButton>
              ))}
              <TipButton selected={other || !options.includes(tipPct)} disabled={settling} onClick={() => setOther(true)}>
                Other
              </TipButton>
            </div>
            {other && !settling && (
              <form
                className="mt-2.5 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const pct = Math.round(Number(otherValue));
                  if (Number.isFinite(pct) && pct >= 0 && pct <= 30) void setTip(pct);
                }}
              >
                <input
                  autoFocus
                  inputMode="numeric"
                  value={otherValue}
                  onChange={(e) => setOtherValue(e.target.value.replace(/[^\d]/g, ""))}
                  placeholder="0–30 %"
                  className="h-11 min-w-0 flex-1 rounded-lg border border-stone bg-ivory px-3 text-[16px] text-midnight outline-none focus:border-eucalyptus"
                />
                <button type="submit" className="h-11 rounded-lg bg-midnight px-4 text-[15px] font-medium text-ivory">
                  Set
                </button>
              </form>
            )}

            <div className="mt-3 flex items-baseline justify-between border-t border-stone/60 pt-3">
              <span className="font-serif text-[16px] text-midnight">Your standing rule</span>
              <span className="text-[14px] text-graphite tabular">
                {policy.defaultTipPct}% · {usd(tipCentsFor(tab.totalCents, policy.defaultTipPct))}
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between border-t border-stone/60 pt-3">
              <span className="font-serif text-[30px] leading-none text-midnight">Total</span>
              <span className="font-serif text-[30px] leading-none text-midnight tabular">{usd(tab.totalCents + tip)}</span>
            </div>
            <p className="mt-2.5 text-[12px] leading-snug text-muted">
              Paid from your house balance · {balance ? tokens(balance) : `— ${TOKEN}`} available. No action needed — this settles automatically when the timer ends.
            </p>
          </>
        )}
      </Card>
    </>
  );
}

function TipButton({ selected, disabled, onClick, children }: { selected: boolean; disabled?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={`h-11 rounded-xl border font-serif text-[17px] transition-colors disabled:opacity-50 ${
        selected ? "border-midnight bg-midnight text-ivory" : "border-stone bg-paper text-midnight"
      }`}
    >
      {children}
    </button>
  );
}

function GeofenceNote() {
  return (
    <section className="flex gap-3 rounded-[22px] bg-[#eef0e9] px-4 py-3.5">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sage-soft text-midnight">
        <IconPin size={18} />
      </span>
      <p className="font-serif text-[14px] leading-snug text-graphite">
        Triggered by geofence exit (like the LIRR app). Location is used only to detect leaving the venue. Fallbacks: settle at close, or staff close manually.
      </p>
    </section>
  );
}

// After grace ------------------------------------------------------------------------

function SettledCard({ tab }: { tab: Tab }) {
  const s = tab.settlement!;
  const validated = secondsBetween(s.submittedAt, s.validatedAt);
  const hash = s.batchTxHash ?? s.finishTxHash;
  return (
    <Card>
      <Header when={s.validatedAt ? clockTime(s.validatedAt, false) : "now"} />
      <div className="mt-4 flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-full bg-eucalyptus text-ivory">
          <IconCheck size={24} strokeWidth={2.4} />
        </span>
        <div>
          <div className="font-serif text-[30px] leading-none text-midnight tabular">{usd(toCents(s.toVenue))}</div>
          <div className="mt-1 text-[13px] text-graphite">Settled with {VENUE}</div>
        </div>
      </div>
      <p className="mt-3 font-serif text-[16px] leading-snug text-midnight">
        Paid from your house balance. {toCents(s.toMember) > 0 ? `${tokens(s.toMember)} went back to you.` : "Nothing left in escrow."}
      </p>
      <div className="mt-3 border-t border-stone/60 pt-3 text-[13px] text-graphite">
        Receipt · {s.batchTxHash ? "Batch" : "EscrowFinish"} <span className="font-mono">{shortHash(hash)}</span>
        {validated && <> · validated in {validated}</>}
        <div className="mt-1.5">
          <ExplorerLink href={explorerFor(hash, s.explorerUrls)} className="text-[13px]">
            View on XRPL testnet
          </ExplorerLink>
        </div>
      </div>
    </Card>
  );
}

function HeldCard({ tab }: { tab: Tab }) {
  const disputed = tab.hold?.source === "member";
  return (
    <section className="animate-settle-in rounded-[22px] border border-terracotta-line bg-terracotta-soft p-4">
      <div className="flex items-center gap-3">
        <AppIcon size={36} />
        <span className="flex-1 text-[15px] font-semibold text-midnight">Settle · {VENUE}</span>
        <IconAlertCircle size={22} className="text-terracotta" />
      </div>
      <p className="mt-3 font-serif text-[18px] leading-snug text-midnight">
        {disputed ? "Dispute received. A manager will go over tonight's tab with you." : "A manager is taking a quick look at tonight's tab before it settles."}
      </p>
      <p className="mt-2 text-[13px] text-graphite">Nothing has moved: your {tokens(tab.allowance)} is still in escrow until a human approves.</p>
    </section>
  );
}
