import { describe, expect, it } from "vitest";
import { addPlayer, assignNewRoles, enterRoleReveal, finishGameToBoot, removePlayer, startNewGameRound, updatePlayer } from "./actions";
import { createInitialGameState } from "./gameState";
import { makeTestState } from "./testUtils";

describe("player roster", () => {
  it("addPlayer สร้าง code รันต่อจาก max + record ครบ 3 ตาราง", () => {
    let state = createInitialGameState();
    state = addPlayer(state, { name: "  ทดสอบ หนึ่ง  ", imageUrl: "" });
    expect(state.players).toEqual([{ id: "C001", code: "C001", name: "ทดสอบ หนึ่ง", imageUrl: "" }]);
    expect(state.attendance.C001).toBe(true);
    expect(state.roles.C001).toBe("normal");
    expect(state.inventories.C001).toEqual([]);
  });
  it("ลบคนแล้ว code ไม่ถูกใช้ซ้ำ (กันชนกับ state เก่า)", () => {
    let state = makeTestState(3); // C001-C003
    state = removePlayer(state, "C003");
    state = addPlayer(state, { name: "คนใหม่", imageUrl: "" });
    expect(state.players.map((p) => p.code)).toEqual(["C001", "C002", "C004"]);
  });
  it("removePlayer ล้าง record ทุกตาราง", () => {
    let state = makeTestState(3);
    state = removePlayer(state, "C002");
    expect(state.players.map((p) => p.id)).toEqual(["C001", "C003"]);
    expect(state.attendance.C002).toBeUndefined();
    expect(state.roles.C002).toBeUndefined();
    expect(state.inventories.C002).toBeUndefined();
  });
  it("ชื่อว่าง/อักขระล่องหนล้วน = throw", () => {
    const state = createInitialGameState();
    expect(() => addPlayer(state, { name: "  ​ ", imageUrl: "" })).toThrow("ใส่ชื่อผู้เล่นก่อน");
  });
  it("เพิ่ม/ลบระหว่างเกมค้าง (แจกบทบาทแล้ว) = throw · แก้ชื่อ/รูปทำได้", () => {
    let state = assignNewRoles(makeTestState(4));
    expect(() => addPlayer(state, { name: "แทรก", imageUrl: "" })).toThrow("จบเกมหรือเริ่มรอบใหม่ก่อน");
    expect(() => removePlayer(state, "C001")).toThrow("จบเกมหรือเริ่มรอบใหม่ก่อน");
    state = updatePlayer(state, "C001", { name: "ชื่อใหม่", imageUrl: "https://example.com/a.webp" });
    expect(state.players[0].name).toBe("ชื่อใหม่");
    expect(state.players[0].imageUrl).toBe("https://example.com/a.webp");
  });
  it("updatePlayer กับ id ที่ไม่มี = throw", () => {
    expect(() => updatePlayer(makeTestState(2), "C099", { name: "x", imageUrl: "" })).toThrow("ไม่พบผู้เล่น");
  });
});

describe("roster survives resets", () => {
  it("เริ่มรอบใหม่: รายชื่ออยู่ครบ + record 3 ตารางสร้างใหม่ครบทุกคน", () => {
    const state = startNewGameRound(assignNewRoles(makeTestState(4)));
    expect(state.players).toHaveLength(4);
    expect(Object.keys(state.attendance)).toHaveLength(4);
    expect(Object.values(state.roles).every((role) => role === "normal")).toBe(true);
    expect(Object.keys(state.inventories)).toHaveLength(4);
  });
  it("จบเกมกลับ boot: record สร้างใหม่ครบเหมือนกัน", () => {
    const state = finishGameToBoot(assignNewRoles(makeTestState(4)));
    expect(Object.keys(state.attendance)).toHaveLength(4);
  });
  it("เริ่มเกมโดยมีผู้เล่น < 3 = throw บอกให้ลงทะเบียน", () => {
    expect(() => enterRoleReveal(makeTestState(2))).toThrow("ลงทะเบียนผู้เล่นอย่างน้อย 3 คน");
  });
});

describe("roster lock during open vote + empty-roster vote guard", () => {
  it("หีบโหวตเปิดค้าง (ยังไม่แจกบทบาท) → เพิ่ม/ลบไม่ได้ กันคนผีค้างใน presentPlayerIds", async () => {
    const { openVote } = await import("./actions");
    const state = openVote(makeTestState(4));
    expect(() => removePlayer(state, "C001")).toThrow("หีบโหวตเปิดอยู่");
    expect(() => addPlayer(state, { name: "แทรก", imageUrl: "" })).toThrow("หีบโหวตเปิดอยู่");
  });
  it("openVote โดยผู้เล่น < 3 คน = throw บอกให้ลงทะเบียน (กันเผาสิทธิ์โหวตของวันทิ้งเปล่า)", async () => {
    const { openVote } = await import("./actions");
    expect(() => openVote(createInitialGameState())).toThrow("ลงทะเบียนผู้เล่นอย่างน้อย 3 คน");
  });
});
