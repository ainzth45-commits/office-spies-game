import { Fragment, useMemo, useState } from "react";
import { defaultConfig } from "../../data/configDefaults";
import { itemCatalog } from "../../data/items";
import { calculateThreshold, calculateVoteCost } from "../../domain/economy";
import type { GameConfig, GachaOutcome } from "../../domain/types";
import { resetConfig, updateConfig } from "../../state/actions";
import { useGameStore } from "../../state/useGameStore";
import { GameButton } from "../../ui/components/GameButton";

const gachaOutcomes: GachaOutcome[] = [
  "selfGain",
  "selfLoseAll",
  "allGain",
  "poorGain",
  "allLose",
  "voteUp",
  "voteDown",
  "grantItem",
  "grantQuiz",
  "spyShield",
];

const gachaOutcomeLabels: Record<GachaOutcome, string> = {
  selfGain: "ผู้หมุนได้เหรียญ",
  selfLoseAll: "ผู้หมุนเสียเหรียญหมด",
  allGain: "ทุกคนได้เหรียญ",
  poorGain: "คนเหรียญน้อยได้เหรียญ",
  allLose: "ทุกคนเสียเหรียญ",
  voteUp: "ค่าเปิดโหวตหน้าแพงขึ้น",
  voteDown: "ค่าเปิดโหวตหน้าถูกลง",
  grantItem: "ได้ไอเทมสุ่ม",
  grantQuiz: "ได้โจทย์เชาว์",
  spyShield: "เกราะสายลับ (แจ็คพอต)",
};

export function SettingsPanel() {
  const { state, setState } = useGameStore();
  const [draft, setDraft] = useState<GameConfig>(state.config);
  const [error, setError] = useState<string | null>(null);
  const presentCount = Object.values(state.attendance).filter(Boolean).length;
  const preview = useMemo(
    () => ({
      threshold: calculateThreshold(Math.max(1, presentCount), draft),
      voteCost: calculateVoteCost(Math.max(1, presentCount), state.voteCostState.accumulatedSkippedMultiplier, state.voteCostState.nextVoteMultiplier, draft),
      gachaTotal: (Object.values(draft.gachaWeights) as number[]).reduce((sum, value) => sum + value, 0),
    }),
    [draft, presentCount, state.voteCostState.accumulatedSkippedMultiplier, state.voteCostState.nextVoteMultiplier],
  );

  function save() {
    try {
      setState((current) => updateConfig(current, draft));
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "บันทึก Settings ไม่สำเร็จ");
    }
  }

  return (
    <section className="scene-panel settings-panel">
      <h2>ตั้งค่าเกม</h2>
      {error && <p className="form-error">{error}</p>}
      <div className="settings-preview">
        <strong>ตัวอย่างตอนนี้:</strong> เกณฑ์ชนะ = {preview.threshold}, ค่าเปิดโหวต = {preview.voteCost}, น้ำหนักกาชารวม = {preview.gachaTotal.toFixed(1)}%
      </div>
      <div className="settings-grid">
        <NumberField label="จำนวนสปาย" value={draft.spyCount} onChange={(spyCount) => setDraft({ ...draft, spyCount })} />
        <NumberField label="เกณฑ์ชนะ ratio" value={draft.thresholdRatio} step={0.01} onChange={(thresholdRatio) => setDraft({ ...draft, thresholdRatio })} />
        <NumberField label="เกณฑ์ขั้นต่ำ" value={draft.thresholdFloor} onChange={(thresholdFloor) => setDraft({ ...draft, thresholdFloor })} />
        <NumberField label="ค่าเปิดโหวต/หัว" value={draft.voteBaseCostPerPresentPlayer} onChange={(voteBaseCostPerPresentPlayer) => setDraft({ ...draft, voteBaseCostPerPresentPlayer })} />
        <NumberField label="เพิ่มเมื่อข้ามวัน" value={draft.skippedWorkingDayIncrease} step={0.05} onChange={(skippedWorkingDayIncrease) => setDraft({ ...draft, skippedWorkingDayIncrease })} />
        <NumberField label="ราคาเบาะแส ratio" value={draft.cluePriceRatio} step={0.01} onChange={(cluePriceRatio) => setDraft({ ...draft, cluePriceRatio })} />
        <NumberField label="คืนเหรียญ ratio" value={draft.innocentRefundRatio} step={0.01} onChange={(innocentRefundRatio) => setDraft({ ...draft, innocentRefundRatio })} />
        <NumberField label="ประกาศกองสปายขั้นต่ำ" value={draft.spyPoolRevealMinVoted} onChange={(spyPoolRevealMinVoted) => setDraft({ ...draft, spyPoolRevealMinVoted })} />
        <NumberField label="เบาะแสคนถูกโหวตขั้นต่ำ" value={draft.votedClueMinVoted} onChange={(votedClueMinVoted) => setDraft({ ...draft, votedClueMinVoted })} />
        <NumberField label="เบาะแสคนไม่ถูกโหวตสูงสุด" value={draft.notVotedClueMaxCards} onChange={(notVotedClueMaxCards) => setDraft({ ...draft, notVotedClueMaxCards })} />
        <NumberField label="R ลดเกณฑ์ %" value={draft.reduceThresholdPercent} step={0.01} onChange={(reduceThresholdPercent) => setDraft({ ...draft, reduceThresholdPercent })} />
        <NumberField label="R เมื่อโดน P %" value={draft.weakenedReduceThresholdPercent} step={0.01} onChange={(weakenedReduceThresholdPercent) => setDraft({ ...draft, weakenedReduceThresholdPercent })} />
        <NumberField label="ลิมิตกระเป๋า" value={draft.inventoryLimit} onChange={(inventoryLimit) => setDraft({ ...draft, inventoryLimit })} />
        <NumberField label="รางวัลโจทย์ถูก" value={draft.quizCorrectReward} onChange={(quizCorrectReward) => setDraft({ ...draft, quizCorrectReward })} />
        <NumberField label="โทษโจทย์ผิด/คน" value={draft.quizWrongPenaltyPerPlayer} onChange={(quizWrongPenaltyPerPlayer) => setDraft({ ...draft, quizWrongPenaltyPerPlayer })} />
        <NumberField label="ราคาหมุนกาชา" value={draft.gachaSpinCost} onChange={(gachaSpinCost) => setDraft({ ...draft, gachaSpinCost })} />
        <NumberField label="ลิมิตกาชา/คน/วัน" value={draft.gachaDailyLimitPerPlayer} onChange={(gachaDailyLimitPerPlayer) => setDraft({ ...draft, gachaDailyLimitPerPlayer })} />
        <NumberField label="กาชา ตัวเองได้เหรียญ" value={draft.gachaCoinSelfGain} onChange={(gachaCoinSelfGain) => setDraft({ ...draft, gachaCoinSelfGain })} />
        <NumberField label="กาชา ทุกคนได้เหรียญ" value={draft.gachaCoinAllGain} onChange={(gachaCoinAllGain) => setDraft({ ...draft, gachaCoinAllGain })} />
        <NumberField label="กาชา ทุกคนเสียเหรียญ" value={draft.gachaCoinAllLose} onChange={(gachaCoinAllLose) => setDraft({ ...draft, gachaCoinAllLose })} />
        <NumberField label="เกณฑ์คนเหรียญน้อย" value={draft.gachaPoorThreshold} onChange={(gachaPoorThreshold) => setDraft({ ...draft, gachaPoorThreshold })} />
        <NumberField label="คนเหรียญน้อยได้" value={draft.gachaPoorGain} onChange={(gachaPoorGain) => setDraft({ ...draft, gachaPoorGain })} />
        <NumberField label="โหวตหน้าแพงขึ้น x" value={draft.gachaVoteMultiplierUp} step={0.1} onChange={(gachaVoteMultiplierUp) => setDraft({ ...draft, gachaVoteMultiplierUp })} />
        <NumberField label="โหวตหน้าถูกลง x" value={draft.gachaVoteMultiplierDown} step={0.1} onChange={(gachaVoteMultiplierDown) => setDraft({ ...draft, gachaVoteMultiplierDown })} />
      </div>
      <h3>ร้านไอเทม</h3>
      <div className="settings-grid">
        {itemCatalog.map((item) => (
          <Fragment key={item.type}>
            <NumberField
              label={`${item.label} ราคา`}
              value={draft.itemPrices[item.type]}
              onChange={(price) => setDraft({ ...draft, itemPrices: { ...draft.itemPrices, [item.type]: price } })}
            />
            <NumberField
              label={`${item.label} ลิมิต/วัน`}
              value={draft.itemDailyLimits[item.type]}
              onChange={(limit) => setDraft({ ...draft, itemDailyLimits: { ...draft.itemDailyLimits, [item.type]: limit } })}
            />
          </Fragment>
        ))}
      </div>
      <h3>น้ำหนักกาชา (% โอกาสออกแต่ละผล — รวมควรได้ {preview.gachaTotal.toFixed(0)})</h3>
      <div className="settings-grid">
        {gachaOutcomes.map((outcome) => (
          <NumberField
            key={outcome}
            label={gachaOutcomeLabels[outcome]}
            step={0.1}
            value={draft.gachaWeights[outcome]}
            onChange={(weight) => setDraft({ ...draft, gachaWeights: { ...draft.gachaWeights, [outcome]: weight } })}
          />
        ))}
      </div>
      <div className="button-row">
        <GameButton onClick={save}>บันทึก</GameButton>
        <GameButton variant="paper" onClick={() => setDraft(defaultConfig)}>
          รีเซ็ตค่าเริ่มต้น
        </GameButton>
        <GameButton variant="danger" onClick={() => setState(resetConfig)}>
          รีเซ็ตและบันทึกทันที
        </GameButton>
      </div>
    </section>
  );
}

function NumberField({
  label,
  value,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="number-field">
      <span>{label}</span>
      <input type="number" value={value} step={step} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}
