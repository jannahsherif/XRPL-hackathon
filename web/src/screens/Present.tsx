import { useCallback, useEffect, useState } from "react";

import { PhoneFrame } from "../components/PhoneFrame";
import { Wordmark } from "../components/brand";
import { Spinner } from "../components/ui";
import { MOCK } from "../lib/config";
import { shortName, useNow } from "../lib/format";
import { useSettle } from "../lib/store";
import { byOpenedDesc, inGrace } from "../lib/tabs";
import { Dashboard } from "./Dashboard";
import { ManagerScreen } from "./Manager";
import { MemberScreen } from "./Member";
import { Pos } from "./Pos";

type Phone = "member" | "manager";
type Pane = "dashboard" | "pos";

/**
 * The stage layout for the projector: dashboard (or POS) on the left two-thirds, a phone on the right.
 * Keys: 1 member phone, 2 manager phone, D dashboard, P POS, R reset the demo (POST /demo/reset, then reload).
 */
export function Present() {
  const { state, memberFocus, heldFocus, lastPush, actions } = useSettle();
  const [phone, setPhone] = useState<Phone>("member");
  const [pane, setPane] = useState<Pane>("dashboard");
  const [managerTab, setManagerTab] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  // A new push buzzes the member's phone; a new hold opens on the manager's (switch with 2).
  useEffect(() => {
    if (lastPush) setPhone("member");
  }, [lastPush]);
  useEffect(() => {
    if (heldFocus) setManagerTab(heldFocus);
  }, [heldFocus]);

  const reset = useCallback(async () => {
    setResetting(true);
    try {
      if (!MOCK) await actions.reset();
      window.location.reload();
    } catch {
      setResetting(false);
    }
  }, [actions]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      const target = e.target as HTMLElement;
      if (target.closest("input, select, textarea, [contenteditable]")) return;
      const key = e.key.toLowerCase();
      if (key === "1") setPhone("member");
      else if (key === "2") setPhone("manager");
      else if (key === "d") setPane("dashboard");
      else if (key === "p") setPane("pos");
      else if (key === "r") void reset();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reset]);

  // The member phone follows the first tab to leave (memberFocus), else a tab already in grace; until then it's idle.
  const tabs = [...(state?.tabs ?? [])].sort(byOpenedDesc);
  const memberTab = memberFocus ?? tabs.find((t) => inGrace(t) || t.status === "reconciling")?.id ?? null;
  const memberName = tabs.find((t) => t.id === memberTab)?.memberName;
  const waitingHold = phone === "member" && tabs.some((t) => t.status === "held");

  return (
    <div className="grid h-full grid-cols-[2fr_1fr] overflow-hidden bg-ivory">
      <div className="flex min-w-0 flex-col overflow-hidden border-r border-stone/60">
        <div className="flex items-center gap-5 bg-midnight px-8 py-3 text-ivory">
          <Wordmark tone="dark" className="text-[30px]" />
          <Segmented
            value={pane}
            options={[
              { value: "dashboard", label: "Dashboard", key: "D" },
              { value: "pos", label: "POS", key: "P" },
            ]}
            onChange={setPane}
            dark
          />
          <span className="ml-auto text-[14px] text-ivory/80">The House · NYC · XRPL Testnet</span>
        </div>
        <div className="flex min-h-0 flex-1">
          {pane === "dashboard" ? (
            <Dashboard
              embedded
              onOpenHold={(tabId) => {
                setManagerTab(tabId);
                setPhone("manager");
              }}
            />
          ) : (
            <Pos embedded />
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-col bg-[#efebe3]">
        <div className="flex items-center gap-3 px-6 pt-4">
          <Segmented
            value={phone}
            options={[
              { value: "member", label: "Member", key: "1" },
              { value: "manager", label: "Manager", key: "2" },
            ]}
            onChange={setPhone}
          />
          <Clock />
        </div>
        <div className="flex items-center justify-between px-7 pt-2 text-[13px] text-graphite">
          <span>{phone === "member" ? (memberName ? `${shortName(memberName)}'s phone` : "Member phone") : "Manager phone"}</span>
          {waitingHold ? <span className="font-medium text-terracotta">Hold waiting · press 2</span> : <span>R resets the demo</span>}
        </div>
        <div className="min-h-0 flex-1 px-4 pt-2 pb-4">
          <PhoneFrame maxScale={1.4}>
            {phone === "member" ? <MemberScreen tabId={memberTab} /> : <ManagerScreen selectedId={managerTab} onSelect={setManagerTab} />}
          </PhoneFrame>
        </div>
      </div>

      {resetting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-midnight/70 text-[22px] text-ivory">
          <Spinner size={22} /> <span className="ml-3">Resetting the demo…</span>
        </div>
      )}
    </div>
  );
}

function Clock() {
  const now = useNow();
  return (
    <span className="ml-auto font-display text-[18px] font-medium text-midnight tabular">
      {new Date(now).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true })}
    </span>
  );
}

function Segmented<T extends string>({ value, options, onChange, dark = false }: { value: T; options: { value: T; label: string; key: string }[]; onChange: (v: T) => void; dark?: boolean }) {
  return (
    <div className={`inline-flex rounded-xl p-1 ${dark ? "bg-white/10" : "bg-stone/50"}`}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={on}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-[14px] font-medium transition-colors ${
              on ? (dark ? "bg-ivory text-midnight" : "bg-paper text-midnight shadow-sm") : dark ? "text-ivory/80 hover:text-ivory" : "text-graphite hover:text-midnight"
            }`}
          >
            <kbd className={`rounded px-1.5 font-sans text-[11px] ${on ? "bg-linen text-graphite" : dark ? "bg-white/10" : "bg-paper/70"}`}>{o.key}</kbd>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
