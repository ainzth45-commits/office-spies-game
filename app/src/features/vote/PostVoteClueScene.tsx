import { gameAssets } from "../../data/assets";
import { advanceFromPostVoteClue, buyPostVoteClue, skipPostVoteClue } from "../../state/actions";
import { useGameStore } from "../../state/useGameStore";
import { GameButton } from "../../ui/components/GameButton";
import { PlayerCard } from "../../ui/components/PlayerCard";

export function PostVoteClueScene() {
  const { state, setState } = useGameStore();
  const clueCost = state.lastVoteResult ? Math.floor(state.lastVoteResult.paidCost * state.config.cluePriceRatio) : 0;
  const cluePlayers = (state.lastClueResult?.playerIds ?? [])
    .map((playerId) => state.players.find((player) => player.id === playerId))
    .filter((player) => Boolean(player));

  return (
    <section className="scene-panel">
      <img className="scene-hero" src={gameAssets.magnifier} alt="" aria-hidden="true" onError={(event) => { event.currentTarget.style.display = "none"; }} />
      <h2>ซื้อเบาะแสหลังโหวต</h2>
      <p className="big-callout">ราคา {clueCost} เหรียญ · ซื้อได้ 1 ครั้งต่อรอบโหวต</p>
      {state.lastClueResult && (
        <div className="clue-result">
          <p className="settings-preview">
            {state.lastClueResult.emptyPaid ? "จ่ายแล้วแต่กองผู้ถูกโหวตเล็กเกินไป ไม่มีเบาะแส" : "เปิดการ์ดเบาะแสบนจอใหญ่"}
          </p>
          <div className="player-grid player-grid--compact">
            {cluePlayers.map((player) => player && <PlayerCard key={player.id} player={player} />)}
          </div>
        </div>
      )}
      {!state.lastClueResult && (
        <div className="button-row">
          <GameButton onClick={() => setState((current) => buyPostVoteClue(current, "voted"))}>ดูคนที่ถูกโหวต</GameButton>
          <GameButton onClick={() => setState((current) => buyPostVoteClue(current, "notVoted"))}>ดูคนที่ไม่ถูกโหวต</GameButton>
          <GameButton variant="paper" onClick={() => setState(skipPostVoteClue)}>ไม่ซื้อ</GameButton>
        </div>
      )}
      {state.lastClueResult && (
        <div className="button-row">
          <GameButton onClick={() => setState(advanceFromPostVoteClue)}>
            {state.lastVoteResult?.result.publicResult === "caughtSpy" ? "ทายสายลับคนที่สอง" : "กลับ Home"}
          </GameButton>
        </div>
      )}
    </section>
  );
}
