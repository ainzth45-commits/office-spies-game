import { describe, expect, it } from "vitest";
import { defaultConfig } from "../data/configDefaults";
import type { Role, ShieldState, VoteEngineInput } from "./types";
import { calculateVoteResult, THRESHOLD_ITEM_BLOCKED_MESSAGE } from "./voteEngine";

const players = ["A", "B", "C", "D", "E", "F", "G", "H"];
const roles: Record<string, Role> = {
  A: "spyA",
  B: "spyB",
  C: "normal",
  D: "normal",
  E: "normal",
  F: "normal",
  G: "normal",
  H: "normal",
};
const noShield: ShieldState = { slot: null, exists: false, consumed: false };

function input(overrides: Partial<VoteEngineInput>): VoteEngineInput {
  return {
    presentPlayerIds: players,
    roles,
    votes: [],
    usedItems: [],
    config: defaultConfig,
    shield: noShield,
    ...overrides,
  };
}

describe("vote engine", () => {
  it("fails when no single player reaches threshold", () => {
    const result = calculateVoteResult(
      input({
        votes: [
          { voterId: "A", targetId: "C", doubleVote: false },
          { voterId: "B", targetId: "D", doubleVote: false },
        ],
      }),
    );
    expect(result.publicResult).toBe("failed");
    expect(result.winnerId).toBeNull();
  });

  it("fails on tied winners even when both reach threshold", () => {
    const result = calculateVoteResult(
      input({
        votes: [
          { voterId: "A", targetId: "C", doubleVote: true },
          { voterId: "B", targetId: "C", doubleVote: true },
          { voterId: "C", targetId: "C", doubleVote: false },
          { voterId: "D", targetId: "D", doubleVote: true },
          { voterId: "E", targetId: "D", doubleVote: true },
          { voterId: "F", targetId: "D", doubleVote: false },
        ],
      }),
    );
    expect(result.publicResult).toBe("failed");
  });

  it("catches an innocent when exactly one innocent reaches threshold", () => {
    const result = calculateVoteResult(input({ votes: players.slice(0, 6).map((voterId) => ({ voterId, targetId: "C", doubleVote: false })) }));
    expect(result.publicResult).toBe("caughtInnocent");
    expect(result.winnerId).toBe("C");
  });

  it("catches a spy when exactly one spy reaches threshold", () => {
    const result = calculateVoteResult(input({ votes: players.slice(0, 6).map((voterId) => ({ voterId, targetId: "A", doubleVote: false })) }));
    expect(result.publicResult).toBe("caughtSpy");
    expect(result.winnerId).toBe("A");
  });

  it("removes votes to zero and removes that player from voted pool", () => {
    const result = calculateVoteResult(
      input({
        votes: [{ voterId: "A", targetId: "C", doubleVote: false }],
        usedItems: [{ id: "i1", userId: "B", type: "remove", targetId: "C" }],
      }),
    );
    expect(result.adjustedCounts.C).toBe(0);
    expect(result.votedPool).not.toContain("C");
  });

  it("swaps counts between two targets", () => {
    const result = calculateVoteResult(
      input({
        votes: [
          { voterId: "A", targetId: "C", doubleVote: false },
          { voterId: "B", targetId: "C", doubleVote: false },
          { voterId: "C", targetId: "D", doubleVote: false },
        ],
        usedItems: [{ id: "i1", userId: "E", type: "swap", firstTargetId: "C", secondTargetId: "D" }],
      }),
    );
    expect(result.adjustedCounts.C).toBe(1);
    expect(result.adjustedCounts.D).toBe(2);
  });

  it("reduces threshold with R only", () => {
    const result = calculateVoteResult(
      input({
        votes: players.slice(0, 5).map((voterId) => ({ voterId, targetId: "C", doubleVote: false })),
        usedItems: [{ id: "r1", userId: "D", type: "reduceThreshold" }],
      }),
    );
    expect(result.threshold).toBe(5);
    expect(result.publicResult).toBe("caughtInnocent");
  });

  it("blocks R when P comes first", () => {
    const result = calculateVoteResult(
      input({
        votes: players.slice(0, 5).map((voterId) => ({ voterId, targetId: "C", doubleVote: false })),
        usedItems: [
          { id: "p1", userId: "A", type: "protectThreshold" },
          { id: "r1", userId: "D", type: "reduceThreshold" },
        ],
      }),
    );
    expect(result.threshold).toBe(6);
    expect(result.blockedMessages).toContain(THRESHOLD_ITEM_BLOCKED_MESSAGE);
    expect(result.publicResult).toBe("failed");
  });

  it("weakens R when P comes after R", () => {
    const result = calculateVoteResult(
      input({
        votes: players.slice(0, 5).map((voterId) => ({ voterId, targetId: "C", doubleVote: false })),
        usedItems: [
          { id: "r1", userId: "D", type: "reduceThreshold" },
          { id: "p1", userId: "A", type: "protectThreshold" },
        ],
      }),
    );
    expect(result.threshold).toBe(5);
  });

  it("blocks duplicate R and duplicate P with generic messages", () => {
    const result = calculateVoteResult(
      input({
        usedItems: [
          { id: "r1", userId: "D", type: "reduceThreshold" },
          { id: "r2", userId: "E", type: "reduceThreshold" },
          { id: "p1", userId: "A", type: "protectThreshold" },
          { id: "p2", userId: "B", type: "protectThreshold" },
        ],
      }),
    );
    expect(result.blockedMessages).toEqual([THRESHOLD_ITEM_BLOCKED_MESSAGE, THRESHOLD_ITEM_BLOCKED_MESSAGE]);
  });

  it("silently flips a shielded spy catch to failed and consumes shield internally", () => {
    const result = calculateVoteResult(
      input({
        votes: players.slice(0, 6).map((voterId) => ({ voterId, targetId: "A", doubleVote: false })),
        shield: { slot: "spyA", exists: true, consumed: false },
      }),
    );
    expect(result.publicResult).toBe("failed");
    expect(result.winnerId).toBe("A");
    expect(result.shieldConsumed).toBe(true);
  });

  it("reveals spy count when voted pool has at least four players and includes a spy", () => {
    const result = calculateVoteResult(
      input({
        votes: [
          { voterId: "A", targetId: "A", doubleVote: false },
          { voterId: "B", targetId: "C", doubleVote: false },
          { voterId: "C", targetId: "D", doubleVote: false },
          { voterId: "D", targetId: "E", doubleVote: false },
        ],
      }),
    );
    expect(result.spyPoolReveal).toEqual({ spies: 1, total: 4 });
  });

  it("does not reveal spy count when voted pool has only three players", () => {
    const result = calculateVoteResult(
      input({
        votes: [
          { voterId: "A", targetId: "A", doubleVote: false },
          { voterId: "B", targetId: "C", doubleVote: false },
          { voterId: "C", targetId: "D", doubleVote: false },
        ],
      }),
    );
    expect(result.spyPoolReveal).toBeNull();
  });
});
