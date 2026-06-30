import { useState } from "react";
import { playClick, setSoundEnabled } from "../../audio/sounds";
import { gameAssets } from "../../data/assets";
import { calculateVoteCost } from "../../domain/economy";
import { enterRoleReveal, startNewRound } from "../../state/actions";
import { useGameStore } from "../../state/useGameStore";
import { GameButton } from "../../ui/components/GameButton";
import { AttendancePanel } from "../attendance/AttendancePanel";
import { BackupPanel } from "../backup/BackupPanel";
import { ManualDayPanel } from "../day/ManualDayPanel";
import { QuickRules } from "../rules/QuickRules";
import { SettingsPanel } from "../settings/SettingsPanel";

type ActivePanel = "day" | "attendance" | "settings" | "backup" | "rules" | "admin" | null;

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
  const presentCount = Object.values(state.attendance).filter(Boolean).length;
  const voteCost = calculateVoteCost(
    presentCount,
    state.voteCostState.accumulatedSkippedMultiplier,
    state.voteCostState.nextVoteMultiplier,
    state.config,
  );

  const goPhase = (phase: typeof state.phase) => () => setState((current) => ({ ...current, phase }));

  const dock: DockItem[] = [
    { key: "role", label: "บทบาท", icon: gameAssets.dockRole, fallback: "🕵️", onClick: () => setState((current) => enterRoleReveal(current)) },
    { key: "vote", label: "โหวต", icon: gameAssets.dockVote, fallback: "🗳️", onClick: goPhase("vote") },
    { key: "gacha", label: "กาชา", icon: gameAssets.dockGacha, fallback: "🎰", onClick: goPhase("gacha") },
    { key: "shop", label: "ร้านลับ", icon: gameAssets.dockShop, fallback: "🛒", onClick: goPhase("shop") },
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
        <button type="button" className="chip-btn" onClick={() => setActivePanel("rules")}>❓ กฎย่อ</button>
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
          {state.settings.soundEnabled ? "🔊 เสียง" : "🔇 ปิด"}
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
            <span className="home-stat"><b>{state.manualDay.label}</b><small>วันเล่น</small></span>
            <span className="home-stat"><b>{presentCount}</b><small>คนมาวันนี้</small></span>
            <span className="home-stat"><b>{voteCost}</b><small>ค่าเปิดโหวต</small></span>
          </div>
        </div>
        <GameButton className="home-cta" onClick={() => setState((current) => startNewRound(current))}>
          🎲 เริ่มรอบใหม่ · สุ่มสายลับ
        </GameButton>
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

      {activePanel === "admin" && (
        <div className="overlay" onClick={() => setActivePanel(null)}>
          <div className="admin-menu" onClick={(event) => event.stopPropagation()}>
            <h2>เมนูแอดมิน</h2>
            <div className="admin-menu__grid">
              <GameButton variant="paper" onClick={() => setActivePanel("settings")}>ตั้งค่าเกม</GameButton>
              <GameButton variant="paper" onClick={() => setActivePanel("attendance")}>คนมา/คนลา</GameButton>
              <GameButton variant="paper" onClick={() => setActivePanel("day")}>คุมวัน</GameButton>
              <GameButton variant="paper" onClick={() => setActivePanel("backup")}>Backup</GameButton>
            </div>
            <GameButton onClick={() => setActivePanel(null)}>ปิด</GameButton>
          </div>
        </div>
      )}

      {(activePanel === "day" || activePanel === "attendance" || activePanel === "settings" || activePanel === "backup") && (
        <div className="overlay" onClick={() => setActivePanel(null)}>
          <div className="overlay-sheet" onClick={(event) => event.stopPropagation()}>
            {activePanel === "day" && <ManualDayPanel />}
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
      {activePanel === "rules" && <QuickRules onClose={() => setActivePanel(null)} />}
    </main>
  );
}
