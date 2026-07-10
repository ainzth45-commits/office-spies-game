import type { QuizQuestion } from "../domain/types";

// โจทย์ที่ผู้ใช้สร้างเองในโหมดฝึก — "ข้อ 0" เก็บใน localStorage อย่างเดียว (สร้างได้ครั้งละ 1)
// ไม่เกี่ยวกับคลังโจทย์เกมจริง (quizBank) เลย
const KEY = "office-spies/practice-custom-v1";

export interface CustomQuizInput {
  question: string;
  choiceA: string;
  choiceB: string;
  answer: "A" | "B";
  explanation: string;
}

export function getCustomQuiz(): QuizQuestion | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CustomQuizInput>;
    if (
      typeof parsed.question === "string" &&
      parsed.question.trim() !== "" &&
      typeof parsed.choiceA === "string" &&
      typeof parsed.choiceB === "string" &&
      (parsed.answer === "A" || parsed.answer === "B")
    ) {
      return {
        id: "Q000", // slice(1) = "000" → เลขข้อ = 0 ("ข้อ 0")
        category: "โจทย์ที่สร้างเอง",
        difficulty: "medium",
        question: parsed.question,
        choiceA: parsed.choiceA,
        choiceB: parsed.choiceB,
        answer: parsed.answer,
        explanation: typeof parsed.explanation === "string" ? parsed.explanation : "",
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function saveCustomQuiz(input: CustomQuizInput): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(input));
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
