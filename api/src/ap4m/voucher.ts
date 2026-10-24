import { TypedDataEncoder, verifyTypedData, type Signer, type TypedDataDomain } from "ethers";

/**
 * AP4M payment Voucher: an EIP-712 typed message the Agent signs off-chain.
 * Domain and types match the hackathon SDK's signVoucher() and the
 * PaymentLedger.redeemVoucher((bytes32 channelId, uint256 cumulativeAmount), bytes) ABI.
 *
 * Amounts are cumulative per Channel: each Voucher states the running total,
 * never the increment.
 */
export interface Voucher {
  channelId: string;
  cumulativeAmount: bigint;
}

export const VOUCHER_TYPES = {
  Voucher: [
    { name: "channelId", type: "bytes32" },
    { name: "cumulativeAmount", type: "uint256" },
  ],
};

export function voucherDomain(chainId: number, paymentLedger: string): TypedDataDomain {
  return { name: "AP4M Payment Ledger", version: "1", chainId, verifyingContract: paymentLedger };
}

export async function signVoucher(signer: Signer, domain: TypedDataDomain, voucher: Voucher): Promise<string> {
  return signer.signTypedData(domain, VOUCHER_TYPES, voucher);
}

/** Address that signed the voucher (throws on a malformed signature). */
export function recoverVoucherSigner(domain: TypedDataDomain, voucher: Voucher, signature: string): string {
  return verifyTypedData(domain, VOUCHER_TYPES, voucher, signature);
}

/** Domain-separated digest of the voucher, used as its idempotency key. */
export function voucherDigest(domain: TypedDataDomain, voucher: Voucher): string {
  return TypedDataEncoder.hash(domain, VOUCHER_TYPES, voucher);
}

export const PAYMENT_LEDGER_ABI = [
  "function redeemVoucher((bytes32 channelId, uint256 cumulativeAmount) voucher, bytes agentSignature) returns (bytes32 claimId, uint256 amount, bytes32 digest)",
  "function channels(bytes32 channelId) view returns (bytes32,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32,uint256,uint256,address,uint64,uint8,address,uint64,address,uint64,uint64,uint64)",
];

/** topic0 of PaymentLedger's VoucherRedeemed event; the claimId is topics[2] (as in the kit's redeemVoucher). */
export const VOUCHER_REDEEMED_SIGNATURE =
  "VoucherRedeemed(bytes32,bytes32,bytes32,bytes32,address,bytes32,address,address,uint256,uint256,uint256)";
