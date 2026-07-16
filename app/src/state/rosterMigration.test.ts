import { describe, expect, it } from "vitest";
import type { GameState } from "../domain/types";
import { migrateGameState } from "./storage";
import { makeTestState } from "./testUtils";

describe("roster migration", () => {
  it("เซฟยุคเก่า (ไม่มี rosterVersion) → ล้างรายชื่อ+กระดาน คง config/settings", () => {
    const legacy = { ...makeTestState(12), phase: "home" } as Omit<GameState, "rosterVersion"> & { rosterVersion?: number };
    delete legacy.rosterVersion;
    legacy.config = { ...legacy.config, spyCount: 3 };
    legacy.settings = { ...legacy.settings, soundEnabled: false };
    const migrated = migrateGameState(legacy as GameState);
    expect(migrated.players).toEqual([]);
    expect(migrated.attendance).toEqual({});
    expect(migrated.phase).toBe("boot");
    expect(migrated.rosterVersion).toBe(2);
    expect(migrated.config.spyCount).toBe(3);
    expect(migrated.settings.soundEnabled).toBe(false);
  });
  it("เซฟยุคใหม่ (rosterVersion 2) → รายชื่อรอด ไม่โดนล้าง", () => {
    const saved = { ...makeTestState(5), phase: "home" as const };
    const migrated = migrateGameState(saved);
    expect(migrated.players).toHaveLength(5);
    expect(migrated.phase).toBe("home");
    expect(migrated.rosterNextNumber).toBe(6);
  });
});

describe("backup import migration", () => {
  it("ไฟล์ backup ยุคเก่า (ไม่มี rosterVersion) โดนล้างรายชื่อเหมือนเซฟเก่า", async () => {
    const { exportBackup, parseBackup } = await import("./backup");
    const legacy = { ...makeTestState(12), phase: "home" } as Omit<GameState, "rosterVersion"> & { rosterVersion?: number };
    delete legacy.rosterVersion;
    const imported = parseBackup(exportBackup(legacy as GameState));
    expect(imported.players).toEqual([]);
    expect(imported.rosterVersion).toBe(2);
  });
});
