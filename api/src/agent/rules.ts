import { decimalToCents } from "../money.js";
import type { AgentDecision, Member, Policy, Tab } from "../types.js";

/**
 * Hard rules run in code before the LLM, so the hold path never depends on
 * the model (plan B5). Returns a hold decision, or null to let the agent decide.
 */
export function applyHardRules(tab: Tab, member: Member, policy: Policy): AgentDecision | null {
  const allowanceCents = decimalToCents(tab.allowance);

  if (policy.holdIfItemOverAllowance) {
    const over = tab.items.find((item) => item.priceCents > allowanceCents);
    if (over) {
      return hold(`${over.name} ($${dollars(over.priceCents)}) is above the escrowed allowance of $${tab.allowance}`, policy);
    }
  }

  const limit = member.typicalSpendCents * policy.holdIfTotalOverTypicalX;
  if (member.typicalSpendCents > 0 && tab.totalCents > limit) {
    const biggest = [...tab.items].sort((a, b) => b.priceCents * b.qty - a.priceCents * a.qty)[0];
    return hold(
      `Tab total $${dollars(tab.totalCents)} is over ${policy.holdIfTotalOverTypicalX}x ${member.name.split(" ")[0]}'s typical $${dollars(member.typicalSpendCents)}` +
        (biggest ? `; largest line is ${biggest.name}` : ""),
      policy,
    );
  }

  if (tab.totalCents > allowanceCents) {
    return hold(`Tab total $${dollars(tab.totalCents)} exceeds the escrowed allowance of $${tab.allowance}`, policy);
  }

  return null;
}

/** Deterministic decision used when the LLM is off, slow or returns garbage. */
export function fallbackDecision(tab: Tab, policy: Policy): AgentDecision {
  const seats = new Set(tab.seat.split(/[,&+]/).map((s) => s.trim()).filter(Boolean));
  const split = policy.splitBySeat && seats.size > 1;
  return {
    action: split ? "split" : "settle",
    tipPct: policy.defaultTipPct,
    reason: `Within policy: total $${dollars(tab.totalCents)} fits the allowance and the member's usual spend`,
    source: "fallback",
  };
}

function hold(reason: string, policy: Policy): AgentDecision {
  return { action: "hold", tipPct: policy.defaultTipPct, reason, source: "rules" };
}

function dollars(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
