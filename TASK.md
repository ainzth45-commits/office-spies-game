# TASK — Office Spies: เตรียมเกมให้พร้อมก่อนขึ้น GitHub

> งานกลางคืน autonomous (เริ่ม 2026-06-30 ~00:40) · ฟรายเดย์คุม codex + verify เครื่องจริง
> รายงานละเอียด: `15-night-progress.md` · สเปคแกน: `01-game-design-spec.md`, `02-art-direction.md`

## A. แก้ลอจิก flow ✅ เสร็จ (verify 58/58 + build ผ่าน @00:38)
- [x] A1 finalizeVoteRound ค้าง phase voteResult
- [x] A2 caughtSpy → postVoteClue → guess
- [x] A3 เกราะเกิดครั้งเดียวต่อเกม
- [x] regression tests + verify เครื่องจริง

## B. ภาพ / เสียง / อนิเมชัน (Task 10) — กำลังทำ
ลำดับตามผลกระทบความรู้สึก (14-brief ก้อน B):
> ✅ Batch 1 (style-lock) ลงดิสก์+verify สะอาด: logo, role-normal, role-spy, coin, bg-detective-room
> 🔄 Batch 2 ส่งแล้ว @01:06: bg-office, bg-role-cover, bg-reveal, spy-pair-badge, ballot-box, magnifier
- [~] B1 โลโก้ + ฉากหลัง (logo✅ bg-detective-room✅ · bg-office/bg-role-cover/bg-reveal กำลังเจน)
- [~] B2 การ์ดบทบาท (role-normal✅ role-spy✅ · spy-pair-badge กำลังเจน)
- [ ] B3 กาชา (gacha-machine, gacha-capsule, ไอคอนผล 10 ตัว) + อนิเมชันสั่น→หล่น→ป๊อป+confetti
- [ ] B4 ตราผลโหวต (stamp-win, stamp-lose) กระแทกจอ + กลองรัว
- [ ] B5 การ์ดไอเทม 7 ใบ (quiz/vote-double/remove/swap/reduce/protect/spy-shield)
- [ ] B6 เหรียญ+เบ็ดเตล็ด (coin, ballot-box, magnifier, clue-card-frame, spy-pool-banner)
- [ ] B7 มาสคอตสารวัตรแมว + ฉาก tutorial 10 ฉาก (08-tutorial-spec)
- [ ] B8 ฉากจบ (end-team-win, end-spy-win)
- [x] B9 เสียง — **เสร็จ @04:43** สังเคราะห์สดด้วย Web Audio API (`src/audio/sounds.ts` ไม่มีไฟล์เสียง ไม่ต้องดาวน์โหลด): click(ทุกปุ่ม), coin(ซื้อร้าน), gacha(หมุน), drum(รัวก่อนเฉลย), fanfare(จับสปาย/ทีมชนะ), lose(โหวตพลาด/ฉากสายลับชนะ — เกราะใช้เสียงแพ้ปกติตามสเปค) + ปุ่ม 🔊/🔇 ใน hub sync จาก state.settings.soundEnabled (build+58/58 ผ่าน)
- [ ] B-wire ต่อ asset ทั้งหมดเข้า scene + build ผ่าน

## C. UX writing
- [~] เขียนคำอธิบายทุกหน้าใหม่ (โทนนักสืบขี้เล่น บอก "ทำอะไรต่อ") — VoteResult/role/shop/vote เสร็จ · เหลือ gacha/quiz/guess/refund/settings ตรวจต่อ
- [x] ลบข้อความสาย dev — สแกนแล้วไม่เหลือ
- [x] เพิ่มปุ่ม "กฎย่อ" → QuickRules modal 6 ข้อ ใน HomeHub
- [x] private lead lines (role/shop/vote pick) "เดินมาทีละคน ห้ามแอบดู"
- [x] คำอธิบายไอเทม R/P ในร้าน (ตาม §6.3)
- [x] VoteResultScene เขียนใหม่ลุ้นขึ้น (+ จับบั๊กป้ายปุ่ม routing)
- [x] ห้ามหลุดความลับ — ตรวจครบทุกหน้า (gacha message = ประกาศตั้งใจ §6.4 ไม่ใช่หลุด)
- [x] Settings: น้ำหนักกาชา enum อังกฤษ → label ไทย + บอกหน่วย % (กันแอดมินงง)
- [x] ✅ verify เบราว์เซอร์จริง: boot/home/กฎย่อ เรนเดอร์สวย asset pipeline ทำงาน
**→ งาน C เสร็จครบ**

## เตรียม post-04:06 (โควต้า codex รีเซ็ต)
- [x] เติม registry key asset ที่ยังไม่เจน (gachaMachine/capsule, voteWin/LoseStamp, clueCardFrame, spyPoolBanner, mascotDetective, endTeamWin/SpyWin, gachaIconAssets×10) — ใช้ชื่อตาม art-direction → สั่ง codex เซฟตรงชื่อ
- [ ] หลัง 04:06: เจน item swap/reduce/protect/spy-shield + กาชา + ตราโหวต + มาสคอต+tutorial + ฉากจบ + เสียง → wire เข้า scene → verify เบราว์เซอร์รอบเต็ม
- [ ] ปิดท้าย: playthrough โหวต→ผล→เบาะแส→guess/refund + git init+commit local (ไม่ push)

## D. ปิดงาน (ก่อน push)
- [ ] กดจริงในเบราว์เซอร์: โหวต→ผล+§4.5→เบาะแส→guess/refund ครบ ไม่กระโดดข้าม
- [ ] npm run test เขียว + npm run build ผ่าน (หลังใส่ asset) — ผ่าน ณ 01:43 (58/58) แต่ต้องรันซ้ำหลัง wire ครบ
- [ ] git init + commit local (**ไม่ push** — รอเจ้านายอนุมัติเช้า)
- [x] เขียน .gitignore — มีครบแล้วที่ราก (node_modules/dist/playwright/DS_Store + app/)

## B-wire progress (Friday ทำเอง ไม่กิน codex quota)
- [x] registry กลาง `src/data/assets.ts` (gameAssets + itemCardAssets)
- [x] logo → HomeHub · bg-office → hub-scene · bg-detective-room → app-shell · bg-role-cover → handoff-curtain (build+test ผ่าน)
- [x] role-normal/role-spy → RoleRevealFlow + ออร่าแดงสายลับ + spy-pair-badge มุมการ์ด + spy-shield card ใน callout เกราะ (build+test ผ่าน)
- [x] item cards → ShopFlow (.shop-grid การ์ดมีรูป + coin + คำอธิบาย) — **ครบ 7 ใบเจนแล้ว** ร้าน verify เบราว์เซอร์สวยครบ @03:08
- [x] bg-reveal → VoteResultScene + EndGameScene (wrap .reveal-stage) (build+test ผ่าน @01:56)
- [ ] ballot-box → VoteFlow · magnifier → PostVoteClueScene
- [x] ballot-box → VoteFlow · magnifier → PostVoteClueScene (build+test ผ่าน)
- [ ] coin → hub status/ค่าเปิดโหวต (optional polish)
- [x] gacha-machine/capsule → GachaFlow (+อนิเมชันสั่น→หล่น) · stamps → VoteResult (slam) · มาสคอต → Tutorial · ฉากจบ → End · spy-pool-banner → §4.5 — **wire ล่วงหน้าแล้ว @04:12 (build+58/58 ผ่าน)** รูปจะขึ้นเมื่อ codex เจนเสร็จ (onError ซ่อนตอน 404)
- [ ] clue-card-frame → กรอบการ์ดเบาะแส (optional polish — ยังไม่ wire)
- [ ] gachaIconAssets×10 → แสดงไอคอนผลกาชาใน GachaFlow (รอ Batch 5)

## หมายเหตุตัดสินใจ (autonomous log)
- _(บันทึกทุกครั้งที่ตัดสินใจเองตรงจุดกำกวม)_
