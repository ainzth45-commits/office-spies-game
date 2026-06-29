import { useState } from "react";
import { gameAssets } from "../../data/assets";
import { tutorialScenes } from "../../data/tutorialScenes";
import { useGameStore } from "../../state/useGameStore";
import { GameButton } from "../../ui/components/GameButton";

export function TutorialFlow() {
  const { setState } = useGameStore();
  const [index, setIndex] = useState(0);
  const scene = tutorialScenes[index];
  const isLast = index >= tutorialScenes.length - 1;

  return (
    <section className="scene-panel tutorial-scene">
      <p className="eyebrow">คู่มือภารกิจ {index + 1}/{tutorialScenes.length}</p>
      <h2>{scene.title}</h2>
      <p className="big-callout">{scene.narration}</p>
      <div className="detective-stage" aria-hidden="true">
        <img
          className="tutorial-mascot"
          src={gameAssets.mascotDetective}
          alt=""
          onError={(event) => { event.currentTarget.style.display = "none"; }}
        />
      </div>
      <div className="button-row">
        <GameButton variant="paper" disabled={index === 0} onClick={() => setIndex((current) => Math.max(0, current - 1))}>ย้อน</GameButton>
        <GameButton
          onClick={() => {
            if (isLast) {
              setState((current) => ({ ...current, phase: "home", settings: { ...current.settings, tutorialCompleted: true } }));
            } else {
              setIndex((current) => current + 1);
            }
          }}
        >
          {isLast ? "เริ่มเกม" : "ต่อไป"}
        </GameButton>
      </div>
    </section>
  );
}
