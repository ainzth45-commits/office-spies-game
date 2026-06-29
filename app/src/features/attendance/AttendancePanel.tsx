import { useGameStore } from "../../state/useGameStore";
import { PlayerCard } from "../../ui/components/PlayerCard";

export function AttendancePanel() {
  const { state, setState } = useGameStore();
  return (
    <section className="scene-panel">
      <h2>คนมา / คนลา วันนี้</h2>
      <div className="player-grid">
        {state.players.map((player) => {
          const present = state.attendance[player.id];
          return (
            <div key={player.id} className={present ? "attendance-card attendance-card--present" : "attendance-card"}>
              <PlayerCard
                player={player}
                selected={present}
                onClick={() => {
                  setState((current) => ({
                    ...current,
                    attendance: { ...current.attendance, [player.id]: !current.attendance[player.id] },
                  }));
                }}
              />
              <strong>{present ? "มาวันนี้" : "ลา/ไม่มา"}</strong>
            </div>
          );
        })}
      </div>
    </section>
  );
}
