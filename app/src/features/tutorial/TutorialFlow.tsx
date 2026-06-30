import { useState } from "react";
import { tutorialScenes } from "../../data/tutorialScenes";
import { useGameStore } from "../../state/useGameStore";
import { GameButton } from "../../ui/components/GameButton";

export function TutorialFlow() {
  const { setState } = useGameStore();
  const [index, setIndex] = useState(0);
  const scene = tutorialScenes[index];
  const isLast = index >= tutorialScenes.length - 1;

  function finish() {
    setState((current) => ({ ...current, phase: "home", settings: { ...current.settings, tutorialCompleted: true } }));
  }

  return (
    <section className="scene-panel tutorial-scene">
      <div className="tutorial-top">
        <p className="eyebrow">สอนเล่น · {index + 1}/{tutorialScenes.length}</p>
        <GameButton variant="paper" className="tutorial-skip" onClick={finish}>ข้าม</GameButton>
      </div>

      {/* layout landscape: ภาพซ้าย · คำอธิบายขวา — พอดีจอ ไม่ต้องเลื่อน */}
      <div className="tutorial-body" key={scene.id}>
        <div className="tutorial-art">
          <img
            className="tutorial-art__img"
            src={scene.image}
            alt=""
            aria-hidden="true"
            onError={(event) => { event.currentTarget.style.visibility = "hidden"; }}
          />
        </div>
        <div className="tutorial-text">
          <h2>{scene.title}</h2>
          <p className="big-callout">{scene.narration}</p>
        </div>
      </div>

      <div className="tutorial-dots" aria-hidden="true">
        {tutorialScenes.map((item, dotIndex) => (
          <span key={item.id} className={`tutorial-dot${dotIndex === index ? " tutorial-dot--on" : ""}`} />
        ))}
      </div>

      <div className="button-row">
        <GameButton variant="paper" disabled={index === 0} onClick={() => setIndex((current) => Math.max(0, current - 1))}>← ย้อน</GameButton>
        <GameButton onClick={() => (isLast ? finish() : setIndex((current) => current + 1))}>
          {isLast ? "🔍 เริ่มเล่นเลย!" : "ต่อไป →"}
        </GameButton>
      </div>
    </section>
  );
}
