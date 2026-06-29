import { useState } from "react";
import { endWorkingDay, markFinalDay, restDay } from "../../state/actions";
import { useGameStore } from "../../state/useGameStore";
import { GameButton } from "../../ui/components/GameButton";

export function ManualDayPanel() {
  const { state, setState } = useGameStore();
  const [nextLabel, setNextLabel] = useState(`วันเล่นที่ ${state.manualDay.index + 1}`);

  return (
    <section className="day-panel">
      <h2>คุมวันเอง</h2>
      <input value={nextLabel} onChange={(event) => setNextLabel(event.target.value)} aria-label="ชื่อวันถัดไป" />
      <div className="button-row">
        <GameButton onClick={() => setState((current) => endWorkingDay(current, nextLabel))}>จบวันทำงาน</GameButton>
        <GameButton variant="paper" onClick={() => setState((current) => restDay(current, nextLabel))}>
          พักวัน
        </GameButton>
        <GameButton variant="danger" onClick={() => setState(markFinalDay)}>
          ตัดสินวันสุดท้าย
        </GameButton>
      </div>
    </section>
  );
}
