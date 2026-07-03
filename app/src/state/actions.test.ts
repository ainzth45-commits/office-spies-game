import { describe, expect, it } from "vitest";
import { defaultConfig } from "../data/configDefaults";
import {
  acknowledgeWrongGuess,
  answerPendingQuiz,
  advanceFromPostVoteClue,
  advanceFromVoteResult,
  applyGachaOutcome,
  applyGachaVoteMultiplier,
  assignGachaItem,
  assignNewRoles,
  buyPostVoteClue,
  canStartNewDay,
  dismissQuizResult,
  endWorkingDay,
  enterRoleReveal,
  finalizeVoteRound,
  finishRefund,
  markFinalDay,
  openVote,
  resolveSecondSpyGuess,
  rolesAssigned,
  startNewDay,
  startNewGameRound,
  startNewRound,
  startPendingQuiz,
  submitVoteTurn,
  updateConfig,
} from "./actions";
import { quizBank } from "../data/quizBank";
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

  it("startNewGameRound wipes the board but keeps config/settings/players", () => {
    let state = startNewDay(startNewDay(createInitialGameState())); // day 3
    state = assignGachaItem(applyGachaOutcome(state, "itemSwap"), "C001");
    state = {
      ...state,
      config: { ...state.config, gachaSpinCost: 9 },
      shield: { slot: "spyA", exists: true, consumed: false },
      voteCostState: { accumulatedSkippedMultiplier: 2.25, nextVoteMultiplier: 1.5 },
      settings: { ...state.settings, soundEnabled: false },
    };

    const fresh = startNewGameRound(state);
    expect(fresh.manualDay.index).toBe(1);
    expect(fresh.inventories.C001).toHaveLength(0);
    expect(fresh.shield).toEqual({ slot: null, exists: false, consumed: false });
    expect(fresh.voteCostState).toEqual({ accumulatedSkippedMultiplier: 1, nextVoteMultiplier: 1 });
    expect(rolesAssigned(fresh)).toBe(false); // บทบาทว่าง — ไปสุ่มตอนกดเปิดบทบาท
    expect(fresh.phase).toBe("boot"); // กลับหน้าแตะโลโก้
    // ของที่ต้องรอด: ตั้งค่าเกมของซุป + settings เครื่อง + ผู้เล่น
    expect(fresh.config.gachaSpinCost).toBe(9);
    expect(fresh.settings.soundEnabled).toBe(false);
    expect(fresh.players).toEqual(state.players);
  });

  it("startNewGameRound is blocked when the quiz bank is below the minimum", () => {
    // ใน jsdom คลังยังเต็ม 200 — ตั้งเกณฑ์สูงกว่าคลังเพื่อจำลองคลังต่ำกว่าเกณฑ์
    const state = { ...createInitialGameState(), config: { ...createInitialGameState().config, quizMinRemainingToStart: 201 } };
    expect(() => startNewGameRound(state)).toThrow("รีเซตคลังโจทย์");
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
    original.inventories.C001 = [{ id: "item-1", type: "double", source: "gacha", publicKnown: true, createdAtActionId: "a1" }];
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

  it("item outcome parks a pending grant, admin assigns it into an inventory", () => {
    const spun = applyGachaOutcome(createInitialGameState(), "itemSwap");
    expect(spun.pendingGachaGrant).toMatchObject({ itemType: "swap" });
    expect(spun.inventories.C002 ?? []).toHaveLength(0);

    const assigned = assignGachaItem(spun, "C002");
    expect(assigned.pendingGachaGrant).toBeNull();
    expect(assigned.inventories.C002).toMatchObject([{ type: "swap", source: "gacha", publicKnown: true }]);
  });

  it("assignGachaItem rejects a full inventory but keeps the grant pending for someone else", () => {
    let state = createInitialGameState();
    state = assignGachaItem(applyGachaOutcome(state, "itemDouble"), "C001");
    state = assignGachaItem(applyGachaOutcome(state, "itemRemove"), "C001"); // C001 เต็ม (limit 2)
    const spun = applyGachaOutcome(state, "itemSwap");

    expect(() => assignGachaItem(spun, "C001")).toThrow("เต็ม");
    const assigned = assignGachaItem(spun, "C002");
    expect(assigned.inventories.C002.map((item) => item.type)).toEqual(["swap"]);
  });

  it("item outcome falls back to a coin message when every inventory is full", () => {
    let state = createInitialGameState();
    state = { ...state, config: { ...state.config, inventoryLimit: 0 } };
    const spun = applyGachaOutcome(state, "itemSwap");

    expect(spun.pendingGachaGrant).toBeNull();
    expect(spun.lastGachaResult?.message).toContain("กระเป๋าเต็มทั้งออฟฟิศ");
  });

  it("gacha spins are unlimited (no daily cap, no player binding)", () => {
    let state = createInitialGameState();
    for (let i = 0; i < 10; i += 1) {
      state = applyGachaOutcome(state, "selfGain");
    }
    expect(state.lastGachaResult?.message).toContain("คนที่หมุน");
  });

  it("resets daily vote-cost flag when a new day starts", () => {
    const spun = applyGachaOutcome(createInitialGameState(), "voteUp");
    expect(spun.dailyUsage.voteCostChanged).toBe(true);
    const nextDay = endWorkingDay(spun, "วันเล่นที่ 2");
    expect(nextDay.dailyUsage.dayIndex).toBe(2);
    expect(nextDay.dailyUsage.voteCostChanged).toBe(false);
  });

  it("opens quiz phase with a timestamp when gacha grants a quiz", () => {
    const nowMs = Date.parse("2026-07-03T10:00:00.000Z");
    const state = applyGachaOutcome(createInitialGameState(), "grantQuiz", { random: () => 0, nowMs });

    expect(state.phase).toBe("quiz");
    expect(state.pendingQuiz?.questionId).toMatch(/^Q\d{3}$/);
    // เข้าหน้ากติกาก่อน — เวลายังไม่เริ่มนับ จนกว่าจะกด "ไปที่คำถาม" (startPendingQuiz)
    expect(state.pendingQuiz?.startedAt).toBeNull();
    expect(() => answerPendingQuiz(state, "A", Date.parse("2026-07-03T10:00:05.000Z"))).toThrow("ยังไม่เริ่มโจทย์");
    const started = startPendingQuiz(state, Date.parse("2026-07-03T10:00:00.000Z"));
    expect(started.pendingQuiz?.startedAt).toBe("2026-07-03T10:00:00.000Z");
    // กดเริ่มซ้ำ ไม่รีเซ็ตเวลา
    expect(startPendingQuiz(started, Date.parse("2026-07-03T10:09:00.000Z")).pendingQuiz?.startedAt).toBe("2026-07-03T10:00:00.000Z");
  });

  it("answering fast earns full reward; result waits on quiz screen", () => {
    const nowMs = Date.parse("2026-07-03T10:00:00.000Z");
    const pending = startPendingQuiz(applyGachaOutcome(createInitialGameState(), "grantQuiz", { random: () => 0, nowMs }), nowMs);
    const question = quizBank.find((candidate) => candidate.id === pending.pendingQuiz?.questionId)!;
    const state = answerPendingQuiz(pending, question.answer, nowMs + 3_000);

    expect(state.phase).toBe("quiz"); // ไม่เด้งโฮม — โชว์ผลก่อน
    expect(state.pendingQuiz).toBeNull();
    expect(state.pendingQuizResult?.correct).toBe(true);
    expect(state.pendingQuizResult?.message).toContain(`รับ ${defaultConfig.quizCorrectReward} เหรียญ`);

    const home = dismissQuizResult(state);
    expect(home.phase).toBe("home");
    expect(home.pendingQuizResult).toBeNull();
  });

  it("slow answers decay the reward down to the floor", () => {
    const nowMs = Date.parse("2026-07-03T10:00:00.000Z");
    const pending = startPendingQuiz(applyGachaOutcome(createInitialGameState(), "grantQuiz", { random: () => 0, nowMs }), nowMs);
    const question = quizBank.find((candidate) => candidate.id === pending.pendingQuiz?.questionId)!;
    // 17 วิ → ลด 3 ขั้น (default decay 5 วิ/ขั้น จาก 10 → 7)
    const state = answerPendingQuiz(pending, question.answer, nowMs + 17_000);
    expect(state.pendingQuizResult?.message).toContain("รับ 7 เหรียญ");
  });

  it("wrong answers escalate the penalty after the time tier", () => {
    const nowMs = Date.parse("2026-07-03T10:00:00.000Z");
    const pending = startPendingQuiz(applyGachaOutcome(createInitialGameState(), "grantQuiz", { random: () => 0, nowMs }), nowMs);
    const question = quizBank.find((candidate) => candidate.id === pending.pendingQuiz?.questionId)!;
    const wrong = question.answer === "A" ? "B" : "A";

    const early = answerPendingQuiz(pending, wrong, nowMs + 10_000);
    expect(early.pendingQuizResult?.correct).toBe(false);
    expect(early.pendingQuizResult?.message).toContain(`คืน ${defaultConfig.quizWrongPenaltyPerPlayer} เหรียญ`);

    const late = answerPendingQuiz(pending, wrong, nowMs + 300_000);
    expect(late.pendingQuizResult?.message).toContain(`คืน ${defaultConfig.quizWrongPenaltyLate} เหรียญ`);
  });

  it("does not create a new spy shield after the only shield was consumed", () => {
    const initial = {
      ...createInitialGameState(),
      roles: { ...createInitialGameState().roles, C001: "spyA" as const, C002: "spyB" as const },
      shield: { slot: "spyA" as const, exists: true, consumed: true },
    };
    const state = applyGachaOutcome(initial, "spyShield", { shieldSlot: "spyB" });

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
    let state = assignGachaItem(applyGachaOutcome(createInitialGameState(), "itemDouble"), "C001");
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

  it("wrong second-spy guess shows a verdict first, then reshuffles on acknowledge", () => {
    const roles = { ...createInitialGameState().roles, C001: "spyA" as const, C002: "spyB" as const };
    const fixture = {
      ...createInitialGameState(),
      roles,
      phase: "guess" as const,
      lastVoteResult: {
        roundId: "round-1",
        paidCost: 33,
        refundAmount: 0,
        result: {
          publicResult: "caughtSpy" as const,
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
    };

    const pending = resolveSecondSpyGuess(fixture, "C003");
    // ชี้ผิด: ค้างจอเฉลยก่อน ไม่เด้งหนีทันที
    expect(pending.phase).toBe("guess");
    expect(pending.lastGuessResult).toEqual({ guessedId: "C003", correct: false });

    const next = acknowledgeWrongGuess(pending, () => 0);
    expect(next.phase).toBe("roleReveal");
    expect(next.lastGuessResult).toBeNull();
    expect(next.lastVoteResult).toBeNull();
    expect(rolesAssigned(next)).toBe(true);

    // เงื่อนไขจบเกมข้อ 2: ชี้ผิดใน "วันสุดท้าย" ไม่มีรอบให้แก้ตัว → สายลับชนะทันที
    const finalDayPending = { ...pending, manualDay: { ...pending.manualDay, isFinalDay: true } };
    const ended = acknowledgeWrongGuess(finalDayPending, () => 0);
    expect(ended.phase).toBe("ended");
    expect(ended.endWinner).toBe("spies");
  });

  it("ends with a spy win when the final-day vote round closes without a catch", () => {
    let state = openVote(createInitialGameState());
    state = { ...state, manualDay: { ...state.manualDay, index: 6, isFinalDay: true } };
    for (const voter of state.currentVote!.presentPlayerIds) {
      state = submitVoteTurn(state, { voterId: voter, targetId: voter === "C001" ? "C002" : "C001" });
    }
    state = finalizeVoteRound(state); // ไม่มีสายลับถูกจับ (ไม่มีใครเป็นสปายในเกมสด)
    expect(state.lastVoteResult?.result.publicResult).not.toBe("caughtSpy");
    // วันสุดท้ายโหวตแพ้ = จบทันที ไม่แวะคืนเหรียญ/เบาะแส
    state = advanceFromVoteResult(state);

    expect(state.phase).toBe("ended");
    expect(state.endWinner).toBe("spies");
  });

  it("keeps the game going when a mid-game vote round closes without a catch", () => {
    let state = openVote(createInitialGameState()); // วันเล่นที่ 1
    for (const voter of state.currentVote!.presentPlayerIds) {
      state = submitVoteTurn(state, { voterId: voter, targetId: voter === "C001" ? "C002" : "C001" });
    }
    state = finalizeVoteRound(state);
    // หีบรอบเก่าต้องถูกปิดทิ้ง — ไม่งั้นวันถัดไปหน้าโหวตค้างที่ "ครบทุกเสียงแล้ว" เปิดรอบใหม่ไม่ได้
    expect(state.currentVote).toBeNull();
    state = advanceFromVoteResult(state);
    if (state.phase === "refund") state = finishRefund(state);
    state = advanceFromPostVoteClue(state);

    expect(state.phase).toBe("home");
    expect(state.endWinner).toBeNull();

    // วันใหม่ต้องเปิดโหวตรอบใหม่ได้ทันที
    const nextDay = startNewDay(state);
    const reopened = openVote(nextDay);
    expect(reopened.currentVote?.submittedVoterIds).toHaveLength(0);
  });
});
