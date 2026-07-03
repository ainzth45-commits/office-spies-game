import { useState } from "react";
import { gameAssets, itemCardAssets } from "../../data/assets";
import { findSpyPartner } from "../../domain/roleEngine";
import type { PlayerId } from "../../domain/types";
import { useGameStore } from "../../state/useGameStore";
import { ConfirmPlayer } from "../../ui/components/ConfirmPlayer";
import { GameButton } from "../../ui/components/GameButton";
import { HandOffCurtain } from "../../ui/components/HandOffCurtain";
import { PlayerPicker } from "../../ui/components/PlayerPicker";

type Step = "pick" | "confirm" | "reveal" | "curtain";

export function RoleRevealFlow() {
  const { state, setState } = useGameStore();
  const [step, setStep] = useState<Step>("pick");
  const [selectedPlayerId, setSelectedPlayerId] = useState<PlayerId | null>(null);
  // กดค้างถึงเห็นการ์ด — ปล่อยนิ้ว/วางเครื่อง = ซ่อนทันที ไม่มีทางค้างให้คนอื่นเห็น
  const [holding, setHolding] = useState(false);
  // จดว่าใครเปิดดูไปแล้วบ้าง (เฉพาะรอบการเวียนนี้) — โชว์คืบหน้าให้ทั้งวงเห็น
  const [viewedIds, setViewedIds] = useState<Set<PlayerId>>(() => new Set());
  const player = state.players.find((candidate) => candidate.id === selectedPlayerId) ?? null;
  const role = selectedPlayerId ? state.roles[selectedPlayerId] : "normal";
  const partnerId = selectedPlayerId ? findSpyPartner(state.roles, selectedPlayerId) : null;
  const partner = state.players.find((candidate) => candidate.id === partnerId) ?? null;

  if (step === "pick") {
    return (
      <PlayerPicker
        title={`ใครยังไม่ดูบทบาท? (ดูแล้ว ${viewedIds.size}/${state.players.length})`}
        lead="เดินมาที่เครื่องทีละคน 🕵️ แตะชื่อตัวเอง — คนอื่นห้ามแอบมอง"
        players={state.players.filter((candidate) => !viewedIds.has(candidate.id))}
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
    if (viewedIds.size >= state.players.length) {
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
        sub={`ดูบทบาทแล้ว ${viewedIds.size}/${state.players.length} คน`}
        hint="หน้านิ่งเข้าไว้ 😐 อย่าให้ใครจับสีหน้าได้"
        onContinue={() => setStep("pick")}
      />
    );
  }

  const isSpy = role !== "normal";
  const showPartner = isSpy && partner;
  const showShield = isSpy && state.shield.exists && !state.shield.consumed && state.shield.slot === role;
  const hasAside = showPartner || showShield;

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
          🕵️ กดค้างเพื่อดูบทบาท
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
              className={`role-portrait__img${isSpy ? " role-portrait__img--spy" : ""}`}
              src={role === "normal" ? gameAssets.roleNormal : gameAssets.roleSpy}
              alt={role === "normal" ? "ผู้เล่นปกติ" : "สายลับ"}
            />
            {showPartner && (
              <img className="role-portrait__badge" src={gameAssets.spyPairBadge} alt="ตราคู่สายลับ" onError={(event) => { event.currentTarget.style.display = "none"; }} />
            )}
          </div>
          <h2>{role === "normal" ? "คุณคือผู้เล่นปกติ" : `คุณคือสายลับ ${role === "spyA" ? "A" : "B"}`}</h2>
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
