import { describe, expect, it } from "vitest";
import { defaultConfig } from "../data/configDefaults";
import type { GachaOutcome } from "./types";
import { normalizeGachaWeights, resolveGachaOutcome, selectWeightedGachaOutcome } from "./gachaEngine";

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
});
