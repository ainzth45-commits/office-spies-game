import { describe, expect, it } from "vitest";
import { defaultConfig } from "../data/configDefaults";
import {
  answerPendingQuiz,
  advanceFromPostVoteClue,
  advanceFromVoteResult,
  applyGachaOutcome,
  applyGachaVoteMultiplier,
  assignNewRoles,
  buyPostVoteClue,
  buyVoteItem,
  canStartNewDay,
  endWorkingDay,
  enterRoleReveal,
  finalizeVoteRound,
  markFinalDay,
  openVote,
  resetGame,
  resolveSecondSpyGuess,
  restDay,
  rolesAssigned,
  startNewDay,
  startNewRound,
  submitVoteTurn,
  updateConfig,
} from "./actions";
import { createInitialGameState } from "./gameState";

describe("game actions", () => {
  it("ending a working day without vote increases vote cost multiplier", () => {
    const state = endWorkingDay(createInitialGameState(), "วันเล่นที่ 2");
    expect(state.voteCostState.accumulatedSkippedMultiplier).toBe(1.5);
    expect(state.manualDay.label).toBe("วันเล่นที่ 2");
  });

  it("startNewDay advances the day until maxGameDays then locks", () => {
    let state = createInitialGameState(); // day 1, maxGameDays 6
    for (let day = 2; day <= 6; day += 1) {
      expect(canStartNewDay(state)).toBe(true);
      state = startNewDay(state);
      expect(state.manualDay.index).toBe(day);
    }
    // ถึงวันที่ 6 — เริ่มวันใหม่ไม่ได้แล้ว
    expect(state.manualDay.index).toBe(6);
    expect(state.manualDay.isFinalDay).toBe(true);
    expect(canStartNewDay(state)).toBe(false);
    expect(() => startNewDay(state)).toThrow();
  });

  it("resetGame returns to day 1 but keeps config and players", () => {
    let state = startNewDay(startNewDay(createInitialGameState())); // day 3
    state = { ...state, config: { ...state.config, gachaSpinCost: 99 } };
    const reset = resetGame(state);
    expect(reset.manualDay.index).toBe(1);
    expect(reset.manualDay.isFinalDay).toBe(false);
    expect(reset.phase).toBe("home");
    expect(reset.config.gachaSpinCost).toBe(99); // config คงไว้
    expect(reset.players).toEqual(state.players);
  });

  it("rest day does not increase vote cost multiplier", () => {
    const state = restDay(createInitialGameState(), "พักวันพุธ");
    expect(state.voteCostState.accumulatedSkippedMultiplier).toBe(1);
    expect(state.manualDay.label).toBe("พักวันพุธ");
  });

  it("opening a vote resets skipped multiplier and marks the day", () => {
    const skipped = endWorkingDay(createInitialGameState(), "วันเล่นที่ 2");
    const state = openVote(skipped);
    expect(state.voteCostState.accumulatedSkippedMultiplier).toBe(1);
    expect(state.voteCostState.nextVoteMultiplier).toBe(1);
    expect(state.manualDay.openedVoteToday).toBe(true);
    expect(state.currentVoteRoundId).toBeTruthy();
    expect(state.currentVote?.paidCost).toBe(49);
    expect(state.currentVote?.presentPlayerIds).toHaveLength(11);
  });

  it("final day gives spies the win when team has not won", () => {
    const state = markFinalDay(createInitialGameState());
    expect(state.phase).toBe("ended");
    expect(state.endWinner).toBe("spies");
  });

  it("final day does not overwrite an existing team win", () => {
    const initial = { ...createInitialGameState(), phase: "ended" as const, endWinner: "team" as const };
    const state = markFinalDay(initial);
    expect(state.endWinner).toBe("team");
  });

  it("assignNewRoles assigns two spies", () => {
    const state = assignNewRoles(createInitialGameState(), () => 0);
    expect(Object.values(state.roles).filter((role) => role === "spyA")).toHaveLength(1);
    expect(Object.values(state.roles).filter((role) => role === "spyB")).toHaveLength(1);
  });

  it("fresh game has no spies assigned (rolesAssigned=false)", () => {
    expect(rolesAssigned(createInitialGameState())).toBe(false);
  });

  it("enterRoleReveal auto-assigns spies on a fresh game (fixes no-spy bug)", () => {
    const state = enterRoleReveal(createInitialGameState(), () => 0);
    expect(state.phase).toBe("roleReveal");
    expect(rolesAssigned(state)).toBe(true);
    expect(Object.values(state.roles).filter((role) => role === "spyA")).toHaveLength(1);
    expect(Object.values(state.roles).filter((role) => role === "spyB")).toHaveLength(1);
  });

  it("enterRoleReveal does NOT reshuffle when roles already assigned (re-view keeps same roles)", () => {
    const assigned = assignNewRoles(createInitialGameState(), () => 0);
    const reviewed = enterRoleReveal(assigned, () => 0.99);
    expect(reviewed.phase).toBe("roleReveal");
    expect(reviewed.roles).toEqual(assigned.roles);
  });

  it("startNewRound reshuffles spies and resets the round", () => {
    const state = startNewRound(createInitialGameState(), () => 0);
    expect(rolesAssigned(state)).toBe(true);
    expect(state.currentVote).toBeNull();
    expect(state.lastVoteResult).toBeNull();
  });

  it("assignNewRoles preserves inventory and shield state", () => {
    const original = createInitialGameState();
    original.inventories.C001 = [{ id: "item-1", type: "double", source: "shop", publicKnown: false, createdAtActionId: "a1" }];
    original.shield = { slot: "spyA", exists: true, consumed: false };
    const state = assignNewRoles(original, () => 0);
    expect(state.inventories.C001).toEqual(original.inventories.C001);
    expect(state.shield).toEqual(original.shield);
  });

  it("applies next vote multiplier from gacha", () => {
    const state = applyGachaVoteMultiplier(createInitialGameState(), 1.5);
    expect(state.voteCostState.nextVoteMultiplier).toBe(1.5);
  });

  it("updates valid config", () => {
    const state = updateConfig(createInitialGameState(), { quizCorrectReward: 12 });
    expect(state.config.quizCorrectReward).toBe(12);
  });

  it("rejects invalid config", () => {
    expect(() => updateConfig(createInitialGameState(), { spyCount: 11 })).toThrow("จำนวนสปายต้องน้อยกว่าจำนวนผู้เล่น");
  });

  it("buys a secret vote item and enforces inventory limit", () => {
    const first = buyVoteItem(createInitialGameState(), "C001", "double", "shop");
    const second = buyVoteItem(first, "C001", "remove", "shop");

    expect(second.inventories.C001.map((item) => item.type)).toEqual(["double", "remove"]);
    expect(second.inventories.C001[0].publicKnown).toBe(false);
    expect(() => buyVoteItem(second, "C001", "swap", "shop")).toThrow("กระเป๋าไอเทมเต็ม");
  });

  it("resets daily shop and gacha limits when a new day starts", () => {
    const spun = applyGachaOutcome(createInitialGameState(), "C001", "selfGain");
    const shopped = buyVoteItem(spun, "C001", "double", "shop");
    const nextDay = endWorkingDay(shopped, "วันเล่นที่ 2");

    expect(nextDay.dailyUsage.dayIndex).toBe(2);
    expect(nextDay.dailyUsage.gachaSpins.C001).toBeUndefined();
    expect(nextDay.dailyUsage.shopPurchases.C001?.double).toBeUndefined();
  });

  it("applies gacha grant item as a public inventory item", () => {
    const state = applyGachaOutcome(createInitialGameState(), "C002", "grantItem", { selectedItemType: "swap" });

    expect(state.inventories.C002).toMatchObject([{ type: "swap", source: "gacha", publicKnown: true }]);
    expect(state.lastGachaResult?.message).toContain("ได้ไอเทม");
  });

  it("opens quiz phase when gacha grants a quiz", () => {
    const state = applyGachaOutcome(createInitialGameState(), "C003", "grantQuiz", { selectedQuizId: "Q001" });

    expect(state.phase).toBe("quiz");
    expect(state.pendingQuiz).toEqual({ playerId: "C003", questionId: "Q001" });
  });

  it("answers pending quiz and stores the used question", () => {
    const pending = applyGachaOutcome(createInitialGameState(), "C003", "grantQuiz", { selectedQuizId: "Q001" });
    const state = answerPendingQuiz(pending, "B");

    expect(state.phase).toBe("home");
    expect(state.pendingQuiz).toBeNull();
    expect(state.usedQuizIds).toContain("Q001");
    expect(state.lastGachaResult?.message).toContain("ตอบถูก");
  });

  it("enforces gacha daily limit per player", () => {
    const config = { ...defaultConfig, gachaDailyLimitPerPlayer: 1 };
    const state = applyGachaOutcome({ ...createInitialGameState(), config }, "C004", "selfGain");

    expect(() => applyGachaOutcome(state, "C004", "allGain")).toThrow("หมุนกาชาครบลิมิตวันนี้แล้ว");
  });

  it("does not create a new spy shield after the only shield was consumed", () => {
    const initial = {
      ...createInitialGameState(),
      roles: { ...createInitialGameState().roles, C001: "spyA" as const, C002: "spyB" as const },
      shield: { slot: "spyA" as const, exists: true, consumed: true },
    };
    const state = applyGachaOutcome(initial, "C004", "spyShield", { shieldSlot: "spyB" });

    expect(state.shield).toEqual(initial.shield);
    expect(state.lastGachaResult?.outcome).toBe("allGain");
  });

  it("runs a full vote round and holds on vote result before routing onward", () => {
    const withRoles = {
      ...createInitialGameState(),
      roles: { ...createInitialGameState().roles, C010: "spyA" as const, C011: "spyB" as const },
    };
    let state = openVote(withRoles);
    for (const voter of state.currentVote!.presentPlayerIds) {
      state = submitVoteTurn(state, { voterId: voter, targetId: "C001" });
    }
    state = finalizeVoteRound(state);

    expect(state.phase).toBe("voteResult");
    expect(state.lastVoteResult?.result.publicResult).toBe("caughtInnocent");
    expect(state.lastVoteResult?.refundAmount).toBe(8);
  });

  it("routes from vote result to post-vote clue before guessing a caught spy", () => {
    const roles = { ...createInitialGameState().roles, C001: "spyA" as const, C002: "spyB" as const };
    const state = advanceFromVoteResult({
      ...createInitialGameState(),
      phase: "voteResult",
      roles,
      lastVoteResult: {
        roundId: "round-1",
        paidCost: 33,
        refundAmount: 0,
        result: {
          publicResult: "caughtSpy",
          winnerId: "C001",
          winnerIsSpy: true,
          shieldConsumed: false,
          adjustedCounts: {},
          votedPool: [],
          notVotedPool: [],
          spiesInPoolCount: 0,
          spyPoolReveal: null,
          threshold: 8,
          blockedMessages: [],
        },
      },
    });

    expect(state.phase).toBe("postVoteClue");
  });

  it("routes from post-vote clue to guessing after a spy catch", () => {
    const roles = { ...createInitialGameState().roles, C001: "spyA" as const, C002: "spyB" as const };
    const state = advanceFromPostVoteClue({
      ...createInitialGameState(),
      phase: "postVoteClue",
      roles,
      lastVoteResult: {
        roundId: "round-1",
        paidCost: 33,
        refundAmount: 0,
        result: {
          publicResult: "caughtSpy",
          winnerId: "C001",
          winnerIsSpy: true,
          shieldConsumed: false,
          adjustedCounts: {},
          votedPool: [],
          notVotedPool: [],
          spiesInPoolCount: 0,
          spyPoolReveal: null,
          threshold: 8,
          blockedMessages: [],
        },
      },
    });

    expect(state.phase).toBe("guess");
  });

  it("consumes vote items when a turn uses them", () => {
    let state = buyVoteItem(createInitialGameState(), "C001", "double", "shop");
    state = openVote(state);
    const itemId = state.inventories.C001[0].id;
    state = submitVoteTurn(state, { voterId: "C001", targetId: "C002", doubleItemId: itemId });

    expect(state.currentVote?.votes[0]).toMatchObject({ voterId: "C001", targetId: "C002", doubleVote: true });
    expect(state.inventories.C001).toHaveLength(0);
  });

  it("buys one public post-vote clue per vote round", () => {
    let state = openVote(createInitialGameState());
    for (const voter of state.currentVote!.presentPlayerIds) {
      state = submitVoteTurn(state, { voterId: voter, targetId: voter === "C001" ? "C002" : "C001" });
    }
    state = finalizeVoteRound(state);
    state = buyPostVoteClue(state, "notVoted", () => 0);

    expect(state.phase).toBe("postVoteClue");
    expect(state.lastClueResult?.option).toBe("notVoted");
    expect(() => buyPostVoteClue(state, "voted", () => 0)).toThrow("รอบนี้ซื้อเบาะแสไปแล้ว");
  });

  it("ends the game when the team guesses the second spy correctly", () => {
    const roles = { ...createInitialGameState().roles, C001: "spyA" as const, C002: "spyB" as const };
    const state = resolveSecondSpyGuess(
      {
        ...createInitialGameState(),
        roles,
        phase: "guess",
        lastVoteResult: {
          roundId: "round-1",
          paidCost: 33,
          refundAmount: 0,
          result: {
            publicResult: "caughtSpy",
            winnerId: "C001",
            winnerIsSpy: true,
            shieldConsumed: false,
            adjustedCounts: {},
            votedPool: [],
            notVotedPool: [],
            spiesInPoolCount: 0,
            spyPoolReveal: null,
            threshold: 8,
            blockedMessages: [],
          },
        },
      },
      "C002",
    );

    expect(state.phase).toBe("ended");
    expect(state.endWinner).toBe("team");
  });
});
