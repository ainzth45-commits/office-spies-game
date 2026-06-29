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
  if (!hydrated) return <main className="app-shell"><p>กำลังโหลดคดี...</p></main>;
  if (state.phase === "boot") return <BootScreen />;
  if (state.phase === "tutorial") return <TutorialFlow />;
  if (state.phase === "roleReveal") return <RoleRevealFlow />;
  if (state.phase === "shop") return <ShopFlow />;
  if (state.phase === "gacha") return <GachaFlow />;
  if (state.phase === "quiz") return <QuizFlow />;
  if (state.phase === "vote") return <VoteFlow />;
  if (state.phase === "voteResult") return <VoteResultScene />;
  if (state.phase === "postVoteClue") return <PostVoteClueScene />;
  if (state.phase === "refund") return <RefundScene />;
  if (state.phase === "guess") return <GuessSecondSpyScene />;
  if (state.phase === "ended") return <EndGameScene />;
  return <HomeHub />;
}
