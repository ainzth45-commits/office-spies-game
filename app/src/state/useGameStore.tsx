import { createContext, type ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { GameState } from "../domain/types";
import { createInitialGameState } from "./gameState";
import { loadGameState, saveGameState } from "./storage";

interface GameStoreValue {
  state: GameState;
  setState: (updater: GameState | ((state: GameState) => GameState)) => void;
  hydrated: boolean;
  // เซฟลงเครื่องล้มเหลว (private mode / พื้นที่เต็ม) — UI ต้องโชว์เตือน ห้ามพังเงียบ
  saveError: string | null;
}

const GameStoreContext = createContext<GameStoreValue | null>(null);

export function GameStoreProvider({ children }: { children: ReactNode }) {
  const [state, setRawState] = useState<GameState>(() => createInitialGameState());
  const [hydrated, setHydrated] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  // เงา state ปัจจุบัน — ให้ setState รัน updater "ทันที" ในบริบทของคนเรียก
  // (เดิมส่ง updater เข้า React แล้วไปรันตอน dispatch → action ที่ throw เช่น "วันนี้เปิดโหวตไปแล้ว"
  //  ระเบิดนอก try/catch ของหน้าจอ → แอปขาวทั้งจอ)
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    loadGameState()
      .then((saved) => {
        if (saved) setRawState(saved);
      })
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    // เซฟทุกครั้งที่ state เปลี่ยน — ถ้าพัง (Safari private mode / quota เต็มเพราะรูปผู้เล่น) ต้องโชว์เตือน
    saveGameState(state)
      .then(() => setSaveError(null))
      .catch(() => setSaveError("บันทึกลงเครื่องไม่สำเร็จ — ข้อมูลอาจหายถ้าปิดแอป (เช็คโหมดส่วนตัว/พื้นที่ว่างของ iPad)"));
  }, [hydrated, state]);

  const value = useMemo<GameStoreValue>(
    () => ({
      state,
      hydrated,
      saveError,
      setState: (updater) => {
        const next = typeof updater === "function" ? updater(stateRef.current) : updater;
        stateRef.current = next; // call ซ้อนใน tick เดียวกันยังเห็นค่าล่าสุด
        setRawState(next);
      },
    }),
    [hydrated, state, saveError],
  );

  return <GameStoreContext.Provider value={value}>{children}</GameStoreContext.Provider>;
}

export function useGameStore(): GameStoreValue {
  const value = useContext(GameStoreContext);
  if (!value) throw new Error("useGameStore must be used inside GameStoreProvider");
  return value;
}
