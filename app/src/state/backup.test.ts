import { describe, expect, it } from "vitest";
import { exportBackup, parseBackup } from "./backup";
import { makeTestState } from "./testUtils";

describe("backup", () => {
  it("exports and imports state", () => {
    const state = makeTestState();
    expect(parseBackup(exportBackup(state)).players).toHaveLength(12);
  });

  it("rejects invalid backup", () => {
    expect(() => parseBackup("{}")).toThrow("ไฟล์ backup ไม่ถูกต้อง");
  });
});
