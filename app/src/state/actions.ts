import { defaultConfig } from "../data/configDefaults";
import { itemCatalog } from "../data/items";
import { quizBank } from "../data/quizBank";
import { drawClue, type ClueOption } from "../domain/clueEngine";
import { normalizeAndValidateConfig } from "../domain/configValidation";
import { calculateClueCost, calculateRefund, calculateThreshold, calculateVoteCost, nextSkippedVoteMultiplier } from "../domain/economy";
import { resolveGachaOutcome } from "../domain/gachaEngine";
import type { RandomSource } from "../domain/random";
import { assignSpyRoles } from "../domain/roleEngine";
import { calculateVoteResult } from "../domain/voteEngine";
import { createInitialGameState } from "./gameState";
import type {
  GameConfig,
  GameState,
  GachaOutcome,
  PlayerId,
  PostVoteClueOption,
  SpySlot,
  UsedVoteItem,
  VoteItem,
  VoteItemType,
} from "../domain/types";

function newActionId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `action-${Date.now()}`;
}

function log(state: GameState, label: string): GameState {
  const entry = { id: newActionId(), at: new Date().toISOString(), label };
  return { ...state, history: [...state.history, entry] };
}

function resetDailyUsageFor(state: GameState, dayIndex: number): GameState["dailyUsage"] {
  return { dayIndex, gachaSpins: {}, shopPurchases: {} };
}

function ensureDailyUsage(state: GameState): GameState["dailyUsage"] {
  if (state.dailyUsage?.dayIndex === state.manualDay.index) return state.dailyUsage;
  return resetDailyUsageFor(state, state.manualDay.index);
}

function createVoteItem(type: VoteItemType, source: VoteItem["source"]): VoteItem {
  return {
    id: newActionId(),
    type,
    source,
    publicKnown: source === "gacha",
    createdAtActionId: newActionId(),
  };
}

function presentPlayerIds(state: GameState): PlayerId[] {
  return state.players.filter((player) => state.attendance[player.id]).map((player) => player.id);
}

function playerName(state: GameState, playerId: PlayerId): string {
  return state.players.find((player) => player.id === playerId)?.name ?? playerId;
}

export function assignNewRoles(state: GameState, random: RandomSource = Math.random): GameState {
  const roles = assignSpyRoles(state.players.map((player) => player.id), random);
  return log({ ...state, roles, phase: "roleReveal", currentVote: null, lastVoteResult: null, lastClueResult: null }, "สุ่มบทบาทใหม่");
}

export function rolesAssigned(state: GameState): boolean {
  return Object.values(state.roles).some((role) => role === "spyA" || role === "spyB");
}

// เริ่มรอบใหม่ — สุ่มสายลับ 2 คนใหม่เสมอ (รีเซ็ตโหวต/เบาะแสของรอบเดิม)
export function startNewRound(state: GameState, random: RandomSource = Math.random): GameState {
  return assignNewRoles(state, random);
}

// เข้าหน้าดูบทบาท: ถ้ายังไม่เคยสุ่มสายลับเลย (ทุกคน normal) ให้สุ่มก่อนอัตโนมัติ
// กันบั๊ก "เกมใหม่ไม่มีใครเป็นสปาย" — ถ้าสุ่มแล้วก็แค่เปิดดู (ไม่สุ่มซ้ำ ผู้เล่นจะได้บทบาทเดิม)
export function enterRoleReveal(state: GameState, random: RandomSource = Math.random): GameState {
  if (rolesAssigned(state)) {
    return log({ ...state, phase: "roleReveal" }, "เปิดดูบทบาท (รอบเดิม)");
  }
  return assignNewRoles(state, random);
}

export function openVote(state: GameState): GameState {
  if (state.manualDay.openedVoteToday) {
    throw new Error("วันนี้เปิดโหวตไปแล้ว");
  }
  const roundId = newActionId();
  const presentIds = presentPlayerIds(state);
  const paidCost = calculateVoteCost(
    presentIds.length,
    state.voteCostState.accumulatedSkippedMultiplier,
    state.voteCostState.nextVoteMultiplier,
    state.config,
  );
  return log(
    {
      ...state,
      phase: "vote",
      manualDay: { ...state.manualDay, openedVoteToday: true },
      voteCostState: { accumulatedSkippedMultiplier: 1, nextVoteMultiplier: 1 },
      currentVoteRoundId: roundId,
      currentVote: {
        id: roundId,
        paidCost,
        presentPlayerIds: presentIds,
        votes: [],
        usedItems: [],
        submittedVoterIds: [],
      },
      lastVoteResult: null,
      lastClueResult: null,
    },
    "เปิดโหวต",
  );
}

export function endWorkingDay(state: GameState, nextLabel: string): GameState {
  const nextMultiplier = state.manualDay.openedVoteToday
    ? state.voteCostState.accumulatedSkippedMultiplier
    : nextSkippedVoteMultiplier(state.voteCostState.accumulatedSkippedMultiplier, state.config);
  return log(
    {
      ...state,
      phase: "home",
      manualDay: {
        ...state.manualDay,
        index: state.manualDay.index + 1,
        label: nextLabel,
        openedVoteToday: false,
        history: [
          ...state.manualDay.history,
          { actionId: newActionId(), kind: "end-working-day", label: nextLabel, voteCostMultiplierAfter: nextMultiplier },
        ],
      },
      voteCostState: { ...state.voteCostState, accumulatedSkippedMultiplier: nextMultiplier },
      dailyUsage: resetDailyUsageFor(state, state.manualDay.index + 1),
    },
    "จบวันทำงาน",
  );
}

export function restDay(state: GameState, nextLabel: string): GameState {
  return log(
    {
      ...state,
      phase: "home",
      manualDay: {
        ...state.manualDay,
        index: state.manualDay.index + 1,
        label: nextLabel,
        openedVoteToday: false,
        history: [
          ...state.manualDay.history,
          {
            actionId: newActionId(),
            kind: "rest-day",
            label: nextLabel,
            voteCostMultiplierAfter: state.voteCostState.accumulatedSkippedMultiplier,
          },
        ],
      },
      dailyUsage: resetDailyUsageFor(state, state.manualDay.index + 1),
    },
    "พักวันโดยไม่เพิ่มค่าโหวต",
  );
}

// เริ่มวันใหม่ได้ไหม (ยังไม่ถึงวันสุดท้าย)
export function canStartNewDay(state: GameState): boolean {
  return state.manualDay.index < state.config.maxGameDays;
}

// เริ่มวันใหม่ (เดินวันต่อไป) — ตันที่ maxGameDays (วันที่ 6) ต้องรีเซตเกมเท่านั้น
export function startNewDay(state: GameState, nextLabel?: string): GameState {
  if (!canStartNewDay(state)) {
    throw new Error("ถึงวันสุดท้ายของเกมแล้ว เริ่มวันใหม่ไม่ได้ — ต้องรีเซตเกม");
  }
  const nextIndex = state.manualDay.index + 1;
  const advanced = endWorkingDay(state, nextLabel ?? `วันเล่นที่ ${nextIndex}`);
  if (nextIndex >= state.config.maxGameDays) {
    return { ...advanced, manualDay: { ...advanced.manualDay, isFinalDay: true } };
  }
  return advanced;
}

// รีเซตเกมใหม่ (จบเกมเดิม เริ่มนับวันที่ 1) — เก็บ config/settings/รายชื่อ/คนมา-ลา ไว้
export function resetGame(state: GameState): GameState {
  const fresh = createInitialGameState();
  return log(
    {
      ...fresh,
      phase: "home",
      players: state.players,
      config: state.config,
      settings: state.settings,
      attendance: state.attendance,
    },
    "รีเซตเกมใหม่",
  );
}

export function markFinalDay(state: GameState): GameState {
  if (state.endWinner) return state;
  return log(
    {
      ...state,
      phase: "ended",
      endWinner: "spies",
      manualDay: { ...state.manualDay, isFinalDay: true },
    },
    "เข้าสู่วันสุดท้ายและสายลับชนะ",
  );
}

export function applyGachaVoteMultiplier(state: GameState, multiplier: number): GameState {
  return log(
    {
      ...state,
      voteCostState: { ...state.voteCostState, nextVoteMultiplier: multiplier },
    },
    `กาชาตั้งตัวคูณค่าโหวตครั้งถัดไป x${multiplier}`,
  );
}

export function updateConfig(state: GameState, patch: Partial<GameConfig>): GameState {
  const presentCount = Object.values(state.attendance).filter(Boolean).length;
  const config = normalizeAndValidateConfig({ ...state.config, ...patch }, state.players.length);
  calculateThreshold(presentCount, config);
  return log({ ...state, config }, "อัปเดต Settings");
}

export function resetConfig(state: GameState): GameState {
  return updateConfig(state, defaultConfig);
}

export function buyVoteItem(
  state: GameState,
  playerId: PlayerId,
  type: VoteItemType,
  source: VoteItem["source"] = "shop",
): GameState {
  const inventory = state.inventories[playerId] ?? [];
  if (inventory.length >= state.config.inventoryLimit) {
    throw new Error("กระเป๋าไอเทมเต็ม");
  }

  const dailyUsage = ensureDailyUsage(state);
  if (source === "shop") {
    const boughtToday = dailyUsage.shopPurchases[playerId]?.[type] ?? 0;
    if (boughtToday >= state.config.itemDailyLimits[type]) {
      throw new Error("ซื้อไอเทมชนิดนี้ครบลิมิตวันนี้แล้ว");
    }
  }

  const nextDailyUsage =
    source === "shop"
      ? {
          ...dailyUsage,
          shopPurchases: {
            ...dailyUsage.shopPurchases,
            [playerId]: {
              ...(dailyUsage.shopPurchases[playerId] ?? {}),
              [type]: (dailyUsage.shopPurchases[playerId]?.[type] ?? 0) + 1,
            },
          },
        }
      : dailyUsage;

  return log(
    {
      ...state,
      dailyUsage: nextDailyUsage,
      inventories: {
        ...state.inventories,
        [playerId]: [...inventory, createVoteItem(type, source)],
      },
    },
    `${source === "gacha" ? "กาชาแจก" : "ซื้อ"}ไอเทม ${type} ให้ ${playerName(state, playerId)}`,
  );
}

export interface ApplyGachaOutcomeOptions {
  selectedItemType?: VoteItemType;
  selectedQuizId?: string;
  shieldSlot?: SpySlot;
}

export function applyGachaOutcome(
  state: GameState,
  playerId: PlayerId,
  rawOutcome: GachaOutcome,
  options: ApplyGachaOutcomeOptions = {},
): GameState {
  const dailyUsage = ensureDailyUsage(state);
  const spunToday = dailyUsage.gachaSpins[playerId] ?? 0;
  if (spunToday >= state.config.gachaDailyLimitPerPlayer) {
    throw new Error("หมุนกาชาครบลิมิตวันนี้แล้ว");
  }

  const nextDailyUsage = {
    ...dailyUsage,
    gachaSpins: { ...dailyUsage.gachaSpins, [playerId]: spunToday + 1 },
  };
  const inventoryFull = (state.inventories[playerId] ?? []).length >= state.config.inventoryLimit;
  const shieldAvailable = !state.shield.exists;
  const outcome = resolveGachaOutcome(rawOutcome, { inventoryFull, shieldAvailable });
  let next: GameState = { ...state, dailyUsage: nextDailyUsage };
  let message = "";

  if (outcome === "selfGain") {
    message = `${playerName(state, playerId)} รับ ${state.config.gachaCoinSelfGain} เหรียญจากซุป`;
  } else if (outcome === "selfLoseAll") {
    message = `${playerName(state, playerId)} คืนเหรียญทั้งหมดให้ซุป`;
  } else if (outcome === "allGain") {
    message = `ทุกคนรับ ${state.config.gachaCoinAllGain} เหรียญจากซุป`;
  } else if (outcome === "poorGain") {
    message = `คนที่มีเหรียญน้อยกว่า ${state.config.gachaPoorThreshold} รับ ${state.config.gachaPoorGain} เหรียญ`;
  } else if (outcome === "allLose") {
    message = `ทุกคนคืน ${state.config.gachaCoinAllLose} เหรียญให้ซุป`;
  } else if (outcome === "voteUp") {
    next = { ...next, voteCostState: { ...next.voteCostState, nextVoteMultiplier: state.config.gachaVoteMultiplierUp } };
    message = `ค่าเปิดโหวตครั้งหน้า x${state.config.gachaVoteMultiplierUp}`;
  } else if (outcome === "voteDown") {
    next = { ...next, voteCostState: { ...next.voteCostState, nextVoteMultiplier: state.config.gachaVoteMultiplierDown } };
    message = `ค่าเปิดโหวตครั้งหน้า x${state.config.gachaVoteMultiplierDown}`;
  } else if (outcome === "grantItem") {
    const itemType = options.selectedItemType ?? itemCatalog[Math.floor(Math.random() * itemCatalog.length)].type;
    next = buyVoteItem(next, playerId, itemType, "gacha");
    message = `${playerName(state, playerId)} ได้ไอเทม ${itemType} จากกาชา`;
  } else if (outcome === "grantQuiz") {
    const questionId = options.selectedQuizId ?? nextQuizId(state);
    next = { ...next, phase: "quiz", pendingQuiz: { playerId, questionId } };
    message = `${playerName(state, playerId)} ได้โจทย์เชาว์ฟรี`;
  } else if (outcome === "spyShield") {
    if (!Object.values(state.roles).some((role) => role === "spyA" || role === "spyB")) {
      throw new Error("ต้องสุ่มบทบาทก่อนกาชาจะออกเกราะสปาย");
    }
    const slot = options.shieldSlot ?? (Math.random() < 0.5 ? "spyA" : "spyB");
    next = { ...next, shield: { slot, exists: true, consumed: false } };
    message = `สปาย ${slot === "spyA" ? "A" : "B"} ได้เกราะป้องกัน 1 ครั้ง`;
  }

  return log({ ...next, lastGachaResult: { playerId, outcome, message } }, `กาชา: ${message}`);
}

function nextQuizId(state: GameState): string {
  return quizBank.find((question) => !state.usedQuizIds.includes(question.id))?.id ?? quizBank[0].id;
}

export function answerPendingQuiz(state: GameState, answer: "A" | "B"): GameState {
  if (!state.pendingQuiz) throw new Error("ไม่มีโจทย์ที่กำลังเล่น");
  const question = quizBank.find((candidate) => candidate.id === state.pendingQuiz?.questionId);
  if (!question) throw new Error("ไม่พบโจทย์");
  const correct = question.answer === answer;
  const message = correct
    ? `${playerName(state, state.pendingQuiz.playerId)} ตอบถูก รับ ${state.config.quizCorrectReward} เหรียญ`
    : `ตอบผิด ทุกคนคืน ${state.config.quizWrongPenaltyPerPlayer} เหรียญให้ซุป`;
  return log(
    {
      ...state,
      phase: "home",
      pendingQuiz: null,
      usedQuizIds: [...new Set([...state.usedQuizIds, question.id])],
      lastGachaResult: { playerId: state.pendingQuiz.playerId, outcome: "grantQuiz", message },
    },
    `โจทย์เชาว์: ${message}`,
  );
}

export interface VoteTurnInput {
  voterId: PlayerId;
  targetId: PlayerId;
  doubleItemId?: string;
  effectItem?: {
    id: string;
    type: Exclude<VoteItemType, "double">;
    targetId?: PlayerId;
    firstTargetId?: PlayerId;
    secondTargetId?: PlayerId;
  };
}

export function submitVoteTurn(state: GameState, input: VoteTurnInput): GameState {
  if (!state.currentVote) throw new Error("ยังไม่มีรอบโหวตที่เปิดอยู่");
  if (!state.currentVote.presentPlayerIds.includes(input.voterId)) throw new Error("ผู้เล่นคนนี้ไม่ได้มาในวันนี้");
  if (!state.currentVote.presentPlayerIds.includes(input.targetId)) throw new Error("เป้าหมายไม่ได้มาในวันนี้");
  if (state.currentVote.submittedVoterIds.includes(input.voterId)) throw new Error("ผู้เล่นคนนี้โหวตไปแล้ว");

  let inventory = [...(state.inventories[input.voterId] ?? [])];
  const usedItems: UsedVoteItem[] = [];
  let doubleVote = false;

  if (input.doubleItemId) {
    const item = inventory.find((candidate) => candidate.id === input.doubleItemId && candidate.type === "double");
    if (!item) throw new Error("ไม่พบไอเทมโหวต 2 เสียง");
    doubleVote = true;
    inventory = inventory.filter((candidate) => candidate.id !== input.doubleItemId);
  }

  if (input.effectItem) {
    const item = inventory.find((candidate) => candidate.id === input.effectItem?.id && candidate.type === input.effectItem?.type);
    if (!item) throw new Error("ไม่พบไอเทมที่เลือกใช้");
    usedItems.push(toUsedVoteItem(input.voterId, input.effectItem));
    inventory = inventory.filter((candidate) => candidate.id !== input.effectItem?.id);
  }

  const nextVote = {
    ...state.currentVote,
    votes: [...state.currentVote.votes, { voterId: input.voterId, targetId: input.targetId, doubleVote }],
    usedItems: [...state.currentVote.usedItems, ...usedItems],
    submittedVoterIds: [...state.currentVote.submittedVoterIds, input.voterId],
  };
  const allSubmitted = nextVote.submittedVoterIds.length >= nextVote.presentPlayerIds.length;

  return log(
    {
      ...state,
      phase: allSubmitted ? "voteResult" : "vote",
      currentVote: nextVote,
      inventories: { ...state.inventories, [input.voterId]: inventory },
    },
    `${playerName(state, input.voterId)} ส่งโหวตแล้ว`,
  );
}

function toUsedVoteItem(userId: PlayerId, item: NonNullable<VoteTurnInput["effectItem"]>): UsedVoteItem {
  if (item.type === "remove") {
    if (!item.targetId) throw new Error("ต้องเลือกเป้าหมายของไอเทมลบเสียง");
    return { id: item.id, userId, type: "remove", targetId: item.targetId };
  }
  if (item.type === "swap") {
    if (!item.firstTargetId || !item.secondTargetId) throw new Error("ต้องเลือก 2 เป้าหมายของไอเทมสลับ");
    return { id: item.id, userId, type: "swap", firstTargetId: item.firstTargetId, secondTargetId: item.secondTargetId };
  }
  return { id: item.id, userId, type: item.type };
}

export function finalizeVoteRound(state: GameState): GameState {
  if (!state.currentVote) throw new Error("ยังไม่มีรอบโหวตที่เปิดอยู่");
  if (state.currentVote.submittedVoterIds.length < state.currentVote.presentPlayerIds.length) {
    throw new Error("ยังโหวตไม่ครบทุกคน");
  }

  const result = calculateVoteResult({
    presentPlayerIds: state.currentVote.presentPlayerIds,
    roles: state.roles,
    votes: state.currentVote.votes,
    usedItems: state.currentVote.usedItems,
    config: state.config,
    shield: state.shield,
  });
  const refundAmount = result.publicResult === "caughtInnocent" ? calculateRefund(state.currentVote.paidCost, state.config) : 0;

  return log(
    {
      ...state,
      phase: "voteResult",
      shield: result.shieldConsumed ? { ...state.shield, consumed: true } : state.shield,
      lastVoteResult: { roundId: state.currentVote.id, paidCost: state.currentVote.paidCost, refundAmount, result },
    },
    "คำนวณผลโหวต",
  );
}

export function advanceFromVoteResult(state: GameState): GameState {
  if (!state.lastVoteResult) throw new Error("ยังไม่มีผลโหวตล่าสุด");
  const phase = state.lastVoteResult.result.publicResult === "caughtInnocent" ? "refund" : "postVoteClue";
  return log({ ...state, phase }, "เดินหน้าหลังประกาศผลโหวต");
}

export function buyPostVoteClue(state: GameState, option: PostVoteClueOption, random: RandomSource = Math.random): GameState {
  if (!state.lastVoteResult) throw new Error("ยังไม่มีผลโหวตล่าสุด");
  const roundId = state.lastVoteResult.roundId;
  if (state.cluePurchasesByVoteRound[roundId]) throw new Error("รอบนี้ซื้อเบาะแสไปแล้ว");
  const clue = drawClue(
    state.lastVoteResult.result.votedPool,
    state.lastVoteResult.result.notVotedPool,
    option as ClueOption,
    state.config,
    random,
  );
  const paidCost = calculateClueCost(state.lastVoteResult.paidCost, state.config);
  return log(
    {
      ...state,
      phase: "postVoteClue",
      cluePurchasesByVoteRound: { ...state.cluePurchasesByVoteRound, [roundId]: true },
      lastClueResult: {
        roundId,
        option,
        playerIds: clue.playerIds,
        paidCost,
        emptyPaid: clue.kind === "paid-empty",
      },
    },
    "ซื้อเบาะแสหลังโหวต",
  );
}

export function skipPostVoteClue(state: GameState): GameState {
  return advanceFromPostVoteClue(state);
}

export function finishRefund(state: GameState): GameState {
  return log({ ...state, phase: "postVoteClue" }, "จัดสรรเหรียญคืนแล้ว");
}

export function advanceFromPostVoteClue(state: GameState): GameState {
  if (!state.lastVoteResult) throw new Error("ยังไม่มีผลโหวตล่าสุด");
  const phase = state.lastVoteResult.result.publicResult === "caughtSpy" ? "guess" : "home";
  return log({ ...state, phase }, "เดินหน้าหลังช่วงเบาะแส");
}

export function resolveSecondSpyGuess(state: GameState, guessedPlayerId: PlayerId, random: RandomSource = Math.random): GameState {
  const voteResult = state.lastVoteResult;
  const caughtSpyId = voteResult?.result.winnerId;
  if (!voteResult || !caughtSpyId || !voteResult.result.winnerIsSpy) throw new Error("ยังไม่มีสิทธิ์ทายสปายคนที่สอง");
  const caughtRole = state.roles[caughtSpyId];
  const remainingRole: SpySlot = caughtRole === "spyA" ? "spyB" : "spyA";
  const remainingSpyId = Object.entries(state.roles).find(([, role]) => role === remainingRole)?.[0];

  if (guessedPlayerId === remainingSpyId) {
    return log({ ...state, phase: "ended", endWinner: "team" }, "ทีมทายสปายคนที่สองถูก");
  }

  return assignNewRoles({ ...state, phase: "roleReveal", lastVoteResult: null, currentVote: null }, random);
}
