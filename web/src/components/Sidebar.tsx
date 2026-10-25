import type { ReactNode } from "react";
import { Link } from "react-router";

import { Wordmark } from "./brand";
import { IconMembers, IconPolicy, IconPos, IconTabs, IconTreasury } from "./icons";

export type NavKey = "pos" | "tabs" | "members" | "treasury" | "policy";

const NAV: { key: NavKey; label: string; icon: ReactNode; to?: string }[] = [
  { key: "pos", label: "POS", icon: <IconPos size={24} />, to: "/pos" },
  { key: "tabs", label: "Tabs", icon: <IconTabs size={24} />, to: "/dashboard" },
  { key: "members", label: "Members", icon: <IconMembers size={24} /> },
  { key: "treasury", label: "Treasury", icon: <IconTreasury size={24} /> },
  { key: "policy", label: "Agent policy", icon: <IconPolicy size={24} /> },
];

export function Sidebar({ active }: { active: NavKey }) {
  return (
    <aside className="flex w-[232px] shrink-0 flex-col bg-midnight px-4 pt-9 pb-8 text-ivory">
      <Link to="/dashboard" className="px-4">
        <Wordmark tone="dark" className="text-[44px]" />
      </Link>
      <nav className="mt-12 flex flex-col gap-2">
        {NAV.map((item) => {
          const cls = `flex items-center gap-4 rounded-xl px-4 py-3 text-[17px] transition-colors ${
            item.key === active ? "bg-eucalyptus/35 text-ivory" : "text-ivory/85 hover:bg-white/5"
          }`;
          return item.to ? (
            <Link key={item.key} to={item.to} className={cls} aria-current={item.key === active ? "page" : undefined}>
              {item.icon}
              {item.label}
            </Link>
          ) : (
            <span key={item.key} className={`${cls} cursor-default`} title="Not in the demo">
              {item.icon}
              {item.label}
            </span>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-ivory/20 px-1 pt-6 text-[14px] leading-6 text-ivory/85">
        <div>The House · NYC</div>
        <div>XRPL Testnet</div>
      </div>
    </aside>
  );
}
