import { EventEmitter } from "node:events";

import type { EventType, SettleEvent } from "./types.js";

/** In-process event bus. The SSE route subscribes; services publish. */
export class EventBus {
  private emitter = new EventEmitter();
  private recent: SettleEvent[] = [];

  constructor(private readonly historySize = 200) {
    this.emitter.setMaxListeners(0);
  }

  publish(type: EventType, data: unknown): SettleEvent {
    const event: SettleEvent = { type, at: new Date().toISOString(), data };
    this.recent.push(event);
    if (this.recent.length > this.historySize) this.recent.shift();
    this.emitter.emit("event", event);
    return event;
  }

  subscribe(listener: (event: SettleEvent) => void): () => void {
    this.emitter.on("event", listener);
    return () => this.emitter.off("event", listener);
  }

  /** Last N events, used by the dashboard to replay after a reconnect. */
  history(): SettleEvent[] {
    return [...this.recent];
  }

  clear(): void {
    this.recent = [];
  }
}
