/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_STAFF_TOKEN?: string;
  readonly VITE_TOKEN_LABEL?: string;
  readonly VITE_MOCK?: string;
  readonly VITE_XRPL_WS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
