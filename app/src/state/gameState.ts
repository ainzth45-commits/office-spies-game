import { defaultConfig } from "../data/configDefaults";
import { defaultPlayers } from "../data/players";
import type { GameState, PlayerId } from "../domain/types";

export function createInitialGameState(): GameState {
  const attendance = Object.fromEntries(defaultPlayers.map((player) => [player.id, true])) as Record<PlayerId, boolean>;
  const roles = Object.fromEntries(defaultPlayers.map((player) => [player.id, "normal"])) as GameState["roles"];
  const inventories = Object.fromEntries(defaultPlayers.map((player) => [player.id, []])) as GameState["inventories"];

  return {
    version: 1,
    phase: "boot",
    players: defaultPlayers,
    config: defaultConfig,
    attendance,
    roles,
    inventories,
    shield: { slot: null, exists: false, consumed: false },
    manualDay: {
      index: 1,
      label: "วันเล่นที่ 1",
      openedVoteToday: false,
      isFinalDay: false,
      history: [{ actionId: "initial", kind: "start", label: "วันเล่นที่ 1", voteCostMultiplierAfter: 1 }],
    },
    voteCostState: { accumulatedSkippedMultiplier: 1, nextVoteMultiplier: 1 },
    usedQuizIds: [],
    dailyUsage: { dayIndex: 1, gachaSpins: {}, shopPurchases: {}, voteCostChanged: false },
    pendingQuiz: null,
    history: [{ id: "initial", at: new Date(0).toISOString(), label: "สร้างเกมใหม่" }],
    settings: { soundEnabled: true, tutorialCompleted: false },
    cluePurchasesByVoteRound: {},
    currentVoteRoundId: null,
    currentVote: null,
    lastVoteResult: null,
    lastClueResult: null,
    lastGachaResult: null,
    endWinner: null,
  };
}
