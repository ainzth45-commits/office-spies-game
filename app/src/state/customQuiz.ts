// โจทย์ที่ผู้ใช้สร้างเองในโหมดฝึก — "ข้อ 0" เก็บใน localStorage อย่างเดียว (สร้างได้ครั้งละ 1)
// รองรับ 2–4 ตัวเลือก + รูปประกอบจากลิงก์ · ไม่เกี่ยวกับคลังโจทย์เกมจริง (quizBank) เลย
const KEY = "office-spies/practice-custom-v1";

const MAX_IMAGE_URL = 2000;

export type CustomQuizMode = "choices" | "open";

export interface CustomQuizData {
  mode: CustomQuizMode; // "choices" = มีตัวเลือก · "open" = เขียนคำตอบเอง (ผู้คุมเกมตัดสินถูก/ผิด)
  question: string;
  choices: string[]; // 2–4 ข้อ (ใช้เฉพาะโหมด choices)
  answerIndex: number; // index ของคำตอบที่ถูก (0-based · ใช้เฉพาะโหมด choices)
  answerText: string; // เฉลยที่ตั้งไว้ (ใช้เฉพาะโหมด open · "" ในโหมด choices)
  explanation: string;
  imageUrl: string; // "" = ไม่มีรูป · รับเฉพาะ http/https เท่านั้น
}

// รับเฉพาะลิงก์ http/https — กัน javascript:/data: ที่แปะมาจากที่อื่น และกันสตริงยาวผิดปกติ
export function normalizeImageUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (trimmed === "" || trimmed.length > MAX_IMAGE_URL) return "";
  return /^https?:\/\/\S+$/i.test(trimmed) ? trimmed : "";
}

export function getCustomQuiz(): CustomQuizData | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;

    // รองรับรูปแบบเก่า (choiceA/choiceB/answer "A"|"B") — แปลงเป็นรูปแบบใหม่
    if (typeof parsed.choiceA === "string" && typeof parsed.choiceB === "string") {
      const choices = [parsed.choiceA, parsed.choiceB];
      const answerIndex = parsed.answer === "B" ? 1 : 0;
      if (typeof parsed.question === "string" && parsed.question.trim() !== "") {
        return { mode: "choices", question: parsed.question, choices, answerIndex, answerText: "", explanation: typeof parsed.explanation === "string" ? parsed.explanation : "", imageUrl: normalizeImageUrl(parsed.imageUrl) };
      }
      return null;
    }

    const explanation = typeof parsed.explanation === "string" ? parsed.explanation : "";
    const imageUrl = normalizeImageUrl(parsed.imageUrl);
    const questionOk = typeof parsed.question === "string" && parsed.question.trim() !== "";

    // โหมดเขียนคำตอบเอง — ต้องมีคำถาม + เฉลยที่ตั้งไว้ (answerText) ไม่ว่าง
    if (parsed.mode === "open") {
      if (questionOk && typeof parsed.answerText === "string" && parsed.answerText.trim() !== "") {
        return { mode: "open", question: parsed.question as string, choices: [], answerIndex: 0, answerText: parsed.answerText, explanation, imageUrl };
      }
      return null;
    }

    // โหมดมีตัวเลือก (ค่าเริ่มต้นสำหรับข้อมูลเก่าที่ไม่มี mode)
    const choices = Array.isArray(parsed.choices) ? parsed.choices.filter((c): c is string => typeof c === "string" && c.trim() !== "") : [];
    if (
      questionOk &&
      choices.length >= 2 &&
      choices.length <= 4 &&
      Number.isInteger(parsed.answerIndex) &&
      (parsed.answerIndex as number) >= 0 &&
      (parsed.answerIndex as number) < choices.length
    ) {
      return { mode: "choices", question: parsed.question as string, choices, answerIndex: parsed.answerIndex as number, answerText: "", explanation, imageUrl };
    }
    return null;
  } catch {
    return null;
  }
}

export function saveCustomQuiz(data: CustomQuizData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...data, mode: data.mode === "open" ? "open" : "choices", imageUrl: normalizeImageUrl(data.imageUrl) }));
  } catch {
    // เพิกเฉย — ยอมให้จำไม่ได้ ดีกว่าพัง
  }
}

export function clearCustomQuiz(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // เพิกเฉย
  }
}
