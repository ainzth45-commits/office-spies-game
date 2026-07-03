import { useState } from "react";
import type { PlayerId } from "../../domain/types";
import { resolveSecondSpyGuess } from "../../state/actions";
import { useGameStore } from "../../state/useGameStore";
import { GameButton } from "../../ui/components/GameButton";
import { PlayerCard } from "../../ui/components/PlayerCard";

export function GuessSecondSpyScene() {
  const { state, setState } = useGameStore();
  const [guessId, setGuessId] = useState<PlayerId | null>(null);

  const guessed = state.players.find((player) => player.id === guessId) ?? null;

  return (
    <section className="scene-panel">
      <h2>🎯 ชี้ตัวสายลับคนที่สอง!</h2>
      <p className="big-callout">โอกาสเดียวเท่านั้น — ปรึกษากันให้ดี ชี้ถูก = ทีมชนะทันที ชี้ผิด = มันรอดไปอีกวัน</p>
      <div className="player-grid player-grid--compact">
        {state.players.map((player) => (
          <PlayerCard key={player.id} player={player} selected={guessId === player.id} onClick={() => setGuessId(player.id)} />
        ))}
      </div>
      <div className="button-row">
        <GameButton disabled={!guessId} onClick={() => guessId && setState((current) => resolveSecondSpyGuess(current, guessId))}>
          {guessed ? `🫵 ทีมฟันธง: ${guessed.name} คือสายลับ!` : "แตะเลือกผู้ต้องสงสัยก่อน"}
        </GameButton>
      </div>
    </section>
  );
}
