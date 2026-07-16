# หน้าลงทะเบียนผู้เล่น + เอาข้อมูลจริงออกจาก source (2026-07-16)

## เป้าหมาย

1. **เอาข้อมูลจริงพนักงานออกจาก repo public ทั้งหมด** — ชื่อจริง + ลิงก์รูป Google Drive ใน `src/data/players.ts` ต้องหายไปจาก source code
2. **เพิ่มระบบลงทะเบียนผู้เล่นในแอป** — แอดมิน (ซุป) เพิ่ม/แก้/ลบผู้เล่นได้เองจากเมนูตั้งค่า ข้อมูลเก็บใน local (IndexedDB ผ่านเซฟเกมเดิม) เท่านั้น
3. เซฟเดิมบน iPad: **เริ่มใหม่หมด** (เจ้านายเคาะ) — รายชื่อเก่าถูกล้าง ลงทะเบียนใหม่ตั้งแต่ต้น

แนวทางที่เคาะ: **ทาง A** — ผู้เล่นอยู่ใน `GameState.players` เดิม ไม่แยกคลังใหม่

## Data model (ไม่เปลี่ยน type)

`Player { id, code, name, imageUrl }` เหมือนเดิม — จอแสดงผลทุกหน้าไม่ต้องแก้

- `id` = `code` = รันอัตโนมัติ `C001, C002, ...` (เลขถัดจากค่า max ที่มีอยู่ — **ลบคนแล้วรหัสไม่ถูกใช้ซ้ำ** กัน state เก่าที่ผูกรหัสเดิมชนกัน)
- `name` = จากฟอร์ม (trim + ตัดอักขระล่องหน zero-width/control + จำกัด 40 ตัวอักษร + ห้ามว่าง)
- `imageUrl` = รับ 2 แบบในช่องเดียว:
  - **ลิงก์รูป** (`http(s)://...`) เก็บ URL ตรงๆ
  - **ถ่ายจาก iPad / เลือกไฟล์** → ย่อในเครื่องก่อนเก็บเป็น **data URL**: วาดลง canvas ด้านยาวสุด 500px → `toDataURL("image/webp", 0.8)` ถ้า browser ไม่รองรับ webp encode (Safari บางรุ่น) fallback `image/jpeg` 0.82 → ~50–100KB/คน
  - รูปโหลดพัง → fallback โชว์ `code` (กลไกเดิมใน PlayerCard มีอยู่แล้ว)

## การเปลี่ยนแปลงรายไฟล์

### 1. `data/players.ts` — ลบข้อมูลจริง
- `defaultPlayers = []` (คงไฟล์+type ไว้ให้ import เดิมไม่พัง แต่ไม่มีข้อมูลคน)
- `data/preloadAssets.ts` — เลิก preload รูปผู้เล่น (ลิสต์ว่าง/data URL ไม่ต้อง preload)

### 2. `state/gameState.ts` — สร้าง record จากรายชื่อจริง
- เพิ่ม helper `buildPlayerRecords(players)` → `{attendance, roles, inventories}` (มา=true, role=normal, กระเป๋าว่าง)
- `createInitialGameState()` ใช้ helper นี้ (ผล: เกมใหม่ = ว่างทั้งหมด)
- `startNewGameRound` / `finishGameToBoot` ที่ spread `players: state.players` ทับ fresh state ต้องได้ record ครบ → เรียก `buildPlayerRecords(state.players)` ประกอบด้วย (จุดนี้คือบั๊กแฝงที่เจอตอนออกแบบ — fresh ที่สร้างจากลิสต์ว่างจะได้ record ว่าง)

### 3. `state/actions.ts` — action ใหม่ 3 ตัว
- `addPlayer(state, {name, imageUrl})` — validate ชื่อ · gen code · เติม record 3 ตาราง · **ห้ามเมื่อ `rolesAssigned=true`** (throw "จบเกมหรือเริ่มรอบใหม่ก่อน")
- `updatePlayer(state, id, {name, imageUrl})` — แก้ชื่อ/รูปได้**ทุกเมื่อ** (ไม่แตะตารางที่ผูก id)
- `removePlayer(state, id)` — ตัดออกจาก players + ลบ record 3 ตาราง · **ห้ามเมื่อ `rolesAssigned=true`**
- ทุกตัวผ่าน `log()` เขียน audit เหมือน action อื่น

### 4. Guard เริ่มเกม
- `enterRoleReveal` throw เมื่อ `players.length < 3` (สปาย 2 + ปกติ 1 · ถ้าเปิด jester ต้องมา ≥3 อยู่แล้วใน `assignNewRoles` เดิม)
- หน้าโฮม: ถ้ายังไม่มีผู้เล่น ปุ่มเปิดบทบาท disable + ข้อความ "ลงทะเบียนผู้เล่นในตั้งค่าก่อน"

### 5. UI — `SettingsPanel` หมวดใหม่ "👥 ผู้เล่น" (บนสุด)
- ลิสต์แถว: รูปย่อ · code · ชื่อ · ปุ่มแก้ไข ✏️ · ปุ่มลบ 🗑
- ลบ = ยืนยัน 2 จังหวะ (pattern เดียวกับรีเซตคลังโจทย์) · ตอน `rolesAssigned` ปุ่มเพิ่ม/ลบ disable + บอกเหตุผลบนหัวหมวด
- ปุ่ม "➕ เพิ่มผู้เล่น" → ฟอร์ม (modal เดียวใช้ทั้งเพิ่ม/แก้):
  - ช่องชื่อ
  - รูป: แท็บ/ปุ่ม 3 ทาง — 📷 ถ่ายรูป (`<input type=file accept=image/*` มีปุ่มแยกใส่ `capture=user`) · 🖼 เลือกรูปจากเครื่อง (input เดียวกัน ไม่ใส่ capture) · 🔗 วางลิงก์ (validate ขึ้นต้น http/https)
  - พรีวิวรูปก่อนบันทึก + แจ้ง error อ่านรู้เรื่อง (ไฟล์ไม่ใช่รูป/อ่านพัง/ลิงก์ผิดรูปแบบ)
- ภาษาเกมตามมาตรฐานเจ้านาย ไม่ใช่ภาษา AI

### 6. `state/storage.ts` — migration "เริ่มใหม่หมด"
- ลบ loop "เติมผู้เล่นใหม่จาก defaultPlayers" (ของรอบ C012 เมื่อ 2026-07-15) — ไม่มี default แล้ว
- เพิ่ม `rosterVersion: 2` ใน GameState · เซฟที่ไม่มี field นี้ = เซฟยุครายชื่อฝังโค้ด → **ล้างกระดาน+รายชื่อทิ้ง กลับ boot คง config/settings** (ตามที่เจ้านายเคาะ "เริ่มใหม่หมด")
- backup JSON: ไม่ต้องแก้ — players (รวมรูป data URL) อยู่ใน state อยู่แล้ว · ไฟล์ backup ยุคเก่า import เข้ามาจะโดน migration เดียวกัน (ถือ rosterVersion เก่า → ล้างรายชื่อ) — ยอมรับได้ เจ้านายสั่งเริ่มใหม่หมด

### 7. เทส
- เทสเดิมที่พึ่ง `createInitialGameState()` มี 12 คน → เพิ่ม test helper `makeTestState(n)` สร้างผู้เล่นสมมุติ (`C001..C00n`, ชื่อ "ผู้เล่น 1..n", imageUrl ว่าง) — **ห้ามมีชื่อจริงในเทส**
- เทสใหม่: add/update/remove (รวม throw ตอน rolesAssigned) · gen code ไม่ซ้ำหลังลบ · guard <3 คน · migration เซฟเก่า→ล้างรายชื่อ · buildPlayerRecords ครบ 3 ตาราง หลัง startNewGameRound
- ค่า economy ในเทส (ค่าโหวต/เงินคืน/เกณฑ์) คำนวณจากจำนวนคนใน helper — เขียนสูตรตรงๆ ไม่ hardcode ตามรายชื่อจริงอีก

## สิ่งที่ไม่ทำรอบนี้ (YAGNI)
- ไม่มี login/PIN ต่อคน · ไม่ sync ข้ามเครื่อง · ไม่มี import รายชื่อจาก CSV/database
- ไม่แตะ flow เกม/สอนเล่น (นั่นคือบรีฟรอบหน้า)

## ลำดับความเสี่ยงที่คิดไว้แล้ว
- **เซฟเก่าเปิดแอปใหม่** → migration ล้างเป็น state ว่าง ไม่ crash (มีเทส)
- **ถ่ายรูปไฟล์ HEIC ใหญ่ 12MB** → อ่านผ่าน `createImageBitmap`/Image → ย่อลง canvas เสมอ ไม่เก็บต้นฉบับ
- **iPad Safari private mode / quota เต็ม** → saveGameState ล้มเหลวต้องโชว์ error ไม่พังเงียบ (กลไก error เดิมของ storage)
- **ลบคนกลางเกม** → ป้องกันที่ action layer (throw) ไม่ใช่แค่ซ่อนปุ่ม

## Verify
1. `npm run test` ผ่านทั้งหมด
2. Browser จริง: ลงทะเบียน 3 คน (ลิงก์ 1 / ไฟล์ 1 / ไม่มีรูป 1) → เล่นครบ 1 รอบ → เริ่มรอบใหม่ รายชื่อต้องอยู่ครบ → ลบคนตอน rolesAssigned ต้องโดนกัน → ล้าง IndexedDB จำลองเซฟเก่า → migration ไม่ crash
3. `grep -ri "googleusercontent" src/` ต้องว่าง + ไล่สายตา `players.ts`/เทส ต้องไม่มีชื่อจริงพนักงานเหลือใน source
