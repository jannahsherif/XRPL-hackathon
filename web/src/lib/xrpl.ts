import { useEffect, useState } from "react";

import { XRPL_WS } from "./config";

/** What the API doesn't carry: the validated ledger and the fee, read from testnet by hash. */
export interface TxInfo {
  ledgerIndex: number;
  feeDrops: number;
  type: string;
}

const TIMEOUT_MS = 8000;
const found = new Map<string, TxInfo>();
const inflight = new Map<string, Promise<TxInfo | null>>();
const waiting = new Map<number, (msg: { status?: string; result?: Record<string, unknown> }) => void>();
let socket: Promise<WebSocket> | null = null;
let nextId = 1;

function connect(): Promise<WebSocket> {
  socket ??= new Promise<WebSocket>((resolve, reject) => {
    const ws = new WebSocket(XRPL_WS);
    ws.onopen = () => resolve(ws);
    ws.onerror = () => reject(new Error("testnet unreachable"));
    ws.onclose = () => {
      socket = null;
      for (const done of waiting.values()) done({ status: "error" });
      waiting.clear();
    };
    ws.onmessage = (msg) => {
      const data = JSON.parse(String(msg.data));
      waiting.get(data.id)?.(data);
      waiting.delete(data.id);
    };
  }).catch((err) => {
    socket = null;
    throw err;
  });
  return socket;
}

/** `tx` on the public testnet node. Null for unknown (stub) or not-yet-validated hashes; only hits are cached. */
export function lookupTx(hash: string): Promise<TxInfo | null> {
  const hit = found.get(hash);
  if (hit) return Promise.resolve(hit);
  const pending = inflight.get(hash);
  if (pending) return pending;
  const request = (async () => {
    try {
      const ws = await connect();
      const id = nextId++;
      const reply = await new Promise<{ status?: string; result?: Record<string, unknown> }>((resolve) => {
        waiting.set(id, resolve);
        ws.send(JSON.stringify({ id, command: "tx", transaction: hash }));
        setTimeout(() => {
          waiting.delete(id);
          resolve({ status: "timeout" });
        }, TIMEOUT_MS);
      });
      const r = reply.result;
      if (reply.status !== "success" || !r || !r.validated) return null;
      const info = { ledgerIndex: Number(r.ledger_index), feeDrops: Number(r.Fee ?? 0), type: String(r.TransactionType ?? "") };
      found.set(hash, info);
      return info;
    } catch {
      return null;
    } finally {
      inflight.delete(hash);
    }
  })();
  inflight.set(hash, request);
  return request;
}

/** Looks up each hash once per change; `undefined` while loading, `null` when testnet doesn't know it. */
export function useTxInfo(hashes: (string | null | undefined)[], enabled: boolean): (TxInfo | null | undefined)[] {
  const list = hashes.filter((h): h is string => Boolean(h));
  const key = list.join(",");
  const [infos, setInfos] = useState<Record<string, TxInfo | null>>({});

  useEffect(() => {
    if (!enabled || !key) return;
    let live = true;
    for (const hash of key.split(",")) {
      void lookupTx(hash).then((info) => live && setInfos((prev) => ({ ...prev, [hash]: info })));
    }
    return () => {
      live = false;
    };
  }, [key, enabled]);

  return hashes.map((h) => (h && enabled ? (found.get(h) ?? infos[h]) : null));
}
