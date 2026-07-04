import { useEffect } from "react";
import { playClick, setSoundEnabled } from "./audio/sounds";
import { gameAssets } from "./data/assets";
import { preloadAllGameAssets } from "./data/preloadAssets";
import { ThemedIcon } from "./ui/components/ThemedIcon";
import { BootScreen } from "./features/boot/BootScreen";
import { EndGameScene } from "./features/end/EndGameScene";
import { GachaFlow } from "./features/gacha/GachaFlow";
import { GuessSecondSpyScene } from "./features/guess/GuessSecondSpyScene";
import { HomeHub } from "./features/home/HomeHub";
import { QuizFlow } from "./features/quiz/QuizFlow";
import { QuizPracticeFlow } from "./features/quiz/QuizPracticeFlow";
import { RefundScene } from "./features/refund/RefundScene";
import { RoleRevealFlow } from "./features/role/RoleRevealFlow";
import { TutorialFlow } from "./features/tutorial/TutorialFlow";
import { PostVoteClueScene } from "./features/vote/PostVoteClueScene";
import { VoteFlow } from "./features/vote/VoteFlow";
import { VoteResultScene } from "./features/vote/VoteResultScene";
import { GameStoreProvider, useGameStore } from "./state/useGameStore";

export function App() {
  return (
    <GameStoreProvider>
      <AppRouter />
    </GameStoreProvider>
  );
}

function AppRouter() {
  const { hydrated, state, setState } = useGameStore();
  useEffect(() => {
    setSoundEnabled(state.settings.soundEnabled);
  }, [state.settings.soundEnabled]);
  // อุ่นรูปทั้งเกมไว้เบื้องหลังตั้งแต่เปิดแอป — เปลี่ยนหน้าแล้วรูปไม่ดีเลย์
  useEffect(() => {
    preloadAllGameAssets();
  }, []);
  // บอกฉากปัจจุบันให้ html canvas สลับภาพพื้นหลังตาม (global.css: html[data-scene=...])
  // — แถบ safe-area ล่างบน iPad ที่เลเยอร์ fixed ทาไม่ถึง จะโชว์ภาพฉากเดียวกันแทนสีพื้น
  useEffect(() => {
    document.documentElement.dataset.scene = hydrated ? state.phase : "boot";
  }, [hydrated, state.phase]);
  // ห่อทุกหน้าใน frame ที่เว้น safe-area (หลบ status bar / home indicator บน iPad)
  return (
    <div className="app-frame">
      {hydrated && state.phase !== "home" && state.phase !== "boot" && (
        <>
          <button
            type="button"
            className="chip-btn home-chip"
            onClick={() => setState((current) => ({ ...current, phase: "home" }))}
          >
            <ThemedIcon className="chip-icon" src={gameAssets.iconHome} emoji="🏠" /> Home
          </button>
          <button
            type="button"
            className="chip-btn sound-chip"
            aria-label={state.settings.soundEnabled ? "ปิดเสียง" : "เปิดเสียง"}
            onClick={() => {
              const next = !state.settings.soundEnabled;
              setSoundEnabled(next);
              if (next) playClick();
              setState((current) => ({ ...current, settings: { ...current.settings, soundEnabled: next } }));
            }}
          >
            <ThemedIcon
              className="chip-icon chip-icon--lg"
              src={state.settings.soundEnabled ? gameAssets.iconSoundOn : gameAssets.iconSoundOff}
              emoji={state.settings.soundEnabled ? "🔊" : "🔇"}
            />
          </button>
        </>
      )}
      {renderPhase(hydrated, state)}
    </div>
  );
}

function renderPhase(hydrated: boolean, state: ReturnType<typeof useGameStore>["state"]) {
  if (!hydrated) return <main className="app-shell"><p>กำลังโหลดคดี...</p></main>;
  switch (state.phase) {
    case "boot": return <BootScreen />;
    case "tutorial": return <TutorialFlow />;
    case "roleReveal": return <RoleRevealFlow />;
    case "gacha": return <GachaFlow />;
    case "quiz": return <QuizFlow />;
    case "quizPractice": return <QuizPracticeFlow />;
    case "vote": return <VoteFlow />;
    case "voteResult": return <VoteResultScene />;
    case "postVoteClue": return <PostVoteClueScene />;
    case "refund": return <RefundScene />;
    case "guess": return <GuessSecondSpyScene />;
    case "ended": return <EndGameScene />;
    default: return <HomeHub />;
  }
}
