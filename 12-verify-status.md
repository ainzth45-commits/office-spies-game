# 12 — ผลตรวจ + verify (ฟรายเดย์ช่วยปลดบล็อกให้ codex)

> codex verify ไม่ได้เพราะ sandbox ไม่มี network (ลง deps ไม่ได้)
> ฟรายเดย์รันบนเครื่องจริง → **ลง deps + รัน test/build สำเร็จแล้ว**

## ✅ ผลล่าสุด (รันจริง)
- `npm install` → สำเร็จ (188 packages)
- `npm run test` → **45/45 ผ่าน** ✅
- `npm run build` → **สำเร็จ** (vite build, dist 217 kB / gzip 67 kB) ✅

## 🔧 ฟรายเดย์แก้ให้ 2 จุด (เพื่อให้เขียว)
1. **`src/domain/clueEngine.test.ts`** — เทสตั้งสมมติฐานผิด (ไม่ใช่บั๊กโค้ด)
   - ส่ง `random=()=>0` แล้วคาดว่าได้ "A" แต่ Fisher-Yates เมื่อ random=0 จะหมุน array → ได้ "B"
   - แก้เป็น assert "ได้ 1 ใบ และอยู่ในกองผู้ถูกโหวต" (robust ตรงเจตนา) — `drawClue` ทำงานถูกต้องอยู่แล้ว
2. **`app/tsconfig.json`** — `tsc -b` ไป typecheck `vitest.config.ts` แล้วเจอ vite 2 เวอร์ชันชนกัน (vitest 2.x ลาก vite ของตัวเองซ้อน vite 7)
   - แก้ `include` เหลือ `["src","tests"]` (ไม่ให้ tsc typecheck ไฟล์ config build — vite/vitest/playwright handle เองตอน runtime) → build ผ่าน
   - *ทางเลือกระยะยาว:* อัปเกรด vitest เป็น ^3 ให้ใช้ vite 7 ตัวเดียวกัน จะหมดปัญหา version ซ้อน

## 👍 โค้ดที่ตรวจแล้ว "ถูกต้อง + ตรงสเปก"
- **voteEngine** (R/P, remove/swap, shield silent flip, spy-pool) — โค้ดตรง spec เป๊ะ + เทส 13 ตัวผ่าน
- **gachaEngine / clueEngine / economy / configValidation / roleEngine** — ถูกต้อง
- **actions** — แก้ตาม feedback ครบ: `applyGachaVoteMultiplier` (C2), `updateConfig`+validate (C3), `markFinalDay` มี guard (M1), `assignNewRoles` spread state → **inventory/shield ไม่ถูกรีเซ็ต** (H3) ✓
- **config** — ราคาไอเทม + ตารางกาชา 10 ผล (รวม 100%) ย้ายเข้า `GameConfig` แล้ว (C1/C3) ✓
- **SettingsPanel** — แก้ตัวเลขได้จริง + โชว์ preview (เกณฑ์/ค่าโหวต/น้ำหนักกาชารวม%) ✓
- **RoleRevealFlow** — โชว์คู่หู + โชว์เกราะให้สปายเจ้าของ (H4) ✓
- **quizBank** — ครบ 100 ข้อ (แปลงเชิงกลจาก 07) ✓

---

## ⚠️ งานที่ "ยังไม่เสร็จ" (flow เป็น shell/บางส่วน — ยังเล่นจบไม่ได้)
domain/state ฐานแน่นแล้ว แต่ **การต่อ UI flow ยังไม่ครบ** — นี่คืองานหลักที่เหลือ:

1. **VoteFlow** = shell เปิดโหวตอย่างเดียว — ยังขาด: คิวโหวตทีละคน, เรียก `calculateVoteResult`, หักไอเทม/เกราะ, หน้า result, §4.5 reveal, ซื้อเบาะแส (§4.6), refund, guess
2. **GachaFlow** = บางส่วน — `voteUp/voteDown/spyShield` ทำงาน แต่:
   - 🐛 **`grantItem` ไม่ทำอะไรเลย** (ไม่ใส่ไอเทมเข้ากระเป๋า)
   - 🐛 **`grantQuiz` ไม่ทำอะไรเลย** (ไม่เปิด quiz flow)
   - ขาด **ลิมิตหมุนต่อวัน** (`gachaDailyLimitPerPlayer`)
   - ผลโชว์เป็น key อังกฤษ (`spyShield`) ควรเป็นประกาศไทย + เกราะประกาศ "สปาย A/B ได้เกราะ"
   - เกราะ: ตั้ง slot ควรเช็คว่า role ถูกสุ่มแล้ว + พิจารณาว่า "consumed แล้วหมุนได้เกราะใหม่ไหม" (สเปกว่ามีชิ้นเดียว)
3. **Scenes) ที่ยังไม่สร้าง:** QuizFlow, GuessSecondSpyScene, RefundScene, PostVoteClueScene, TutorialFlow
4. **AppRouter ไม่ route** phase `quiz`/`guess`/`refund` → ตอนนี้ falls through ไป HomeHub (ถ้ามีอะไรเซ็ต phase พวกนี้จะเพี้ยน)
5. **ShopFlow** — ตรวจว่ามี action `buyVoteItem` + เช็คลิมิตกระเป๋าหรือยัง
6. **Art/audio/motion (Task 10)** ยังไม่ทำ — ตามแผน เป็นเฟสหลัง
7. **git** ใน sandbox ทำไม่ได้ → commit ยังค้าง (เครื่องจริง init ได้ถ้าต้องการ)

## 📌 แนะนำ codex ทำต่อ (ลำดับ)
1. ต่อ **GachaFlow** ให้ครบ (grantItem ใส่กระเป๋า + grantQuiz เปิด quiz + ลิมิต + ประกาศไทย)
2. สร้าง **QuizFlow** + route phase `quiz`
3. ต่อ **VoteFlow เต็ม** + VoteResultScene + PostVoteClueScene + RefundScene + GuessSecondSpyScene + route phases
4. **TutorialFlow** (ใช้ tutorialScenes ที่มีแล้ว)
5. Task 10 art/audio + Task 11 e2e/dry-run

> ฐานโค้ด (domain แยกจาก UI + TDD + persistence) แข็งแรงและพร้อมต่อยอดมากค่ะ — ที่เหลือคือ "ต่อสาย" flow ให้ครบ
