import type { Role } from "../../domain/types";

// สิ่งที่ผู้เล่นเห็นในโหมด topic
//   - image: เห็นรูป (A หรือ B) โดยไม่มีป้ายบอกว่าเป็นรูปอะไร
//   - jester: คนบ้า ไม่มีภาพให้ดู
export type TopicView = { kind: "image"; url: string } | { kind: "jester" };

// เลือกว่าผู้เล่นคนนี้เห็นอะไร
//   - คนบ้า (jester): ไม่มีภาพ
//   - สปาย (spyA/spyB): รูป B
//   - "คนรั่ว" (isLeaked = ผู้เล่นปกติที่ถูกสุ่มให้เห็นรูปสปาย): รูป B เหมือนสปาย
//   - ผู้เล่นปกติที่เหลือ: รูป A
export function topicViewFor(role: Role, isLeaked: boolean, imageA: string, imageB: string): TopicView {
  if (role === "jester") return { kind: "jester" };
  const seesSpyImage = role === "spyA" || role === "spyB" || isLeaked;
  return { kind: "image", url: seesSpyImage ? imageB : imageA };
}
