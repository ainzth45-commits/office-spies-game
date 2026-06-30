import { useEffect, useRef } from "react";
import { playFanfare, playLose } from "../../audio/sounds";
import { gameAssets } from "../../data/assets";
import { useGameStore } from "../../state/useGameStore";
import { GameButton } from "../../ui/components/GameButton";

export function EndGameScene() {
  const { state, setState } = useGameStore();
  const teamWon = state.endWinner === "team";
  // เล่นเสียงครั้งเดียวต่อการเข้าฉากจบ — กัน StrictMode (dev) เรียก effect ซ้ำตอน mount
  const playedRef = useRef(false);
  useEffect(() => {
    if (playedRef.current) return;
    playedRef.current = true;
    if (teamWon) playFanfare();
    else playLose();
  }, [teamWon]);
  return (
    <div className="reveal-stage">
      <section className="scene-panel result-scene">
        <img
          className="end-scene__art"
          src={teamWon ? gameAssets.endTeamWin : gameAssets.endSpyWin}
          alt=""
          onError={(event) => { event.currentTarget.style.display = "none"; }}
        />
        <h2>{teamWon ? "ทีมชนะ! จับสายลับได้สำเร็จ 🎉" : "สายลับชนะ! แฝงตัวรอดมาได้ 🕵️"}</h2>
        <div className="button-row">
          <GameButton variant="paper" onClick={() => setState((current) => ({ ...current, phase: "home" }))}>กลับ Home</GameButton>
        </div>
      </section>
    </div>
  );
}
