import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { clockTime, useNow } from "../lib/format";
import { IconBattery, IconSignal, IconWifi } from "./icons";

const SCREEN_W = 390;
const SCREEN_H = 844;
const BEZEL = 12;

/**
 * An iPhone-style frame around a 390×844 screen, scaled to fit its container. On a real phone
 * (narrow viewport) the content renders full-screen with no bezel.
 */
export function PhoneFrame({ children, maxScale = 1.25 }: { children: ReactNode; maxScale?: number }) {
  const outer = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const bare = useMediaQuery("(max-width: 500px)");

  useLayoutEffect(() => {
    const el = outer.current;
    if (!el || bare) return;
    const fit = () => {
      const w = SCREEN_W + BEZEL * 2;
      const h = SCREEN_H + BEZEL * 2;
      setScale(Math.min(el.clientWidth / w, el.clientHeight / h, maxScale));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [bare, maxScale]);

  if (bare) return <div className="min-h-full bg-[#f6f3ec]">{children}</div>;

  return (
    <div ref={outer} className="flex h-full w-full items-center justify-center overflow-hidden">
      <div style={{ width: (SCREEN_W + BEZEL * 2) * scale, height: (SCREEN_H + BEZEL * 2) * scale }}>
        <div
          className="relative origin-top-left rounded-[58px] bg-[#1a1a1a] shadow-[0_30px_60px_-20px_rgb(15_31_29/0.45),inset_0_0_0_2px_#3a3a3a]"
          style={{ width: SCREEN_W + BEZEL * 2, height: SCREEN_H + BEZEL * 2, padding: BEZEL, transform: `scale(${scale})` }}
        >
          <div className="relative h-full w-full overflow-hidden rounded-[46px] bg-[#f6f3ec]">
            <StatusBar />
            <div className="absolute top-[11px] left-1/2 h-[34px] w-[120px] -translate-x-1/2 rounded-full bg-black" />
            <div className="absolute inset-0 overflow-y-auto pt-[50px] pb-6 [scrollbar-width:none]">{children}</div>
            <div className="pointer-events-none absolute bottom-2 left-1/2 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-midnight" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBar() {
  const now = useNow(10_000);
  return (
    <div className="absolute inset-x-0 top-0 z-10 flex h-[54px] items-center justify-between px-9 pt-1 text-midnight">
      <span className="text-[16px] font-semibold tabular">{clockTime(now, false)}</span>
      <span className="flex items-center gap-1.5">
        <IconSignal size={17} />
        <IconWifi size={17} />
        <IconBattery size={17} />
      </span>
    </div>
  );
}

function useMediaQuery(query: string): boolean {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}
