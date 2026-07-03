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
  const nextLabel = state.lastVoteResult?.result.publicResult === "caughtSpy" ? "ไปต่อ ➜ ชี้ตัวสายลับคนที่สอง!" : "จบรอบนี้ กลับ Home";

  // จ่ายแล้วแต่กองเล็กเกิน — โดนสายข่าวแกล้ง (กับดักตามดีไซน์: ไม่บอกล่วงหน้าว่ากองมีกี่คน)
  if (state.lastClueResult?.emptyPaid) {
    return (
      <section className="scene-panel clue-scene clue-scene--mock">
        <h2>เก็บเงินแล้ว... แต่แฟ้มว่างเปล่า!</h2>
        <div className="clue-mock">
          <img
            src={gameAssets.clueNoInfo}
            alt=""
            aria-hidden="true"
            onError={(event) => { event.currentTarget.style.display = "none"; }}
          />
        </div>
        <p className="big-callout">
          สายข่าวยักไหล่: "กองคนถูกโหวตรอบนี้เล็กเกินไป ไม่มีอะไรให้ขาย... แต่เหรียญไม่คืนนะจ๊ะ 😝"
        </p>
        <div className="button-row">
          <GameButton onClick={() => setState(advanceFromPostVoteClue)}>{nextLabel}</GameButton>
        </div>
      </section>
    );
  }

  // เปิดแฟ้มสำเร็จ — โชว์การ์ดคนในกองใหญ่ๆ กลางจอ
  if (state.lastClueResult) {
    return (
      <section className="scene-panel clue-scene">
        <h2>🔎 สายข่าวเปิดแฟ้มลับ</h2>
        <p className="big-callout">
          {state.lastClueResult.option === "voted"
            ? "สุ่มมาจากกองคนถูกโหวต 1 คน — คนนี้มีคนสงสัยอยู่นะ"
            : "เปิดหน้าคนจากกองที่ไม่ถูกโหวต — พวกที่ยังลอยตัวอยู่เหนือความสงสัย"}
        </p>
        <div className="clue-cards">
          {cluePlayers.map((player) => player && (
            <div key={player.id} className="clue-card">
              <img
                className="clue-card__photo"
                src={player.imageUrl}
                alt={player.name}
                onError={(event) => { event.currentTarget.style.visibility = "hidden"; }}
              />
              <b>{player.name}</b>
              <span>{player.code}</span>
            </div>
          ))}
        </div>
        <div className="button-row">
          <GameButton onClick={() => setState(advanceFromPostVoteClue)}>{nextLabel}</GameButton>
        </div>
      </section>
    );
  }

  return (
    <section className="scene-panel clue-scene">
      <img className="scene-hero" src={gameAssets.magnifier} alt="" aria-hidden="true" onError={(event) => { event.currentTarget.style.display = "none"; }} />
      <h2>🔎 แอบซื้อข่าวกรอง?</h2>
      <p className="big-callout">สายข่าวเสนอขายเบาะแส {clueCost} เหรียญ — รอบนี้ซื้อได้ครั้งเดียว เลือกให้ดี</p>
      <p className="scene-lead">⚠️ สายข่าวไม่บอกล่วงหน้าว่าแต่ละกองมีกี่คน... เสี่ยงเอาเอง จ่ายแล้วไม่มีคืน</p>
      <div className="button-row">
        <GameButton variant="paper" onClick={() => setState(skipPostVoteClue)}>ไม่ซื้อ เก็บเหรียญไว้</GameButton>
        <GameButton onClick={() => setState((current) => buyPostVoteClue(current, "voted"))}>📂 เปิดกองคนถูกโหวต</GameButton>
        <GameButton onClick={() => setState((current) => buyPostVoteClue(current, "notVoted"))}>📁 เปิดกองคนไม่ถูกโหวต</GameButton>
      </div>
    </section>
  );
}
