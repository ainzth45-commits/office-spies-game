# Gacha + Quiz Rework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ร้านลับหายไป ไอเทมออกจากกาชา 14 ช่อง (ซุปกดเลือกคนรับ), กาชาเข้าได้ทันทีไม่จำกัดครั้ง + modal ดูของในตู้, โจทย์เชาว์มีตัวจับเวลา/คลัง 200 ข้อกันซ้ำข้ามรอบ, ปุ่ม Home ทุกหน้า

**Architecture:** domain-first — แก้ types/config/migration ก่อน แล้วไล่ engine → actions → UI · เหรียญเป็นของจริง แอปบันทึกเฉพาะไอเทม/เกราะ/ตัวคูณ/สถานะโจทย์ · ประวัติโจทย์อยู่ localStorage แยกจากเซฟเกม (IndexedDB)

**Tech Stack:** React 18 + TypeScript + Vite · vitest (unit) · state เดิมเป็น reducer-style pure functions ใน `state/actions.ts`

**Spec:** `docs/superpowers/specs/2026-07-03-gacha-quiz-rework-design.md`

---

## File Map

| ไฟล์ | งาน |
|---|---|
| `app/src/domain/types.ts` | GachaOutcome ใหม่ 14 ช่อง · GamePhase ตัด "shop" · GameConfig ตัด/เพิ่ม field · QuizQuestion.difficulty · GameState: ตัด usedQuizIds, เพิ่ม pendingGachaGrant + pendingQuizResult · PendingQuizState ไม่มี playerId |
| `app/src/data/configDefaults.ts` | น้ำหนัก 14 ช่อง + ค่า quiz timing ใหม่ · ตัด itemPrices/itemDailyLimits/gachaDailyLimitPerPlayer |
| `app/src/domain/gachaEngine.ts` | resolveGachaOutcome ตัดกติกา grantItem · availableGachaWeights เดิม (generic key) |
| `app/src/domain/quizEngine.ts` (ใหม่) | คำนวณรางวัล/โทษตามเวลา (pure, inject elapsedSec) |
| `app/src/state/quizHistory.ts` (ใหม่) | localStorage `office-spies/quiz-used-v1`: get/add/reset |
| `app/src/state/actions.ts` | applyGachaOutcome ไม่มี playerId + pendingGachaGrant · assignGachaItem · answerPendingQuiz ใช้ quizEngine + pendingQuizResult · dismissQuizResult · ตัด buyVoteItem สาย shop |
| `app/src/state/storage.ts` + `gameState.ts` | migrate: weights เก่า→ใหม่, ตัด field ตาย, เติม field ใหม่ |
| `app/src/data/quizBank.ts` | 200 ข้อ + difficulty (คัดของเดิม 100) |
| `app/src/data/quizBank.test.ts` (ใหม่) | validate คลัง: 200 ข้อ, id ไม่ซ้ำ, คำถามไม่ซ้ำ, difficulty ครบ |
| `app/src/features/gacha/GachaFlow.tsx` | ตู้ทันที · reel หน่วงก่อนเฉลย · assign grid · ปุ่ม modal ในตู้ |
| `app/src/features/gacha/GachaPoolModal.tsx` (ใหม่) | ของ 14 ช่อง + % สด |
| `app/src/features/quiz/QuizFlow.tsx` | timer นับหน้า + แถบรางวัลสด + หน้าเฉลยผล |
| `app/src/features/home/HomeHub.tsx` | ตัด dock ร้านลับ |
| `app/src/App.tsx` | ชิป 🏠 กลางเมื่อ phase ≠ home · ลบ route shop · route กลับหน้าเลือกคนรับเมื่อ pendingGachaGrant ค้าง |
| `app/src/features/settings/SettingsPanel.tsx` | น้ำหนัก 14 ช่อง + quiz timing + ปุ่มรีเซตคลังโจทย์ + ตัดราคาไอเทม/ลิมิตกาชา |
| `app/src/features/rules/QuickRules.tsx`, `data/tutorialScenes.ts` | แก้ข้อความอ้างร้านลับขั้นต่ำ |
| ลบ: `app/src/features/shop/ShopFlow.tsx` | ทั้งไฟล์ |
| เทส: `app/src/domain/gachaEngine.test.ts`, `app/src/state/actions.test.ts`, `app/src/domain/quizEngine.test.ts` (ใหม่), `app/src/state/quizHistory.test.ts` (ใหม่) | ปรับ+เพิ่ม |

---

### Task 1: Domain types + config defaults

**Files:** Modify `app/src/domain/types.ts`, `app/src/data/configDefaults.ts`

- [ ] **1.1 แก้ types.ts**

```ts
export type GachaItemOutcome = "itemDouble" | "itemRemove" | "itemSwap" | "itemReduce" | "itemProtect";
export type GachaOutcome =
  | "selfGain" | "selfLoseAll" | "allGain" | "poorGain" | "allLose"
  | "voteUp" | "voteDown"
  | GachaItemOutcome
  | "grantQuiz" | "spyShield";

// map ช่องไอเทม → ชนิดไอเทมจริง (ใช้ทั้ง actions + UI)
export const gachaItemOutcomeToItemType: Record<GachaItemOutcome, VoteItemType> = {
  itemDouble: "double", itemRemove: "remove", itemSwap: "swap",
  itemReduce: "reduceThreshold", itemProtect: "protectThreshold",
};
```

- GamePhase: ตัด `"shop"`
- GameConfig: ตัด `gachaDailyLimitPerPlayer`, `itemPrices`, `itemDailyLimits` · เพิ่ม `quizRewardDecaySec: number`, `quizRewardMin: number`, `quizPenaltyTierSec: number`, `quizWrongPenaltyLate: number`
- QuizQuestion: เพิ่ม `difficulty: "easy" | "medium" | "hard"`
- PendingQuizState: `{ questionId: string; startedAt: string }` (ISO — timer ทน refresh/ออกกลางคัน)
- GameState: ตัด `usedQuizIds` · เพิ่ม `pendingGachaGrant: { itemType: VoteItemType; message: string } | null` และ `pendingQuizResult: { correct: boolean; message: string; questionId: string } | null`
- DailyUsageState: ตัด `gachaSpins`, `shopPurchases` (เหลือ dayIndex + voteCostChanged)
- GachaResultState: `{ outcome: GachaOutcome; message: string }` (ตัด playerId)
- VoteItem.source: เหลือ `"gacha"`

- [ ] **1.2 configDefaults.ts** — น้ำหนักรวม 100:

```ts
quizRewardDecaySec: 10, quizRewardMin: 1, quizPenaltyTierSec: 60, quizWrongPenaltyLate: 6,
gachaWeights: {
  selfGain: 12, selfLoseAll: 8, allGain: 10, poorGain: 8, allLose: 8,
  voteUp: 8, voteDown: 7,
  itemDouble: 3, itemRemove: 3, itemSwap: 3, itemReduce: 3, itemProtect: 3,
  grantQuiz: 16, spyShield: 8,
},
```

- [ ] **1.3 รัน `npx tsc --noEmit`** — ให้ compile error โผล่เป็นรายการงานของ task ถัดๆ ไป (ยังไม่ต้องผ่าน)
- [ ] **1.4 commit** หลัง Task 2-4 ทำให้ build เขียว (domain+state ไปด้วยกัน)

### Task 2: gachaEngine + quizEngine (TDD)

**Files:** Modify `app/src/domain/gachaEngine.ts` + test · Create `app/src/domain/quizEngine.ts` + `quizEngine.test.ts`

- [ ] **2.1 เทส gachaEngine ปรับ:** resolveGachaOutcome — เหลือกติกาเดียว: spyShield เมื่อ shield มีแล้ว → allGain (ตัด context.inventoryFull ทิ้ง) · availableGachaWeights คงพฤติกรรมเดิม (คีย์ generic อยู่แล้ว ผ่านโดยไม่แก้)
- [ ] **2.2 quizEngine.ts:**

```ts
import type { GameConfig } from "./types";
export function quizRewardAt(elapsedSec: number, config: GameConfig): number {
  const steps = Math.floor(Math.max(0, elapsedSec) / config.quizRewardDecaySec);
  return Math.max(config.quizRewardMin, config.quizCorrectReward - steps);
}
export function quizPenaltyAt(elapsedSec: number, config: GameConfig): number {
  return elapsedSec > config.quizPenaltyTierSec ? config.quizWrongPenaltyLate : config.quizWrongPenaltyPerPlayer;
}
```

- [ ] **2.3 เทส:** 0วิ→10 · 9วิ→10 · 10วิ→9 · 95วิ→1 (ไม่ต่ำกว่า min) · penalty 60วิ→3, 61วิ→6, 600วิ→6 (ไม่บานต่อ)
- [ ] **2.4 รันเทสไฟล์นี้ให้เขียว**

### Task 3: quizHistory (localStorage) + quizBank 200 ข้อ

**Files:** Create `app/src/state/quizHistory.ts`, `app/src/state/quizHistory.test.ts`, `app/src/data/quizBank.test.ts` · Rewrite `app/src/data/quizBank.ts`

- [ ] **3.1 quizHistory.ts:**

```ts
const KEY = "office-spies/quiz-used-v1";
export function getUsedQuizIds(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}
export function markQuizUsed(id: string): void {
  localStorage.setItem(KEY, JSON.stringify([...new Set([...getUsedQuizIds(), id])]));
}
export function resetQuizHistory(): void { localStorage.removeItem(KEY); }
```

เทส: mark→get เห็น · mark ซ้ำไม่ duplicate · reset ล้าง · ค่าพังใน storage → คืน []

- [ ] **3.2 quizBank:** เพิ่ม difficulty ให้ 100 ข้อเดิม (รีวิว: เฉลยผิด/กำกวม/ง่ายเกิน → แทนที่) + เขียนใหม่จนครบ 200 คละ 7 หมวด · แนวคุณภาพ: ตอบได้ใน 10-60 วิ, 2 ตัวเลือกต้องลวงจริง, ห้ามความรู้เฉพาะกลุ่ม/ภาษาอังกฤษล้วน
- [ ] **3.3 quizBank.test.ts:** length === 200 · id ไม่ซ้ำ · question text ไม่ซ้ำ · ทุกข้อ difficulty ∈ {easy,medium,hard} · answer ∈ {A,B} · แต่ละระดับมี ≥ 40 ข้อ
- [ ] **3.4 รันเทส + commit** `feat(quiz): 200-question bank with difficulty + cross-game history`

### Task 4: state/actions + migration (TDD)

**Files:** Modify `app/src/state/actions.ts`, `app/src/state/gameState.ts`, `app/src/state/storage.ts`, `app/src/state/actions.test.ts`

- [ ] **4.1 applyGachaOutcome ใหม่** — ลายเซ็น `(state, rawOutcome, options?)` ไม่มี playerId/ลิมิต:
  - เหรียญจริง 5 ช่อง: ข้อความ "คนที่หมุน…" เช่น `คนที่หมุนรับ ${config.gachaCoinSelfGain} เหรียญจากซุป`
  - voteUp/voteDown: เหมือนเดิม
  - ช่องไอเทม: `pendingGachaGrant = { itemType, message }` (ยังไม่เข้ากระเป๋า) — ถ้า**ทุกคน**กระเป๋าเต็ม → fallback ข้อความ "กระเป๋าเต็มทั้งออฟฟิศ ซุปแจกเหรียญแทน" + ไม่ตั้ง pending
  - grantQuiz: ดึงข้อจาก `quizBank` ที่ id ∉ `getUsedQuizIds()` แบบสุ่ม (inject `random` ได้) → `pendingQuiz = { questionId, startedAt: nowIso }` + phase "quiz" + `markQuizUsed` ทันที · คลังหมด → ข้อความ "โจทย์หมดคลัง กดรีเซตในตั้งค่า" ไม่เข้า quiz
  - spyShield: เดิม
- [ ] **4.2 `assignGachaItem(state, playerId)`** — ต้องมี pendingGachaGrant · กระเป๋าคนนั้นเต็ม → โยน error ("กระเป๋า X เต็ม เลือกคนอื่น") · สำเร็จ: push VoteItem(source "gacha") + เคลียร์ pending + log
- [ ] **4.3 quiz actions:**

```ts
export function answerPendingQuiz(state: GameState, answer: "A" | "B", nowMs: number): GameState {
  // elapsedSec = (nowMs - Date.parse(pendingQuiz.startedAt)) / 1000
  // ถูก: quizRewardAt → "ตอบถูก! รับ X เหรียญ (ใช้เวลา Y วิ)"
  // ผิด: quizPenaltyAt → "ตอบผิด (เฉลย: ข้อ Z) ทุกคนคืน N เหรียญให้ซุป"
  // → pendingQuizResult ตั้งค่า, pendingQuiz = null, **phase คง "quiz"** (ไม่เด้งโฮม)
}
export function dismissQuizResult(state: GameState): GameState; // เคลียร์ result + phase "home"
```

- [ ] **4.4 buyVoteItem → grantVoteItem(state, playerId, type)** ตัด source/ลิมิตร้าน (ใช้จาก assignGachaItem เท่านั้น) · ลบ ensureDailyUsage ส่วน shop/gacha counters
- [ ] **4.5 migration (storage.ts / gameState.ts):**

```ts
function migrateConfig(saved: Partial<GameConfig> & { gachaWeights?: Record<string, number> }): GameConfig {
  const w = saved.gachaWeights ?? {};
  const gachaWeights = "grantItem" in w
    ? (() => { const per = (w.grantItem ?? 0) / 5; const { grantItem: _, ...rest } = w;
        return { ...defaultConfig.gachaWeights, ...rest,
          itemDouble: per, itemRemove: per, itemSwap: per, itemReduce: per, itemProtect: per }; })()
    : { ...defaultConfig.gachaWeights, ...w };
  const { itemPrices: _p, itemDailyLimits: _l, gachaDailyLimitPerPlayer: _g, ...restConfig } = saved as Record<string, unknown> as never;
  return { ...defaultConfig, ...restConfig, gachaWeights } as GameConfig;
}
```

  - migrateGameState: phase "shop" เก่า → "home" · state เก่ามี usedQuizIds → merge เข้า quizHistory (ครั้งเดียว) · pendingGachaGrant/pendingQuizResult default null
- [ ] **4.6 เทสใน actions.test.ts:** ราย outcome (spin ไม่จำกัด — วนหลายครั้งไม่ throw) · item → pending → assign เข้ากระเป๋า/เต็มแล้ว error · quiz ถูก/ผิด ตามเวลา (inject nowMs) · dismiss กลับโฮม · migrate weights เก่า (grantItem 10 → ช่องละ 2) · migrate เกม phase shop
- [ ] **4.7 `npx tsc --noEmit` + `npm run test` เขียวทั้ง repo แล้ว commit** `feat(gacha,quiz): domain + state rework (no shop, 14 outcomes, timed quiz)`

### Task 5: UI — GachaFlow + PoolModal + QuizFlow

**Files:** Rewrite `features/gacha/GachaFlow.tsx` · Create `features/gacha/GachaPoolModal.tsx` · Rewrite `features/quiz/QuizFlow.tsx` · Modify `styles/global.css`

- [ ] **5.1 GachaFlow:** ไม่มี pick/confirm · state เครื่อง: idle → spinning → (result | assign) ·
  reel ลุ้น: interval เริ่ม 80ms ค่อยๆ ยืดเป็น ~350ms ช่วงท้าย (SPIN_MS 4000) + ค้างนิ่ง 600ms ก่อนเฉลย + playGacha ถี่ขึ้น · ตู้ `min(300px, 38dvh)` กลางจอ · ผลไอเทม → กริดผู้เล่น (ใช้ player-grid เดิม) หัวข้อ "ใส่ไอเทมให้ใคร?" กดแล้ว `assignGachaItem` + ข้อความยืนยัน · ปุ่มแถว: หมุน / 📦 ในตู้มีอะไร
- [ ] **5.2 GachaPoolModal:** ใช้ `availableGachaWeights(state.config.gachaWeights, {...})` + `normalizeGachaWeights` โชว์กริด 14 ช่อง: รูป (item-*.webp สำหรับช่องไอเทม, gacha-result-*.webp ที่เหลือ) + label + % ปัด 1 ตำแหน่ง · ช่องน้ำหนัก 0 (เกราะออกแล้ว/ค่าโหวตใช้แล้ววันนี้) → ติดป้าย "หมดชั่วคราว" จาง
- [ ] **5.3 QuizFlow:** timer `useEffect` + `setInterval(1s)` จาก `Date.parse(pendingQuiz.startedAt)` · แสดง: หมวด+ป้ายความยาก · นาฬิกา MM:SS · "ตอบถูกตอนนี้ได้ X เหรียญ" (quizRewardAt สด) · เกิน tier → แถบเปลี่ยนแดง "โซนโทษแรง −6" · ปุ่ม A/B เรียก `answerPendingQuiz(state, ans, Date.now())` · เมื่อ `pendingQuizResult` → หน้าเฉลย ✅/❌ + ข้อความผล + ปุ่ม "กลับ Home" → `dismissQuizResult`
- [ ] **5.4 CSS:** `.gacha-machine` ใหญ่ขึ้น · `.gacha-assign` grid · `.pool-modal` (reuse .overlay/.overlay-sheet) · `.quiz-timer`, `.quiz-reward-bar`, `.quiz-reward-bar--late` — ทุก state จบจอเดียว (dvh clamp ตามแบบ Task กาชาเดิม)
- [ ] **5.5 commit** `feat(ui): new gacha flow + pool modal + timed quiz`

### Task 6: Home button ทุกหน้า + ถอดร้านลับ + settings

**Files:** Modify `App.tsx`, `HomeHub.tsx`, `SettingsPanel.tsx`, `QuickRules.tsx`, `data/tutorialScenes.ts` · Delete `features/shop/ShopFlow.tsx`

- [ ] **6.1 App.tsx:** ลบ import/route shop · เพิ่มใน AppRouter:

```tsx
{hydrated && state.phase !== "home" && state.phase !== "boot" && (
  <button type="button" className="chip-btn home-chip"
    onClick={() => setState((c) => ({ ...c, phase: "home" }))}>🏠 Home</button>
)}
```

  CSS `.home-chip { position: fixed; top: calc(env(safe-area-inset-top) + 10px); left: calc(env(safe-area-inset-left) + 12px); z-index: 40; }`
- [ ] **6.2 HomeHub:** ตัด dock item ร้านลับ (เหลือ 5) · ลบ import ShopFlow ที่ไหนอ้างถึง
- [ ] **6.3 SettingsPanel:** label น้ำหนัก 14 ช่อง (ไทย: "ไอเทม: โหวต 2 เสียง" ฯลฯ) · ตัด UI ราคาไอเทม/ลิมิตร้าน/ลิมิตกาชา · เพิ่มกลุ่ม "โจทย์เชาว์": สไลเดอร์ decay/min/tierSec/penaltyLate + แถว "คลังโจทย์: ใช้แล้ว X / เหลือ Y" + ปุ่ม "รีเซตคลังโจทย์" (confirm ก่อน)
- [ ] **6.4 QuickRules + tutorialScenes:** จุดที่พูดถึง "ร้านลับ/ซื้อไอเทม" → "ไอเทมสุ่มได้จากตู้กาชาเท่านั้น" (แก้ขั้นต่ำ)
- [ ] **6.5 `npm run test` + `npm run build` เขียว → commit** `feat: home chip everywhere, remove shop, settings for new gacha/quiz`

### Task 7: Verify + deploy

- [ ] **7.1 `npm run dev` + เบราว์เซอร์:** หมุน→ลุ้น→เฉลยทุกกลุ่มผล (บังคับผ่าน settings weights ชั่วคราวได้) · ไอเทม→เลือกคนรับ→เช็คกระเป๋า · modal ในตู้ % ตรง · quiz จับเวลา รางวัลลดจริง เฉลยไม่เด้งโฮม · ปุ่ม 🏠 ทุกหน้า · จอ 1180×760 และ ~620 ไม่ล้น
- [ ] **7.2 วัด overflow ทุก state ด้วย getBoundingClientRect/scrollHeight
- [ ] **7.3 commit สุดท้าย + push origin main → เช็ค Actions + curl เทียบ bundle hash**

## Self-Review Notes
- Spec A→Task 6 · B1→Task 1,4,5 · B2→Task 1,2,4 · B3→Task 5 · C1→Task 3 · C2→Task 3,4,6 · C3→Task 2,5 · C4→Task 4,5 · D→Task 6 · F→Task 2-4 (unit) + 7 (browser)
- ชื่อฟังก์ชันสอดคล้อง: quizRewardAt/quizPenaltyAt (Task 2) ↔ ใช้ใน Task 4.3, 5.3 · assignGachaItem (4.2) ↔ 5.1 · getUsedQuizIds/markQuizUsed/resetQuizHistory (3.1) ↔ 4.1, 6.3
