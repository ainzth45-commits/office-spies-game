import { useState } from "react";
import type { PlayerId } from "../../domain/types";
import { resolveSecondSpyGuess } from "../../state/actions";
import { useGameStore } from "../../state/useGameStore";
import { GameButton } from "../../ui/components/GameButton";
import { PlayerCard } from "../../ui/components/PlayerCard";

export function GuessSecondSpyScene() {
  const { state, setState } = useGameStore();
  const [guessId, setGuessId] = useState<PlayerId | null>(null);

  return (
    <section className="scene-panel">
      <h2>ทายสปายคนที่สอง</h2>
      <p className="big-callout">ทีมปรึกษากันได้ 1 ครั้ง ถ้าผิดจะสุ่มบทบาทใหม่แล้วเล่นต่อ</p>
      <div className="player-grid player-grid--compact">
        {state.players.map((player) => (
          <PlayerCard key={player.id} player={player} selected={guessId === player.id} onClick={() => setGuessId(player.id)} />
        ))}
      </div>
      <div className="button-row">
        <GameButton disabled={!guessId} onClick={() => guessId && setState((current) => resolveSecondSpyGuess(current, guessId))}>
          ยืนยันคำตอบทีม
        </GameButton>
      </div>
    </section>
  );
}
