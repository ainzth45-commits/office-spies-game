import { describe, expect, it } from "vitest";
import { defaultConfig } from "../data/configDefaults";
import type { GachaOutcome } from "./types";
import { availableGachaWeights, normalizeGachaWeights, resolveGachaOutcome, selectWeightedGachaOutcome } from "./gachaEngine";

describe("gacha engine", () => {
  it("selects an outcome by normalized weights", () => {
    const weights: Record<GachaOutcome, number> = {
      selfGain: 1,
      selfLoseAll: 0,
      allGain: 0,
      poorGain: 0,
      allLose: 0,
      voteUp: 0,
      voteDown: 0,
      grantItem: 0,
      grantQuiz: 0,
      spyShield: 0,
    };
    expect(selectWeightedGachaOutcome(weights, () => 0.99)).toBe("selfGain");
  });

  it("normalizes weights to 100", () => {
    const normalized = normalizeGachaWeights({ ...defaultConfig.gachaWeights, selfGain: 26 });
    const total = Object.values(normalized).reduce((sum, value) => sum + value, 0);
    expect(Math.round(total)).toBe(100);
  });

  it("falls back from spy shield to all gain when shield already exists", () => {
    expect(resolveGachaOutcome("spyShield", { inventoryFull: false, shieldAvailable: false })).toBe("allGain");
  });

  it("falls back from grant item to self gain when inventory is full", () => {
    expect(resolveGachaOutcome("grantItem", { inventoryFull: true, shieldAvailable: true })).toBe("selfGain");
  });

  it("removes spyShield from the pool once a shield already exists", () => {
    const weights = availableGachaWeights(defaultConfig.gachaWeights, { shieldExists: true, voteCostChangedToday: false });
    expect(weights.spyShield).toBe(0);
    // outcome อื่นๆ คงน้ำหนักเดิม → selectWeightedGachaOutcome เฉลี่ยให้อัตโนมัติ
    expect(weights.selfGain).toBe(defaultConfig.gachaWeights.selfGain);
    expect(weights.voteUp).toBe(defaultConfig.gachaWeights.voteUp);
  });

  it("removes both voteUp and voteDown once vote cost already changed today", () => {
    const weights = availableGachaWeights(defaultConfig.gachaWeights, { shieldExists: false, voteCostChangedToday: true });
    expect(weights.voteUp).toBe(0);
    expect(weights.voteDown).toBe(0);
    expect(weights.spyShield).toBe(defaultConfig.gachaWeights.spyShield);
  });

  it("never selects an excluded outcome even at the top of the weight range", () => {
    // ล็อกทั้งเกราะและค่าโหวต แล้วสุ่มหลายค่า — ต้องไม่ออก spyShield/voteUp/voteDown เลย
    const weights = availableGachaWeights(defaultConfig.gachaWeights, { shieldExists: true, voteCostChangedToday: true });
    for (let i = 0; i < 50; i += 1) {
      const outcome = selectWeightedGachaOutcome(weights, () => i / 50);
      expect(["spyShield", "voteUp", "voteDown"]).not.toContain(outcome);
    }
  });
});
