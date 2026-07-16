import { defaultConfig } from "../data/configDefaults";
import { defaultPlayers } from "../data/players";
import type { GameState, Player, PlayerId } from "../domain/types";

// สร้างตาราง per-player (มา/ลา, บทบาท, กระเป๋า) จากรายชื่อ — ใช้ทั้งตอนสร้างเกมและตอนล้างกระดานที่ต้องคงรายชื่อไว้
export function buildPlayerRecords(players: Player[]): Pick<GameState, "attendance" | "roles" | "inventories"> {
  return {
    attendance: Object.fromEntries(players.map((player) => [player.id, true])) as Record<PlayerId, boolean>,
    roles: Object.fromEntries(players.map((player) => [player.id, "normal"])) as GameState["roles"],
    inventories: Object.fromEntries(players.map((player) => [player.id, []])) as GameState["inventories"],
  };
}

export function createInitialGameState(players: Player[] = defaultPlayers): GameState {
  return {
    version: 1,
    rosterVersion: 2,
    phase: "boot",
    players,
    config: defaultConfig,
    ...buildPlayerRecords(players),
    shield: { slot: null, exists: false, consumed: false },
    manualDay: {
      index: 1,
      label: "วันเล่นที่ 1",
      openedVoteToday: false,
      isFinalDay: false,
      history: [{ actionId: "initial", kind: "start", label: "วันเล่นที่ 1", voteCostMultiplierAfter: 1 }],
    },
    voteCostState: { accumulatedSkippedMultiplier: 1, nextVoteMultiplier: 1 },
    dailyUsage: { dayIndex: 1, voteCostChanged: false },
    pendingQuiz: null,
    pendingQuizResult: null,
    pendingGachaGrant: null,
    history: [{ id: "initial", at: new Date(0).toISOString(), label: "สร้างเกมใหม่" }],
    settings: { soundEnabled: true, tutorialCompleted: false },
    cluePurchasesByVoteRound: {},
    currentVoteRoundId: null,
    currentVote: null,
    lastVoteResult: null,
    lastClueResult: null,
    lastGachaResult: null,
    lastGuessResult: null,
    endWinner: null,
  };
}
