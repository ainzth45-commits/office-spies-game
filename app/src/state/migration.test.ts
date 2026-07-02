import { describe, expect, it } from "vitest";
import { defaultConfig } from "../data/configDefaults";
import type { GameState } from "../domain/types";
import { createInitialGameState } from "./gameState";
import { migrateConfig, migrateGameState } from "./storage";

// เซฟเก่า (ก่อน 2026-07-03): grantItem ช่องเดียว + field ที่ถูกถอด
function legacyConfig() {
  const config = { ...defaultConfig } as Record<string, unknown>;
  config.gachaWeights = {
    selfGain: 13, selfLoseAll: 9, allGain: 11, poorGain: 9, allLose: 9,
    voteUp: 9, voteDown: 8, grantItem: 10, grantQuiz: 14, spyShield: 8,
  };
  config.gachaDailyLimitPerPlayer = 2;
  config.itemPrices = { double: 10, remove: 8, swap: 12, reduceThreshold: 12, protectThreshold: 12 };
  config.itemDailyLimits = { double: 1, remove: 1, swap: 1, reduceThreshold: 1, protectThreshold: 1 };
  return config;
}

describe("migration from pre-rework saves", () => {
  it("splits legacy grantItem weight equally into the 5 item slots", () => {
    const migrated = migrateConfig(legacyConfig() as unknown as Parameters<typeof migrateConfig>[0]);
    expect(migrated.gachaWeights.itemDouble).toBe(2);
    expect(migrated.gachaWeights.itemSwap).toBe(2);
    expect(migrated.gachaWeights.selfGain).toBe(13);
    expect("grantItem" in migrated.gachaWeights).toBe(false);
    expect("itemPrices" in migrated).toBe(false);
    expect("gachaDailyLimitPerPlayer" in migrated).toBe(false);
    // quiz timing ใหม่เติมจาก default
    expect(migrated.quizRewardDecaySec).toBe(10);
  });

  it("keeps already-migrated weights untouched", () => {
    const migrated = migrateConfig({ ...defaultConfig, gachaWeights: { ...defaultConfig.gachaWeights, itemSwap: 7 } });
    expect(migrated.gachaWeights.itemSwap).toBe(7);
  });

  it("moves a game stranded on the removed shop phase back home and fills new fields", () => {
    const legacy = {
      ...createInitialGameState(),
      phase: "shop",
      config: legacyConfig(),
      usedQuizIds: ["Q001", "Q002"],
      dailyUsage: { dayIndex: 3, gachaSpins: { C001: 2 }, shopPurchases: {}, voteCostChanged: true },
      pendingQuiz: { playerId: "C001", questionId: "Q003" },
    } as unknown as GameState;

    const migrated = migrateGameState(legacy);
    expect(migrated.phase).toBe("home");
    expect(migrated.dailyUsage).toEqual({ dayIndex: 3, voteCostChanged: true });
    // pendingQuiz เก่าไม่มี startedAt → ทิ้ง
    expect(migrated.pendingQuiz).toBeNull();
    expect(migrated.pendingGachaGrant).toBeNull();
    expect(migrated.pendingQuizResult).toBeNull();
    expect("usedQuizIds" in migrated).toBe(false);
    expect(migrated.config.gachaWeights.itemReduce).toBe(2);
  });
});
