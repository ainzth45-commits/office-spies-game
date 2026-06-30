import { gameAssets, itemCardAssets } from "./assets";

export interface TutorialScene {
  id: string;
  title: string;
  narration: string;
  image: string;
  shortMode: boolean;
}

// สอนเล่น — คำง่าย เข้าใจไว มีภาพประกอบทุกฉาก (ใช้ asset ที่เจนไว้แล้ว)
export const tutorialScenes: TutorialScene[] = [
  {
    id: "intro",
    title: "ออฟฟิศเรามีสายลับ!",
    narration: "ในออฟฟิศเรา มีสายลับแอบอยู่ 2 คน 🕵️ ภารกิจของทุกคนคือ ช่วยกันจับสายลับให้เจอก่อนสิ้นสัปดาห์!",
    image: gameAssets.mascotDetective,
    shortMode: false,
  },
  {
    id: "roles",
    title: "ดูบทบาทของตัวเอง",
    narration: "แต่ละคนเดินมาดูบทบาทของตัวเองทีละคน · สายลับ 2 คนจะเห็นว่าใครเป็นคู่หู ส่วนคนอื่นไม่มีใครรู้ว่าใครเป็นสายลับ",
    image: gameAssets.roleSpy,
    shortMode: true,
  },
  {
    id: "coins",
    title: "ขายเก่ง = เหรียญเยอะ",
    narration: "ยิ่งขายของได้เยอะ ยิ่งได้เหรียญเยอะ! 🪙 เหรียญรับจริงที่ซุป เอามาโหวต ซื้อไอเทม หรือหมุนกาชาในเกมได้",
    image: gameAssets.coin,
    shortMode: true,
  },
  {
    id: "shop-gacha",
    title: "ร้านลับ & กาชา",
    narration: "ร้านลับ: ซื้อไอเทมแบบไม่ให้ใครเห็น · กาชา: ถูกกว่าแต่ลุ้นสุ่ม อาจได้เหรียญ เสียเหรียญ ได้โจทย์ หรือสายลับได้เกราะ",
    image: gameAssets.gachaMachine,
    shortMode: false,
  },
  {
    id: "vote",
    title: "โหวตจับสายลับ",
    narration: "ช่วยกันรวมเหรียญเปิดโหวต แล้วผลัดกันมากดเลือกทีละคนแบบลับๆ · ระบบบอกแค่ 'จับถูก' หรือ 'พลาด' ไม่บอกว่าใครได้กี่เสียง",
    image: gameAssets.ballotBox,
    shortMode: true,
  },
  {
    id: "clues",
    title: "ซื้อเบาะแสเพิ่ม",
    narration: "ถ้ามีคนถูกโหวตเยอะพอ ระบบจะแอบบอกว่าในกองนั้นมีสายลับกี่คน 🔎 · ทีมจ่ายเหรียญซื้อเบาะแสเพิ่มได้",
    image: gameAssets.magnifier,
    shortMode: false,
  },
  {
    id: "items",
    title: "ไอเทมพลิกเกม",
    narration: "ไอเทมช่วยพลิกผลโหวต: นับ 2 เสียง · ลบเสียง · สลับเสียง · ลดเกณฑ์จับ · กันการลดเกณฑ์ — ใครใช้ก่อน-หลังมีผลมาก",
    image: itemCardAssets.double,
    shortMode: false,
  },
  {
    id: "shield",
    title: "เกราะของสายลับ",
    narration: "สายลับอาจได้ 'เกราะ' จากกาชา 🛡️ ถ้าสายลับคนนั้นโดนจับ เกราะจะพลิกให้รอด แบบไม่มีใครรู้ว่าใช้เกราะ",
    image: itemCardAssets.spyShield,
    shortMode: false,
  },
  {
    id: "deadline",
    title: "ใครชนะ?",
    narration: "จับสายลับครบ 2 คน = ทีมชนะ! 🎉 แต่ถ้าหมดสัปดาห์แล้วยังจับไม่ครบ = สายลับชนะ",
    image: gameAssets.endTeamWin,
    shortMode: true,
  },
  {
    id: "start",
    title: "พร้อมล่าสายลับแล้ว!",
    narration: "พร้อมแล้วนักสืบ! กลับหน้าหลัก กด 'เริ่มรอบใหม่' เพื่อสุ่มสายลับ แล้วมาล่ากันเลย 🔍",
    image: gameAssets.mascotDetective,
    shortMode: false,
  },
];
