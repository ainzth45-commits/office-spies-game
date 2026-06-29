import type { GameState } from "../domain/types";
import { createInitialGameState } from "./gameState";

const DB_NAME = "office-spies-game";
const STORE_NAME = "state";
const STATE_KEY = "current";

export async function saveGameState(state: GameState): Promise<void> {
  const db = await openDb();
  await requestToPromise(db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(state, STATE_KEY));
  localStorage.setItem("office-spies:last-save", new Date().toISOString());
}

export async function loadGameState(): Promise<GameState | null> {
  const db = await openDb();
  return requestToPromise<GameState | undefined>(db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(STATE_KEY)).then(
    (state) => (state ? migrateGameState(state) : null),
  );
}

function migrateGameState(state: GameState): GameState {
  const fresh = createInitialGameState();
  return {
    ...fresh,
    ...state,
    settings: { ...fresh.settings, ...state.settings },
    dailyUsage: state.dailyUsage ?? fresh.dailyUsage,
    pendingQuiz: state.pendingQuiz ?? null,
    currentVote: state.currentVote ?? null,
    lastVoteResult: state.lastVoteResult ?? null,
    lastClueResult: state.lastClueResult ?? null,
    lastGachaResult: state.lastGachaResult ?? null,
  };
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
