import { useEffect, useState } from "react";
import { gameAssets } from "../../data/assets";
import { boostPreload, getPreloadProgress, subscribePreload } from "../../data/preloadAssets";
import { useGameStore } from "../../state/useGameStore";

// หน้าเปิดเว็บ: โลโก้ใหญ่กลางจอ แตะที่โลโก้ = เข้าเกมเลย (ไม่มี popup คั่น)
// การแตะครั้งแรกนี้ยังทำหน้าที่ปลดล็อกเสียงบน iPad เหมือนเดิม (Web Audio ต้องมี user gesture)
// ถ้ารูปทั้งเกมยังโหลดไม่ครบ แตะแล้วค้างหน้าโหลดไว้ก่อน — เห็น 100% ชัดๆ แล้วค่อยพาเข้า home
export function BootScreen() {
  const { setState } = useGameStore();
  const [waiting, setWaiting] = useState(false);
  const [progress, setProgress] = useState(() => getPreloadProgress());

  const done = progress.total > 0 && progress.loaded >= progress.total;
  const percent = progress.total > 0 ? Math.round((progress.loaded / progress.total) * 100) : 0;

  useEffect(() => {
    if (!waiting) return;
    const update = () => setProgress(getPreloadProgress());
    update();
    return subscribePreload(update);
  }, [waiting]);

  // โหลดครบระหว่างรอ → ค้างภาพ 100% ให้เห็นจังหวะสำเร็จก่อน แล้วค่อยเข้าเกม
  useEffect(() => {
    if (!waiting || !done) return;
    const timer = window.setTimeout(
      () => setState((current) => ({ ...current, phase: "home" })),
      900,
    );
    return () => window.clearTimeout(timer);
  }, [waiting, done, setState]);

  const enter = () => {
    const now = getPreloadProgress();
    if (now.total > 0 && now.loaded >= now.total) {
      setState((current) => ({ ...current, phase: "home" }));
      return;
    }
    boostPreload();
    setWaiting(true);
  };

  if (waiting) {
    return (
      <main className="app-shell boot-splash">
        <div className="boot-loading">
          <img
            className="boot-loading__logo"
            src={gameAssets.logo}
            alt="สายลับในออฟฟิศ"
            onError={(event) => { event.currentTarget.style.display = "none"; }}
          />
          <img
            className={`boot-loading__mascot${done ? " boot-loading__mascot--done" : ""}`}
            src={gameAssets.magnifier}
            alt=""
            aria-hidden="true"
            onError={(event) => { event.currentTarget.style.display = "none"; }}
          />
          <div className="boot-loading__track" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
            <div className="boot-loading__fill" style={{ width: `${percent}%` }} />
          </div>
          <p className="boot-loading__label">
            {done ? "✅ หลักฐานครบ 100% — เข้าออฟฟิศกันเลย!" : `🕵️‍♀️ กำลังรวบรวมหลักฐาน... ${percent}%`}
          </p>
        </div>
      </main>
    );
  }

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
