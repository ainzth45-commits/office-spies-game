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
    // quiz timing ใหม่เติมจาก default (สเกล 5วิ/30วิ)
    expect(migrated.quizRewardDecaySec).toBe(5);
    expect(migrated.quizPenaltyTierSec).toBe(30);
  });

  it("upgrades first-generation quiz timing (10s/60s) to the new 5s/30s scale", () => {
    const migrated = migrateConfig({ ...defaultConfig, quizRewardDecaySec: 10, quizPenaltyTierSec: 60 });
    expect(migrated.quizRewardDecaySec).toBe(5);
    expect(migrated.quizPenaltyTierSec).toBe(30);
    // ค่าที่ซุปตั้งเองแบบอื่น (ไม่ใช่ค่ารุ่นแรก) ต้องไม่ถูกแตะ
    const custom = migrateConfig({ ...defaultConfig, quizRewardDecaySec: 8, quizPenaltyTierSec: 45 });
    expect(custom.quizRewardDecaySec).toBe(8);
    expect(custom.quizPenaltyTierSec).toBe(45);
  });

  it("keeps already-migrated weights untouched", () => {
    const migrated = migrateConfig({ ...defaultConfig, gachaWeights: { ...defaultConfig.gachaWeights, itemSwap: 7 } });
    expect(migrated.gachaWeights.itemSwap).toBe(7);
  });

  it("upgrades saves still holding the pre-2026-07-04 default weights to the new default set", () => {
    const oldDefaults = {
      selfGain: 12, selfLoseAll: 8, allGain: 10, poorGain: 8, allLose: 8, voteUp: 8, voteDown: 7,
      itemDouble: 3, itemRemove: 3, itemSwap: 3, itemReduce: 3, itemProtect: 3, grantQuiz: 16, spyShield: 8,
    };
    const migrated = migrateConfig({ ...defaultConfig, gachaWeights: oldDefaults });
    expect(migrated.gachaWeights.spyShield).toBe(3);
    expect(migrated.gachaWeights.grantQuiz).toBe(20);
    // ชุดที่ซุปปรับมือเอง (ไม่ตรง default เดิมเป๊ะ) ต้องไม่ถูกแตะ
    const custom = migrateConfig({ ...defaultConfig, gachaWeights: { ...oldDefaults, spyShield: 10 } });
    expect(custom.gachaWeights.spyShield).toBe(10);
    expect(custom.gachaWeights.grantQuiz).toBe(16);
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
