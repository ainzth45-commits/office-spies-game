import { useState, type ReactNode } from "react";
import { gameAssets } from "../../data/assets";
import { ThemedIcon } from "./ThemedIcon";

// ปุ่มกดค้างเพื่อดูเนื้อหา (บทบาท / รูป topic) — ลายนิ้วมือชิดขวาเป็นจุดวางนิ้ว
// วางแถบกดไว้ "ล่าง" เนื้อหาโชว์ "บน" → นิ้วอยู่ที่ลายนิ้วมือล่างขวา ไม่บังรูป (เจ้านายเจอปัญหามือบังตอนกดกลาง)
export function HoldToReveal({ coverLabel, children }: { coverLabel: ReactNode; children: ReactNode }) {
  const [holding, setHolding] = useState(false);
  return (
    <div className="hold-reveal">
      <div className={`hold-reveal__stage${holding ? " hold-reveal__stage--on" : ""}`}>
        {holding ? children : <div className="hold-reveal__cover">{coverLabel}</div>}
      </div>
      <button
        type="button"
        className={`hold-reveal__btn${holding ? " hold-reveal__btn--held" : ""}`}
        onPointerDown={(event) => { event.preventDefault(); setHolding(true); }}
        onPointerUp={() => setHolding(false)}
        onPointerCancel={() => setHolding(false)}
        onPointerLeave={() => setHolding(false)}
        onContextMenu={(event) => event.preventDefault()}
      >
        <span className="hold-reveal__btn-label">{holding ? "🔓 กำลังดู... ปล่อยนิ้ว = ปิด" : "👇 แตะค้างที่ลายนิ้วมือ →"}</span>
        <ThemedIcon className="hold-reveal__fingerprint" src={gameAssets.iconFingerprint} emoji="🫲" />
      </button>
    </div>
  );
}
