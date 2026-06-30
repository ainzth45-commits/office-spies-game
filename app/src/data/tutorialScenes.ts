import { gameAssets, itemCardAssets } from "./assets";

export interface TutorialScene {
  id: string;
  title: string;
  narration: string;
  image: string;
  shortMode: boolean;
}

// สอนเล่น — คำง่ายมาก เน้นกลไก "โหวต" (หัวใจเกม) อธิบายเกณฑ์ + ยกตัวอย่าง 11 คน
export const tutorialScenes: TutorialScene[] = [
  {
    id: "intro",
    title: "ออฟฟิศเรามีสายลับ!",
    narration: "ในออฟฟิศเรา มีสายลับแอบอยู่ 2 คน 🕵️ ทุกคนต้องช่วยกันหาให้เจอ! ส่วนสายลับ ต้องเอาตัวรอดไม่ให้โดนจับ",
    image: gameAssets.mascotDetective,
    shortMode: false,
  },
  {
    id: "roles",
    title: "ดูบทบาทของตัวเอง",
    narration: "เริ่มเกม ทุกคนเดินมาดูบทบาทของตัวเองทีละคน · สายลับ 2 คนจะรู้ว่าใครเป็นพวกเดียวกัน ส่วนคนอื่นไม่รู้เลยว่าใครเป็นสายลับ",
    image: gameAssets.roleSpy,
    shortMode: true,
  },
  {
    id: "coins",
    title: "ขายของได้ = ได้เหรียญ",
    narration: "ยิ่งขายเก่ง ยิ่งได้เหรียญเยอะ! 🪙 เอาเหรียญมาใช้ในเกม — เปิดโหวต ซื้อไอเทม หรือหมุนกาชา",
    image: gameAssets.coin,
    shortMode: true,
  },
  {
    id: "vote-cast",
    title: "โหวตจับสายลับ (หัวใจของเกม)",
    narration: "ทุกคนช่วยกันออกเหรียญ 'เปิดโหวต' 1 ครั้งต่อวัน · แล้วเดินมาทีละคน เลือกคนที่คิดว่าเป็นสายลับ แบบลับๆ ไม่ให้ใครเห็นว่าโหวตใคร",
    image: gameAssets.tutVoteCast,
    shortMode: false,
  },
  {
    id: "vote-threshold",
    title: "เกณฑ์: ต้องโหวตให้ถึง!",
    narration: "ไม่ใช่ใครได้เสียงมากสุดแล้วโดนจับเลยนะ · ต้องมีคนโหวต 'คนเดียวกัน' ให้ถึงเกณฑ์ก่อน · ตัวอย่าง: เล่นกัน 11 คน เกณฑ์คือ 8 → ถ้ามี 8 คนโหวตคนคนเดียวกัน คนนั้นถึงจะถูกจับ!",
    image: gameAssets.tutVoteThreshold,
    shortMode: false,
  },
  {
    id: "vote-outcome",
    title: "เปิดผลโหวต — ลุ้น 3 แบบ",
    narration: "① จับโดน 'สายลับ' = เก่งมาก! จับได้ 1 ใน 2 คน · ② จับโดน 'พนักงานธรรมดา' = พลาด เหรียญที่จ่ายได้คืน · ③ ไม่มีใครถึงเกณฑ์ = รอบนี้ยังจับไม่ได้ ไว้เอาใหม่",
    image: gameAssets.tutVoteOutcome,
    shortMode: false,
  },
  {
    id: "clues",
    title: "ซื้อเบาะแสเพิ่ม",
    narration: "หลังโหวต ถ้ามีคนถูกโหวตเยอะพอ เกมจะแอบบอกว่าในกลุ่มนั้นมีสายลับซ่อนกี่คน 🔎 · จ่ายเหรียญซื้อเบาะแสเพิ่มได้อีก",
    image: gameAssets.magnifier,
    shortMode: false,
  },
  {
    id: "items",
    title: "ไอเทมพลิกเกมโหวต",
    narration: "ซื้อไอเทมที่ 'ร้านลับ' มาช่วยตอนโหวต เช่น นับเป็น 2 เสียง · ลบเสียงคนอื่น · หรือลดเกณฑ์ให้จับง่ายขึ้น — ใครใช้ก่อน-หลังมีผลมาก",
    image: itemCardAssets.double,
    shortMode: false,
  },
  {
    id: "shield",
    title: "ระวังเกราะของสายลับ",
    narration: "สายลับอาจได้ 'เกราะ' จากกาชา 🛡️ · ถ้าสายลับที่มีเกราะโดนจับ จะรอดแบบเงียบๆ เหมือนจับพลาด ไม่มีใครรู้ว่าใช้เกราะ",
    image: itemCardAssets.spyShield,
    shortMode: false,
  },
  {
    id: "shop-gacha",
    title: "ร้านลับ & กาชา",
    narration: "ร้านลับ: ซื้อไอเทมแบบไม่ให้ใครเห็น · กาชา: ถูกกว่า แต่ลุ้นสุ่ม อาจได้เหรียญ เสียเหรียญ ได้โจทย์ หรือของพิเศษ",
    image: gameAssets.gachaMachine,
    shortMode: false,
  },
  {
    id: "win",
    title: "ใครชนะ?",
    narration: "จับสายลับครบทั้ง 2 คน = ทีมชนะ! 🎉 · แต่ถ้าเล่นครบ 6 วันแล้วยังจับไม่ครบ = สายลับเอาตัวรอด สายลับชนะ!",
    image: gameAssets.endTeamWin,
    shortMode: true,
  },
  {
    id: "start",
    title: "พร้อมล่าสายลับแล้ว!",
    narration: "พร้อมแล้วนักสืบ! กลับหน้าหลัก กด 'เริ่มรอบใหม่' เพื่อสุ่มสายลับ แล้วลุยเลย 🔍",
    image: gameAssets.mascotDetective,
    shortMode: false,
  },
];
