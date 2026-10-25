import { useEffect, useRef, useState } from "react";

import { API_URL } from "./config";
import type { SettleEvent } from "./types";

// Each SSE message uses its type as the event name, so every type needs its own listener.
const EVENT_TYPES = [
  "snapshot",
  "tab.opened",
  "tab.item_added",
  "tab.exit_detected",
  "member.push",
  "tab.grace_tick",
  "agent.decision",
  "tab.held",
  "tab.settled",
  "metrics.updated",
  "tab.updated",
  "funding.completed",
];

const MAX_BACKOFF_MS = 10_000;

/**
 * The one SSE client for GET /events. Asks for `replay=1` so a reload or reconnect gets back the
 * recent events (ledger index, exit and decision times live only on events). Reconnects with
 * backoff when the browser gives up on the stream.
 */
export function useEventStream(onEvent: (event: SettleEvent) => void, enabled = true): boolean {
  const [connected, setConnected] = useState(false);
  const handler = useRef(onEvent);
  handler.current = onEvent;

  useEffect(() => {
    if (!enabled) return;
    let source: EventSource | null = null;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let backoff = 1000;
    let stopped = false;

    const connect = () => {
      source = new EventSource(`${API_URL}/events?replay=1`);
      source.onopen = () => {
        backoff = 1000;
        setConnected(true);
      };
      source.onerror = () => {
        setConnected(false);
        // CONNECTING means the browser is already retrying; CLOSED means it gave up.
        if (source?.readyState === EventSource.CLOSED && !stopped) {
          source.close();
          retry = setTimeout(connect, backoff);
          backoff = Math.min(backoff * 2, MAX_BACKOFF_MS);
        }
      };
      for (const type of EVENT_TYPES) {
        source.addEventListener(type, (msg) => {
          try {
            handler.current(JSON.parse((msg as MessageEvent<string>).data) as SettleEvent);
          } catch (err) {
            console.warn(`bad ${type} event`, err);
          }
        });
      }
    };

    connect();
    return () => {
      stopped = true;
      clearTimeout(retry);
      source?.close();
      setConnected(false);
    };
  }, [enabled]);

  return connected;
}
