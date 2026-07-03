import { useEffect, useRef } from "react";
import { playFanfare, playLose } from "../../audio/sounds";
import { gameAssets } from "../../data/assets";
import { useGameStore } from "../../state/useGameStore";
import { GameButton } from "../../ui/components/GameButton";
import { buzz } from "../../ui/haptics";

const CONFETTI_PIECES = Array.from({ length: 26 }, (_, index) => index);

export function EndGameScene() {
  const { state, setState } = useGameStore();
  const teamWon = state.endWinner === "team";
  const spies = state.players.filter((player) => state.roles[player.id] === "spyA" || state.roles[player.id] === "spyB");
  // เล่นเสียงครั้งเดียวต่อการเข้าฉากจบ — กัน StrictMode (dev) เรียก effect ซ้ำตอน mount
  const playedRef = useRef(false);
  useEffect(() => {
    if (playedRef.current) return;
    playedRef.current = true;
    if (teamWon) playFanfare();
    else playLose();
    buzz(teamWon ? [80, 60, 80, 60, 200] : [300]);
  }, [teamWon]);
  return (
    <div className="reveal-stage">
      {teamWon && (
        <div className="confetti" aria-hidden="true">
          {CONFETTI_PIECES.map((index) => (
            <span key={index} className="confetti__piece" style={{ ["--i" as string]: index }} />
          ))}
        </div>
      )}
      <section className="scene-panel result-scene">
        <img
          className="end-scene__art"
          src={teamWon ? gameAssets.endTeamWin : gameAssets.endSpyWin}
          alt=""
          onError={(event) => { event.currentTarget.style.display = "none"; }}
        />
        <h2>{teamWon ? "🏆 ปิดคดีสำเร็จ! ทีมชนะ!" : "🕶 สายลับชนะ! รอดไปได้ทั้งเกม"}</h2>
        <p className="big-callout">
          {teamWon
            ? `จับสายลับได้ครบทั้งคู่ในวันเล่นที่ ${state.manualDay.index} — สมกับเป็นทีมนักสืบ!`
            : `แฝงตัวรอดมาได้ถึงวันเล่นที่ ${state.manualDay.index} ทีมจับไม่ได้สักคน...`}
        </p>
        {spies.length > 0 && (
          <p className="end-scene__spies">
            🎭 เฉลย — สายลับรอบนี้คือ <b>{spies.map((spy) => spy.name).join(" และ ")}</b>
            {teamWon ? " โดนรวบเรียบร้อย" : " เนียนมากทั้งคู่ ปรบมือให้"}
          </p>
        )}
        <div className="button-row">
          <GameButton variant="paper" onClick={() => setState((current) => ({ ...current, phase: "home" }))}>กลับ Home</GameButton>
        </div>
      </section>
    </div>
  );
}
