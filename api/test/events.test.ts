import { describe, expect, it, vi } from "vitest";

import { EventBus } from "../src/events.js";

describe("EventBus", () => {
  it("delivers published events with a type, timestamp and data", () => {
    const bus = new EventBus();
    const listener = vi.fn();
    bus.subscribe(listener);
    const event = bus.publish("tab.opened", { id: "t1" });
    expect(listener).toHaveBeenCalledWith(event);
    expect(event.type).toBe("tab.opened");
    expect(event.data).toEqual({ id: "t1" });
    expect(new Date(event.at).toString()).not.toBe("Invalid Date");
  });

  it("fans out to every subscriber", () => {
    const bus = new EventBus();
    const a = vi.fn();
    const b = vi.fn();
    bus.subscribe(a);
    bus.subscribe(b);
    bus.publish("metrics.updated", {});
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });

  it("stops delivering after unsubscribe", () => {
    const bus = new EventBus();
    const listener = vi.fn();
    const off = bus.subscribe(listener);
    off();
    bus.publish("tab.opened", {});
    expect(listener).not.toHaveBeenCalled();
  });

  it("keeps a bounded history in publish order", () => {
    const bus = new EventBus(3);
    for (let i = 0; i < 5; i++) bus.publish("tab.grace_tick", { i });
    expect(bus.history().map((e) => (e.data as { i: number }).i)).toEqual([2, 3, 4]);
  });

  it("returns a copy of history", () => {
    const bus = new EventBus();
    bus.publish("tab.opened", {});
    bus.history().pop();
    expect(bus.history()).toHaveLength(1);
  });

  it("clears history", () => {
    const bus = new EventBus();
    bus.publish("tab.opened", {});
    bus.clear();
    expect(bus.history()).toEqual([]);
  });

  it("supports many concurrent SSE clients without listener warnings", () => {
    const bus = new EventBus();
    const warn = vi.spyOn(process, "emitWarning");
    const offs = Array.from({ length: 50 }, () => bus.subscribe(() => {}));
    bus.publish("tab.opened", {});
    expect(warn).not.toHaveBeenCalled();
    offs.forEach((off) => off());
    warn.mockRestore();
  });
});
