export interface TutorialScene {
  id: string;
  title: string;
  narration: string;
  shortMode: boolean;
}

export const tutorialScenes: TutorialScene[] = [
  { id: "intro", title: "เปิดเรื่อง", narration: "ในออฟฟิศนี้... มีสายลับแฝงตัวอยู่ 2 คน! ภารกิจของพวกเรา คือจับให้ได้ก่อนสิ้นสัปดาห์!", shortMode: false },
  { id: "roles", title: "บทบาท", narration: "ทุกคนเดินมาดูบทบาทลับของตัวเองทีละคน สายลับ 2 คนจะเห็นหน้ากันเอง แต่คนอื่นไม่รู้เลยว่าใครเป็นใคร!", shortMode: true },
  { id: "coins", title: "เหรียญ = พลัง", narration: "ยิ่งขายเก่ง ยิ่งได้เหรียญ! เหรียญรับจริงที่ซุป แล้วเอามาเล่นเกมการเมือง โหวต ซื้อไอเทม หมุนกาชา!", shortMode: true },
  { id: "shop-gacha", title: "ร้านไอเทม & กาชา", narration: "ร้านไอเทมซื้อแบบลับ ส่วนกาชาถูกกว่าแต่สุ่ม อาจได้เหรียญ เสียเหรียญ ได้โจทย์ หรือสายลับได้เกราะ", shortMode: false },
  { id: "vote", title: "การโหวต", narration: "รวมเหรียญเปิดโหวต แล้วผลัดกันมากดลับๆ ระบบจะบอกแค่ชนะหรือแพ้ ไม่บอกตัวเลข", shortMode: true },
  { id: "clues", title: "หลังโหวต: เบาะแส", narration: "ถ้ามีคนถูกโหวตเยอะพอ ระบบจะกระซิบว่ามีสายลับปนอยู่กี่คน และทีมซื้อเบาะแสเพิ่มได้", shortMode: false },
  { id: "items", title: "ไอเทมโหวต", narration: "โหวต 2 เสียง ลบเสียง สลับผล ลดเกณฑ์ หรือป้องกันการลดเกณฑ์ ใครมาก่อนมาหลังสำคัญมาก", shortMode: false },
  { id: "shield", title: "เกราะสายลับ", narration: "เกราะของสายลับทำงานเงียบที่สุด ถ้าสายลับโดนจับได้ เกราะจะพลิกผลเป็นแพ้แบบไม่มีใครรู้", shortMode: false },
  { id: "deadline", title: "แพ้-ชนะ & เวลา", narration: "จับสายลับครบ 2 คน ทีมชนะ แต่ถ้าถึงวันสุดท้ายแล้วยังจับไม่ได้ สายลับชนะ", shortMode: true },
  { id: "start", title: "เริ่มเล่น", narration: "พร้อมหรือยัง นักสืบทั้งหลาย? ขายให้กระจาย แล้วมาล่าสายลับกัน!", shortMode: false },
];
