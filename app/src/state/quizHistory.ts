// ประวัติโจทย์ที่ใช้แล้ว — เก็บใน localStorage แยกจากเซฟเกม (IndexedDB)
// เจตนา: เริ่มเกมใหม่/รีเซตเกม โจทย์ต้องไม่วนซ้ำ จนกว่าซุปกด "รีเซตคลังโจทย์" ในตั้งค่า
// ทุกจุดกัน storage ใช้ไม่ได้ (Safari private mode / โควตาเต็ม) — เกมต้องเล่นต่อได้ แค่จำไม่ได้

const KEY = "office-spies/quiz-used-v1";

export function getUsedQuizIds(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function write(ids: string[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // storage ใช้ไม่ได้ — ยอมให้จำไม่ได้ ดีกว่าเกมพัง
  }
}

export function markQuizUsed(id: string): void {
  write([...new Set([...getUsedQuizIds(), id])]);
}

export function mergeUsedQuizIds(ids: string[]): void {
  if (ids.length === 0) return;
  write([...new Set([...getUsedQuizIds(), ...ids])]);
}

export function resetQuizHistory(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // เพิกเฉย — เหตุผลเดียวกับ write
  }
}
