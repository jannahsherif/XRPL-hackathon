import path from "node:path";
import { pathToFileURL } from "node:url";

import type { Config } from "../config.js";
import type { Ledger } from "../types.js";
import { createStubLedger } from "./stub.js";
import { adaptTeamLedger, type TeamLedgerModule } from "./teamLedger.js";

/** Stub funding mirrors the testnet balances in ledger/ (member-1..5: 5000 / 800 / 800 / 500 / 1200). */
const STUB_MEMBER_FUNDS: Record<string, string> = {
  m1: "5000.00",
  m2: "800.00",
  m3: "800.00",
  m4: "500.00",
  m5: "1200.00",
};

/**
 * Loads Alex's ledger module when LEDGER_MODE=module, otherwise the stub.
 * The backend never touches XRPL or a private key directly.
 */
export async function loadLedger(config: Config): Promise<Ledger> {
  if (config.ledgerMode !== "module") {
    return createStubLedger(config.ledgerStubDelayMs, STUB_MEMBER_FUNDS);
  }
  const resolved = path.resolve(process.cwd(), config.ledgerModule);
  const mod = await import(pathToFileURL(resolved).href);
  const ledger = (mod.default && typeof mod.default.openTab === "function" ? mod.default : mod) as Partial<TeamLedgerModule>;
  for (const fn of ["openTab", "settleTab", "cancelTab", "getBalances"] as const) {
    if (typeof ledger[fn] !== "function") {
      throw new Error(`Ledger module at ${resolved} is missing ${fn}()`);
    }
  }
  return adaptTeamLedger(ledger as TeamLedgerModule);
}

export function ledgerErrorCode(err: unknown): string {
  return (err as { code?: string })?.code ?? "LEDGER_ERROR";
}
