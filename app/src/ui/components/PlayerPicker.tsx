import type { Player, PlayerId } from "../../domain/types";
import { PlayerCard } from "./PlayerCard";

export function PlayerPicker({
  title,
  lead,
  players,
  onPick,
}: {
  title: string;
  lead?: string;
  players: Player[];
  onPick: (playerId: PlayerId) => void;
}) {
  return (
    <section className="scene-panel">
      <h2>{title}</h2>
      {lead && <p className="scene-lead">{lead}</p>}
      <div className="player-grid">
        {players.map((player) => (
          <PlayerCard key={player.id} player={player} onClick={() => onPick(player.id)} />
        ))}
      </div>
    </section>
  );
}
