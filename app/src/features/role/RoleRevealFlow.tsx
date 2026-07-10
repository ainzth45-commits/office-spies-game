import { useState } from "react";
import { gameAssets, itemCardAssets } from "../../data/assets";
import { findSpyPartner } from "../../domain/roleEngine";
import type { PlayerId } from "../../domain/types";
import { assignNewRoles, rolesAssigned } from "../../state/actions";
import { useGameStore } from "../../state/useGameStore";
import { ConfirmPlayer } from "../../ui/components/ConfirmPlayer";
import { GameButton } from "../../ui/components/GameButton";
import { HandOffCurtain } from "../../ui/components/HandOffCurtain";
import { PlayerCard } from "../../ui/components/PlayerCard";
import { PlayerPicker } from "../../ui/components/PlayerPicker";
import { ThemedIcon } from "../../ui/components/ThemedIcon";

type Step = "attendance" | "pick" | "confirm" | "reveal" | "curtain";

export function RoleRevealFlow() {
  const { state, setState } = useGameStore();
  // เกมใหม่ (ยังไม่สุ่มบทบาท) → เริ่มที่จอตั้งคนมา · เข้ามาดูซ้ำ (สุ่มแล้ว) → ข้ามไปหน้าเลือกคนดูเลย
  const [step, setStep] = useState<Step>(() => (rolesAssigned(state) ? "pick" : "attendance"));
  const [attendanceError, setAttendanceError] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState<PlayerId | null>(null);
  // เฉพาะคนที่มาวันนี้ (คนลาไม่ต้องเวียนดูบทบาท และไม่มีวันเป็นสปาย)
  const presentPlayers = state.players.filter((candidate) => state.attendance[candidate.id]);
  const presentCount = presentPlayers.length;
  // กดค้างถึงเห็นการ์ด — ปล่อยนิ้ว/วางเครื่อง = ซ่อนทันที ไม่มีทางค้างให้คนอื่นเห็น
  const [holding, setHolding] = useState(false);
  // จดว่าใครเปิดดูไปแล้วบ้าง (เฉพาะรอบการเวียนนี้) — โชว์คืบหน้าให้ทั้งวงเห็น
  const [viewedIds, setViewedIds] = useState<Set<PlayerId>>(() => new Set());
  const player = state.players.find((candidate) => candidate.id === selectedPlayerId) ?? null;
  const role = selectedPlayerId ? state.roles[selectedPlayerId] : "normal";
  const partnerId = selectedPlayerId ? findSpyPartner(state.roles, selectedPlayerId) : null;
  const partner = state.players.find((candidate) => candidate.id === partnerId) ?? null;

  // จอตั้งคนมา/ไม่มา ก่อนล็อคบทบาท — สายลับจะสุ่มจากคนที่ "มา" เท่านั้น (วันแรกของเกม)
  if (step === "attendance") {
    return (
      <section className="scene-panel">
        <h2>👥 ใครมาเล่นวันนี้บ้าง?</h2>
        <p className="big-callout">แตะสลับคนมา/ลา ก่อนแจกบทบาท — สายลับจะตกอยู่กับ "คนที่มา" เท่านั้น</p>
        <p className="scene-lead">มาแล้ว {presentCount} คน · คนที่ลาวันนี้ ถ้ามาวันหลังจะเข้าเป็นผู้เล่นปกติ (ไม่มีวันเป็นสายลับ)</p>
        {attendanceError && <p className="form-error">{attendanceError}</p>}
        <div className="player-grid player-grid--pick player-grid--compact">
          {state.players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              dimmed={!state.attendance[player.id]}
              badge={state.attendance[player.id] ? "✅ มา" : "😴 ลา"}
              onClick={() =>
                setState((current) => ({
                  ...current,
                  attendance: { ...current.attendance, [player.id]: !current.attendance[player.id] },
                }))
              }
            />
          ))}
        </div>
        <div className="button-row">
          <GameButton
            onClick={() => {
              if (presentCount < 2) {
                setAttendanceError("ต้องมีคนมาอย่างน้อย 2 คนถึงจะแจกบทบาทได้");
                return;
              }
              try {
                setState((current) => assignNewRoles(current));
                setAttendanceError("");
                setStep("pick");
              } catch (caught) {
                setAttendanceError(caught instanceof Error ? caught.message : "แจกบทบาทไม่สำเร็จ");
              }
            }}
          >
            🔒 ล็อครายชื่อ — แจกบทบาท!
          </GameButton>
        </div>
      </section>
    );
  }

  if (step === "pick") {
    const remaining = presentPlayers.filter((candidate) => !viewedIds.has(candidate.id));
    return (
      <PlayerPicker
        title={`ใครยังไม่ดูบทบาท? (ดูแล้ว ${viewedIds.size}/${presentCount})`}
        lead="เดินมาที่เครื่องทีละคน 🕵️ แตะชื่อตัวเอง — คนอื่นห้ามแอบมอง"
        players={remaining}
        onPick={(playerId) => {
          setSelectedPlayerId(playerId);
          setStep("confirm");
        }}
      />
    );
  }

  if (step === "confirm" && player) {
    return <ConfirmPlayer player={player} actionLabel="ใช่ฉันเอง — เปิดแฟ้มลับ" onBack={() => setStep("pick")} onConfirm={() => { setHolding(false); setStep("reveal"); }} />;
  }

  if (step === "curtain") {
    if (viewedIds.size >= presentCount) {
      return (
        <section className="scene-panel">
          <h2>✅ รู้ตัวกันครบทุกคนแล้ว</h2>
          <p className="big-callout">สายลับ 2 คนแฝงอยู่ในวงเรียบร้อย... เกมเริ่มแล้วนับจากนี้ 🤫</p>
          <div className="button-row">
            <GameButton onClick={() => setState((current) => ({ ...current, phase: "home" }))}>กลับ Home เริ่มเกม!</GameButton>
          </div>
        </section>
      );
    }
    return (
      <HandOffCurtain
        message="ปิดแฟ้มแล้ว ส่งเครื่องต่อ"
        sub={`ดูบทบาทแล้ว ${viewedIds.size}/${presentCount} คน`}
        hint="หน้านิ่งเข้าไว้ 😐 อย่าให้ใครจับสีหน้าได้"
        onContinue={() => setStep("pick")}
      />
    );
  }

  const isSpy = role === "spyA" || role === "spyB";
  const isJester = role === "jester";
  const showPartner = isSpy && partner;
  const showShield = isSpy && state.shield.exists && !state.shield.consumed && state.shield.slot === role;
  const hasAside = showPartner || showShield; // คนสติแตกเล่นเดี่ยว ไม่มี aside

  // ยังไม่กดค้าง → โชว์แผ่นปิดแฟ้ม (ปล่อยนิ้วเมื่อไหร่ก็กลับมาหน้านี้)
  if (!holding) {
    return (
      <section className="scene-panel role-reveal role-reveal--cover">
        <h2>แฟ้มลับของ {player?.name ?? "คุณ"}</h2>
        <p className="big-callout">👇 กดปุ่มค้างไว้เพื่อเปิดดู — ปล่อยนิ้วเมื่อไหร่ แฟ้มปิดทันที</p>
        <button
          type="button"
          className="role-hold-btn"
          onPointerDown={(event) => { event.preventDefault(); setHolding(true); }}
          onContextMenu={(event) => event.preventDefault()}
        >
          <span className="role-hold-btn__label">🕵️ กดค้างเพื่อดูบทบาท</span>
          <ThemedIcon className="role-hold-btn__fingerprint" src={gameAssets.iconFingerprint} emoji="🫲" />
        </button>
        <div className="button-row">
          <GameButton
            variant="paper"
            onClick={() => {
              if (selectedPlayerId) setViewedIds((current) => new Set(current).add(selectedPlayerId));
              setStep("curtain");
            }}
          >
            ดูเสร็จแล้ว — ปิดแฟ้ม ส่งต่อ
          </GameButton>
        </div>
      </section>
    );
  }

  return (
    <section
      className="scene-panel role-reveal"
      onPointerUp={() => setHolding(false)}
      onPointerCancel={() => setHolding(false)}
      onPointerLeave={() => setHolding(false)}
    >
      <div className={`role-reveal__cols${hasAside ? "" : " role-reveal__cols--solo"}`}>
        <div className="role-reveal__main">
          <div className="role-portrait">
            <img
              className={`role-portrait__img${isSpy ? " role-portrait__img--spy" : ""}${isJester ? " role-portrait__img--jester" : ""}`}
              src={isSpy ? gameAssets.roleSpy : isJester ? gameAssets.roleJester : gameAssets.roleNormal}
              alt={isSpy ? "สายลับ" : isJester ? "พนักงานสติแตก" : "ผู้เล่นปกติ"}
              onError={(event) => { if (isJester) event.currentTarget.src = gameAssets.roleNormal; }}
            />
            {showPartner && (
              <img className="role-portrait__badge" src={gameAssets.spyPairBadge} alt="ตราคู่สายลับ" onError={(event) => { event.currentTarget.style.display = "none"; }} />
            )}
          </div>
          <h2>{isSpy ? `คุณคือสายลับ ${role === "spyA" ? "A" : "B"}` : isJester ? "🤪 คุณคือพนักงานสติแตก" : "คุณคือผู้เล่นปกติ"}</h2>
          {isJester && (
            <p className="big-callout role-reveal__jester-goal">
              เป้าหมายลับ: ทำตัวให้น่าสงสัยจน<b>โดนโหวตออก</b> — ถ้าโดนจับ คุณชนะเดี่ยว ทั้งทีมและสายลับแพ้! 🃏
              <br /><small>เล่นเดี่ยว ไม่มีพวก · อย่าให้ใครจับทางได้ว่าคุณ "อยากโดนโหวต"</small>
            </p>
          )}
        </div>

        {hasAside && (
          <div className="role-reveal__aside">
            {showPartner && (
              <div className="partner-callout">
                <p className="partner-callout__label">🤝 คู่หูของคุณคือ</p>
                <div className="partner-callout__card">
                  <img
                    className="partner-callout__photo"
                    src={partner.imageUrl}
                    alt={partner.name}
                    onError={(event) => { event.currentTarget.style.visibility = "hidden"; }}
                  />
                  <div className="partner-callout__name">{partner.name}</div>
                  <div className="partner-callout__code">{partner.code}</div>
                </div>
                <p className="partner-callout__hint">จำหน้าไว้ดีๆ แล้วช่วยกันแฝงตัวนะ 🤫</p>
              </div>
            )}
            {showShield && (
              <div className="shield-callout">
                <img className="shield-callout__img" src={itemCardAssets.spyShield} alt="เกราะสายลับ" onError={(event) => { event.currentTarget.style.display = "none"; }} />
                <p className="big-callout">🛡️ slot ของคุณมีเกราะป้องกัน 1 ครั้ง — เก็บไว้เป็นความลับนะ</p>
              </div>
            )}
          </div>
        )}
      </div>
      <p className="role-hold-hint">✊ กดค้างอยู่ — ปล่อยนิ้วเมื่อไหร่ แฟ้มปิดทันที</p>
    </section>
  );
}
