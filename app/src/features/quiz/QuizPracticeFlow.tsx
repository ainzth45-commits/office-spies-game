import { useEffect, useState } from "react";
import { gameAssets } from "../../data/assets";
import { quizBank } from "../../data/quizBank";
import { quizPenaltyAt, quizRewardAt } from "../../domain/quizEngine";
import type { QuizDifficulty, QuizQuestion } from "../../domain/types";
import { clearCustomQuiz, type CustomQuizData, getCustomQuiz, saveCustomQuiz } from "../../state/customQuiz";
import { getPracticeAnsweredIds, markPracticeAnswered, resetPracticeAnswered } from "../../state/practiceHistory";
import { useGameStore } from "../../state/useGameStore";
import { GameButton } from "../../ui/components/GameButton";
import { ThemedIcon } from "../../ui/components/ThemedIcon";

// โหมดฝึกเชาว์ — สนามซ้อมล้วนๆ ไม่แตะระบบเกมเลย (ไม่บันทึกประวัติ ไม่แจกเหรียญ เข้าซ้ำได้เรื่อยๆ)
// รองรับโจทย์สร้างเองที่มี 2–4 ตัวเลือก (โจทย์คลังจริงยังเป็น 2 ตัวเลือกเสมอ)

const difficultyLabel: Record<QuizDifficulty, string> = {
  easy: "🟢 ง่าย",
  medium: "🟡 ปานกลาง",
  hard: "🔴 ยาก",
};

const CHOICE_LETTERS = ["A", "B", "C", "D"];

function formatClock(totalSec: number): string {
  const minutes = Math.floor(totalSec / 60);
  const seconds = Math.floor(totalSec % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// รูปแบบกลางที่หน้าโจทย์/เฉลยใช้ — มีตัวเลือกกี่ข้อก็ได้
interface PracticeQuestion {
  id: string;
  category: string;
  difficulty: QuizDifficulty;
  question: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
}

function bankToPractice(q: QuizQuestion): PracticeQuestion {
  return { id: q.id, category: q.category, difficulty: q.difficulty, question: q.question, choices: [q.choiceA, q.choiceB], answerIndex: q.answer === "A" ? 0 : 1, explanation: q.explanation };
}

function customToPractice(d: CustomQuizData): PracticeQuestion {
  return { id: "Q000", category: "โจทย์ที่สร้างเอง", difficulty: "medium", question: d.question, choices: d.choices, answerIndex: d.answerIndex, explanation: d.explanation };
}

type Attempt = { question: PracticeQuestion; startedAtMs: number };
type Verdict = { question: PracticeQuestion; picked: number; elapsedSec: number };

export function QuizPracticeFlow() {
  const { state } = useGameStore();
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  // ข้อที่ตอบไปแล้วในโหมดฝึก (แยก localStorage ไม่ปนเกมจริง) + สวิตช์ซ่อน/แสดง
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(() => new Set(getPracticeAnsweredIds()));
  const [hideAnswered, setHideAnswered] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  // โจทย์สร้างเอง (ข้อ 0) — เก็บใน localStorage
  const [customQuestion, setCustomQuestion] = useState<CustomQuizData | null>(() => getCustomQuiz());
  const [creating, setCreating] = useState(false);
  const [formQ, setFormQ] = useState("");
  const [formChoices, setFormChoices] = useState<string[]>(["", "", "", ""]);
  const [choiceCount, setChoiceCount] = useState(2);
  const [formAnswerIndex, setFormAnswerIndex] = useState(0);
  const [formExplain, setFormExplain] = useState("");

  useEffect(() => {
    if (!attempt) return;
    const timer = window.setInterval(() => setNowMs(Date.now()), 500);
    return () => window.clearInterval(timer);
  }, [attempt]);

  function open(question: PracticeQuestion) {
    setVerdict(null);
    const startedAtMs = Date.now();
    setNowMs(startedAtMs);
    setAttempt({ question, startedAtMs });
  }

  function openRandom() {
    open(bankToPractice(quizBank[Math.floor(Math.random() * quizBank.length)]));
  }

  // ข้อถัดไปตามลำดับ (เฉพาะคลังจริง) — ข้อ 0/ข้อสุดท้ายวนกลับข้อ 1
  function openNext(current: PracticeQuestion) {
    const index = quizBank.findIndex((question) => question.id === current.id);
    open(bankToPractice(quizBank[(index + 1) % quizBank.length]));
  }

  function answer(picked: number) {
    if (!attempt) return;
    const elapsedSec = Math.max(0, (Date.now() - attempt.startedAtMs) / 1000);
    // มาร์คว่าตอบแล้ว — เฉพาะโจทย์คลังจริง ไม่นับข้อ 0 ที่สร้างเอง
    if (attempt.question.id !== "Q000") {
      markPracticeAnswered(attempt.question.id);
      setAnsweredIds((current) => new Set(current).add(attempt.question.id));
    }
    setVerdict({ question: attempt.question, picked, elapsedSec });
    setAttempt(null);
  }

  function resetAnswered() {
    resetPracticeAnswered();
    setAnsweredIds(new Set());
    setHideAnswered(false);
    setConfirmReset(false);
  }

  function startCreate() {
    // ถ้ามีข้อ 0 อยู่แล้ว เติมค่าเดิมให้แก้ต่อ ไม่งั้นเริ่มฟอร์มเปล่า
    if (customQuestion) {
      setFormQ(customQuestion.question);
      setFormChoices([customQuestion.choices[0] ?? "", customQuestion.choices[1] ?? "", customQuestion.choices[2] ?? "", customQuestion.choices[3] ?? ""]);
      setChoiceCount(customQuestion.choices.length);
      setFormAnswerIndex(customQuestion.answerIndex);
      setFormExplain(customQuestion.explanation);
    } else {
      setFormQ("");
      setFormChoices(["", "", "", ""]);
      setChoiceCount(2);
      setFormAnswerIndex(0);
      setFormExplain("");
    }
    setCreating(true);
  }

  function saveCustom() {
    const choices = formChoices.slice(0, choiceCount).map((c) => c.trim());
    if (formQ.trim() === "" || choices.some((c) => c === "")) return;
    const answerIndex = Math.min(formAnswerIndex, choiceCount - 1);
    saveCustomQuiz({ question: formQ.trim(), choices, answerIndex, explanation: formExplain.trim() });
    setCustomQuestion(getCustomQuiz());
    setCreating(false);
  }

  function resetCustom() {
    clearCustomQuiz();
    setCustomQuestion(null);
    setCreating(false);
  }

  // หน้าสร้างโจทย์เอง (ข้อ 0)
  if (creating) {
    const filled = formChoices.slice(0, choiceCount).every((c) => c.trim() !== "");
    const canSave = formQ.trim() !== "" && filled;
    return (
      <section className="scene-panel quiz-practice custom-quiz-form">
        <h2>✏️ สร้างโจทย์เอง (ข้อ 0)</h2>
        <p className="scene-lead">สร้างได้ครั้งละ 1 ข้อ · เก็บในเครื่องนี้เท่านั้น ไม่เข้าเกมจริง · อยากได้ข้อใหม่ให้กดรีเซต</p>
        <label className="topic-field"><span>คำถาม</span>
          <input value={formQ} onChange={(e) => setFormQ(e.target.value)} placeholder="พิมพ์คำถาม" maxLength={200} />
        </label>
        <div className="custom-answer-row">
          <span>จำนวนตัวเลือก:</span>
          {[2, 3, 4].map((n) => (
            <GameButton
              key={n}
              variant={choiceCount === n ? undefined : "paper"}
              onClick={() => { setChoiceCount(n); if (formAnswerIndex >= n) setFormAnswerIndex(0); }}
            >
              {n} ข้อ
            </GameButton>
          ))}
        </div>
        {formChoices.slice(0, choiceCount).map((value, index) => (
          <label key={index} className="topic-field">
            <span>ตัวเลือก {CHOICE_LETTERS[index]}{formAnswerIndex === index ? " ✅ (เฉลย)" : ""}</span>
            <input
              value={value}
              onChange={(e) => setFormChoices((prev) => prev.map((c, i) => (i === index ? e.target.value : c)))}
              placeholder={`คำตอบ ${CHOICE_LETTERS[index]}`}
              maxLength={120}
            />
          </label>
        ))}
        <div className="custom-answer-row">
          <span>เฉลยคือข้อไหน?</span>
          {Array.from({ length: choiceCount }, (_, i) => (
            <GameButton key={i} variant={formAnswerIndex === i ? undefined : "paper"} onClick={() => setFormAnswerIndex(i)}>
              {CHOICE_LETTERS[i]} ถูก
            </GameButton>
          ))}
        </div>
        <label className="topic-field"><span>คำอธิบายเฉลย (ไม่บังคับ)</span>
          <input value={formExplain} onChange={(e) => setFormExplain(e.target.value)} placeholder="ทำไมข้อนี้ถึงถูก" maxLength={200} />
        </label>
        <div className="button-row">
          <GameButton variant="paper" onClick={() => setCreating(false)}>ยกเลิก</GameButton>
          <GameButton disabled={!canSave} onClick={saveCustom}>💾 บันทึกข้อ 0</GameButton>
        </div>
      </section>
    );
  }

  // หน้าเฉลย (ผลสมมติ — บอกชัดว่าไม่มีผลจริง)
  if (verdict) {
    const { question, picked, elapsedSec } = verdict;
    const correct = picked === question.answerIndex;
    const reward = quizRewardAt(elapsedSec, state.config);
    const penalty = quizPenaltyAt(elapsedSec, state.config);
    return (
      <section className="scene-panel quiz-scene">
        <p className="eyebrow">🏋️ โหมดฝึกเชาว์ · ข้อ {Number(question.id.slice(1))} · ไม่มีผลกับเกมจริง</p>
        <h2 className={correct ? "quiz-verdict--correct" : "quiz-verdict--wrong"}>
          {correct ? "✅ ตอบถูก!" : "❌ ตอบผิด"}
        </h2>
        <p className="scene-lead">{question.question}</p>
        <p className="big-callout">
          เฉลย: {CHOICE_LETTERS[question.answerIndex]} · {question.choices[question.answerIndex]}
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
        <div className={`quiz-choices${question.choices.length > 2 ? " quiz-choices--multi" : ""}`}>
          {question.choices.map((text, index) => (
            <GameButton key={index} onClick={() => answer(index)}>{CHOICE_LETTERS[index]} · {text}</GameButton>
          ))}
        </div>
        <div className="button-row">
          <GameButton variant="paper" onClick={() => setAttempt(null)}>← กลับคลังโจทย์ (ไม่ตอบ)</GameButton>
        </div>
      </section>
    );
  }

  // คลังโจทย์ — กล่องหมายเลขทุกข้อ · มาร์คข้อที่ตอบแล้ว + ซ่อน/แสดง/รีเซตได้
  const answeredCount = answeredIds.size;
  const visibleQuestions = quizBank
    .map((question, index) => ({ question, number: index + 1 }))
    .filter(({ question }) => !(hideAnswered && answeredIds.has(question.id)));
  const allHidden = hideAnswered && visibleQuestions.length === 0;
  return (
    <section className="scene-panel quiz-practice">
      <h2>🏋️ ฝึกเชาว์</h2>
      <p className="scene-lead">
        สนามซ้อม {quizBank.length} ข้อ — กดเลขเพื่อเปิดโจทย์ จับเวลาเหมือนจริงแต่ไม่มีผลกับเกม เข้าซ้ำกี่รอบก็ได้
        {answeredCount > 0 && <> · ตอบไปแล้ว <b>{answeredCount}</b> ข้อ (เหลือ {quizBank.length - answeredCount})</>}
      </p>
      {/* โจทย์สร้างเอง (ข้อ 0) — 2–4 ตัวเลือก เก็บในเครื่อง ไม่เข้าเกมจริง */}
      <div className="button-row custom-quiz-bar">
        {customQuestion ? (
          <>
            <GameButton onClick={() => open(customToPractice(customQuestion))}>▶️ เล่นข้อ 0 (ที่สร้างเอง)</GameButton>
            <GameButton variant="paper" onClick={startCreate}>✏️ แก้ไขข้อ 0</GameButton>
            <GameButton variant="paper" onClick={resetCustom}>♻️ รีเซตข้อ 0</GameButton>
          </>
        ) : (
          <GameButton variant="paper" onClick={startCreate}>✏️ สร้างโจทย์เอง (ข้อ 0)</GameButton>
        )}
      </div>
      <div className="button-row practice-actions">
        <GameButton onClick={openRandom}>🎲 สุ่มคำถาม</GameButton>
        <GameButton variant="paper" onClick={() => setHideAnswered((value) => !value)}>
          {hideAnswered ? `👁 แสดงข้อที่ตอบแล้ว (${answeredCount})` : `🙈 ซ่อนข้อที่ตอบแล้ว (${answeredCount})`}
        </GameButton>
        <GameButton
          variant={confirmReset ? "danger" : "paper"}
          disabled={answeredCount === 0 && !confirmReset}
          onClick={() => {
            if (!confirmReset) {
              setConfirmReset(true);
              return;
            }
            resetAnswered();
          }}
        >
          {confirmReset ? "⚠️ กดอีกครั้ง — ล้างประวัติฝึก" : "♻️ รีเซตข้อที่ตอบแล้ว"}
        </GameButton>
      </div>
      {allHidden ? (
        <p className="big-callout">🎉 ตอบครบทุกข้อแล้ว! กด "แสดงข้อที่ตอบแล้ว" หรือ "รีเซต" เพื่อซ้อมใหม่</p>
      ) : (
        <div className="practice-grid">
          {visibleQuestions.map(({ question, number }) => {
            const done = answeredIds.has(question.id);
            return (
              <button
                key={question.id}
                type="button"
                className={`practice-cell${done ? " practice-cell--done" : ""}`}
                onClick={() => open(bankToPractice(question))}
              >
                {number}
                {done && <span className="practice-cell__tick" aria-label="ตอบแล้ว">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
