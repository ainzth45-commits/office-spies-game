import { useEffect, useRef, useState } from "react";
import { playFanfare, playLose } from "../../audio/sounds";
import { gameAssets } from "../../data/assets";
import { finishGameToBoot, remainingQuizCount } from "../../state/actions";
import { useGameStore } from "../../state/useGameStore";
import { GameButton } from "../../ui/components/GameButton";
import { buzz } from "../../ui/haptics";
import { ThemedIcon } from "../../ui/components/ThemedIcon";

const CONFETTI_PIECES = Array.from({ length: 26 }, (_, index) => index);

export function EndGameScene() {
  const { state, setState } = useGameStore();
  // คลังโจทย์ต่ำกว่าเกณฑ์ตอนกดปิดคดี → เตือนซุปก่อน แล้วนับถอยหลัง 5 วิ ค่อยรีเซ็ตอัตโนมัติ
  const [resetCountdown, setResetCountdown] = useState<number | null>(null);
  useEffect(() => {
    if (resetCountdown === null) return;
    if (resetCountdown <= 0) {
      setState((current) => finishGameToBoot(current));
      return;
    }
    const timer = window.setTimeout(() => setResetCountdown(resetCountdown - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resetCountdown, setState]);

  function closeCase() {
    const remaining = remainingQuizCount();
    if (remaining < state.config.quizMinRemainingToStart) {
      setResetCountdown(5);
      return;
    }
    setState((current) => finishGameToBoot(current));
  }

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
      <section className="scene-panel result-scene end-scene">
        <div className="end-scene__cols">
          <div className="end-scene__left">
            <img
              className="end-scene__art"
              src={teamWon ? gameAssets.endTeamWin : gameAssets.endSpyWin}
              alt=""
              onError={(event) => { event.currentTarget.style.display = "none"; }}
            />
          </div>
          <div className="end-scene__right">
            <h2>{teamWon ? "🏆 ปิดคดีสำเร็จ! ทีมชนะ!" : "🕶 สายลับชนะ! รอดไปได้ทั้งเกม"}</h2>
            <p className="big-callout">
              {teamWon
                ? `จับสายลับได้ครบทั้งคู่ในวันเล่นที่ ${state.manualDay.index} — สมกับเป็นทีมนักสืบ!`
                : `แฝงตัวรอดมาได้ถึงวันเล่นที่ ${state.manualDay.index} ทีมจับไม่ได้ครบ...`}
            </p>
            {spies.length > 0 && (
              <>
                <p className="end-scene__spies">
                  🎭 เฉลย — สายลับรอบนี้คือ{teamWon ? " (โดนรวบเรียบร้อย)" : " (เนียนมากทั้งคู่ ปรบมือให้)"}
                </p>
                <div className={`end-scene__spy-cards${teamWon ? " end-scene__spy-cards--caught" : ""}`}>
                  {spies.map((spy) => (
                    <div key={spy.id} className="end-spy-card">
                      <img
                        className="end-spy-card__photo"
                        src={spy.imageUrl}
                        alt={spy.name}
                        onError={(event) => { event.currentTarget.style.visibility = "hidden"; }}
                      />
                      <b>{spy.name}</b>
                      {teamWon && <ThemedIcon className="end-spy-card__stamp-img" src={gameAssets.stampCaught} emoji="จับแล้ว" />}
                    </div>
                  ))}
                </div>
              </>
            )}
            {resetCountdown !== null && (
              <p className="end-scene__quiz-warn">
                ⚠️ คลังโจทย์เชาว์เหลือ {remainingQuizCount()} ข้อ (ต่ำกว่าเกณฑ์ {state.config.quizMinRemainingToStart}) —
                รอบหน้าอย่าลืมกด "รีเซตคลังโจทย์" ในตั้งค่าก่อนเริ่ม · รีเซ็ตเกมใน {resetCountdown} วิ...
              </p>
            )}
            <div className="button-row">
              {/* จบเกมทุกกรณี = ล้างกระดานกลับหน้าโลโก้ (เจ้านายเคาะ) — ไม่มีทางกลับ home ของเกมเก่า */}
              <GameButton disabled={resetCountdown !== null} onClick={closeCase}>
                {resetCountdown !== null ? `⏳ กำลังรีเซ็ต... ${resetCountdown}` : "🏁 ปิดคดี — กลับหน้าแรก"}
              </GameButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
