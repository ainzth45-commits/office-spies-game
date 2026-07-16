import { describe, expect, it } from "vitest";
import { buildPlayerRecords, createInitialGameState } from "./gameState";
import { makeTestPlayers, makeTestState } from "./testUtils";

describe("buildPlayerRecords", () => {
  it("สร้าง record ครบ 3 ตารางจากรายชื่อ", () => {
    const players = makeTestPlayers(3);
    const records = buildPlayerRecords(players);
    expect(records.attendance).toEqual({ C001: true, C002: true, C003: true });
    expect(records.roles).toEqual({ C001: "normal", C002: "normal", C003: "normal" });
    expect(records.inventories).toEqual({ C001: [], C002: [], C003: [] });
  });
});

describe("createInitialGameState", () => {
  it("ไม่ส่งรายชื่อ = เกมว่างเปล่า (ไม่มีข้อมูลจริงฝังโค้ด)", () => {
    const state = createInitialGameState();
    expect(state.players).toEqual([]);
    expect(state.attendance).toEqual({});
  });
  it("ส่งรายชื่อ = record ครบทุกคน", () => {
    const state = makeTestState();
    expect(state.players).toHaveLength(12);
    expect(Object.keys(state.roles)).toHaveLength(12);
    expect(state.rosterVersion).toBe(2);
  });
});
