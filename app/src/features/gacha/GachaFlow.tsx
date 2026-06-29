import { useState } from "react";
import { playGacha } from "../../audio/sounds";
import { gachaIconAssets, gameAssets } from "../../data/assets";
import { itemCatalog } from "../../data/items";
import type { GachaOutcome } from "../../domain/types";
import { quizBank } from "../../data/quizBank";
import { selectWeightedGachaOutcome } from "../../domain/gachaEngine";
import type { PlayerId } from "../../domain/types";
import { applyGachaOutcome } from "../../state/actions";
import { useGameStore } from "../../state/useGameStore";
import { ConfirmPlayer } from "../../ui/components/ConfirmPlayer";
import { GameButton } from "../../ui/components/GameButton";
import { PlayerPicker } from "../../ui/components/PlayerPicker";

type Step = "pick" | "confirm" | "spin";

export function GachaFlow() {
  const { state, setState } = useGameStore();
  const [step, setStep] = useState<Step>("pick");
  const [selectedPlayerId, setSelectedPlayerId] = useState<PlayerId | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [resultOutcome, setResultOutcome] = useState<GachaOutcome | null>(null);
  const player = state.players.find((candidate) => candidate.id === selectedPlayerId) ?? null;
  const spinsToday = selectedPlayerId ? state.dailyUsage.gachaSpins[selectedPlayerId] ?? 0 : 0;

  function spin() {
    if (!selectedPlayerId) return;
    playGacha();
    try {
      const outcome = selectWeightedGachaOutcome(state.config.gachaWeights);
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
      setResult(message);
      setResultOutcome(outcome);
    } catch (caught) {
      setResult(caught instanceof Error ? caught.message : "หมุนกาชาไม่สำเร็จ");
      setResultOutcome(null);
    }
  }

  if (step === "pick") {
    return <PlayerPicker title="เลือกผู้หมุนกาชา" players={state.players} onPick={(playerId) => { setSelectedPlayerId(playerId); setStep("confirm"); }} />;
  }

  if (step === "confirm" && player) {
    return <ConfirmPlayer player={player} actionLabel="หมุนกาชา" onBack={() => setStep("pick")} onConfirm={() => setStep("spin")} />;
  }

  return (
    <section className="scene-panel">
      <h2>ตู้กาชาสายลับ</h2>
      <p className="scene-lead">หมุนลุ้นลูกเล่นหมู่ + โจทย์เชาว์ 🎰 ผลกาชาประกาศให้ทุกคนเห็น (ไม่ลับเหมือนร้าน/โหวต)</p>
      <p className="big-callout">
        {player?.name} · ค่าหมุน {state.config.gachaSpinCost} เหรียญ · วันนี้ {spinsToday}/{state.config.gachaDailyLimitPerPlayer}
      </p>
      {result && (
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
      <div className={`gacha-machine${result ? " gacha-machine--popped" : ""}`} aria-hidden="true">
        <img
          className="gacha-machine__img"
          src={gameAssets.gachaMachine}
          alt=""
          onError={(event) => { event.currentTarget.style.display = "none"; }}
        />
        {result && (
          <img
            className="gacha-machine__capsule"
            src={gameAssets.gachaCapsule}
            alt=""
            onError={(event) => { event.currentTarget.style.display = "none"; }}
          />
        )}
      </div>
      <div className="button-row">
        <GameButton onClick={spin}>หมุน</GameButton>
        <GameButton variant="paper" onClick={() => setState((current) => ({ ...current, phase: "home" }))}>กลับ Home</GameButton>
      </div>
    </section>
  );
}
