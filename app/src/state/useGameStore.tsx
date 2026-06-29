import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";
import type { GameState } from "../domain/types";
import { createInitialGameState } from "./gameState";
import { loadGameState, saveGameState } from "./storage";

interface GameStoreValue {
  state: GameState;
  setState: (updater: GameState | ((state: GameState) => GameState)) => void;
  hydrated: boolean;
}

const GameStoreContext = createContext<GameStoreValue | null>(null);

export function GameStoreProvider({ children }: { children: ReactNode }) {
  const [state, setRawState] = useState<GameState>(() => createInitialGameState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    loadGameState()
      .then((saved) => {
        if (saved) setRawState(saved);
      })
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) void saveGameState(state);
  }, [hydrated, state]);

  const value = useMemo<GameStoreValue>(
    () => ({
      state,
      hydrated,
      setState: (updater) => {
        setRawState((current) => (typeof updater === "function" ? updater(current) : updater));
      },
    }),
    [hydrated, state],
  );

  return <GameStoreContext.Provider value={value}>{children}</GameStoreContext.Provider>;
}

export function useGameStore(): GameStoreValue {
  const value = useContext(GameStoreContext);
  if (!value) throw new Error("useGameStore must be used inside GameStoreProvider");
  return value;
}
