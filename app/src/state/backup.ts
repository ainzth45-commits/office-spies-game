import type { GameState } from "../domain/types";

export function exportBackup(state: GameState): string {
  return JSON.stringify({ exportedAt: new Date().toISOString(), state }, null, 2);
}

export function parseBackup(raw: string): GameState {
  const parsed = JSON.parse(raw) as { state?: unknown };
  if (!parsed || typeof parsed !== "object" || !("state" in parsed)) {
    throw new Error("ไฟล์ backup ไม่ถูกต้อง");
  }
  const state = parsed.state as Partial<GameState>;
  if (state.version !== 1 || !Array.isArray(state.players) || !state.config || !state.manualDay) {
    throw new Error("backup version หรือโครงสร้างไม่ตรงกับเกมนี้");
  }
  return state as GameState;
}
