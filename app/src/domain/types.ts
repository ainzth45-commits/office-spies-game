export type PlayerId = string;
export type SpySlot = "spyA" | "spyB";
export type Role = "normal" | SpySlot;
export type VoteItemType = "double" | "remove" | "swap" | "reduceThreshold" | "protectThreshold";
export type GachaOutcome =
  | "selfGain"
  | "selfLoseAll"
  | "allGain"
  | "poorGain"
  | "allLose"
  | "voteUp"
  | "voteDown"
  | "grantItem"
  | "grantQuiz"
  | "spyShield";
export type GamePhase =
  | "boot"
  | "home"
  | "tutorial"
  | "roleReveal"
  | "shop"
  | "gacha"
  | "quiz"
  | "vote"
  | "voteResult"
  | "postVoteClue"
  | "guess"
  | "refund"
  | "ended";
export type EndWinner = "team" | "spies";

export interface Player {
  id: PlayerId;
  code: string;
  name: string;
  imageUrl: string;
}

export interface GameConfig {
  spyCount: number;
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
  inventoryLimit: number;
  quizCorrectReward: number;
  quizWrongPenaltyPerPlayer: number;
  gachaSpinCost: number;
  gachaDailyLimitPerPlayer: number;
  itemPrices: Record<VoteItemType, number>;
  itemDailyLimits: Record<VoteItemType, number>;
  gachaCoinSelfGain: number;
  gachaCoinAllGain: number;
  gachaCoinAllLose: number;
  gachaPoorThreshold: number;
  gachaPoorGain: number;
  gachaVoteMultiplierUp: number;
  gachaVoteMultiplierDown: number;
  gachaWeights: Record<GachaOutcome, number>;
}

export interface VoteItem {
  id: string;
  type: VoteItemType;
  source: "shop" | "gacha";
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

export interface QuizQuestion {
  id: string;
  category: string;
  question: string;
  choiceA: string;
  choiceB: string;
  answer: "A" | "B";
}

export interface GameState {
  version: 1;
  phase: GamePhase;
  players: Player[];
  config: GameConfig;
  attendance: Record<PlayerId, boolean>;
  roles: Record<PlayerId, Role>;
  inventories: Record<PlayerId, VoteItem[]>;
  shield: ShieldState;
  manualDay: ManualDayState;
  voteCostState: VoteCostState;
  usedQuizIds: string[];
  dailyUsage: DailyUsageState;
  pendingQuiz: PendingQuizState | null;
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
  endWinner: EndWinner | null;
}

export interface GameActionLog {
  id: string;
  at: string;
  label: string;
}

export interface DailyUsageState {
  dayIndex: number;
  gachaSpins: Record<PlayerId, number>;
  shopPurchases: Record<PlayerId, Partial<Record<VoteItemType, number>>>;
}

export interface PendingQuizState {
  playerId: PlayerId;
  questionId: string;
}

export interface GachaResultState {
  playerId: PlayerId;
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
  publicResult: "failed" | "caughtInnocent" | "caughtSpy";
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
