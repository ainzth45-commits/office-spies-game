import { useState } from "react";

// ไอคอนธีมเกมแทนอิโมจิ — รูปโหลดไม่ได้เมื่อไหร่ ถอยไปใช้อิโมจิเดิมอัตโนมัติ
export function ThemedIcon({ src, emoji, className }: { src: string; emoji: string; className?: string }) {
  const [broken, setBroken] = useState(false);
  if (broken) return <span className={className} aria-hidden="true">{emoji}</span>;
  return <img className={className} src={src} alt="" aria-hidden="true" onError={() => setBroken(true)} />;
}
