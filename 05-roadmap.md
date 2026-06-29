# 05 — Roadmap (ภาพรวมการพัฒนา)

> มุมมองรวม: ลำดับเฟส + milestone จากศูนย์จนเล่นจริงได้
> แผนละเอียดแยกเป็นโมดูล/งานย่อย ดูที่ [06-build-plan.md](06-build-plan.md)

---

## 🧱 Tech Stack ที่แนะนำ (สำหรับ codex)
- **Single-Page Web App** รันใน Safari/PWA บน iPad Air 5 — ไม่ต้องมี backend (เครื่องเดียว เหรียญเป็นของจริง)
- Frontend: HTML/CSS/JS หรือ **React + Vite** (เลือกได้) — เน้นเบา รันลื่นบน iPad
- State: in-memory + **persist localStorage** + **export/import JSON** (เกมยาว 1 สัปดาห์ ห้ามหาย)
- Animation: CSS keyframes + Web Animations API + Lottie (ฉากใหญ่) + canvas-confetti
- Sound: Web Audio API (preload, ปลดล็อกหลัง user gesture)
- Config: ไฟล์ config + หน้าแก้ในแอป (validate ก่อนบันทึก)

---

## 🗺️ เฟสการพัฒนา

### เฟส 0 — เตรียมโครง (Foundation)
- ตั้งโปรเจกต์ + โครงไฟล์ + ล็อก landscape + boot/unlock audio
- วาง data model: ผู้เล่น, role, กระเป๋าไอเทม, สถานะวัน, ค่าโหวตสะสม, เกราะ
- ระบบ persist (localStorage) + export/import
- **Milestone M0:** เปิดแอปบน iPad แนวนอนได้ มี state ว่างที่ save/load ได้

### เฟส 1 — แกนเกม (Core Loop ที่เล่นได้จริง)
- Game Setup + Config + validation
- Role Reveal Flow (ดู role ทีละคน + ม่านส่งเครื่อง + เห็นคู่หูสปาย)
- Vote Flow ครบ: เปิดโหวต → ลงคะแนนลับ → **เครื่องคำนวณผลตามลำดับ §7** → ประกาศผล
- Guess-Second-Spy + สุ่มสปายใหม่
- เงื่อนไขแพ้-ชนะ + End Game
- **Milestone M1:** เล่นจบ 1 เกมได้แบบ end-to-end (ยังไม่มีร้านค้า/กาชา/ภาพสวย)

### เฟส 2 — เศรษฐกิจ & ร้านค้า
- Shop หมวด A (โจทย์เชาว์ + คลังโจทย์)
- Shop หมวด C (ไอเทมโหวตลับ + กระเป๋ารายคน) → ผูกกับ Vote Flow
- Gacha หมวด B + ตารางน้ำหนัก + เกราะสายลับ (logic พลิกผล)
- ค่าเปิดโหวตสะสม/รีเซ็ต + ตัวคูณกาชา
- **Milestone M2:** กลไกครบทุกระบบตามสเปก (ฟังก์ชันครบ)

### เฟส 3 — ภาพ & ฟีล (Art + Juice)
- ใส่ asset จาก [02-art-direction.md] (ตัวละคร, การ์ด, ฉาก, โลโก้)
- Animation/motion ทุกจุดตาม [02 §5]
- Sound design ตาม [02 §6] + ปุ่มเปิด/ปิดเสียง
- **ฉากสอนเล่น (tutorial)** ตาม [08-tutorial-spec.md] — 10 ฉาก + ตัวนำพูด + motion (ข้าม/เล่นซ้ำได้)
- **Milestone M3:** เกมสวย มีชีวิต มีเสียง มี tutorial น่าเล่น

### เฟส 4 — กันพัง & ทดสอบจริง (Hardening)
- Defensive ตาม [01 §10]: backup/restore, undo, validate, กัน state หาย, กัน sleep
- Unit test เครื่องคำนวณผลโหวต (edge cases)
- **Dry-run** เล่นจำลองครบ flow บน iPad จริง 1 รอบ
- **Milestone M4:** พร้อมใช้งานจริงวันจันทร์ 🚀

---

## ✅ ลำดับความสำคัญ (ถ้าเวลาจำกัด)
1. **ต้องมี (MVP):** Role Reveal + Vote Flow + คำนวณผล + แพ้-ชนะ + persist (เฟส 0–1)
2. **ควรมี:** ร้านค้า + กาชา + เกราะ (เฟส 2)
3. **ทำให้ดี:** ภาพ + animation + เสียง (เฟส 3)
4. **กันพลาด:** hardening + dry-run (เฟส 4)

> เล่นได้ตั้งแต่จบเฟส 1 — เฟสหลังเสริมความสนุก/ความทน
