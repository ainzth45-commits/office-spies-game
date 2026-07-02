# 📌 HANDOFF — อ่านไฟล์นี้ก่อนเริ่มงานต่อ (Office Spies)

> อัปเดต: 2026-07-02 · โดย: ฟรายเดย์ · สำหรับ session ใหม่หลังเจ้านายรีเครื่อง
> memory จะโหลดสถานะอัตโนมัติอยู่แล้ว (`office-spies-app-status`) — ไฟล์นี้คือสรุปลัด "ทำอะไรต่อ"

---

## ✅ สถานะปัจจุบัน: ทุกอย่างเสร็จ + deploy ขึ้นแล้ว
- **เกมออนไลน์:** https://ainzth45-commits.github.io/office-spies-game/
- **git:** branch `main` สะอาด · push ครบ (commit ล่าสุด `2f180f6` layout-fit) · Actions deploy สำเร็จ
- **เทส:** 67/67 ผ่าน · build ผ่าน

## 🎯 งานล่าสุดที่เพิ่งทำ (layout-fit — ทุกหน้าฟิตจอเดียว ไม่ต้องเลื่อน)
วัดจริงที่ iPad Air 5 landscape (1180×820) แก้แล้ว:
- `.app-frame` ล็อก `height:100dvh + overflow:hidden` (กัน body เลื่อน — pattern กลางทุกหน้า)
- **RoleReveal** สายลับ+เกราะ → 2 คอลัมน์ landscape
- **VoteFlow ballot / PostVoteClue** → flex column หัว/ปุ่มตรึง กริดยืดหยุ่น+รูปเตี้ย
- **GuessSecondSpy** → กริด 6 คอลัมน์รูปจัตุรัส (11 ใบ = 2 แถว)
- ไฟล์ที่แตะ: `app/src/styles/global.css`, `RoleRevealFlow.tsx`, `vote/VoteFlow.tsx`, `vote/PostVoteClueScene.tsx`

## ⏳ รอเจ้านาย (นี่คือสิ่งที่ต้องทำต่อ)
1. **เจ้านายเปิดบน iPad จริง** ตรวจ layout — โดยเฉพาะ RoleReveal 2 คอลัมน์ (screenshot บนเครื่อง dev ถ่ายไม่ติด)
   - ถ้า PWA cache ตัวเก่า → hard-refresh หรือต่อ `?v=3` ท้าย URL
2. **ถ้าเจอบั๊ก/จุดเพี้ยนใหม่** → เจ้านายจะแจ้ง list → แก้ตามนั้น
3. บั๊กขอบล่าง iPad (แก้ไว้แล้ว) รอยืนยันด้วย — ถ้ายังเหลือ แผนสำรอง = ย้าย bg ไป html canvas

## ▶️ เปิดแอปดูเองได้ (dev server ตายตอนรีเครื่อง ต้องรันใหม่)
```bash
cd "/Users/iceth/Desktop/เกมกระตุ้นยอดขาย/เกมที่1/app"
npm run dev          # → http://localhost:5173/  (เปิดใน claude-in-chrome เพื่อ verify)
npm run test         # 67/67 ควรผ่าน
npm run build        # ต้องผ่านก่อน push
```
> ⚠️ verify layout ที่ viewport **1180×820** (iPad Air 5 landscape) · เบราว์เซอร์อาจซูมเด้ง 154% → รีเซ็ต Cmd+0
> วัด overflow ด้วย JS: `document.querySelector('.scene-panel').scrollHeight > ...clientHeight`

## 🗂️ ไฟล์อ้างอิงสำคัญ
- สเปคแกน: `01-game-design-spec.md` · รูป: `02-art-direction.md`
- สถานะละเอียด: `SESSION-STATUS-2026-06-30.md`, `15-night-progress.md`, `TASK.md`
- **คู่มือคุมสั่ง Codex:** `~/Desktop/คู่มือคุมสั่ง-Codex.md`

## 🚀 ขั้นตอน push (เมื่อแก้เสร็จ + verify)
```bash
cd "/Users/iceth/Desktop/เกมกระตุ้นยอดขาย/เกมที่1"
git add <ไฟล์> && git commit -m "..." && git push origin main   # Actions deploy อัตโนมัติ
```

---
**สรุปสำหรับ session ใหม่:** พิมพ์ `/recap` เพื่อ orient · หรือถ้าเจ้านายมี list บั๊กจาก iPad ให้ลุยแก้ตามนั้นได้เลย
