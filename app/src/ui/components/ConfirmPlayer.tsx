import type { Player } from "../../domain/types";
import { GameButton } from "./GameButton";
import { PlayerCard } from "./PlayerCard";

export function ConfirmPlayer({
  player,
  actionLabel,
  onConfirm,
  onBack,
}: {
  player: Player;
  actionLabel: string;
  onConfirm: () => void;
  onBack: () => void;
}) {
  return (
    <section className="scene-panel confirm-player">
      <h2>คุณคือ {player.name} ใช่ไหม?</h2>
      <PlayerCard player={player} selected />
      <div className="button-row">
        <GameButton variant="paper" onClick={onBack}>
          เลือกใหม่
        </GameButton>
        <GameButton onClick={onConfirm}>{actionLabel}</GameButton>
      </div>
    </section>
  );
}
