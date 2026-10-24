/**
 * Mastercard Agent Pay for Machines (AP4M) hackathon deployment on the XRPL EVM
 * Testnet, from GET https://hackathon.ap4m.build/public/config (2026-10-24).
 * The live backend re-reads /public/config at start-up; these are the defaults.
 */
export const AP4M_NETWORK = {
  chainId: 1449000,
  caip2: "eip155:1449000",
  name: "XRPL EVM Testnet",
  rpcUrl: "https://rpc.testnet.xrplevm.org",
  explorerUrl: "https://explorer.testnet.xrplevm.org",
  faucetUrl: "https://faucet.testevm.ripple.com",
} as const;

export const AP4M_CONTRACTS = {
  participantRegistry: "0x4cF27435FE56161aa9b1cffdD87784aa68b7D1E8",
  paymentLedger: "0xcAB42800A5ECF0D253Fa2581Bb3334B4DAEfaE91",
  pooledEscrowVault: "0x83DD9cD010eb46e96eceF8F7eB0a18f7845AaBC0",
  rlusdToken: "0x27b57a9D0b8d24EB97259c4E2279e45255e016f3",
} as const;

/** PSPs that attest participants into the ParticipantRegistry (Know Your Agent). */
export const AP4M_PSPS = [
  { pspId: "mc-payer-psp", displayName: "Mastercard Payer PSP", signer: "0x23f37318a8e396f99385b67005c8242d67c49563" },
  { pspId: "mc-payee-psp", displayName: "Mastercard Payee PSP", signer: "0xae9b83f33d393671b9cd39fbf6dd9d4830a3b4f9" },
] as const;

export const AP4M_SERVICE_URL = "https://hackathon.ap4m.build";

export const txUrl = (hash: string) => `${AP4M_NETWORK.explorerUrl}/tx/${hash}`;
export const addressUrl = (address: string) => `${AP4M_NETWORK.explorerUrl}/address/${address}`;
