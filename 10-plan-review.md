# 10 — รีวิวแผน Implementation ของ codex (ส่งกลับให้ codex)

> รีวิว `docs/superpowers/plans/2026-06-29-office-spies-implementation.md` (2,889 บรรทัด)
> เทียบกับ `01-game-design-spec.md` / `04-config-defaults.md` (source of truth)
> **สรุป: โครงดีมาก เป็น TDD แน่น แต่มีช่องโหว่ที่ต้องอุดก่อนสร้าง — เรียงตามความสำคัญ**

---

## ✅ ส่วนที่ทำได้ดีมาก (ยืนยัน คงไว้)
- **Vote engine + ลำดับ R/P + เกราะ** — โค้ด `resolveThresholdItems` ถูกต้องครบทุกเคส (P-ก่อน-R บล็อก, R-ก่อน-P อ่อนเป็น 12%, ซ้ำ R/ซ้ำ P เด้งข้อความ) + unit test ครบ ✔️
- **เกราะเงียบ** — flip เป็น "failed" + `shieldConsumed` ใช้ภายใน + ใช้เสียง `vote-fail.mp3` เดียวกับแพ้ปกติ ✔️ (ดีมาก)
- **เกราะผูก slot ใน data model** (`shield.slot` ไม่อ้าง playerId) → ตอนสุ่มสปายใหม่ เกราะอยู่กับ slot เดิมอัตโนมัติ ไม่ต้องเขียน logic ย้าย ✔️ (ออกแบบฉลาด)
- **Manual day** (จุดที่เปลี่ยนหลัก) — endWorkingDay เพิ่มค่าโหวต, restDay ไม่เพิ่ม, openVote รีเซ็ต + เทสครบ ✔️
- **Persistence IndexedDB + backup + validate version** ✔️
- **TDD ทุก domain helper + dry-run checklist + noindex/robots** ✔️

---

## 🔴 ระดับวิกฤต — ต้องแก้ก่อนสร้าง

### C1. ระบบกาชา "ไม่มีจริง" ในแผน (ช่องโหว่ใหญ่สุด)
- `GameConfig` (Task 2) **ไม่มีฟิลด์ตารางน้ำหนักกาชาเลย** — ขาดทั้ง 10 ผล, ค่าเหรียญแต่ละผล (+8/+3/−3), ค่า x,y ของ "ใครมี<x รับ y", และ **น้ำหนัก quiz 15%**
- Task 9 Step 5 บอกแค่ "deterministic result resolver helper" แบบลอยๆ **ไม่มีตาราง ไม่มี weight ไม่มี test**
- **แก้:** เพิ่มใน `GameConfig` + `configDefaults.ts` ให้ตรง `04-config §6` (10 ผล + น้ำหนัก + ค่าเหรียญ) แล้วสร้าง `domain/gachaEngine.ts` + `gachaEngine.test.ts` (สุ่มตาม weight ด้วย RandomSource, ทดสอบ fallback: เกราะมีครบ→ทุกคนได้เหรียญ, กระเป๋าเต็ม→ตัวเองได้เหรียญ)

### C2. `nextVoteMultiplier` (กาชา ×1.5 / ×0.5) ไม่เคยถูกเซ็ต
- `openVote` รีเซ็ต nextVoteMultiplier=1 แต่ **ไม่มี action ไหนตั้งเป็น 1.5/0.5 เลย** → ผลกาชา ×1.5/×0.5 จะไม่มีผลจริง
- **แก้:** เพิ่ม action `applyGachaVoteMultiplier(state, 1.5|0.5)` ที่เซ็ต `voteCostState.nextVoteMultiplier` + เทส (ผูกกับ gachaEngine ใน C1)

### C3. ไม่มีหน้าแก้ config ในแอป (ขัดหลักการหลักของเรา)
- แผน hardcode `defaultConfig` + ราคาไอเทมใน `items.ts` **ไม่มีหน้า settings ให้แอดมินปรับตัวเลข** (ค่าโหวต, เกณฑ์, ราคาไอเทม, น้ำหนักกาชา)
- ขัดกับหลักการข้อ 3 ของเรา "ตัวเลขเศรษฐกิจทั้งหมดปรับได้หน้างานตามโปร"
- **ต้องเคาะ:** จะเพิ่ม **หน้า Config (อ่าน/แก้/validate)** หรือยอมรับว่า v1 ปรับค่าไม่ได้ (ต้องแก้โค้ดแล้ว build ใหม่)? — เจ้านายเคยย้ำว่าอยากปรับตามโปรได้ ฟรายเดย์แนะนำให้ใส่หน้า config อย่างน้อยค่าที่เปลี่ยนบ่อย (รางวัล/บทลงโทษ/น้ำหนักกาชา/ค่าโหวต)

---

## 🟠 ระดับสูง — ควรแก้

### H1. ไม่มี UI ติ๊ก "ใครมา/ใครลา" (attendance)
- `attendance` ตั้ง true หมด, HomeHub โชว์ presentCount แต่ **ไม่มีปุ่มมาร์กคนลา** → เกณฑ์ชนะ/ค่าโหวตจะค้างที่ 11 คนตลอด (scale ตามคนมาใช้ไม่ได้จริง)
- **แก้:** เพิ่มหน้า/แผงติ๊ก attendance ก่อนเปิดโหวตแต่ละวัน

### H2. Task 9 ใหญ่เกินไป + เป็น prose ไม่ใช่โค้ด (เสี่ยงสุดในแผน)
- Task 9 ยัด role reveal + shop + gacha + quiz + vote + refund + guess + tutorial + end ไว้ task เดียว, step 3-9 เป็น bullet ไม่มีโค้ด (commit เขียนเอง "Confidence: medium, Scope-risk: broad")
- action helper สำคัญ (`buyVoteItem`, gacha resolver, quiz, re-randomize, refund, clue) ถูกบรรยายแต่ไม่มีโค้ด/เทสในแผน
- **แก้:** แตก Task 9 เป็นหลาย task ย่อย ใส่ acceptance + เทสของแต่ละ action helper ให้ชัด (โดยเฉพาะ 4 ตัวด้านล่าง H3–H5)

### H3. re-randomize สปายใหม่ — ต้องคุม 2 อย่างให้ถูก + มีเทส
- ต้อง **(ก) คงกระเป๋าไอเทมรายคน** และ **(ข) ไม่รีเซ็ต `shield`** (ให้ slot เดิมถือต่อ; ถ้า consumed แล้วก็คง consumed)
- Step 10 ลิสต์เทส "preserving inventory" แต่ **ไม่ได้ลิสต์ว่าต้องไม่แตะ shield** ตอน re-randomize — เสี่ยง codex เผลอรีเซ็ต
- **แก้:** action `assignNewRoles` ต้องแก้แค่ `roles` ห้ามแตะ `inventories`/`shield` + เพิ่มเทสยืนยัน 2 ข้อนี้

### H4. สปายเจ้าของเกราะ "ไม่มีที่ให้เห็นเกราะ"
- กลไกเรา: สปายรู้ว่ามีเกราะ แล้วจะรู้ว่าหายตอนเปิดดูไอเทมรอบโหวตถัดไป
- แต่แผน: role reveal โชว์แค่บทบาท+คู่หู, vote flow โชว์ "eligible item" (เกราะเป็น auto ไม่ใช่ของเลือกใช้) → **สปายอาจไม่เห็นสถานะเกราะตัวเองเลย** กลไก "ชะล่าใจ/รู้ทีหลัง" จะพัง
- **แก้:** ใส่การแสดง "สถานะเกราะของฉัน" ในหน้า role reveal ของสปาย และ/หรือหน้าโหวตส่วนตัว (อ่านอย่างเดียว ไม่ใช่ปุ่มใช้)

### H5. เบาะแสหลังโหวต (§4.6) ยังเป็น prose — ต้องลงดีเทล + เทส
- ต้องครบ: **งานกลุ่ม ครั้งเดียว/รอบ, ราคา 1/4, (ก) ≥3 คนถึงสุ่ม 1 / <3 จ่ายฟรี, (ข) สุ่มสูงสุด 4, ผลเปิดเผยทุกคน**
- engine คืน `votedPool`/`notVotedPool` ให้แล้ว (ดี) แต่ logic สุ่ม+ฟรี+ลิมิตอยู่ฝั่ง UI ยังไม่มีเทส
- **แก้:** ทำ helper บริสุทธิ์ `drawClue(votedPool, notVotedPool, option, config, random)` + เทส (เคส <3 = ฟรี, ≥3 = 1 ใบ, ข ≤4)

---

## 🟡 ระดับกลาง — ควรเก็บ

### M1. `markFinalDay` ตั้ง "สปายชนะ" เสมอ ไม่เช็คทีมชนะไปแล้ว
- ถ้าทีมชนะแล้ว phase=ended อยู่แล้วก็จริง แต่ควร guard กันกดพลาด → ถ้า `endWinner` มีค่าแล้ว/ทีมชนะ ไม่ควรทับเป็นสปายชนะ

### M2. กลับ "home" แล้วเด้งหน้า "เริ่มเกม" ซ้ำ
- `AppRouter`: `phase==="home"` → `<BootScreen/>` ที่มี `unlocked=false` ในตัว → ทุกครั้งที่จบ flow กลับ home จะเจอหน้าปลดล็อกใหม่
- **แก้:** แยก unlock เป็น state ระดับ store/ครั้งเดียว หรือให้ phase home เรนเดอร์ HomeHub ตรงๆ

### M3. ไม่มีปุ่ม Undo วัน (design ของ codex เองบอก "Undo day transition where safe")
- ManualDayPanel มีแค่ จบวัน/พักวัน/วันสุดท้าย — ไม่มี undo → กดจบวันพลาดแล้วค่าโหวตขึ้นถาวร
- **แก้:** เพิ่ม undo วันล่าสุด (ย้อน multiplier/label) อย่างน้อย 1 ขั้น

### M4. คลังโจทย์ seed แค่ 5 ข้อในโค้ด
- Task 2 Step 4 ใส่ Q001–Q005 แล้วสั่ง "add the remaining" — เสี่ยง codex ใส่ไม่ครบ 100
- **แก้:** ย้ำให้ import ครบทั้ง 100 ข้อจาก `07-quiz-bank.md` + **ตรวจเฉลยหมวดกับดัก (ข้อ 36–55, 81–95) อีกรอบ** ก่อนใช้จริง

---

## 🟢 ข้อสังเกตเล็ก (optional)
- `crypto.randomUUID()` ต้องรันบน https/localhost — GitHub Pages เป็น https โอเค ✔️
- IndexedDB ใน Safari Private Mode อาจล้มเหลว → ควรมี fallback แจ้งเตือน + เน้น export backup
- Playwright ใช้ device "Desktop Safari" จำลอง viewport iPad — โอเคสำหรับ smoke แต่ไม่เท่าทดสอบบนเครื่องจริง (มี dry-run checklist ครอบแล้ว ✔️)

---

## 📌 สรุปสิ่งที่ต้องทำก่อนเริ่มสร้าง (เรียงลำดับ)
1. **C1 + C2** — เติมระบบกาชาให้ครบ (config weights + gachaEngine + เทส + เซ็ต nextVoteMultiplier)
2. **C3** — เคาะเรื่องหน้า config (ปรับตัวเลขได้/ไม่ได้)
3. **H1** — UI attendance
4. **H2–H5** — แตก Task 9 + ลงดีเทล/เทสของ action helper (re-randomize, เกราะที่มองเห็น, เบาะแส)
5. **M1–M4** — เก็บงานละเอียด + ตรวจเฉลยโจทย์ครบ 100

> โครงสร้างรวม (domain/state/features แยกชั้น, TDD, persistence) **ดีและพร้อมต่อยอด** — แค่ต้องอุดช่องกาชา/config/attendance กับลงดีเทล Task 9 ให้ครบก่อนปล่อยสร้าง
