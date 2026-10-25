import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";

import { initials } from "../lib/format";
import { IconExternal } from "./icons";

export function Avatar({ name, size = 56, tone = "sage" }: { name: string; size?: number; tone?: "sage" | "terracotta" }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-display font-semibold ${
        tone === "sage" ? "bg-sage-soft text-midnight" : "bg-terracotta-soft text-terracotta"
      }`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials(name)}
    </span>
  );
}

/** Small uppercase eyebrow label ("OPEN TAB", "WHY THE AGENT HELD IT"). */
export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`text-[13px] font-medium uppercase tracking-[0.16em] ${className || "text-graphite"}`}>{children}</div>;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" | "dashed" | "danger"; busy?: boolean };

export function Button({ variant = "primary", busy, className = "", children, disabled, ...rest }: ButtonProps) {
  const look = {
    primary: "bg-midnight text-ivory hover:bg-[#1b302d] disabled:bg-midnight/40",
    outline: "border border-stone bg-paper text-midnight hover:bg-linen disabled:text-muted",
    dashed: "border border-dashed border-graphite/40 bg-linen/60 text-midnight hover:bg-linen disabled:text-muted",
    danger: "border border-terracotta-line bg-terracotta-soft text-terracotta hover:bg-[#f8e3d5] disabled:opacity-50",
  }[variant];
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-medium transition-colors disabled:cursor-not-allowed ${look} ${className}`}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Pill badge ("Payout rail · SIMULATED"). */
export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "live" | "warn"; children: ReactNode }) {
  const look = {
    neutral: "border-stone bg-paper text-graphite",
    live: "border-eucalyptus bg-sage-soft text-midnight",
    warn: "border-terracotta-line bg-terracotta-soft text-terracotta",
  }[tone];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-medium tracking-[0.04em] ${look}`}>
      {tone === "live" && <span className="size-1.5 rounded-full bg-eucalyptus" />}
      {children}
    </span>
  );
}

export function ExplorerLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-1 text-midnight underline decoration-eucalyptus underline-offset-4 hover:decoration-2 ${className}`}>
      {children}
      <IconExternal size={14} />
    </a>
  );
}

export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <span
      className="inline-block animate-spin rounded-full border-2 border-current border-r-transparent align-[-2px]"
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}

/** Counts from the previous value to the new one, so the outstanding balance visibly ticks down. */
export function AnimatedNumber({ value, format, ms = 900 }: { value: number; format: (n: number) => string; ms?: number }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let frame = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      const eased = 1 - Math.pow(1 - p, 3);
      const n = Math.round(a + (value - a) * eased);
      setShown(n);
      if (p < 1) frame = requestAnimationFrame(step);
      else from.current = value;
    };
    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
      from.current = value;
    };
  }, [value, ms]);
  return <>{format(shown)}</>;
}

/** Bottom-of-screen error line from the store (failed POSTs). */
export function ErrorToast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const id = setTimeout(onClose, 6000);
    return () => clearTimeout(id);
  }, [message, onClose]);
  return (
    <div role="alert" className="animate-settle-in fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-terracotta-line bg-terracotta-soft px-5 py-3 text-sm text-terracotta shadow-lg">
      {message}
      <button type="button" onClick={onClose} className="ml-4 font-medium underline underline-offset-2">
        Dismiss
      </button>
    </div>
  );
}
