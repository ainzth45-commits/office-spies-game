// คลังโจทย์เชาว์ 200 ข้อ (ยกเครื่อง 2026-07-03)
// รีวิวจากของเดิม 100 ข้อ: เก็บ 85 (ติดป้ายความยาก + สลับ A/B ให้สมดุล) · ตัด 15 ข้อที่เฉลยผิด/กำกวม/ง่ายเกิน (ดู comment ท้ายไฟล์) · เขียนใหม่ 115
// 2026-07-03: ยกเลิกหมวด "กับดัก/ฮาๆ" ตามคำสั่งเจ้าของเกม — เขียน Q173–Q200 ใหม่เป็นโจทย์วัดความรู้/ไหวพริบ/วิเคราะห์/คณิต กระจายลง 4 หมวดเดิม
// หมวด 6 หมวด: คณิตคิดเร็ว(30) คณิตประยุกต์(36) อนุกรม/ลำดับ(32) ตรรกะ & เชาว์(38) เชาว์ภาษา/คำ(28) ความรู้รอบตัว(36)
// ความยาก: easy 72 · medium 81 · hard 47 — คำตอบถูก A 100 / B 100
import type { QuizQuestion } from "../domain/types";

export const quizBank: QuizQuestion[] = [
  // ── คณิตคิดเร็ว (Q001–Q030) ──
  { id: "Q001", category: "คณิตคิดเร็ว", question: "7 × 8 = ?", choiceA: "56", choiceB: "54", answer: "A", difficulty: "easy" },
  { id: "Q002", category: "คณิตคิดเร็ว", question: "144 ÷ 12 = ?", choiceA: "14", choiceB: "12", answer: "B", difficulty: "easy" },
  { id: "Q003", category: "คณิตคิดเร็ว", question: "15% ของ 200 = ?", choiceA: "30", choiceB: "25", answer: "A", difficulty: "medium" },
  { id: "Q004", category: "คณิตคิดเร็ว", question: "9 + 6 × 2 = ?", choiceA: "30", choiceB: "21", answer: "B", difficulty: "medium" },
  { id: "Q005", category: "คณิตคิดเร็ว", question: "100 − 37 = ?", choiceA: "63", choiceB: "73", answer: "A", difficulty: "easy" },
  { id: "Q006", category: "คณิตคิดเร็ว", question: "25 × 4 = ?", choiceA: "100", choiceB: "90", answer: "A", difficulty: "easy" },
  { id: "Q007", category: "คณิตคิดเร็ว", question: "เอาครึ่งหนึ่งของ 90 แล้วบวก 5 = ?", choiceA: "55", choiceB: "50", answer: "B", difficulty: "medium" },
  { id: "Q008", category: "คณิตคิดเร็ว", question: "13 × 3 = ?", choiceA: "36", choiceB: "39", answer: "B", difficulty: "easy" },
  { id: "Q009", category: "คณิตคิดเร็ว", question: "1/4 ของ 80 = ?", choiceA: "20", choiceB: "16", answer: "A", difficulty: "easy" },
  { id: "Q010", category: "คณิตคิดเร็ว", question: "8² = ?", choiceA: "16", choiceB: "64", answer: "B", difficulty: "easy" },
  { id: "Q011", category: "คณิตคิดเร็ว", question: "250 + 250 + 250 = ?", choiceA: "750", choiceB: "700", answer: "A", difficulty: "easy" },
  { id: "Q012", category: "คณิตคิดเร็ว", question: "17 − 9 = ?", choiceA: "7", choiceB: "8", answer: "B", difficulty: "easy" },
  { id: "Q013", category: "คณิตคิดเร็ว", question: "6 × 7 + 8 = ?", choiceA: "50", choiceB: "48", answer: "A", difficulty: "medium" },
  { id: "Q014", category: "คณิตคิดเร็ว", question: "3/5 ของ 100 = ?", choiceA: "60", choiceB: "50", answer: "A", difficulty: "medium" },
  { id: "Q015", category: "คณิตคิดเร็ว", question: "45 ÷ 9 = ?", choiceA: "6", choiceB: "5", answer: "B", difficulty: "easy" },
  { id: "Q016", category: "คณิตคิดเร็ว", question: "12 × 11 = ?", choiceA: "121", choiceB: "132", answer: "B", difficulty: "medium" },
  { id: "Q017", category: "คณิตคิดเร็ว", question: "2⁵ = ?", choiceA: "32", choiceB: "25", answer: "A", difficulty: "medium" },
  { id: "Q018", category: "คณิตคิดเร็ว", question: "7 × 9 = ?", choiceA: "72", choiceB: "63", answer: "B", difficulty: "easy" },
  { id: "Q019", category: "คณิตคิดเร็ว", question: "84 ÷ 4 = ?", choiceA: "21", choiceB: "24", answer: "A", difficulty: "medium" },
  { id: "Q020", category: "คณิตคิดเร็ว", question: "16 × 5 = ?", choiceA: "85", choiceB: "80", answer: "B", difficulty: "easy" },
  { id: "Q021", category: "คณิตคิดเร็ว", question: "132 ÷ 6 = ?", choiceA: "22", choiceB: "24", answer: "A", difficulty: "medium" },
  { id: "Q022", category: "คณิตคิดเร็ว", question: "40% ของ 150 = ?", choiceA: "50", choiceB: "60", answer: "B", difficulty: "medium" },
  { id: "Q023", category: "คณิตคิดเร็ว", question: "100 − 4 × 20 = ?", choiceA: "20", choiceB: "1,920", answer: "A", difficulty: "hard" },
  { id: "Q024", category: "คณิตคิดเร็ว", question: "15² = ?", choiceA: "215", choiceB: "225", answer: "B", difficulty: "hard" },
  { id: "Q025", category: "คณิตคิดเร็ว", question: "1/3 ของ 96 = ?", choiceA: "32", choiceB: "36", answer: "A", difficulty: "medium" },
  { id: "Q026", category: "คณิตคิดเร็ว", question: "999 × 2 = ?", choiceA: "1,898", choiceB: "1,998", answer: "B", difficulty: "easy" },
  { id: "Q027", category: "คณิตคิดเร็ว", question: "7 + 7 ÷ 7 = ?", choiceA: "8", choiceB: "2", answer: "A", difficulty: "hard" },
  { id: "Q028", category: "คณิตคิดเร็ว", question: "ครึ่งหนึ่งของครึ่งหนึ่งของ 100 = ?", choiceA: "50", choiceB: "25", answer: "B", difficulty: "medium" },
  { id: "Q029", category: "คณิตคิดเร็ว", question: "60 ÷ 5 × 2 = ?", choiceA: "24", choiceB: "6", answer: "A", difficulty: "hard" },
  { id: "Q030", category: "คณิตคิดเร็ว", question: "0.5 × 0.5 = ?", choiceA: "0.5", choiceB: "0.25", answer: "B", difficulty: "medium" },

  // ── คณิตประยุกต์ (Q031–Q058) ──
  { id: "Q031", category: "คณิตประยุกต์", question: "ซื้อของ 180 บาท จ่าย 200 ได้ทอนเท่าไร?", choiceA: "20 บาท", choiceB: "30 บาท", answer: "A", difficulty: "easy" },
  { id: "Q032", category: "คณิตประยุกต์", question: "ลด 20% จากราคา 500 เหลือเท่าไร?", choiceA: "450 บาท", choiceB: "400 บาท", answer: "B", difficulty: "easy" },
  { id: "Q033", category: "คณิตประยุกต์", question: "เดินทาง 60 กม. ด้วยความเร็ว 30 กม./ชม. ใช้เวลากี่ชั่วโมง?", choiceA: "3 ชั่วโมง", choiceB: "2 ชั่วโมง", answer: "B", difficulty: "easy" },
  { id: "Q034", category: "คณิตประยุกต์", question: "3 คนทาสีบ้านเสร็จใน 6 ชม. ถ้าใช้ 6 คน จะเสร็จในกี่ชม.?", choiceA: "3 ชั่วโมง", choiceB: "12 ชั่วโมง", answer: "A", difficulty: "medium" },
  { id: "Q035", category: "คณิตประยุกต์", question: "กล่องละ 12 ชิ้น ซื้อ 5 กล่อง รวมกี่ชิ้น?", choiceA: "60 ชิ้น", choiceB: "55 ชิ้น", answer: "A", difficulty: "easy" },
  { id: "Q036", category: "คณิตประยุกต์", question: "ขายของชิ้นละ 250 บาท ลูกค้าซื้อ 4 ชิ้น จ่ายแบงก์พัน ต้องทอนเท่าไร?", choiceA: "ทอน 100 บาท", choiceB: "ไม่ต้องทอนเลย", answer: "B", difficulty: "medium" },
  { id: "Q037", category: "คณิตประยุกต์", question: "สินค้า 1,000 บาท ลด 10% แล้วลดซ้ำอีก 10% เหลือเท่าไร?", choiceA: "810 บาท", choiceB: "800 บาท", answer: "A", difficulty: "hard" },
  { id: "Q038", category: "คณิตประยุกต์", question: "กาแฟแก้วละ 45 บาท ซื้อ 3 แก้ว จ่าย 150 ได้ทอนเท่าไร?", choiceA: "25 บาท", choiceB: "15 บาท", answer: "B", difficulty: "easy" },
  { id: "Q039", category: "คณิตประยุกต์", question: "เป้ายอดขายเดือนนี้ 90,000 ขายได้แล้ว 63,000 ต้องขายอีกเท่าไร?", choiceA: "27,000 บาท", choiceB: "37,000 บาท", answer: "A", difficulty: "easy" },
  { id: "Q040", category: "คณิตประยุกต์", question: "คอมมิชชั่น 5% จากยอดขาย 40,000 บาท ได้เท่าไร?", choiceA: "2,500 บาท", choiceB: "2,000 บาท", answer: "B", difficulty: "medium" },
  { id: "Q041", category: "คณิตประยุกต์", question: "โปรซื้อ 2 แถม 1 อยากได้ของ 9 ชิ้น ต้องจ่ายเงินกี่ชิ้น?", choiceA: "6 ชิ้น", choiceB: "7 ชิ้น", answer: "A", difficulty: "medium" },
  { id: "Q042", category: "คณิตประยุกต์", question: "น้ำขวดละ 12 บาท มีโปร 3 ขวด 30 บาท ถ้าซื้อ 6 ขวดแบบโปร ประหยัดกว่าซื้อทีละขวดเท่าไร?", choiceA: "6 บาท", choiceB: "12 บาท", answer: "B", difficulty: "hard" },
  { id: "Q043", category: "คณิตประยุกต์", question: "ประชุมเริ่ม 13:45 ใช้เวลา 90 นาที เลิกกี่โมง?", choiceA: "15:15", choiceB: "15:30", answer: "A", difficulty: "medium" },
  { id: "Q044", category: "คณิตประยุกต์", question: "แบ่งลูกค้า 132 รายให้เซลส์ 11 คนเท่าๆ กัน ได้คนละกี่ราย?", choiceA: "11 ราย", choiceB: "12 ราย", answer: "B", difficulty: "medium" },
  { id: "Q045", category: "คณิตประยุกต์", question: "สินค้าราคา 100 บาท บวก VAT 7% ต้องจ่ายเท่าไร?", choiceA: "170 บาท", choiceB: "107 บาท", answer: "B", difficulty: "easy" },
  { id: "Q046", category: "คณิตประยุกต์", question: "ซื้อของ 856 บาท จ่ายแบงก์พัน ได้ทอนเท่าไร?", choiceA: "144 บาท", choiceB: "154 บาท", answer: "A", difficulty: "medium" },
  { id: "Q047", category: "คณิตประยุกต์", question: "ทำงาน 9:00–18:00 พักเที่ยง 1 ชม. ทำงานจริงกี่ชั่วโมง?", choiceA: "8 ชั่วโมง", choiceB: "9 ชั่วโมง", answer: "A", difficulty: "easy" },
  { id: "Q048", category: "คณิตประยุกต์", question: "ซื้อมา 70 ขายไป 100 ได้กำไรกี่เปอร์เซ็นต์ของทุน?", choiceA: "30%", choiceB: "ประมาณ 43%", answer: "B", difficulty: "hard" },
  { id: "Q049", category: "คณิตประยุกต์", question: "ผ่อน 0% นาน 10 เดือน ราคา 15,000 บาท ผ่อนเดือนละเท่าไร?", choiceA: "1,500 บาท", choiceB: "1,050 บาท", answer: "A", difficulty: "easy" },
  { id: "Q050", category: "คณิตประยุกต์", question: "วันที่ 1 เป็นวันศุกร์ แล้ววันที่ 15 เดือนเดียวกันเป็นวันอะไร?", choiceA: "วันเสาร์", choiceB: "วันศุกร์", answer: "B", difficulty: "medium" },
  { id: "Q051", category: "คณิตประยุกต์", question: "ยอดขายโต 100% จากเดือนก่อน แปลว่าอะไร?", choiceA: "เพิ่มเป็น 2 เท่าของเดิม", choiceB: "เพิ่มขึ้นครึ่งหนึ่งของเดิม", answer: "A", difficulty: "medium" },
  { id: "Q052", category: "คณิตประยุกต์", question: "แท็กซี่เริ่มต้น 35 บาท คิดเพิ่ม กม.ละ 6 บาท นั่งไป 10 กม. จ่ายเท่าไร?", choiceA: "89 บาท", choiceB: "95 บาท", answer: "B", difficulty: "medium" },
  { id: "Q053", category: "คณิตประยุกต์", question: "พิซซ่า 3 ถาด ถาดละ 8 ชิ้น กินไป 20 ชิ้น เหลือกี่ชิ้น?", choiceA: "4 ชิ้น", choiceB: "6 ชิ้น", answer: "A", difficulty: "easy" },
  { id: "Q054", category: "คณิตประยุกต์", question: "อัตราแลกเปลี่ยน 1 ดอลลาร์ = 35 บาท มีเงิน 700 บาท แลกได้กี่ดอลลาร์?", choiceA: "25 ดอลลาร์", choiceB: "20 ดอลลาร์", answer: "B", difficulty: "easy" },
  { id: "Q055", category: "คณิตประยุกต์", question: "เดินนาทีละ 80 เมตร เดิน 15 นาที ได้ระยะทางกี่กิโลเมตร?", choiceA: "1.2 กม.", choiceB: "1.5 กม.", answer: "A", difficulty: "medium" },
  { id: "Q056", category: "คณิตประยุกต์", question: "ห้องประชุมจุ 40 คน มีทีมมา 3 ทีม ทีมละ 11, 12 และ 13 คน ที่นั่งพอไหม?", choiceA: "ไม่พอ ขาด 4 ที่", choiceB: "พอ และเหลืออีก 4 ที่", answer: "B", difficulty: "medium" },
  { id: "Q057", category: "คณิตประยุกต์", question: "ของลดราคา 30% จ่ายไป 210 บาท ราคาเต็มคือเท่าไร?", choiceA: "300 บาท", choiceB: "273 บาท", answer: "A", difficulty: "hard" },
  { id: "Q058", category: "คณิตประยุกต์", question: "นาฬิกาเดินช้า 5 นาทีทุก 1 ชั่วโมง ผ่านไป 6 ชั่วโมงจริง นาฬิกาช้าไปกี่นาที?", choiceA: "35 นาที", choiceB: "30 นาที", answer: "B", difficulty: "medium" },

  // ── อนุกรม/ลำดับ (Q059–Q085) ──
  { id: "Q059", category: "อนุกรม/ลำดับ", question: "2, 4, 8, 16, ?", choiceA: "32", choiceB: "24", answer: "A", difficulty: "easy" },
  { id: "Q060", category: "อนุกรม/ลำดับ", question: "1, 1, 2, 3, 5, 8, ?", choiceA: "11", choiceB: "13", answer: "B", difficulty: "medium" },
  { id: "Q061", category: "อนุกรม/ลำดับ", question: "3, 6, 9, 12, ?", choiceA: "14", choiceB: "15", answer: "B", difficulty: "easy" },
  { id: "Q062", category: "อนุกรม/ลำดับ", question: "1, 4, 9, 16, ?", choiceA: "25", choiceB: "20", answer: "A", difficulty: "medium" },
  { id: "Q063", category: "อนุกรม/ลำดับ", question: "100, 90, 80, ?", choiceA: "70", choiceB: "75", answer: "A", difficulty: "easy" },
  { id: "Q064", category: "อนุกรม/ลำดับ", question: "5, 10, 20, 40, ?", choiceA: "60", choiceB: "80", answer: "B", difficulty: "easy" },
  { id: "Q065", category: "อนุกรม/ลำดับ", question: "1, 3, 5, 7, ?", choiceA: "9", choiceB: "8", answer: "A", difficulty: "easy" },
  { id: "Q066", category: "อนุกรม/ลำดับ", question: "81, 27, 9, ?", choiceA: "6", choiceB: "3", answer: "B", difficulty: "medium" },
  { id: "Q067", category: "อนุกรม/ลำดับ", question: "2, 5, 10, 17, ?", choiceA: "26", choiceB: "24", answer: "A", difficulty: "hard" },
  { id: "Q068", category: "อนุกรม/ลำดับ", question: "1, 2, 4, 7, 11, ?", choiceA: "15", choiceB: "16", answer: "B", difficulty: "hard" },
  { id: "Q069", category: "อนุกรม/ลำดับ", question: "Z, X, V, T, ?", choiceA: "R", choiceB: "S", answer: "A", difficulty: "medium" },
  { id: "Q070", category: "อนุกรม/ลำดับ", question: "7, 14, 28, 56, ?", choiceA: "84", choiceB: "112", answer: "B", difficulty: "easy" },
  { id: "Q071", category: "อนุกรม/ลำดับ", question: "64, 32, 16, 8, ?", choiceA: "4", choiceB: "6", answer: "A", difficulty: "easy" },
  { id: "Q072", category: "อนุกรม/ลำดับ", question: "1, 8, 27, 64, ?", choiceA: "100", choiceB: "125", answer: "B", difficulty: "hard" },
  { id: "Q073", category: "อนุกรม/ลำดับ", question: "5, 8, 11, 14, ?", choiceA: "17", choiceB: "16", answer: "A", difficulty: "easy" },
  { id: "Q074", category: "อนุกรม/ลำดับ", question: "2, 6, 18, 54, ?", choiceA: "108", choiceB: "162", answer: "B", difficulty: "medium" },
  { id: "Q075", category: "อนุกรม/ลำดับ", question: "1, 2, 6, 24, 120, ?", choiceA: "720", choiceB: "600", answer: "A", difficulty: "hard" },
  { id: "Q076", category: "อนุกรม/ลำดับ", question: "3, 4, 6, 9, 13, ?", choiceA: "17", choiceB: "18", answer: "B", difficulty: "medium" },
  { id: "Q077", category: "อนุกรม/ลำดับ", question: "1, 10, 100, 1,000, ?", choiceA: "2,000", choiceB: "10,000", answer: "B", difficulty: "easy" },
  { id: "Q078", category: "อนุกรม/ลำดับ", question: "จันทร์, พุธ, ศุกร์, ?", choiceA: "อาทิตย์", choiceB: "เสาร์", answer: "A", difficulty: "medium" },
  { id: "Q079", category: "อนุกรม/ลำดับ", question: "2, 3, 5, 7, 11, ?", choiceA: "13", choiceB: "12", answer: "A", difficulty: "hard" },
  { id: "Q080", category: "อนุกรม/ลำดับ", question: "1, 4, 2, 5, 3, 6, ?", choiceA: "7", choiceB: "4", answer: "B", difficulty: "hard" },
  { id: "Q081", category: "อนุกรม/ลำดับ", question: "100, 99, 97, 94, 90, ?", choiceA: "85", choiceB: "86", answer: "A", difficulty: "medium" },
  { id: "Q082", category: "อนุกรม/ลำดับ", question: "ม.ค., มี.ค., พ.ค., ?", choiceA: "มิ.ย.", choiceB: "ก.ค.", answer: "B", difficulty: "easy" },
  { id: "Q083", category: "อนุกรม/ลำดับ", question: "11, 22, 33, 44, ?", choiceA: "55", choiceB: "54", answer: "A", difficulty: "easy" },
  { id: "Q084", category: "อนุกรม/ลำดับ", question: "8, 6, 9, 7, 10, 8, ?", choiceA: "9", choiceB: "11", answer: "B", difficulty: "hard" },
  { id: "Q085", category: "อนุกรม/ลำดับ", question: "2, 4, 12, 48, ?", choiceA: "240", choiceB: "96", answer: "A", difficulty: "hard" },

  // ── ตรรกะ & เชาว์ (Q086–Q115) ──
  { id: "Q086", category: "ตรรกะ & เชาว์", question: "ถ้าวันนี้วันพุธ อีก 3 วันเป็นวันอะไร?", choiceA: "เสาร์", choiceB: "อาทิตย์", answer: "A", difficulty: "easy" },
  { id: "Q087", category: "ตรรกะ & เชาว์", question: "รถบัสมีคน 20 คน ลงไป 5 ขึ้นมา 3 เหลือกี่คน?", choiceA: "22 คน", choiceB: "18 คน", answer: "B", difficulty: "easy" },
  { id: "Q088", category: "ตรรกะ & เชาว์", question: "แม่ของแอนมีลูก 3 คน คนแรกชื่อเมษา คนสองชื่อพฤษภา คนที่สามชื่ออะไร?", choiceA: "มิถุนา", choiceB: "แอน", answer: "B", difficulty: "medium" },
  { id: "Q089", category: "ตรรกะ & เชาว์", question: "อะไรยิ่งเอาออกยิ่งใหญ่ขึ้น?", choiceA: "หลุม", choiceB: "ลูกโป่ง", answer: "A", difficulty: "easy" },
  { id: "Q090", category: "ตรรกะ & เชาว์", question: "1 ปีมีกี่เดือนที่มีวันที่ 28?", choiceA: "12 เดือน", choiceB: "1 เดือน", answer: "A", difficulty: "medium" },
  { id: "Q091", category: "ตรรกะ & เชาว์", question: "คุณวิ่งแซงคนที่อยู่อันดับ 2 ตอนนี้คุณอยู่อันดับอะไร?", choiceA: "ที่ 1", choiceB: "ที่ 2", answer: "B", difficulty: "medium" },
  { id: "Q092", category: "ตรรกะ & เชาว์", question: "ไก่ตัวผู้ออกไข่บนหลังคา ไข่จะกลิ้งไปทางไหน?", choiceA: "กลิ้งลงด้านลาด", choiceB: "ไม่มีไข่ เพราะไก่ตัวผู้ออกไข่ไม่ได้", answer: "B", difficulty: "easy" },
  { id: "Q093", category: "ตรรกะ & เชาว์", question: "คำว่า \"strawberry\" มีตัว R กี่ตัว?", choiceA: "3 ตัว", choiceB: "2 ตัว", answer: "A", difficulty: "medium" },
  { id: "Q094", category: "ตรรกะ & เชาว์", question: "หมอให้กินยา 3 เม็ด กินทุกครึ่งชั่วโมง กินครบใช้เวลากี่นาที?", choiceA: "90 นาที", choiceB: "60 นาที", answer: "B", difficulty: "hard" },
  { id: "Q095", category: "ตรรกะ & เชาว์", question: "อะไรมีแต่ขึ้น ไม่เคยลง?", choiceA: "อายุ", choiceB: "ราคาทอง", answer: "A", difficulty: "easy" },
  { id: "Q096", category: "ตรรกะ & เชาว์", question: "นกเกาะสายไฟ 8 ตัว ถูกยิงตกไป 1 ตัว เหลือนกบนสายไฟกี่ตัว?", choiceA: "7 ตัว", choiceB: "0 ตัว เพราะที่เหลือบินหนีหมด", answer: "B", difficulty: "medium" },
  { id: "Q097", category: "ตรรกะ & เชาว์", question: "อะไรที่ยิ่งเปียก ตอนกำลังทำให้อย่างอื่นแห้ง?", choiceA: "ผ้าเช็ดตัว", choiceB: "ไดร์เป่าผม", answer: "A", difficulty: "medium" },
  { id: "Q098", category: "ตรรกะ & เชาว์", question: "มีไม้ขีด 1 ก้าน เข้าห้องมืดที่มีเตาผิง ตะเกียง และเทียน ต้องจุดอะไรก่อน?", choiceA: "ตะเกียง", choiceB: "ไม้ขีด", answer: "B", difficulty: "easy" },
  { id: "Q099", category: "ตรรกะ & เชาว์", question: "พ่อกับลูกหนักรวม 100 กก. ลูกหนักครึ่งหนึ่งของพ่อ พ่อหนักเท่าไร?", choiceA: "ประมาณ 66.7 กก.", choiceB: "50 กก.", answer: "A", difficulty: "hard" },
  { id: "Q100", category: "ตรรกะ & เชาว์", question: "พ่อของลูกสาวของฉัน คือใครของฉัน?", choiceA: "พ่อของฉัน", choiceB: "สามีของฉัน", answer: "B", difficulty: "medium" },
  { id: "Q101", category: "ตรรกะ & เชาว์", question: "\"เมื่อวานของพรุ่งนี้\" คือวันไหน?", choiceA: "วันนี้", choiceB: "เมื่อวาน", answer: "A", difficulty: "medium" },
  { id: "Q102", category: "ตรรกะ & เชาว์", question: "ถ้าเมื่อวานคือวันศุกร์ มะรืนนี้คือวันอะไร?", choiceA: "อาทิตย์", choiceB: "จันทร์", answer: "B", difficulty: "hard" },
  { id: "Q103", category: "ตรรกะ & เชาว์", question: "เวลา 15:15 น. เข็มสั้นกับเข็มยาวทับกันพอดีหรือไม่?", choiceA: "ไม่ทับ เพราะเข็มสั้นขยับเลยเลข 3 ไปแล้ว", choiceB: "ทับกันพอดีที่เลข 3", answer: "A", difficulty: "hard" },
  { id: "Q104", category: "ตรรกะ & เชาว์", question: "บนโต๊ะมีแอปเปิล 3 ผล คุณหยิบไป 2 ผล คุณมีแอปเปิลกี่ผล?", choiceA: "2 ผล", choiceB: "1 ผล", answer: "A", difficulty: "easy" },
  { id: "Q105", category: "ตรรกะ & เชาว์", question: "A สูงกว่า B และ B สูงกว่า C ใครเตี้ยที่สุด?", choiceA: "B", choiceB: "C", answer: "B", difficulty: "easy" },
  { id: "Q106", category: "ตรรกะ & เชาว์", question: "6 หารด้วยครึ่ง (1/2) แล้วบวก 3 = ?", choiceA: "6", choiceB: "15", answer: "B", difficulty: "hard" },
  { id: "Q107", category: "ตรรกะ & เชาว์", question: "เค้กกลม 1 ก้อน ตัดเป็นเส้นตรง 3 ครั้ง ให้ได้ 8 ชิ้น ทำได้ไหม?", choiceA: "ได้ ผ่ากากบาท 2 ครั้ง แล้วผ่าแนวนอนอีก 1 ครั้ง", choiceB: "ไม่ได้ อย่างมากได้แค่ 6 ชิ้น", answer: "A", difficulty: "hard" },
  { id: "Q108", category: "ตรรกะ & เชาว์", question: "ในการแข่งวิ่ง คุณแซง \"คนสุดท้าย\" ได้ไหม?", choiceA: "ได้ ถ้าวิ่งเร็วพอ", choiceB: "ไม่ได้ เพราะถ้าคุณอยู่หลังเขา เขาก็ไม่ใช่คนสุดท้าย", answer: "B", difficulty: "hard" },
  { id: "Q109", category: "ตรรกะ & เชาว์", question: "บ้านหนึ่งมีลูกสาว 6 คน ลูกสาวทุกคนมีน้องชายคนเดียวกัน 1 คน รวมพ่อแม่ด้วย บ้านนี้มีกี่คน?", choiceA: "9 คน", choiceB: "14 คน", answer: "A", difficulty: "hard" },
  { id: "Q110", category: "ตรรกะ & เชาว์", question: "อะไรยิ่งใช้ล้าง ตัวเองยิ่งสกปรก?", choiceA: "สบู่", choiceB: "น้ำ", answer: "B", difficulty: "medium" },
  { id: "Q111", category: "ตรรกะ & เชาว์", question: "อะไรพูดได้ทุกภาษาในโลก?", choiceA: "เสียงสะท้อน", choiceB: "นกแก้ว", answer: "A", difficulty: "medium" },
  { id: "Q112", category: "ตรรกะ & เชาว์", question: "อะไรยิ่งใช้บ่อยยิ่งคม?", choiceA: "มีด", choiceB: "สมอง", answer: "B", difficulty: "medium" },
  { id: "Q113", category: "ตรรกะ & เชาว์", question: "ห้องอะไรไม่มีประตูให้เดินเข้า?", choiceA: "ห้องหัวใจ", choiceB: "ห้องเย็น", answer: "A", difficulty: "medium" },
  { id: "Q114", category: "ตรรกะ & เชาว์", question: "เขียนเลข 1 ถึง 100 จะเขียนเลข 9 ทั้งหมดกี่ตัว?", choiceA: "19 ตัว", choiceB: "20 ตัว", answer: "B", difficulty: "hard" },
  { id: "Q115", category: "ตรรกะ & เชาว์", question: "กล่องมีลูกบอลแดง 3 ขาว 3 หยิบโดยไม่มองอย่างน้อยกี่ลูก จึงมั่นใจว่าได้ลูกแดงแน่ๆ 1 ลูก?", choiceA: "4 ลูก", choiceB: "2 ลูก", answer: "A", difficulty: "hard" },

  // ── เชาว์ภาษา/คำ (Q116–Q143) ──
  { id: "Q116", category: "เชาว์ภาษา/คำ", question: "คำว่า \"มะม่วง\" มีกี่พยางค์?", choiceA: "3 พยางค์", choiceB: "2 พยางค์", answer: "B", difficulty: "easy" },
  { id: "Q117", category: "เชาว์ภาษา/คำ", question: "คำไหนสะกดถูก?", choiceA: "อนุญาต", choiceB: "อนุญาติ", answer: "A", difficulty: "medium" },
  { id: "Q118", category: "เชาว์ภาษา/คำ", question: "คำไหนสะกดถูก?", choiceA: "กระเพรา", choiceB: "กะเพรา", answer: "B", difficulty: "medium" },
  { id: "Q119", category: "เชาว์ภาษา/คำ", question: "\"ค\" เป็นพยัญชนะไทยตัวที่เท่าไร?", choiceA: "ตัวที่ 4", choiceB: "ตัวที่ 5", answer: "A", difficulty: "hard" },
  { id: "Q120", category: "เชาว์ภาษา/คำ", question: "คำไหนสะกดถูก?", choiceA: "ผัดไท", choiceB: "ผัดไทย", answer: "B", difficulty: "medium" },
  { id: "Q121", category: "เชาว์ภาษา/คำ", question: "คำไหนเป็นคำควบกล้ำแท้?", choiceA: "กลอง", choiceB: "จริง", answer: "A", difficulty: "hard" },
  { id: "Q122", category: "เชาว์ภาษา/คำ", question: "คำไหนสะกดถูก?", choiceA: "สังเกต", choiceB: "สังเกตุ", answer: "A", difficulty: "medium" },
  { id: "Q123", category: "เชาว์ภาษา/คำ", question: "ประโยคไหนใช้คำลงท้ายถูกต้อง?", choiceA: "ขอบคุณคะ", choiceB: "ขอบคุณค่ะ", answer: "B", difficulty: "medium" },
  { id: "Q124", category: "เชาว์ภาษา/คำ", question: "คำไหนสะกดถูก?", choiceA: "โอกาศ", choiceB: "โอกาส", answer: "B", difficulty: "medium" },
  { id: "Q125", category: "เชาว์ภาษา/คำ", question: "ตามราชบัณฑิตฯ คำไหนสะกดถูก?", choiceA: "อีเมล", choiceB: "อีเมล์", answer: "A", difficulty: "hard" },
  { id: "Q126", category: "เชาว์ภาษา/คำ", question: "คำไหนสะกดถูก?", choiceA: "เว็ปไซด์", choiceB: "เว็บไซต์", answer: "B", difficulty: "medium" },
  { id: "Q127", category: "เชาว์ภาษา/คำ", question: "คำไหนสะกดถูก?", choiceA: "ลายเซ็น", choiceB: "ลายเซ็นต์", answer: "A", difficulty: "hard" },
  { id: "Q128", category: "เชาว์ภาษา/คำ", question: "สำนวนไหนเขียนถูก?", choiceA: "ผลัดวันประกันพรุ่ง", choiceB: "ผัดวันประกันพรุ่ง", answer: "B", difficulty: "hard" },
  { id: "Q129", category: "เชาว์ภาษา/คำ", question: "คำไหนสะกดถูก?", choiceA: "คำนวณ", choiceB: "คำนวน", answer: "A", difficulty: "medium" },
  { id: "Q130", category: "เชาว์ภาษา/คำ", question: "สำนวน \"หมูไปไก่มา\" หมายถึงอะไร?", choiceA: "ทะเลาะกันไปมาไม่จบ", choiceB: "ต่างฝ่ายต่างตอบแทนน้ำใจกัน", answer: "B", difficulty: "medium" },
  { id: "Q131", category: "เชาว์ภาษา/คำ", question: "สำนวน \"จับปลาสองมือ\" หมายถึงอะไร?", choiceA: "ทำหลายอย่างพร้อมกันจนเสี่ยงพลาดหมด", choiceB: "เก่งรอบด้านทำได้หลายอย่าง", answer: "A", difficulty: "easy" },
  { id: "Q132", category: "เชาว์ภาษา/คำ", question: "สำนวน \"น้ำขึ้นให้รีบตัก\" หมายถึงอะไร?", choiceA: "อย่าโลภเกินตัว", choiceB: "มีโอกาสแล้วให้รีบคว้าไว้", answer: "B", difficulty: "easy" },
  { id: "Q133", category: "เชาว์ภาษา/คำ", question: "คำไหนตรงข้ามกับ \"ประหยัด\" ที่สุด?", choiceA: "สุรุ่ยสุร่าย", choiceB: "ขี้เหนียว", answer: "A", difficulty: "medium" },
  { id: "Q134", category: "เชาว์ภาษา/คำ", question: "\"ราชบุรี\" อ่านอย่างไร?", choiceA: "ราด-บุ-รี", choiceB: "ราด-ชะ-บุ-รี", answer: "B", difficulty: "medium" },
  { id: "Q135", category: "เชาว์ภาษา/คำ", question: "ลักษณนามของ \"ช้างบ้าน\" คืออะไร?", choiceA: "เชือก", choiceB: "ตัว", answer: "A", difficulty: "medium" },
  { id: "Q136", category: "เชาว์ภาษา/คำ", question: "ลักษณนามของ \"เลื่อย\" คืออะไร?", choiceA: "ปื้น", choiceB: "ด้าม", answer: "A", difficulty: "hard" },
  { id: "Q137", category: "เชาว์ภาษา/คำ", question: "คำไหนสะกดถูก?", choiceA: "กระทันหัน", choiceB: "กะทันหัน", answer: "B", difficulty: "hard" },
  { id: "Q138", category: "เชาว์ภาษา/คำ", question: "คำไหนสะกดถูก?", choiceA: "บิณฑบาตร", choiceB: "บิณฑบาต", answer: "B", difficulty: "hard" },
  { id: "Q139", category: "เชาว์ภาษา/คำ", question: "คำที่ใช้ \"ไม้ม้วน (ใ)\" ในภาษาไทยมีทั้งหมดกี่คำ?", choiceA: "20 คำ", choiceB: "24 คำ", answer: "A", difficulty: "hard" },
  { id: "Q140", category: "เชาว์ภาษา/คำ", question: "พยัญชนะไทยมีทั้งหมดกี่ตัว?", choiceA: "42 ตัว", choiceB: "44 ตัว", answer: "B", difficulty: "easy" },
  { id: "Q141", category: "เชาว์ภาษา/คำ", question: "คำไหนสะกดถูก?", choiceA: "อะไหล่", choiceB: "อะหลั่ย", answer: "A", difficulty: "medium" },
  { id: "Q142", category: "เชาว์ภาษา/คำ", question: "ตามราชบัณฑิตฯ คำไหนสะกดถูก?", choiceA: "โควต้า", choiceB: "โควตา", answer: "B", difficulty: "hard" },
  { id: "Q143", category: "เชาว์ภาษา/คำ", question: "คำไหนสะกดถูก?", choiceA: "รสชาติ", choiceB: "รสชาด", answer: "A", difficulty: "medium" },

  // ── ความรู้รอบตัว (Q144–Q172) ──
  { id: "Q144", category: "ความรู้รอบตัว", question: "ดาวเคราะห์ที่อยู่ใกล้ดวงอาทิตย์ที่สุดคือ?", choiceA: "ดาวศุกร์", choiceB: "ดาวพุธ", answer: "B", difficulty: "medium" },
  { id: "Q145", category: "ความรู้รอบตัว", question: "น้ำเดือดที่กี่องศาเซลเซียส (ที่ระดับน้ำทะเล)?", choiceA: "100 องศา", choiceB: "90 องศา", answer: "A", difficulty: "easy" },
  { id: "Q146", category: "ความรู้รอบตัว", question: "ทวีปที่ใหญ่ที่สุดในโลกคือ?", choiceA: "แอฟริกา", choiceB: "เอเชีย", answer: "B", difficulty: "easy" },
  { id: "Q147", category: "ความรู้รอบตัว", question: "สีน้ำเงินผสมสีเหลือง ได้สีอะไร?", choiceA: "เขียว", choiceB: "ม่วง", answer: "A", difficulty: "easy" },
  { id: "Q148", category: "ความรู้รอบตัว", question: "สัตว์บกที่ตัวใหญ่ที่สุดในโลกคือ?", choiceA: "แรดขาว", choiceB: "ช้างแอฟริกา", answer: "B", difficulty: "easy" },
  { id: "Q149", category: "ความรู้รอบตัว", question: "1 กิโลกรัม เท่ากับกี่กรัม?", choiceA: "1,000 กรัม", choiceB: "100 กรัม", answer: "A", difficulty: "easy" },
  { id: "Q150", category: "ความรู้รอบตัว", question: "หัวใจคนเรามีกี่ห้อง?", choiceA: "2 ห้อง", choiceB: "4 ห้อง", answer: "B", difficulty: "medium" },
  { id: "Q151", category: "ความรู้รอบตัว", question: "ประเทศไทยมีกี่จังหวัด (นับรวม กทม.)?", choiceA: "77 จังหวัด", choiceB: "76 จังหวัด", answer: "A", difficulty: "medium" },
  { id: "Q152", category: "ความรู้รอบตัว", question: "มหาสมุทรที่ใหญ่ที่สุดในโลกคือ?", choiceA: "แปซิฟิก", choiceB: "แอตแลนติก", answer: "A", difficulty: "medium" },
  { id: "Q153", category: "ความรู้รอบตัว", question: "1 ชั่วโมงมีกี่วินาที?", choiceA: "6,000 วินาที", choiceB: "3,600 วินาที", answer: "B", difficulty: "medium" },
  { id: "Q154", category: "ความรู้รอบตัว", question: "ธาตุที่มีสัญลักษณ์ O คือ?", choiceA: "ทองคำ", choiceB: "ออกซิเจน", answer: "B", difficulty: "easy" },
  { id: "Q155", category: "ความรู้รอบตัว", question: "มุมภายในของสามเหลี่ยมรวมกันได้กี่องศา?", choiceA: "180 องศา", choiceB: "360 องศา", answer: "A", difficulty: "medium" },
  { id: "Q156", category: "ความรู้รอบตัว", question: "ดวงจันทร์โคจรรอบอะไร?", choiceA: "ดวงอาทิตย์", choiceB: "โลก", answer: "B", difficulty: "easy" },
  { id: "Q157", category: "ความรู้รอบตัว", question: "เลือดคนเราสีแดงเพราะมีธาตุอะไรเป็นส่วนประกอบ?", choiceA: "เหล็ก", choiceB: "ทองแดง", answer: "A", difficulty: "hard" },
  { id: "Q158", category: "ความรู้รอบตัว", question: "ก่อนกรุงเทพฯ เมืองหลวงของไทยคือที่ไหน?", choiceA: "อยุธยา", choiceB: "กรุงธนบุรี", answer: "B", difficulty: "hard" },
  { id: "Q159", category: "ความรู้รอบตัว", question: "แม่น้ำสายหลักที่ไหลผ่านกรุงเทพฯ คือ?", choiceA: "เจ้าพระยา", choiceB: "ท่าจีน", answer: "A", difficulty: "easy" },
  { id: "Q160", category: "ความรู้รอบตัว", question: "ธนบัตรใบละ 100 บาท เป็นสีอะไร?", choiceA: "ม่วง", choiceB: "แดง", answer: "B", difficulty: "easy" },
  { id: "Q161", category: "ความรู้รอบตัว", question: "วันสงกรานต์เริ่มวันที่ 13 ของเดือนอะไร?", choiceA: "เมษายน", choiceB: "พฤษภาคม", answer: "A", difficulty: "easy" },
  { id: "Q162", category: "ความรู้รอบตัว", question: "สัตว์ที่วิ่งเร็วที่สุดบนบกคือ?", choiceA: "ม้าแข่ง", choiceB: "เสือชีตาห์", answer: "B", difficulty: "medium" },
  { id: "Q163", category: "ความรู้รอบตัว", question: "ประเทศเพื่อนบ้านอาเซียนข้อไหนไม่มีชายแดนติดไทย?", choiceA: "เวียดนาม", choiceB: "กัมพูชา", answer: "A", difficulty: "medium" },
  { id: "Q164", category: "ความรู้รอบตัว", question: "1 โหล มีกี่ชิ้น?", choiceA: "10 ชิ้น", choiceB: "12 ชิ้น", answer: "B", difficulty: "easy" },
  { id: "Q165", category: "ความรู้รอบตัว", question: "ปีอธิกสุรทิน เดือนกุมภาพันธ์มีกี่วัน?", choiceA: "29 วัน", choiceB: "28 วัน", answer: "A", difficulty: "easy" },
  { id: "Q166", category: "ความรู้รอบตัว", question: "อวัยวะที่ใหญ่ที่สุดของร่างกายมนุษย์คือ?", choiceA: "ตับ", choiceB: "ผิวหนัง", answer: "B", difficulty: "hard" },
  { id: "Q167", category: "ความรู้รอบตัว", question: "ทำไมน้ำแข็งถึงลอยน้ำได้?", choiceA: "ความหนาแน่นน้อยกว่าน้ำ", choiceB: "อุณหภูมิต่ำกว่าน้ำ", answer: "A", difficulty: "medium" },
  { id: "Q168", category: "ความรู้รอบตัว", question: "ภูเขาที่สูงที่สุดในโลกคือ?", choiceA: "เอเวอเรสต์", choiceB: "ภูเขาไฟฟูจิ", answer: "A", difficulty: "easy" },
  { id: "Q169", category: "ความรู้รอบตัว", question: "สกุลเงินของประเทศญี่ปุ่นคือ?", choiceA: "หยวน", choiceB: "เยน", answer: "B", difficulty: "easy" },
  { id: "Q170", category: "ความรู้รอบตัว", question: "จุดใต้สุดของประเทศไทยอยู่ที่จังหวัดอะไร?", choiceA: "นราธิวาส", choiceB: "ยะลา (อ.เบตง)", answer: "B", difficulty: "hard" },
  { id: "Q171", category: "ความรู้รอบตัว", question: "ผู้ใหญ่มีฟันแท้ครบทั้งหมดกี่ซี่ (รวมฟันคุด)?", choiceA: "32 ซี่", choiceB: "28 ซี่", answer: "A", difficulty: "hard" },
  { id: "Q172", category: "ความรู้รอบตัว", question: "ดาวเคราะห์ที่ถูกเรียกว่า \"ดาวสีแดง\" คือ?", choiceA: "ดาวพฤหัสบดี", choiceB: "ดาวอังคาร", answer: "B", difficulty: "easy" },

  // ── ชุดเสริม Q173–Q200 (แทนหมวดกับดัก/ฮาๆ เดิม — กระจายลง 4 หมวดหลัก) ──
  // คณิตประยุกต์เสริม (Q173–Q180)
  { id: "Q173", category: "คณิตประยุกต์", question: "สินค้าราคา 200 บาท โปร ก. ลดทันที 50 บาท โปร ข. ลด 20% เลือกโปรไหนจ่ายถูกกว่า?", choiceA: "โปร ก. ลด 50 บาท", choiceB: "โปร ข. ลด 20%", answer: "A", difficulty: "easy" },
  { id: "Q174", category: "คณิตประยุกต์", question: "ฝากเงิน 10,000 บาท ดอกเบี้ย 2% ต่อปี ครบ 1 ปีได้ดอกเบี้ยเท่าไร?", choiceA: "2,000 บาท", choiceB: "200 บาท", answer: "B", difficulty: "easy" },
  { id: "Q175", category: "คณิตประยุกต์", question: "ครีมจัดโปร 3 กระปุก 500 บาท ลูกค้าซื้อ 12 กระปุก ต้องจ่ายเท่าไร?", choiceA: "2,000 บาท", choiceB: "2,400 บาท", answer: "A", difficulty: "easy" },
  { id: "Q176", category: "คณิตประยุกต์", question: "โทรหาลูกค้า 40 สาย ปิดการขายได้ 15% ของสายทั้งหมด ปิดได้กี่ราย?", choiceA: "8 ราย", choiceB: "6 ราย", answer: "B", difficulty: "easy" },
  { id: "Q177", category: "คณิตประยุกต์", question: "สินค้าทุน 400 บาท ต้องตั้งราคาขายเท่าไรจึงได้กำไร 25% ของทุน?", choiceA: "500 บาท", choiceB: "425 บาท", answer: "A", difficulty: "medium" },
  { id: "Q178", category: "คณิตประยุกต์", question: "เป้าเดือนนี้ 120,000 บาท ขายได้แล้ว 45,000 บาท คิดเป็นกี่เปอร์เซ็นต์ของเป้า?", choiceA: "45%", choiceB: "37.5%", answer: "B", difficulty: "medium" },
  { id: "Q179", category: "คณิตประยุกต์", question: "รับสินค้ามาชิ้นละ 20 บาท ขายชิ้นละ 35 บาท ขายได้วันละ 8 ชิ้น ได้กำไรวันละเท่าไร?", choiceA: "160 บาท", choiceB: "120 บาท", answer: "B", difficulty: "medium" },
  { id: "Q180", category: "คณิตประยุกต์", question: "สินค้าราคารวม VAT 7% แล้วเป็น 214 บาท ราคาก่อน VAT คือเท่าไร?", choiceA: "200 บาท", choiceB: "207 บาท", answer: "A", difficulty: "hard" },
  // ตรรกะ & เชาว์เสริม (Q181–Q188)
  { id: "Q181", category: "ตรรกะ & เชาว์", question: "ก้อยนั่งฝั่งซ้ายของแนน และแนนนั่งฝั่งซ้ายของบี ใครนั่งขวาสุด?", choiceA: "บี", choiceB: "แนน", answer: "A", difficulty: "easy" },
  { id: "Q182", category: "ตรรกะ & เชาว์", question: "แมว 3 ตัวจับหนูได้ 3 ตัวใน 3 นาที แล้วแมว 6 ตัวจับหนู 6 ตัว ใช้เวลากี่นาที?", choiceA: "6 นาที", choiceB: "3 นาที", answer: "B", difficulty: "medium" },
  { id: "Q183", category: "ตรรกะ & เชาว์", question: "เชือกยาว 12 เมตร ตัดออกเป็นท่อนละ 2 เมตร ต้องลงมีดตัดทั้งหมดกี่ครั้ง?", choiceA: "5 ครั้ง", choiceB: "6 ครั้ง", answer: "A", difficulty: "medium" },
  { id: "Q184", category: "ตรรกะ & เชาว์", question: "ปีนี้วันเกิดตรงกับวันอังคาร ถ้านับไปอีก 365 วันพอดี วันเกิดปีหน้าตรงกับวันอะไร?", choiceA: "อังคาร", choiceB: "พุธ", answer: "B", difficulty: "medium" },
  { id: "Q185", category: "ตรรกะ & เชาว์", question: "พนักงาน 5 คนจับมือทักทายกันครบทุกคู่ จะเกิดการจับมือทั้งหมดกี่ครั้ง?", choiceA: "20 ครั้ง", choiceB: "10 ครั้ง", answer: "B", difficulty: "medium" },
  { id: "Q186", category: "ตรรกะ & เชาว์", question: "เซลส์ทุกคนมีไอแพด และบางคนที่มีไอแพดชอบกาแฟ สรุปได้แน่นอนไหมว่ามีเซลส์บางคนชอบกาแฟ?", choiceA: "สรุปไม่ได้ คนที่ชอบกาแฟอาจไม่ใช่เซลส์เลยก็ได้", choiceB: "สรุปได้ เพราะเซลส์ทุกคนมีไอแพด", answer: "A", difficulty: "hard" },
  { id: "Q187", category: "ตรรกะ & เชาว์", question: "คนหนึ่งพูดจริงเสมอ อีกคนโกหกเสมอ ถามทีละคนว่า \"คุณเป็นคนพูดจริงใช่ไหม\" ใครบ้างจะตอบว่า \"ใช่\"?", choiceA: "เฉพาะคนพูดจริง", choiceB: "ทั้งสองคน", answer: "B", difficulty: "hard" },
  { id: "Q188", category: "ตรรกะ & เชาว์", question: "ทีมมี 11 คน ชอบชา 7 คน ชอบกาแฟ 8 คน ทุกคนชอบอย่างน้อยหนึ่งอย่าง มีกี่คนที่ชอบทั้งสองอย่าง?", choiceA: "4 คน", choiceB: "1 คน", answer: "A", difficulty: "hard" },
  // ความรู้รอบตัวเสริม (Q189–Q195)
  { id: "Q189", category: "ความรู้รอบตัว", question: "ธงชาติไทยมีทั้งหมดกี่สี?", choiceA: "5 สี", choiceB: "3 สี", answer: "B", difficulty: "easy" },
  { id: "Q190", category: "ความรู้รอบตัว", question: "วันแม่แห่งชาติของไทยตรงกับวันที่เท่าไร?", choiceA: "12 สิงหาคม", choiceB: "12 กันยายน", answer: "A", difficulty: "easy" },
  { id: "Q191", category: "ความรู้รอบตัว", question: "สกุลเงินของประเทศเกาหลีใต้คือ?", choiceA: "หยวน", choiceB: "วอน", answer: "B", difficulty: "easy" },
  { id: "Q192", category: "ความรู้รอบตัว", question: "เวลาประเทศไทยเร็วกว่าเวลามาตรฐานกรีนิช (GMT) กี่ชั่วโมง?", choiceA: "7 ชั่วโมง", choiceB: "9 ชั่วโมง", answer: "A", difficulty: "medium" },
  { id: "Q193", category: "ความรู้รอบตัว", question: "แสงจากดวงอาทิตย์เดินทางมาถึงโลกใช้เวลาประมาณเท่าไร?", choiceA: "8 วินาที", choiceB: "8 นาที", answer: "B", difficulty: "medium" },
  { id: "Q194", category: "ความรู้รอบตัว", question: "ปัจจุบันประเทศที่มีประชากรมากที่สุดในโลกคือ?", choiceA: "อินเดีย", choiceB: "จีน", answer: "A", difficulty: "medium" },
  { id: "Q195", category: "ความรู้รอบตัว", question: "ที่ดิน 1 ไร่ เท่ากับกี่ตารางวา?", choiceA: "100 ตารางวา", choiceB: "400 ตารางวา", answer: "B", difficulty: "hard" },
  // อนุกรม/ลำดับเสริม (Q196–Q200)
  { id: "Q196", category: "อนุกรม/ลำดับ", question: "15, 20, 25, 30, ?", choiceA: "35", choiceB: "40", answer: "A", difficulty: "easy" },
  { id: "Q197", category: "อนุกรม/ลำดับ", question: "09:00, 10:15, 11:30, 12:45, ?", choiceA: "13:45", choiceB: "14:00", answer: "B", difficulty: "easy" },
  { id: "Q198", category: "อนุกรม/ลำดับ", question: "3, 7, 15, 31, ?", choiceA: "63", choiceB: "47", answer: "A", difficulty: "medium" },
  { id: "Q199", category: "อนุกรม/ลำดับ", question: "6, 12, 9, 18, 15, 30, ?", choiceA: "27", choiceB: "60", answer: "A", difficulty: "medium" },
  { id: "Q200", category: "อนุกรม/ลำดับ", question: "5, 6, 8, 12, 20, ?", choiceA: "28", choiceB: "36", answer: "B", difficulty: "hard" },
];

/*
=== บันทึกการตัดโจทย์เดิม (15 ข้อ จาก 100 ข้อ — id อ้างอิงไฟล์เดิม quizBank.ts) ===

เฉลยผิด (3 ข้อ):
- Q079 เดิม: "ไก่ กับ ไข่ ต่างกันที่วรรณยุกต์ใช่ไหม?" เฉลย "ใช่" — ผิด จริงๆ ต่างกันที่พยัญชนะต้น (ก/ข) รูปวรรณยุกต์เป็นไม้เอกเหมือนกัน
- Q081 เดิม: "เหล็ก 1 กก. vs นุ่น 1 กก. อันไหนหนักกว่า?" เฉลย "เหล็ก" — ผิด น้ำหนักเท่ากัน แต่ไม่มีตัวเลือก "เท่ากัน" ให้เลือก
- Q046 เดิม: "อะไรมีคอแต่ไม่มีหัว?" เฉลย "ขวด" แต่ตัวลวงคือ "เสื้อ" ซึ่งก็มีคอ (คอเสื้อ) และไม่มีหัวเช่นกัน = ตัวลวงก็เป็นคำตอบถูก

กำกวม/ตีความได้สองทาง (7 ข้อ):
- Q037 เดิม: "พ่อมีลูก 5 คน..." ตัวเลือก "เกินเดา (ดูคำถาม)" อ่านไม่รู้เรื่อง ตัวโจทย์ก็ไม่ได้ให้เงื่อนไขพอเฉลย
- Q038 เดิม: "เทียน 10 เล่ม ดับไป 3 เหลือกี่เล่ม?" ตอบได้ทั้ง 3 (เล่มที่ไม่ไหม้หมด) และ 7 (เล่มที่ยังจุดอยู่) ขึ้นกับการตีความ "เหลือ"
- Q051 เดิม: "ถ้า 2 = ผลไม้, 3 = สัตว์ แล้ว 1 = ?" โจทย์บอกเองว่า "ไม่มีกฎจริง" = ไม่มีเฉลยที่พิสูจน์ได้
- Q055 เดิม: "อะไรที่ทุกคนมีแต่ไม่มีใครเสียได้?" เฉลย "ชื่อ" แต่ตัวลวง "เงา" ก็เข้าเงื่อนไขเดียวกันทุกประการ
- Q083 เดิม: "ปลาอะไรไม่มีในทะเล?" ตัวเลือก "ปลาวาฬ(สัตว์เลี้ยงลูกด้วยนม)" ใส่คำอธิบายเฉลยไว้ในตัวเลือกเอง + วาฬก็อยู่ในทะเลจริง
- Q091 เดิม: "คนตาบอดสี...คำถามนี้ตอบ 'แล้วแต่ชนิด' ใช่ไหม?" โจทย์ถามซ้อนเฉลยตัวเอง วนงง
- Q031 เดิม: "10, 20, 30, 50, ? (ตัวก่อนหน้ารวมกัน… 30+50=80)" วงเล็บเฉลยคำตอบให้เสร็จสรรพ

ง่ายจนไร้สาระ / ตัวเลือกไม่ลวง (4 ข้อ):
- Q015 เดิม: "999 + 1 = ?" ง่ายเกินจนไม่มีความเป็นเกม
- Q064 เดิม: "แสงเร็วกว่าเสียงใช่ไหม? ใช่/ไม่" ตัวเลือกใช่/ไม่ ไม่มีแรงลวง
- Q071 เดิม: "คำว่า 'กก' อ่านว่า?" ตัวเลือก "กก" vs "กอ-กอ" ไม่เป็นคำถามที่วัดอะไร
- Q072 เดิม: "นาฬิกา มี ฬ กี่ตัว?" มองเห็นคำตอบทันทีจากตัวโจทย์

ซ้ำกัน (1 ข้อ):
- Q048 เดิม: "เดือนไหนมี 28 วัน?" ซ้ำประเด็นเดียวกับ Q042 เดิม (เก็บ Q042 ไว้เป็น Q090 ใหม่)

หมายเหตุ: ข้อที่เก็บไว้บางข้อมีการแก้เล็กน้อย — ลบคำใบ้ในวงเล็บที่สปอยล์เฉลย (อนุกรม Q029/Q030/Q032/Q035 เดิม),
ปรับคำถาม Q007 เดิมให้หายกำกวม, เปลี่ยนตัวลวงที่อ่อน (เช่น 6×7+8 เดิมลวงด้วย 90 → เปลี่ยนเป็น 48)
และสลับตำแหน่ง A/B ใหม่ทั้งไฟล์ให้สมดุล 100/100
*/
