import type { GachaOutcome } from "./types";
import type { RandomSource } from "./random";

export function selectWeightedGachaOutcome(
  weights: Record<GachaOutcome, number>,
  random: RandomSource = Math.random,
): GachaOutcome {
  const entries = Object.entries(weights) as Array<[GachaOutcome, number]>;
  const total = entries.reduce((sum, [, weight]) => sum + Math.max(0, weight), 0);
  if (total <= 0) throw new Error("น้ำหนักกาชาต้องมากกว่า 0");

  let cursor = random() * total;
  for (const [outcome, rawWeight] of entries) {
    const weight = Math.max(0, rawWeight);
    if (cursor < weight) return outcome;
    cursor -= weight;
  }
  return entries[entries.length - 1][0];
}

export function normalizeGachaWeights(weights: Record<GachaOutcome, number>): Record<GachaOutcome, number> {
  const total = Object.values(weights).reduce((sum, weight) => sum + Math.max(0, weight), 0);
  if (total <= 0) throw new Error("น้ำหนักกาชาต้องมากกว่า 0");
  return Object.fromEntries(
    Object.entries(weights).map(([outcome, weight]) => [outcome, (Math.max(0, weight) / total) * 100]),
  ) as Record<GachaOutcome, number>;
}

export function resolveGachaOutcome(
  outcome: GachaOutcome,
  context: { shieldAvailable: boolean },
): GachaOutcome {
  if (outcome === "spyShield" && !context.shieldAvailable) return "allGain";
  return outcome;
}

// ผลกาชาที่ "ส่งผลเสียต่อทีม / เข้าทางสปาย" — ใช้เอียงเรทเมื่อสปายเป็นคนหมุน (กาชาเป็นเบาะแส)
// หมายเหตุ: โจทย์เชาว์ (grantQuiz) ไม่อยู่ในลิสต์ — เจ้านายเคาะให้ออกเท่ากันทุกคน
export const SPY_BAD_GACHA_OUTCOMES: GachaOutcome[] = [
  "itemRemove",
  "itemSwap",
  "itemReduce",
  "voteUp",
  "allLose",
  "spyShield",
];

// น้ำหนักกาชา "ที่ใช้จริง" ตามสถานะเกม — ถอด outcome ที่ถูกล็อก/ปิดออก (น้ำหนัก = 0)
// แล้วปล่อยให้ selectWeightedGachaOutcome เฉลี่ยโอกาสที่เหลือตามสัดส่วนเดิมโดยอัตโนมัติ
//   - spyShield: ถ้ามีเกราะอยู่แล้ว (ของชิ้นเดียว) → ถอดจนจบเกม
//   - voteUp/voteDown: ถ้าค่าโหวตถูกเปลี่ยนไปแล้ววันนี้ → ถอดทั้งคู่จนขึ้นวันใหม่
//   - disabled: ช่องที่ซุปปิดในตั้งค่า → ถอดถาวร
export function availableGachaWeights(
  base: Record<GachaOutcome, number>,
  context: { shieldExists: boolean; voteCostChangedToday: boolean; disabled?: GachaOutcome[] },
): Record<GachaOutcome, number> {
  const weights = { ...base };
  if (context.shieldExists) weights.spyShield = 0;
  if (context.voteCostChangedToday) {
    weights.voteUp = 0;
    weights.voteDown = 0;
  }
  for (const outcome of context.disabled ?? []) weights[outcome] = 0;
  return weights;
}

// เอียงเรทตอนสปายหมุน — คูณน้ำหนักของป่วนให้ออกบ่อยขึ้น (ของที่ถูกถอด/ปิด = 0 อยู่แล้ว ไม่ฟื้น)
// multiplier = 1 → ไม่เอียง (คืนชุดเดิม)
export function applySpyChaosBias(
  weights: Record<GachaOutcome, number>,
  multiplier: number,
  badOutcomes: GachaOutcome[] = SPY_BAD_GACHA_OUTCOMES,
): Record<GachaOutcome, number> {
  if (multiplier === 1) return weights;
  const biased = { ...weights };
  for (const outcome of badOutcomes) biased[outcome] = Math.max(0, biased[outcome]) * multiplier;
  return biased;
}
