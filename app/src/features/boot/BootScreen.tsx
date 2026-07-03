import { gameAssets } from "../../data/assets";
import { useGameStore } from "../../state/useGameStore";

// หน้าเปิดเว็บ: โลโก้ใหญ่กลางจอ แตะที่โลโก้ = เข้าเกมเลย (ไม่มี popup คั่น)
// การแตะครั้งแรกนี้ยังทำหน้าที่ปลดล็อกเสียงบน iPad เหมือนเดิม (Web Audio ต้องมี user gesture)
export function BootScreen() {
  const { setState } = useGameStore();
  const enter = () => setState((current) => ({ ...current, phase: "home" }));

  return (
    <main className="app-shell boot-splash">
      <button type="button" className="boot-logo-btn" onClick={enter} aria-label="เข้าสู่เกมสายลับในออฟฟิศ">
        <img
          className="boot-logo-btn__img"
          src={gameAssets.logo}
          alt="สายลับในออฟฟิศ"
          onError={(event) => { event.currentTarget.style.display = "none"; }}
        />
        <span className="boot-logo-btn__hint">👆 แตะโลโก้เพื่อเริ่มภารกิจ</span>
      </button>
    </main>
  );
}
