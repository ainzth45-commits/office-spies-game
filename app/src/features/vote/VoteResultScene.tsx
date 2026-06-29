import { useEffect } from "react";
import { playDrum, playFanfare, playLose } from "../../audio/sounds";
import { gameAssets } from "../../data/assets";
import { advanceFromVoteResult, finalizeVoteRound } from "../../state/actions";
import { useGameStore } from "../../state/useGameStore";
import { GameButton } from "../../ui/components/GameButton";

export function VoteResultScene() {
  const { state, setState } = useGameStore();
  const result = state.lastVoteResult?.result ?? null;
  const winner = result?.winnerId ? state.players.find((player) => player.id === result.winnerId) : null;

  const publicResult = result?.publicResult;
  useEffect(() => {
    if (!publicResult) return;
    if (publicResult === "caughtSpy") playFanfare();
    else playLose();
  }, [publicResult]);

  if (!result) {
    return (
      <section className="scene-panel">
        <h2>ถึงเวลาเฉลย!</h2>
        <p className="big-callout">ปิดปากเงียบ 🤫 ระบบนับคะแนนลับให้แล้ว — จะประกาศแค่ "ผล" ไม่บอกจำนวนเสียงของใคร พร้อมรวมตัวหน้าจอใหญ่แล้วกดเปิดผลเลย</p>
        <div className="button-row">
          <GameButton onClick={() => { playDrum(); setState((current) => finalizeVoteRound(current)); }}>เปิดผลโหวต</GameButton>
        </div>
      </section>
    );
  }

  const title =
    result.publicResult === "caughtSpy"
      ? "จับสปายได้!"
      : result.publicResult === "caughtInnocent"
        ? "จับผิดคน!"
        : "โหวตพลาด!";

  return (
    <div className="reveal-stage">
    <section className="scene-panel result-scene">
      <img
        className="vote-stamp"
        src={result.publicResult === "caughtSpy" ? gameAssets.voteWinStamp : gameAssets.voteLoseStamp}
        alt=""
        onError={(event) => { event.currentTarget.style.display = "none"; }}
      />
      <h2>{title}</h2>
      <p className="big-callout">
        {result.publicResult === "caughtSpy" && winner ? `${winner.name} คือสายลับตัวจริง! 🎉 ทีมได้สิทธิ์ทายสายลับคนที่สองต่อเลย` : null}
        {result.publicResult === "caughtInnocent" && winner ? `${winner.name} เป็นพนักงานบริสุทธิ์ 😅 เหรียญที่จ่ายไปเตรียมคืนที่ซุป` : null}
        {result.publicResult === "failed" ? "ครั้งนี้ยังจับใครไม่ได้! เหรียญที่ลงไปได้คืนที่ซุป ไว้ตั้งหลักลองใหม่วันหลังนะ 🔍" : null}
      </p>
      {result.spyPoolReveal && (
        <div
          className="spy-pool-banner"
          style={{ backgroundImage: `url(${gameAssets.spyPoolBanner})` }}
        >
          <p className="spy-pool-banner__text">
            🔎 เบาะแสฟรี: กองผู้ถูกโหวต {result.spyPoolReveal.total} คน มีสายลับซ่อนอยู่ {result.spyPoolReveal.spies} คน — เอาไปคุยกันต่อได้เลย
          </p>
        </div>
      )}
      <div className="button-row">
        <GameButton onClick={() => setState(advanceFromVoteResult)}>
          {result.publicResult === "caughtInnocent" ? "ไปต่อ: คืนเหรียญที่ซุป" : "ไปต่อ: ซื้อเบาะแส"}
        </GameButton>
      </div>
    </section>
    </div>
  );
}
