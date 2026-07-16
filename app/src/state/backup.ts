import type { GameState } from "../domain/types";
import { migrateGameState } from "./storage";

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
  // ไฟล์ backup ยุคเก่าต้องผ่าน migration เหมือนเซฟใน IndexedDB — ไม่งั้นรายชื่อยุคฝังโค้ดฟื้นกลับมา
  // แล้วค่อยถูกล้างตอน reload ถัดไป (พฤติกรรมไม่ตรงกันจนงง)
  return migrateGameState(state as GameState);
}
