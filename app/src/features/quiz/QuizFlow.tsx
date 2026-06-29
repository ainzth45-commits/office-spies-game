import { quizBank } from "../../data/quizBank";
import { answerPendingQuiz } from "../../state/actions";
import { useGameStore } from "../../state/useGameStore";
import { GameButton } from "../../ui/components/GameButton";

export function QuizFlow() {
  const { state, setState } = useGameStore();
  const question = quizBank.find((candidate) => candidate.id === state.pendingQuiz?.questionId);
  const player = state.players.find((candidate) => candidate.id === state.pendingQuiz?.playerId);

  if (!question || !player) {
    return (
      <section className="scene-panel">
        <h2>ไม่มีโจทย์ที่กำลังเล่น</h2>
        <div className="button-row">
          <GameButton onClick={() => setState((current) => ({ ...current, phase: "home", pendingQuiz: null }))}>กลับ Home</GameButton>
        </div>
      </section>
    );
  }

  return (
    <section className="scene-panel quiz-scene">
      <p className="eyebrow">โจทย์ฟรีจากกาชา</p>
      <h2>{question.category}</h2>
      <p className="big-callout">{player.name}: {question.question}</p>
      <div className="quiz-choices">
        <GameButton onClick={() => setState((current) => answerPendingQuiz(current, "A"))}>A · {question.choiceA}</GameButton>
        <GameButton onClick={() => setState((current) => answerPendingQuiz(current, "B"))}>B · {question.choiceB}</GameButton>
      </div>
    </section>
  );
}
