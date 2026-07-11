// จำ "คนรั่ว" (ผู้เล่นปกติที่ถูกสุ่มให้เห็นรูปสปาย) ไว้ใน localStorage
// เพื่อให้กดดูภาพซ้ำได้ผลเหมือนเดิมทุกครั้ง จนกว่าจะเปลี่ยน/รีเซตรูป
// แยก key ต่างหาก กัน storage ใช้ไม่ได้บางจุด (Safari private mode / โควตาเต็ม)

import type { PlayerId } from "../domain/types";

const KEY = "office-spies/topic-leaked-v1";

export function getLeaked(): PlayerId | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw && raw.trim() !== "" ? raw : null;
  } catch {
    return null;
  }
}

export function saveLeaked(id: PlayerId | null): void {
  try {
    if (id === null) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, id);
  } catch {
    // เพิกเฉย — ยอมให้จำไม่ได้ ดีกว่าพัง
  }
}

export function clearLeaked(): void {
  saveLeaked(null);
}
