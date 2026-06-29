import { describe, expect, it } from "vitest";
import { defaultConfig } from "../data/configDefaults";
import { normalizeAndValidateConfig } from "./configValidation";

describe("config validation", () => {
  it("normalizes gacha weights to 100", () => {
    const config = normalizeAndValidateConfig({ ...defaultConfig, gachaWeights: { ...defaultConfig.gachaWeights, selfGain: 26 } }, 11);
    const total = Object.values(config.gachaWeights).reduce((sum, value) => sum + value, 0);
    expect(Math.round(total)).toBe(100);
  });

  it("rejects spy count that reaches player count", () => {
    expect(() => normalizeAndValidateConfig({ ...defaultConfig, spyCount: 11 }, 11)).toThrow("จำนวนสปายต้องน้อยกว่าจำนวนผู้เล่น");
  });

  it("rejects negative prices", () => {
    expect(() =>
      normalizeAndValidateConfig({ ...defaultConfig, itemPrices: { ...defaultConfig.itemPrices, double: -1 } }, 11),
    ).toThrow("ตัวเลขราคาและรางวัลต้องไม่ติดลบ");
  });

  it("rejects weakened reduction larger than reduction", () => {
    expect(() => normalizeAndValidateConfig({ ...defaultConfig, weakenedReduceThresholdPercent: 0.5 }, 11)).toThrow(
      "ค่า P อ่อนเกณฑ์ต้องไม่มากกว่า R",
    );
  });
});
