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
  const player = state.players.find((candidate) => candidate.id === selectedPlayerId) ?? null;
  const role = selectedPlayerId ? state.roles[selectedPlayerId] : "normal";
  const partnerId = selectedPlayerId ? findSpyPartner(state.roles, selectedPlayerId) : null;
  const partner = state.players.find((candidate) => candidate.id === partnerId) ?? null;

  if (step === "pick") {
    return (
      <PlayerPicker
        title="เลือกชื่อตัวเองเพื่อดูบทบาท"
        lead="เดินมาที่เครื่องทีละคน 🕵️ คนอื่นห้ามแอบดู — ดูเสร็จกดปิดก่อนส่งต่อ"
        players={state.players}
        onPick={(playerId) => {
          setSelectedPlayerId(playerId);
          setStep("confirm");
        }}
      />
    );
  }

  if (step === "confirm" && player) {
    return <ConfirmPlayer player={player} actionLabel="ดูบทบาท" onBack={() => setStep("pick")} onConfirm={() => setStep("reveal")} />;
  }

  if (step === "curtain") {
    return <HandOffCurtain message="ส่งเครื่องให้คนถัดไป" onContinue={() => setStep("pick")} />;
  }

  return (
    <section className="scene-panel role-reveal">
      <div className="role-portrait">
        <img
          className={`role-portrait__img${role !== "normal" ? " role-portrait__img--spy" : ""}`}
          src={role === "normal" ? gameAssets.roleNormal : gameAssets.roleSpy}
          alt={role === "normal" ? "ผู้เล่นปกติ" : "สายลับ"}
        />
        {role !== "normal" && partner && (
          <img className="role-portrait__badge" src={gameAssets.spyPairBadge} alt="ตราคู่สายลับ" onError={(event) => { event.currentTarget.style.display = "none"; }} />
        )}
      </div>
      <h2>{role === "normal" ? "คุณคือผู้เล่นปกติ" : `คุณคือสายลับ ${role === "spyA" ? "A" : "B"}`}</h2>
      {role !== "normal" && partner && (
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
      {role !== "normal" && state.shield.exists && !state.shield.consumed && state.shield.slot === role && (
        <div className="shield-callout">
          <img className="shield-callout__img" src={itemCardAssets.spyShield} alt="เกราะสายลับ" onError={(event) => { event.currentTarget.style.display = "none"; }} />
          <p className="big-callout">🛡️ slot ของคุณมีเกราะป้องกัน 1 ครั้ง — เก็บไว้เป็นความลับนะ</p>
        </div>
      )}
      <div className="button-row">
        <GameButton onClick={() => setStep("curtain")}>ปิดบทบาท</GameButton>
        <GameButton variant="paper" onClick={() => setState((current) => ({ ...current, phase: "home" }))}>
          กลับ Home
        </GameButton>
      </div>
    </section>
  );
}
