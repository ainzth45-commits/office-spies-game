# 11 — Feedback ให้ codex: เพิ่มหน้า Settings / Config (แก้ตัวเลขในแอปได้)

> แก้ประเด็น **C3** ใน `10-plan-review.md`
> เป้าหมาย: แอดมิน **ปรับตัวเลขเศรษฐกิจทั้งหมดได้ในแอป ไม่ต้องแก้โค้ด/build ใหม่** (ปรับตามโปรแต่ละสัปดาห์)
> นี่คือ **หลักการหลักข้อ 3** ของโปรเจกต์ — ห้าม hardcode ค่าที่ต้องเปลี่ยนบ่อย

---

## 1. ขอบเขต (ต้องทำให้ครบ)

ทำให้ **ทุกค่าใน `04-config-defaults.md` แก้ได้จากหน้า Settings** รวมถึงค่าที่ตอนนี้ยัง hardcode อยู่:
- ✅ ค่าใน `GameConfig` เดิม (เกณฑ์, ค่าโหวต, เบาะแส ฯลฯ)
- ⚠️ **ราคา/ลิมิตไอเทม** ที่ตอนนี้อยู่ใน `data/items.ts` → **ย้ายเข้า `config`**
- ⚠️ **ตารางกาชา** (น้ำหนัก + ค่าเหรียญแต่ละผล + ค่า x,y) ที่ยังไม่มีในแผน (ดู C1) → **ใส่ใน `config` ให้แก้ได้**

> สรุป: `config` ต้องเป็นแหล่งเดียวของตัวเลขทั้งหมด แล้ว UI/engine อ่านจาก `state.config` เท่านั้น

---

## 2. ขยาย `GameConfig` (Task 2)

เพิ่มฟิลด์เหล่านี้เข้า `GameConfig` + `defaultConfig` (ค่าตาม `04-config`):

```ts
// ราคา/ลิมิตไอเทม (ย้ายมาจาก items.ts)
itemPrices: Record<VoteItemType, number>;          // double:10, remove:8, swap:12, reduceThreshold:12, protectThreshold:12
itemDailyLimits: Record<VoteItemType, number>;     // ทุกตัว: 1

// กาชา
gachaCoinSelfGain: number;       // +8
gachaCoinAllGain: number;        // +3
gachaCoinAllLose: number;        // -3
gachaPoorThreshold: number;      // x = 5  (ใครมี < x)
gachaPoorGain: number;           // y = 5
gachaVoteMultiplierUp: number;   // 1.5
gachaVoteMultiplierDown: number; // 0.5
gachaWeights: Record<GachaOutcome, number>; // 10 ผล รวม ~100 (auto-normalize)
```

โดย `GachaOutcome` =
`"selfGain" | "selfLoseAll" | "allGain" | "poorGain" | "allLose" | "voteUp" | "voteDown" | "grantItem" | "grantQuiz" | "spyShield"`

ค่า default น้ำหนัก (จาก `04-config §6`): selfGain 13, selfLoseAll 9, allGain 11, poorGain 9, allLose 9, voteUp 9, voteDown 8, grantItem 9, grantQuiz 15, spyShield 8

---

## 3. Action: `updateConfig` (pure + validate + test)

เพิ่มใน `state/actions.ts`:

```ts
export function updateConfig(state: GameState, patch: Partial<GameConfig>): GameState
```

**Validation (โยน error ข้อความไทยเมื่อค่าผิด — อ้าง `04-config §8`):**
- `spyCount` ≥ 1 และ < จำนวนผู้เล่น
- `thresholdRatio` อยู่ใน (0, 1], `thresholdFloor` ≥ 1
- เกณฑ์ที่คำนวณได้ (`round(ratio × present)`) ต้องอยู่ใน [floor, present] — ตรวจกับ presentCount ปัจจุบัน
- ราคา/รางวัล/โทษ/ค่าเหรียญ ทุกตัว ≥ 0
- `reduceThresholdPercent`, `weakenedReduceThresholdPercent` อยู่ใน [0, 1] และ weakened ≤ reduce
- `cluePriceRatio`, `innocentRefundRatio` อยู่ใน [0, 1]
- `gachaWeights` ทุกค่า ≥ 0 และผลรวม > 0 → **auto-normalize เป็น 100%** ตอนใช้งาน (เก็บค่าดิบได้ แต่ normalize ตอนสุ่ม)
- เปลี่ยนแล้ว **autosave + เข้า backup** เหมือน state อื่น

**เทสที่ต้องมี (`actions.test.ts`):**
- แก้ค่าถูกต้อง → config อัปเดต
- `spyCount` ≥ จำนวนผู้เล่น → throw
- ratio นอกช่วง / ราคาติดลบ → throw
- weakened > reduce → throw
- gachaWeights รวมเป็น 0 → throw; รวมไม่ครบ 100 → normalize ถูกต้อง

> ⚠️ `voteEngine`, `economy`, `gachaEngine`, ร้านไอเทม ต้องอ่านราคา/น้ำหนักจาก `state.config` **ไม่ใช่จาก `items.ts` หรือค่าคงที่** อีกต่อไป

---

## 4. หน้า UI — `features/settings/SettingsPanel.tsx`

- เข้าจากปุ่ม **"⚙️ ตั้งค่า"** ใน HomeHub (เพิ่มปุ่มใน mission board)
- landscape, อินพุตใหญ่ (number stepper +/−), แตะง่าย
- จัดเป็น **กลุ่ม (accordion/แท็บ)** ตาม `04-config`:
  1. ผู้เล่น & บทบาท (spyCount)
  2. เกณฑ์โหวต (ratio, floor, reduce%, weakened%)
  3. ค่าเปิดโหวต (base/หัว, +% วันข้าม, ตัวคูณกาชา up/down)
  4. เบาะแส (เกณฑ์ §4.5 ≥4, เบาะแส(ก) ≥3, cluePriceRatio, notVotedClueMaxCards)
  5. ร้านไอเทม (ราคา+ลิมิตแต่ละไอเทม)
  6. กาชา (ราคาหมุน, ลิมิต/วัน, ค่าเหรียญแต่ละผล, x/y, **น้ำหนัก 10 ผล + โชว์ผลรวมสด ๆ "รวม = X%"**)
  7. โจทย์ (รางวัลถูก, โทษผิด)
  8. คืนเหรียญ (innocentRefundRatio)
- ปุ่ม **"บันทึก"** (เรียก `updateConfig` → ถ้า throw แสดง error ชัดเจน ไม่บันทึก), **"รีเซ็ตเป็นค่าเริ่มต้น"**, **"ยกเลิก"**
- โชว์ตัวอย่างผลแบบสด เช่น "ที่ 11 คน → เกณฑ์ชนะ = 8, ค่าเปิดโหวต = 33" เพื่อกันตั้งค่าพลาด

---

## 5. ข้อควรระวังตอนแก้กลางเกม
- เปลี่ยน `spyCount` กลางเกม **ต้องเตือน + ยืนยัน** (กระทบ role ที่สุ่มไว้) — แนะนำให้เปลี่ยนได้เฉพาะตอนยังไม่เริ่ม/ก่อนสุ่มบทบาท หรือบังคับสุ่มบทบาทใหม่หลังเปลี่ยน
- ค่าอื่น (ราคา/น้ำหนัก/รางวัล) เปลี่ยนกลางเกมได้ทันที (มีผลรอบถัดไป) — ตรงเจตนา "ปรับตามโปรรายวัน"

---

## 6. Definition of Done
- [ ] ทุกค่าใน `04-config` แก้ได้จากหน้า Settings (รวมราคาไอเทม + ตารางกาชา)
- [ ] `items.ts` ไม่ถือราคา/ลิมิตอีกต่อไป (ย้ายเข้า config) — engine/UI อ่านจาก `state.config`
- [ ] `updateConfig` มี validation ครบ + เทสผ่าน (แปะ output)
- [ ] เปลี่ยนค่าแล้ว autosave + อยู่ใน backup + มีผลกับ vote cost/threshold/gacha รอบถัดไปจริง
- [ ] รีเซ็ตค่าเริ่มต้นได้ + กันค่าพังก่อนบันทึก
- [ ] เพิ่ม dry-run step: "แก้ค่าใน Settings แล้วยืนยันว่าค่าโหวต/เกณฑ์เปลี่ยนตาม"

> หมายเหตุ: ข้อนี้ผูกกับ **C1/C2** (ระบบกาชา) — ทำ gacha config + engine พร้อมกันจะเข้ารูปสุด
