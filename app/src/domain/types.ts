export type PlayerId = string;
export type SpySlot = "spyA" | "spyB";
// "jester" = คนบ้า — ชนะเมื่อโดนโหวตประจำวันถึงเกณฑ์ (เปิด/ปิดได้ มีได้ 1 คน)
export type Role = "normal" | "jester" | SpySlot;
export type VoteItemType = "double" | "remove" | "swap" | "reduceThreshold" | "protectThreshold";
// ช่องไอเทมในตู้กาชา — แตกรายใบ (ร้านลับถูกถอด กาชาเป็นทางเดียวที่ได้ไอเทม)
export type GachaItemOutcome = "itemDouble" | "itemRemove" | "itemSwap" | "itemReduce" | "itemProtect";
export type GachaOutcome =
  | "selfGain"
  | "selfLoseAll"
  | "allGain"
  | "poorGain"
  | "allLose"
  | "voteUp"
  | "voteDown"
  | GachaItemOutcome
  | "grantQuiz"
  | "spyShield";

export const gachaItemOutcomeToItemType: Record<GachaItemOutcome, VoteItemType> = {
  itemDouble: "double",
  itemRemove: "remove",
  itemSwap: "swap",
  itemReduce: "reduceThreshold",
  itemProtect: "protectThreshold",
};

export function isGachaItemOutcome(outcome: GachaOutcome): outcome is GachaItemOutcome {
  return outcome in gachaItemOutcomeToItemType;
}
export type GamePhase =
  | "boot"
  | "home"
  | "tutorial"
  | "roleReveal"
  | "gacha"
  | "quiz"
  | "quizPractice"
  | "vote"
  | "voteResult"
  | "postVoteClue"
  | "guess"
  | "refund"
  | "topic"
  | "ended";
export type EndWinner = "team" | "spies" | "jester";

export interface Player {
  id: PlayerId;
  code: string;
  name: string;
  imageUrl: string;
}

export interface GameConfig {
  spyCount: number;
  // เปิด "คนบ้า" (jester) — สุ่ม 1 คนตอนแจกบทบาท ชนะเมื่อโดนโหวต
  jesterEnabled: boolean;
  maxGameDays: number;
  thresholdRatio: number;
  thresholdFloor: number;
  voteBaseCostPerPresentPlayer: number;
  skippedWorkingDayIncrease: number;
  innocentRefundRatio: number;
  spyPoolRevealMinVoted: number;
  votedClueMinVoted: number;
  cluePriceRatio: number;
  notVotedClueMaxCards: number;
  reduceThresholdPercent: number;
  weakenedReduceThresholdPercent: number;
  quizCorrectReward: number;
  quizWrongPenaltyPerPlayer: number;
  // กลไกเวลาโจทย์เชาว์: รางวัลลดตามเวลา + โทษ 2 ขั้น
  quizRewardDecaySec: number;
  quizRewardMin: number;
  quizPenaltyTierSec: number;
  quizWrongPenaltyLate: number;
  // เริ่มรอบใหม่ได้ต่อเมื่อคลังโจทย์เหลืออย่างน้อยเท่านี้ (กันโจทย์หมดกลางเกม)
  quizMinRemainingToStart: number;
  gachaSpinCost: number;
  gachaCoinSelfGain: number;
  gachaCoinAllGain: number;
  gachaCoinAllLose: number;
  gachaPoorThreshold: number;
  gachaPoorGain: number;
  gachaVoteMultiplierUp: number;
  gachaVoteMultiplierDown: number;
  gachaWeights: Record<GachaOutcome, number>;
  // เปิด/ปิดของรายชิ้นในตู้ — ปิดแล้วช่องนั้นถูกถอด (น้ำหนัก 0) เปอร์เซ็นต์ที่เหลือเฉลี่ยใหม่อัตโนมัติ
  gachaEnabled: Record<GachaOutcome, boolean>;
  // ตัวคูณ "ความป่วน" เมื่อสปายเป็นคนหมุน — คูณน้ำหนักของผลที่ส่งผลเสีย (ดู SPY_BAD_GACHA_OUTCOMES)
  spyGachaBadMultiplier: number;
}

export interface VoteItem {
  id: string;
  type: VoteItemType;
  source: "gacha";
  publicKnown: boolean;
  createdAtActionId: string;
}

export interface ManualDayState {
  index: number;
  label: string;
  openedVoteToday: boolean;
  isFinalDay: boolean;
  history: DayHistoryEntry[];
}

export interface DayHistoryEntry {
  actionId: string;
  kind: "start" | "end-working-day" | "rest-day" | "mark-final-day";
  label: string;
  voteCostMultiplierAfter: number;
}

export interface ShieldState {
  slot: SpySlot | null;
  exists: boolean;
  consumed: boolean;
}

export interface VoteCostState {
  accumulatedSkippedMultiplier: number;
  nextVoteMultiplier: number;
}

export type QuizDifficulty = "easy" | "medium" | "hard";

export interface QuizQuestion {
  id: string;
  category: string;
  difficulty: QuizDifficulty;
  question: string;
  choiceA: string;
  choiceB: string;
  answer: "A" | "B";
  // เหตุผลสั้นๆ ว่าทำไมเฉลยถึงถูก — โชว์ตอนเฉลยทั้งเกมจริงและโหมดฝึก
  explanation: string;
}

export interface GameState {
  version: 1;
  // ยุคของระบบรายชื่อ — 2 = ลงทะเบียนในแอป (เซฟที่ไม่มี field นี้คือยุครายชื่อฝังโค้ด ต้องล้างทิ้ง)
  rosterVersion: number;
  phase: GamePhase;
  players: Player[];
  config: GameConfig;
  attendance: Record<PlayerId, boolean>;
  roles: Record<PlayerId, Role>;
  inventories: Record<PlayerId, VoteItem[]>;
  shield: ShieldState;
  manualDay: ManualDayState;
  voteCostState: VoteCostState;
  dailyUsage: DailyUsageState;
  pendingQuiz: PendingQuizState | null;
  pendingQuizResult: PendingQuizResultState | null;
  // ผลกาชาช่องไอเทมที่รอซุปกดเลือกคนรับ (ค้างข้าม refresh ได้)
  pendingGachaGrant: PendingGachaGrantState | null;
  history: GameActionLog[];
  settings: {
    soundEnabled: boolean;
    tutorialCompleted: boolean;
  };
  cluePurchasesByVoteRound: Record<string, boolean>;
  currentVoteRoundId: string | null;
  currentVote: VoteSession | null;
  lastVoteResult: VoteRoundResult | null;
  lastClueResult: PostVoteClueState | null;
  lastGachaResult: GachaResultState | null;
  // ผลการชี้ตัวสายลับคนที่สอง — ค้างไว้ให้จอเฉลยโชว์ก่อนเดินเกมต่อ
  lastGuessResult: { guessedId: PlayerId; correct: boolean } | null;
  endWinner: EndWinner | null;
}

export interface GameActionLog {
  id: string;
  at: string;
  label: string;
}

export interface DailyUsageState {
  dayIndex: number;
  // กาชา: voteUp/voteDown ออกได้รวมกันไม่เกินวันละ 1 ครั้ง — true เมื่อออกแล้ว (รีเซ็ตเมื่อขึ้นวันใหม่)
  voteCostChanged: boolean;
}

export interface PendingQuizState {
  questionId: string;
  // เวลาเริ่มโจทย์ (ISO) — null = ยังอยู่หน้ากติกา ยังไม่เริ่มนับเวลา
  // timer คิดจากค่านี้ ไม่ใช่ตอน mount → ออกกลางคัน/refresh เวลาก็เดินต่อ
  startedAt: string | null;
}

export interface PendingQuizResultState {
  questionId: string;
  correct: boolean;
  message: string;
}

export interface PendingGachaGrantState {
  itemType: VoteItemType;
  message: string;
}

export interface GachaResultState {
  outcome: GachaOutcome;
  message: string;
}

export interface CastVote {
  voterId: PlayerId;
  targetId: PlayerId;
  doubleVote: boolean;
}

export type UsedVoteItem =
  | { id: string; userId: PlayerId; type: "remove"; targetId: PlayerId }
  | { id: string; userId: PlayerId; type: "swap"; firstTargetId: PlayerId; secondTargetId: PlayerId }
  | { id: string; userId: PlayerId; type: "reduceThreshold" }
  | { id: string; userId: PlayerId; type: "protectThreshold" };

export interface VoteEngineInput {
  presentPlayerIds: PlayerId[];
  roles: Record<PlayerId, Role>;
  votes: CastVote[];
  usedItems: UsedVoteItem[];
  config: GameConfig;
  shield: ShieldState;
}

export interface VoteEngineResult {
  publicResult: "failed" | "caughtInnocent" | "caughtSpy" | "caughtJester";
  winnerId: PlayerId | null;
  winnerIsSpy: boolean;
  shieldConsumed: boolean;
  adjustedCounts: Record<PlayerId, number>;
  votedPool: PlayerId[];
  notVotedPool: PlayerId[];
  spiesInPoolCount: number;
  spyPoolReveal: { spies: number; total: number } | null;
  threshold: number;
  blockedMessages: string[];
}

export interface VoteSession {
  id: string;
  paidCost: number;
  presentPlayerIds: PlayerId[];
  votes: CastVote[];
  usedItems: UsedVoteItem[];
  submittedVoterIds: PlayerId[];
}

export interface VoteRoundResult {
  roundId: string;
  paidCost: number;
  refundAmount: number;
  result: VoteEngineResult;
}

export type PostVoteClueOption = "voted" | "notVoted";

export interface PostVoteClueState {
  roundId: string;
  option: PostVoteClueOption;
  playerIds: PlayerId[];
  paidCost: number;
  emptyPaid: boolean;
}
