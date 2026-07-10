# โหมด Topic (Image Reveal) — Design Spec

**Goal:** โหมดใหม่ใน dock — ซุปใส่ลิงก์รูป 2 รูป ผู้เล่นเดินมาดูทีละคนตามบทบาท (สปายเห็นรูปคนละใบ) แล้วคุยกันหาสปาย

**เคาะแล้ว (2026-07-10):** ใช้บทบาทสปายจากเกมปัจจุบัน · คุยจบกลับ Home เฉยๆ (ซุปเปิดโหวตเองตอนพร้อม) · ปุ่มกดค้างมีไอคอนลายนิ้วมือชิดขวา

---

## Flow

1. **เข้าจาก dock** ปุ่มใหม่ "topic" — ใช้ได้เฉพาะเมื่อแจกบทบาทแล้ว (`rolesAssigned`) ถ้ายังไม่แจก โชว์ข้อความ "ต้องแจกบทบาทก่อน"
2. **หน้าใส่ลิงก์ 2 รูป:** รูป A (ผู้เล่นปกติ + คนสติแตกเห็น) · รูป B (สปายเห็น) — ช่องกรอก URL 2 ช่อง + preview เล็ก (img onError = เตือนลิงก์เสีย) · ปุ่ม "เริ่มดูภาพ" (disabled ถ้าช่องว่าง)
3. **เดินดูทีละคน** (เฉพาะคนที่มาวันนี้) เหมือนหน้าเปิดบทบาท:
   - PlayerPicker แตะชื่อตัวเอง → ConfirmPlayer → หน้ากดค้างดูรูป
   - **กดค้าง** ถึงเห็นรูป (ปล่อยนิ้ว = ซ่อน) · สปายเห็นรูป B ที่เหลือเห็นรูป A · HandOffCurtain ส่งเครื่องต่อ · นับ x/N
4. **ครบทุกคน** → หน้า "คุยกันหาสปาย" (จับเวลาสนทนาเลือกเปิด/ปิด) → ปุ่ม "จบ กลับ Home"

## State & ที่อยู่

- **ไม่เก็บลง GameState/เซฟ** — เป็น state ภายในคอมโพเนนต์ล้วน (ลิงก์รูปใส่ใหม่ทุกครั้ง) เหมือนโหมดฝึกเชาว์ที่ไม่แตะเกม
- เข้าซ้ำได้เรื่อยๆ เปลี่ยนรูปใหม่ได้ · ไม่มีการโหวต/ให้เหรียญในโหมดนี้
- phase ใหม่ `"topic"` ใน GamePhase · dock button เพิ่มใน HomeHub เรียก `enterTopic` (ถ้า rolesAssigned → phase topic, ไม่งั้นแจ้งเตือน)

## จุดแตะโค้ด

| ไฟล์ | เปลี่ยน |
|---|---|
| `domain/types.ts` | `GamePhase += "topic"` |
| `features/topic/TopicFlow.tsx` (ใหม่) | ทั้ง flow: input → PlayerPicker → ConfirmPlayer → hold-to-view → discuss → home · ใช้ `state.attendance` + `state.roles` (spy = รูป B) |
| `App.tsx` | route `case "topic"` |
| `features/home/HomeHub.tsx` | dock item "topic" (ไอคอน `dock-topic.webp`) · onClick: rolesAssigned ? phase topic : เตือน |
| `data/assets.ts` | `dockTopic` + `iconFingerprint` |

## ปรับปรุงพ่วง: ลายนิ้วมือบนปุ่มกดค้าง (ใช้ทุกที่ที่มีกดค้าง)

**ปัญหา:** ปุ่มกดค้างเปิดบทบาท (และดูรูป topic) — กดตรงกลางปุ่ม มือบังรูปที่โชว์ ดูลำบาก (เจ้านายเจอตอนเล่นจริง)

**แก้:** ปุ่มกดค้างมี **ไอคอนลายนิ้วมือ (`icon-fingerprint.webp`) ชิดขวา เว้นขอบเล็กน้อย** เหมือนที่สแกนนิ้ว — นำสายตาให้ผู้เล่นวางนิ้วฝั่งขวา (พื้นเปล่า) รูป/บทบาทโชว์ฝั่งซ้าย-กลาง นิ้วไม่บัง

- `features/role/RoleRevealFlow.tsx` ปุ่ม `.role-hold-btn` — เพิ่มไอคอนลายนิ้วมือชิดขวา · จัด layout ตอนโชว์บทบาทให้เนื้อหาเลี่ยงฝั่งขวา
- `features/topic/TopicFlow.tsx` ปุ่มกดค้างดูรูป — แบบเดียวกัน
- CSS: `.hold-btn__fingerprint` position ขวา + margin

## Art (Codex)

- `dock-topic.webp` — ไอคอน dock (สื่อรูปภาพ 2 ใบ / ดูภาพหาสปาย) สไตล์เดียวกับ dock อื่น
- `icon-fingerprint.webp` — ลายนิ้วมือสแกน (โปร่งใส)

## Testing

- ส่วน logic น้อย (flow UI เป็นหลัก) — เทสเท่าที่คุ้ม: TopicFlow เลือกรูปตามบทบาท (spy→B, normal/jester→A) เป็น pure helper `imageForRole(role, imgA, imgB)` แยกเทสได้
- ที่เหลือ verify ผ่านเบราว์เซอร์ (เดินดูครบ, กดค้างเห็นรูป, ลายนิ้วมือไม่บัง)
