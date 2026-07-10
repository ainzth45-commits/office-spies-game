import { useEffect, useRef, useState } from "react";
import { playDrum, playFanfare, playLose } from "../../audio/sounds";
import { buzz } from "../../ui/haptics";
import { ThemedIcon } from "../../ui/components/ThemedIcon";
import { gameAssets } from "../../data/assets";
import { advanceFromVoteResult, finalizeVoteRound } from "../../state/actions";
import { useGameStore } from "../../state/useGameStore";
import { GameButton } from "../../ui/components/GameButton";

export function VoteResultScene() {
  const { state, setState } = useGameStore();
  const result = state.lastVoteResult?.result ?? null;
  const winner = result?.winnerId ? state.players.find((player) => player.id === result.winnerId) : null;
  // นับถอยหลังลุ้นก่อนเฉลย: null = ยังไม่เริ่ม · 3..2..1 · แล้วค่อย finalize
  const [countdown, setCountdown] = useState<number | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  const publicResult = result?.publicResult;
  useEffect(() => {
    if (!publicResult) return;
    if (publicResult === "caughtSpy") playFanfare();
    else playLose();
    buzz(publicResult === "caughtSpy" ? [80, 60, 80, 60, 200] : [250]); // ตราปั๊มกระแทก (บน iPad จะเงียบ — WebKit ไม่รองรับ vibrate)
  }, [publicResult]);

  function startReveal() {
    playDrum();
    buzz(60);
    setCountdown(3);
    [2, 1].forEach((value, index) => {
      timers.current.push(window.setTimeout(() => { playDrum(); buzz(60); setCountdown(value); }, (index + 1) * 900));
    });
    timers.current.push(
      window.setTimeout(() => {
        setCountdown(null);
        setState((current) => finalizeVoteRound(current));
      }, 3 * 900),
    );
  }

  if (!result) {
    if (countdown !== null) {
      return (
        <section className="scene-panel result-scene result-scene--countdown">
          <p className="eyebrow">🥁 เปิดหีบใน...</p>
          <div className="reveal-countdown" key={countdown}>{countdown}</div>
          <p className="scene-lead">ห้ามกะพริบตา!</p>
        </section>
      );
    }
    return (
      <section className="scene-panel">
        <img className="scene-hero" src={gameAssets.ballotBox} alt="" aria-hidden="true" onError={(event) => { event.currentTarget.style.display = "none"; }} />
        <h2>ถึงเวลาเฉลย!</h2>
        <p className="big-callout">ทุกคนพร้อมหรือยัง? เปิดแล้วไม่มีย้อน 🤫</p>
        <p className="scene-lead">จะประกาศแค่ "ผล" — ไม่มีใครรู้ว่าใครโหวตใคร กี่เสียง</p>
        <div className="button-row">
          <GameButton onClick={startReveal}>🥁 เปิดผลโหวต!</GameButton>
        </div>
      </section>
    );
  }

  const title =
    result.publicResult === "caughtSpy"
      ? "โดนจับแล้ว!"
      : result.publicResult === "caughtJester"
        ? "🤪 โดนหลอกเข้าให้!"
        : result.publicResult === "caughtInnocent"
          ? "โป๊ะแตก... จับผิดคน!"
          : "สายลับรอดไปได้!";

  return (
    <div className="reveal-stage">
    <section className="scene-panel result-scene">
      {/* ตราปั๊ม: จับสปาย=จับได้! · จับคนบ้า=ไม่มีตรา (โชว์การ์ดเปิดโปงแทน) · อื่นๆ=พลาด! */}
      {result.publicResult === "caughtSpy" ? (
        <img
          className="vote-stamp"
          src={gameAssets.voteWinStamp}
          alt=""
          onError={(event) => { event.currentTarget.style.display = "none"; }}
        />
      ) : result.publicResult === "caughtJester" ? null : (
        <img
          className="vote-stamp"
          src={gameAssets.voteLoseStamp}
          alt=""
          onError={(event) => { event.currentTarget.style.display = "none"; }}
        />
      )}
      <h2>{title}</h2>
      <p className="big-callout">
        {result.publicResult === "caughtSpy" && winner ? `${winner.name} คือสายลับตัวจริง! 🎉 จับได้แล้ว 1 คน — อีกคนยังลอยนวล ทีมได้สิทธิ์ชี้ตัวต่อทันที` : null}
        {/* คนบ้าชนะ: เปิดโปงชื่อได้เต็มที่ (เขาชนะแล้ว) */}
        {result.publicResult === "caughtJester" && winner ? `เสียงถึงเกณฑ์... แต่ ${winner.name} คือ "คนบ้า"! 🃏 หลอกให้ทุกคนโหวตตัวเองสำเร็จ — คนบ้าชนะเดี่ยว ทีมและสายลับแพ้ทั้งคู่!` : null}
        {/* จับผิดคน: ห้ามเผยชื่อ! ใครโดนเสียงถล่มเป็นความลับ — บอกแค่ว่าไม่ใช่สายลับ */}
        {result.publicResult === "caughtInnocent" ? "เสียงถึงเกณฑ์... แต่คนที่โดนไม่ใช่สายลับ 😅 ส่วนโดนใครน่ะเหรอ — ความลับ! ซุปเตรียมคืนเหรียญปลอบใจให้ทีม" : null}
        {result.publicResult === "failed" ? "เสียงแตกเกินไป จับใครไม่ได้ 🕶 เหรียญคืนที่ซุป — พรุ่งนี้เอาใหม่ อย่าให้มันรอดอีก" : null}
      </p>
      {(result.publicResult === "caughtSpy" || result.publicResult === "caughtJester") && winner && (
        <div className="end-scene__spy-cards end-scene__spy-cards--caught result-caught-card">
          <div className="end-spy-card">
            <img
              className="end-spy-card__photo"
              src={winner.imageUrl}
              alt={winner.name}
              onError={(event) => { event.currentTarget.style.visibility = "hidden"; }}
            />
            <b>{winner.name}</b>
            {result.publicResult === "caughtSpy" ? (
              <ThemedIcon className="end-spy-card__stamp-img" src={gameAssets.stampCaught} emoji="จับแล้ว" />
            ) : (
              <span className="end-spy-card__jester-tag">🤪 คนบ้า</span>
            )}
          </div>
        </div>
      )}
      {/* ข่าวกรองแถมฟรี — โผล่เมื่อกองคนถูกโหวตใหญ่พอ (≥ เกณฑ์ในตั้งค่า, ปกติ 4 คน) */}
      {result.spyPoolReveal && (
        <div className="intel-banner">
          <img
            className="intel-banner__icon"
            src={gameAssets.spyPoolBanner}
            alt=""
            aria-hidden="true"
            onError={(event) => { event.currentTarget.style.display = "none"; }}
          />
          <div className="intel-banner__text">
            <b>🗞️ ข่าวกรองแถมฟรี (รอบนี้มีคนถูกโหวตถึง {result.spyPoolReveal.total} คน)</b>
            <span>
              {result.spyPoolReveal.spies === 0
                ? "ในกองคนถูกโหวตทั้งหมด... ไม่มีสายลับเลยสักคน! พวกมันหลบเก่งจริงๆ"
                : `ในกองคนถูกโหวต มีสายลับปนอยู่ ${result.spyPoolReveal.spies} คน — เอาไปถกกันต่อได้เลย`}
            </span>
          </div>
        </div>
      )}
      <div className="button-row">
        <GameButton onClick={() => setState(advanceFromVoteResult)}>
          {result.publicResult === "caughtJester"
            ? "ไปดูผลตัดสิน 🏁"
            : result.publicResult !== "caughtSpy" && (state.manualDay.isFinalDay || state.manualDay.index >= state.config.maxGameDays)
              ? "หมดวันแล้ว... ไปดูผลตัดสิน 🏁"
              : result.publicResult === "caughtInnocent"
                ? "ไปต่อ ➜ รับเหรียญคืน"
                : "ไปต่อ ➜ ล่าเบาะแส"}
        </GameButton>
      </div>
    </section>
    </div>
  );
}
