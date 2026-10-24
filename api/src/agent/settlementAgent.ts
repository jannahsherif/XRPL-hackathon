import { randomUUID } from "node:crypto";

import { BedrockAgentCoreClient, InvokeAgentRuntimeCommand } from "@aws-sdk/client-bedrock-agentcore";

import type { Config } from "../config.js";
import type { AgentDecision, Member, Policy, Tab } from "../types.js";
import { applyHardRules, fallbackDecision } from "./rules.js";

export interface SettlementAgent {
  decide(tab: Tab, member: Member, policy: Policy): Promise<AgentDecision>;
}

export function createSettlementAgent(config: Config): SettlementAgent {
  const client = config.agentMode === "agentcore" ? new BedrockAgentCoreClient({ region: config.awsRegion }) : null;

  return {
    async decide(tab, member, policy) {
      const ruled = applyHardRules(tab, member, policy);
      if (ruled) return ruled;
      if (!client || !config.agentRuntimeArn) return fallbackDecision(tab, policy);
      try {
        return await withTimeout(invokeAgent(client, config, tab, member, policy), config.agentTimeoutMs);
      } catch (err) {
        console.warn(`settlement agent unavailable, using fallback: ${(err as Error).message}`);
        return fallbackDecision(tab, policy);
      }
    },
  };
}

async function invokeAgent(
  client: BedrockAgentCoreClient,
  config: Config,
  tab: Tab,
  member: Member,
  policy: Policy,
): Promise<AgentDecision> {
  const payload = {
    tab: { id: tab.id, seat: tab.seat, items: tab.items, totalCents: tab.totalCents, allowance: tab.allowance },
    member: { id: member.id, tier: member.tier, typicalSpendCents: member.typicalSpendCents, history: member.history },
    policy,
  };
  const response = await client.send(
    new InvokeAgentRuntimeCommand({
      agentRuntimeArn: config.agentRuntimeArn,
      qualifier: config.agentQualifier,
      // AgentCore requires session ids of at least 33 characters.
      runtimeSessionId: `settle-${tab.id}-${randomUUID()}`,
      contentType: "application/json",
      accept: "application/json",
      payload: new TextEncoder().encode(JSON.stringify(payload)),
    }),
  );
  const body = response.response ? await response.response.transformToString() : "";
  return parseDecision(body, policy);
}

export function parseDecision(body: string, policy: Policy): AgentDecision {
  const raw = JSON.parse(body) as { action?: string; tipPct?: number; reason?: string };
  if (raw.action !== "settle" && raw.action !== "split" && raw.action !== "hold") {
    throw new Error(`agent returned invalid action: ${raw.action}`);
  }
  const tipPct = Number.isFinite(raw.tipPct) ? Math.min(Math.max(Number(raw.tipPct), 0), 30) : policy.defaultTipPct;
  return { action: raw.action, tipPct, reason: String(raw.reason ?? "").slice(0, 280) || "No reason given", source: "agent" };
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timed out after ${ms} ms`)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}
