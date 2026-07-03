// สั่นเครื่องตอนจังหวะสำคัญ (ตราปั๊ม/นับถอยหลัง/แคปซูลหล่น)
// ⚠️ iOS Safari/WebKit ไม่รองรับ navigator.vibrate — บน iPad จะเงียบเฉยๆ (no-op)
// ใส่ไว้แบบกันพังเผื่อวันหน้าเล่นบน Android/desktop ที่รองรับ
export function buzz(pattern: number | number[]): void {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // อุปกรณ์ไม่รองรับ — เงียบไว้ ไม่กระทบเกม
  }
}
