import { defaultConfig } from "../data/configDefaults";
import { itemCatalog } from "../data/items";
import { quizBank } from "../data/quizBank";
import { drawClue, type ClueOption } from "../domain/clueEngine";
import { normalizeAndValidateConfig } from "../domain/configValidation";
import { calculateClueCost, calculateRefund, calculateThreshold, calculateVoteCost, nextSkippedVoteMultiplier } from "../domain/economy";
import { resolveGachaOutcome } from "../domain/gachaEngine";
import { quizPenaltyAt, quizRewardAt } from "../domain/quizEngine";
import { getUsedQuizIds, markQuizUsed } from "./quizHistory";
import type { RandomSource } from "../domain/random";
import { assignSpyRoles, promoteJester } from "../domain/roleEngine";
import { calculateVoteResult } from "../domain/voteEngine";
import { buildPlayerRecords, createInitialGameState } from "./gameState";
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
import { gachaItemOutcomeToItemType, isGachaItemOutcome } from "../domain/types";

function newActionId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `action-${Date.now()}`;
}

function log(state: GameState, label: string): GameState {
  const entry = { id: newActionId(), at: new Date().toISOString(), label };
  return { ...state, history: [...state.history, entry] };
}

function resetDailyUsageFor(state: GameState, dayIndex: number): GameState["dailyUsage"] {
  return { dayIndex, voteCostChanged: false };
}

function ensureDailyUsage(state: GameState): GameState["dailyUsage"] {
  if (state.dailyUsage?.dayIndex === state.manualDay.index) return state.dailyUsage;
  return resetDailyUsageFor(state, state.manualDay.index);
}

function createVoteItem(type: VoteItemType): VoteItem {
  return {
    id: newActionId(),
    type,
    source: "gacha",
    publicKnown: true, // ผลกาชาประกาศให้ทุกคนเห็นเสมอ
    createdAtActionId: newActionId(),
  };
}

function itemLabel(type: VoteItemType): string {
  return itemCatalog.find((item) => item.type === type)?.label ?? type;
}

function presentPlayerIds(state: GameState): PlayerId[] {
  return state.players.filter((player) => state.attendance[player.id]).map((player) => player.id);
}

function playerName(state: GameState, playerId: PlayerId): string {
  return state.players.find((player) => player.id === playerId)?.name ?? playerId;
}

// สุ่มบทบาทใหม่ — เลือกสายลับจาก "คนที่มาวันแรก" เท่านั้น (คนลาไม่มีวันเป็นสปาย)
// ทุกคนได้ entry ในตาราง roles เสมอ (คนที่ไม่ถูกเลือก/คนลา = normal) → คนมาเพิ่มวันหลังเข้าเป็นผู้เล่นปกติได้เลย
export function assignNewRoles(state: GameState, random: RandomSource = Math.random): GameState {
  const eligibleIds = presentPlayerIds(state);
  const minPlayers = state.config.jesterEnabled ? 3 : 2;
  if (eligibleIds.length < minPlayers) {
    throw new Error(
      state.config.jesterEnabled
        ? "ต้องมีคนมาอย่างน้อย 3 คนถึงจะเริ่มเกม (สายลับ 2 + คนบ้า 1)"
        : "ต้องมีคนมาอย่างน้อย 2 คนถึงจะเริ่มเกม (สุ่มสายลับ)",
    );
  }
  const spyRoles = assignSpyRoles(eligibleIds, random);
  let roles = Object.fromEntries(
    state.players.map((player) => [player.id, spyRoles[player.id] ?? "normal"]),
  ) as GameState["roles"];
  // เปิดคนบ้า → เลื่อน 1 คนที่มา (นอกจากสปาย) ให้เป็น jester
  if (state.config.jesterEnabled) {
    roles = promoteJester(roles, eligibleIds, random) as GameState["roles"];
  }
  return log({ ...state, roles, phase: "roleReveal", currentVote: null, lastVoteResult: null, lastClueResult: null }, "สุ่มบทบาทใหม่ (จากคนที่มา)");
}

export function rolesAssigned(state: GameState): boolean {
  return Object.values(state.roles).some((role) => role === "spyA" || role === "spyB");
}

// ---- ระบบลงทะเบียนผู้เล่น (ตั้งค่า → 👥 ผู้เล่น) ----
// เพิ่ม/ลบทำได้เฉพาะตอนยังไม่แจกบทบาท — กลางเกมมี บทบาท/ไอเทม/โหวต ผูก id อยู่ ลบแล้วพังทั้งกระดาน
const ROSTER_LOCKED_MESSAGE = "แก้รายชื่อระหว่างเกมไม่ได้ — จบเกมหรือเริ่มรอบใหม่ก่อน";

function cleanPlayerName(raw: string): string {
  // ตัดอักขระควบคุม/ล่องหน (zero-width, BOM ฯลฯ) แล้ว trim — กันชื่อว่างแบบมองไม่เห็น
  const cleaned = raw.replace(/[\u0000-\u001F\u007F\u200B-\u200F\u2028-\u202E\u2060\uFEFF]/g, "").trim();
  if (!cleaned) throw new Error("ใส่ชื่อผู้เล่นก่อน");
  return cleaned.slice(0, 40);
}

function nextPlayerNumber(state: GameState): number {
  // ใช้ counter ใน state (นับต่อเสมอแม้ลบคน) — กันรหัสถูกเวียนใช้ซ้ำชนกับประวัติ/ข้อมูลเก่า
  // เผื่อเซฟที่ counter เพี้ยน (ต่ำกว่ารหัสที่มีจริง) ให้ยึดค่าที่มากกว่าระหว่าง counter กับ max+1
  const maxNumber = state.players.reduce((max, player) => {
    const numeric = Number(player.code.replace(/^C/, ""));
    return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
  }, 0);
  return Math.max(state.rosterNextNumber || 1, maxNumber + 1);
}

export function addPlayer(state: GameState, input: { name: string; imageUrl: string }): GameState {
  if (rolesAssigned(state)) throw new Error(ROSTER_LOCKED_MESSAGE);
  const name = cleanPlayerName(input.name);
  const codeNumber = nextPlayerNumber(state);
  const code = `C${String(codeNumber).padStart(3, "0")}`;
  const player = { id: code, code, name, imageUrl: input.imageUrl };
  return log(
    {
      ...state,
      rosterNextNumber: codeNumber + 1,
      players: [...state.players, player],
      attendance: { ...state.attendance, [player.id]: true },
      roles: { ...state.roles, [player.id]: "normal" as const },
      inventories: { ...state.inventories, [player.id]: [] },
    },
    `ลงทะเบียนผู้เล่น ${code} ${name}`,
  );
}

export function updatePlayer(state: GameState, playerId: PlayerId, input: { name: string; imageUrl: string }): GameState {
  const existing = state.players.find((player) => player.id === playerId);
  if (!existing) throw new Error("ไม่พบผู้เล่นที่ต้องการแก้ไข");
  const name = cleanPlayerName(input.name);
  const players = state.players.map((player) => (player.id === playerId ? { ...player, name, imageUrl: input.imageUrl } : player));
  return log({ ...state, players }, `แก้ข้อมูลผู้เล่น ${existing.code}`);
}

export function removePlayer(state: GameState, playerId: PlayerId): GameState {
  if (rolesAssigned(state)) throw new Error(ROSTER_LOCKED_MESSAGE);
  const existing = state.players.find((player) => player.id === playerId);
  if (!existing) throw new Error("ไม่พบผู้เล่นที่ต้องการลบ");
  const { [playerId]: _removedAttendance, ...attendance } = state.attendance;
  const { [playerId]: _removedRole, ...roles } = state.roles;
  const { [playerId]: _removedInventory, ...inventories } = state.inventories;
  return log(
    {
      ...state,
      players: state.players.filter((player) => player.id !== playerId),
      attendance,
      roles: roles as GameState["roles"],
      inventories: inventories as GameState["inventories"],
    },
    `ลบผู้เล่น ${existing.code} ${existing.name}`,
  );
}

// เริ่มรอบใหม่ — สุ่มสายลับ 2 คนใหม่เสมอ (รีเซ็ตโหวต/เบาะแสของรอบเดิม)
export function startNewRound(state: GameState, random: RandomSource = Math.random): GameState {
  return assignNewRoles(state, random);
}

// เริ่มเกมรอบใหม่จากศูนย์ — ทุกอย่างกลับค่าเริ่มต้น (วัน 1, ไอเทม, เกราะ, บทบาท, ตัวคูณ, ประวัติ)
// สิ่งที่คงไว้: การตั้งค่าเกมของซุป (config) + settings เครื่อง + รายชื่อผู้เล่น
// สิ่งที่ "ไม่" รีเซต: คลังโจทย์เชาว์ (localStorage) — และถ้าคลังเหลือต่ำกว่าเกณฑ์ ห้ามเริ่ม ต้องไปรีเซตคลังก่อน
export function startNewGameRound(state: GameState): GameState {
  const remaining = remainingQuizCount();
  if (remaining < state.config.quizMinRemainingToStart) {
    throw new Error(
      `คลังโจทย์เหลือ ${remaining} ข้อ (ต้องมีอย่างน้อย ${state.config.quizMinRemainingToStart}) — กด "รีเซตคลังโจทย์" ในตั้งค่าก่อนเริ่มรอบใหม่`,
    );
  }
  const fresh = createInitialGameState();
  // กลับไปหน้าแตะโลโก้ (boot) — ให้ความรู้สึก "เกมใหม่จริงๆ" ตั้งแต่จอแรก
  // fresh สร้างจากรายชื่อว่าง — ต้อง rebuild ตาราง มา/ลา บทบาท กระเป๋า จากรายชื่อที่ลงทะเบียนไว้
  return log(
    { ...fresh, ...buildPlayerRecords(state.players), phase: "boot", players: state.players, rosterNextNumber: Math.max(fresh.rosterNextNumber, state.rosterNextNumber || 1), config: state.config, settings: state.settings },
    "เริ่มรอบใหม่ — ล้างกระดานทั้งหมด",
  );
}

// ปุ่มออกจากฉากจบเกม — ล้างกระดานกลับหน้าโลโก้เหมือนเริ่มรอบใหม่
// ไม่เช็คเกณฑ์คลังโจทย์เหมือน startNewGameRound: เกมจบแล้วต้องออกได้เสมอ ห้ามค้างที่ฉากจบ
export function finishGameToBoot(state: GameState): GameState {
  const fresh = createInitialGameState();
  return log(
    { ...fresh, ...buildPlayerRecords(state.players), phase: "boot", players: state.players, rosterNextNumber: Math.max(fresh.rosterNextNumber, state.rosterNextNumber || 1), config: state.config, settings: state.settings },
    "จบเกม — ล้างกระดานกลับหน้าแรก",
  );
}

// เข้าหน้าดูบทบาท — ไม่สุ่มทันที
//   - ยังไม่เคยสุ่ม (เกมใหม่) → เข้าจอ "ตั้งคนมา/ไม่มา" ก่อน แล้ว RoleRevealFlow ค่อยเรียก assignNewRoles หลังยืนยัน
//     (ล็อคบทบาทให้ยึดตามคนที่มาวันแรกจริงๆ กันสายลับไปตกคนที่ไม่มา)
//   - สุ่มแล้ว → เปิดดูบทบาทเดิม (ไม่สุ่มซ้ำ)
export function enterRoleReveal(state: GameState): GameState {
  if (state.players.length < 3) throw new Error("ลงทะเบียนผู้เล่นอย่างน้อย 3 คนในตั้งค่าก่อนเริ่มเกม");
  return log({ ...state, phase: "roleReveal" }, rolesAssigned(state) ? "เปิดดูบทบาท (รอบเดิม)" : "เข้าหน้าตั้งคนมา + บทบาท");
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

// ไอเทมเข้ากระเป๋าได้ทางเดียว: กาชาแจก (ร้านลับถูกถอดออกจากเกมแล้ว)
// ไม่มีลิมิตต่อคน — ของได้จากการสุ่มเท่านั้น มีกี่ชิ้นก็สะสมได้
export function grantVoteItem(state: GameState, playerId: PlayerId, type: VoteItemType): GameState {
  const inventory = state.inventories[playerId] ?? [];
  return log(
    {
      ...state,
      inventories: {
        ...state.inventories,
        [playerId]: [...inventory, createVoteItem(type)],
      },
    },
    `กาชาแจกไอเทม ${itemLabel(type)} ให้ ${playerName(state, playerId)}`,
  );
}

// ซุปกดเลือกคนรับไอเทมที่ค้างจากกาชา
export function assignGachaItem(state: GameState, playerId: PlayerId): GameState {
  if (!state.pendingGachaGrant) throw new Error("ไม่มีไอเทมที่รอแจก");
  const next = grantVoteItem(state, playerId, state.pendingGachaGrant.itemType);
  return { ...next, pendingGachaGrant: null };
}

export interface ApplyGachaOutcomeOptions {
  shieldSlot?: SpySlot;
  random?: RandomSource;
  // เวลาปัจจุบัน (ms) — inject ได้ในเทส · ใช้ประทับ startedAt ของโจทย์เชาว์
  nowMs?: number;
  // คนที่หมุนตานี้ — ถ้าออกไอเทม จะเข้ากระเป๋าคนนี้เลย (ไม่ต้องให้ซุปเลือกคนรับ)
  spinnerId?: PlayerId;
}

// หมุนกาชา — ไม่ผูกผู้เล่น ไม่จำกัดครั้ง: ผลเหรียญเป็นของจริงหน้าตู้ (ซุปจัดการมือ)
// ผลที่ต้องมีเจ้าของในแอปมีแค่ไอเทม (pendingGachaGrant รอซุปกดเลือกคน) กับเกราะ (เข้า slot สปายอัตโนมัติ)
export function applyGachaOutcome(
  state: GameState,
  rawOutcome: GachaOutcome,
  options: ApplyGachaOutcomeOptions = {},
): GameState {
  const dailyUsage = ensureDailyUsage(state);
  const shieldAvailable = !state.shield.exists;
  const outcome = resolveGachaOutcome(rawOutcome, { shieldAvailable });
  let next: GameState = { ...state, dailyUsage };
  let message = "";

  if (outcome === "selfGain") {
    message = `คนที่หมุนรับ ${state.config.gachaCoinSelfGain} เหรียญจากซุป`;
  } else if (outcome === "selfLoseAll") {
    message = "คนที่หมุนคืนเหรียญทั้งหมดให้ซุป";
  } else if (outcome === "allGain") {
    message = `ทุกคนรับ ${state.config.gachaCoinAllGain} เหรียญจากซุป`;
  } else if (outcome === "poorGain") {
    message = `คนที่มีเหรียญน้อยกว่า ${state.config.gachaPoorThreshold} รับ ${state.config.gachaPoorGain} เหรียญ`;
  } else if (outcome === "allLose") {
    message = `ทุกคนคืน ${state.config.gachaCoinAllLose} เหรียญให้ซุป`;
  } else if (outcome === "voteUp") {
    next = {
      ...next,
      voteCostState: { ...next.voteCostState, nextVoteMultiplier: state.config.gachaVoteMultiplierUp },
      dailyUsage: { ...dailyUsage, voteCostChanged: true },
    };
    message = `ค่าเปิดโหวตครั้งหน้า x${state.config.gachaVoteMultiplierUp}`;
  } else if (outcome === "voteDown") {
    next = {
      ...next,
      voteCostState: { ...next.voteCostState, nextVoteMultiplier: state.config.gachaVoteMultiplierDown },
      dailyUsage: { ...dailyUsage, voteCostChanged: true },
    };
    message = `ค่าเปิดโหวตครั้งหน้า x${state.config.gachaVoteMultiplierDown}`;
  } else if (isGachaItemOutcome(outcome)) {
    const itemType = gachaItemOutcomeToItemType[outcome];
    if (options.spinnerId) {
      // รู้คนหมุน → ไอเทมเข้ากระเป๋าคนนั้นทันที ไม่ต้องให้ซุปเลือก
      const inventory = next.inventories[options.spinnerId] ?? [];
      next = {
        ...next,
        inventories: { ...next.inventories, [options.spinnerId]: [...inventory, createVoteItem(itemType)] },
      };
      message = `${playerName(state, options.spinnerId)} ได้ไอเทม ${itemLabel(itemType)} เข้ากระเป๋าแล้ว!`;
    } else {
      // ไม่ระบุคนหมุน (เช่นในเทส) → คงพฤติกรรมเดิม ให้ซุปกดเลือกคนรับ
      message = `ได้ไอเทม ${itemLabel(itemType)}! ซุปกดเลือกว่าใส่กระเป๋าใคร`;
      next = { ...next, pendingGachaGrant: { itemType, message } };
    }
  } else if (outcome === "grantQuiz") {
    const question = pickUnusedQuizQuestion(options.random ?? Math.random);
    if (!question) {
      message = "ได้โจทย์เชาว์ แต่คลังโจทย์หมดแล้ว — กด 'รีเซตคลังโจทย์' ในตั้งค่าเพื่อเริ่มคลังใหม่";
    } else {
      markQuizUsed(question.id);
      // startedAt = null → เข้าหน้ากติกาก่อน เวลาเริ่มนับเมื่อผู้เล่นกด "ไปที่คำถาม"
      next = {
        ...next,
        phase: "quiz",
        pendingQuiz: { questionId: question.id, startedAt: null },
      };
      message = "คนที่หมุนได้โจทย์เชาว์ฟรี — ตอบไว ได้เหรียญเยอะ!";
    }
  } else if (outcome === "spyShield") {
    if (!Object.values(state.roles).some((role) => role === "spyA" || role === "spyB")) {
      throw new Error("ต้องสุ่มบทบาทก่อนกาชาจะออกเกราะสปาย");
    }
    const slot = options.shieldSlot ?? ((options.random ?? Math.random)() < 0.5 ? "spyA" : "spyB");
    next = { ...next, shield: { slot, exists: true, consumed: false } };
    message = `สปาย ${slot === "spyA" ? "A" : "B"} ได้เกราะป้องกัน 1 ครั้ง`;
  }

  return log({ ...next, lastGachaResult: { outcome, message } }, `กาชา: ${message}`);
}

function pickUnusedQuizQuestion(random: RandomSource) {
  const used = new Set(getUsedQuizIds());
  const remaining = quizBank.filter((question) => !used.has(question.id));
  if (remaining.length === 0) return null;
  return remaining[Math.floor(random() * remaining.length)];
}

// จำนวนโจทย์คงเหลือในคลัง (โชว์ในตั้งค่า)
export function remainingQuizCount(): number {
  const used = new Set(getUsedQuizIds());
  return quizBank.filter((question) => !used.has(question.id)).length;
}

// ผู้เล่นอ่านกติกาจบ กดเริ่มทำโจทย์ — นาฬิกาเริ่มเดินตรงนี้
export function startPendingQuiz(state: GameState, nowMs: number): GameState {
  if (!state.pendingQuiz) throw new Error("ไม่มีโจทย์ที่กำลังเล่น");
  if (state.pendingQuiz.startedAt) return state; // เริ่มไปแล้ว — กันกดซ้ำรีเซ็ตเวลา
  return { ...state, pendingQuiz: { ...state.pendingQuiz, startedAt: new Date(nowMs).toISOString() } };
}

export function answerPendingQuiz(state: GameState, answer: "A" | "B", nowMs: number): GameState {
  if (!state.pendingQuiz) throw new Error("ไม่มีโจทย์ที่กำลังเล่น");
  if (!state.pendingQuiz.startedAt) throw new Error("ยังไม่เริ่มโจทย์ — ต้องกดเริ่มจากหน้ากติกาก่อน");
  const question = quizBank.find((candidate) => candidate.id === state.pendingQuiz?.questionId);
  if (!question) throw new Error("ไม่พบโจทย์");
  const elapsedSec = Math.max(0, (nowMs - Date.parse(state.pendingQuiz.startedAt)) / 1000);
  const correct = question.answer === answer;
  const message = correct
    ? `ตอบถูก! รับ ${quizRewardAt(elapsedSec, state.config)} เหรียญจากซุป (ใช้เวลา ${Math.round(elapsedSec)} วิ)`
    : `ตอบผิด (เฉลย: ${question.answer} · ${question.answer === "A" ? question.choiceA : question.choiceB}) ทุกคนคืน ${quizPenaltyAt(elapsedSec, state.config)} เหรียญให้ซุป`;
  return log(
    {
      ...state,
      // คงอยู่หน้า quiz — โชว์ผลก่อน ซุปกดกลับเอง (ไม่เด้งโฮมอัตโนมัติ)
      pendingQuiz: null,
      pendingQuizResult: { questionId: question.id, correct, message },
    },
    `โจทย์เชาว์: ${message}`,
  );
}

export function dismissQuizResult(state: GameState): GameState {
  return { ...state, pendingQuizResult: null, phase: "home" };
}

// ไอเทม 1 ชิ้นที่ผู้โหวตกดใช้ในตานี้ — ใช้กี่ชิ้นก็ได้ต่อตา ยกเว้นโหวต 2 เสียงที่ซ้อนกันไม่ได้
export interface VoteTurnItemUse {
  id: string;
  type: VoteItemType;
  targetId?: PlayerId;
  firstTargetId?: PlayerId;
  secondTargetId?: PlayerId;
}

export interface VoteTurnInput {
  voterId: PlayerId;
  targetId: PlayerId;
  items?: VoteTurnItemUse[];
}

export function submitVoteTurn(state: GameState, input: VoteTurnInput): GameState {
  if (!state.currentVote) throw new Error("ยังไม่มีรอบโหวตที่เปิดอยู่");
  if (!state.currentVote.presentPlayerIds.includes(input.voterId)) throw new Error("ผู้เล่นคนนี้ไม่ได้มาในวันนี้");
  if (!state.currentVote.presentPlayerIds.includes(input.targetId)) throw new Error("เป้าหมายไม่ได้มาในวันนี้");
  if (state.currentVote.submittedVoterIds.includes(input.voterId)) throw new Error("ผู้เล่นคนนี้โหวตไปแล้ว");

  let inventory = [...(state.inventories[input.voterId] ?? [])];
  const usedItems: UsedVoteItem[] = [];
  let doubleVote = false;

  for (const use of input.items ?? []) {
    const item = inventory.find((candidate) => candidate.id === use.id && candidate.type === use.type);
    if (!item) throw new Error("ไม่พบไอเทมที่เลือกใช้");
    if (use.type === "double") {
      // เสียงตัวเองคูณสองได้ครั้งเดียว — ใบที่สองไม่มีผลเพิ่ม เลยกันไว้ไม่ให้เสียของฟรี
      if (doubleVote) throw new Error("โหวต 2 เสียงใช้ได้ตาละ 1 ใบ");
      doubleVote = true;
    } else {
      usedItems.push(toUsedVoteItem(input.voterId, { ...use, type: use.type }));
    }
    inventory = inventory.filter((candidate) => candidate.id !== use.id);
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

function toUsedVoteItem(userId: PlayerId, item: VoteTurnItemUse & { type: Exclude<VoteItemType, "double"> }): UsedVoteItem {
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
      // ปิดหีบรอบนี้ทิ้งเลย — ไม่งั้นวันถัดไปเข้าหน้าโหวตจะเจอหีบเก่าค้าง เปิดโหวตใหม่ไม่ได้ (บั๊กที่เจ้านายเจอ)
      currentVote: null,
    },
    "คำนวณผลโหวต",
  );
}

export function advanceFromVoteResult(state: GameState): GameState {
  if (!state.lastVoteResult) throw new Error("ยังไม่มีผลโหวตล่าสุด");
  // คนบ้าโดนโหวต = จบเกมทันที ชนะเดี่ยว (ทีม+สปายแพ้) — ก่อน logic อื่นทั้งหมด
  if (state.lastVoteResult.result.publicResult === "caughtJester") {
    return log({ ...state, phase: "ended", endWinner: "jester" }, "คนบ้าโดนโหวต — คนบ้าชนะเดี่ยว");
  }
  // วันสุดท้ายโหวตแพ้ = จบเลย — ไม่ต้องแวะคืนเหรียญ/เบาะแส (เกมจบแล้ว ไม่มีรอบให้ใช้ข้อมูลต่อ)
  if (state.lastVoteResult.result.publicResult !== "caughtSpy" && onFinalDay(state)) {
    return log({ ...state, phase: "ended", endWinner: "spies" }, "โหวตวันสุดท้ายจับไม่ได้ — สายลับชนะ");
  }
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
  // ข้าม = สละสิทธิ์ถาวรของรอบนี้ — ย้อนกลับมาซื้อทีหลังไม่ได้ (ใช้ธงเดียวกับซื้อแล้ว)
  const roundId = state.lastVoteResult?.roundId;
  const next = roundId
    ? { ...state, cluePurchasesByVoteRound: { ...state.cluePurchasesByVoteRound, [roundId]: true } }
    : state;
  return advanceFromPostVoteClue(next);
}

export function finishRefund(state: GameState): GameState {
  return log({ ...state, phase: "postVoteClue" }, "จัดสรรเหรียญคืนแล้ว");
}

function onFinalDay(state: GameState): boolean {
  return state.manualDay.isFinalDay || state.manualDay.index >= state.config.maxGameDays;
}

export function advanceFromPostVoteClue(state: GameState): GameState {
  if (!state.lastVoteResult) throw new Error("ยังไม่มีผลโหวตล่าสุด");
  if (state.lastVoteResult.result.publicResult === "caughtSpy") {
    return log({ ...state, phase: "guess" }, "เดินหน้าหลังช่วงเบาะแส");
  }
  // เงื่อนไขจบเกมข้อ 2: โหวตรอบวันสุดท้ายจบแล้วยังจับสายลับไม่ได้ → สายลับชนะทันที
  if (onFinalDay(state)) {
    return log({ ...state, phase: "ended", endWinner: "spies" }, "โหวตวันสุดท้ายจับไม่ได้ — สายลับชนะ");
  }
  return log({ ...state, phase: "home" }, "เดินหน้าหลังช่วงเบาะแส");
}

export function resolveSecondSpyGuess(state: GameState, guessedPlayerId: PlayerId, random: RandomSource = Math.random): GameState {
  const voteResult = state.lastVoteResult;
  const caughtSpyId = voteResult?.result.winnerId;
  if (!voteResult || !caughtSpyId || !voteResult.result.winnerIsSpy) throw new Error("ยังไม่มีสิทธิ์ทายสปายคนที่สอง");
  const caughtRole = state.roles[caughtSpyId];
  const remainingRole: SpySlot = caughtRole === "spyA" ? "spyB" : "spyA";
  const remainingSpyId = Object.entries(state.roles).find(([, role]) => role === remainingRole)?.[0];

  if (guessedPlayerId === remainingSpyId) {
    return log(
      { ...state, phase: "ended", endWinner: "team", lastGuessResult: { guessedId: guessedPlayerId, correct: true } },
      "ทีมทายสปายคนที่สองถูก",
    );
  }

  // ชี้ผิด — ค้างจอเฉลยไว้ก่อน (phase ยังเป็น guess) ให้ทีมได้เห็นว่าพลาด แล้วค่อยกดไปสุ่มรอบใหม่
  return log(
    { ...state, lastGuessResult: { guessedId: guessedPlayerId, correct: false } },
    `ทีมชี้ ${playerName(state, guessedPlayerId)} — ไม่ใช่สายลับ`,
  );
}

// ทีมรับทราบว่าชี้ผิดแล้ว → สุ่มบทบาทใหม่ เริ่มรอบถัดไป
// ยกเว้นวันสุดท้าย: ไม่มีวันให้เล่นต่อ = จับไม่ครบ 2 คน → สายลับชนะ (เงื่อนไขจบเกมข้อ 2)
export function acknowledgeWrongGuess(state: GameState, random: RandomSource = Math.random): GameState {
  if (!state.lastGuessResult || state.lastGuessResult.correct) throw new Error("ไม่มีผลชี้ผิดค้างอยู่");
  if (onFinalDay(state)) {
    return log(
      { ...state, phase: "ended", endWinner: "spies", lastGuessResult: null },
      "ชี้ผิดในวันสุดท้าย — สายลับชนะ",
    );
  }
  return assignNewRoles(
    { ...state, phase: "roleReveal", lastGuessResult: null, lastVoteResult: null, currentVote: null },
    random,
  );
}
