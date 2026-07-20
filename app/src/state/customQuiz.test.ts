import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearCustomQuiz, getCustomQuiz, normalizeImageUrl, saveCustomQuiz } from "./customQuiz";

const KEY = "office-spies/practice-custom-v1";

// jsdom ใน vitest ที่นี่ให้ localStorage เป็น object เปล่า — stub ด้วย Map (แบบเดียวกับ quizHistory.test)
function stubStorage() {
  const map = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, String(v)),
    removeItem: (k: string) => void map.delete(k),
  });
  return map;
}

const base = { question: "ในรูปมีแมวกี่ตัว?", choices: ["3 ตัว", "4 ตัว"], answerIndex: 0, explanation: "นับตัวที่ซ้อนกันหลังโซฟาด้วย" };

describe("normalizeImageUrl", () => {
  it("รับเฉพาะ http/https", () => {
    expect(normalizeImageUrl("https://example.com/a.png")).toBe("https://example.com/a.png");
    expect(normalizeImageUrl("http://example.com/a.png")).toBe("http://example.com/a.png");
    expect(normalizeImageUrl("  https://example.com/a.png  ")).toBe("https://example.com/a.png");
  });

  it("ตัดทิ้งค่าที่ไม่ปลอดภัย/ไม่ใช่ลิงก์", () => {
    expect(normalizeImageUrl("javascript:alert(1)")).toBe("");
    expect(normalizeImageUrl("data:image/png;base64,AAA")).toBe("");
    expect(normalizeImageUrl("example.com/a.png")).toBe("");
    expect(normalizeImageUrl("https://")).toBe("");
    expect(normalizeImageUrl("")).toBe("");
    expect(normalizeImageUrl(undefined)).toBe("");
    expect(normalizeImageUrl(42)).toBe("");
  });

  it("ลิงก์ยาวผิดปกติถูกตัดทิ้ง (กันโควตา localStorage แตก)", () => {
    expect(normalizeImageUrl(`https://example.com/${"a".repeat(2100)}`)).toBe("");
  });
});

describe("customQuiz (localStorage)", () => {
  beforeEach(() => stubStorage());

  it("เริ่มต้นว่าง", () => {
    expect(getCustomQuiz()).toBeNull();
  });

  it("บันทึกแล้วอ่านคืนได้ครบ รวมลิงก์รูป", () => {
    saveCustomQuiz({ ...base, imageUrl: "https://example.com/cats.png" });
    expect(getCustomQuiz()).toEqual({ ...base, imageUrl: "https://example.com/cats.png" });
  });

  it("ลิงก์รูปที่ไม่ปลอดภัยถูกล้างตั้งแต่ตอนบันทึก", () => {
    saveCustomQuiz({ ...base, imageUrl: "javascript:alert(1)" });
    expect(getCustomQuiz()?.imageUrl).toBe("");
  });

  it("ข้อเก่าที่บันทึกไว้ก่อนมีฟีเจอร์รูป อ่านได้ปกติ (imageUrl = ว่าง)", () => {
    localStorage.setItem(KEY, JSON.stringify(base));
    expect(getCustomQuiz()).toEqual({ ...base, imageUrl: "" });
  });

  it("รูปแบบเก่าสุด (choiceA/choiceB/answer) ยังแปลงได้ และมี imageUrl ว่าง", () => {
    localStorage.setItem(KEY, JSON.stringify({ question: "ถามอะไรสักอย่าง", choiceA: "ใช่", choiceB: "ไม่ใช่", answer: "B", explanation: "เพราะงั้น" }));
    expect(getCustomQuiz()).toEqual({ question: "ถามอะไรสักอย่าง", choices: ["ใช่", "ไม่ใช่"], answerIndex: 1, explanation: "เพราะงั้น", imageUrl: "" });
  });

  it("ข้อมูลพังไม่ทำให้แอปล้ม", () => {
    localStorage.setItem(KEY, "{ไม่ใช่ json");
    expect(getCustomQuiz()).toBeNull();
  });

  it("รีเซตแล้วหายจริง", () => {
    saveCustomQuiz({ ...base, imageUrl: "https://example.com/cats.png" });
    clearCustomQuiz();
    expect(getCustomQuiz()).toBeNull();
  });
});
