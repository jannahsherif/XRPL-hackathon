/**
 * x402 v2 headers for AP4M voucher payments (base64-encoded JSON).
 *
 *   GET resource            -> 402 + PAYMENT-REQUIRED   (what to pay, on which Channel)
 *   GET + PAYMENT-SIGNATURE -> 200 + PAYMENT-RESPONSE   (Voucher redeemed, resource released)
 *
 * Field names follow the AP4M kit's challenge checks (scheme "batch-settlement",
 * extra.ledger / channelId / acceptedCumulativeAmount / pricingMode / bindingVersion).
 */

export const X402_VERSION = 2;
export const X402_SCHEME = "batch-settlement";

export interface X402Requirement {
  scheme: typeof X402_SCHEME;
  network: string;
  asset: string;
  amount: string;
  payTo: string;
  maxTimeoutSeconds: number;
  extra: {
    ledger: string;
    channelId: string;
    acceptedCumulativeAmount: string;
    pricingMode: "fixed";
    bindingVersion: "1";
    merchantId: string;
    invoiceId: string;
  };
}

export interface X402PaymentRequired {
  x402Version: number;
  error: string;
  resource: { url: string; description: string; mimeType: string };
  accepts: X402Requirement[];
}

export interface X402PaymentPayload {
  x402Version: number;
  accepted: X402Requirement;
  payload: {
    voucher: { channelId: string; cumulativeAmount: string };
    agentSignature: string;
    /** Hash of the member's Verifiable Intent mandate this payment is made under. */
    mandateHash?: string;
  };
}

export interface X402PaymentResponse {
  success: boolean;
  network: string;
  transaction: string;
  payer: string;
  claimId: string;
  voucherDigest: string;
}

const encode = (value: unknown) => Buffer.from(JSON.stringify(value), "utf8").toString("base64");

function decode<T>(header: string | null | undefined, name: string): T {
  if (!header) throw new Error(`missing ${name} header`);
  try {
    return JSON.parse(Buffer.from(header, "base64").toString("utf8")) as T;
  } catch {
    throw new Error(`malformed ${name} header`);
  }
}

export const encodePaymentRequired = (v: X402PaymentRequired) => encode(v);
export const decodePaymentRequired = (h: string | null | undefined) => decode<X402PaymentRequired>(h, "PAYMENT-REQUIRED");
export const encodePaymentSignature = (v: X402PaymentPayload) => encode(v);
export const decodePaymentSignature = (h: string | null | undefined) => decode<X402PaymentPayload>(h, "PAYMENT-SIGNATURE");
export const encodePaymentResponse = (v: X402PaymentResponse) => encode(v);
export const decodePaymentResponse = (h: string | null | undefined) => decode<X402PaymentResponse>(h, "PAYMENT-RESPONSE");
