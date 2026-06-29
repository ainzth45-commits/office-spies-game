import type { GameConfig, PlayerId } from "./types";
import type { RandomSource } from "./random";
import { shuffle } from "./random";

export type ClueOption = "voted" | "notVoted";
export type ClueResult = { kind: "cards"; playerIds: PlayerId[] } | { kind: "paid-empty"; playerIds: [] };

export function drawClue(
  votedPool: PlayerId[],
  notVotedPool: PlayerId[],
  option: ClueOption,
  config: GameConfig,
  random: RandomSource = Math.random,
): ClueResult {
  if (option === "voted") {
    if (votedPool.length < config.votedClueMinVoted) return { kind: "paid-empty", playerIds: [] };
    return { kind: "cards", playerIds: [shuffle(votedPool, random)[0]] };
  }
  return { kind: "cards", playerIds: shuffle(notVotedPool, random).slice(0, config.notVotedClueMaxCards) };
}
