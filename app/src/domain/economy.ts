import type { GameConfig } from "./types";

export function calculateThreshold(presentCount: number, config: GameConfig): number {
  if (presentCount <= 0) return 0;
  const rounded = Math.round(config.thresholdRatio * presentCount);
  const floor = Math.min(config.thresholdFloor, presentCount);
  return Math.min(presentCount, Math.max(floor, rounded));
}

export function calculateVoteCost(
  presentCount: number,
  accumulatedSkippedMultiplier: number,
  nextVoteMultiplier: number,
  config: GameConfig,
): number {
  const base = presentCount * config.voteBaseCostPerPresentPlayer;
  return Math.floor(base * accumulatedSkippedMultiplier * nextVoteMultiplier);
}

export function calculateClueCost(paidVoteCost: number, config: GameConfig): number {
  return Math.floor(paidVoteCost * config.cluePriceRatio);
}

export function calculateRefund(paidVoteCost: number, config: GameConfig): number {
  return Math.floor(paidVoteCost * config.innocentRefundRatio);
}

export function nextSkippedVoteMultiplier(current: number, config: GameConfig): number {
  return current * (1 + config.skippedWorkingDayIncrease);
}
