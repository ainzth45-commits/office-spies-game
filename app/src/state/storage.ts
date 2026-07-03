import { defaultConfig } from "../data/configDefaults";
import type { GameConfig, GameState } from "../domain/types";
import { createInitialGameState } from "./gameState";
import { mergeUsedQuizIds } from "./quizHistory";

const DB_NAME = "office-spies-game";
const STORE_NAME = "state";
const STATE_KEY = "current";

export async function saveGameState(state: GameState): Promise<void> {
  const db = await openDb();
  await requestToPromise(db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(state, STATE_KEY));
  localStorage.setItem("office-spies:last-save", new Date().toISOString());
}

export async function loadGameState(): Promise<GameState | null> {
  const db = await openDb();
  return requestToPromise<GameState | undefined>(db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(STATE_KEY)).then(
    (state) => (state ? migrateGameState(state) : null),
  );
}

// เซฟเก่า (ก่อนยกเครื่องกาชา 2026-07-03) มี field ที่ถอดไปแล้ว — รับเป็น shape หลวมๆ แล้ว migrate
type LegacyGameState = Omit<GameState, "phase" | "pendingQuiz" | "config"> & {
  usedQuizIds?: string[];
  phase: GameState["phase"] | "shop";
  pendingQuiz?: { questionId: string; playerId?: string; startedAt?: string } | null;
  config: GameConfig & { gachaWeights: Record<string, number> };
};

export function migrateConfig(saved: LegacyGameState["config"]): GameConfig {
  const savedWeights = saved.gachaWeights ?? {};
  let gachaWeights: Record<string, number>;
  if ("grantItem" in savedWeights) {
    // เซฟเก่า: "ได้ไอเทมสุ่ม" ช่องเดียว → หารเท่าลง 5 ช่องไอเทมใหม่
    const { grantItem, ...rest } = savedWeights;
    const perItem = (grantItem ?? 0) / 5;
    gachaWeights = {
      ...defaultConfig.gachaWeights,
      ...rest,
      itemDouble: perItem,
      itemRemove: perItem,
      itemSwap: perItem,
      itemReduce: perItem,
      itemProtect: perItem,
    };
  } else {
    gachaWeights = { ...defaultConfig.gachaWeights, ...savedWeights };
  }
  // ตัด field ที่ถอดออกจากเกม (itemPrices/itemDailyLimits/gachaDailyLimitPerPlayer) ด้วยการสร้างจาก default
  const merged = { ...defaultConfig, ...saved, gachaWeights } as GameConfig & Record<string, unknown>;
  delete merged.itemPrices;
  delete merged.itemDailyLimits;
  delete merged.gachaDailyLimitPerPlayer;
  // สเกลเวลาโจทย์เชาว์รุ่นแรก (10วิ/60วิ) ถูกเจ้านายปรับเป็น 5วิ/30วิ — เซฟที่ยังถือค่ารุ่นแรก
  // (ไม่มีใครตั้งใจปรับเอง ฟีเจอร์เพิ่งออกวันเดียว) อัปเป็นค่าใหม่ให้อัตโนมัติ
  const config = merged as GameConfig;
  if (config.quizRewardDecaySec === 10) config.quizRewardDecaySec = 5;
  if (config.quizPenaltyTierSec === 60) config.quizPenaltyTierSec = 30;
  return config;
}

export function migrateGameState(raw: GameState): GameState {
  const state = raw as LegacyGameState;
  const fresh = createInitialGameState();
  // ประวัติโจทย์เดิมเคยอยู่ในเซฟเกม → ย้ายเข้า localStorage (ครั้งเดียว ตอนโหลด)
  if (Array.isArray(state.usedQuizIds) && state.usedQuizIds.length > 0) {
    mergeUsedQuizIds(state.usedQuizIds);
  }
  const migrated: GameState = {
    ...fresh,
    ...state,
    phase: state.phase === "shop" ? "home" : state.phase,
    config: migrateConfig(state.config ?? fresh.config),
    settings: { ...fresh.settings, ...state.settings },
    dailyUsage: {
      dayIndex: state.dailyUsage?.dayIndex ?? fresh.dailyUsage.dayIndex,
      voteCostChanged: state.dailyUsage?.voteCostChanged ?? false,
    },
    // pendingQuiz เก่าไม่มี startedAt/อ้าง playerId → ทิ้ง (โจทย์ค้างข้ามเวอร์ชันไม่มีเวลาเริ่ม)
    pendingQuiz: state.pendingQuiz?.startedAt ? { questionId: state.pendingQuiz.questionId, startedAt: state.pendingQuiz.startedAt } : null,
    pendingQuizResult: state.pendingQuizResult ?? null,
    pendingGachaGrant: state.pendingGachaGrant ?? null,
    currentVote: state.currentVote ?? null,
    lastVoteResult: state.lastVoteResult ?? null,
    lastClueResult: state.lastClueResult ?? null,
    lastGachaResult: state.lastGachaResult ?? null,
    lastGuessResult: state.lastGuessResult ?? null,
  };
  delete (migrated as GameState & { usedQuizIds?: string[] }).usedQuizIds;
  return migrated;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
