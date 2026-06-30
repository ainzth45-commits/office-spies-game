import { useEffect } from "react";
import { setSoundEnabled } from "./audio/sounds";
import { BootScreen } from "./features/boot/BootScreen";
import { EndGameScene } from "./features/end/EndGameScene";
import { GachaFlow } from "./features/gacha/GachaFlow";
import { GuessSecondSpyScene } from "./features/guess/GuessSecondSpyScene";
import { HomeHub } from "./features/home/HomeHub";
import { QuizFlow } from "./features/quiz/QuizFlow";
import { RefundScene } from "./features/refund/RefundScene";
import { RoleRevealFlow } from "./features/role/RoleRevealFlow";
import { ShopFlow } from "./features/shop/ShopFlow";
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
  const { hydrated, state } = useGameStore();
  useEffect(() => {
    setSoundEnabled(state.settings.soundEnabled);
  }, [state.settings.soundEnabled]);
  // ห่อทุกหน้าใน frame ที่เว้น safe-area (หลบ status bar / home indicator บน iPad)
  return <div className="app-frame">{renderPhase(hydrated, state)}</div>;
}

function renderPhase(hydrated: boolean, state: ReturnType<typeof useGameStore>["state"]) {
  if (!hydrated) return <main className="app-shell"><p>กำลังโหลดคดี...</p></main>;
  switch (state.phase) {
    case "boot": return <BootScreen />;
    case "tutorial": return <TutorialFlow />;
    case "roleReveal": return <RoleRevealFlow />;
    case "shop": return <ShopFlow />;
    case "gacha": return <GachaFlow />;
    case "quiz": return <QuizFlow />;
    case "vote": return <VoteFlow />;
    case "voteResult": return <VoteResultScene />;
    case "postVoteClue": return <PostVoteClueScene />;
    case "refund": return <RefundScene />;
    case "guess": return <GuessSecondSpyScene />;
    case "ended": return <EndGameScene />;
    default: return <HomeHub />;
  }
}
