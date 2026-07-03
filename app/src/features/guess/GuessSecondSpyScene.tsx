import { useEffect, useRef, useState } from "react";
import { playDrum, playLose } from "../../audio/sounds";
import type { PlayerId } from "../../domain/types";
import { acknowledgeWrongGuess, resolveSecondSpyGuess } from "../../state/actions";
import { useGameStore } from "../../state/useGameStore";
import { GameButton } from "../../ui/components/GameButton";
import { PlayerCard } from "../../ui/components/PlayerCard";
import { buzz } from "../../ui/haptics";

export function GuessSecondSpyScene() {
  const { state, setState } = useGameStore();
  const [guessId, setGuessId] = useState<PlayerId | null>(null);
  // นับถอยหลังลุ้นก่อนเฉลยชี้ตัว — วินาทีชี้ชะตาเกม
  const [countdown, setCountdown] = useState<number | null>(null);
  const timers = useRef<number[]>([]);
  const wrongGuess = state.lastGuessResult && !state.lastGuessResult.correct ? state.lastGuessResult : null;
  const wrongPlayer = wrongGuess ? state.players.find((player) => player.id === wrongGuess.guessedId) : null;

  useEffect(() => () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  useEffect(() => {
    if (wrongGuess) {
      playLose();
      buzz([120, 80, 200]);
    }
  }, [wrongGuess]);

  // จอเฉลย: ชี้ผิด (ชี้ถูก = เด้งไปฉากจบเลย ไม่ผ่านตรงนี้)
  if (wrongGuess) {
    return (
      <section className="scene-panel result-scene">
        <h2 className="quiz-verdict--wrong">❌ ชี้ผิดตัว!</h2>
        <p className="big-callout">
          {wrongPlayer?.name ?? "คนที่ชี้"} ไม่ใช่สายลับ... สายลับตัวจริงยังนั่งยิ้มอยู่ในทีม 😏
        </p>
        <p className="scene-lead">โอกาสนี้หลุดมือไปแล้ว — รอบใหม่สุ่มบทบาทกันใหม่ ล่ากันต่อ!</p>
        <div className="button-row">
          <GameButton onClick={() => setState((current) => acknowledgeWrongGuess(current))}>
            🎲 สุ่มบทบาทรอบใหม่ ➜
          </GameButton>
        </div>
      </section>
    );
  }

  if (countdown !== null) {
    return (
      <section className="scene-panel result-scene result-scene--countdown">
        <p className="eyebrow">🥁 คำตอบของทีมคือ...</p>
        <div className="reveal-countdown" key={countdown}>{countdown}</div>
        <p className="scene-lead">ถูกหรือผิด รู้กันเดี๋ยวนี้!</p>
      </section>
    );
  }

  function commitGuess() {
    if (!guessId) return;
    const chosen = guessId;
    playDrum();
    buzz(60);
    setCountdown(3);
    [2, 1].forEach((value, index) => {
      timers.current.push(window.setTimeout(() => { playDrum(); buzz(60); setCountdown(value); }, (index + 1) * 900));
    });
    timers.current.push(
      window.setTimeout(() => {
        setCountdown(null);
        setState((current) => resolveSecondSpyGuess(current, chosen));
      }, 3 * 900),
    );
  }

  const guessed = state.players.find((player) => player.id === guessId) ?? null;

  return (
    <section className="scene-panel">
      <h2>🎯 ชี้ตัวสายลับคนที่สอง!</h2>
      <p className="big-callout">โอกาสเดียวเท่านั้น — ปรึกษากันให้ดี ชี้ถูก = ทีมชนะทันที ชี้ผิด = มันรอดไปอีกวัน</p>
      <div className="player-grid player-grid--compact">
        {state.players.map((player) => (
          <PlayerCard key={player.id} player={player} selected={guessId === player.id} onClick={() => setGuessId(player.id)} />
        ))}
      </div>
      <div className="button-row">
        <GameButton disabled={!guessId} onClick={commitGuess}>
          {guessed ? `🫵 ทีมฟันธง: ${guessed.name} คือสายลับ!` : "แตะเลือกผู้ต้องสงสัยก่อน"}
        </GameButton>
      </div>
    </section>
  );
}
