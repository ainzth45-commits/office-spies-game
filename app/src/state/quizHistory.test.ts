import { beforeEach, describe, expect, it, vi } from "vitest";
import { getUsedQuizIds, markQuizUsed, mergeUsedQuizIds, resetQuizHistory } from "./quizHistory";

const KEY = "office-spies/quiz-used-v1";

// jsdom ใน vitest ที่นี่ให้ localStorage เป็น object เปล่า — stub ด้วย Map ให้พฤติกรรมตรงสเปค
function stubStorage() {
  const map = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, String(v)),
    removeItem: (k: string) => void map.delete(k),
  });
}

describe("quizHistory (localStorage)", () => {
  beforeEach(() => stubStorage());

  it("เริ่มต้นว่าง", () => {
    expect(getUsedQuizIds()).toEqual([]);
  });

  it("mark แล้วอ่านเจอ · mark ซ้ำไม่เบิ้ล", () => {
    markQuizUsed("Q001");
    markQuizUsed("Q002");
    markQuizUsed("Q001");
    expect(getUsedQuizIds()).toEqual(["Q001", "Q002"]);
  });

  it("merge รวมของเก่า (ใช้ตอน migrate จากเซฟเกมเดิม)", () => {
    markQuizUsed("Q001");
    mergeUsedQuizIds(["Q002", "Q001", "Q003"]);
    expect(getUsedQuizIds()).toEqual(["Q001", "Q002", "Q003"]);
  });

  it("reset ล้างหมด", () => {
    markQuizUsed("Q001");
    resetQuizHistory();
    expect(getUsedQuizIds()).toEqual([]);
  });

  it("ค่าพังใน storage → คืน [] ไม่ throw", () => {
    localStorage.setItem(KEY, "{not-json");
    expect(getUsedQuizIds()).toEqual([]);
    localStorage.setItem(KEY, '{"a":1}');
    expect(getUsedQuizIds()).toEqual([]);
    localStorage.setItem(KEY, '["Q001", 5, null, "Q002"]');
    expect(getUsedQuizIds()).toEqual(["Q001", "Q002"]);
  });
});
