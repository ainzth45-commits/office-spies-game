import { useState } from "react";
import { playClick, setSoundEnabled } from "../../audio/sounds";
import { gameAssets } from "../../data/assets";
import { calculateVoteCost } from "../../domain/economy";
import { useGameStore } from "../../state/useGameStore";
import { GameButton } from "../../ui/components/GameButton";
import { StatusBadge } from "../../ui/components/StatusBadge";
import { AttendancePanel } from "../attendance/AttendancePanel";
import { BackupPanel } from "../backup/BackupPanel";
import { ManualDayPanel } from "../day/ManualDayPanel";
import { QuickRules } from "../rules/QuickRules";
import { SettingsPanel } from "../settings/SettingsPanel";

type ActivePanel = "day" | "attendance" | "settings" | "backup" | "rules" | null;

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

  return (
    <main className="hub-scene">
      <header className="hub-header">
        <div>
          <p className="eyebrow">Detective Party Mode</p>
          <h1 className="hub-title">
            <img
              className="hub-logo"
              src={gameAssets.logo}
              alt="สายลับในออฟฟิศ"
              onError={(event) => { event.currentTarget.style.display = "none"; }}
            />
          </h1>
        </div>
        <div className="hub-status">
          <StatusBadge label="วันเล่น" value={state.manualDay.label} />
          <StatusBadge label="คนมาวันนี้" value={presentCount} />
          <StatusBadge label="ค่าเปิดโหวต" value={voteCost} />
          <button
            type="button"
            className="sound-toggle"
            aria-label={state.settings.soundEnabled ? "ปิดเสียง" : "เปิดเสียง"}
            title={state.settings.soundEnabled ? "เสียง: เปิด" : "เสียง: ปิด"}
            onClick={() => {
              const next = !state.settings.soundEnabled;
              setSoundEnabled(next);
              if (next) playClick();
              setState((current) => ({ ...current, settings: { ...current.settings, soundEnabled: next } }));
            }}
          >
            {state.settings.soundEnabled ? "🔊" : "🔇"}
          </button>
        </div>
      </header>

      <section className="mission-board">
        <GameButton onClick={() => setState((current) => ({ ...current, phase: "roleReveal" }))}>ดูบทบาทลับ</GameButton>
        <GameButton onClick={() => setState((current) => ({ ...current, phase: "vote" }))}>เปิดโหวต</GameButton>
        <GameButton onClick={() => setState((current) => ({ ...current, phase: "gacha" }))}>หมุนกาชา</GameButton>
        <GameButton onClick={() => setState((current) => ({ ...current, phase: "shop" }))}>ร้านลับ</GameButton>
        <GameButton onClick={() => setState((current) => ({ ...current, phase: "tutorial", settings: { ...current.settings, tutorialCompleted: false } }))}>สอนเล่น</GameButton>
        <GameButton variant="paper" onClick={() => setActivePanel("backup")}>Backup</GameButton>
        <GameButton variant="paper" onClick={() => setActivePanel("attendance")}>คนมา/คนลา</GameButton>
        <GameButton variant="paper" onClick={() => setActivePanel("settings")}>ตั้งค่า</GameButton>
        <GameButton variant="paper" onClick={() => setActivePanel("day")}>คุมวัน</GameButton>
        <GameButton variant="paper" onClick={() => setActivePanel("rules")}>กฎย่อ</GameButton>
      </section>

      {activePanel === "day" && <ManualDayPanel />}
      {activePanel === "attendance" && <AttendancePanel />}
      {activePanel === "settings" && <SettingsPanel />}
      {activePanel === "backup" && <BackupPanel />}
      {activePanel === "rules" && <QuickRules onClose={() => setActivePanel(null)} />}
    </main>
  );
}
