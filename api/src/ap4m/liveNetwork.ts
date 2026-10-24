import { Contract, JsonRpcProvider, Signature, Wallet, id, type Provider, type TypedDataDomain } from "ethers";

import { AP4M_CONTRACTS, AP4M_NETWORK, AP4M_PSPS } from "./network.js";
import { Ap4mError, type Ap4mNetwork, type ChannelInfo, type Participant, type RedeemResult, type SettleResult } from "./types.js";
import { PAYMENT_LEDGER_ABI, VOUCHER_REDEEMED_SIGNATURE, signVoucher, voucherDigest, voucherDomain, type Voucher } from "./voucher.js";

export interface LiveOptions {
  apiUrl: string;
  teamName: string;
  agentKey: string;
  /** Merchant-side wallet that submits redeemVoucher and pays gas. Defaults to the Agent wallet. */
  submitterKey?: string;
  merchantId: string;
  payout: string;
  rpcUrl?: string;
  paymentLedger?: string;
  fetch?: typeof fetch;
  provider?: Provider;
  pollMs?: number;
  timeoutMs?: number;
}

const CHANNEL_STATUS_OPEN = 1;

/**
 * Live AP4M on the XRPL EVM Testnet. Implements the participant flow published
 * in the AP4M hackathon kit (sign-in challenge, channel request, cumulative
 * Voucher redemption on PaymentLedger, record-redemption, settle, close).
 * Private keys never leave this process; the service only receives signatures.
 */
export class LiveAp4mNetwork implements Ap4mNetwork {
  readonly mode = "live" as const;
  readonly domain: TypedDataDomain;
  readonly network = AP4M_NETWORK.caip2;
  readonly asset = AP4M_CONTRACTS.rlusdToken;

  private readonly provider: Provider;
  private readonly agent: Wallet;
  private readonly submitter: Wallet;
  private readonly ledger: Contract;
  private readonly http: typeof fetch;
  private token: { value: string; expiresAt: number } | null = null;

  constructor(private readonly opts: LiveOptions) {
    this.provider = opts.provider ?? new JsonRpcProvider(opts.rpcUrl ?? AP4M_NETWORK.rpcUrl, AP4M_NETWORK.chainId);
    this.agent = new Wallet(opts.agentKey, this.provider);
    this.submitter = new Wallet(opts.submitterKey ?? opts.agentKey, this.provider);
    const ledgerAddress = opts.paymentLedger ?? AP4M_CONTRACTS.paymentLedger;
    this.domain = voucherDomain(AP4M_NETWORK.chainId, ledgerAddress);
    this.ledger = new Contract(ledgerAddress, PAYMENT_LEDGER_ABI, this.submitter);
    this.http = opts.fetch ?? fetch;
  }

  agentAddress(): string {
    return this.agent.address;
  }

  merchant() {
    return { merchantId: this.opts.merchantId, payout: this.opts.payout };
  }

  async participants(): Promise<Participant[]> {
    const [payer, payee] = AP4M_PSPS;
    return [
      { role: "agent", id: id(`agent:${this.agent.address}`), address: this.agent.address, attestedBy: payer.pspId, status: "active", label: "Settle settlement agent (onboarded in the AP4M portal)" },
      { role: "merchant", id: this.opts.merchantId, address: this.opts.payout, attestedBy: payee.pspId, status: "active", label: "Venue Merchant payout" },
    ];
  }

  async budget() {
    return null; // shown on the AP4M participant portal (My setup -> Your budget)
  }

  async openChannel(capWei: bigint) {
    const prepared = await this.call<{ to: string; data: string }>("POST", "/public/participant/channel-requests/prepare", {
      cap_rlusd: formatUnits18(capWei),
      merchant_id: this.opts.merchantId,
    });
    const tx = await this.agent.sendTransaction({ to: prepared.to, data: prepared.data });
    await tx.wait();
    let record = await this.call<{ channel_id: string; channel_status: string; failure?: string | null }>(
      "POST",
      "/public/participant/channel-requests",
      { tx_hash: tx.hash },
    );
    const deadline = Date.now() + (this.opts.timeoutMs ?? 180_000);
    while (record.channel_status !== "open") {
      if (record.channel_status === "failed") throw new Ap4mError("SERVICE_ERROR", `Channel ${record.channel_id} failed: ${record.failure}`);
      if (Date.now() > deadline) throw new Ap4mError("SERVICE_ERROR", `Channel ${record.channel_id} still ${record.channel_status}`);
      await sleep(this.opts.pollMs ?? 2000);
      const { channels } = await this.call<{ channels: { channel_id: string; channel_status: string }[] }>("GET", "/public/participant/channels");
      record = channels.find((c) => c.channel_id === record.channel_id) ?? record;
    }
    return { channel: await this.getChannel(record.channel_id), txHash: tx.hash };
  }

  async getChannel(channelId: string): Promise<ChannelInfo> {
    const r = await this.ledger.channels(channelId);
    if (!r || BigInt(r[7]) === 0n) throw new Ap4mError("CHANNEL_NOT_FOUND", `Unknown Channel ${channelId}`);
    return {
      channelId,
      merchantId: r[5],
      capWei: BigInt(r[7]),
      redeemedWei: BigInt(r[8]),
      agent: r[9],
      status: Number(r[11]) === CHANNEL_STATUS_OPEN ? "open" : "closed",
      payout: r[12],
      settledWei: 0n,
      validBefore: Number(r[17]),
    };
  }

  async signVoucher(voucher: Voucher) {
    return signVoucher(this.agent, this.domain, voucher);
  }

  async redeemVoucher(voucher: Voucher, agentSignature: string): Promise<RedeemResult> {
    const before = await this.getChannel(voucher.channelId);
    if (voucher.cumulativeAmount > before.capWei) throw new Ap4mError("OVER_CAP", "Voucher exceeds the Channel cap");
    let receipt;
    try {
      const tx = await this.ledger.redeemVoucher({ channelId: voucher.channelId, cumulativeAmount: voucher.cumulativeAmount }, agentSignature);
      receipt = await tx.wait();
    } catch (err) {
      throw new Ap4mError("SERVICE_ERROR", `PaymentLedger.redeemVoucher reverted: ${(err as Error).message}`);
    }
    const topic = id(VOUCHER_REDEEMED_SIGNATURE);
    const log = receipt.logs.find(
      (l: { address: string; topics: string[] }) => l.address.toLowerCase() === String(this.ledger.target).toLowerCase() && l.topics[0] === topic,
    );
    // Report it so the service settles immediately (it would also find it on-chain).
    await this.call("POST", "/public/participant/record-redemption", { tx_hash: receipt.hash }).catch(() => undefined);
    return {
      claimId: log?.topics[2] ?? "",
      txHash: receipt.hash,
      voucherDigest: voucherDigest(this.domain, voucher),
      amountWei: voucher.cumulativeAmount - before.redeemedWei,
      cumulativeWei: voucher.cumulativeAmount,
    };
  }

  async settle(channelId: string): Promise<SettleResult> {
    for (let attempt = 0; ; attempt++) {
      const { status, body } = await this.raw<{
        settlement_tx: string;
        payout_tx: string;
        amount_rlusd: string;
        receipt_url: string | null;
        claims_settled: number;
      }>("POST", "/public/participant/settle", { channel_id: channelId });
      if (status !== 202) {
        return {
          settlementTxHash: body.settlement_tx,
          payoutTxHash: body.payout_tx,
          amountWei: parseUnits18(body.amount_rlusd),
          receiptUrl: body.receipt_url ? new URL(body.receipt_url, this.opts.apiUrl).toString() : null,
          claimsSettled: body.claims_settled,
        };
      }
      if (attempt >= 40) throw new Ap4mError("SERVICE_ERROR", `payout ${body.payout_tx} still waiting for confirmations`);
      await sleep(this.opts.pollMs ?? 3000);
    }
  }

  async closeChannel(channelId: string) {
    const challenge = await this.call<{
      typedData: { domain: TypedDataDomain; types: Record<string, { name: string; type: string }[]>; value: Record<string, unknown> };
      checkpoint: { channelId: string };
    }>("GET", `/public/participant/close-channel-challenge?channel_id=${encodeURIComponent(channelId)}`);
    const { domain, types, value } = challenge.typedData;
    const typed = {
      ...value,
      finalCumulativeAmount: BigInt(value.finalCumulativeAmount as string),
      merchantPspSignerGeneration: BigInt(value.merchantPspSignerGeneration as string),
      signedAt: BigInt(value.signedAt as string),
    };
    const sig = Signature.from(await this.agent.signTypedData(domain, types, typed));
    const closed = await this.call<{ tx_hash: string }>("POST", "/public/participant/close-channel", {
      agent_signature_r: sig.r,
      agent_signature_vs: sig.yParityAndS,
      channel_id: challenge.checkpoint.channelId,
    });
    return { txHash: closed.tx_hash };
  }

  // Service session -----------------------------------------------------------

  private async session(): Promise<string> {
    if (this.token && this.token.expiresAt > Date.now() + 30_000) return this.token.value;
    const challenge = await this.post<{ challengeId: string; message: string }>("/public/participant/challenge", {
      teamName: this.opts.teamName,
      wallet: this.agent.address,
    });
    const signature = await this.agent.signMessage(challenge.message);
    const session = await this.post<{ token: string; expiresInSeconds: number }>("/public/participant/session", {
      challengeId: challenge.challengeId,
      signature,
    });
    this.token = { value: session.token, expiresAt: Date.now() + session.expiresInSeconds * 1000 };
    return session.token;
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const res = await this.http(`${this.opts.apiUrl}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as T & { error?: string };
    if (!res.ok) throw new Ap4mError("SERVICE_ERROR", `${path} failed (${res.status}): ${data.error ?? ""}`);
    return data;
  }

  private async raw<T>(method: string, path: string, body?: unknown): Promise<{ status: number; body: T }> {
    const token = await this.session();
    const res = await this.http(`${this.opts.apiUrl}${path}`, {
      method,
      headers: { authorization: `Bearer ${token}`, ...(body ? { "content-type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = (await res.json()) as T & { error?: string };
    if (!res.ok) throw new Ap4mError("SERVICE_ERROR", `${path} failed (${res.status}): ${data.error ?? ""}`);
    return { status: res.status, body: data };
  }

  private async call<T>(method: string, path: string, body?: unknown): Promise<T> {
    return (await this.raw<T>(method, path, body)).body;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function formatUnits18(wei: bigint): string {
  const whole = wei / 10n ** 18n;
  const frac = (wei % 10n ** 18n).toString().padStart(18, "0").replace(/0+$/, "");
  return frac ? `${whole}.${frac}` : `${whole}`;
}

function parseUnits18(value: string): bigint {
  const [whole, frac = ""] = value.split(".");
  return BigInt(whole) * 10n ** 18n + BigInt((frac + "0".repeat(18)).slice(0, 18));
}

export const __test = { formatUnits18, parseUnits18 };
