import type { Player } from "../../domain/types";

export function PlayerCard({ player, selected, dimmed, onClick }: { player: Player; selected?: boolean; dimmed?: boolean; onClick?: () => void }) {
  return (
    <button
      className={`player-card${selected ? " player-card--selected" : ""}${dimmed ? " player-card--dimmed" : ""}`}
      onClick={onClick}
      type="button"
    >
      <span className="player-card__photo-wrap">
        <img
          className="player-card__photo"
          src={player.imageUrl}
          alt={player.name}
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
        <span className="player-card__fallback">{player.code}</span>
      </span>
      <span className="player-card__name">{player.name}</span>
      <span className="player-card__code">{player.code}</span>
    </button>
  );
}
