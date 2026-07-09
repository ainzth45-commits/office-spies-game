import { describe, expect, it } from "vitest";
import { defaultConfig } from "../data/configDefaults";
import type { GachaOutcome } from "./types";
import { applySpyChaosBias, availableGachaWeights, normalizeGachaWeights, resolveGachaOutcome, selectWeightedGachaOutcome, SPY_BAD_GACHA_OUTCOMES } from "./gachaEngine";

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
      itemDouble: 0,
      itemRemove: 0,
      itemSwap: 0,
      itemReduce: 0,
      itemProtect: 0,
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
    expect(resolveGachaOutcome("spyShield", { shieldAvailable: false })).toBe("allGain");
  });

  it("item outcomes pass through untouched (no inventory rule at engine level)", () => {
    expect(resolveGachaOutcome("itemSwap", { shieldAvailable: true })).toBe("itemSwap");
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

  it("disabled outcomes are zeroed out of the live pool", () => {
    const weights = availableGachaWeights(defaultConfig.gachaWeights, {
      shieldExists: false,
      voteCostChangedToday: false,
      disabled: ["grantQuiz", "spyShield"],
    });
    expect(weights.grantQuiz).toBe(0);
    expect(weights.spyShield).toBe(0);
    expect(weights.selfGain).toBe(defaultConfig.gachaWeights.selfGain);
  });

  it("spy chaos bias multiplies bad outcomes and leaves quiz/coins untouched", () => {
    const biased = applySpyChaosBias(defaultConfig.gachaWeights, 2);
    for (const outcome of SPY_BAD_GACHA_OUTCOMES) {
      expect(biased[outcome]).toBe(defaultConfig.gachaWeights[outcome] * 2);
    }
    // โจทย์เชาว์ + เหรียญ ต้องไม่ถูกคูณ
    expect(biased.grantQuiz).toBe(defaultConfig.gachaWeights.grantQuiz);
    expect(biased.selfGain).toBe(defaultConfig.gachaWeights.selfGain);
    expect(SPY_BAD_GACHA_OUTCOMES).not.toContain("grantQuiz");
  });

  it("spy chaos bias with multiplier 1 returns the weights unchanged", () => {
    const weights = { ...defaultConfig.gachaWeights };
    expect(applySpyChaosBias(weights, 1)).toBe(weights);
  });

  it("bias never resurrects a zeroed (disabled/locked) bad outcome", () => {
    const live = availableGachaWeights(defaultConfig.gachaWeights, {
      shieldExists: true, // เกราะถูกถอด → 0
      voteCostChangedToday: false,
    });
    const biased = applySpyChaosBias(live, 3);
    expect(biased.spyShield).toBe(0);
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
