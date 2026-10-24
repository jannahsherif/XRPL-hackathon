import { Wallet, parseUnits } from "ethers";
import { describe, expect, it } from "vitest";

import { SimulatedAp4mNetwork } from "../src/ap4m/simulatedNetwork.js";
import { Ap4mError } from "../src/ap4m/types.js";
import { signVoucher } from "../src/ap4m/voucher.js";

const rlusd = (v: string) => parseUnits(v, 18);
const make = (budget = "20", opts: Partial<ConstructorParameters<typeof SimulatedAp4mNetwork>[0]> = {}) =>
  new SimulatedAp4mNetwork({ budgetWei: rlusd(budget), agentWallet: Wallet.createRandom() as unknown as Wallet, ...opts });

async function redeem(net: SimulatedAp4mNetwork, channelId: string, cumulative: bigint) {
  const voucher = { channelId, cumulativeAmount: cumulative };
  return net.redeemVoucher(voucher, await net.signVoucher(voucher));
}

const code = async (p: Promise<unknown>) => {
  try {
    await p;
    return "resolved";
  } catch (err) {
    return (err as Ap4mError).code;
  }
};

describe("ParticipantRegistry (Know Your Agent)", () => {
  it("onboards principal, agent and merchant attested by Mastercard PSPs", async () => {
    const net = make();
    const roles = (await net.participants()).map((p) => [p.role, p.attestedBy, p.status]);
    expect(roles).toEqual([
      ["agent_principal", "mc-payer-psp", "active"],
      ["agent", "mc-payer-psp", "active"],
      ["merchant", "mc-payee-psp", "active"],
    ]);
  });

  it("refuses to open a Channel for a suspended agent", async () => {
    const net = make();
    net.setStatus(net.agentAddress(), "suspended");
    expect(await code(net.openChannel(rlusd("1")))).toBe("KYA_REJECTED");
  });

  it("refuses to open a Channel to a suspended merchant", async () => {
    const net = make();
    net.setStatus(net.merchant().payout, "suspended");
    expect(await code(net.openChannel(rlusd("1")))).toBe("KYA_REJECTED");
  });

  it("refuses Vouchers once the agent is suspended mid-channel", async () => {
    const net = make();
    const { channel } = await net.openChannel(rlusd("2"));
    net.setStatus(net.agentAddress(), "suspended");
    expect(await code(redeem(net, channel.channelId, rlusd("1")))).toBe("KYA_REJECTED");
  });
});

describe("Funded ASL (PooledEscrowVault + Channel cap)", () => {
  it("opens a Channel bound to the agent and the venue payout", async () => {
    const net = make();
    const { channel, txHash } = await net.openChannel(rlusd("6"));
    expect(channel).toMatchObject({ agent: net.agentAddress(), payout: net.merchant().payout, capWei: rlusd("6"), redeemedWei: 0n, status: "open" });
    expect(channel.channelId).toMatch(/^0x[0-9a-f]{64}$/);
    expect(txHash).toMatch(/^0x[0-9a-f]{64}$/);
    expect(net.events.at(-1)?.name).toBe("ChannelOpened");
  });

  it("never allocates more than the funded budget", async () => {
    const net = make("10");
    await net.openChannel(rlusd("6"));
    expect(await code(net.openChannel(rlusd("5")))).toBe("BUDGET_EXCEEDED");
    expect((await net.budget()).availableWei).toBe(rlusd("4"));
  });

  it("rejects a zero cap", async () => {
    expect(await code(make().openChannel(0n))).toBe("OVER_CAP");
  });
});

describe("PaymentLedger.redeemVoucher", () => {
  it("advances the redeemed watermark and emits VoucherRedeemed", async () => {
    const net = make();
    const { channel } = await net.openChannel(rlusd("5"));
    const first = await redeem(net, channel.channelId, rlusd("1"));
    const second = await redeem(net, channel.channelId, rlusd("2.5"));
    expect(first.amountWei).toBe(rlusd("1"));
    expect(second.amountWei).toBe(rlusd("1.5")); // cumulative: only the increment is a new claim
    expect((await net.getChannel(channel.channelId)).redeemedWei).toBe(rlusd("2.5"));
    expect(net.events.filter((e) => e.name === "VoucherRedeemed")).toHaveLength(2);
    expect(first.claimId).not.toBe(second.claimId);
  });

  it("enforces redeemed <= cap", async () => {
    const net = make();
    const { channel } = await net.openChannel(rlusd("5"));
    expect(await code(redeem(net, channel.channelId, rlusd("5.000001")))).toBe("OVER_CAP");
    await expect(redeem(net, channel.channelId, rlusd("5"))).resolves.toBeDefined(); // exactly the cap is fine
  });

  it("rejects a Voucher that does not advance the watermark (replay)", async () => {
    const net = make();
    const { channel } = await net.openChannel(rlusd("5"));
    await redeem(net, channel.channelId, rlusd("1"));
    expect(await code(redeem(net, channel.channelId, rlusd("1")))).toBe("STALE_VOUCHER");
    expect(await code(redeem(net, channel.channelId, rlusd("0.5")))).toBe("STALE_VOUCHER");
  });

  it("rejects a Voucher signed by anyone but the Channel's Agent", async () => {
    const net = make();
    const { channel } = await net.openChannel(rlusd("5"));
    const voucher = { channelId: channel.channelId, cumulativeAmount: rlusd("1") };
    const forged = await signVoucher(Wallet.createRandom(), net.domain, voucher);
    expect(await code(net.redeemVoucher(voucher, forged))).toBe("BAD_SIGNATURE");
    expect(await code(net.redeemVoucher(voucher, "0xdeadbeef"))).toBe("BAD_SIGNATURE");
  });

  it("rejects Vouchers on closed or expired Channels", async () => {
    let now = 1_000_000;
    const net = make("20", { now: () => now, channelLifetimeSeconds: 60 });
    const a = (await net.openChannel(rlusd("1"))).channel;
    await net.closeChannel(a.channelId);
    expect(await code(redeem(net, a.channelId, rlusd("0.5")))).toBe("CHANNEL_CLOSED");
    const b = (await net.openChannel(rlusd("1"))).channel;
    now += 61;
    expect(await code(redeem(net, b.channelId, rlusd("0.5")))).toBe("CHANNEL_CLOSED");
  });

  it("rejects unknown Channels", async () => {
    expect(await code(make().getChannel("0x" + "1".repeat(64)))).toBe("CHANNEL_NOT_FOUND");
  });
});

describe("settle and close", () => {
  it("pays redeemed - settled to the payout and emits ClaimPaid + SettlementRecorded", async () => {
    const net = make();
    const { channel } = await net.openChannel(rlusd("5"));
    await redeem(net, channel.channelId, rlusd("1"));
    await redeem(net, channel.channelId, rlusd("3"));
    const settled = await net.settle(channel.channelId);
    expect(settled).toMatchObject({ amountWei: rlusd("3"), claimsSettled: 2 });
    expect(net.events.slice(-2).map((e) => e.name)).toEqual(["ClaimPaid", "SettlementRecorded"]);
    // One call settles all prior payments; a second settle pays nothing more.
    expect((await net.settle(channel.channelId)).amountWei).toBe(0n);
  });

  it("keeps settled <= redeemed <= cap at every step", async () => {
    const net = make();
    const { channel } = await net.openChannel(rlusd("4"));
    for (const step of ["0.5", "1.25", "4"]) {
      await redeem(net, channel.channelId, rlusd(step));
      const c = await net.getChannel(channel.channelId);
      expect(c.settledWei <= c.redeemedWei && c.redeemedWei <= c.capWei).toBe(true);
      await net.settle(channel.channelId);
      const s = await net.getChannel(channel.channelId);
      expect(s.settledWei).toBe(s.redeemedWei);
    }
  });

  it("returns the unused cap to the budget on close", async () => {
    const net = make("10");
    const { channel } = await net.openChannel(rlusd("6"));
    await redeem(net, channel.channelId, rlusd("1.272"));
    await net.closeChannel(channel.channelId);
    const budget = await net.budget();
    expect(budget.allocatedWei).toBe(rlusd("1.272"));
    expect(budget.availableWei).toBe(rlusd("8.728"));
    expect(await code(net.closeChannel(channel.channelId))).toBe("CHANNEL_CLOSED");
  });
});
