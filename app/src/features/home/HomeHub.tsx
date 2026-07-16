import { useState } from "react";
import { playClick, setSoundEnabled } from "../../audio/sounds";
import { gachaIconAssets, gameAssets } from "../../data/assets";
import { calculateVoteCost } from "../../domain/economy";
import { canStartNewDay, enterRoleReveal, markFinalDay, remainingQuizCount, startNewDay, startNewGameRound } from "../../state/actions";
import { useGameStore } from "../../state/useGameStore";
import { GameButton } from "../../ui/components/GameButton";
import { ThemedIcon } from "../../ui/components/ThemedIcon";
import { AttendancePanel } from "../attendance/AttendancePanel";
import { BackupPanel } from "../backup/BackupPanel";
import { SettingsPanel } from "../settings/SettingsPanel";

type ActivePanel = "attendance" | "settings" | "backup" | "admin" | null;

type DockItem = {
  key: string;
  label: string;
  icon: string;
  fallback: string;
  onClick: () => void;
};

export function HomeHub() {
  const { state, setState } = useGameStore();
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmEndGame, setConfirmEndGame] = useState(false);
  const [confirmNewDay, setConfirmNewDay] = useState(false);
  const [rosterHint, setRosterHint] = useState(false);
  const [resetError, setResetError] = useState("");
  const quizRemaining = remainingQuizCount();
  const quizBankLow = quizRemaining < state.config.quizMinRemainingToStart;
  const presentCount = Object.values(state.attendance).filter(Boolean).length;
  const voteCost = calculateVoteCost(
    presentCount,
    state.voteCostState.accumulatedSkippedMultiplier,
    state.voteCostState.nextVoteMultiplier,
    state.config,
  );

  const goPhase = (phase: typeof state.phase) => () => setState((current) => ({ ...current, phase }));

  const dock: DockItem[] = [
    {
      key: "role",
      label: "บทบาท",
      icon: gameAssets.dockRole,
      fallback: "🕵️",
      onClick: () => {
        // ยังไม่มีทีม (หรือคนไม่พอ) — enterRoleReveal จะ throw อยู่แล้ว แต่ดักก่อนเพื่อโชว์ popup แนะนำแทน crash
        if (state.players.length < 3) {
          setRosterHint(true);
          return;
        }
        setState((current) => enterRoleReveal(current));
      },
    },
    { key: "vote", label: "โหวต", icon: gameAssets.dockVote, fallback: "🗳️", onClick: goPhase("vote") },
    { key: "gacha", label: "กาชา", icon: gameAssets.dockGacha, fallback: "🎰", onClick: goPhase("gacha") },
    { key: "topic", label: "ดูภาพ", icon: gameAssets.dockTopic, fallback: "🖼️", onClick: goPhase("topic") },
    // ทางเข้าพิเศษ: สนามซ้อมโจทย์เชาว์ — ไม่มีผลกับระบบเกม (ใช้ไอคอนโจทย์เชาว์จากชุดกาชา)
    { key: "practice", label: "ฝึกเชาว์", icon: gachaIconAssets.grantQuiz, fallback: "🧠", onClick: goPhase("quizPractice") },
    {
      key: "learn",
      label: "สอนเล่น",
      icon: gameAssets.dockLearn,
      fallback: "📖",
      onClick: () => setState((current) => ({ ...current, phase: "tutorial", settings: { ...current.settings, tutorialCompleted: false } })),
    },
    { key: "settings", label: "ตั้งค่า", icon: gameAssets.dockSettings, fallback: "⚙️", onClick: () => setActivePanel("admin") },
  ];

  return (
    <main className="home-screen">
      <div className="home-topbar">
        {/* เริ่มรอบใหม่ (ล้างกระดาน) — มุมซ้ายบน ไม่เด่น + ยืนยัน 2 จังหวะ */}
        <div className="home-topbar__left">
          <button
            type="button"
            className={`chip-btn home-reset${confirmReset ? " home-reset--armed" : ""}`}
            onClick={() => {
              if (!confirmReset) {
                setConfirmReset(true);
                setResetError("");
                return;
              }
              try {
                setState((current) => startNewGameRound(current));
                setConfirmReset(false);
              } catch (caught) {
                setResetError(caught instanceof Error ? caught.message : "เริ่มรอบใหม่ไม่สำเร็จ");
                setConfirmReset(false);
              }
            }}
            aria-label="เริ่มรอบใหม่ (ล้างกระดานทั้งหมด)"
          >
            {confirmReset ? (
              "⚠️ ยืนยัน?"
            ) : (
              <ThemedIcon className="chip-icon chip-icon--lg" src={gameAssets.iconReset} emoji="🔄" />
            )}
          </button>
          {resetError && <p className="home-reset__error">{resetError}</p>}
          {!resetError && quizBankLow && (
            <p className="home-reset__error">
              📚 คลังโจทย์เหลือ {quizRemaining}/{state.config.quizMinRemainingToStart} — รีเซตคลังในตั้งค่าก่อนเริ่มรอบใหม่
            </p>
          )}
        </div>
        <button
          type="button"
          className="chip-btn"
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
      </div>

      <div className="home-center">
        <img
          className="home-logo"
          src={gameAssets.logo}
          alt="สายลับในออฟฟิศ"
          onError={(event) => { event.currentTarget.style.display = "none"; }}
        />
        <div className="home-daterow">
          <img
            className="home-mascot"
            src={gameAssets.mascotDetective}
            alt=""
            aria-hidden="true"
            onError={(event) => { event.currentTarget.style.display = "none"; }}
          />
          <div className="home-status">
            <span className="home-stat"><b>{state.manualDay.label}</b><small>วันที่ {state.manualDay.index}/{state.config.maxGameDays}</small></span>
            <span className="home-stat"><b>{presentCount}</b><small>คนมาวันนี้</small></span>
            <span className="home-stat"><b>{voteCost}</b><small>ค่าเปิดโหวต</small></span>
          </div>
        </div>
        <div className="home-actions">
          {canStartNewDay(state) ? (
            <GameButton className="home-cta" onClick={() => setConfirmNewDay(true)}>
              📅 เริ่มวันใหม่ (ไปวันที่ {state.manualDay.index + 1})
            </GameButton>
          ) : (
            <GameButton
              className="home-cta"
              onClick={() => {
                if (!confirmEndGame) {
                  setConfirmEndGame(true);
                  return;
                }
                setConfirmEndGame(false);
                setState(markFinalDay);
              }}
            >
              {confirmEndGame ? "⚠️ จบเกมเลยนะ? กดอีกครั้งเพื่อยืนยัน" : "🏁 วันสุดท้ายแล้ว — จบเกม & ดูผลตัดสิน"}
            </GameButton>
          )}
        </div>
      </div>

      <nav className="home-dock" aria-label="เมนูหลัก">
        {dock.map((item) => (
          <button key={item.key} type="button" className="dock-btn" onClick={item.onClick}>
            <span className="dock-btn__icon">
              <img
                src={item.icon}
                alt=""
                aria-hidden="true"
                onError={(event) => {
                  const img = event.currentTarget;
                  img.style.display = "none";
                  const emoji = img.nextElementSibling as HTMLElement | null;
                  if (emoji) emoji.style.display = "grid";
                }}
              />
              <span className="dock-btn__emoji" aria-hidden="true">{item.fallback}</span>
            </span>
            <span className="dock-btn__label">{item.label}</span>
          </button>
        ))}
      </nav>

      {confirmNewDay && (
        <div className="overlay" onClick={() => setConfirmNewDay(false)}>
          <div className="admin-menu confirm-modal" onClick={(event) => event.stopPropagation()}>
            <img
              className="confirm-modal__mascot"
              src={gameAssets.mascotDetective}
              alt=""
              aria-hidden="true"
              onError={(event) => { event.currentTarget.style.display = "none"; }}
            />
            <h2>📅 ขึ้นวันเล่นที่ {state.manualDay.index + 1}?</h2>
            <p className="confirm-modal__body">
              ปิดคดีของ{state.manualDay.label}แล้วเดินหน้าต่อ
              {!state.manualDay.openedVoteToday && (
                <><br />⚠️ วันนี้ยังไม่ได้เปิดโหวตนะ — ข้ามไปเลย ค่าเปิดโหวตวันถัดไปจะแพงขึ้น ×1.5</>
              )}
            </p>
            <div className="button-row">
              <GameButton variant="paper" onClick={() => setConfirmNewDay(false)}>ยังก่อน</GameButton>
              <GameButton onClick={() => { setConfirmNewDay(false); setState((current) => startNewDay(current)); }}>
                ✅ ยืนยัน ขึ้นวันใหม่
              </GameButton>
            </div>
          </div>
        </div>
      )}

      {rosterHint && (
        <div className="overlay" onClick={() => setRosterHint(false)}>
          <div className="admin-menu confirm-modal" onClick={(event) => event.stopPropagation()}>
            <img
              className="confirm-modal__mascot"
              src={gameAssets.mascotDetective}
              alt=""
              aria-hidden="true"
              onError={(event) => { event.currentTarget.style.display = "none"; }}
            />
            <h2>👥 ยังไม่มีทีมสายสืบเลย!</h2>
            <p className="confirm-modal__body">
              ไปที่ ⚙️ ตั้งค่า → 👥 ผู้เล่น แล้วลงทะเบียนอย่างน้อย 3 คนก่อน ถึงจะเริ่มภารกิจได้นะ
            </p>
            <div className="button-row">
              <GameButton onClick={() => { setRosterHint(false); setActivePanel("settings"); }}>ไปลงทะเบียนเลย</GameButton>
            </div>
          </div>
        </div>
      )}

      {activePanel === "admin" && (
        <div className="overlay" onClick={() => setActivePanel(null)}>
          <div className="admin-menu" onClick={(event) => event.stopPropagation()}>
            <h2>เมนูแอดมิน</h2>
            <div className="admin-menu__grid">
              <GameButton variant="paper" onClick={() => setActivePanel("settings")}>ตั้งค่าเกม</GameButton>
              <GameButton variant="paper" onClick={() => setActivePanel("attendance")}>คนมา/คนลา</GameButton>
              <GameButton variant="paper" onClick={() => setActivePanel("backup")}>Backup</GameButton>
              <GameButton
                variant="danger"
                onClick={() => {
                  if (!confirmEndGame) {
                    setConfirmEndGame(true);
                    return;
                  }
                  setConfirmEndGame(false);
                  setActivePanel(null);
                  setState(markFinalDay);
                }}
              >
                {confirmEndGame ? "⚠️ กดอีกครั้งเพื่อยืนยันจบเกม" : "🏁 จบเกมฉุกเฉิน (สายลับชนะ)"}
              </GameButton>
            </div>
            <GameButton onClick={() => { setConfirmEndGame(false); setActivePanel(null); }}>ปิด</GameButton>
          </div>
        </div>
      )}

      {(activePanel === "attendance" || activePanel === "settings" || activePanel === "backup") && (
        <div className="overlay" onClick={() => setActivePanel(null)}>
          <div className="overlay-sheet" onClick={(event) => event.stopPropagation()}>
            {activePanel === "attendance" && <AttendancePanel />}
            {activePanel === "settings" && <SettingsPanel />}
            {activePanel === "backup" && <BackupPanel />}
            <div className="button-row">
              <GameButton onClick={() => setActivePanel("admin")}>← เมนูแอดมิน</GameButton>
              <GameButton variant="paper" onClick={() => setActivePanel(null)}>ปิด</GameButton>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
