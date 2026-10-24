// Public surface of the ledger package. The api/ backend either calls the top-level functions
// (one shared instance, configured from ledger/.env) or builds its own with createLedger(config).
import { type Ledger, type Tab, createLedger } from './ledger.ts'

export { createLedger, explorerUrl } from './ledger.ts'
export type { Balances, CancelTabResult, Ledger, LedgerConfig, OpenTabResult, SettleTabResult, Tab } from './ledger.ts'
export { LedgerError, type LedgerErrorCode } from './errors.ts'

let shared: Ledger | undefined
const ledger = () => (shared ??= createLedger())

export const openTab = (args: { memberId: string; allowance: string }) => ledger().openTab(args)
export const settleTab = (args: { tab: Tab; amount: string; tipAmount: string }) => ledger().settleTab(args)
export const cancelTab = (args: { tab: Tab }) => ledger().cancelTab(args)
export const getBalances = () => ledger().getBalances()
