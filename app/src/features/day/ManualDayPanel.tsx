import { useState } from "react";
import { canStartNewDay, markFinalDay, resetGame, restDay, startNewDay } from "../../state/actions";
import { useGameStore } from "../../state/useGameStore";
import { GameButton } from "../../ui/components/GameButton";

export function ManualDayPanel() {
  const { state, setState } = useGameStore();
  const day = state.manualDay.index;
  const maxDay = state.config.maxGameDays;
  const canAdvance = canStartNewDay(state);
  const [nextLabel, setNextLabel] = useState(`วันเล่นที่ ${Math.min(day + 1, maxDay)}`);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <section className="day-panel">
      <h2>คุมวัน</h2>
      <p className="day-panel__status">
        ตอนนี้: <strong>วันเล่นที่ {day}</strong> / {maxDay}
        {state.manualDay.isFinalDay && <span className="day-panel__final"> · วันสุดท้าย!</span>}
      </p>

      {canAdvance ? (
        <>
          <label className="number-field">
            <span>ชื่อวันถัดไป</span>
            <input value={nextLabel} onChange={(event) => setNextLabel(event.target.value)} aria-label="ชื่อวันถัดไป" />
          </label>
          <div className="button-row">
            <GameButton onClick={() => setState((current) => startNewDay(current, nextLabel))}>เริ่มวันใหม่ →</GameButton>
            <GameButton variant="paper" onClick={() => setState((current) => restDay(current, nextLabel))}>พักวัน (ไม่ขึ้นค่าโหวต)</GameButton>
          </div>
        </>
      ) : (
        <p className="day-panel__locked">🔒 ถึงวันสุดท้าย (วันที่ {maxDay}) แล้ว เริ่มวันใหม่ไม่ได้ — ต้องจบเกมหรือรีเซตเกม</p>
      )}

      <div className="button-row">
        <GameButton variant="danger" onClick={() => setState(markFinalDay)}>🏁 จบเกม &amp; ดูผล</GameButton>
        {confirmReset ? (
          <>
            <GameButton variant="danger" onClick={() => { setConfirmReset(false); setState(resetGame); }}>ยืนยันรีเซต!</GameButton>
            <GameButton variant="paper" onClick={() => setConfirmReset(false)}>ยกเลิก</GameButton>
          </>
        ) : (
          <GameButton variant="paper" onClick={() => setConfirmReset(true)}>🔄 รีเซตเกมใหม่</GameButton>
        )}
      </div>
      {confirmReset && <p className="day-panel__warn">⚠️ วันจะกลับเป็น 1 + ล้างบทบาท/ไอเทม/โหวตทั้งหมด (เก็บรายชื่อ + ตั้งค่าไว้)</p>}
    </section>
  );
}
