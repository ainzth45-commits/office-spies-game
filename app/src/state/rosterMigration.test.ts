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
  it("ไฟล์ backup ยุคเก่า (ไม่มี rosterVersion) ถูกปฏิเสธชัดเจน — ห้ามหลอกว่านำเข้าสำเร็จ", async () => {
    const { exportBackup, parseBackup } = await import("./backup");
    const legacy = { ...makeTestState(12), phase: "home" } as Omit<GameState, "rosterVersion"> & { rosterVersion?: number };
    delete legacy.rosterVersion;
    expect(() => parseBackup(exportBackup(legacy as GameState))).toThrow("backup รุ่นเก่า");
  });
  it("ไฟล์ backup รุ่นปัจจุบันนำเข้าได้ปกติ", async () => {
    const { exportBackup, parseBackup } = await import("./backup");
    const current = { ...makeTestState(4), phase: "home" as const };
    const imported = parseBackup(exportBackup(current));
    expect(imported.players).toHaveLength(4);
    expect(imported.phase).toBe("home");
  });
});

describe("legacy wipe keeps quiz history", () => {
  it("เซฟเก่ามากที่ยังฝัง usedQuizIds → ย้ายเข้า localStorage ก่อนล้างเซฟ", async () => {
    const store = new Map<string, string>();
    const { vi } = await import("vitest");
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    });
    const legacy = { ...makeTestState(12), usedQuizIds: ["Q001", "Q002"] } as unknown as Omit<GameState, "rosterVersion"> & { rosterVersion?: number };
    delete legacy.rosterVersion;
    const migrated = migrateGameState(legacy as GameState);
    expect(migrated.players).toEqual([]);
    const { getUsedQuizIds } = await import("./quizHistory");
    expect(getUsedQuizIds()).toEqual(expect.arrayContaining(["Q001", "Q002"]));
    vi.unstubAllGlobals();
  });
});
