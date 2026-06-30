# Office Spies — สถานะงาน (session 2026-06-30)

ไฟล์นี้บันทึกทุกอย่างของ session นี้ไว้ก่อนเจ้านายรีเครื่อง เปิดอ่านไฟล์นี้ก่อนเริ่ม session ใหม่

## 🚀 Deploy / ลิงก์
- **เล่นได้จริง:** https://ainzth45-commits.github.io/office-spies-game/
- **repo (public):** https://github.com/ainzth45-commits/office-spies-game
- deploy อัตโนมัติ: push ขึ้น `main` → GitHub Actions (`.github/workflows/deploy.yml`) build แล้วขึ้น Pages
- โค้ดแอป: `เกมที่1/app/` (React + Vite + TS PWA)

## ▶️ คำสั่งหลัก (รันใน `เกมที่1/app/`)
```
npm run build      # tsc + vite build → dist/   (vite base = /office-spies-game/ ตอน build)
npm run test       # vitest — ตอนนี้ 67/67 ผ่าน
npm run dev        # dev server
```
verify GitHub Pages แบบจริง: `cp -r dist/* /tmp/ghtest/office-spies-game/ && (cd /tmp/ghtest && python3 -m http.server 8099)` แล้วเปิด `http://localhost:8099/office-spies-game/` (อย่าใช้ `vite preview` — base ไม่ตรง)

## ✅ ทำเสร็จใน session นี้

### รูปภาพ (สำคัญ — เคยมีปัญหาสีซีด)
- **ต้นเหตุสีซีด = pngquant** บีบสีเหลือ ~256 สี (เช่น dock-vote 29,031→147 สี) ทำให้ดูแบน/โพสเตอร์ไรซ์ — **ไม่ใช่ที่ไฟล์ต้นฉบับ**
- **วิธีกู้:** ต้นฉบับสดอยู่ใน git history — กู้จาก commit `5c85b0a` (ก่อน pngquant) และ `2e14f96` (รูปสอนเล่น cast/threshold) · รูป `tut-vote-outcome` ต้นฉบับหาย → ให้ **Codex re-save** (truecolor 94,239 สี)
- **encode ปัจจุบัน:** ทุกรูปเป็น **WebP lossless** (`cwebp -lossless -exact -m 6`) ย่อขนาดพอดีจอ (ไอคอน/รูปทั่วไป 512px, โลโก้ 1000px, พื้นหลัง 1600px lossy q90) → สีตรงเป๊ะ PSNR ~∞ + รวม ~10MB
- ไฟล์จริง: `app/public/assets/generated/*.webp` (ไม่มี .png แล้ว) · อ้างใน `app/src/data/assets.ts` (มี `?v=2` ต่อท้ายกัน cache)
- ⚠️ **บทเรียน:** อย่าใช้ pngquant กับรูปเกม · อย่าใช้ lossy webp ถ้าต้องการสีตรง (chroma subsample เพี้ยน PSNR ~38) · เก็บ source PNG ไว้ ห้ามลบก่อน finalize (เคยเผลอลบ outcome ต้องให้ Codex ทำใหม่)
- พิสูจน์แล้วว่ารูปบน live = ต้นฉบับ Codex เป๊ะ (เทียบ PSNR 120 = exact)

### UI / Layout
- หน้าโฮมใหม่: โลโก้ใหญ่กลาง, มาสคอตข้างแถววันที่, dock ไอคอน 6 อันล่าง (`HomeHub.tsx`)
- พื้นหลังเต็มจอ: ย้าย bg ของแต่ละฉากไป `::before { position: fixed; inset: -100px }` (overshoot กัน safe-area) — ดู `global.css` ฉาก .app-shell/.handoff-curtain/.hub-scene/.reveal-stage/.home-screen
- บล็อก scroll หน้าเว็บ: `html,body { overscroll-behavior: none }` (⚠️ **ห้ามใส่ overflow:hidden** บน iOS — ทำ fixed bg ถูก clip เกิดขอบล่าง)
- settings เป็น slider แยกหมวด (`SettingsPanel.tsx`) · ปุ่มบันทึก/คืนค่า/รีเซ็ตไหลไปท้ายติดแถวเมนูแอดมิน/ปิด
- สอนเล่นเขียนใหม่ 12 ฉาก เน้นกลไกโหวต (ตัวอย่าง 11 คน เกณฑ์ 8) `tutorialScenes.ts` + `TutorialFlow.tsx`

### กลไกเกม
- บั๊ก "ไม่มีใครเป็นสปาย" แก้แล้ว: `enterRoleReveal()` auto-assign ถ้ายังไม่มีสปาย (`state/actions.ts`)
- เกราะสปาย (ของชิ้นเดียว): ออกแล้ว **ถอดจากพูลกาชาจนจบเกม** เปอร์เซนต์เฉลี่ยให้อันอื่น (`availableGachaWeights` ใน `gachaEngine.ts` + `shield.exists`)
- ค่าโหวต up/down: รวมกัน **วันละ 1 ครั้ง** ออกแล้วถอดทั้งคู่จนขึ้นวันใหม่ (flag `dailyUsage.voteCostChanged` reset ที่ `startNewDay`/`resetGameDailyUsage`)
- น้ำหนักกาชา settings: **บังคับรวม = 100** (slider ดันเกิน headroom ไม่ได้, ไม่ครบ 100 บันทึกไม่ได้)
- ระบบวัน 1→6 sync หน้าโฮม, วันที่ 6 ล็อกต้องรีเซ็ตเกม · attendance รูปคนลาเป็นสีเทา
- กาชาลุ้น reel หมุน ~2.5 วิ ก่อนเฉลย (`GachaFlow.tsx`)
- เกราะ: ผลกาชาประกาศต่อสาธารณะ "สปาย A/B ได้เกราะ" (เจ้านายเลือกคงไว้แบบประกาศ)

## ⏳ ค้าง / รอทำต่อ
1. **ยืนยันบั๊กขอบล่าง iPad** — แก้แล้ว (commit `8598049`) แต่ยังไม่ยืนยันบน iPad จริง · ถ้ายังเหลือ → แผนถัดไปย้าย bg ไปไว้ที่ `html` canvas (cover เต็มจอชัวร์ 100% บน iOS) โดย set bg ต่อ phase
2. **เจ้านายจะแจ้งบั๊กใหม่อีกหลายอย่าง** หลังรีเครื่อง — รอ list
3. **กลไกเกราะ** — ครั้งนี้คงไว้ "ประกาศ" แต่ขัดกับสอนเล่นที่บอก "รอดเงียบๆ ไม่มีใครรู้" (ถ้าเจ้านายอยากแก้ทีหลัง: ทำข้อความกาชาให้กำกวม/ไม่บอกว่าเป็นเกราะ)

## 📁 ไฟล์โปรโมต
รูป JPG พร้อมโพสต์กลุ่ม: `~/Desktop/office-spies-promo/` — `logo.jpg` (โลโก้บนพื้นไล่เฉด), `end-spy-win.jpg`, `end-team-win.jpg`

## 🛠️ วิธีสั่ง Codex (เจนรูป)
ผ่าน osascript: `pbcopy < prompt.txt` → `tell app "Codex" to activate` → Cmd+A (key code 0) → Delete (key code 51) → Cmd+V (key code 9) → screencapture verify → Enter (key code 36) · Codex เจนบนพื้น chroma (ชมพู/เขียว) แล้วลบเป็นโปร่งใส · ⚠️ ระวังพิมพ์ลงหน้าต่างผิด (เช็ค screenshot ก่อน) · ห้ามกดปุ่ม "รีเซ็ตการใช้งาน"
