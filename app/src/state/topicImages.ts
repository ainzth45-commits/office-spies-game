// จำลิงก์รูปโหมด topic ไว้ใน localStorage — เปิดเข้ามาใหม่จะได้ดูรูปเดิมได้เลย ไม่ต้องวางลิงก์ใหม่
// แยก key จากทุกอย่าง กัน storage ใช้ไม่ได้ทุกจุด (Safari private mode / โควตาเต็ม)

const KEY = "office-spies/topic-images-v1";

export function getTopicImages(): { a: string; b: string } {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    const obj = (parsed && typeof parsed === "object" ? parsed : {}) as { a?: unknown; b?: unknown };
    return {
      a: typeof obj.a === "string" ? obj.a : "",
      b: typeof obj.b === "string" ? obj.b : "",
    };
  } catch {
    return { a: "", b: "" };
  }
}

export function saveTopicImages(a: string, b: string): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ a, b }));
  } catch {
    // เพิกเฉย — ยอมให้จำไม่ได้ ดีกว่าพัง
  }
}

export function clearTopicImages(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // เพิกเฉย
  }
}
