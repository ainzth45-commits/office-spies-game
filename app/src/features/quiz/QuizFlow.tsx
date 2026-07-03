import { useEffect, useState } from "react";
import { gachaIconAssets } from "../../data/assets";
import { quizBank } from "../../data/quizBank";
import { quizPenaltyAt, quizRewardAt } from "../../domain/quizEngine";
import type { QuizDifficulty } from "../../domain/types";
import { answerPendingQuiz, dismissQuizResult, startPendingQuiz } from "../../state/actions";
import { useGameStore } from "../../state/useGameStore";
import { GameButton } from "../../ui/components/GameButton";

const difficultyLabel: Record<QuizDifficulty, string> = {
  easy: "🟢 ง่าย",
  medium: "🟡 ปานกลาง",
  hard: "🔴 ยาก",
};

function formatClock(totalSec: number): string {
  const minutes = Math.floor(totalSec / 60);
  const seconds = Math.floor(totalSec % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function QuizFlow() {
  const { state, setState } = useGameStore();
  const [nowMs, setNowMs] = useState(() => Date.now());
  const pending = state.pendingQuiz;
  const result = state.pendingQuizResult;

  // นาฬิกาเดินหน้า — อิง startedAt ใน state (ออกหน้า/refresh เวลาก็เดินต่อ ไม่รีเซ็ต)
  useEffect(() => {
    if (!pending) return;
    const timer = window.setInterval(() => setNowMs(Date.now()), 500);
    return () => window.clearInterval(timer);
  }, [pending]);

  // หน้าเฉลยผล — ไม่เด้งกลับโฮมเอง ซุปกดเอง
  if (result) {
    const question = quizBank.find((candidate) => candidate.id === result.questionId);
    return (
      <section className="scene-panel quiz-scene">
        <p className="eyebrow">ผลโจทย์เชาว์</p>
        <h2 className={result.correct ? "quiz-verdict--correct" : "quiz-verdict--wrong"}>
          {result.correct ? "✅ ตอบถูก!" : "❌ ตอบผิด"}
        </h2>
        {question && <p className="scene-lead">{question.question}</p>}
        <p className="big-callout">{result.message}</p>
        {question?.explanation && <p className="quiz-explain">💡 {question.explanation}</p>}
        <div className="button-row">
          <GameButton onClick={() => setState((current) => dismissQuizResult(current))}>กลับ Home</GameButton>
        </div>
      </section>
    );
  }

  const question = quizBank.find((candidate) => candidate.id === pending?.questionId);
  if (!pending || !question) {
    return (
      <section className="scene-panel">
        <h2>ไม่มีโจทย์ที่กำลังเล่น</h2>
        <div className="button-row">
          <GameButton onClick={() => setState((current) => ({ ...current, phase: "home", pendingQuiz: null }))}>กลับ Home</GameButton>
        </div>
      </section>
    );
  }

  // หน้ากติกา — โผล่ก่อนคำถามเสมอ อ่านสบายๆ ไม่มีเวลากดดัน · เวลาเริ่มนับเมื่อกดปุ่ม
  if (!pending.startedAt) {
    const config = state.config;
    return (
      <section className="scene-panel quiz-scene quiz-intro">
        <p className="eyebrow">🎁 ได้โจทย์เชาว์ฟรีจากกาชา!</p>
        <div className="quiz-intro__head">
          <img
            className="quiz-intro__icon"
            src={gachaIconAssets.grantQuiz}
            alt=""
            aria-hidden="true"
            onError={(event) => { event.currentTarget.style.display = "none"; }}
          />
          <h2>กติกาโจทย์เชาว์</h2>
        </div>
        <ul className="quiz-rules">
          <li>❓ มีคำตอบ <b>2 ตัวเลือก (A/B)</b> — เลือกตอบได้ครั้งเดียว</li>
          <li>⏱ เวลาเริ่มนับทันทีที่กดปุ่มด้านล่าง <b>ยิ่งตอบไว เหรียญยิ่งเยอะ</b></li>
          <li>✅ ตอบถูก: เริ่มที่ <b>{config.quizCorrectReward} เหรียญ</b> ลดลง 1 ทุก {config.quizRewardDecaySec} วิ (ต่ำสุด {config.quizRewardMin})</li>
          <li>❌ ตอบผิด: ทุกคนคืน <b>{config.quizWrongPenaltyPerPlayer} เหรียญ</b> ให้ซุป</li>
          <li>🚨 ช้าเกิน {config.quizPenaltyTierSec} วิ แล้วตอบผิด: โทษเพิ่มเป็น <b>{config.quizWrongPenaltyLate} เหรียญ</b></li>
        </ul>
        <div className="button-row">
          <GameButton onClick={() => setState((current) => startPendingQuiz(current, Date.now()))}>
            พร้อมแล้ว! ไปที่คำถาม →
          </GameButton>
        </div>
      </section>
    );
  }

  const elapsedSec = Math.max(0, (nowMs - Date.parse(pending.startedAt)) / 1000);
  const reward = quizRewardAt(elapsedSec, state.config);
  const late = elapsedSec > state.config.quizPenaltyTierSec;
  const penalty = quizPenaltyAt(elapsedSec, state.config);

  return (
    <section className="scene-panel quiz-scene">
      <p className="eyebrow">โจทย์ฟรีจากกาชา · {question.category} · {difficultyLabel[question.difficulty]}</p>
      <div className={`quiz-timer${late ? " quiz-timer--late" : ""}`}>
        <span className="quiz-timer__clock">⏱ {formatClock(elapsedSec)}</span>
        <span className="quiz-timer__reward">
          {late ? `⚠️ โซนโทษแรง — ตอบผิดทุกคนเสีย ${penalty}` : `ตอบถูกตอนนี้ได้ ${reward} เหรียญ`}
        </span>
      </div>
      <p className="big-callout quiz-question">{question.question}</p>
      <div className="quiz-choices">
        <GameButton onClick={() => setState((current) => answerPendingQuiz(current, "A", Date.now()))}>A · {question.choiceA}</GameButton>
        <GameButton onClick={() => setState((current) => answerPendingQuiz(current, "B", Date.now()))}>B · {question.choiceB}</GameButton>
      </div>
      <p className="quiz-hint">ยิ่งตอบช้า เหรียญยิ่งลด (ต่ำสุด {state.config.quizRewardMin}) · เกิน {state.config.quizPenaltyTierSec} วิ ตอบผิดเสีย {state.config.quizWrongPenaltyLate}</p>
    </section>
  );
}
