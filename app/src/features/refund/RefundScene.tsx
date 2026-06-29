import { finishRefund } from "../../state/actions";
import { useGameStore } from "../../state/useGameStore";
import { GameButton } from "../../ui/components/GameButton";

export function RefundScene() {
  const { state, setState } = useGameStore();
  const refund = state.lastVoteResult?.refundAmount ?? 0;

  return (
    <section className="scene-panel">
      <h2>จัดสรรเหรียญคืน</h2>
      <p className="big-callout">คืน {refund} เหรียญให้ทีมเลือกผู้ถือเงินไปจัดสรรต่อ</p>
      <div className="button-row">
        <GameButton onClick={() => setState(finishRefund)}>จัดสรรแล้ว ไปซื้อเบาะแส</GameButton>
      </div>
    </section>
  );
}
