import { useEffect, useState } from "react";
import { gameAssets } from "../../data/assets";
import { quizBank } from "../../data/quizBank";
import { quizPenaltyAt, quizRewardAt } from "../../domain/quizEngine";
import type { QuizDifficulty, QuizQuestion } from "../../domain/types";
import { useGameStore } from "../../state/useGameStore";
import { GameButton } from "../../ui/components/GameButton";
import { ThemedIcon } from "../../ui/components/ThemedIcon";

// โหมดฝึกเชาว์ — สนามซ้อมล้วนๆ ไม่แตะระบบเกมเลย (ไม่บันทึกประวัติ ไม่แจกเหรียญ เข้าซ้ำได้เรื่อยๆ)
// state ทั้งหมดอยู่ในคอมโพเนนต์ · จับเวลา "เสมือนจริง" ใช้สูตรเดียวกับโจทย์จริงเป๊ะ

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

type Attempt = { question: QuizQuestion; startedAtMs: number };
type Verdict = { question: QuizQuestion; correct: boolean; elapsedSec: number };

export function QuizPracticeFlow() {
  const { state } = useGameStore();
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!attempt) return;
    const timer = window.setInterval(() => setNowMs(Date.now()), 500);
    return () => window.clearInterval(timer);
  }, [attempt]);

  function open(question: QuizQuestion) {
    setVerdict(null);
    const startedAtMs = Date.now();
    setNowMs(startedAtMs);
    setAttempt({ question, startedAtMs });
  }

  function openRandom() {
    open(quizBank[Math.floor(Math.random() * quizBank.length)]);
  }

  // ข้อถัดไปตามลำดับ — ข้อสุดท้ายวนกลับข้อ 1
  function openNext(current: QuizQuestion) {
    const index = quizBank.findIndex((question) => question.id === current.id);
    open(quizBank[(index + 1) % quizBank.length]);
  }

  function answer(choice: "A" | "B") {
    if (!attempt) return;
    const elapsedSec = Math.max(0, (Date.now() - attempt.startedAtMs) / 1000);
    setVerdict({ question: attempt.question, correct: attempt.question.answer === choice, elapsedSec });
    setAttempt(null);
  }

  // หน้าเฉลย (ผลสมมติ — บอกชัดว่าไม่มีผลจริง)
  if (verdict) {
    const { question, correct, elapsedSec } = verdict;
    const reward = quizRewardAt(elapsedSec, state.config);
    const penalty = quizPenaltyAt(elapsedSec, state.config);
    const correctText = question.answer === "A" ? question.choiceA : question.choiceB;
    return (
      <section className="scene-panel quiz-scene">
        <p className="eyebrow">🏋️ โหมดฝึกเชาว์ · ข้อ {Number(question.id.slice(1))} · ไม่มีผลกับเกมจริง</p>
        <h2 className={correct ? "quiz-verdict--correct" : "quiz-verdict--wrong"}>
          {correct ? "✅ ตอบถูก!" : "❌ ตอบผิด"}
        </h2>
        <p className="scene-lead">{question.question}</p>
        <p className="big-callout">
          เฉลย: {question.answer} · {correctText}
          <br />
          <small className="practice-sim">
            ถ้าเป็นเกมจริง: {correct ? `ได้ ${reward} เหรียญ` : `ทุกคนเสีย ${penalty} เหรียญ`} (ใช้เวลา {Math.round(elapsedSec)} วิ)
          </small>
        </p>
        {question.explanation && <p className="quiz-explain">💡 {question.explanation}</p>}
        <div className="button-row">
          <GameButton variant="paper" onClick={() => setVerdict(null)}>← กลับ</GameButton>
          <GameButton variant="paper" onClick={openRandom}>🎲 สุ่ม</GameButton>
          <GameButton onClick={() => openNext(question)}>ต่อไป →</GameButton>
        </div>
      </section>
    );
  }

  // หน้าโจทย์ — timer เสมือนจริง สูตรเดียวกับเกม
  if (attempt) {
    const { question } = attempt;
    const elapsedSec = Math.max(0, (nowMs - attempt.startedAtMs) / 1000);
    const reward = quizRewardAt(elapsedSec, state.config);
    const late = elapsedSec > state.config.quizPenaltyTierSec;
    const penalty = quizPenaltyAt(elapsedSec, state.config);
    return (
      <section className="scene-panel quiz-scene">
        <p className="eyebrow">
          🏋️ โหมดฝึกเชาว์ · ข้อ {Number(question.id.slice(1))} · {question.category} · {difficultyLabel[question.difficulty]}
        </p>
        <div className={`quiz-timer${late ? " quiz-timer--late" : ""}`}>
          <span className="quiz-timer__clock"><ThemedIcon className="chip-icon" src={gameAssets.iconTimer} emoji="⏱" /> {formatClock(elapsedSec)}</span>
          <span className="quiz-timer__reward">
            {late ? `⚠️ โซนโทษแรง — ตอบผิดทุกคนเสีย ${penalty}` : `ตอบถูกตอนนี้ได้ ${reward} เหรียญ`}
          </span>
        </div>
        <p className="big-callout quiz-question">{question.question}</p>
        <div className="quiz-choices">
          <GameButton onClick={() => answer("A")}>A · {question.choiceA}</GameButton>
          <GameButton onClick={() => answer("B")}>B · {question.choiceB}</GameButton>
        </div>
        <div className="button-row">
          <GameButton variant="paper" onClick={() => setAttempt(null)}>← กลับคลังโจทย์ (ไม่ตอบ)</GameButton>
        </div>
      </section>
    );
  }

  // คลังโจทย์ — กล่องหมายเลขทุกข้อ ไม่มีมาร์คว่าเล่นแล้ว เข้าซ้ำได้
  return (
    <section className="scene-panel quiz-practice">
      <h2>🏋️ ฝึกเชาว์</h2>
      <p className="scene-lead">
        สนามซ้อม {quizBank.length} ข้อ — กดเลขเพื่อเปิดโจทย์ จับเวลาเหมือนจริงแต่ไม่มีผลกับเกม เข้าซ้ำกี่รอบก็ได้
      </p>
      <div className="button-row practice-actions">
        <GameButton onClick={openRandom}>🎲 สุ่มคำถาม</GameButton>
      </div>
      <div className="practice-grid">
        {quizBank.map((question, index) => (
          <button key={question.id} type="button" className="practice-cell" onClick={() => open(question)}>
            {index + 1}
          </button>
        ))}
      </div>
    </section>
  );
}
