import { describe, expect, it } from "vitest";
import { exportBackup, parseBackup } from "./backup";
import { createInitialGameState } from "./gameState";

describe("backup", () => {
  it("exports and imports state", () => {
    const state = createInitialGameState();
    expect(parseBackup(exportBackup(state)).players).toHaveLength(11);
  });

  it("rejects invalid backup", () => {
    expect(() => parseBackup("{}")).toThrow("ไฟล์ backup ไม่ถูกต้อง");
  });
});
