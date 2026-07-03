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
  // ขนาดกองโชว์ก่อนจ่าย — จะได้ไม่มีใครเสียเหรียญฟรีเพราะกองเล็กเกินเกณฑ์
  const votedPoolSize = state.lastVoteResult?.result.votedPool.length ?? 0;
  const notVotedPoolSize = state.lastVoteResult?.result.notVotedPool.length ?? 0;
  const votedTooSmall = votedPoolSize < state.config.votedClueMinVoted;

  return (
    <section className="scene-panel clue-scene">
      <img className="scene-hero" src={gameAssets.magnifier} alt="" aria-hidden="true" onError={(event) => { event.currentTarget.style.display = "none"; }} />
      <h2>🔎 แอบซื้อข่าวกรอง?</h2>
      <p className="big-callout">สายข่าวเสนอขายเบาะแส {clueCost} เหรียญ — รอบนี้ซื้อได้ครั้งเดียว เลือกให้ดี</p>
      {state.lastClueResult && (
        <div className="clue-result">
          <p className="settings-preview">
            {state.lastClueResult.emptyPaid ? "สายข่าวส่ายหน้า... กองนี้คนน้อยเกินไป ไม่มีอะไรให้เปิด 😔 (เหรียญไม่คืนนะ)" : "สายข่าวเปิดแฟ้มลับ — คนกลุ่มนี้แหละที่น่าจับตา 👇"}
          </p>
          <div className="player-grid player-grid--compact">
            {cluePlayers.map((player) => player && <PlayerCard key={player.id} player={player} />)}
          </div>
        </div>
      )}
      {!state.lastClueResult && (
        <>
          {votedTooSmall && (
            <p className="scene-lead">กองคนถูกโหวตมีแค่ {votedPoolSize} คน (ต้องมีอย่างน้อย {state.config.votedClueMinVoted}) — สายข่าวไม่ขายกองนี้</p>
          )}
          <div className="button-row">
            <GameButton disabled={votedTooSmall} onClick={() => setState((current) => buyPostVoteClue(current, "voted"))}>
              📂 กองคนถูกโหวต ({votedPoolSize} คน)
            </GameButton>
            <GameButton disabled={notVotedPoolSize === 0} onClick={() => setState((current) => buyPostVoteClue(current, "notVoted"))}>
              📁 กองคนไม่ถูกโหวต ({notVotedPoolSize} คน)
            </GameButton>
            <GameButton variant="paper" onClick={() => setState(skipPostVoteClue)}>ไม่ซื้อ เก็บเหรียญไว้</GameButton>
          </div>
        </>
      )}
      {state.lastClueResult && (
        <div className="button-row">
          <GameButton onClick={() => setState(advanceFromPostVoteClue)}>
            {state.lastVoteResult?.result.publicResult === "caughtSpy" ? "ไปต่อ ➜ ชี้ตัวสายลับคนที่สอง!" : "จบรอบนี้ กลับ Home"}
          </GameButton>
        </div>
      )}
    </section>
  );
}
