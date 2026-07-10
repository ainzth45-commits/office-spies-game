import { useEffect, useState } from "react";
import { gameAssets } from "../../data/assets";
import type { PlayerId } from "../../domain/types";
import { rolesAssigned } from "../../state/actions";
import { useGameStore } from "../../state/useGameStore";
import { ConfirmPlayer } from "../../ui/components/ConfirmPlayer";
import { GameButton } from "../../ui/components/GameButton";
import { HandOffCurtain } from "../../ui/components/HandOffCurtain";
import { HoldToReveal } from "../../ui/components/HoldToReveal";
import { PlayerPicker } from "../../ui/components/PlayerPicker";
import { imageForRole } from "./topicImage";

type Step = "input" | "pick" | "confirm" | "view" | "curtain" | "discuss";

function formatClock(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = Math.floor(totalSec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function TopicFlow() {
  const { state, setState } = useGameStore();
  const goHome = () => setState((current) => ({ ...current, phase: "home" }));

  const [step, setStep] = useState<Step>("input");
  const [imageA, setImageA] = useState("");
  const [imageB, setImageB] = useState("");
  const [selectedId, setSelectedId] = useState<PlayerId | null>(null);
  const [viewedIds, setViewedIds] = useState<Set<PlayerId>>(() => new Set());
  // จับเวลาสนทนา (เลือกเปิด/ปิด)
  const [timerOn, setTimerOn] = useState(true);
  const [discussStartMs, setDiscussStartMs] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (step !== "discuss" || !timerOn || discussStartMs === null) return;
    const id = window.setInterval(() => setNowMs(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [step, timerOn, discussStartMs]);

  const presentPlayers = state.players.filter((player) => state.attendance[player.id]);
  const presentCount = presentPlayers.length;
  const player = state.players.find((p) => p.id === selectedId) ?? null;
  const role = selectedId ? state.roles[selectedId] : "normal";

  // กันเข้าถ้ายังไม่แจกบทบาท (ต้องรู้ว่าใครสปายถึงจะเลือกรูปได้)
  if (!rolesAssigned(state)) {
    return (
      <section className="scene-panel">
        <h2>🖼️ โหมดดูภาพหาสายลับ</h2>
        <p className="big-callout">ต้องแจกบทบาทก่อน (เข้าเมนู "บทบาท") — โหมดนี้ต้องรู้ว่าใครเป็นสายลับถึงจะแจกรูปได้</p>
        <div className="button-row">
          <GameButton onClick={goHome}>← กลับ Home</GameButton>
        </div>
      </section>
    );
  }

  if (step === "input") {
    const ready = imageA.trim() !== "" && imageB.trim() !== "";
    return (
      <section className="scene-panel topic-input">
        <h2>🖼️ โหมดดูภาพหาสายลับ</h2>
        <p className="scene-lead">
          วางลิงก์รูป 2 รูป — คนปกติ (รวมคนสติแตก) เห็นรูป A · สายลับเห็นรูป B · เดินดูทีละคน แล้วคุยกันหาว่าใครเห็นรูปต่าง
        </p>
        <label className="topic-field">
          <span>รูป A — ผู้เล่นปกติ + คนสติแตก</span>
          <input type="url" inputMode="url" placeholder="วางลิงก์รูป A" value={imageA} onChange={(e) => setImageA(e.target.value)} />
          {imageA.trim() !== "" && (
            <img className="topic-field__preview" src={imageA} alt="preview A" onError={(e) => { e.currentTarget.style.opacity = "0.25"; }} />
          )}
        </label>
        <label className="topic-field">
          <span>รูป B — สายลับ 🕵️</span>
          <input type="url" inputMode="url" placeholder="วางลิงก์รูป B" value={imageB} onChange={(e) => setImageB(e.target.value)} />
          {imageB.trim() !== "" && (
            <img className="topic-field__preview" src={imageB} alt="preview B" onError={(e) => { e.currentTarget.style.opacity = "0.25"; }} />
          )}
        </label>
        <div className="button-row">
          <GameButton variant="paper" onClick={goHome}>← กลับ Home</GameButton>
          <GameButton disabled={!ready} onClick={() => { setViewedIds(new Set()); setStep("pick"); }}>เริ่มดูภาพ ➜</GameButton>
        </div>
      </section>
    );
  }

  if (step === "pick") {
    const remaining = presentPlayers.filter((p) => !viewedIds.has(p.id));
    if (remaining.length === 0) {
      return (
        <section className="scene-panel">
          <h2>✅ ดูภาพครบทุกคนแล้ว</h2>
          <p className="big-callout">ถึงเวลาคุยกันแล้ว — ใครเห็นรูปต่างจากคนอื่น คนนั้นน่าสงสัย 👀</p>
          <div className="button-row">
            <GameButton onClick={() => { setDiscussStartMs(Date.now()); setNowMs(Date.now()); setStep("discuss"); }}>🗣️ ไปคุยกัน!</GameButton>
          </div>
        </section>
      );
    }
    return (
      <PlayerPicker
        title={`ใครยังไม่ดูภาพ? (ดูแล้ว ${viewedIds.size}/${presentCount})`}
        lead="แตะชื่อตัวเอง 🤫 คนอื่นห้ามแอบมองจอ"
        players={remaining}
        onPick={(id) => { setSelectedId(id); setStep("confirm"); }}
      />
    );
  }

  if (step === "confirm" && player) {
    return <ConfirmPlayer player={player} actionLabel="ใช่ฉันเอง — ดูภาพ" onBack={() => setStep("pick")} onConfirm={() => setStep("view")} />;
  }

  if (step === "curtain") {
    return (
      <HandOffCurtain
        message="ปิดจอแล้ว ส่งเครื่องต่อ"
        sub={`ดูภาพแล้ว ${viewedIds.size}/${presentCount} คน`}
        hint="เก็บไว้ในใจก่อน 🤐 อย่าเพิ่งบอกว่าเห็นอะไร"
        onContinue={() => setStep("pick")}
      />
    );
  }

  if (step === "discuss") {
    const elapsedSec = discussStartMs !== null ? Math.max(0, (nowMs - discussStartMs) / 1000) : 0;
    return (
      <section className="scene-panel topic-discuss">
        <h2>🗣️ คุยกันหาสายลับ</h2>
        <p className="big-callout">เล่ากันทีละคนว่าเห็นรูปอะไร — ใครเล่าไม่ตรงกับคนอื่น คนนั้นอาจเป็นสายลับ (หรือคนสติแตกป่วนก็ได้ 🤪)</p>
        {timerOn && <div className="topic-timer">⏱ {formatClock(elapsedSec)}</div>}
        <div className="button-row">
          <GameButton variant="paper" onClick={() => setTimerOn((v) => !v)}>{timerOn ? "🙈 ซ่อนเวลา" : "⏱ จับเวลา"}</GameButton>
          <GameButton onClick={goHome}>จบ กลับ Home</GameButton>
        </div>
      </section>
    );
  }

  // step === "view"
  const imageUrl = imageForRole(role, imageA, imageB);
  return (
    <section className="scene-panel topic-view">
      <h2>ภาพของ {player?.name ?? "คุณ"}</h2>
      <HoldToReveal
        coverLabel={<>🔒 แตะค้างที่ลายนิ้วมือด้านล่างเพื่อดูภาพ<br /><small>วางนิ้วที่ลายนิ้วมือ (ขวา) — ภาพโชว์ด้านบน มือไม่บัง · ปล่อยนิ้ว = ปิด</small></>}
      >
        <img
          className="topic-view__img"
          src={imageUrl}
          alt="ภาพของคุณ"
          onError={(event) => { event.currentTarget.style.opacity = "0.3"; }}
        />
      </HoldToReveal>
      <div className="button-row">
        <GameButton
          variant="paper"
          onClick={() => {
            if (selectedId) setViewedIds((current) => new Set(current).add(selectedId));
            setStep("curtain");
          }}
        >
          ดูเสร็จแล้ว — ปิดจอ ส่งต่อ
        </GameButton>
      </div>
    </section>
  );
}
