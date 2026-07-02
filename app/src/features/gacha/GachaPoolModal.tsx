import { availableGachaWeights, normalizeGachaWeights } from "../../domain/gachaEngine";
import type { GachaOutcome } from "../../domain/types";
import { useGameStore } from "../../state/useGameStore";
import { GameButton } from "../../ui/components/GameButton";
import { gachaOutcomeIcon } from "./GachaFlow";

// ป้าย+คำอธิบายของทั้ง 14 ช่อง — เรียงตามความน่าตื่นเต้น (ไอเทม/เกราะก่อน แล้วค่อยเหรียญ)
export const gachaPoolEntries: Array<{ outcome: GachaOutcome; label: string; desc: string }> = [
  { outcome: "itemDouble", label: "โหวต 2 เสียง", desc: "ไอเทม: เสียงโหวตนับเป็น 2 ในรอบนั้น" },
  { outcome: "itemRemove", label: "ลบ 1 เสียง", desc: "ไอเทม: ลบเสียงจากคนที่เลือก" },
  { outcome: "itemSwap", label: "สลับผลโหวต", desc: "ไอเทม: สลับคะแนนของ 2 คน" },
  { outcome: "itemReduce", label: "R ลดเกณฑ์ 25%", desc: "ไอเทม: โหวตโดนง่ายขึ้นทั้งรอบ" },
  { outcome: "itemProtect", label: "P กันลดเกณฑ์", desc: "ไอเทม: บล็อกไอเทม R ในรอบนั้น" },
  { outcome: "spyShield", label: "เกราะสปาย", desc: "เข้าหาสปายอัตโนมัติ กันโดนจับ 1 ครั้ง (ทั้งเกมมีชิ้นเดียว)" },
  { outcome: "grantQuiz", label: "โจทย์เชาว์ฟรี", desc: "คนที่หมุนได้ตอบ — ตอบไวได้เหรียญเยอะ" },
  { outcome: "selfGain", label: "รับเหรียญ", desc: "คนที่หมุนรับเหรียญจากซุป" },
  { outcome: "selfLoseAll", label: "คืนเหรียญทั้งหมด", desc: "คนที่หมุนคืนเหรียญทั้งหมดให้ซุป 😱" },
  { outcome: "allGain", label: "ทุกคนรับเหรียญ", desc: "รับกันถ้วนหน้า" },
  { outcome: "poorGain", label: "คนจนรับโชค", desc: "คนเหรียญน้อยได้เหรียญเพิ่ม" },
  { outcome: "allLose", label: "ทุกคนคืนเหรียญ", desc: "เสียกันถ้วนหน้า" },
  { outcome: "voteUp", label: "ค่าโหวตแพงขึ้น", desc: "ค่าเปิดโหวตครั้งหน้า x1.5 (ออกได้วันละครั้ง)" },
  { outcome: "voteDown", label: "ค่าโหวตถูกลง", desc: "ค่าเปิดโหวตครั้งหน้า x0.5 (ออกได้วันละครั้ง)" },
];

export function GachaPoolModal({ onClose }: { onClose: () => void }) {
  const { state } = useGameStore();
  const live = availableGachaWeights(state.config.gachaWeights, {
    shieldExists: state.shield.exists,
    voteCostChangedToday: state.dailyUsage.voteCostChanged ?? false,
  });
  // กันเคสสุดโต่ง (ซุปตั้งน้ำหนักเหลือ 0 หมด) — โชว์ 0% แทนพัง
  const total = Object.values(live).reduce((sum, weight) => sum + Math.max(0, weight), 0);
  const percents = total > 0 ? normalizeGachaWeights(live) : live;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="overlay-sheet pool-modal" onClick={(event) => event.stopPropagation()}>
        <h2>📦 ในตู้กาชามีอะไรบ้าง</h2>
        <p className="scene-lead">เปอร์เซ็นต์คือโอกาสจริงตอนนี้ — ของที่หมด/ติดล็อกจะจางลง</p>
        <div className="pool-grid">
          {gachaPoolEntries.map(({ outcome, label, desc }) => {
            const locked = (live[outcome] ?? 0) <= 0;
            return (
              <div key={outcome} className={`pool-slot${locked ? " pool-slot--locked" : ""}`}>
                <img src={gachaOutcomeIcon(outcome)} alt="" aria-hidden="true" onError={(event) => { event.currentTarget.style.display = "none"; }} />
                <b>{label}</b>
                <small>{desc}</small>
                <span className="pool-slot__pct">{locked ? "หมดชั่วคราว" : `${percents[outcome].toFixed(1)}%`}</span>
              </div>
            );
          })}
        </div>
        <div className="button-row">
          <GameButton onClick={onClose}>ปิด</GameButton>
        </div>
      </div>
    </div>
  );
}
