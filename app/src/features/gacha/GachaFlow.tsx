import { useEffect, useRef, useState } from "react";
import { playCoin, playGacha } from "../../audio/sounds";
import { gachaIconAssets, gameAssets } from "../../data/assets";
import { itemCatalog } from "../../data/items";
import { quizBank } from "../../data/quizBank";
import { availableGachaWeights, selectWeightedGachaOutcome } from "../../domain/gachaEngine";
import type { GachaOutcome, PlayerId } from "../../domain/types";
import { applyGachaOutcome } from "../../state/actions";
import { useGameStore } from "../../state/useGameStore";
import { ConfirmPlayer } from "../../ui/components/ConfirmPlayer";
import { GameButton } from "../../ui/components/GameButton";
import { PlayerPicker } from "../../ui/components/PlayerPicker";

type Step = "pick" | "confirm" | "spin";

const ALL_OUTCOMES = Object.keys(gachaIconAssets) as GachaOutcome[];
const SPIN_MS = 2500; // ระยะลุ้น ~2.5 วิ ก่อนเฉลย

export function GachaFlow() {
  const { state, setState } = useGameStore();
  const [step, setStep] = useState<Step>("pick");
  const [selectedPlayerId, setSelectedPlayerId] = useState<PlayerId | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [resultOutcome, setResultOutcome] = useState<GachaOutcome | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [reelOutcome, setReelOutcome] = useState<GachaOutcome>(ALL_OUTCOMES[0]);
  const timers = useRef<number[]>([]);
  const player = state.players.find((candidate) => candidate.id === selectedPlayerId) ?? null;
  const spinsToday = selectedPlayerId ? state.dailyUsage.gachaSpins[selectedPlayerId] ?? 0 : 0;

  // เคลียร์ timer ทั้งหมดตอน unmount (กันหมุนค้างถ้าออกจากหน้า)
  useEffect(() => () => {
    timers.current.forEach((id) => { window.clearTimeout(id); window.clearInterval(id); });
    timers.current = [];
  }, []);

  function spin() {
    if (!selectedPlayerId || spinning) return;
    setResult(null);
    setResultOutcome(null);
    setSpinning(true);
    playGacha();

    // หมุน reel — สลับไอคอนสุ่มเร็วๆ ให้ดูลุ้น
    const reel = window.setInterval(() => {
      setReelOutcome(ALL_OUTCOMES[Math.floor(Math.random() * ALL_OUTCOMES.length)]);
    }, 90);
    timers.current.push(reel);

    // เสียงหมุนซ้ำกลางทางให้ต่อเนื่อง
    const whoosh = window.setTimeout(() => playGacha(), 1250);
    timers.current.push(whoosh);

    // เฉลยผลจริงเมื่อครบเวลา
    const settle = window.setTimeout(() => {
      window.clearInterval(reel);
      try {
        // ถอด outcome ที่ล็อกออกจากพูล (เกราะที่มีแล้ว / ค่าโหวตที่เปลี่ยนไปแล้ววันนี้) → เฉลี่ย % ให้อันอื่นอัตโนมัติ
        const weights = availableGachaWeights(state.config.gachaWeights, {
          shieldExists: state.shield.exists,
          voteCostChangedToday: state.dailyUsage.voteCostChanged ?? false,
        });
        const outcome = selectWeightedGachaOutcome(weights);
        const itemType = itemCatalog[Math.floor(Math.random() * itemCatalog.length)].type;
        const unusedQuestion = quizBank.find((question) => !state.usedQuizIds.includes(question.id)) ?? quizBank[0];
        const shieldSlot = Math.random() < 0.5 ? "spyA" : "spyB";
        let message = "";
        setState((current) => {
          const next = applyGachaOutcome(current, selectedPlayerId, outcome, {
            selectedItemType: itemType,
            selectedQuizId: unusedQuestion.id,
            shieldSlot,
          });
          message = next.lastGachaResult?.message ?? "กาชาทำงานแล้ว";
          return next;
        });
        setReelOutcome(outcome);
        setResult(message);
        setResultOutcome(outcome);
        playCoin();
      } catch (caught) {
        setResult(caught instanceof Error ? caught.message : "หมุนกาชาไม่สำเร็จ");
        setResultOutcome(null);
      }
      setSpinning(false);
    }, SPIN_MS);
    timers.current.push(settle);
  }

  if (step === "pick") {
    return <PlayerPicker title="เลือกผู้หมุนกาชา" players={state.players} onPick={(playerId) => { setSelectedPlayerId(playerId); setStep("confirm"); }} />;
  }

  if (step === "confirm" && player) {
    return <ConfirmPlayer player={player} actionLabel="หมุนกาชา" onBack={() => setStep("pick")} onConfirm={() => setStep("spin")} />;
  }

  return (
    <section className="scene-panel gacha-scene">
      <h2>ตู้กาชาสายลับ</h2>
      <p className="scene-lead">หมุนลุ้นลูกเล่นหมู่ + โจทย์เชาว์ 🎰 ผลกาชาประกาศให้ทุกคนเห็น (ไม่ลับเหมือนร้าน/โหวต)</p>
      <p className="big-callout">
        {player?.name} · ค่าหมุน {state.config.gachaSpinCost} เหรียญ · วันนี้ {spinsToday}/{state.config.gachaDailyLimitPerPlayer}
      </p>

      {spinning && (
        <div className="gacha-reel">
          <img className="gacha-reel__icon" src={gachaIconAssets[reelOutcome]} alt="" aria-hidden="true" onError={(event) => { event.currentTarget.style.visibility = "hidden"; }} />
          <p className="gacha-reel__text">🎰 กำลังสุ่ม... ลุ้นว่าจะได้อะไร!</p>
        </div>
      )}

      {!spinning && result && (
        <div className="gacha-result">
          {resultOutcome && (
            <img
              className="gacha-result__icon"
              src={gachaIconAssets[resultOutcome]}
              alt=""
              onError={(event) => { event.currentTarget.style.display = "none"; }}
            />
          )}
          <p className="settings-preview gacha-result__text">{result}</p>
        </div>
      )}

      <div className={`gacha-machine${spinning ? " gacha-machine--spinning" : ""}${!spinning && result ? " gacha-machine--popped" : ""}`} aria-hidden="true">
        <img
          className="gacha-machine__img"
          src={gameAssets.gachaMachine}
          alt=""
          onError={(event) => { event.currentTarget.style.display = "none"; }}
        />
        {!spinning && result && (
          <img
            className="gacha-machine__capsule"
            src={gameAssets.gachaCapsule}
            alt=""
            onError={(event) => { event.currentTarget.style.display = "none"; }}
          />
        )}
      </div>

      <div className="button-row">
        <GameButton onClick={spin} disabled={spinning}>{spinning ? "กำลังสุ่ม..." : "หมุน"}</GameButton>
        <GameButton variant="paper" disabled={spinning} onClick={() => setState((current) => ({ ...current, phase: "home" }))}>กลับ Home</GameButton>
      </div>
    </section>
  );
}
