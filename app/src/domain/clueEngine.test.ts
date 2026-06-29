import { describe, expect, it } from "vitest";
import { defaultConfig } from "../data/configDefaults";
import { drawClue } from "./clueEngine";

describe("drawClue", () => {
  it("charges but gives no card when voted pool has fewer than three players", () => {
    expect(drawClue(["A", "B"], ["C"], "voted", defaultConfig, () => 0)).toEqual({ kind: "paid-empty", playerIds: [] });
  });

  it("draws one voted player when threshold is met", () => {
    const votedPool = ["A", "B", "C"];
    const result = drawClue(votedPool, ["D"], "voted", defaultConfig, () => 0);
    expect(result.playerIds).toHaveLength(1);
    expect(votedPool).toContain(result.playerIds[0]);
  });

  it("draws up to four not-voted players", () => {
    expect(drawClue(["A"], ["B", "C", "D", "E", "F"], "notVoted", defaultConfig, () => 0).playerIds).toHaveLength(4);
  });
});
