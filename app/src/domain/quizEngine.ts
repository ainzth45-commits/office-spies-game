import type { GameConfig } from "./types";

// รางวัลตอบถูก ณ วินาทีที่ elapsed — เริ่มเต็ม ลดลง 1 ทุก quizRewardDecaySec จนถึงพื้น quizRewardMin
export function quizRewardAt(elapsedSec: number, config: GameConfig): number {
  const steps = Math.floor(Math.max(0, elapsedSec) / config.quizRewardDecaySec);
  return Math.max(config.quizRewardMin, config.quizCorrectReward - steps);
}

// โทษตอบผิด 2 ขั้น: ภายใน quizPenaltyTierSec = ขั้นปกติ · เกิน = ขั้นแรง (จบแค่นี้ ไม่บานต่อ)
export function quizPenaltyAt(elapsedSec: number, config: GameConfig): number {
  return elapsedSec > config.quizPenaltyTierSec ? config.quizWrongPenaltyLate : config.quizWrongPenaltyPerPlayer;
}
