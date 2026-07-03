import { describe, expect, it } from "vitest";
import { quizBank } from "./quizBank";

// เทสคุ้มครองคลังโจทย์ — สเปค C1: 200 ข้อ คละความยาก ห้ามซ้ำ
describe("quizBank", () => {
  it("มี 200 ข้อ", () => {
    expect(quizBank.length).toBe(200);
  });

  it("id ไม่ซ้ำ และรันตามแบบ Q###", () => {
    const ids = quizBank.map((q) => q.id);
    expect(new Set(ids).size).toBe(quizBank.length);
    for (const id of ids) expect(id).toMatch(/^Q\d{3}$/);
  });

  it("คำถามไม่ซ้ำกัน (คำถาม+ตัวเลือกต้องไม่ซ้ำทั้งชุด — ก้านคำถามซ้ำได้ เช่น 'คำไหนสะกดถูก?')", () => {
    const signatures = quizBank.map((q) => `${q.question.trim()}|${q.choiceA.trim()}|${q.choiceB.trim()}`);
    expect(new Set(signatures).size).toBe(quizBank.length);
  });

  it("ทุกข้อมี difficulty และคำตอบ A/B ที่ถูกต้อง", () => {
    for (const q of quizBank) {
      expect(["easy", "medium", "hard"]).toContain(q.difficulty);
      expect(["A", "B"]).toContain(q.answer);
      expect(q.question.length).toBeGreaterThan(0);
      expect(q.choiceA.length).toBeGreaterThan(0);
      expect(q.choiceB.length).toBeGreaterThan(0);
      expect(q.choiceA).not.toBe(q.choiceB);
    }
  });

  it("ทุกข้อมีคำอธิบายเฉลย (explanation) ที่ไม่ว่างและไม่ยาวเกิน", () => {
    for (const q of quizBank) {
      expect(q.explanation.trim().length, `${q.id} ไม่มีคำอธิบาย`).toBeGreaterThan(5);
      expect(q.explanation.length, `${q.id} คำอธิบายยาวเกิน`).toBeLessThanOrEqual(160);
    }
  });

  it("สัดส่วนหมวด: คณิตรวม (คิดเร็ว+ประยุกต์+อนุกรม) ต้องไม่เกิน 1 ใน 4", () => {
    const mathCount = quizBank.filter((q) =>
      ["คณิตคิดเร็ว", "คณิตประยุกต์", "อนุกรม/ลำดับ"].includes(q.category),
    ).length;
    expect(mathCount).toBeLessThanOrEqual(50);
  });

  it("แต่ละระดับความยากมีอย่างน้อย 40 ข้อ", () => {
    const count = (d: string) => quizBank.filter((q) => q.difficulty === d).length;
    expect(count("easy")).toBeGreaterThanOrEqual(40);
    expect(count("medium")).toBeGreaterThanOrEqual(40);
    expect(count("hard")).toBeGreaterThanOrEqual(40);
  });

  it("เฉลย A/B สมดุลพอ (40-60%)", () => {
    const aCount = quizBank.filter((q) => q.answer === "A").length;
    expect(aCount).toBeGreaterThanOrEqual(80);
    expect(aCount).toBeLessThanOrEqual(120);
  });
});
