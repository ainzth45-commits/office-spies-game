import { calculateThreshold } from "./economy";
import type { GameConfig, PlayerId, Role, UsedVoteItem, VoteEngineInput, VoteEngineResult } from "./types";

export const THRESHOLD_ITEM_BLOCKED_MESSAGE = "มีคนใช้ไอเทมหมวดเกณฑ์ไปแล้ว";

export function calculateVoteResult(input: VoteEngineInput): VoteEngineResult {
  const counts = Object.fromEntries(input.presentPlayerIds.map((playerId) => [playerId, 0]));

  for (const vote of input.votes) {
    counts[vote.targetId] = Math.max(0, (counts[vote.targetId] ?? 0) + (vote.doubleVote ? 2 : 1));
  }

  for (const item of input.usedItems) {
    if (item.type === "remove") {
      counts[item.targetId] = Math.max(0, (counts[item.targetId] ?? 0) - 1);
    }
  }

  for (const item of input.usedItems) {
    if (item.type === "swap") {
      const first = counts[item.firstTargetId] ?? 0;
      const second = counts[item.secondTargetId] ?? 0;
      counts[item.firstTargetId] = second;
      counts[item.secondTargetId] = first;
    }
  }

  const { reduction, blockedMessages } = resolveThresholdItems(input.usedItems, input.config);
  const baseThreshold = calculateThreshold(input.presentPlayerIds.length, input.config);
  const threshold = Math.max(input.config.thresholdFloor, Math.round(baseThreshold * (1 - reduction)));

  const candidates = Object.entries(counts).filter(([, count]) => count >= threshold);
  const winnerId = candidates.length === 1 ? candidates[0][0] : null;
  const winnerRole = winnerId ? input.roles[winnerId] : null;
  const winnerIsSpy = winnerRole === "spyA" || winnerRole === "spyB";
  const shieldApplies =
    winnerIsSpy && input.shield.exists && !input.shield.consumed && input.shield.slot === winnerRole;

  let publicResult: VoteEngineResult["publicResult"] = "failed";
  if (winnerId && !shieldApplies) {
    publicResult = winnerIsSpy ? "caughtSpy" : "caughtInnocent";
  }

  const votedPool = input.presentPlayerIds.filter((playerId) => (counts[playerId] ?? 0) >= 1);
  const notVotedPool = input.presentPlayerIds.filter((playerId) => !votedPool.includes(playerId));
  const spiesInPoolCount = votedPool.filter((playerId) => isSpy(input.roles[playerId])).length;
  const spyPoolReveal =
    votedPool.length >= input.config.spyPoolRevealMinVoted && spiesInPoolCount > 0
      ? { spies: spiesInPoolCount, total: votedPool.length }
      : null;

  return {
    publicResult,
    winnerId,
    winnerIsSpy,
    shieldConsumed: Boolean(shieldApplies),
    adjustedCounts: counts,
    votedPool,
    notVotedPool,
    spiesInPoolCount,
    spyPoolReveal,
    threshold,
    blockedMessages,
  };
}

function isSpy(role: Role): boolean {
  return role === "spyA" || role === "spyB";
}

function resolveThresholdItems(
  usedItems: UsedVoteItem[],
  config: GameConfig,
): { reduction: number; blockedMessages: string[] } {
  let reduction = 0;
  let usedR = false;
  let usedP = false;
  const blockedMessages: string[] = [];

  for (const item of usedItems) {
    if (item.type === "reduceThreshold") {
      if (usedR || usedP) {
        blockedMessages.push(THRESHOLD_ITEM_BLOCKED_MESSAGE);
      } else {
        reduction = config.reduceThresholdPercent;
        usedR = true;
      }
    }

    if (item.type === "protectThreshold") {
      if (usedP) {
        blockedMessages.push(THRESHOLD_ITEM_BLOCKED_MESSAGE);
      } else {
        if (usedR) {
          reduction = config.weakenedReduceThresholdPercent;
        }
        usedP = true;
      }
    }
  }

  return { reduction, blockedMessages };
}
