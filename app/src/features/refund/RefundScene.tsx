import { finishRefund } from "../../state/actions";
import { useGameStore } from "../../state/useGameStore";
import { GameButton } from "../../ui/components/GameButton";

export function RefundScene() {
  const { state, setState } = useGameStore();
  const refund = state.lastVoteResult?.refundAmount ?? 0;

  return (
    <section className="scene-panel">
      <h2>💸 เหรียญปลอบใจ</h2>
      <p className="big-callout">จับผิดคนไปหน่อย... ซุปคืนให้ {refund} เหรียญ — เดินไปรับแล้วแบ่งกันเองในทีม</p>
      <div className="button-row">
        <GameButton onClick={() => setState(finishRefund)}>รับเหรียญแล้ว ไปล่าเบาะแสต่อ ➜</GameButton>
      </div>
    </section>
  );
}
