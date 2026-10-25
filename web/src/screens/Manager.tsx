import { useState, type ReactNode } from "react";
import { useSearchParams } from "react-router";

import { PhoneFrame } from "../components/PhoneFrame";
import { Wordmark } from "../components/brand";
import { IconAlertCircle, IconArrowRight, IconBars, IconCheck, IconChevronLeft, IconPause, IconPhone } from "../components/icons";
import { Spinner } from "../components/ui";
import { clockTimeAmPm, codeLabel, duration, policyLine, secondsBetween, shortName, useNow } from "../lib/format";
import { tokens, usd } from "../lib/money";
import { useSettle, useTab } from "../lib/store";
import { anomalyLine } from "../lib/tabs";
import type { Tab } from "../lib/types";

/** /manager: the manager's phone. `?tab=` opens a hold directly (the dashboard links here). */
export function ManagerRoute() {
  const [params, setParams] = useSearchParams();
  const selected = params.get("tab");
  return (
    <div className="h-full bg-[#efebe3] p-6">
      <PhoneFrame>
        <ManagerScreen selectedId={selected} onSelect={(id) => setParams(id ? { tab: id } : {}, { replace: true })} />
      </PhoneFrame>
    </div>
  );
}

/** The phone's content: the list of held tabs, or one hold in detail. */
export function ManagerScreen({ selectedId, onSelect }: { selectedId: string | null; onSelect: (tabId: string | null) => void }) {
  const tab = useTab(selectedId);
  const now = useNow();

  return (
    <div className="flex flex-col gap-2.5 px-3.5 pt-1">
      <div className="flex items-center gap-2 px-1 py-1">
        {tab && (
          <button type="button" onClick={() => onSelect(null)} className="-ml-1 flex size-8 items-center justify-center rounded-full text-midnight hover:bg-linen" aria-label="Back to holds">
            <IconChevronLeft size={20} />
          </button>
        )}
        <Wordmark className="text-[26px]" />
        <span className="font-serif text-[19px] text-muted">· Manager</span>
        <span className="ml-auto text-[14px] text-graphite tabular">{clockTimeAmPm(now)}</span>
      </div>
      {tab ? <HoldDetail tab={tab} now={now} onBack={() => onSelect(null)} /> : <HoldList now={now} onSelect={onSelect} />}
    </div>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[20px] border border-stone/50 bg-paper px-4 py-3.5 ${className}`}>{children}</section>;
}

function Label({ children, className = "text-graphite" }: { children: ReactNode; className?: string }) {
  return <div className={`text-[12.5px] font-medium tracking-[0.16em] uppercase ${className}`}>{children}</div>;
}

// List ----------------------------------------------------------------------------

function HoldList({ now, onSelect }: { now: number; onSelect: (tabId: string) => void }) {
  const { state } = useSettle();
  if (!state) {
    return (
      <Card>
        <Spinner /> <span className="ml-2 text-graphite">Connecting…</span>
      </Card>
    );
  }
  const held = state.tabs.filter((t) => t.status === "held").sort((a, b) => Date.parse(b.hold?.triggeredAt ?? "") - Date.parse(a.hold?.triggeredAt ?? ""));

  if (held.length === 0) {
    return (
      <Card className="mt-2 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-sage-soft text-midnight">
          <IconCheck size={24} />
        </span>
        <p className="mt-3 font-serif text-[20px] text-midnight">Nothing on hold</p>
        <p className="mt-1 text-[13.5px] text-graphite">The agent settles every tab inside policy on its own. Holds land here.</p>
      </Card>
    );
  }

  return (
    <>
      <Label className="px-1 pt-1 text-terracotta">
        Held for review · {held.length}
      </Label>
      {held.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onSelect(tab.id)}
          className="animate-settle-in flex items-center gap-3 rounded-[20px] border border-terracotta-line bg-terracotta-soft px-4 py-4 text-left"
        >
          <IconAlertCircle size={26} className="shrink-0 text-terracotta" />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-serif text-[21px] leading-tight font-medium text-midnight">
              {shortName(tab.memberName)} · {tab.seat}
            </span>
            <span className="mt-0.5 block text-[13px] text-graphite">
              {tab.hold ? codeLabel(tab.hold.code) : "Held"} · {tab.hold ? `${duration(now - Date.parse(tab.hold.triggeredAt))} ago` : ""}
            </span>
          </span>
          <span className="font-serif text-[19px] text-midnight tabular">{usd(tab.totalCents)}</span>
        </button>
      ))}
      <p className="px-1 pt-2 text-center text-[13px] text-graphite">Nothing moves on-ledger until a human approves.</p>
    </>
  );
}

// Detail --------------------------------------------------------------------------

function HoldDetail({ tab, now, onBack }: { tab: Tab; now: number; onBack: () => void }) {
  const { state, actions } = useSettle();
  const [approving, setApproving] = useState(false);
  const [calling, setCalling] = useState(false);
  const policy = state!.policy;
  const hold = tab.hold;
  const anomaly = anomalyLine(tab);
  const byMember = hold?.source === "member";

  const approve = async () => {
    setApproving(true);
    try {
      await actions.approve(tab.id);
    } catch {
      // the store shows the error; the tab stays (or goes back to) held
    } finally {
      setApproving(false);
    }
  };

  return (
    <>
      {tab.status === "held" || tab.status === "reconciling" ? (
        <section className="animate-settle-in rounded-[20px] border-[1.5px] border-terracotta-line bg-terracotta-soft px-4 py-3.5">
          <div className="flex gap-3">
            <IconAlertCircle size={30} className="mt-0.5 shrink-0 text-terracotta" />
            <div className="min-w-0">
              <Label className="text-terracotta">Held for review</Label>
              <div className="mt-1 font-serif text-[27px] leading-tight font-medium text-midnight">
                {shortName(tab.memberName)} · {tab.seat}
              </div>
              {hold && (
                <div className="mt-0.5 font-serif text-[16px] text-graphite">
                  {byMember ? "Member disputed" : "Agent paused settlement"} {duration(now - Date.parse(hold.triggeredAt))} ago
                </div>
              )}
            </div>
          </div>
        </section>
      ) : (
        <ResolvedCard tab={tab} />
      )}

      <Card>
        <Label>Tab</Label>
        <ul className="mt-1.5 font-serif text-[17px] text-midnight">
          {tab.items.map((item, i) => (
            <li key={item.name} className={`flex justify-between gap-3 py-1 ${i === anomaly ? "-mx-2 rounded-lg bg-terracotta-soft px-2" : ""}`}>
              <span>
                {item.name}
                {item.qty > 1 && <> × {item.qty}</>}
              </span>
              <span className="tabular">{usd(item.priceCents * item.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex items-baseline justify-between border-t border-stone/60 pt-3">
          <span className="font-serif text-[30px] leading-none font-semibold text-midnight">Total</span>
          <span className="font-serif text-[30px] leading-none font-semibold text-midnight tabular">{usd(tab.totalCents)}</span>
        </div>
      </Card>

      {hold && (
        <Card>
          <div className="flex gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sage-soft text-midnight">
              <IconBars size={18} />
            </span>
            <div className="min-w-0">
              <Label>{byMember ? "Why it's on hold" : "Why the agent held it"}</Label>
              <p className="mt-1.5 font-serif text-[17px] leading-snug text-midnight" title={`${hold.code} · ${hold.source}`}>
                {hold.reason}
              </p>
            </div>
          </div>
          <p className="mt-3 border-t border-stone/60 pt-2.5 text-[13px] text-graphite">Policy: {policyLine(policy)}</p>
        </Card>
      )}

      {tab.status === "held" || tab.status === "reconciling" ? (
        <>
          <button
            type="button"
            onClick={approve}
            disabled={approving || tab.status === "reconciling"}
            className="flex h-[52px] shrink-0 items-center justify-center gap-3 rounded-[16px] bg-midnight font-serif text-[20px] text-ivory disabled:opacity-80"
          >
            {approving || tab.status === "reconciling" ? (
              <>
                <Spinner /> Settling on XRPL…
              </>
            ) : (
              <>
                Approve <IconArrowRight size={20} />
              </>
            )}
          </button>
          <SecondaryButton icon={<IconPause size={16} />} onClick={onBack}>
            Keep on hold
          </SecondaryButton>
          <SecondaryButton icon={<IconPhone size={16} />} onClick={() => setCalling(true)}>
            {calling ? `Calling ${tab.memberName.split(" ")[0]}…` : "Call member"}
          </SecondaryButton>
        </>
      ) : (
        <SecondaryButton icon={<IconChevronLeft size={16} />} onClick={onBack}>
          Back to holds
        </SecondaryButton>
      )}
      <p className="pt-1 text-center text-[13px] text-graphite">Nothing moves on-ledger until a human approves.</p>
    </>
  );
}

function SecondaryButton({ icon, children, onClick }: { icon: ReactNode; children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex h-[50px] shrink-0 items-center justify-center gap-3 rounded-[16px] border border-stone bg-paper font-serif text-[19px] text-midnight hover:bg-linen">
      <span className="flex size-8 items-center justify-center rounded-full bg-sage-soft">{icon}</span>
      {children}
    </button>
  );
}

function ResolvedCard({ tab }: { tab: Tab }) {
  const s = tab.settlement;
  const settled = tab.status === "settled" && s;
  return (
    <section className={`animate-settle-in rounded-[20px] border-[1.5px] px-4 py-4 ${settled ? "border-eucalyptus bg-sage-soft/60" : "border-stone bg-linen"}`}>
      <div className="flex gap-3">
        <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full ${settled ? "bg-eucalyptus text-ivory" : "bg-stone text-midnight"}`}>
          <IconCheck size={18} strokeWidth={2.4} />
        </span>
        <div className="min-w-0">
          <Label className="text-midnight">{settled ? "Approved · settled on XRPL" : "Closed · escrow returned"}</Label>
          <div className="mt-1 font-serif text-[27px] leading-tight font-medium text-midnight">
            {shortName(tab.memberName)} · {tab.seat}
          </div>
          {settled && (
            <div className="mt-0.5 font-serif text-[16px] text-graphite">
              {tokens(s.toVenue)} to the venue{tab.tipCents ? ` (incl. ${usd(tab.tipCents)} tip)` : ""} · {tokens(s.toMember)} back
              {secondsBetween(s.submittedAt, s.validatedAt) && <> · {secondsBetween(s.submittedAt, s.validatedAt)}</>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
