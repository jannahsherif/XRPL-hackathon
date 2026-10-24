/**
 * In AWS the ledger keys arrive as one JSON secret (Secrets Manager -> ECS
 * `LEDGER_ENV_JSON`). Expand it into the environment so Alex's module reads
 * the same variables it reads from its .env locally. Existing values win.
 */
export function expandLedgerEnv(env: NodeJS.ProcessEnv): string[] {
  const raw = env.LEDGER_ENV_JSON;
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("LEDGER_ENV_JSON is not valid JSON");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("LEDGER_ENV_JSON must be a JSON object");
  }
  const applied: string[] = [];
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (env[key] === undefined) {
      env[key] = String(value);
      applied.push(key);
    }
  }
  delete env.LEDGER_ENV_JSON;
  return applied;
}
