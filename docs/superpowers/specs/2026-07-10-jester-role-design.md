# พนักงานสติแตก (Jester Role) — Design Spec

**Goal:** เพิ่ม role ที่ 3 "พนักงานสติแตก" เปิด/ปิดได้ก่อนแจกบทบาท มีได้ 1 คน — ชนะเมื่อโดนโหวตประจำวันถึงเกณฑ์ (จบเกมทันที ทีม+สปายแพ้)

**เคาะแล้ว (2026-07-10):** ชนะจากโหวตประจำวันเท่านั้น · หน้าชี้ตัวคนที่ 2 โดนคนสติแตก = ชี้ผิดธรรมดา เล่นต่อ · Codex เจนรูป

---

## กติกา

- **1 คนต่อเกม** เมื่อเปิด · สุ่มจาก "คนที่มาวันแรก" หลังสุ่มสปาย 2 คน (แทนผู้เล่นปกติ 1 คน) — ต้องมีคนมา ≥ 3
- คนสติแตก **เห็นการ์ดบทบาทตัวเอง** · เล่นเดี่ยว ไม่มีคู่หู ไม่มีเกราะ (เกราะสปายไม่มีวันตกที่คนสติแตก)
- หมุนกาชา / ใช้ไอเทม / โหวต ได้ปกติเหมือนผู้เล่นทั่วไป · การเอียงเรทกาชาของสปายไม่ใช้กับคนสติแตก (ไม่ใช่สปาย)
- **แตะระบบจุดเดียว:** โหวตประจำวันถึงเกณฑ์แล้วผู้ถูกจับ = คนสติแตก → `publicResult = "caughtJester"` → **จบเกมทันที `endWinner = "jester"`** (ไม่ว่าจะวันไหน)
- ทุกที่อื่นถือเป็น "ไม่ใช่สปาย" ปกติ: หน้าชี้ตัวสปายคนที่ 2 ถ้าชี้โดนคนสติแตก = ชี้ผิด (เหมือนชี้โดนคนปกติ) → เล่นต่อตามเดิม · ไม่นับใน spyPoolReveal · เกราะไม่เกี่ยว

## จุดแตะโค้ด (integration points)

| ไฟล์ | เปลี่ยน |
|---|---|
| `domain/types.ts` | `Role = "normal" \| "jester" \| SpySlot` · `EndWinner += "jester"` · `VoteEngineResult.publicResult += "caughtJester"` · `GameConfig.jesterEnabled: boolean` |
| `data/configDefaults.ts` | `jesterEnabled: false` |
| `domain/roleEngine.ts` | ฟังก์ชันใหม่ `promoteJester(roles, eligibleIds, random)` — เลือก 1 normal-eligible เป็น jester (คืน roles ใหม่) |
| `state/actions.ts` `assignNewRoles` | ถ้า `config.jesterEnabled` → เรียก promoteJester ต่อจากสุ่มสปาย · guard: eligible ≥ 3 |
| `domain/voteEngine.ts` | ถ้า `winnerRole === "jester"` → `publicResult = "caughtJester"` (ก่อนเช็ค spy) · เกราะไม่เกี่ยว |
| `state/actions.ts` `advanceFromVoteResult` | ถ้า `publicResult === "caughtJester"` → `phase: "ended", endWinner: "jester"` (ก่อน logic วันสุดท้าย) |
| `features/vote/VoteResultScene.tsx` | แสดงผล caughtJester: "😜 พนักงานสติแตกชนะ!" + เปิดเผยรูปคนสติแตก + ปุ่มไปหน้าจบ |
| `features/role/RoleRevealFlow.tsx` | `role === "jester"` → การ์ด `role-jester.webp` + "คุณคือพนักงานสติแตก" + เป้าหมาย "ทำตัวให้น่าสงสัยจนโดนโหวต!" · ไม่มี aside คู่หู/เกราะ |
| `features/end/EndGameScene.tsx` | `endWinner === "jester"` → `end-jester-win.webp` + copy + เปิดเผยว่าใครคือคนสติแตก |
| `features/settings/SettingsPanel.tsx` | toggle `jesterEnabled` (สวิตช์ เปิด/ปิด แบบ `.gacha-toggle`) ในหมวด 🎭 บทบาท & เวลาเกม |
| `state/storage.ts` | เซฟเก่าไม่มี `jesterEnabled` → default false (auto จาก `{...defaultConfig, ...saved}`) |

## Art (Codex เจน + ตัดพื้นหลังเอง)

- `role-jester.webp` — การ์ดพนักงานหญิงสติแตก (ตาลอย ผมยุ่ง ยิ้มกวนๆ) สไตล์เดียวกับ `role-normal`/`role-spy`
- `end-jester-win.webp` — ฉากจบคนสติแตกชนะ สไตล์เดียวกับ `end-team-win`/`end-spy-win`
- โค้ดใช้ `onError` fallback ได้ระหว่างรอรูป (การ์ดยังโชว์ข้อความ/อีโมจิ)

## Testing

- roleEngine: promoteJester เลือก jester จาก eligible ที่ไม่ใช่สปาย · ไม่แตะสปาย
- actions: assignNewRoles(jesterEnabled) → มี jester 1, spy 2, ที่เหลือ normal · คนลาไม่เป็น jester · eligible < 3 → throw
- voteEngine: winner = jester → publicResult caughtJester · winner = spy ยังเป็น caughtSpy
- actions: advanceFromVoteResult(caughtJester) → ended + endWinner jester
- resolveSecondSpyGuess: ชี้โดน jester = correct:false (เล่นต่อ) — ยืนยันว่าไม่ชนะ
