import { createHash, generateKeyPairSync, randomUUID, sign, verify, type KeyObject } from "node:crypto";

import { Wallet, verifyMessage } from "ethers";

import { decimalToCents } from "../money.js";
import type { Tab, TabMandate } from "../types.js";

/**
 * Verifiable Intent (Mastercard, open spec v0.1) for Settle, simplified profile:
 *
 *  L2 mandate  member -> agent   ES256 JWS from the member's device key. Autonomous
 *                                mode: max amount = tab allowance, payee = venue,
 *                                expiry = end of night, agent key bound in `cnf`.
 *  L3 payment  agent  -> network The agent signs a payment record (EIP-191, its AP4M
 *                                payment key) binding the mandate hash, the cart
 *                                hash and the final amount.
 *
 * Settlement is refused unless the amount and payee fit the mandate, it has not
 * expired, and the agent that pays is the one the member delegated to. The full
 * SD-JWT selective-disclosure format from the reference implementation
 * (github.com/agent-intent/verifiable-intent) is the production path.
 */

export const MANDATE_VCT = "mastercard.verifiable-intent.mandate";

export interface MandatePayload {
  vct: typeof MANDATE_VCT;
  mode: "autonomous";
  jti: string;
  iss: string;
  sub: string;
  aud: string;
  iat: number;
  exp: number;
  cnf: { agent: string };
  constraints: {
    max_amount: { value: string; currency: "USD" };
    payees: string[];
    purpose: "food-and-beverage-tab";
    tab_id: string;
  };
}

export interface PaymentRecord {
  mandate_hash: string;
  tab_id: string;
  cart_hash: string;
  amount: { value: string; currency: "USD" };
  payee: string;
  iat: number;
  agent: string;
  signature: string;
}

export interface VerifyResult {
  ok: boolean;
  violations: string[];
  record: PaymentRecord | null;
}

const b64url = (buf: Buffer | string) => Buffer.from(buf).toString("base64url");
export const sha256 = (data: string) => `sha256:${createHash("sha256").update(data).digest("hex")}`;

/** Stable JSON so hashes do not depend on key order. */
export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value as object)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canonical((value as Record<string, unknown>)[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export const cartHash = (tab: Pick<Tab, "id" | "items">) => sha256(canonical({ tab: tab.id, items: tab.items }));

export function signJws(payload: object, privateKey: KeyObject): string {
  const header = b64url(JSON.stringify({ alg: "ES256", typ: "vi+jwt" }));
  const body = b64url(JSON.stringify(payload));
  const sig = sign("sha256", Buffer.from(`${header}.${body}`), { key: privateKey, dsaEncoding: "ieee-p1363" });
  return `${header}.${body}.${b64url(sig)}`;
}

export function verifyJws<T>(jws: string, publicKey: KeyObject): T {
  const [header, body, sig] = jws.split(".");
  if (!header || !body || !sig) throw new Error("malformed JWS");
  const ok = verify("sha256", Buffer.from(`${header}.${body}`), { key: publicKey, dsaEncoding: "ieee-p1363" }, Buffer.from(sig, "base64url"));
  if (!ok) throw new Error("mandate signature does not verify against the member's key");
  return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
}

interface StoredMandate {
  jws: string;
  payload: MandatePayload;
  memberId: string;
}

export class IntentService {
  private readonly memberKeys = new Map<string, { privateKey: KeyObject; publicKey: KeyObject }>();
  private readonly mandates = new Map<string, StoredMandate>();

  constructor(
    private readonly agent: Wallet,
    private readonly payee: string,
    private readonly now: () => number = () => Date.now(),
  ) {}

  get agentAddress(): string {
    return this.agent.address;
  }

  /** The member's device key. SIMULATED: generated server-side; a phone passkey would hold it in production. */
  memberKey(memberId: string) {
    let keys = this.memberKeys.get(memberId);
    if (!keys) {
      keys = generateKeyPairSync("ec", { namedCurve: "P-256" });
      this.memberKeys.set(memberId, keys);
    }
    return keys;
  }

  publicJwk(memberId: string) {
    return this.memberKey(memberId).publicKey.export({ format: "jwk" });
  }

  /** Member authorizes their agent to settle this tab up to the allowance, only to the venue, until end of night. */
  issue(tab: Pick<Tab, "id" | "memberId" | "allowance">, validForMs = 12 * 3600_000): { mandate: TabMandate; jws: string } {
    const iat = Math.floor(this.now() / 1000);
    const payload: MandatePayload = {
      vct: MANDATE_VCT,
      mode: "autonomous",
      jti: randomUUID(),
      iss: `member:${tab.memberId}`,
      sub: `agent:${this.agent.address}`,
      aud: this.payee,
      iat,
      exp: iat + Math.floor(validForMs / 1000),
      cnf: { agent: this.agent.address },
      constraints: {
        max_amount: { value: tab.allowance, currency: "USD" },
        payees: [this.payee],
        purpose: "food-and-beverage-tab",
        tab_id: tab.id,
      },
    };
    const jws = signJws(payload, this.memberKey(tab.memberId).privateKey);
    const hash = sha256(jws);
    this.mandates.set(hash, { jws, payload, memberId: tab.memberId });
    return {
      jws,
      mandate: {
        id: payload.jti,
        hash,
        maxAmount: tab.allowance,
        currency: "USD",
        payee: this.payee,
        agent: this.agent.address,
        expiresAt: new Date(payload.exp * 1000).toISOString(),
        status: "active",
        paymentRecordHash: null,
      },
    };
  }

  getJws(hash: string): string | undefined {
    return this.mandates.get(hash)?.jws;
  }

  /** Check a settlement against the mandate and, if it fits, have the agent sign the L3 payment record. */
  async verifyAndRecord(tab: Tab, amountCents: number, payee = this.payee): Promise<VerifyResult> {
    if (!tab.mandate) return { ok: false, violations: ["No Verifiable Intent mandate for this tab"], record: null };
    const stored = this.mandates.get(tab.mandate.hash);
    if (!stored) return { ok: false, violations: ["Mandate not found"], record: null };

    const violations: string[] = [];
    let payload: MandatePayload | null = null;
    try {
      payload = verifyJws<MandatePayload>(stored.jws, this.memberKey(stored.memberId).publicKey);
    } catch (err) {
      violations.push((err as Error).message);
    }
    if (payload) {
      const nowSec = Math.floor(this.now() / 1000);
      if (payload.vct !== MANDATE_VCT) violations.push("Not a Verifiable Intent mandate");
      if (payload.iss !== `member:${tab.memberId}`) violations.push("Mandate was issued by a different member");
      if (payload.constraints.tab_id !== tab.id) violations.push("Mandate is for a different tab");
      if (nowSec >= payload.exp) violations.push("Mandate has expired");
      if (payload.cnf.agent.toLowerCase() !== this.agent.address.toLowerCase()) violations.push("Paying agent is not the one the member delegated to");
      if (!payload.constraints.payees.includes(payee)) violations.push("Payee is not on the member's approved list");
      if (amountCents > decimalToCents(payload.constraints.max_amount.value)) {
        violations.push(`Amount $${(amountCents / 100).toFixed(2)} exceeds the mandate maximum $${payload.constraints.max_amount.value}`);
      }
      if (amountCents <= 0 && tab.items.length > 0) violations.push("Amount must be positive");
    }
    if (violations.length) return { ok: false, violations, record: null };

    const unsigned = {
      mandate_hash: tab.mandate.hash,
      tab_id: tab.id,
      cart_hash: cartHash(tab),
      amount: { value: (amountCents / 100).toFixed(2), currency: "USD" as const },
      payee,
      iat: Math.floor(this.now() / 1000),
      agent: this.agent.address,
    };
    const signature = await this.agent.signMessage(canonical(unsigned));
    return { ok: true, violations: [], record: { ...unsigned, signature } };
  }
}

/** Anyone can verify an L3 payment record: the agent's signature over the canonical record. */
export function verifyPaymentRecord(record: PaymentRecord): boolean {
  const { signature, ...unsigned } = record;
  try {
    return verifyMessage(canonical(unsigned), signature).toLowerCase() === record.agent.toLowerCase();
  } catch {
    return false;
  }
}

export const paymentRecordHash = (record: PaymentRecord) => sha256(canonical(record));
