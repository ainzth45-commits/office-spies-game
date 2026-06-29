import { calculateThreshold } from "./economy";
import { normalizeGachaWeights } from "./gachaEngine";
import type { GameConfig } from "./types";

export function normalizeAndValidateConfig(config: GameConfig, playerCount: number): GameConfig {
  if (config.spyCount < 1 || config.spyCount >= playerCount) {
    throw new Error("จำนวนสปายต้องน้อยกว่าจำนวนผู้เล่นและอย่างน้อย 1 คน");
  }
  if (config.thresholdRatio <= 0 || config.thresholdRatio > 1 || config.thresholdFloor < 1) {
    throw new Error("ค่าเกณฑ์โหวตไม่ถูกต้อง");
  }
  const threshold = calculateThreshold(playerCount, config);
  if (threshold < config.thresholdFloor || threshold > playerCount) {
    throw new Error("เกณฑ์ที่คำนวณได้ต้องอยู่ระหว่าง floor และจำนวนผู้เล่น");
  }
  if (config.weakenedReduceThresholdPercent > config.reduceThresholdPercent) {
    throw new Error("ค่า P อ่อนเกณฑ์ต้องไม่มากกว่า R");
  }
  for (const value of allNonNegativeNumbers(config)) {
    if (value < 0) throw new Error("ตัวเลขราคาและรางวัลต้องไม่ติดลบ");
  }
  if (
    config.cluePriceRatio < 0 ||
    config.cluePriceRatio > 1 ||
    config.innocentRefundRatio < 0 ||
    config.innocentRefundRatio > 1
  ) {
    throw new Error("สัดส่วนต้องอยู่ระหว่าง 0 และ 1");
  }
  if (
    config.reduceThresholdPercent < 0 ||
    config.reduceThresholdPercent > 1 ||
    config.weakenedReduceThresholdPercent < 0 ||
    config.weakenedReduceThresholdPercent > 1
  ) {
    throw new Error("เปอร์เซ็นต์ไอเทมเกณฑ์ต้องอยู่ระหว่าง 0 และ 1");
  }
  return { ...config, gachaWeights: normalizeGachaWeights(config.gachaWeights) };
}

function allNonNegativeNumbers(config: GameConfig): number[] {
  return [
    config.voteBaseCostPerPresentPlayer,
    config.thresholdFloor,
    config.spyPoolRevealMinVoted,
    config.votedClueMinVoted,
    config.notVotedClueMaxCards,
    config.inventoryLimit,
    config.quizCorrectReward,
    config.quizWrongPenaltyPerPlayer,
    config.gachaSpinCost,
    config.gachaDailyLimitPerPlayer,
    config.gachaCoinSelfGain,
    config.gachaCoinAllGain,
    config.gachaCoinAllLose,
    config.gachaPoorThreshold,
    config.gachaPoorGain,
    ...Object.values(config.itemPrices),
    ...Object.values(config.itemDailyLimits),
    ...Object.values(config.gachaWeights),
  ];
}
