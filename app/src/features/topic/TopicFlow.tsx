import { useEffect, useState } from "react";
import { gameAssets } from "../../data/assets";
import type { PlayerId } from "../../domain/types";
import { rolesAssigned } from "../../state/actions";
import { clearTopicImages, getTopicImages, saveTopicImages } from "../../state/topicImages";
import { clearLeaked, getLeaked, saveLeaked } from "../../state/topicLeaked";
import { useGameStore } from "../../state/useGameStore";
import { ConfirmPlayer } from "../../ui/components/ConfirmPlayer";
import { GameButton } from "../../ui/components/GameButton";
import { HandOffCurtain } from "../../ui/components/HandOffCurtain";
import { PlayerCard } from "../../ui/components/PlayerCard";
import { ThemedIcon } from "../../ui/components/ThemedIcon";
import { topicViewFor } from "./topicImage";

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
  // จำลิงก์รูปเดิมจาก localStorage — เปิดเข้ามาใหม่ดูรูปเดิมได้เลย
  const [imageA, setImageA] = useState(() => getTopicImages().a);
  const [imageB, setImageB] = useState(() => getTopicImages().b);
  // มีรูปจำไว้แล้ว → เข้าโหมด "พร้อม" (ซ่อนลิงก์+พรีวิว กันสปอยล์) · ยังไม่มี/กดรีเซต → โหมดกรอก
  const [editing, setEditing] = useState(() => {
    const saved = getTopicImages();
    return saved.a.trim() === "" || saved.b.trim() === "";
  });
  const [selectedId, setSelectedId] = useState<PlayerId | null>(null);
  const [viewedIds, setViewedIds] = useState<Set<PlayerId>>(() => new Set());
  const [holding, setHolding] = useState(false);
  // "คนรั่ว" — ผู้เล่นปกติ 1 คนที่ถูกสุ่มให้เห็นรูปสปาย · จำไว้ใน localStorage
  // ค้างคนเดิมจนกว่าจะเปลี่ยน/รีเซตรูป (กดดูซ้ำได้ผลเหมือนเดิมทุกครั้ง)
  const [leakedId, setLeakedId] = useState<PlayerId | null>(() => getLeaked());
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

  // เริ่มดูรอบใหม่ — คง "คนรั่ว" คนเดิมไว้ถ้ายังใช้ได้ (มาเล่น + ยังเป็นคนปกติ)
  // ให้กดดูซ้ำได้ผลเหมือนเดิมจนกว่าจะเปลี่ยน/รีเซตรูป · forceNew=true บังคับสุ่มใหม่ (ตอนเปลี่ยนรูป)
  function startViewing(forceNew = false) {
    const normals = presentPlayers.filter((p) => state.roles[p.id] === "normal");
    const keepValid = !forceNew && leakedId !== null && normals.some((p) => p.id === leakedId);
    if (!keepValid) {
      const next = normals.length > 0 ? normals[Math.floor(Math.random() * normals.length)].id : null;
      setLeakedId(next);
      saveLeaked(next);
    }
    setViewedIds(new Set());
    setStep("pick");
  }

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
    // เปลี่ยน/รีเซตรูป → ล้างคนรั่วเดิม เพื่อสุ่มใหม่ให้ชุดรูปใหม่
    const resetImages = () => { setImageA(""); setImageB(""); clearTopicImages(); clearLeaked(); setLeakedId(null); setEditing(true); };

    // โหมด "พร้อม" — มีรูปจำไว้แล้ว ซ่อนลิงก์+พรีวิว (กันสปอยล์) เห็นแค่ปุ่มรีเซต
    if (!editing && ready) {
      return (
        <section className="scene-panel topic-input">
          <h2>🖼️ โหมดดูภาพหาสายลับ</h2>
          <p className="big-callout">✅ ใส่รูปไว้แล้ว — ซ่อนลิงก์ไว้กันสปอยล์ พร้อมเดินให้ทุกคนดูภาพได้เลย</p>
          <p className="scene-lead">อยากเปลี่ยนรูปใหม่? กด "รีเซตรูป" เพื่อวางลิงก์ใหม่</p>
          <div className="button-row">
            <GameButton variant="paper" onClick={goHome}>← กลับ Home</GameButton>
            <GameButton variant="paper" onClick={resetImages}>♻️ รีเซตรูป</GameButton>
            <GameButton onClick={() => startViewing()}>เริ่มดูภาพ ➜</GameButton>
          </div>
        </section>
      );
    }

    // โหมด "กรอก" — ยังไม่มีรูป/กดรีเซต ให้วางลิงก์ (มีพรีวิวยืนยันตอนตั้งค่า)
    return (
      <section className="scene-panel topic-input">
        <h2>🖼️ โหมดดูภาพหาสายลับ</h2>
        <p className="scene-lead">
          วางลิงก์รูป 2 รูป — คนปกติเห็นรูป A · สายลับ + คนปกติที่ถูกสุ่ม "รั่ว" 1 คนเห็นรูป B · คนบ้าไม่เห็นภาพ · เดินดูทีละคน แล้วคุยกันหาว่าใครเห็นรูปต่าง · ลิงก์จะถูกจำไว้ เปิดมาใหม่ดูรูปเดิมได้เลย
        </p>
        <label className="topic-field">
          <span>รูป A — ผู้เล่นปกติ</span>
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
          <GameButton
            disabled={!ready}
            onClick={() => { saveTopicImages(imageA.trim(), imageB.trim()); setEditing(false); startViewing(true); }}
          >
            บันทึกรูป & เริ่มดูภาพ ➜
          </GameButton>
        </div>
      </section>
    );
  }

  if (step === "pick") {
    // โชว์ทุกคนเสมอ — คนที่ดูแล้วก็กดดูซ้ำได้ (มีป้าย "ดูแล้ว") · กด "ไปคุยกัน" เมื่อพร้อม
    return (
      <section className="scene-panel">
        <h2>ใครจะดูภาพ?</h2>
        <p className="scene-lead">
          แตะชื่อตัวเองเพื่อดูภาพ (กดดูซ้ำได้) 🤫 คนอื่นห้ามแอบมองจอ · ดูแล้ว {viewedIds.size}/{presentCount} คน
        </p>
        <div className="player-grid player-grid--pick player-grid--compact">
          {presentPlayers.map((p) => (
            <PlayerCard
              key={p.id}
              player={p}
              badge={viewedIds.has(p.id) ? "👁 ดูแล้ว" : undefined}
              onClick={() => { setSelectedId(p.id); setStep("confirm"); }}
            />
          ))}
        </div>
        <div className="button-row">
          <GameButton variant="paper" onClick={() => setStep("input")}>← เปลี่ยนรูป</GameButton>
          <GameButton
            disabled={viewedIds.size === 0}
            onClick={() => { setDiscussStartMs(Date.now()); setNowMs(Date.now()); setStep("discuss"); }}
          >
            🗣️ ไปคุยกัน!
          </GameButton>
        </div>
      </section>
    );
  }

  if (step === "confirm" && player) {
    return <ConfirmPlayer player={player} actionLabel="ใช่ฉันเอง — ดูภาพ" onBack={() => setStep("pick")} onConfirm={() => { setHolding(false); setStep("view"); }} />;
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
        <p className="big-callout">เล่ากันทีละคนว่าเห็นรูปอะไร — ใครเล่าไม่ตรงกับคนอื่น คนนั้นอาจเป็นสายลับ (หรือคนบ้าป่วนก็ได้ 🤪)</p>
        {timerOn && <div className="topic-timer">⏱ {formatClock(elapsedSec)}</div>}
        <div className="button-row">
          <GameButton variant="paper" onClick={() => setTimerOn((v) => !v)}>{timerOn ? "🙈 ซ่อนเวลา" : "⏱ จับเวลา"}</GameButton>
          <GameButton onClick={goHome}>จบ กลับ Home</GameButton>
        </div>
      </section>
    );
  }

  // step === "view"
  // "คนรั่ว" เห็นรูปสปาย (B) โดยไม่มีป้ายบอก — ตัวเองก็ไม่รู้ว่าเห็นรูปปกติหรือรูปสปาย
  const view = topicViewFor(role, selectedId !== null && selectedId === leakedId, imageA, imageB);
  if (!holding) {
    return (
      <section className="scene-panel role-reveal role-reveal--cover">
        <h2>ภาพของ {player?.name ?? "คุณ"}</h2>
        <p className="big-callout">👇 กดปุ่มค้างไว้เพื่อดูภาพ — ปล่อยนิ้วเมื่อไหร่ ปิดทันที</p>
        <button
          type="button"
          className="role-hold-btn"
          onPointerDown={(event) => { event.preventDefault(); setHolding(true); }}
          onContextMenu={(event) => event.preventDefault()}
        >
          <span className="role-hold-btn__label">🖼️ กดค้างเพื่อดูภาพ</span>
          <ThemedIcon className="role-hold-btn__fingerprint" src={gameAssets.iconFingerprint} emoji="🫲" />
        </button>
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
  return (
    <section
      className="scene-panel topic-view"
      onPointerUp={() => setHolding(false)}
      onPointerCancel={() => setHolding(false)}
      onPointerLeave={() => setHolding(false)}
    >
      {view.kind === "jester" ? (
        <div className="topic-view__jester">
          <span className="topic-view__jester-emoji">🤪</span>
          <p className="topic-view__jester-text">คนบ้า — ไม่มีภาพให้ดู</p>
          <p className="topic-view__jester-sub">เนียนๆ ทำเป็นเห็นภาพ แล้วป่วนให้สุด 😜</p>
        </div>
      ) : (
        <img
          className="topic-view__img"
          src={view.url}
          alt="ภาพของคุณ"
          onError={(event) => { event.currentTarget.style.opacity = "0.3"; }}
        />
      )}
      <p className="role-hold-hint">✊ กดค้างอยู่ — ปล่อยนิ้วเมื่อไหร่ ปิดทันที</p>
    </section>
  );
}
