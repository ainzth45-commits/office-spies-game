import { describe, expect, it } from "vitest";
import { defaultConfig } from "../data/configDefaults";
import { quizPenaltyAt, quizRewardAt } from "./quizEngine";

// ค่า default: reward 10 ลด 1 ทุก 10 วิ (พื้น 1) · โทษ 3 ภายใน 60 วิ · เกิน = 6
describe("quizRewardAt", () => {
  it("ตอบทันที ได้เต็ม", () => {
    expect(quizRewardAt(0, defaultConfig)).toBe(10);
  });
  it("ก่อนครบ step แรก ยังเต็ม", () => {
    expect(quizRewardAt(9.9, defaultConfig)).toBe(10);
  });
  it("ครบ step ลดทีละ 1", () => {
    expect(quizRewardAt(10, defaultConfig)).toBe(9);
    expect(quizRewardAt(35, defaultConfig)).toBe(7);
  });
  it("ไม่ต่ำกว่าพื้น", () => {
    expect(quizRewardAt(95, defaultConfig)).toBe(1);
    expect(quizRewardAt(9999, defaultConfig)).toBe(1);
  });
  it("เวลาติดลบ (นาฬิกาเพี้ยน) นับเป็น 0", () => {
    expect(quizRewardAt(-5, defaultConfig)).toBe(10);
  });
});

describe("quizPenaltyAt", () => {
  it("ภายในเกณฑ์เวลา = ขั้นปกติ", () => {
    expect(quizPenaltyAt(0, defaultConfig)).toBe(3);
    expect(quizPenaltyAt(60, defaultConfig)).toBe(3);
  });
  it("เกินเกณฑ์ = ขั้นแรง และไม่บานต่อ", () => {
    expect(quizPenaltyAt(60.1, defaultConfig)).toBe(6);
    expect(quizPenaltyAt(600, defaultConfig)).toBe(6);
  });
});
