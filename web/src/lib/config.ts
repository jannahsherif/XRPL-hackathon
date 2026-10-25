const env = import.meta.env;

/** The Settle API (api/). `npm run dev` there listens on 8080. */
export const API_URL = (env.VITE_API_URL || "http://localhost:8080").replace(/\/+$/, "");

/** Sent as X-Staff-Token on every request when set (the API needs it on staff routes when STAFF_TOKEN is set). */
export const STAFF_TOKEN = env.VITE_STAFF_TOKEN || "";

/** Settlement token label, the one place it is decided. The testnet issues TUSD; Rob's mocks say RLUSD. */
export const TOKEN = env.VITE_TOKEN_LABEL || "TUSD";

/** VITE_MOCK=1 renders every screen from src/fixtures/ with no API. */
export const MOCK = env.VITE_MOCK === "1";

/** Public XRPL testnet node, used to read ledger index and fee for a tx hash. */
export const XRPL_WS = env.VITE_XRPL_WS || "wss://s.altnet.rippletest.net:51233";

export const EXPLORER_TX = "https://testnet.xrpl.org/transactions";

export const VENUE = "The House";
