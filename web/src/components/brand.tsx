/** Lowercase "settle" with the Eucalyptus dot. `tone="dark"` is the Ivory-on-Midnight version. */
export function Wordmark({ tone = "light", className = "" }: { tone?: "light" | "dark"; className?: string }) {
  return (
    <span
      className={`font-display font-bold leading-none tracking-[-0.045em] ${tone === "dark" ? "text-ivory" : "text-midnight"} ${className}`}
      aria-label="settle"
    >
      settle
      <span className="ml-[0.05em] inline-block size-[0.2em] rounded-full bg-eucalyptus" />
    </span>
  );
}

/** The "s." app icon tile. */
export function AppIcon({ size = 44 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center bg-midnight font-display font-bold leading-none tracking-[-0.04em] text-ivory"
      style={{ width: size, height: size, borderRadius: size * 0.24, fontSize: size * 0.56 }}
      aria-hidden="true"
    >
      s<span className="ml-[0.04em] inline-block size-[0.22em] self-end rounded-full bg-eucalyptus" style={{ marginBottom: size * 0.27 }} />
    </span>
  );
}
