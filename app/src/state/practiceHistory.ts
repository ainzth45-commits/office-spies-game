// ประวัติ "ข้อที่ตอบไปแล้ว" ของโหมดฝึกเชาว์ — เก็บใน localStorage แยกจากทุกอย่าง
// จงใจแยก key จากคลังโจทย์เกมจริง (quiz-used-v1): ฝึกไม่กระทบเกม เกมไม่กระทบฝึก
// กัน storage ใช้ไม่ได้ (Safari private mode / โควตาเต็ม) ทุกจุด — ฝึกต่อได้ แค่จำไม่ได้

const KEY = "office-spies/practice-answered-v1";

export function getPracticeAnsweredIds(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function markPracticeAnswered(id: string): void {
  try {
    localStorage.setItem(KEY, JSON.stringify([...new Set([...getPracticeAnsweredIds(), id])]));
  } catch {
    // storage ใช้ไม่ได้ — ยอมให้จำไม่ได้ ดีกว่าพัง
  }
}

export function resetPracticeAnswered(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // เพิกเฉย — เหตุผลเดียวกับด้านบน
  }
}
