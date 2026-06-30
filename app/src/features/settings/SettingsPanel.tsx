import { useMemo, useState } from "react";
import { defaultConfig } from "../../data/configDefaults";
import { itemCatalog } from "../../data/items";
import { calculateThreshold, calculateVoteCost } from "../../domain/economy";
import type { GameConfig, GachaOutcome, VoteItemType } from "../../domain/types";
import { resetConfig, updateConfig } from "../../state/actions";
import { useGameStore } from "../../state/useGameStore";
import { GameButton } from "../../ui/components/GameButton";

type ScalarKey = {
  [K in keyof GameConfig]: GameConfig[K] extends number ? K : never;
}[keyof GameConfig];

type FieldSpec = { key: ScalarKey; label: string; min: number; max: number; step?: number; unit?: string };
type Category = { title: string; fields: FieldSpec[] };

// แยกหมวดชัดเจน + กำหนดช่วงค่าบังคับ (slider คุมให้อยู่ในช่วงที่ถูกต้องเสมอ)
const CATEGORIES: Category[] = [
  {
    title: "🎭 บทบาท & เวลาเกม",
    fields: [
      { key: "spyCount", label: "จำนวนสายลับ", min: 1, max: 4, unit: " คน" },
      { key: "maxGameDays", label: "จำนวนวันต่อเกม", min: 3, max: 12, unit: " วัน" },
    ],
  },
  {
    title: "🗳️ การโหวต",
    fields: [
      { key: "thresholdRatio", label: "เกณฑ์ชนะ (สัดส่วนคนมา)", min: 0.3, max: 1, step: 0.01 },
      { key: "thresholdFloor", label: "เกณฑ์ขั้นต่ำ", min: 1, max: 6, unit: " เสียง" },
      { key: "voteBaseCostPerPresentPlayer", label: "ค่าเปิดโหวตต่อหัว", min: 1, max: 10, unit: " เหรียญ" },
      { key: "skippedWorkingDayIncrease", label: "ค่าโหวตแพงขึ้นเมื่อข้ามวัน", min: 0, max: 1, step: 0.05, unit: "×" },
    ],
  },
  {
    title: "🔎 เบาะแส & คืนเหรียญ",
    fields: [
      { key: "cluePriceRatio", label: "ราคาเบาะแส (× ค่าโหวต)", min: 0, max: 1, step: 0.05 },
      { key: "innocentRefundRatio", label: "คืนเหรียญเมื่อจับผิด (× ค่าโหวต)", min: 0, max: 1, step: 0.05 },
      { key: "spyPoolRevealMinVoted", label: "ประกาศกองสปาย ขั้นต่ำ", min: 1, max: 11, unit: " คน" },
      { key: "votedClueMinVoted", label: "เบาะแสคนถูกโหวต ขั้นต่ำ", min: 1, max: 11, unit: " คน" },
      { key: "notVotedClueMaxCards", label: "เบาะแสคนไม่ถูกโหวต สูงสุด", min: 1, max: 8, unit: " ใบ" },
    ],
  },
  {
    title: "🎒 ไอเทมพิเศษ",
    fields: [
      { key: "reduceThresholdPercent", label: "R ลดเกณฑ์", min: 0, max: 0.5, step: 0.01 },
      { key: "weakenedReduceThresholdPercent", label: "R เมื่อโดน P กัน", min: 0, max: 0.5, step: 0.01 },
      { key: "inventoryLimit", label: "ลิมิตกระเป๋าไอเทม", min: 1, max: 5, unit: " ชิ้น" },
    ],
  },
  {
    title: "🎰 กาชา",
    fields: [
      { key: "gachaSpinCost", label: "ราคาหมุนกาชา", min: 1, max: 20, unit: " เหรียญ" },
      { key: "gachaDailyLimitPerPlayer", label: "ลิมิตหมุน/คน/วัน", min: 1, max: 5, unit: " ครั้ง" },
      { key: "gachaCoinSelfGain", label: "ผู้หมุนได้เหรียญ", min: 0, max: 20, unit: " เหรียญ" },
      { key: "gachaCoinAllGain", label: "ทุกคนได้เหรียญ", min: 0, max: 15, unit: " เหรียญ" },
      { key: "gachaCoinAllLose", label: "ทุกคนเสียเหรียญ", min: 0, max: 15, unit: " เหรียญ" },
      { key: "gachaPoorThreshold", label: "เกณฑ์ 'คนเหรียญน้อย'", min: 0, max: 20, unit: " เหรียญ" },
      { key: "gachaPoorGain", label: "คนเหรียญน้อยได้", min: 0, max: 20, unit: " เหรียญ" },
      { key: "gachaVoteMultiplierUp", label: "โหวตหน้าแพงขึ้น", min: 1, max: 3, step: 0.1, unit: "×" },
      { key: "gachaVoteMultiplierDown", label: "โหวตหน้าถูกลง", min: 0.1, max: 1, step: 0.1, unit: "×" },
    ],
  },
  {
    title: "❓ โจทย์เชาว์",
    fields: [
      { key: "quizCorrectReward", label: "รางวัลตอบถูก", min: 0, max: 30, unit: " เหรียญ" },
      { key: "quizWrongPenaltyPerPlayer", label: "โทษตอบผิด/คน", min: 0, max: 10, unit: " เหรียญ" },
    ],
  },
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
const gachaOutcomes = Object.keys(gachaOutcomeLabels) as GachaOutcome[];

export function SettingsPanel() {
  const { state, setState } = useGameStore();
  const [draft, setDraft] = useState<GameConfig>(state.config);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const presentCount = Object.values(state.attendance).filter(Boolean).length;

  const preview = useMemo(
    () => ({
      threshold: calculateThreshold(Math.max(1, presentCount), draft),
      voteCost: calculateVoteCost(Math.max(1, presentCount), state.voteCostState.accumulatedSkippedMultiplier, state.voteCostState.nextVoteMultiplier, draft),
      gachaTotal: (Object.values(draft.gachaWeights) as number[]).reduce((sum, value) => sum + value, 0),
    }),
    [draft, presentCount, state.voteCostState.accumulatedSkippedMultiplier, state.voteCostState.nextVoteMultiplier],
  );

  const setKey = (key: ScalarKey, value: number) => { setDraft({ ...draft, [key]: value }); setSaved(false); };

  function save() {
    try {
      setState((current) => updateConfig(current, draft));
      setError(null);
      setSaved(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "บันทึก Settings ไม่สำเร็จ");
      setSaved(false);
    }
  }

  return (
    <section className="scene-panel settings-panel">
      <h2>ตั้งค่าเกม</h2>
      <div className="settings-summary">
        <span>เกณฑ์ชนะ <b>{preview.threshold}</b></span>
        <span>ค่าเปิดโหวต <b>{preview.voteCost}</b></span>
        <span>น้ำหนักกาชารวม <b>{preview.gachaTotal.toFixed(0)}</b></span>
      </div>
      {error && <p className="form-error">⚠️ {error}</p>}
      {saved && !error && <p className="settings-saved">✅ บันทึกแล้ว</p>}

      {CATEGORIES.map((category) => (
        <fieldset key={category.title} className="settings-cat">
          <legend>{category.title}</legend>
          <div className="settings-sliders">
            {category.fields.map((field) => (
              <SliderField
                key={field.key}
                label={field.label}
                value={draft[field.key]}
                min={field.min}
                max={field.max}
                step={field.step ?? 1}
                unit={field.unit}
                onChange={(value) => setKey(field.key, value)}
              />
            ))}
          </div>
        </fieldset>
      ))}

      <fieldset className="settings-cat">
        <legend>🛒 ราคา &amp; ลิมิตไอเทมร้าน</legend>
        <div className="settings-sliders">
          {itemCatalog.map((item) => (
            <div key={item.type} className="settings-item-pair">
              <SliderField
                label={`${item.label} · ราคา`}
                value={draft.itemPrices[item.type]}
                min={0}
                max={30}
                step={1}
                unit=" เหรียญ"
                onChange={(price) => { setDraft({ ...draft, itemPrices: { ...draft.itemPrices, [item.type as VoteItemType]: price } }); setSaved(false); }}
              />
              <SliderField
                label={`${item.label} · ลิมิต/วัน`}
                value={draft.itemDailyLimits[item.type]}
                min={0}
                max={5}
                step={1}
                unit=" ชิ้น"
                onChange={(limit) => { setDraft({ ...draft, itemDailyLimits: { ...draft.itemDailyLimits, [item.type as VoteItemType]: limit } }); setSaved(false); }}
              />
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="settings-cat">
        <legend>🎲 น้ำหนักโอกาสผลกาชา (รวม = {preview.gachaTotal.toFixed(0)})</legend>
        <div className="settings-sliders">
          {gachaOutcomes.map((outcome) => (
            <SliderField
              key={outcome}
              label={gachaOutcomeLabels[outcome]}
              value={draft.gachaWeights[outcome]}
              min={0}
              max={30}
              step={0.5}
              onChange={(weight) => { setDraft({ ...draft, gachaWeights: { ...draft.gachaWeights, [outcome]: weight } }); setSaved(false); }}
            />
          ))}
        </div>
      </fieldset>

      <div className="button-row settings-actions">
        <GameButton onClick={save}>💾 บันทึก</GameButton>
        <GameButton variant="paper" onClick={() => { setDraft(defaultConfig); setSaved(false); }}>คืนค่าเริ่มต้น (ยังไม่บันทึก)</GameButton>
        <GameButton variant="danger" onClick={() => { setState(resetConfig); setDraft(defaultConfig); }}>รีเซ็ต + บันทึกทันที</GameButton>
      </div>
    </section>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="slider-field">
      <span className="slider-field__top">
        <span className="slider-field__label">{label}</span>
        <span className="slider-field__value">{value}{unit ?? ""}</span>
      </span>
      <input
        type="range"
        className="slider-field__range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}
