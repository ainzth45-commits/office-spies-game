import { describe, expect, it } from "vitest";
import { defaultConfig } from "../data/configDefaults";
import { calculateClueCost, calculateRefund, calculateThreshold, calculateVoteCost } from "./economy";

describe("economy helpers", () => {
  it("rounds vote threshold from present players", () => {
    expect(calculateThreshold(11, defaultConfig)).toBe(8);
    expect(calculateThreshold(10, defaultConfig)).toBe(7);
    expect(calculateThreshold(9, defaultConfig)).toBe(6);
    expect(calculateThreshold(8, defaultConfig)).toBe(6);
  });

  it("keeps threshold between floor and present count", () => {
    expect(calculateThreshold(1, defaultConfig)).toBe(1);
    expect(calculateThreshold(2, defaultConfig)).toBe(2);
  });

  it("scales vote cost by present players and multipliers", () => {
    expect(calculateVoteCost(11, 1, 1, defaultConfig)).toBe(33);
    expect(calculateVoteCost(10, 1.5, 1, defaultConfig)).toBe(45);
    expect(calculateVoteCost(10, 1, 0.5, defaultConfig)).toBe(15);
  });

  it("rounds clue cost down from paid vote cost", () => {
    expect(calculateClueCost(33, defaultConfig)).toBe(8);
  });

  it("refunds one quarter rounded down", () => {
    expect(calculateRefund(33, defaultConfig)).toBe(8);
  });
});
