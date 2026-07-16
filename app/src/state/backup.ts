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
  // ไฟล์ backup ยุคเก่า (ก่อนระบบลงทะเบียน) จะโดน migration ล้างรายชื่อ+กระดานทิ้งทั้งไฟล์ —
  // นำเข้าแล้วเงียบๆ ได้ state เปล่า = หลอกว่าสำเร็จ → ปฏิเสธตรงๆ พร้อมบอกเหตุผลแทน
  if (typeof state.rosterVersion !== "number") {
    throw new Error("ไฟล์ backup รุ่นเก่า (ก่อนระบบลงทะเบียนผู้เล่น) ใช้กับเวอร์ชันนี้ไม่ได้ — ลงทะเบียนผู้เล่นใหม่ในตั้งค่า แล้ว export backup ใหม่");
  }
  // backup รุ่นปัจจุบันยังต้องผ่าน migration ปกติ (เผื่อ field รุ่นถัดไปเปลี่ยน)
  return migrateGameState(state as GameState);
}
