import type { Role } from "../../domain/types";

// เลือกว่าแต่ละบทบาทเห็นรูปไหนในโหมด topic
// สปาย (spyA/spyB) เห็นรูป B · ที่เหลือ (ปกติ + คนสติแตก) เห็นรูป A
export function imageForRole(role: Role, imageA: string, imageB: string): string {
  return role === "spyA" || role === "spyB" ? imageB : imageA;
}
