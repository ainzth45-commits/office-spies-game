// โจทย์ที่ผู้ใช้สร้างเองในโหมดฝึก — "ข้อ 0" เก็บใน localStorage อย่างเดียว (สร้างได้ครั้งละ 1)
// รองรับ 2–4 ตัวเลือก · ไม่เกี่ยวกับคลังโจทย์เกมจริง (quizBank) เลย
const KEY = "office-spies/practice-custom-v1";

export interface CustomQuizData {
  question: string;
  choices: string[]; // 2–4 ข้อ
  answerIndex: number; // index ของคำตอบที่ถูก (0-based)
  explanation: string;
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
        return { question: parsed.question, choices, answerIndex, explanation: typeof parsed.explanation === "string" ? parsed.explanation : "" };
      }
      return null;
    }

    const choices = Array.isArray(parsed.choices) ? parsed.choices.filter((c): c is string => typeof c === "string" && c.trim() !== "") : [];
    if (
      typeof parsed.question === "string" &&
      parsed.question.trim() !== "" &&
      choices.length >= 2 &&
      choices.length <= 4 &&
      Number.isInteger(parsed.answerIndex) &&
      (parsed.answerIndex as number) >= 0 &&
      (parsed.answerIndex as number) < choices.length
    ) {
      return { question: parsed.question, choices, answerIndex: parsed.answerIndex as number, explanation: typeof parsed.explanation === "string" ? parsed.explanation : "" };
    }
    return null;
  } catch {
    return null;
  }
}

export function saveCustomQuiz(data: CustomQuizData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
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
