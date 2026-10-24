import { randomUUID } from "node:crypto";

import type { Member } from "../types.js";

/**
 * Top up a member's tab budget from their Mastercard card on file. SIMULATED
 * funding rail (per the engineering plan, funding and payout are SIMULATED and
 * settlement is live).
 *
 * The request is shaped like Mastercard Checkout Solutions' virtual-card-token
 * checkout (POST /src/api/digital/payments/transaction/credentials, see
 * resources/mastercard/openapi/checkout-solutions__checkout_mvct_v1.yaml): the
 * card is a token (srcDigitalCardId), never a PAN, and each charge gets a
 * one-time Dynamic Token Validation Code. The card value then on-ramps to RLUSD
 * in the Agent Principal's AP4M budget.
 */
export interface FundingResult {
  fundingId: string;
  memberId: string;
  amountCents: number;
  rail: "mastercard-card";
  simulated: true;
  card: { brand: "Mastercard"; last4: string; tokenType: "Mastercard Virtual Card Token" };
  request: { method: "POST"; path: string; body: Record<string, unknown> };
  response: { status: "APPROVED"; dynamicDataType: "DYNAMIC_CARD_SECURITY_CODE"; dtvc: string };
  onRamp: { from: "USD (card)"; to: "RLUSD"; status: "SIMULATED" };
  fundedCents: number;
}

export const MAX_TOP_UP_CENTS = 500_000;

export function fundFromCard(member: Member, amountCents: number, srcClientId = "settle-demo-src-client"): FundingResult {
  if (!Number.isInteger(amountCents) || amountCents < 100 || amountCents > MAX_TOP_UP_CENTS) {
    throw Object.assign(new Error(`amountCents must be a whole number between 100 and ${MAX_TOP_UP_CENTS}`), { statusCode: 400 });
  }
  const correlationId = randomUUID();
  member.fundedCents += amountCents;
  return {
    fundingId: `fund_${correlationId.slice(0, 12)}`,
    memberId: member.id,
    amountCents,
    rail: "mastercard-card",
    simulated: true,
    card: { brand: "Mastercard", last4: member.card.last4, tokenType: "Mastercard Virtual Card Token" },
    request: {
      method: "POST",
      path: "/src/api/digital/payments/transaction/credentials",
      body: {
        srcClientId,
        srcCorrelationId: correlationId,
        srcDigitalCardId: member.card.srcDigitalCardId,
        dpaTransactionOptions: {
          transactionAmount: { transactionAmount: amountCents / 100, transactionCurrencyCode: "USD" },
          paymentOptions: [{ dynamicDataType: "DYNAMIC_CARD_SECURITY_CODE" }],
          merchantCategoryCode: "5813",
        },
      },
    },
    response: { status: "APPROVED", dynamicDataType: "DYNAMIC_CARD_SECURITY_CODE", dtvc: String(100 + Math.floor(Math.random() * 900)) },
    onRamp: { from: "USD (card)", to: "RLUSD", status: "SIMULATED" },
    fundedCents: member.fundedCents,
  };
}
