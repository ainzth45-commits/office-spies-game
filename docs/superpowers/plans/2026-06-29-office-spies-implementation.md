# Office Spies Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete iPad-first "สายลับในออฟฟิศ" React/Vite PWA with full game rules, game-like UI, generated art integration, real employee photos, IndexedDB persistence, backup/restore, tests, and GitHub Pages readiness.

**Architecture:** Keep the existing markdown brief files at the repository root and build the app under `app/`. Separate pure game rules from UI: `src/domain` owns deterministic logic, `src/state` owns actions and persistence, and `src/features` owns scene-based React flows. The app is static-hosted on GitHub Pages while all live game state stays in the iPad browser.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library, Playwright, IndexedDB via a small local wrapper, CSS modules/plain CSS, Web Audio API, Wake Lock API where available.

---

## Source Documents

- `01-game-design-spec.md` is the source of truth for game rules.
- `04-config-defaults.md` is the source of truth for default numeric config.
- `07-quiz-bank.md` is the source of truth for quiz content.
- `08-tutorial-spec.md` is the source of truth for tutorial scenes.
- `09-codex-confirmation.md` contains must-honor clarifications.
- `docs/superpowers/specs/2026-06-29-office-spies-design.md` contains the approved product design.

## Target File Structure

Create these app files:

```text
app/
  index.html
  package.json
  tsconfig.json
  vite.config.ts
  vitest.config.ts
  playwright.config.ts
  public/
    manifest.webmanifest
    robots.txt
    assets/
      generated/.gitkeep
      sounds/.gitkeep
  src/
    main.tsx
    App.tsx
    styles/global.css
    data/configDefaults.ts
    data/players.ts
    data/quizBank.ts
    data/items.ts
    data/tutorialScenes.ts
    domain/configValidation.ts
    domain/types.ts
    domain/random.ts
    domain/roleEngine.ts
    domain/gachaEngine.ts
    domain/gachaEngine.test.ts
    domain/clueEngine.ts
    domain/clueEngine.test.ts
    domain/voteEngine.ts
    domain/voteEngine.test.ts
    domain/economy.ts
    domain/economy.test.ts
    state/gameState.ts
    state/actions.ts
    state/actions.test.ts
    state/storage.ts
    state/backup.ts
    state/backup.test.ts
    state/useGameStore.tsx
    ui/components/PlayerCard.tsx
    ui/components/PlayerPicker.tsx
    ui/components/ConfirmPlayer.tsx
    ui/components/HandOffCurtain.tsx
    ui/components/GameButton.tsx
    ui/components/StatusBadge.tsx
    ui/audio/sound.ts
    ui/audio/useSound.ts
    features/boot/BootScreen.tsx
    features/home/HomeHub.tsx
    features/day/ManualDayPanel.tsx
    features/settings/SettingsPanel.tsx
    features/attendance/AttendancePanel.tsx
    features/role/RoleRevealFlow.tsx
    features/shop/ShopFlow.tsx
    features/gacha/GachaFlow.tsx
    features/quiz/QuizFlow.tsx
    features/vote/VoteFlow.tsx
    features/vote/VoteResultScene.tsx
    features/vote/PostVoteClueScene.tsx
    features/refund/RefundScene.tsx
    features/guess/GuessSecondSpyScene.tsx
    features/tutorial/TutorialFlow.tsx
    features/end/EndGameScene.tsx
    deploy/githubPages.ts
  tests/
    e2e/smoke.spec.ts
    e2e/game-flow.spec.ts
```

Modify these root files only if needed:

```text
.gitignore
README.md
```

Do not modify the existing rule briefs except by explicit user request.

---

## Task 1: Scaffold The App Workspace

**Files:**
- Create: `app/package.json`
- Create: `app/index.html`
- Create: `app/tsconfig.json`
- Create: `app/vite.config.ts`
- Create: `app/vitest.config.ts`
- Create: `app/playwright.config.ts`
- Create: `app/public/manifest.webmanifest`
- Create: `app/public/robots.txt`
- Create: `app/src/main.tsx`
- Create: `app/src/App.tsx`
- Create: `app/src/styles/global.css`
- Modify: `.gitignore`

- [ ] **Step 1: Create package metadata**

Create `app/package.json`:

```json
{
  "name": "office-spies-game",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "tsc -b && vite build",
    "preview": "vite preview --host 0.0.0.0",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test",
    "check": "npm run test && npm run build"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^5.0.0",
    "vite": "^7.0.0",
    "typescript": "^5.8.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^0.468.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.50.0",
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.1.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "jsdom": "^25.0.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Create TypeScript and Vite config**

Create `app/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src", "tests", "vite.config.ts", "vitest.config.ts", "playwright.config.ts"]
}
```

Create `app/vite.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  base: "./",
});
```

Create `app/vitest.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
  },
});
```

Create `app/playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  webServer: {
    command: "npm run dev -- --port 4175",
    url: "http://127.0.0.1:4175",
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: "http://127.0.0.1:4175",
    viewport: { width: 1180, height: 820 },
  },
  projects: [
    {
      name: "ipad-landscape",
      use: { ...devices["Desktop Safari"], viewport: { width: 1180, height: 820 } },
    },
  ],
});
```

- [ ] **Step 3: Create app entry**

Create `app/index.html`:

```html
<!doctype html>
<html lang="th">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="robots" content="noindex, nofollow" />
    <meta name="theme-color" content="#2B3A67" />
    <link rel="manifest" href="./manifest.webmanifest" />
    <title>สายลับในออฟฟิศ</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `app/src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

Create `app/src/App.tsx`:

```tsx
export function App() {
  return (
    <main className="app-shell">
      <section className="boot-card">
        <p className="eyebrow">Office Spies</p>
        <h1>สายลับในออฟฟิศ</h1>
        <p>กำลังเตรียมกระดานคดี...</p>
      </section>
    </main>
  );
}
```

Create `app/src/styles/global.css`:

```css
:root {
  color-scheme: dark;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #18213f;
  color: #fbf7ef;
}

* {
  box-sizing: border-box;
}

html,
body,
#root {
  min-height: 100%;
  margin: 0;
}

button,
input,
select,
textarea {
  font: inherit;
}

.app-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px;
  background:
    radial-gradient(circle at 18% 14%, rgba(246, 196, 83, 0.24), transparent 28%),
    linear-gradient(135deg, #18213f, #2b3a67 56%, #151b30);
}

.boot-card {
  width: min(720px, 100%);
  border: 4px solid #fbf7ef;
  border-radius: 24px;
  background: rgba(43, 58, 103, 0.92);
  box-shadow: 0 20px 0 rgba(0, 0, 0, 0.24);
  padding: 48px;
  text-align: center;
}

.eyebrow {
  margin: 0 0 12px;
  color: #f6c453;
  font-weight: 900;
  text-transform: uppercase;
}

h1 {
  margin: 0 0 16px;
  font-size: clamp(42px, 6vw, 72px);
  line-height: 1;
}
```

- [ ] **Step 4: Create PWA metadata**

Create `app/public/manifest.webmanifest`:

```json
{
  "name": "สายลับในออฟฟิศ",
  "short_name": "Office Spies",
  "start_url": ".",
  "display": "standalone",
  "orientation": "landscape",
  "background_color": "#2B3A67",
  "theme_color": "#2B3A67",
  "lang": "th"
}
```

Create `app/public/robots.txt`:

```text
User-agent: *
Disallow: /
```

- [ ] **Step 5: Ignore generated and install artifacts**

Update root `.gitignore`:

```gitignore
node_modules/
dist/
playwright-report/
test-results/
.DS_Store
.superpowers/
app/node_modules/
app/dist/
app/playwright-report/
app/test-results/
```

- [ ] **Step 6: Install dependencies**

Run:

```bash
cd app && npm install
```

Expected: dependencies install and `app/package-lock.json` is created.

- [ ] **Step 7: Verify scaffold**

Run:

```bash
cd app && npm run build
```

Expected: TypeScript and Vite build complete with no errors.

- [ ] **Step 8: Commit scaffold**

Run:

```bash
git add .gitignore app
git commit -m "Establish the game app foundation

Constraint: App code lives under app/ to preserve root design briefs.
Confidence: high
Scope-risk: narrow
Tested: cd app && npm run build
Not-tested: browser smoke test before UI exists"
```

Expected: one commit containing scaffold files.

---

## Task 2: Add Core Data And Types

**Files:**
- Create: `app/src/domain/types.ts`
- Create: `app/src/data/players.ts`
- Create: `app/src/data/configDefaults.ts`
- Create: `app/src/data/items.ts`
- Create: `app/src/data/quizBank.ts`
- Create: `app/src/data/tutorialScenes.ts`

- [ ] **Step 1: Define domain types**

Create `app/src/domain/types.ts`:

```ts
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
export type GamePhase = "boot" | "home" | "roleReveal" | "shop" | "gacha" | "quiz" | "vote" | "guess" | "refund" | "ended";
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
  history: GameActionLog[];
  settings: {
    soundEnabled: boolean;
    tutorialCompleted: boolean;
  };
  cluePurchasesByVoteRound: Record<string, boolean>;
  currentVoteRoundId: string | null;
  endWinner: EndWinner | null;
}

export interface GameActionLog {
  id: string;
  at: string;
  label: string;
}
```

- [ ] **Step 2: Add players**

Create `app/src/data/players.ts`:

```ts
import type { Player } from "../domain/types";

export const defaultPlayers: Player[] = [
  { id: "C001", code: "C001", name: "เรน มัศรินทร์", imageUrl: "https://lh3.googleusercontent.com/d/1szQVV5nqE9Wrs8E2rsGq_326sLjGPEkN" },
  { id: "C002", code: "C002", name: "เบ้นซ์ สุกัญญา", imageUrl: "https://lh3.googleusercontent.com/d/1T92lVNLVU42uw7T8UgG7fE4_Z_DZ1r3V" },
  { id: "C003", code: "C003", name: "อาย อนุธิดา", imageUrl: "https://lh3.googleusercontent.com/d/1L0dUHzCAfFggHOCdq5KeutOxl3vj_Ps9" },
  { id: "C004", code: "C004", name: "บี้ ปิยะนันท์", imageUrl: "https://lh3.googleusercontent.com/d/1ExYO7NtNKNTTQrLLjIIuFjOw52UfKQGX" },
  { id: "C005", code: "C005", name: "แป้ง บุษบาวรรณ", imageUrl: "https://lh3.googleusercontent.com/d/1GqnsrmDTWpgdyZ41H5iit0k1U8NIvF1n" },
  { id: "C006", code: "C006", name: "เตย มนัสนันท์", imageUrl: "https://lh3.googleusercontent.com/d/1fiZaaoPDu22H7KZ_dwFXhLfaTfXpMmUf" },
  { id: "C007", code: "C007", name: "แป้ง วศิณี", imageUrl: "https://lh3.googleusercontent.com/d/1CeZgS6-bZc1ntRe5mEC75__a4rNIFzdb" },
  { id: "C008", code: "C008", name: "แบม สุนิสา", imageUrl: "https://lh3.googleusercontent.com/d/1Eir0YERChc1tJiqrw0q9U0fUXEeAI6wy" },
  { id: "C009", code: "C009", name: "อีฟ พิมชนก", imageUrl: "https://lh3.googleusercontent.com/d/1d05jzX6gfUqZUCuqJRx8FArlC7-FVqAE" },
  { id: "C010", code: "C010", name: "เรย์ พรธิศา", imageUrl: "https://lh3.googleusercontent.com/d/1HjLBR1b3qoKXTKTJ9nBu3QtACwEOh3xP" },
  { id: "C011", code: "C011", name: "เบ้นซ์ กนกพร", imageUrl: "https://lh3.googleusercontent.com/d/1iKGto7htyXqIKgBRuOKpnsnDzOg-7F2g" },
];
```

- [ ] **Step 3: Add default config and item catalog**

Create `app/src/data/configDefaults.ts`:

```ts
import type { GameConfig } from "../domain/types";

export const defaultConfig: GameConfig = {
  spyCount: 2,
  thresholdRatio: 0.72,
  thresholdFloor: 2,
  voteBaseCostPerPresentPlayer: 3,
  skippedWorkingDayIncrease: 0.5,
  innocentRefundRatio: 0.25,
  spyPoolRevealMinVoted: 4,
  votedClueMinVoted: 3,
  cluePriceRatio: 0.25,
  notVotedClueMaxCards: 4,
  reduceThresholdPercent: 0.25,
  weakenedReduceThresholdPercent: 0.12,
  inventoryLimit: 2,
  quizCorrectReward: 10,
  quizWrongPenaltyPerPlayer: 3,
  gachaSpinCost: 5,
  gachaDailyLimitPerPlayer: 2,
  itemPrices: {
    double: 10,
    remove: 8,
    swap: 12,
    reduceThreshold: 12,
    protectThreshold: 12,
  },
  itemDailyLimits: {
    double: 1,
    remove: 1,
    swap: 1,
    reduceThreshold: 1,
    protectThreshold: 1,
  },
  gachaCoinSelfGain: 8,
  gachaCoinAllGain: 3,
  gachaCoinAllLose: 3,
  gachaPoorThreshold: 5,
  gachaPoorGain: 5,
  gachaVoteMultiplierUp: 1.5,
  gachaVoteMultiplierDown: 0.5,
  gachaWeights: {
    selfGain: 13,
    selfLoseAll: 9,
    allGain: 11,
    poorGain: 9,
    allLose: 9,
    voteUp: 9,
    voteDown: 8,
    grantItem: 9,
    grantQuiz: 15,
    spyShield: 8,
  },
};
```

Create `app/src/data/items.ts`:

```ts
import type { VoteItemType } from "../domain/types";

export interface ItemCatalogEntry {
  type: VoteItemType;
  label: string;
}

export const itemCatalog: ItemCatalogEntry[] = [
  { type: "double", label: "โหวต 2 เสียง" },
  { type: "remove", label: "ลบ 1 เสียง" },
  { type: "swap", label: "สลับผลโหวต" },
  { type: "reduceThreshold", label: "R ลดเกณฑ์ 25%" },
  { type: "protectThreshold", label: "P ป้องกันการลดเกณฑ์" },
];
```

- [ ] **Step 4: Add a representative quiz bank seed**

Create `app/src/data/quizBank.ts` with the full 100-question list from `07-quiz-bank.md`. Start with this exact structure and continue until all 100 entries are represented:

```ts
import type { QuizQuestion } from "../domain/types";

export const quizBank: QuizQuestion[] = [
  { id: "Q001", category: "Arithmetic", question: "7 × 8 = ?", choiceA: "54", choiceB: "56", answer: "B" },
  { id: "Q002", category: "Arithmetic", question: "144 ÷ 12 = ?", choiceA: "12", choiceB: "14", answer: "A" },
  { id: "Q003", category: "Arithmetic", question: "15% ของ 200 = ?", choiceA: "30", choiceB: "25", answer: "A" },
  { id: "Q004", category: "Arithmetic", question: "9 + 6 × 2 = ?", choiceA: "30", choiceB: "21", answer: "B" },
  { id: "Q005", category: "Arithmetic", question: "100 − 37 = ?", choiceA: "63", choiceB: "73", answer: "A" }
];
```

After creating the seed, add the remaining questions from `07-quiz-bank.md` using the same shape. Keep the marked answer from the source file even when a trick question has a longer explanation.

- [ ] **Step 5: Add tutorial scene metadata**

Create `app/src/data/tutorialScenes.ts`:

```ts
export interface TutorialScene {
  id: string;
  title: string;
  narration: string;
  shortMode: boolean;
}

export const tutorialScenes: TutorialScene[] = [
  {
    id: "intro",
    title: "เปิดเรื่อง",
    narration: "ในออฟฟิศนี้... มีสายลับแฝงตัวอยู่ 2 คน! ภารกิจของพวกเรา คือจับให้ได้ก่อนสิ้นสัปดาห์!",
    shortMode: false,
  },
  {
    id: "roles",
    title: "บทบาท",
    narration: "ตอนเริ่มเกม ทุกคนเดินมาดูบทบาทลับของตัวเองทีละคน — สายลับ 2 คนจะเห็นหน้ากันเอง แต่คนอื่นไม่รู้เลยว่าใครเป็นใคร!",
    shortMode: true,
  },
  {
    id: "coins",
    title: "เหรียญ = พลัง",
    narration: "ยิ่งขายเก่ง ยิ่งได้เหรียญ! เหรียญรับจริงที่ซุป แล้วเอามาเล่นเกมการเมือง — โหวต ซื้อไอเทม หมุนกาชา!",
    shortMode: true,
  },
  {
    id: "shop-gacha",
    title: "ร้านไอเทม & กาชา",
    narration: "ร้านไอเทมซื้อแบบลับ ไม่มีใครรู้ว่าคุณได้อะไร! ส่วนกาชา ถูกกว่าแต่สุ่ม — ได้เหรียญก็ได้ เสียก็ได้ ได้โจทย์เชาว์ก็ได้ หรือสายลับอาจได้เกราะลับ!",
    shortMode: false,
  },
  {
    id: "vote",
    title: "การโหวต",
    narration: "อยากกำจัดใคร ต้องช่วยกันรวมเหรียญเปิดโหวต! แล้วผลัดกันมากดลับๆ ห้ามคุยกัน — ระบบจะบอกแค่ชนะหรือแพ้ ไม่บอกตัวเลข!",
    shortMode: true,
  },
  {
    id: "clues",
    title: "หลังโหวต: เบาะแส",
    narration: "ถ้ามีคนถูกโหวตเยอะพอ ระบบจะกระซิบว่ามีสายลับปนอยู่กี่คน! แล้วทีมยังรวมเหรียญซื้อเบาะแส ดูรูปคนที่ถูกหรือไม่ถูกโหวตได้ด้วยนะ!",
    shortMode: false,
  },
  {
    id: "items",
    title: "ไอเทมโหวต",
    narration: "ตอนโหวตมีลูกเล่น! โหวต 2 เสียง ลบเสียง สลับผล หรือลดเกณฑ์ให้ชนะง่ายขึ้น — แต่มีไอเทมป้องกันไว้สู้ด้วย!",
    shortMode: false,
  },
  {
    id: "shield",
    title: "เกราะสายลับ",
    narration: "เกราะของสายลับทำงานเงียบที่สุด! ถ้าสายลับโดนจับได้ เกราะจะพลิกผลเป็นแพ้แบบไม่มีใครรู้",
    shortMode: false,
  },
  {
    id: "deadline",
    title: "แพ้-ชนะ & เวลา",
    narration: "เล่นกันยาวทั้งสัปดาห์! จับสายลับครบ 2 คน = ทีมชนะ! แต่ถ้าถึงวันสุดท้ายแล้วยังจับไม่ได้ สายลับชนะรวบทั้งคู่!",
    shortMode: true,
  },
  {
    id: "start",
    title: "เริ่มเล่น",
    narration: "พร้อมหรือยัง นักสืบทั้งหลาย? ขายให้กระจาย แล้วมาล่าสายลับกัน!",
    shortMode: false,
  },
];
```

- [ ] **Step 6: Verify types compile**

Run:

```bash
cd app && npm run build
```

Expected: build succeeds with no TypeScript errors.

- [ ] **Step 7: Commit data and types**

Run:

```bash
git add app/src/domain/types.ts app/src/data
git commit -m "Define the Office Spies game domain

Constraint: Game rules come from the approved markdown briefs.
Confidence: high
Scope-risk: narrow
Tested: cd app && npm run build
Not-tested: full quiz bank manually audited for trick-question wording"
```

Expected: one commit containing domain types and data files.

---

## Task 3: Implement Vote Economy Helpers

**Files:**
- Create: `app/src/domain/economy.ts`
- Create: `app/src/domain/economy.test.ts`

- [ ] **Step 1: Write economy tests**

Create `app/src/domain/economy.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { defaultConfig } from "../data/configDefaults";
import { calculateClueCost, calculateRefund, calculateThreshold, calculateVoteCost } from "./economy";

describe("economy helpers", () => {
  it("rounds the vote threshold from present players", () => {
    expect(calculateThreshold(11, defaultConfig)).toBe(8);
    expect(calculateThreshold(10, defaultConfig)).toBe(7);
    expect(calculateThreshold(9, defaultConfig)).toBe(6);
    expect(calculateThreshold(8, defaultConfig)).toBe(6);
  });

  it("keeps threshold between floor and present player count", () => {
    expect(calculateThreshold(1, defaultConfig)).toBe(1);
    expect(calculateThreshold(2, defaultConfig)).toBe(2);
  });

  it("scales vote cost by present players and multipliers", () => {
    expect(calculateVoteCost(11, 1, 1, defaultConfig)).toBe(33);
    expect(calculateVoteCost(10, 1.5, 1, defaultConfig)).toBe(45);
    expect(calculateVoteCost(10, 1, 0.5, defaultConfig)).toBe(15);
  });

  it("rounds clue cost down from the paid vote cost", () => {
    expect(calculateClueCost(33, defaultConfig)).toBe(8);
  });

  it("refunds one quarter rounded down", () => {
    expect(calculateRefund(33, defaultConfig)).toBe(8);
  });
});
```

- [ ] **Step 2: Run failing tests**

Run:

```bash
cd app && npx vitest run src/domain/economy.test.ts
```

Expected: FAIL because `./economy` does not exist.

- [ ] **Step 3: Implement economy helpers**

Create `app/src/domain/economy.ts`:

```ts
import type { GameConfig } from "./types";

export function calculateThreshold(presentCount: number, config: GameConfig): number {
  if (presentCount <= 0) return 0;
  const rounded = Math.round(config.thresholdRatio * presentCount);
  return Math.min(presentCount, Math.max(Math.min(config.thresholdFloor, presentCount), rounded));
}

export function calculateVoteCost(
  presentCount: number,
  accumulatedSkippedMultiplier: number,
  nextVoteMultiplier: number,
  config: GameConfig,
): number {
  const base = presentCount * config.voteBaseCostPerPresentPlayer;
  return Math.floor(base * accumulatedSkippedMultiplier * nextVoteMultiplier);
}

export function calculateClueCost(paidVoteCost: number, config: GameConfig): number {
  return Math.floor(paidVoteCost * config.cluePriceRatio);
}

export function calculateRefund(paidVoteCost: number, config: GameConfig): number {
  return Math.floor(paidVoteCost * config.innocentRefundRatio);
}

export function nextSkippedVoteMultiplier(current: number, config: GameConfig): number {
  return current * (1 + config.skippedWorkingDayIncrease);
}
```

- [ ] **Step 4: Run tests**

Run:

```bash
cd app && npx vitest run src/domain/economy.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit economy helpers**

Run:

```bash
git add app/src/domain/economy.ts app/src/domain/economy.test.ts
git commit -m "Protect vote economy calculations

Constraint: Costs and thresholds must scale with present players, not calendar dates.
Confidence: high
Scope-risk: narrow
Tested: cd app && npx vitest run src/domain/economy.test.ts
Not-tested: UI display of economy values"
```

---

## Task 4: Implement Role Assignment

**Files:**
- Create: `app/src/domain/random.ts`
- Create: `app/src/domain/roleEngine.ts`
- Create: `app/src/domain/roleEngine.test.ts`

- [ ] **Step 1: Write role tests**

Create `app/src/domain/roleEngine.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { assignSpyRoles } from "./roleEngine";

describe("assignSpyRoles", () => {
  it("assigns exactly one spy A and one spy B", () => {
    const roles = assignSpyRoles(["A", "B", "C", "D"], () => 0);
    expect(Object.values(roles).filter((role) => role === "spyA")).toHaveLength(1);
    expect(Object.values(roles).filter((role) => role === "spyB")).toHaveLength(1);
  });

  it("assigns normal to everyone else", () => {
    const roles = assignSpyRoles(["A", "B", "C", "D"], () => 0);
    expect(Object.values(roles).filter((role) => role === "normal")).toHaveLength(2);
  });

  it("throws when fewer than two players are available", () => {
    expect(() => assignSpyRoles(["A"], () => 0)).toThrow("At least two players are required");
  });
});
```

- [ ] **Step 2: Run failing tests**

Run:

```bash
cd app && npx vitest run src/domain/roleEngine.test.ts
```

Expected: FAIL because `roleEngine` does not exist.

- [ ] **Step 3: Implement deterministic shuffle and assignment**

Create `app/src/domain/random.ts`:

```ts
export type RandomSource = () => number;

export function shuffle<T>(items: T[], random: RandomSource = Math.random): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}
```

Create `app/src/domain/roleEngine.ts`:

```ts
import type { PlayerId, Role } from "./types";
import { type RandomSource, shuffle } from "./random";

export function assignSpyRoles(playerIds: PlayerId[], random: RandomSource = Math.random): Record<PlayerId, Role> {
  if (playerIds.length < 2) {
    throw new Error("At least two players are required to assign spies");
  }

  const [spyA, spyB] = shuffle(playerIds, random);

  return Object.fromEntries(
    playerIds.map((playerId) => {
      if (playerId === spyA) return [playerId, "spyA"];
      if (playerId === spyB) return [playerId, "spyB"];
      return [playerId, "normal"];
    }),
  );
}

export function findSpyPartner(roles: Record<PlayerId, Role>, playerId: PlayerId): PlayerId | null {
  const role = roles[playerId];
  if (role !== "spyA" && role !== "spyB") return null;
  const partnerRole: Role = role === "spyA" ? "spyB" : "spyA";
  return Object.entries(roles).find(([, candidateRole]) => candidateRole === partnerRole)?.[0] ?? null;
}
```

- [ ] **Step 4: Run tests**

Run:

```bash
cd app && npx vitest run src/domain/roleEngine.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit role engine**

Run:

```bash
git add app/src/domain/random.ts app/src/domain/roleEngine.ts app/src/domain/roleEngine.test.ts
git commit -m "Assign hidden spy roles deterministically

Constraint: Spy A and B must be distinct slots that can carry shield state.
Confidence: high
Scope-risk: narrow
Tested: cd app && npx vitest run src/domain/roleEngine.test.ts
Not-tested: role reveal UI"
```

---

## Task 5: Implement Vote Engine With Full Rule Coverage

**Files:**
- Create: `app/src/domain/voteEngine.ts`
- Create: `app/src/domain/voteEngine.test.ts`
- Modify: `app/src/domain/types.ts`

- [ ] **Step 1: Add vote engine types**

Append to `app/src/domain/types.ts`:

```ts
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
```

- [ ] **Step 2: Write vote engine tests**

Create `app/src/domain/voteEngine.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { defaultConfig } from "../data/configDefaults";
import type { Role, ShieldState, VoteEngineInput } from "./types";
import { calculateVoteResult, THRESHOLD_ITEM_BLOCKED_MESSAGE } from "./voteEngine";

const players = ["A", "B", "C", "D", "E", "F", "G", "H"];
const roles: Record<string, Role> = {
  A: "spyA",
  B: "spyB",
  C: "normal",
  D: "normal",
  E: "normal",
  F: "normal",
  G: "normal",
  H: "normal",
};
const noShield: ShieldState = { slot: null, exists: false, consumed: false };

function input(overrides: Partial<VoteEngineInput>): VoteEngineInput {
  return {
    presentPlayerIds: players,
    roles,
    votes: [],
    usedItems: [],
    config: defaultConfig,
    shield: noShield,
    ...overrides,
  };
}

describe("vote engine", () => {
  it("fails when no single player reaches threshold", () => {
    const result = calculateVoteResult(input({
      votes: [
        { voterId: "A", targetId: "C", doubleVote: false },
        { voterId: "B", targetId: "D", doubleVote: false },
      ],
    }));
    expect(result.publicResult).toBe("failed");
    expect(result.winnerId).toBeNull();
  });

  it("fails on tied winners even when both reach threshold", () => {
    const result = calculateVoteResult(input({
      votes: [
        { voterId: "A", targetId: "C", doubleVote: true },
        { voterId: "B", targetId: "C", doubleVote: true },
        { voterId: "C", targetId: "C", doubleVote: false },
        { voterId: "D", targetId: "D", doubleVote: true },
        { voterId: "E", targetId: "D", doubleVote: true },
        { voterId: "F", targetId: "D", doubleVote: false },
      ],
    }));
    expect(result.publicResult).toBe("failed");
  });

  it("catches an innocent when exactly one innocent reaches threshold", () => {
    const result = calculateVoteResult(input({
      votes: players.slice(0, 6).map((voterId) => ({ voterId, targetId: "C", doubleVote: false })),
    }));
    expect(result.publicResult).toBe("caughtInnocent");
    expect(result.winnerId).toBe("C");
  });

  it("catches a spy when exactly one spy reaches threshold", () => {
    const result = calculateVoteResult(input({
      votes: players.slice(0, 6).map((voterId) => ({ voterId, targetId: "A", doubleVote: false })),
    }));
    expect(result.publicResult).toBe("caughtSpy");
    expect(result.winnerId).toBe("A");
  });

  it("removes votes to zero and removes that player from voted pool", () => {
    const result = calculateVoteResult(input({
      votes: [{ voterId: "A", targetId: "C", doubleVote: false }],
      usedItems: [{ id: "i1", userId: "B", type: "remove", targetId: "C" }],
    }));
    expect(result.adjustedCounts.C).toBe(0);
    expect(result.votedPool).not.toContain("C");
  });

  it("swaps counts between two targets", () => {
    const result = calculateVoteResult(input({
      votes: [
        { voterId: "A", targetId: "C", doubleVote: false },
        { voterId: "B", targetId: "C", doubleVote: false },
        { voterId: "C", targetId: "D", doubleVote: false },
      ],
      usedItems: [{ id: "i1", userId: "E", type: "swap", firstTargetId: "C", secondTargetId: "D" }],
    }));
    expect(result.adjustedCounts.C).toBe(1);
    expect(result.adjustedCounts.D).toBe(2);
  });

  it("handles swap with self without changing counts", () => {
    const result = calculateVoteResult(input({
      votes: [{ voterId: "A", targetId: "C", doubleVote: false }],
      usedItems: [{ id: "i1", userId: "E", type: "swap", firstTargetId: "C", secondTargetId: "C" }],
    }));
    expect(result.adjustedCounts.C).toBe(1);
  });

  it("reduces threshold with R only", () => {
    const result = calculateVoteResult(input({
      votes: players.slice(0, 5).map((voterId) => ({ voterId, targetId: "C", doubleVote: false })),
      usedItems: [{ id: "r1", userId: "D", type: "reduceThreshold" }],
    }));
    expect(result.threshold).toBe(5);
    expect(result.publicResult).toBe("caughtInnocent");
  });

  it("blocks R when P comes first", () => {
    const result = calculateVoteResult(input({
      votes: players.slice(0, 5).map((voterId) => ({ voterId, targetId: "C", doubleVote: false })),
      usedItems: [
        { id: "p1", userId: "A", type: "protectThreshold" },
        { id: "r1", userId: "D", type: "reduceThreshold" },
      ],
    }));
    expect(result.threshold).toBe(6);
    expect(result.blockedMessages).toContain(THRESHOLD_ITEM_BLOCKED_MESSAGE);
    expect(result.publicResult).toBe("failed");
  });

  it("weakens R when P comes after R", () => {
    const result = calculateVoteResult(input({
      votes: players.slice(0, 5).map((voterId) => ({ voterId, targetId: "C", doubleVote: false })),
      usedItems: [
        { id: "r1", userId: "D", type: "reduceThreshold" },
        { id: "p1", userId: "A", type: "protectThreshold" },
      ],
    }));
    expect(result.threshold).toBe(5);
  });

  it("blocks duplicate R and duplicate P with generic messages", () => {
    const result = calculateVoteResult(input({
      usedItems: [
        { id: "r1", userId: "D", type: "reduceThreshold" },
        { id: "r2", userId: "E", type: "reduceThreshold" },
        { id: "p1", userId: "A", type: "protectThreshold" },
        { id: "p2", userId: "B", type: "protectThreshold" },
      ],
    }));
    expect(result.blockedMessages).toEqual([
      THRESHOLD_ITEM_BLOCKED_MESSAGE,
      THRESHOLD_ITEM_BLOCKED_MESSAGE,
    ]);
  });

  it("silently flips a shielded spy catch to failed and consumes shield internally", () => {
    const result = calculateVoteResult(input({
      votes: players.slice(0, 6).map((voterId) => ({ voterId, targetId: "A", doubleVote: false })),
      shield: { slot: "spyA", exists: true, consumed: false },
    }));
    expect(result.publicResult).toBe("failed");
    expect(result.winnerId).toBe("A");
    expect(result.shieldConsumed).toBe(true);
  });

  it("reveals spy count when voted pool has at least four players and includes a spy", () => {
    const result = calculateVoteResult(input({
      votes: [
        { voterId: "A", targetId: "A", doubleVote: false },
        { voterId: "B", targetId: "C", doubleVote: false },
        { voterId: "C", targetId: "D", doubleVote: false },
        { voterId: "D", targetId: "E", doubleVote: false },
      ],
    }));
    expect(result.spyPoolReveal).toEqual({ spies: 1, total: 4 });
  });

  it("does not reveal spy count when voted pool has only three players", () => {
    const result = calculateVoteResult(input({
      votes: [
        { voterId: "A", targetId: "A", doubleVote: false },
        { voterId: "B", targetId: "C", doubleVote: false },
        { voterId: "C", targetId: "D", doubleVote: false },
      ],
    }));
    expect(result.spyPoolReveal).toBeNull();
  });
});
```

- [ ] **Step 3: Run failing tests**

Run:

```bash
cd app && npx vitest run src/domain/voteEngine.test.ts
```

Expected: FAIL because `voteEngine` does not exist.

- [ ] **Step 4: Implement vote engine**

Create `app/src/domain/voteEngine.ts`:

```ts
import { calculateThreshold } from "./economy";
import type { PlayerId, Role, UsedVoteItem, VoteEngineInput, VoteEngineResult } from "./types";

export const THRESHOLD_ITEM_BLOCKED_MESSAGE = "มีคนใช้ไอเทมหมวดเกณฑ์ไปแล้ว";

export function calculateVoteResult(input: VoteEngineInput): VoteEngineResult {
  const counts = Object.fromEntries(input.presentPlayerIds.map((playerId) => [playerId, 0]));

  for (const vote of input.votes) {
    counts[vote.targetId] = Math.max(0, (counts[vote.targetId] ?? 0) + (vote.doubleVote ? 2 : 1));
  }

  for (const item of input.usedItems) {
    if (item.type === "remove") {
      counts[item.targetId] = Math.max(0, (counts[item.targetId] ?? 0) - 1);
    }
  }

  for (const item of input.usedItems) {
    if (item.type === "swap") {
      const first = counts[item.firstTargetId] ?? 0;
      const second = counts[item.secondTargetId] ?? 0;
      counts[item.firstTargetId] = second;
      counts[item.secondTargetId] = first;
    }
  }

  const { reduction, blockedMessages } = resolveThresholdItems(input.usedItems, input.config);
  const baseThreshold = calculateThreshold(input.presentPlayerIds.length, input.config);
  const threshold = Math.max(input.config.thresholdFloor, Math.round(baseThreshold * (1 - reduction)));

  const candidates = Object.entries(counts).filter(([, count]) => count >= threshold);
  const winnerId = candidates.length === 1 ? candidates[0][0] : null;
  const winnerRole = winnerId ? input.roles[winnerId] : null;
  const winnerIsSpy = winnerRole === "spyA" || winnerRole === "spyB";
  const shieldApplies =
    winnerIsSpy &&
    input.shield.exists &&
    !input.shield.consumed &&
    input.shield.slot === winnerRole;

  let publicResult: VoteEngineResult["publicResult"] = "failed";
  if (winnerId && !shieldApplies) {
    publicResult = winnerIsSpy ? "caughtSpy" : "caughtInnocent";
  }

  const votedPool = input.presentPlayerIds.filter((playerId) => (counts[playerId] ?? 0) >= 1);
  const notVotedPool = input.presentPlayerIds.filter((playerId) => !votedPool.includes(playerId));
  const spiesInPoolCount = votedPool.filter((playerId) => isSpy(input.roles[playerId])).length;
  const spyPoolReveal =
    votedPool.length >= input.config.spyPoolRevealMinVoted && spiesInPoolCount > 0
      ? { spies: spiesInPoolCount, total: votedPool.length }
      : null;

  return {
    publicResult,
    winnerId,
    winnerIsSpy,
    shieldConsumed: Boolean(shieldApplies),
    adjustedCounts: counts,
    votedPool,
    notVotedPool,
    spiesInPoolCount,
    spyPoolReveal,
    threshold,
    blockedMessages,
  };
}

function isSpy(role: Role): boolean {
  return role === "spyA" || role === "spyB";
}

function resolveThresholdItems(
  usedItems: UsedVoteItem[],
  config: VoteEngineInput["config"],
): { reduction: number; blockedMessages: string[] } {
  let reduction = 0;
  let usedR = false;
  let usedP = false;
  const blockedMessages: string[] = [];

  for (const item of usedItems) {
    if (item.type === "reduceThreshold") {
      if (usedR || usedP) {
        blockedMessages.push(THRESHOLD_ITEM_BLOCKED_MESSAGE);
      } else {
        reduction = config.reduceThresholdPercent;
        usedR = true;
      }
    }

    if (item.type === "protectThreshold") {
      if (usedP) {
        blockedMessages.push(THRESHOLD_ITEM_BLOCKED_MESSAGE);
      } else {
        if (usedR) {
          reduction = config.weakenedReduceThresholdPercent;
        }
        usedP = true;
      }
    }
  }

  return { reduction, blockedMessages };
}
```

- [ ] **Step 5: Run vote engine tests**

Run:

```bash
cd app && npx vitest run src/domain/voteEngine.test.ts
```

Expected: PASS.

- [ ] **Step 6: Run all domain tests**

Run:

```bash
cd app && npm run test
```

Expected: PASS.

- [ ] **Step 7: Commit vote engine**

Run:

```bash
git add app/src/domain
git commit -m "Make vote resolution deterministic

Constraint: 01-game-design-spec.md is the source of truth for vote order and shield secrecy.
Rejected: Computing vote effects inside React components | UI animation must not affect game results.
Confidence: high
Scope-risk: moderate
Directive: Never expose adjustedCounts in public vote UI.
Tested: cd app && npm run test
Not-tested: full vote flow browser interaction"
```

---

## Task 5A: Implement Gacha Engine And Vote Multiplier Actions

**Files:**
- Create: `app/src/domain/gachaEngine.ts`
- Create: `app/src/domain/gachaEngine.test.ts`
- Modify: `app/src/state/actions.ts`
- Modify: `app/src/state/actions.test.ts`

- [ ] **Step 1: Write gacha engine tests**

Create `app/src/domain/gachaEngine.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { defaultConfig } from "../data/configDefaults";
import type { GachaOutcome } from "./types";
import { resolveGachaOutcome, selectWeightedGachaOutcome } from "./gachaEngine";

describe("gacha engine", () => {
  it("selects an outcome by normalized weights", () => {
    const weights: Record<GachaOutcome, number> = {
      selfGain: 1,
      selfLoseAll: 0,
      allGain: 0,
      poorGain: 0,
      allLose: 0,
      voteUp: 0,
      voteDown: 0,
      grantItem: 0,
      grantQuiz: 0,
      spyShield: 0,
    };
    expect(selectWeightedGachaOutcome(weights, () => 0.99)).toBe("selfGain");
  });

  it("falls back from spy shield to all gain when shield already exists", () => {
    expect(resolveGachaOutcome("spyShield", { inventoryFull: false, shieldAvailable: false })).toBe("allGain");
  });

  it("falls back from grant item to self gain when inventory is full", () => {
    expect(resolveGachaOutcome("grantItem", { inventoryFull: true, shieldAvailable: true })).toBe("selfGain");
  });

  it("keeps configured vote multiplier values", () => {
    expect(defaultConfig.gachaVoteMultiplierUp).toBe(1.5);
    expect(defaultConfig.gachaVoteMultiplierDown).toBe(0.5);
    expect(defaultConfig.gachaWeights.grantQuiz).toBe(15);
  });
});
```

- [ ] **Step 2: Run failing tests**

Run:

```bash
cd app && npx vitest run src/domain/gachaEngine.test.ts
```

Expected: FAIL because `gachaEngine` does not exist.

- [ ] **Step 3: Implement gacha engine**

Create `app/src/domain/gachaEngine.ts`:

```ts
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
  context: { inventoryFull: boolean; shieldAvailable: boolean },
): GachaOutcome {
  if (outcome === "spyShield" && !context.shieldAvailable) return "allGain";
  if (outcome === "grantItem" && context.inventoryFull) return "selfGain";
  return outcome;
}
```

- [ ] **Step 4: Add vote multiplier action tests**

Append to `app/src/state/actions.test.ts`:

```ts
it("applies next vote multiplier from gacha", () => {
  const state = applyGachaVoteMultiplier(createInitialGameState(), 1.5);
  expect(state.voteCostState.nextVoteMultiplier).toBe(1.5);
});
```

- [ ] **Step 5: Implement vote multiplier action**

Add to `app/src/state/actions.ts`:

```ts
export function applyGachaVoteMultiplier(state: GameState, multiplier: 1.5 | 0.5): GameState {
  return log(
    {
      ...state,
      voteCostState: { ...state.voteCostState, nextVoteMultiplier: multiplier },
    },
    `กาชาตั้งตัวคูณค่าโหวตครั้งถัดไป x${multiplier}`,
  );
}
```

- [ ] **Step 6: Run tests**

Run:

```bash
cd app && npx vitest run src/domain/gachaEngine.test.ts src/state/actions.test.ts
```

Expected: PASS.

---

## Task 5B: Implement Config Validation And Settings Contract

**Files:**
- Create: `app/src/domain/configValidation.ts`
- Create: `app/src/domain/configValidation.test.ts`
- Modify: `app/src/state/actions.ts`
- Modify: `app/src/state/actions.test.ts`
- Create: `app/src/features/settings/SettingsPanel.tsx`

- [ ] **Step 1: Write config validation tests**

Create `app/src/domain/configValidation.test.ts`:

```ts
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
    expect(() =>
      normalizeAndValidateConfig({ ...defaultConfig, weakenedReduceThresholdPercent: 0.5 }, 11),
    ).toThrow("ค่า P อ่อนเกณฑ์ต้องไม่มากกว่า R");
  });
});
```

- [ ] **Step 2: Implement config validation**

Create `app/src/domain/configValidation.ts`:

```ts
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
  if (config.cluePriceRatio < 0 || config.cluePriceRatio > 1 || config.innocentRefundRatio < 0 || config.innocentRefundRatio > 1) {
    throw new Error("สัดส่วนต้องอยู่ระหว่าง 0 และ 1");
  }
  if (config.reduceThresholdPercent < 0 || config.reduceThresholdPercent > 1 || config.weakenedReduceThresholdPercent < 0 || config.weakenedReduceThresholdPercent > 1) {
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
```

- [ ] **Step 3: Add updateConfig action**

Add to `app/src/state/actions.ts`:

```ts
export function updateConfig(state: GameState, patch: Partial<GameConfig>): GameState {
  const presentCount = Object.values(state.attendance).filter(Boolean).length;
  const config = normalizeAndValidateConfig({ ...state.config, ...patch }, state.players.length);
  calculateThreshold(presentCount, config);
  return log({ ...state, config }, "อัปเดต Settings");
}
```

Also import `GameConfig`, `normalizeAndValidateConfig`, and `calculateThreshold`.

- [ ] **Step 4: Add SettingsPanel UI**

Create `app/src/features/settings/SettingsPanel.tsx` as a tabbed/sectioned form that edits every value in `state.config`, including item prices/limits and all 10 gacha weights. It must call `updateConfig` on save, show thrown Thai errors, support reset to `defaultConfig`, and show live examples for 11 players: vote threshold and opening cost.

Use large landscape-friendly number inputs and steppers. Every number in `04-config-defaults.md` must have a visible field.

- [ ] **Step 5: Run tests**

Run:

```bash
cd app && npx vitest run src/domain/configValidation.test.ts src/state/actions.test.ts
```

Expected: PASS.

---

## Task 5C: Implement Post-Vote Clue Helper

**Files:**
- Create: `app/src/domain/clueEngine.ts`
- Create: `app/src/domain/clueEngine.test.ts`

- [ ] **Step 1: Write clue tests**

Create `app/src/domain/clueEngine.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { defaultConfig } from "../data/configDefaults";
import { drawClue } from "./clueEngine";

describe("drawClue", () => {
  it("charges but gives no card when voted pool has fewer than three players", () => {
    expect(drawClue(["A", "B"], ["C"], "voted", defaultConfig, () => 0)).toEqual({ kind: "paid-empty", playerIds: [] });
  });

  it("draws one voted player when threshold is met", () => {
    expect(drawClue(["A", "B", "C"], ["D"], "voted", defaultConfig, () => 0).playerIds).toEqual(["A"]);
  });

  it("draws up to four not-voted players", () => {
    expect(drawClue(["A"], ["B", "C", "D", "E", "F"], "notVoted", defaultConfig, () => 0).playerIds).toHaveLength(4);
  });
});
```

- [ ] **Step 2: Implement clue helper**

Create `app/src/domain/clueEngine.ts`:

```ts
import type { GameConfig, PlayerId } from "./types";
import type { RandomSource } from "./random";
import { shuffle } from "./random";

export type ClueOption = "voted" | "notVoted";
export type ClueResult = { kind: "cards"; playerIds: PlayerId[] } | { kind: "paid-empty"; playerIds: [] };

export function drawClue(
  votedPool: PlayerId[],
  notVotedPool: PlayerId[],
  option: ClueOption,
  config: GameConfig,
  random: RandomSource = Math.random,
): ClueResult {
  if (option === "voted") {
    if (votedPool.length < config.votedClueMinVoted) return { kind: "paid-empty", playerIds: [] };
    return { kind: "cards", playerIds: [shuffle(votedPool, random)[0]] };
  }
  return { kind: "cards", playerIds: shuffle(notVotedPool, random).slice(0, config.notVotedClueMaxCards) };
}
```

- [ ] **Step 3: Run tests**

Run:

```bash
cd app && npx vitest run src/domain/clueEngine.test.ts
```

Expected: PASS.

---

## Task 6: Implement Game State, Actions, IndexedDB, And Backup

**Files:**
- Create: `app/src/state/gameState.ts`
- Create: `app/src/state/actions.ts`
- Create: `app/src/state/actions.test.ts`
- Create: `app/src/state/storage.ts`
- Create: `app/src/state/backup.ts`
- Create: `app/src/state/backup.test.ts`
- Create: `app/src/state/useGameStore.tsx`

- [ ] **Step 1: Create initial state factory**

Create `app/src/state/gameState.ts`:

```ts
import { defaultConfig } from "../data/configDefaults";
import { defaultPlayers } from "../data/players";
import type { GameState, PlayerId } from "../domain/types";

export function createInitialGameState(): GameState {
  const attendance = Object.fromEntries(defaultPlayers.map((player) => [player.id, true])) as Record<PlayerId, boolean>;
  const roles = Object.fromEntries(defaultPlayers.map((player) => [player.id, "normal"])) as GameState["roles"];
  const inventories = Object.fromEntries(defaultPlayers.map((player) => [player.id, []])) as GameState["inventories"];

  return {
    version: 1,
    phase: "home",
    players: defaultPlayers,
    config: defaultConfig,
    attendance,
    roles,
    inventories,
    shield: { slot: null, exists: false, consumed: false },
    manualDay: {
      index: 1,
      label: "วันเล่นที่ 1",
      openedVoteToday: false,
      isFinalDay: false,
      history: [{ actionId: "initial", kind: "start", label: "วันเล่นที่ 1", voteCostMultiplierAfter: 1 }],
    },
    voteCostState: { accumulatedSkippedMultiplier: 1, nextVoteMultiplier: 1 },
    usedQuizIds: [],
    history: [{ id: "initial", at: new Date(0).toISOString(), label: "สร้างเกมใหม่" }],
    settings: { soundEnabled: true, tutorialCompleted: false },
    cluePurchasesByVoteRound: {},
    currentVoteRoundId: null,
    endWinner: null,
  };
}
```

- [ ] **Step 2: Write action tests**

Create `app/src/state/actions.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { assignNewRoles, endWorkingDay, markFinalDay, openVote, restDay } from "./actions";
import { createInitialGameState } from "./gameState";

describe("game actions", () => {
  it("ending a working day without vote increases vote cost multiplier", () => {
    const state = endWorkingDay(createInitialGameState(), "วันเล่นที่ 2");
    expect(state.voteCostState.accumulatedSkippedMultiplier).toBe(1.5);
    expect(state.manualDay.label).toBe("วันเล่นที่ 2");
  });

  it("rest day does not increase vote cost multiplier", () => {
    const state = restDay(createInitialGameState(), "พักวันพุธ");
    expect(state.voteCostState.accumulatedSkippedMultiplier).toBe(1);
    expect(state.manualDay.label).toBe("พักวันพุธ");
  });

  it("opening a vote resets skipped multiplier and marks the day", () => {
    const skipped = endWorkingDay(createInitialGameState(), "วันเล่นที่ 2");
    const state = openVote(skipped);
    expect(state.voteCostState.accumulatedSkippedMultiplier).toBe(1);
    expect(state.voteCostState.nextVoteMultiplier).toBe(1);
    expect(state.manualDay.openedVoteToday).toBe(true);
  });

  it("final day gives spies the win when team has not won", () => {
    const state = markFinalDay(createInitialGameState());
    expect(state.phase).toBe("ended");
    expect(state.endWinner).toBe("spies");
  });

  it("assignNewRoles assigns two spies", () => {
    const state = assignNewRoles(createInitialGameState(), () => 0);
    expect(Object.values(state.roles).filter((role) => role === "spyA")).toHaveLength(1);
    expect(Object.values(state.roles).filter((role) => role === "spyB")).toHaveLength(1);
  });

  it("assignNewRoles preserves inventory and shield state", () => {
    const original = createInitialGameState();
    original.inventories.C001 = [{ id: "item-1", type: "double", source: "shop", publicKnown: false, createdAtActionId: "a1" }];
    original.shield = { slot: "spyA", exists: true, consumed: false };
    const state = assignNewRoles(original, () => 0);
    expect(state.inventories.C001).toEqual(original.inventories.C001);
    expect(state.shield).toEqual(original.shield);
  });
});
```

- [ ] **Step 3: Implement actions**

Create `app/src/state/actions.ts`:

```ts
import { assignSpyRoles } from "../domain/roleEngine";
import type { GameState } from "../domain/types";
import { nextSkippedVoteMultiplier } from "../domain/economy";
import type { RandomSource } from "../domain/random";

function log(state: GameState, label: string): GameState {
  const entry = { id: crypto.randomUUID(), at: new Date().toISOString(), label };
  return { ...state, history: [...state.history, entry] };
}

export function assignNewRoles(state: GameState, random: RandomSource = Math.random): GameState {
  const roles = assignSpyRoles(state.players.map((player) => player.id), random);
  return log({ ...state, roles, phase: "roleReveal" }, "สุ่มบทบาทใหม่");
}

export function openVote(state: GameState): GameState {
  if (state.manualDay.openedVoteToday) {
    throw new Error("วันนี้เปิดโหวตไปแล้ว");
  }
  return log(
    {
      ...state,
      phase: "vote",
      manualDay: { ...state.manualDay, openedVoteToday: true },
      voteCostState: { accumulatedSkippedMultiplier: 1, nextVoteMultiplier: 1 },
      currentVoteRoundId: crypto.randomUUID(),
    },
    "เปิดโหวต",
  );
}

export function endWorkingDay(state: GameState, nextLabel: string): GameState {
  const nextMultiplier = state.manualDay.openedVoteToday
    ? state.voteCostState.accumulatedSkippedMultiplier
    : nextSkippedVoteMultiplier(state.voteCostState.accumulatedSkippedMultiplier, state.config);
  return log(
    {
      ...state,
      phase: "home",
      manualDay: {
        ...state.manualDay,
        index: state.manualDay.index + 1,
        label: nextLabel,
        openedVoteToday: false,
        history: [
          ...state.manualDay.history,
          { actionId: crypto.randomUUID(), kind: "end-working-day", label: nextLabel, voteCostMultiplierAfter: nextMultiplier },
        ],
      },
      voteCostState: { ...state.voteCostState, accumulatedSkippedMultiplier: nextMultiplier },
    },
    "จบวันทำงาน",
  );
}

export function restDay(state: GameState, nextLabel: string): GameState {
  return log(
    {
      ...state,
      phase: "home",
      manualDay: {
        ...state.manualDay,
        index: state.manualDay.index + 1,
        label: nextLabel,
        openedVoteToday: false,
        history: [
          ...state.manualDay.history,
          {
            actionId: crypto.randomUUID(),
            kind: "rest-day",
            label: nextLabel,
            voteCostMultiplierAfter: state.voteCostState.accumulatedSkippedMultiplier,
          },
        ],
      },
    },
    "พักวันโดยไม่เพิ่มค่าโหวต",
  );
}

export function markFinalDay(state: GameState): GameState {
  if (state.endWinner) return state;
  return log(
    {
      ...state,
      phase: "ended",
      endWinner: "spies",
      manualDay: { ...state.manualDay, isFinalDay: true },
    },
    "เข้าสู่วันสุดท้ายและสายลับชนะ",
  );
}
```

- [ ] **Step 4: Run action tests**

Run:

```bash
cd app && npx vitest run src/state/actions.test.ts
```

Expected: PASS.

- [ ] **Step 5: Implement IndexedDB storage**

Create `app/src/state/storage.ts`:

```ts
import type { GameState } from "../domain/types";

const DB_NAME = "office-spies-game";
const STORE_NAME = "state";
const STATE_KEY = "current";

export async function saveGameState(state: GameState): Promise<void> {
  const db = await openDb();
  await requestToPromise(db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(state, STATE_KEY));
  localStorage.setItem("office-spies:last-save", new Date().toISOString());
}

export async function loadGameState(): Promise<GameState | null> {
  const db = await openDb();
  return requestToPromise<GameState | undefined>(db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(STATE_KEY)).then(
    (state) => state ?? null,
  );
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
```

- [ ] **Step 6: Implement backup validation**

Create `app/src/state/backup.ts`:

```ts
import type { GameState } from "../domain/types";

export function exportBackup(state: GameState): string {
  return JSON.stringify({ exportedAt: new Date().toISOString(), state }, null, 2);
}

export function parseBackup(raw: string): GameState {
  const parsed = JSON.parse(raw) as { state?: unknown };
  if (!parsed || typeof parsed !== "object" || !("state" in parsed)) {
    throw new Error("ไฟล์ backup ไม่ถูกต้อง");
  }
  const state = parsed.state as Partial<GameState>;
  if (state.version !== 1 || !Array.isArray(state.players) || !state.config || !state.manualDay) {
    throw new Error("backup version หรือโครงสร้างไม่ตรงกับเกมนี้");
  }
  return state as GameState;
}
```

Create `app/src/state/backup.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createInitialGameState } from "./gameState";
import { exportBackup, parseBackup } from "./backup";

describe("backup", () => {
  it("exports and imports state", () => {
    const state = createInitialGameState();
    expect(parseBackup(exportBackup(state)).players).toHaveLength(11);
  });

  it("rejects invalid backup", () => {
    expect(() => parseBackup("{}")).toThrow("ไฟล์ backup ไม่ถูกต้อง");
  });
});
```

- [ ] **Step 7: Implement React state provider**

Create `app/src/state/useGameStore.tsx`:

```tsx
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";
import type { GameState } from "../domain/types";
import { createInitialGameState } from "./gameState";
import { loadGameState, saveGameState } from "./storage";

interface GameStoreValue {
  state: GameState;
  setState: (updater: GameState | ((state: GameState) => GameState)) => void;
  hydrated: boolean;
}

const GameStoreContext = createContext<GameStoreValue | null>(null);

export function GameStoreProvider({ children }: { children: ReactNode }) {
  const [state, setRawState] = useState<GameState>(() => createInitialGameState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    loadGameState().then((saved) => {
      if (saved) setRawState(saved);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (hydrated) void saveGameState(state);
  }, [hydrated, state]);

  const value = useMemo<GameStoreValue>(
    () => ({
      state,
      hydrated,
      setState: (updater) => {
        setRawState((current) => (typeof updater === "function" ? updater(current) : updater));
      },
    }),
    [hydrated, state],
  );

  return <GameStoreContext.Provider value={value}>{children}</GameStoreContext.Provider>;
}

export function useGameStore(): GameStoreValue {
  const value = useContext(GameStoreContext);
  if (!value) throw new Error("useGameStore must be used inside GameStoreProvider");
  return value;
}
```

- [ ] **Step 8: Run state tests**

Run:

```bash
cd app && npx vitest run src/state
```

Expected: PASS.

- [ ] **Step 9: Commit state layer**

Run:

```bash
git add app/src/state
git commit -m "Persist game state on the iPad

Constraint: A week-long game must survive refreshes and avoid server-side state.
Rejected: Backend persistence | This release targets GitHub Pages static hosting.
Confidence: high
Scope-risk: moderate
Directive: Keep all game mutations in action helpers or reducers, not UI event bodies.
Tested: cd app && npx vitest run src/state
Not-tested: IndexedDB behavior on physical iPad Safari"
```

---

## Task 7: Build Shared Game UI Components

**Files:**
- Create: `app/src/ui/components/PlayerCard.tsx`
- Create: `app/src/ui/components/PlayerPicker.tsx`
- Create: `app/src/ui/components/ConfirmPlayer.tsx`
- Create: `app/src/ui/components/HandOffCurtain.tsx`
- Create: `app/src/ui/components/GameButton.tsx`
- Create: `app/src/ui/components/StatusBadge.tsx`
- Modify: `app/src/styles/global.css`

- [ ] **Step 1: Create core button and status components**

Create `app/src/ui/components/GameButton.tsx`:

```tsx
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "danger" | "paper";

export function GameButton({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: Variant }) {
  return (
    <button className={`game-button game-button--${variant} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
```

Create `app/src/ui/components/StatusBadge.tsx`:

```tsx
export function StatusBadge({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="status-badge">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
```

- [ ] **Step 2: Create player card**

Create `app/src/ui/components/PlayerCard.tsx`:

```tsx
import type { Player } from "../../domain/types";

export function PlayerCard({ player, selected, onClick }: { player: Player; selected?: boolean; onClick?: () => void }) {
  return (
    <button className={`player-card ${selected ? "player-card--selected" : ""}`} onClick={onClick} type="button">
      <span className="player-card__photo-wrap">
        <img
          className="player-card__photo"
          src={player.imageUrl}
          alt={player.name}
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
        <span className="player-card__fallback">{player.code}</span>
      </span>
      <span className="player-card__name">{player.name}</span>
      <span className="player-card__code">{player.code}</span>
    </button>
  );
}
```

- [ ] **Step 3: Create picker and confirm components**

Create `app/src/ui/components/PlayerPicker.tsx`:

```tsx
import type { Player, PlayerId } from "../../domain/types";
import { PlayerCard } from "./PlayerCard";

export function PlayerPicker({
  title,
  players,
  onPick,
}: {
  title: string;
  players: Player[];
  onPick: (playerId: PlayerId) => void;
}) {
  return (
    <section className="scene-panel">
      <h2>{title}</h2>
      <div className="player-grid">
        {players.map((player) => (
          <PlayerCard key={player.id} player={player} onClick={() => onPick(player.id)} />
        ))}
      </div>
    </section>
  );
}
```

Create `app/src/ui/components/ConfirmPlayer.tsx`:

```tsx
import type { Player } from "../../domain/types";
import { GameButton } from "./GameButton";
import { PlayerCard } from "./PlayerCard";

export function ConfirmPlayer({
  player,
  actionLabel,
  onConfirm,
  onBack,
}: {
  player: Player;
  actionLabel: string;
  onConfirm: () => void;
  onBack: () => void;
}) {
  return (
    <section className="scene-panel confirm-player">
      <h2>คุณคือ {player.name} ใช่ไหม?</h2>
      <PlayerCard player={player} selected />
      <div className="button-row">
        <GameButton variant="paper" onClick={onBack}>เลือกใหม่</GameButton>
        <GameButton onClick={onConfirm}>{actionLabel}</GameButton>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create hand-off curtain**

Create `app/src/ui/components/HandOffCurtain.tsx`:

```tsx
import { GameButton } from "./GameButton";

export function HandOffCurtain({ message, onContinue }: { message: string; onContinue: () => void }) {
  return (
    <section className="handoff-curtain">
      <div className="handoff-curtain__spotlight">🔎</div>
      <h2>{message}</h2>
      <p>ส่ง iPad ให้คนถัดไป แล้วค่อยกดต่อ</p>
      <GameButton onClick={onContinue}>พร้อมแล้ว</GameButton>
    </section>
  );
}
```

- [ ] **Step 5: Add shared game CSS**

Append to `app/src/styles/global.css`:

```css
.scene-panel {
  width: min(1120px, 100%);
  margin: 0 auto;
  border: 4px solid #fbf7ef;
  border-radius: 24px;
  background: rgba(24, 33, 63, 0.9);
  box-shadow: 0 18px 0 rgba(0, 0, 0, 0.24);
  padding: 28px;
}

.scene-panel h2 {
  margin: 0 0 24px;
  color: #f6c453;
  font-size: clamp(32px, 4vw, 48px);
  text-align: center;
}

.player-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
}

.player-card {
  border: 3px solid #20263f;
  border-radius: 20px;
  background: #fbf7ef;
  color: #20263f;
  box-shadow: 0 9px 0 rgba(0, 0, 0, 0.22);
  padding: 12px;
  text-align: center;
  cursor: pointer;
  transition: transform 150ms ease, box-shadow 150ms ease;
}

.player-card:active {
  transform: translateY(5px) scale(0.98);
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.22);
}

.player-card--selected {
  outline: 5px solid #f6c453;
}

.player-card__photo-wrap {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  border-radius: 16px;
  background: linear-gradient(140deg, #ffd66b, #3dcca1);
  border: 3px solid white;
}

.player-card__photo {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.player-card__fallback {
  position: absolute;
  color: #2b3a67;
  font-size: 32px;
  font-weight: 1000;
}

.player-card__name {
  display: block;
  margin-top: 10px;
  font-size: 21px;
  font-weight: 1000;
  line-height: 1.15;
}

.player-card__code {
  display: inline-block;
  margin-top: 8px;
  border-radius: 999px;
  background: #e94f37;
  color: white;
  padding: 5px 10px;
  font-weight: 1000;
}

.button-row {
  display: flex;
  justify-content: center;
  gap: 18px;
  margin-top: 24px;
}

.game-button {
  min-width: 180px;
  min-height: 64px;
  border: 3px solid #20263f;
  border-radius: 16px;
  box-shadow: 0 8px 0 rgba(0, 0, 0, 0.25);
  font-weight: 1000;
  cursor: pointer;
}

.game-button--primary {
  background: #f6c453;
  color: #20263f;
}

.game-button--danger {
  background: #e94f37;
  color: white;
}

.game-button--paper {
  background: #fbf7ef;
  color: #20263f;
}

.status-badge {
  border: 3px solid #20263f;
  border-radius: 16px;
  background: #fbf7ef;
  color: #20263f;
  padding: 10px 14px;
  text-align: center;
  box-shadow: 0 7px 0 rgba(0, 0, 0, 0.22);
}

.status-badge strong {
  display: block;
  font-size: 28px;
}

.status-badge span {
  color: #62677b;
  font-size: 13px;
  font-weight: 900;
}

.handoff-curtain {
  min-height: 100vh;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 18px;
  padding: 32px;
  text-align: center;
  background:
    radial-gradient(circle, rgba(246, 196, 83, 0.42), transparent 34%),
    linear-gradient(135deg, #151b30, #2b3a67);
}

.handoff-curtain__spotlight {
  font-size: 86px;
}

.handoff-curtain h2 {
  margin: 0;
  font-size: clamp(42px, 7vw, 84px);
}

.handoff-curtain p {
  margin: 0;
  color: #ffe9b6;
  font-size: 24px;
  font-weight: 900;
}
```

- [ ] **Step 6: Verify UI compile**

Run:

```bash
cd app && npm run build
```

Expected: build succeeds.

- [ ] **Step 7: Commit shared UI**

Run:

```bash
git add app/src/ui app/src/styles/global.css
git commit -m "Create the shared game UI language

Constraint: Player identity cards must use large 4:5 real-photo layouts.
Confidence: high
Scope-risk: narrow
Tested: cd app && npm run build
Not-tested: touch accuracy on physical iPad"
```

---

## Task 8: Implement Boot, Home, Manual Day, And Backup Screens

**Files:**
- Modify: `app/src/App.tsx`
- Create: `app/src/features/boot/BootScreen.tsx`
- Create: `app/src/features/home/HomeHub.tsx`
- Create: `app/src/features/day/ManualDayPanel.tsx`
- Create: `app/src/features/attendance/AttendancePanel.tsx`
- Create: `app/src/features/settings/SettingsPanel.tsx`
- Modify: `app/src/styles/global.css`

- [ ] **Step 1: Wrap app with store**

Modify `app/src/App.tsx`:

```tsx
import { BootScreen } from "./features/boot/BootScreen";
import { HomeHub } from "./features/home/HomeHub";
import { GameStoreProvider, useGameStore } from "./state/useGameStore";

export function App() {
  return (
    <GameStoreProvider>
      <AppRouter />
    </GameStoreProvider>
  );
}

function AppRouter() {
  const { hydrated, state } = useGameStore();
  if (!hydrated) return <main className="app-shell"><p>กำลังโหลดคดี...</p></main>;
  if (state.phase === "boot") return <BootScreen />;
  return <HomeHub />;
}
```

- [ ] **Step 2: Create boot screen**

Create `app/src/features/boot/BootScreen.tsx`:

```tsx
import { useState } from "react";
import { HomeHub } from "../home/HomeHub";
import { GameButton } from "../../ui/components/GameButton";

export function BootScreen() {
  const [unlocked, setUnlocked] = useState(false);

  if (unlocked) return <HomeHub />;

  return (
    <main className="app-shell">
      <section className="boot-card">
        <p className="eyebrow">Office Spies</p>
        <h1>สายลับในออฟฟิศ</h1>
        <p>แตะเริ่มเพื่อปลดล็อกเสียงและเข้าสู่กระดานคดี</p>
        <div className="button-row">
          <GameButton onClick={() => setUnlocked(true)}>เริ่มเกม</GameButton>
        </div>
      </section>
    </main>
  );
}
```

When the app is already unlocked and later returns to `phase: "home"`, render `HomeHub` directly from `AppRouter`. Do not show the audio unlock screen again.

- [ ] **Step 3: Create home hub**

Create `app/src/features/home/HomeHub.tsx`:

```tsx
import { calculateVoteCost } from "../../domain/economy";
import { useGameStore } from "../../state/useGameStore";
import { GameButton } from "../../ui/components/GameButton";
import { StatusBadge } from "../../ui/components/StatusBadge";
import { AttendancePanel } from "../attendance/AttendancePanel";
import { ManualDayPanel } from "../day/ManualDayPanel";
import { SettingsPanel } from "../settings/SettingsPanel";

export function HomeHub() {
  const { state } = useGameStore();
  const [activePanel, setActivePanel] = useState<"day" | "attendance" | "settings" | null>(null);
  const presentCount = Object.values(state.attendance).filter(Boolean).length;
  const voteCost = calculateVoteCost(
    presentCount,
    state.voteCostState.accumulatedSkippedMultiplier,
    state.voteCostState.nextVoteMultiplier,
    state.config,
  );

  return (
    <main className="hub-scene">
      <header className="hub-header">
        <div>
          <p className="eyebrow">Detective Party Mode</p>
          <h1>สายลับในออฟฟิศ</h1>
        </div>
        <div className="hub-status">
          <StatusBadge label="วันเล่น" value={state.manualDay.label} />
          <StatusBadge label="คนมาวันนี้" value={presentCount} />
          <StatusBadge label="ค่าเปิดโหวต" value={voteCost} />
        </div>
      </header>

      <section className="mission-board">
        <GameButton>ดูบทบาทลับ</GameButton>
        <GameButton>เปิดโหวต</GameButton>
        <GameButton>หมุนกาชา</GameButton>
        <GameButton>ร้านลับ</GameButton>
        <GameButton>สอนเล่น</GameButton>
        <GameButton variant="paper">Backup</GameButton>
        <GameButton variant="paper" onClick={() => setActivePanel("attendance")}>คนมา/คนลา</GameButton>
        <GameButton variant="paper" onClick={() => setActivePanel("settings")}>ตั้งค่า</GameButton>
        <GameButton variant="paper" onClick={() => setActivePanel("day")}>คุมวัน</GameButton>
      </section>

      {activePanel === "day" && <ManualDayPanel />}
      {activePanel === "attendance" && <AttendancePanel />}
      {activePanel === "settings" && <SettingsPanel />}
    </main>
  );
}
```

Add `useState` import at the top of `HomeHub.tsx`.

- [ ] **Step 4: Create manual day panel**

Create `app/src/features/day/ManualDayPanel.tsx`:

```tsx
import { useState } from "react";
import { endWorkingDay, markFinalDay, restDay } from "../../state/actions";
import { useGameStore } from "../../state/useGameStore";
import { GameButton } from "../../ui/components/GameButton";

export function ManualDayPanel() {
  const { state, setState } = useGameStore();
  const [nextLabel, setNextLabel] = useState(`วันเล่นที่ ${state.manualDay.index + 1}`);

  return (
    <section className="day-panel">
      <h2>คุมวันเอง</h2>
      <input value={nextLabel} onChange={(event) => setNextLabel(event.target.value)} aria-label="ชื่อวันถัดไป" />
      <div className="button-row">
        <GameButton onClick={() => setState((current) => endWorkingDay(current, nextLabel))}>จบวันทำงาน</GameButton>
        <GameButton variant="paper" onClick={() => setState((current) => restDay(current, nextLabel))}>พักวัน</GameButton>
        <GameButton variant="danger" onClick={() => setState(markFinalDay)}>ตัดสินวันสุดท้าย</GameButton>
      </div>
    </section>
  );
}
```

- [ ] **Step 4A: Create attendance panel**

Create `app/src/features/attendance/AttendancePanel.tsx`:

```tsx
import { useGameStore } from "../../state/useGameStore";
import { PlayerCard } from "../../ui/components/PlayerCard";

export function AttendancePanel() {
  const { state, setState } = useGameStore();
  return (
    <section className="scene-panel">
      <h2>คนมา / คนลา วันนี้</h2>
      <div className="player-grid">
        {state.players.map((player) => {
          const present = state.attendance[player.id];
          return (
            <div key={player.id} className={present ? "attendance-card attendance-card--present" : "attendance-card"}>
              <PlayerCard player={player} selected={present} onClick={() => {
                setState((current) => ({
                  ...current,
                  attendance: { ...current.attendance, [player.id]: !current.attendance[player.id] },
                }));
              }} />
              <strong>{present ? "มาวันนี้" : "ลา/ไม่มา"}</strong>
            </div>
          );
        })}
      </div>
    </section>
  );
}
```

- [ ] **Step 4B: Create Settings panel**

Create `app/src/features/settings/SettingsPanel.tsx` following Task 5B. It must expose every value in `state.config`, including item prices/limits and all gacha weights. Use large number fields grouped by:

1. ผู้เล่น & บทบาท
2. เกณฑ์โหวต
3. ค่าเปิดโหวต
4. เบาะแส
5. ร้านไอเทม
6. กาชา
7. โจทย์
8. คืนเหรียญ

On save call `updateConfig`. On validation errors, show the Thai error message and do not mutate state.

- [ ] **Step 5: Add hub CSS**

Append to `app/src/styles/global.css`:

```css
.hub-scene {
  min-height: 100vh;
  padding: 28px;
  background:
    radial-gradient(circle at 20% 12%, rgba(246, 196, 83, 0.28), transparent 28%),
    linear-gradient(135deg, #18213f, #2b3a67 56%, #151b30);
}

.hub-header {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 24px;
  align-items: start;
}

.hub-status {
  display: grid;
  grid-template-columns: repeat(3, minmax(120px, 1fr));
  gap: 12px;
}

.mission-board {
  margin: 28px 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  border: 5px solid #20263f;
  border-radius: 24px;
  background: #f5e9d0;
  padding: 24px;
}

.day-panel {
  border: 4px solid #fbf7ef;
  border-radius: 20px;
  padding: 20px;
  background: rgba(24, 33, 63, 0.86);
}

.day-panel h2 {
  margin: 0 0 14px;
}

.day-panel input {
  width: 100%;
  min-height: 58px;
  border: 3px solid #20263f;
  border-radius: 14px;
  padding: 8px 14px;
  font-weight: 900;
}
```

- [ ] **Step 6: Verify build**

Run:

```bash
cd app && npm run build
```

Expected: build succeeds.

- [ ] **Step 7: Commit shell screens**

Run:

```bash
git add app/src/App.tsx app/src/features app/src/styles/global.css
git commit -m "Turn the app into a game mission hub

Constraint: Game days must be manual and not tied to the real calendar.
Confidence: high
Scope-risk: moderate
Tested: cd app && npm run build
Not-tested: backup download UI"
```

---

## Task 9: Implement Feature Scenes In Separate Slices

Do not implement all scenes as one broad commit. Execute the subtasks below independently, with tests for any helper/action added in each slice.

### Task 9A: Role Reveal Scene

**Files:**
- Create: `app/src/features/role/RoleRevealFlow.tsx`
- Modify: `app/src/App.tsx`

Acceptance:

- Player picker -> confirm -> reveal -> curtain.
- Normal players see only normal role.
- Spy sees A/B slot and partner.
- Spy sees read-only shield status when their slot has an unused shield.

### Task 9B: Shop Scene

**Files:**
- Create: `app/src/features/shop/ShopFlow.tsx`
- Modify: `app/src/state/actions.ts`
- Modify: `app/src/state/actions.test.ts`

Acceptance:

- Prices and limits come from `state.config.itemPrices` and `state.config.itemDailyLimits`.
- Inventory limit is enforced.
- Purchase is private and ends at curtain.

### Task 9C: Gacha And Quiz Scenes

**Files:**
- Create: `app/src/features/gacha/GachaFlow.tsx`
- Create: `app/src/features/quiz/QuizFlow.tsx`
- Modify: `app/src/state/actions.ts`
- Modify: `app/src/state/actions.test.ts`

Acceptance:

- Uses `gachaEngine`.
- Applies `voteUp`/`voteDown` through `applyGachaVoteMultiplier`.
- Handles shield/item fallbacks.
- Quiz comes only from gacha.
- Used quiz ids prevent repeats until exhausted.

### Task 9D: Vote Scene

**Files:**
- Create: `app/src/features/vote/VoteFlow.tsx`
- Create: `app/src/features/vote/VoteResultScene.tsx`
- Modify: `app/src/state/actions.ts`
- Modify: `app/src/state/actions.test.ts`

Acceptance:

- Private voting queue uses only present players.
- Personal vote screen shows inventory plus read-only shield status for the relevant spy slot.
- Vote result never displays counts.
- Shield-triggered fail is visually identical to ordinary fail.

### Task 9E: Post-Vote Clue And Refund Scenes

**Files:**
- Create: `app/src/features/vote/PostVoteClueScene.tsx`
- Create: `app/src/features/refund/RefundScene.tsx`
- Modify: `app/src/state/actions.ts`
- Modify: `app/src/state/actions.test.ts`

Acceptance:

- Group clue purchase limit is one per vote round.
- Voted clue threshold is 3.
- Spy-in-pool threshold remains 4.
- Not-voted clue draws up to 4.
- Innocent refund records holder and allocation note.

### Task 9F: Guess And End Scenes

**Files:**
- Create: `app/src/features/guess/GuessSecondSpyScene.tsx`
- Create: `app/src/features/end/EndGameScene.tsx`
- Modify: `app/src/state/actions.ts`
- Modify: `app/src/state/actions.test.ts`

Acceptance:

- Guess correct ends with team win.
- Guess wrong re-randomizes roles.
- Re-randomize preserves inventories and shield state.
- Final-day action does not overwrite an existing team win.

### Task 9G: Tutorial Scene

**Files:**
- Create: `app/src/features/tutorial/TutorialFlow.tsx`

Acceptance:

- Full 10-scene tutorial.
- Short mode includes role, coins, vote, deadline.
- Skip, back, next, replay.

## Legacy Task 9 Notes: Feature Flow Details

**Files:**
- Create/modify the `app/src/features/*` files listed in the target file structure.
- Modify: `app/src/App.tsx`
- Modify: `app/src/state/actions.ts`
- Add focused tests as behavior is moved into state/domain helpers.

- [ ] **Step 1: Add phase routing**

Modify `AppRouter` in `app/src/App.tsx` so it renders by `state.phase`:

```tsx
function AppRouter() {
  const { hydrated, state } = useGameStore();
  if (!hydrated) return <main className="app-shell"><p>กำลังโหลดคดี...</p></main>;

  if (state.phase === "boot") return <BootScreen />;
  if (state.phase === "home") return <BootScreen />;
  if (state.phase === "roleReveal") return <RoleRevealFlow />;
  if (state.phase === "shop") return <ShopFlow />;
  if (state.phase === "gacha") return <GachaFlow />;
  if (state.phase === "quiz") return <QuizFlow />;
  if (state.phase === "vote") return <VoteFlow />;
  if (state.phase === "guess") return <GuessSecondSpyScene />;
  if (state.phase === "refund") return <RefundScene />;
  if (state.phase === "ended") return <EndGameScene />;
  return <BootScreen />;
}
```

Also import each feature component at the top of `App.tsx`.

- [ ] **Step 2: Implement each flow with the same private-flow pattern**

For `RoleRevealFlow`, `ShopFlow`, `GachaFlow`, and `VoteFlow`, use this internal state pattern:

```tsx
type PrivateStep = "pick" | "confirm" | "act" | "curtain";
const [step, setStep] = useState<PrivateStep>("pick");
const [selectedPlayerId, setSelectedPlayerId] = useState<PlayerId | null>(null);
const selectedPlayer = state.players.find((player) => player.id === selectedPlayerId) ?? null;
```

Render:

- `pick`: `PlayerPicker`
- `confirm`: `ConfirmPlayer`
- `act`: the private action screen
- `curtain`: `HandOffCurtain`

Do not skip confirm for private flows.

- [ ] **Step 3: Implement role reveal behavior**

Create `app/src/features/role/RoleRevealFlow.tsx` with:

- player picker,
- confirmation,
- role card reveal,
- spy partner display for spy roles,
- hand-off curtain after reveal.

The role reveal screen must never list all roles.

- [ ] **Step 4: Implement shop behavior**

Create `app/src/features/shop/ShopFlow.tsx` with:

- player picker,
- confirmation,
- item cards from `itemCatalog`,
- inventory limit check from config,
- private purchase result,
- hand-off curtain.

Add action helper `buyVoteItem(state, playerId, itemType, source)` in `state/actions.ts`. It must throw a user-facing error when inventory is full.

- [ ] **Step 5: Implement gacha behavior**

Create `app/src/features/gacha/GachaFlow.tsx` with:

- player picker,
- confirmation,
- gacha spin scene,
- deterministic result resolver helper in `domain/random.ts` or a new `domain/gachaEngine.ts`,
- public result display,
- fallback when inventory is full,
- fallback when shield already exists,
- transition to quiz flow when quiz result appears.

The shield result must announce only slot A/B, not the player identity.

- [ ] **Step 6: Implement quiz behavior**

Create `app/src/features/quiz/QuizFlow.tsx` with:

- random unused quiz selection,
- two choices,
- answer reveal,
- public result text: correct gives spinner reward; wrong makes everyone pay penalty outside the app.

State must record used quiz ids to avoid repeats until exhausted.

- [ ] **Step 7: Implement vote behavior**

Create `app/src/features/vote/VoteFlow.tsx` with:

- admin open-vote confirmation,
- present-player voting queue,
- player picker and confirmation,
- target picker,
- eligible item selection,
- call to `calculateVoteResult`,
- removal of consumed items,
- internal shield consumption patch,
- public result scene.

The public result scene must receive only the public result type and allowed names. It must not render adjusted vote counts.

- [ ] **Step 8: Implement post-vote scenes**

Create:

- `app/src/features/vote/VoteResultScene.tsx`
- `app/src/features/vote/PostVoteClueScene.tsx`
- `app/src/features/refund/RefundScene.tsx`
- `app/src/features/guess/GuessSecondSpyScene.tsx`

Required behavior:

- Spy-in-pool reveal shows only S from T.
- Post-vote clue purchase is one group action per vote round.
- Voted clue uses threshold 3.
- Spy-in-pool reveal uses threshold 4.
- Innocent refund records holder and allocation note.
- Guess correct ends as team win.
- Guess wrong assigns new roles and enters role reveal.

- [ ] **Step 9: Implement tutorial and end scenes**

Create:

- `app/src/features/tutorial/TutorialFlow.tsx`
- `app/src/features/end/EndGameScene.tsx`

Tutorial uses `tutorialScenes`, supports full and short mode, skip, back, next, replay from home. End scene differentiates team win and spy win.

- [ ] **Step 10: Add focused tests for new non-UI helpers**

For each helper added to `state/actions.ts`, add tests in `app/src/state/actions.test.ts`:

```ts
it("does not allow inventory above configured limit", () => {
  const state = createInitialGameState();
  const withOne = buyVoteItem(state, "C001", "double", "shop");
  const withTwo = buyVoteItem(withOne, "C001", "remove", "shop");
  expect(() => buyVoteItem(withTwo, "C001", "swap", "shop")).toThrow("กระเป๋าไอเทมเต็ม");
});
```

Add equivalent tests for:

- quiz id usage,
- shield assignment by slot,
- shield consumption,
- guess wrong role re-randomization preserving inventory,
- clue purchase limit per round.

- [ ] **Step 11: Verify all tests and build**

Run:

```bash
cd app && npm run test && npm run build
```

Expected: tests pass and build succeeds.

- [ ] **Step 12: Commit complete game flows**

Run:

```bash
git add app/src
git commit -m "Complete the playable Office Spies game loop

Constraint: The iPad flow must support private turns without an admin PIN.
Rejected: Per-player coin ledger | Coins are intentionally managed by the supervisor outside the app.
Confidence: medium
Scope-risk: broad
Directive: Keep shield-triggered failures indistinguishable from ordinary failed votes.
Tested: cd app && npm run test && npm run build
Not-tested: physical iPad dry-run"
```

---

## Task 10: Integrate Generated Art, Audio, Wake Lock, And Polish

**Files:**
- Create: `app/public/assets/generated/*`
- Create: `app/public/assets/sounds/*`
- Create: `app/src/ui/audio/sound.ts`
- Create: `app/src/ui/audio/useSound.ts`
- Modify: scene components to reference assets and sounds.
- Modify: `app/src/styles/global.css`

- [ ] **Step 1: Generate and add final assets**

Create final image files in `app/public/assets/generated/`:

```text
logo-office-spies.png
bg-home-case-board.png
bg-detective-room.png
bg-role-cover.png
bg-reveal.png
mascot-detective-point.png
mascot-detective-think.png
mascot-detective-shock.png
mascot-detective-laugh.png
role-normal.png
role-spy.png
gacha-machine.png
gacha-capsule.png
item-double.png
item-remove.png
item-swap.png
item-reduce.png
item-protect.png
item-spy-shield.png
stamp-win.png
stamp-lose.png
clue-card-frame.png
end-team-win.png
end-spy-win.png
```

Use the approved visual style: comedic cartoon detective noir, bold outlines, bright friendly palette, soft cel shading, paper grain, not scary.

- [ ] **Step 2: Add sound files**

Create or add small audio files in `app/public/assets/sounds/`:

```text
click.mp3
coin.mp3
shop.mp3
gacha-spin.mp3
gacha-pop.mp3
vote-drumroll.mp3
vote-win.mp3
vote-fail.mp3
team-win.mp3
spy-win.mp3
```

Use `vote-fail.mp3` for both ordinary failed votes and shield-triggered failed votes.

- [ ] **Step 3: Implement audio helper**

Create `app/src/ui/audio/sound.ts`:

```ts
export type SoundName =
  | "click"
  | "coin"
  | "shop"
  | "gachaSpin"
  | "gachaPop"
  | "voteDrumroll"
  | "voteWin"
  | "voteFail"
  | "teamWin"
  | "spyWin";

const soundFiles: Record<SoundName, string> = {
  click: "./assets/sounds/click.mp3",
  coin: "./assets/sounds/coin.mp3",
  shop: "./assets/sounds/shop.mp3",
  gachaSpin: "./assets/sounds/gacha-spin.mp3",
  gachaPop: "./assets/sounds/gacha-pop.mp3",
  voteDrumroll: "./assets/sounds/vote-drumroll.mp3",
  voteWin: "./assets/sounds/vote-win.mp3",
  voteFail: "./assets/sounds/vote-fail.mp3",
  teamWin: "./assets/sounds/team-win.mp3",
  spyWin: "./assets/sounds/spy-win.mp3",
};

export function playSound(name: SoundName, enabled: boolean): void {
  if (!enabled) return;
  const audio = new Audio(soundFiles[name]);
  audio.volume = 0.8;
  void audio.play().catch(() => undefined);
}
```

Create `app/src/ui/audio/useSound.ts`:

```ts
import { playSound, type SoundName } from "./sound";
import { useGameStore } from "../../state/useGameStore";

export function useSound() {
  const { state } = useGameStore();
  return (name: SoundName) => playSound(name, state.settings.soundEnabled);
}
```

- [ ] **Step 4: Add Wake Lock helper**

Create `app/src/ui/useWakeLock.ts`:

```ts
import { useEffect, useState } from "react";

export function useWakeLock() {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    setSupported("wakeLock" in navigator);
    if ("wakeLock" in navigator) {
      navigator.wakeLock.request("screen").then((sentinel) => {
        lock = sentinel;
      }).catch(() => undefined);
    }
    return () => {
      void lock?.release();
    };
  }, []);

  return supported;
}
```

- [ ] **Step 5: Apply visual assets to scenes**

Update scene components to use generated images:

- Home background uses `bg-home-case-board.png`.
- Role reveal uses `role-normal.png`, `role-spy.png`, and `bg-role-cover.png`.
- Vote result uses `stamp-win.png` or `stamp-lose.png`.
- Gacha uses `gacha-machine.png` and `gacha-capsule.png`.
- Tutorial uses mascot pose images and scene backgrounds.
- End scene uses `end-team-win.png` or `end-spy-win.png`.

Keep text readable over all images with solid panels or controlled overlays.

- [ ] **Step 6: Verify polish**

Run:

```bash
cd app && npm run build
```

Expected: build succeeds and generated assets are included in `dist`.

- [ ] **Step 7: Commit art and audio integration**

Run:

```bash
git add app/public/assets app/src/ui app/src/features app/src/styles/global.css
git commit -m "Give Office Spies its detective game feel

Constraint: Visuals must stay playful, readable, and not leak shield state.
Confidence: medium
Scope-risk: moderate
Directive: Use the same failure sound and animation for shield-triggered and ordinary failed votes.
Tested: cd app && npm run build
Not-tested: final asset readability on physical iPad"
```

---

## Task 11: Add E2E Smoke Tests And Dry-Run Checklist

**Files:**
- Create: `app/tests/e2e/smoke.spec.ts`
- Create: `app/tests/e2e/game-flow.spec.ts`
- Create: `docs/testing/office-spies-dry-run.md`

- [ ] **Step 1: Add smoke test**

Create `app/tests/e2e/smoke.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("loads the game hub at iPad landscape size", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /เริ่มเกม/ }).click();
  await expect(page.getByText("สายลับในออฟฟิศ")).toBeVisible();
  await expect(page.getByText(/ค่าเปิดโหวต/)).toBeVisible();
});
```

- [ ] **Step 2: Add flow test**

Create `app/tests/e2e/game-flow.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("player cards use large identity cards", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /เริ่มเกม/ }).click();
  await page.getByRole("button", { name: /ดูบทบาทลับ/ }).click();
  await expect(page.getByText("เรน มัศรินทร์")).toBeVisible();
  await expect(page.getByText("C001")).toBeVisible();
});
```

- [ ] **Step 3: Add dry-run checklist**

Create `docs/testing/office-spies-dry-run.md`:

```markdown
# Office Spies Dry-Run Checklist

Run on iPad Air 5 landscape before the real game.

- [ ] Open deployed GitHub Pages URL.
- [ ] Tap start and confirm audio unlock.
- [ ] Confirm all 11 employee photos load or show correct fallback.
- [ ] Export backup before starting.
- [ ] Randomize roles.
- [ ] Each player completes role reveal with hand-off curtain.
- [ ] Buy one secret shop item.
- [ ] Spin gacha once.
- [ ] Trigger one quiz.
- [ ] Open vote with present players.
- [ ] Each player votes privately.
- [ ] Confirm public vote result does not show vote counts.
- [ ] Confirm spy-in-pool reveal only appears when conditions match.
- [ ] Buy one post-vote clue as group action.
- [ ] Test manual rest day and confirm vote cost does not increase.
- [ ] Test manual working day with no vote and confirm vote cost increases.
- [ ] Export backup and import it in a fresh browser profile.
- [ ] Trigger final-day spy win.
- [ ] Start a new game only after exporting backup.
```

- [ ] **Step 4: Run E2E tests**

Run:

```bash
cd app && npx playwright test
```

Expected: all E2E tests pass.

- [ ] **Step 5: Commit tests and dry-run docs**

Run:

```bash
git add app/tests docs/testing
git commit -m "Verify the iPad game flow from the browser

Constraint: Completion requires browser evidence, not just unit tests.
Confidence: medium
Scope-risk: narrow
Tested: cd app && npx playwright test
Not-tested: full human dry-run with real players"
```

---

## Task 12: Prepare GitHub Pages Deployment

**Files:**
- Create: `app/src/deploy/githubPages.ts`
- Modify: `README.md`

- [ ] **Step 1: Add deploy notes**

Modify `README.md` by adding:

```markdown
## Running The App

The app lives in `app/`.

```bash
cd app
npm install
npm run dev
```

## Building

```bash
cd app
npm run build
```

The production build is emitted to `app/dist`.

## Deployment

The app is designed for static hosting on GitHub Pages. Live game state stays in the iPad browser through IndexedDB and JSON backups; it is not stored on GitHub.

Before a real game:

1. Deploy the latest build.
2. Open the GitHub Pages URL on the iPad.
3. Confirm all employee photos load.
4. Export a backup before and after each game day.
```

- [ ] **Step 2: Run final verification**

Run:

```bash
cd app && npm run test && npm run build && npx playwright test
```

Expected: all tests pass, build succeeds, browser smoke tests pass.

- [ ] **Step 3: Commit deployment readiness**

Run:

```bash
git add README.md app
git commit -m "Prepare Office Spies for GitHub Pages

Constraint: Production hosting is static; live game state remains on the iPad.
Confidence: high
Scope-risk: narrow
Tested: cd app && npm run test && npm run build && npx playwright test
Not-tested: publishing to the final GitHub repository"
```

---

## Self-Review Checklist

- Spec coverage:
  - Full game rules: Tasks 2-9.
  - Manual game day: Tasks 6 and 8.
  - Real employee cards 4:5: Tasks 2 and 7.
  - Vote engine and must-honor edge cases: Task 5.
  - Group clue purchase, spy pool, refund: Tasks 5 and 9.
  - IndexedDB persistence and backup: Task 6.
  - Game-feel art/audio: Task 10.
  - Browser verification and dry-run: Task 11.
  - GitHub Pages readiness: Task 12.
- Placeholder scan: No task may be implemented with vague "handle later" work. Temporary visual assets are allowed only while building flows; final release requires Task 10 generated art.
- Type consistency: Domain types are introduced in Task 2 and expanded in Task 5 before UI tasks depend on them.
