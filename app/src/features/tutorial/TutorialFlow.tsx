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

      {/* ฉากแนะนำตัวละคร = โชว์การ์ดหลายรูปเรียงกัน · ฉากอื่น = ภาพเดี่ยวซ้าย + คำอธิบายขวา */}
      {scene.characters ? (
        <div className="tutorial-body tutorial-body--characters" key={scene.id}>
          <h2 className="tutorial-characters__title">{scene.title}</h2>
          <div className="tutorial-characters">
            {scene.characters.map((character) => (
              <div key={character.label} className="tutorial-char-card">
                <img
                  className="tutorial-char-card__img"
                  src={character.src}
                  alt={character.label}
                  onError={(event) => {
                    const img = event.currentTarget;
                    if (character.fallback && !img.src.endsWith(character.fallback)) { img.src = character.fallback; return; }
                    img.style.visibility = "hidden";
                  }}
                />
                <b className="tutorial-char-card__label">{character.label}</b>
                <span className="tutorial-char-card__desc">{character.desc}</span>
              </div>
            ))}
          </div>
          <ul className="tutorial-lines tutorial-lines--center">
            {scene.lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="tutorial-body" key={scene.id}>
          <div className="tutorial-art">
            <img
              className="tutorial-art__img"
              src={scene.image}
              alt=""
              aria-hidden="true"
              onError={(event) => {
                // รูปหลักยังไม่มี (เช่น รอ codex เจน) → สลับไปรูปสำรอง ถ้าไม่มีค่อยซ่อน
                const img = event.currentTarget;
                if (scene.fallbackImage && img.src !== scene.fallbackImage && !img.src.endsWith(scene.fallbackImage)) {
                  img.src = scene.fallbackImage;
                  return;
                }
                img.style.visibility = "hidden";
              }}
            />
          </div>
          <div className="tutorial-text">
            <h2>{scene.title}</h2>
            <ul className="tutorial-lines">
              {scene.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

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
