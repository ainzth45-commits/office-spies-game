import type { GameState, Player } from "../domain/types";
import { createInitialGameState } from "./gameState";

// ผู้เล่นสมมุติสำหรับเทสเท่านั้น — repo เป็น public ห้ามใส่ชื่อจริงพนักงานในไฟล์เทสเด็ดขาด
export function makeTestPlayers(count = 12): Player[] {
  return Array.from({ length: count }, (_, i) => {
    const code = `C${String(i + 1).padStart(3, "0")}`;
    return { id: code, code, name: `ผู้เล่น ${i + 1}`, imageUrl: "" };
  });
}

// เทสส่วนใหญ่ต้องการเกมที่มีผู้เล่นพร้อมเล่น — แทน createInitialGameState() เดิมที่เคยมี 12 คนจริงฝังโค้ด
// default 12 คนเพื่อให้ค่า economy ที่เทสยึดอยู่ (ค่าโหวต 54, เงินคืน 9, เกณฑ์ 9) ไม่เปลี่ยน
export function makeTestState(count = 12): GameState {
  return createInitialGameState(makeTestPlayers(count));
}
