import { Wallet, parseUnits } from "ethers";

import { Ap4mLedger } from "./ap4m/ap4mLedger.js";
import { LiveAp4mNetwork } from "./ap4m/liveNetwork.js";
import { SimulatedAp4mNetwork } from "./ap4m/simulatedNetwork.js";
import type { Config } from "./config.js";
import { IntentService } from "./intent/mandate.js";
import type { EventType } from "./types.js";

export interface MastercardStack {
  /** AP4M settlement rail (null unless LEDGER_MODE=ap4m). */
  ap4m: Ap4mLedger | null;
  /** Verifiable Intent mandates (null when INTENT_MODE=off). */
  intent: IntentService | null;
  agentAddress: string;
}

/**
 * Wires the Mastercard pieces from config. The Agent's payment key both signs
 * AP4M Vouchers and is the key the member's Verifiable Intent mandate delegates to,
 * so "who may pay" and "who did pay" are provably the same agent.
 */
export function buildMastercardStack(config: Config, publish: (type: EventType, data: unknown) => void): MastercardStack {
  const agentWallet = config.ap4mAgentKey ? new Wallet(config.ap4mAgentKey) : (Wallet.createRandom() as unknown as Wallet);

  let ap4m: Ap4mLedger | null = null;
  if (config.ledgerMode === "ap4m") {
    const network =
      config.ap4mNetwork === "live"
        ? new LiveAp4mNetwork({
            apiUrl: config.ap4mApiUrl,
            teamName: required(config.ap4mTeamName, "AP4M_TEAM_NAME"),
            agentKey: required(config.ap4mAgentKey, "AP4M_AGENT_PRIVATE_KEY"),
            submitterKey: config.ap4mSubmitterKey || undefined,
            merchantId: required(config.ap4mMerchantId, "AP4M_MERCHANT_ID"),
            payout: required(config.ap4mPayout, "AP4M_MERCHANT_PAYOUT"),
            rpcUrl: config.ap4mRpcUrl,
          })
        : new SimulatedAp4mNetwork({
            agentWallet,
            budgetWei: parseUnits(String(config.ap4mSimBudgetRlusd), 18),
            merchantId: config.ap4mMerchantId || undefined,
            payout: config.ap4mPayout || undefined,
          });
    ap4m = new Ap4mLedger({
      network,
      usdPerRlusd: config.usdPerRlusd,
      resourceUrl: (tabId) => `${config.publicBaseUrl}/x402/tabs/${encodeURIComponent(tabId)}/resource`,
      publish,
    });
  }

  const payee = ap4m ? ap4m.network.merchant().merchantId : "venue:settle-demo";
  const intent = config.intentMode === "on" ? new IntentService(agentWallet, payee) : null;
  return { ap4m, intent, agentAddress: agentWallet.address };
}

function required(value: string, name: string): string {
  if (!value) throw new Error(`${name} is required when AP4M_NETWORK=live`);
  return value;
}
