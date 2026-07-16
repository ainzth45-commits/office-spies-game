# Player Registration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เอาข้อมูลจริงพนักงานออกจาก source ทั้งหมด + เพิ่มระบบลงทะเบียนผู้เล่น (เพิ่ม/แก้/ลบ) ในเมนูตั้งค่าแอดมิน เก็บ local เท่านั้น

**Architecture:** ผู้เล่นอยู่ใน `GameState.players` เดิม (ทาง A ตาม spec) — `defaultPlayers` กลายเป็นลิสต์ว่าง, action ใหม่ 3 ตัวจัดการรายชื่อ, migration `rosterVersion:2` ล้างเซฟเก่าทิ้ง, รูปเก็บเป็น URL หรือ data URL ในช่อง `imageUrl` เดิม

**Tech Stack:** React 18 + TypeScript + Vite + Vitest (jsdom) · state ผ่าน `useGameStore` (`setState((cur) => action(cur))`) · เซฟลง IndexedDB (`state/storage.ts`)

**Base:** commit `3c8fc22` · ทำงานใน `เกมที่1/app/`

---

### Task 1: `buildPlayerRecords` + `createInitialGameState(players?)` + test helper

**Files:**
- Modify: `src/state/gameState.ts`
- Create: `src/state/testUtils.ts`
- Test: `src/state/gameState.test.ts` (สร้างใหม่)

- [ ] **Step 1: เขียนเทสที่ fail ก่อน** — `src/state/gameState.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { buildPlayerRecords, createInitialGameState } from "./gameState";
import { makeTestPlayers, makeTestState } from "./testUtils";

describe("buildPlayerRecords", () => {
  it("สร้าง record ครบ 3 ตารางจากรายชื่อ", () => {
    const players = makeTestPlayers(3);
    const records = buildPlayerRecords(players);
    expect(records.attendance).toEqual({ C001: true, C002: true, C003: true });
    expect(records.roles).toEqual({ C001: "normal", C002: "normal", C003: "normal" });
    expect(records.inventories).toEqual({ C001: [], C002: [], C003: [] });
  });
});

describe("createInitialGameState", () => {
  it("ไม่ส่งรายชื่อ = เกมว่างเปล่า (ไม่มีข้อมูลจริงฝังโค้ด)", () => {
    const state = createInitialGameState();
    expect(state.players).toEqual([]);
    expect(state.attendance).toEqual({});
  });
  it("ส่งรายชื่อ = record ครบทุกคน", () => {
    const state = makeTestState();
    expect(state.players).toHaveLength(12);
    expect(Object.keys(state.roles)).toHaveLength(12);
    expect(state.rosterVersion).toBe(2);
  });
});
```

- [ ] **Step 2: สร้าง `src/state/testUtils.ts`** — ผู้เล่นสมมุติเท่านั้น **ห้ามชื่อจริง** · default 12 คนเพื่อให้ค่า economy ในเทสเดิม (ค่าโหวต 54 ฯลฯ) ใช้ได้ต่อ

```ts
import type { GameState, Player } from "../domain/types";
import { createInitialGameState } from "./gameState";

export function makeTestPlayers(count = 12): Player[] {
  return Array.from({ length: count }, (_, i) => {
    const code = `C${String(i + 1).padStart(3, "0")}`;
    return { id: code, code, name: `ผู้เล่น ${i + 1}`, imageUrl: "" };
  });
}

// เทสส่วนใหญ่ต้องการเกมที่มีผู้เล่นพร้อมเล่น — แทน createInitialGameState() เดิมที่เคยมี 12 คนจริง
export function makeTestState(count = 12): GameState {
  return createInitialGameState(makeTestPlayers(count));
}
```

- [ ] **Step 3: แก้ `src/state/gameState.ts`** ทั้งไฟล์เป็น:

```ts
import { defaultConfig } from "../data/configDefaults";
import { defaultPlayers } from "../data/players";
import type { GameState, Player, PlayerId } from "../domain/types";

// สร้างตาราง per-player (มา/ลา, บทบาท, กระเป๋า) จากรายชื่อ — ใช้ทั้งตอนสร้างเกมและตอนล้างกระดานที่ต้องคงรายชื่อไว้
export function buildPlayerRecords(players: Player[]): Pick<GameState, "attendance" | "roles" | "inventories"> {
  return {
    attendance: Object.fromEntries(players.map((player) => [player.id, true])) as Record<PlayerId, boolean>,
    roles: Object.fromEntries(players.map((player) => [player.id, "normal"])) as GameState["roles"],
    inventories: Object.fromEntries(players.map((player) => [player.id, []])) as GameState["inventories"],
  };
}

export function createInitialGameState(players: Player[] = defaultPlayers): GameState {
  return {
    version: 1,
    rosterVersion: 2,
    phase: "boot",
    players,
    config: defaultConfig,
    ...buildPlayerRecords(players),
    /* ...ฟิลด์ที่เหลือคงเดิมทุกบรรทัด (shield, manualDay, voteCostState, dailyUsage,
       pendingQuiz, pendingQuizResult, pendingGachaGrant, history, settings,
       cluePurchasesByVoteRound, currentVoteRoundId, currentVote, lastVoteResult,
       lastClueResult, lastGachaResult, lastGuessResult, endWinner)... */
  };
}
```

(คงเนื้อ object เดิมไว้ แค่แทน 3 บรรทัด attendance/roles/inventories ด้วย spread + เพิ่ม `rosterVersion: 2` + รับ param)

- [ ] **Step 4: เพิ่ม `rosterVersion` ใน type** — `src/domain/types.ts` ใน `interface GameState` (ใต้ `version: number;`):

```ts
  // ยุคของระบบรายชื่อ — 2 = ลงทะเบียนในแอป (เซฟที่ไม่มี field นี้คือยุครายชื่อฝังโค้ด ต้องล้างทิ้ง)
  rosterVersion: number;
```

- [ ] **Step 5: รันเทสใหม่ให้ผ่าน** — `npx vitest run src/state/gameState.test.ts --pool=forks` → PASS ทุกข้อ (เทสเก่ายังไม่แตะ — `defaultPlayers` ยังมี 12 คนจริงอยู่ ทำให้ suite เดิมผ่านเหมือนเดิม)
- [ ] **Step 6: Commit** — `git commit -m "feat(state): buildPlayerRecords + createInitialGameState รับรายชื่อ + rosterVersion"`

### Task 2: ย้ายเทสทั้งหมดไปใช้ `makeTestState`

**Files:**
- Modify: ทุกไฟล์เทสที่เรียก `createInitialGameState()` (หา: `grep -rln "createInitialGameState()" src --include="*.test.ts"` — คาด: actions.test.ts, backup.test.ts, migration.test.ts, quizHistory.test.ts ฯลฯ)

- [ ] **Step 1: แทนที่แบบกลไก** — ในไฟล์เทสแต่ละไฟล์: เปลี่ยน `createInitialGameState()` → `makeTestState()` ทุกจุด + เปลี่ยน/เพิ่ม import เป็น `import { makeTestState } from "./testUtils";` (path ตามตำแหน่งไฟล์) · จุดที่เทสอยากได้เกม "ว่าง" จริงๆ (ถ้ามี) คงไว้
- [ ] **Step 2: รันทั้ง suite** — `npx vitest run --pool=forks` → **118 + เทสใหม่ Task 1 ผ่านทั้งหมด**
- [ ] **Step 3: Commit** — `git commit -m "test: ย้ายเทสไปใช้ makeTestState (ผู้เล่นสมมุติ ไม่พึ่งรายชื่อจริง)"`

### Task 3: ลบข้อมูลจริงออกจาก source

**Files:**
- Modify: `src/data/players.ts`, `src/data/preloadAssets.ts`

- [ ] **Step 1: `src/data/players.ts` เหลือ:**

```ts
import type { Player } from "../domain/types";

// รายชื่อผู้เล่นไม่ฝังโค้ดแล้ว — ลงทะเบียนในแอป (ตั้งค่า → ผู้เล่น) เก็บใน local เท่านั้น
// repo นี้เป็น public: ห้ามใส่ชื่อจริง/รูปจริงพนักงานลงไฟล์นี้อีก
export const defaultPlayers: Player[] = [];
```

- [ ] **Step 2: `src/data/preloadAssets.ts`** — ลบ `import { defaultPlayers } ...` และบรรทัด `...defaultPlayers.map((player) => player.imageUrl),` (รูปผู้เล่นเป็น data URL/URL ที่ผู้ใช้ใส่เอง ไม่ต้อง preload)
- [ ] **Step 3: ตรวจไม่มีข้อมูลจริงเหลือ** — `grep -ri "googleusercontent" src/` → ว่าง · `npx tsc --noEmit` ผ่าน
- [ ] **Step 4: รันทั้ง suite ผ่าน** (เทสใช้ makeTestState แล้ว ไม่พึ่ง defaultPlayers)
- [ ] **Step 5: Commit** — `git commit -m "feat(data): เอารายชื่อ+รูปจริงออกจาก source — defaultPlayers ว่าง"`

### Task 4: action `addPlayer` / `updatePlayer` / `removePlayer`

**Files:**
- Modify: `src/state/actions.ts`
- Test: `src/state/playerRoster.test.ts` (สร้างใหม่)

- [ ] **Step 1: เทส fail ก่อน** — `src/state/playerRoster.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { addPlayer, assignNewRoles, removePlayer, updatePlayer } from "./actions";
import { createInitialGameState } from "./gameState";
import { makeTestState } from "./testUtils";

describe("player roster", () => {
  it("addPlayer สร้าง code รันต่อจาก max + record ครบ 3 ตาราง", () => {
    let state = createInitialGameState();
    state = addPlayer(state, { name: "  ทดสอบ หนึ่ง  ", imageUrl: "" });
    expect(state.players).toEqual([{ id: "C001", code: "C001", name: "ทดสอบ หนึ่ง", imageUrl: "" }]);
    expect(state.attendance.C001).toBe(true);
    expect(state.roles.C001).toBe("normal");
    expect(state.inventories.C001).toEqual([]);
  });
  it("ลบคนแล้ว code ไม่ถูกใช้ซ้ำ (กันชนกับ state เก่า)", () => {
    let state = makeTestState(3); // C001-C003
    state = removePlayer(state, "C003");
    state = addPlayer(state, { name: "คนใหม่", imageUrl: "" });
    expect(state.players.map((p) => p.code)).toEqual(["C001", "C002", "C004"]);
  });
  it("removePlayer ล้าง record ทุกตาราง", () => {
    let state = makeTestState(3);
    state = removePlayer(state, "C002");
    expect(state.players.map((p) => p.id)).toEqual(["C001", "C003"]);
    expect(state.attendance.C002).toBeUndefined();
    expect(state.roles.C002).toBeUndefined();
    expect(state.inventories.C002).toBeUndefined();
  });
  it("ชื่อว่าง/อักขระล่องหนล้วน = throw", () => {
    const state = createInitialGameState();
    expect(() => addPlayer(state, { name: "  ​ ", imageUrl: "" })).toThrow("ใส่ชื่อผู้เล่นก่อน");
  });
  it("เพิ่ม/ลบระหว่างเกมค้าง (แจกบทบาทแล้ว) = throw · แก้ชื่อ/รูปทำได้", () => {
    let state = assignNewRoles(makeTestState(4));
    expect(() => addPlayer(state, { name: "แทรก", imageUrl: "" })).toThrow("จบเกมหรือเริ่มรอบใหม่ก่อน");
    expect(() => removePlayer(state, "C001")).toThrow("จบเกมหรือเริ่มรอบใหม่ก่อน");
    state = updatePlayer(state, "C001", { name: "ชื่อใหม่", imageUrl: "https://example.com/a.webp" });
    expect(state.players[0].name).toBe("ชื่อใหม่");
  });
  it("updatePlayer กับ id ที่ไม่มี = throw", () => {
    expect(() => updatePlayer(makeTestState(2), "C099", { name: "x", imageUrl: "" })).toThrow("ไม่พบผู้เล่น");
  });
});
```

- [ ] **Step 2: รันให้เห็น fail** — `npx vitest run src/state/playerRoster.test.ts --pool=forks` → FAIL (ฟังก์ชันยังไม่มี)
- [ ] **Step 3: เขียน implementation ใน `src/state/actions.ts`** (วางถัดจาก `rolesAssigned`) — ใช้ `log()`/`rolesAssigned()` ที่มีอยู่แล้ว + import `buildPlayerRecords` ไม่ต้อง (แก้ราย key พอ) + import type `Player` เพิ่ม:

```ts
// ---- ระบบลงทะเบียนผู้เล่น (ตั้งค่า → ผู้เล่น) ----
// เพิ่ม/ลบทำได้เฉพาะตอนยังไม่แจกบทบาท — กลางเกมมี บทบาท/ไอเทม/โหวต ผูก id อยู่ ลบแล้วพังทั้งกระดาน
const ROSTER_LOCKED_MESSAGE = "แก้รายชื่อระหว่างเกมไม่ได้ — จบเกมหรือเริ่มรอบใหม่ก่อน";

function cleanPlayerName(raw: string): string {
  // ตัดอักขระควบคุม/ล่องหน (zero-width, BOM ฯลฯ) แล้ว trim — กันชื่อว่างแบบมองไม่เห็น
  const cleaned = raw.replace(/[ -​-‍⁠﻿]/g, "").trim();
  if (!cleaned) throw new Error("ใส่ชื่อผู้เล่นก่อน");
  return cleaned.slice(0, 40);
}

function nextPlayerCode(players: Player[]): string {
  // รันต่อจากเลข max เสมอ ไม่เติมช่องว่าง — code ที่เคยถูกใช้แล้วห้ามเวียนกลับมา
  const maxNumber = players.reduce((max, player) => {
    const numeric = Number(player.code.replace(/^C/, ""));
    return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
  }, 0);
  return `C${String(maxNumber + 1).padStart(3, "0")}`;
}

export function addPlayer(state: GameState, input: { name: string; imageUrl: string }): GameState {
  if (rolesAssigned(state)) throw new Error(ROSTER_LOCKED_MESSAGE);
  const name = cleanPlayerName(input.name);
  const code = nextPlayerCode(state.players);
  const player: Player = { id: code, code, name, imageUrl: input.imageUrl };
  return log(
    {
      ...state,
      players: [...state.players, player],
      attendance: { ...state.attendance, [player.id]: true },
      roles: { ...state.roles, [player.id]: "normal" },
      inventories: { ...state.inventories, [player.id]: [] },
    },
    `ลงทะเบียนผู้เล่น ${code} ${name}`,
  );
}

export function updatePlayer(state: GameState, playerId: PlayerId, input: { name: string; imageUrl: string }): GameState {
  const existing = state.players.find((player) => player.id === playerId);
  if (!existing) throw new Error("ไม่พบผู้เล่นที่ต้องการแก้ไข");
  const name = cleanPlayerName(input.name);
  const players = state.players.map((player) => (player.id === playerId ? { ...player, name, imageUrl: input.imageUrl } : player));
  return log({ ...state, players }, `แก้ข้อมูลผู้เล่น ${existing.code}`);
}

export function removePlayer(state: GameState, playerId: PlayerId): GameState {
  if (rolesAssigned(state)) throw new Error(ROSTER_LOCKED_MESSAGE);
  const existing = state.players.find((player) => player.id === playerId);
  if (!existing) throw new Error("ไม่พบผู้เล่นที่ต้องการลบ");
  const { [playerId]: _att, ...attendance } = state.attendance;
  const { [playerId]: _role, ...roles } = state.roles;
  const { [playerId]: _inv, ...inventories } = state.inventories;
  return log(
    { ...state, players: state.players.filter((player) => player.id !== playerId), attendance, roles: roles as GameState["roles"], inventories: inventories as GameState["inventories"] },
    `ลบผู้เล่น ${existing.code} ${existing.name}`,
  );
}
```

- [ ] **Step 4: รันเทสผ่าน** — ไฟล์นี้ + ทั้ง suite
- [ ] **Step 5: Commit** — `git commit -m "feat(state): addPlayer/updatePlayer/removePlayer พร้อม guard กลางเกม"`

### Task 5: เริ่มรอบใหม่/จบเกมคงรายชื่อ + guard เริ่มเกม <3 คน

**Files:**
- Modify: `src/state/actions.ts` (`startNewGameRound`, `finishGameToBoot`, `enterRoleReveal`)
- Test: เพิ่มใน `src/state/playerRoster.test.ts`

- [ ] **Step 1: เทส fail ก่อน** (ต่อท้ายไฟล์เทสเดิม)

```ts
import { enterRoleReveal, finishGameToBoot, startNewGameRound } from "./actions";

describe("roster survives resets", () => {
  it("เริ่มรอบใหม่: รายชื่ออยู่ครบ + record 3 ตารางสร้างใหม่ครบทุกคน", () => {
    const state = startNewGameRound(assignNewRoles(makeTestState(4)));
    expect(state.players).toHaveLength(4);
    expect(Object.keys(state.attendance)).toHaveLength(4);
    expect(Object.values(state.roles).every((role) => role === "normal")).toBe(true);
    expect(Object.keys(state.inventories)).toHaveLength(4);
  });
  it("จบเกมกลับ boot: เหมือนกัน", () => {
    const state = finishGameToBoot(assignNewRoles(makeTestState(4)));
    expect(Object.keys(state.attendance)).toHaveLength(4);
  });
  it("เริ่มเกมโดยมีผู้เล่น < 3 = throw บอกให้ลงทะเบียน", () => {
    expect(() => enterRoleReveal(makeTestState(2))).toThrow("ลงทะเบียนผู้เล่นอย่างน้อย 3 คน");
  });
});
```

(หมายเหตุ: makeTestState(4) แจกบทบาทได้เพราะ jesterEnabled default = false ต้องการแค่ ≥2)

- [ ] **Step 2: แก้ implementation** — ใน `startNewGameRound` และ `finishGameToBoot` เปลี่ยนบรรทัด return เป็นแบบเดียวกันทั้งคู่ (+import `buildPlayerRecords`):

```ts
return log(
  { ...fresh, ...buildPlayerRecords(state.players), phase: "boot", players: state.players, config: state.config, settings: state.settings },
  "เริ่มรอบใหม่ — ล้างกระดานทั้งหมด", // (ข้อความเดิมของแต่ละฟังก์ชัน)
);
```

ใน `enterRoleReveal` เพิ่มบรรทัดแรก:

```ts
if (state.players.length < 3) throw new Error("ลงทะเบียนผู้เล่นอย่างน้อย 3 คนในตั้งค่าก่อนเริ่มเกม");
```

- [ ] **Step 3: รันทั้ง suite ผ่าน** — ระวัง: เทสเดิมที่เรียก enterRoleReveal ใช้ makeTestState(12) อยู่แล้ว ไม่โดน guard
- [ ] **Step 4: Commit** — `git commit -m "fix(state): ล้างกระดานแล้ว rebuild record จากรายชื่อจริง + guard เริ่มเกม <3 คน"`

### Task 6: migration "เริ่มใหม่หมด" ใน storage.ts

**Files:**
- Modify: `src/state/storage.ts` (`migrateGameState`)
- Test: `src/state/rosterMigration.test.ts` (สร้างใหม่)

- [ ] **Step 1: เทส fail ก่อน**

```ts
import { describe, expect, it } from "vitest";
import type { GameState } from "../domain/types";
import { migrateGameState } from "./storage";
import { makeTestState } from "./testUtils";

describe("roster migration", () => {
  it("เซฟยุคเก่า (ไม่มี rosterVersion) → ล้างรายชื่อ+กระดาน คง config/settings", () => {
    const legacy = { ...makeTestState(12), phase: "home" } as GameState & { rosterVersion?: number };
    delete legacy.rosterVersion;
    legacy.config = { ...legacy.config, spyCount: 3 };
    legacy.settings = { ...legacy.settings, soundEnabled: false };
    const migrated = migrateGameState(legacy as GameState);
    expect(migrated.players).toEqual([]);
    expect(migrated.phase).toBe("boot");
    expect(migrated.rosterVersion).toBe(2);
    expect(migrated.config.spyCount).toBe(3);
    expect(migrated.settings.soundEnabled).toBe(false);
  });
  it("เซฟยุคใหม่ (rosterVersion 2) → รายชื่อรอด ไม่โดนล้าง", () => {
    const saved = { ...makeTestState(5), phase: "home" as const };
    const migrated = migrateGameState(saved);
    expect(migrated.players).toHaveLength(5);
    expect(migrated.phase).toBe("home");
  });
});
```

- [ ] **Step 2: แก้ `migrateGameState`** — ลบ loop "เติมผู้เล่นใหม่จาก fresh.players" (ของรอบ C012 — ไม่มี default แล้ว ไม่มีอะไรให้เติม) แล้วเพิ่มเป็นด่านแรกของฟังก์ชัน:

```ts
export function migrateGameState(raw: GameState): GameState {
  const state = raw as LegacyGameState;
  // เซฟยุครายชื่อฝังโค้ด (ไม่มี rosterVersion) มีชื่อ/รูปพนักงานชุดเก่า — เจ้านายสั่งเริ่มใหม่หมด:
  // ล้างรายชื่อ+กระดานทิ้ง เหลือ config ของซุป + settings เครื่อง แล้วให้ไปลงทะเบียนใหม่ในตั้งค่า
  if (typeof (state as GameState).rosterVersion !== "number") {
    const fresh = createInitialGameState();
    return {
      ...fresh,
      phase: "boot",
      config: migrateConfig(state.config ?? fresh.config),
      settings: { ...fresh.settings, ...state.settings },
    };
  }
  /* ...ตัว merge เดิมที่เหลือคงไว้ทั้งหมด (ลบเฉพาะ loop เติม fresh.players ท้ายฟังก์ชัน)... */
}
```

- [ ] **Step 3: รันทั้ง suite ผ่าน** (เช็ก migration.test.ts เดิมด้วย — เซฟที่มันประกอบอาจไม่มี rosterVersion → โดนล้าง: ถ้าเทสเดิมทดสอบ merge รายละเอียด ให้เติม `rosterVersion: 2` เข้า fixture ของมันเพื่อเข้าเส้นทาง merge เดิม)
- [ ] **Step 4: Commit** — `git commit -m "feat(storage): migration เริ่มใหม่หมด — เซฟยุคเก่าล้างรายชื่อ+กระดาน คง config/settings"`

### Task 7: ตัวย่อรูป `processPlayerImage`

**Files:**
- Create: `src/features/settings/playerImage.ts`
- Test: `src/features/settings/playerImage.test.ts` (เทสเฉพาะ validate ลิงก์ — ส่วน canvas เทสใน browser จริงตอน verify เพราะ jsdom ไม่มี canvas)

- [ ] **Step 1: เทส fail ก่อน**

```ts
import { describe, expect, it } from "vitest";
import { validateImageLink } from "./playerImage";

describe("validateImageLink", () => {
  it("รับเฉพาะ http/https", () => {
    expect(validateImageLink("https://example.com/a.webp")).toBe("https://example.com/a.webp");
    expect(validateImageLink("  http://a.b/c.png  ")).toBe("http://a.b/c.png");
    expect(() => validateImageLink("javascript:alert(1)")).toThrow("ลิงก์รูปต้องขึ้นต้นด้วย http");
    expect(() => validateImageLink("")).toThrow("ลิงก์รูปต้องขึ้นต้นด้วย http");
  });
});
```

- [ ] **Step 2: implementation**

```ts
// รูปผู้เล่น: จากลิงก์ (เก็บ URL ตรงๆ) หรือจากกล้อง/ไฟล์ (ย่อในเครื่อง เก็บเป็น data URL — ไม่มีรูปออกนอกเครื่อง)
const MAX_EDGE = 500; // การ์ดผู้เล่นใช้กว้างสุด ~500px — เก็บใหญ่กว่านี้เปลืองเปล่า

export function validateImageLink(raw: string): string {
  const url = raw.trim();
  if (!/^https?:\/\//i.test(url)) throw new Error("ลิงก์รูปต้องขึ้นต้นด้วย http:// หรือ https://");
  return url;
}

export async function processPlayerImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("ไฟล์นี้ไม่ใช่รูปภาพ");
  const bitmap = await readImage(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("อุปกรณ์นี้ย่อรูปไม่ได้ — ลองใช้วิธีวางลิงก์แทน");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  // Safari บางรุ่น encode webp ไม่ได้ → toDataURL คืน png มาแทน เช็คแล้ว fallback เป็น jpeg
  const webp = canvas.toDataURL("image/webp", 0.8);
  return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/jpeg", 0.82);
}

function readImage(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ("createImageBitmap" in window) return createImageBitmap(file);
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("อ่านไฟล์รูปไม่สำเร็จ")); };
    image.src = url;
  });
}
```

- [ ] **Step 3: รันเทสผ่าน + Commit** — `git commit -m "feat(settings): ตัวย่อรูปผู้เล่น 500px webp/jpeg + validate ลิงก์"`

### Task 8: UI หมวด "👥 ผู้เล่น" ใน SettingsPanel

**Files:**
- Create: `src/features/settings/PlayersSection.tsx`
- Modify: `src/features/settings/SettingsPanel.tsx` (แทรก `<PlayersSection />` เป็น section แรกใน panel), `src/styles/global.css`

- [ ] **Step 1: สร้าง `PlayersSection.tsx`** — pattern เดียวกับ SettingsPanel (useGameStore + setState((cur) => action(cur)) + error state):

```tsx
import { useRef, useState } from "react";
import type { Player } from "../../domain/types";
import { addPlayer, removePlayer, rolesAssigned, updatePlayer } from "../../state/actions";
import { useGameStore } from "../../state/useGameStore";
import { GameButton } from "../../ui/components/GameButton";
import { processPlayerImage, validateImageLink } from "./playerImage";

// ฟอร์มเพิ่ม/แก้ผู้เล่น — โหมดเพิ่ม (editing=null) กับโหมดแก้ ใช้ตัวเดียวกัน
export function PlayersSection() {
  const { state, setState } = useGameStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Player | null>(null);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkDraft, setLinkDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const locked = rolesAssigned(state);

  function openForm(player: Player | null) {
    setEditing(player);
    setName(player?.name ?? "");
    setImageUrl(player?.imageUrl ?? "");
    setLinkDraft(player && /^https?:/.test(player.imageUrl) ? player.imageUrl : "");
    setError(null);
    setFormOpen(true);
  }

  async function onPickFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // เลือกไฟล์เดิมซ้ำได้
    if (!file) return;
    setBusy(true);
    try { setImageUrl(await processPlayerImage(file)); setError(null); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "อ่านรูปไม่สำเร็จ"); }
    finally { setBusy(false); }
  }

  function applyLink() {
    try { setImageUrl(validateImageLink(linkDraft)); setError(null); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "ลิงก์ไม่ถูกต้อง"); }
  }

  function save() {
    try {
      setState((current) => (editing ? updatePlayer(current, editing.id, { name, imageUrl }) : addPlayer(current, { name, imageUrl })));
      setFormOpen(false);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "บันทึกไม่สำเร็จ"); }
  }

  function confirmDelete(playerId: string) {
    try { setState((current) => removePlayer(current, playerId)); setConfirmDeleteId(null); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "ลบไม่สำเร็จ"); }
  }

  return (
    <section className="settings-category players-section">
      <h3>👥 ผู้เล่น ({state.players.length} คน)</h3>
      {locked ? <p className="players-section__locked">🔒 เกมกำลังเล่นอยู่ — เพิ่ม/ลบได้หลังจบเกมหรือเริ่มรอบใหม่ (แก้ชื่อ/รูปได้)</p> : null}
      {state.players.length === 0 ? <p className="players-section__empty">ยังไม่มีผู้เล่น — เพิ่มอย่างน้อย 3 คนถึงจะเริ่มเกมได้</p> : null}
      <ul className="players-list">
        {state.players.map((player) => (
          <li key={player.id} className="players-list__row">
            {player.imageUrl ? <img src={player.imageUrl} alt="" className="players-list__thumb" /> : <span className="players-list__thumb players-list__thumb--empty">{player.code}</span>}
            <span className="players-list__code">{player.code}</span>
            <span className="players-list__name">{player.name}</span>
            <button type="button" className="players-list__btn" onClick={() => openForm(player)}>✏️</button>
            {confirmDeleteId === player.id ? (
              <button type="button" className="players-list__btn players-list__btn--danger" onClick={() => confirmDelete(player.id)}>ยืนยันลบ?</button>
            ) : (
              <button type="button" className="players-list__btn" disabled={locked} onClick={() => { setConfirmDeleteId(player.id); setError(null); }}>🗑</button>
            )}
          </li>
        ))}
      </ul>
      <GameButton disabled={locked} onClick={() => openForm(null)}>➕ เพิ่มผู้เล่น</GameButton>
      {error && !formOpen ? <p className="settings-error">{error}</p> : null}

      {formOpen ? (
        <div className="player-form">
          <h4>{editing ? `แก้ไข ${editing.code}` : "ลงทะเบียนผู้เล่นใหม่"}</h4>
          <label>ชื่อ<input value={name} maxLength={40} onChange={(event) => setName(event.target.value)} placeholder="ชื่อเล่น + ชื่อจริง" /></label>
          <div className="player-form__photo">
            {imageUrl ? <img src={imageUrl} alt="ตัวอย่างรูป" className="player-form__preview" /> : <div className="player-form__preview player-form__preview--empty">ไม่มีรูป</div>}
            <div className="player-form__photo-actions">
              <GameButton variant="paper" disabled={busy} onClick={() => cameraInputRef.current?.click()}>📷 ถ่ายรูป</GameButton>
              <GameButton variant="paper" disabled={busy} onClick={() => fileInputRef.current?.click()}>🖼 เลือกรูป</GameButton>
              <div className="player-form__link">
                <input value={linkDraft} onChange={(event) => setLinkDraft(event.target.value)} placeholder="https://... วางลิงก์รูป" />
                <GameButton variant="paper" onClick={applyLink}>ใช้ลิงก์</GameButton>
              </div>
            </div>
          </div>
          <input ref={cameraInputRef} type="file" accept="image/*" capture="user" hidden onChange={onPickFile} />
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={onPickFile} />
          {busy ? <p>กำลังย่อรูป…</p> : null}
          {error ? <p className="settings-error">{error}</p> : null}
          <div className="player-form__actions">
            <GameButton variant="paper" onClick={() => setFormOpen(false)}>ยกเลิก</GameButton>
            <GameButton onClick={save}>{editing ? "บันทึก" : "เพิ่มเข้าทีม"}</GameButton>
          </div>
        </div>
      ) : null}
    </section>
  );
}
```

- [ ] **Step 2: แทรกใน `SettingsPanel.tsx`** — import แล้ววาง `<PlayersSection />` เป็นบล็อกแรกในเนื้อ panel (เหนือหมวด config เดิม)
- [ ] **Step 3: CSS ใน `global.css`** (ต่อท้ายไฟล์ ตามโทนที่มี):

```css
/* ตั้งค่า → ผู้เล่น */
.players-list { list-style: none; margin: 0 0 12px; padding: 0; display: grid; gap: 6px; }
.players-list__row { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,.06); border-radius: 10px; padding: 6px 10px; }
.players-list__thumb { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; object-position: 50% 18%; flex-shrink: 0; }
.players-list__thumb--empty { display: grid; place-items: center; background: rgba(255,255,255,.12); font-size: 12px; }
.players-list__code { opacity: .7; font-size: 13px; width: 44px; flex-shrink: 0; }
.players-list__name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.players-list__btn { background: none; border: 0; font-size: 18px; padding: 6px; cursor: pointer; }
.players-list__btn:disabled { opacity: .35; }
.players-list__btn--danger { color: #ff6b6b; font-size: 14px; font-weight: 700; }
.players-section__locked, .players-section__empty { font-size: 14px; opacity: .8; margin: 4px 0 10px; }
.player-form { margin-top: 12px; padding: 12px; border-radius: 12px; background: rgba(0,0,0,.25); display: grid; gap: 10px; }
.player-form label { display: grid; gap: 4px; font-size: 14px; }
.player-form input[type="text"], .player-form input:not([type]) { padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,.2); background: rgba(255,255,255,.08); color: inherit; }
.player-form__photo { display: flex; gap: 12px; align-items: flex-start; }
.player-form__preview { width: 96px; height: 96px; border-radius: 12px; object-fit: cover; object-position: 50% 18%; }
.player-form__preview--empty { display: grid; place-items: center; background: rgba(255,255,255,.08); font-size: 12px; opacity: .7; }
.player-form__photo-actions { display: grid; gap: 8px; flex: 1; }
.player-form__link { display: flex; gap: 8px; }
.player-form__link input { flex: 1; }
.player-form__actions { display: flex; justify-content: flex-end; gap: 10px; }
```

- [ ] **Step 4: `npx tsc --noEmit` ผ่าน + suite ผ่าน + Commit** — `git commit -m "feat(settings): หมวดผู้เล่น — ลงทะเบียน/แก้/ลบ รูปจากกล้อง/ไฟล์/ลิงก์"`

### Task 9: HomeHub guard — ยังไม่มีผู้เล่นห้ามเข้าบทบาท

**Files:**
- Modify: `src/features/home/HomeHub.tsx`

- [ ] **Step 1:** dock ปุ่ม "บทบาท" (`HomeHub.tsx:43`) เปลี่ยน onClick:

```ts
{ key: "role", label: "บทบาท", icon: gameAssets.dockRole, fallback: "🕵️", onClick: () => {
  if (state.players.length < 3) { setRosterHint(true); return; }
  setState((current) => enterRoleReveal(current));
} },
```

เพิ่ม state `const [rosterHint, setRosterHint] = useState(false);` และ modal เล็ก (pattern เดียวกับ confirmNewDay ที่มีในไฟล์):

```tsx
{rosterHint ? (
  <div className="modal-backdrop" onClick={() => setRosterHint(false)}>
    <div className="modal-card" onClick={(event) => event.stopPropagation()}>
      <p>ยังไม่มีทีมเลย! ไปที่ ⚙️ ตั้งค่า → 👥 ผู้เล่น ลงทะเบียนอย่างน้อย 3 คนก่อนนะ</p>
      <GameButton onClick={() => setRosterHint(false)}>รับทราบ</GameButton>
    </div>
  </div>
) : null}
```

(ใช้ class modal ที่มีอยู่ในไฟล์ — ถ้าชื่อ class จริงต่างไป ให้ลอกจาก confirmNewDay modal ในไฟล์เดียวกัน)

- [ ] **Step 2: `npx tsc --noEmit` + suite ผ่าน + Commit** — `git commit -m "feat(home): กันเข้าบทบาทตอนยังไม่ลงทะเบียนผู้เล่น"`

### Task 10: Verify ทั้งระบบ + review + deploy

- [ ] **Step 1:** `npx tsc --noEmit` + `npx vitest run --pool=forks` ผ่านทั้งหมด + `npm run build` ผ่าน
- [ ] **Step 2:** `grep -ri "googleusercontent" src/` ว่าง + ไล่สายตา players.ts/testUtils.ts ไม่มีชื่อจริง
- [ ] **Step 3: Browser verify (dev server :5173):** เปิดแอป → เซฟเก่าโดนล้างเข้า boot → ตั้งค่า→ผู้เล่น ลงทะเบียน 3 คน (ลิงก์/ไฟล์/ไม่มีรูป) → เล่น: เปิดบทบาท (ปุ่มเพิ่ม/ลบต้อง lock) → แก้ชื่อกลางเกมได้ → เริ่มรอบใหม่ รายชื่อครบ → ลบ 1 คน → เพิ่มใหม่ code ไม่ซ้ำ → ปิด/เปิดแท็บ รายชื่อยังอยู่ (IndexedDB)
- [ ] **Step 4:** /code-review ระดับละเอียด → แก้ finding ที่ยืนยันแล้ว
- [ ] **Step 5:** push GitHub → รอ Actions deploy สำเร็จ → เช็คเว็บจริง
- [ ] **Step 6:** LINE แจ้งเจ้านาย (`~/.claude/scripts/line-notify.sh`) + อัปเดต memory
