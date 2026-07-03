import { useMemo, useState } from "react";
import { gameAssets } from "../../data/assets";
import { itemCatalog } from "../../data/items";
import { calculateVoteCost } from "../../domain/economy";
import type { Player, PlayerId, VoteItemType } from "../../domain/types";
import { openVote, submitVoteTurn } from "../../state/actions";
import { useGameStore } from "../../state/useGameStore";
import { ConfirmPlayer } from "../../ui/components/ConfirmPlayer";
import { GameButton } from "../../ui/components/GameButton";
import { HandOffCurtain } from "../../ui/components/HandOffCurtain";
import { PlayerCard } from "../../ui/components/PlayerCard";
import { PlayerPicker } from "../../ui/components/PlayerPicker";

type Step = "open" | "pickVoter" | "confirm" | "ballot" | "curtain";

const effectItemTypes: VoteItemType[] = ["remove", "swap", "reduceThreshold", "protectThreshold"];

export function VoteFlow() {
  const { state, setState } = useGameStore();
  const [step, setStep] = useState<Step>(state.currentVote ? "pickVoter" : "open");
  const [selectedVoterId, setSelectedVoterId] = useState<PlayerId | null>(null);
  const [targetId, setTargetId] = useState<PlayerId | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [swapFirstId, setSwapFirstId] = useState<PlayerId | "">("");
  const [swapSecondId, setSwapSecondId] = useState<PlayerId | "">("");
  const [message, setMessage] = useState("");
  const presentPlayers = state.players.filter((player) => state.attendance[player.id]);
  const remainingPlayers = state.currentVote
    ? presentPlayers.filter((player) => !state.currentVote?.submittedVoterIds.includes(player.id))
    : presentPlayers;
  const voter = state.players.find((player) => player.id === selectedVoterId) ?? null;
  const inventory = selectedVoterId ? state.inventories[selectedVoterId] ?? [] : [];
  const selectedItem = inventory.find((item) => item.id === selectedItemId) ?? null;
  const openCost = useMemo(
    () =>
      calculateVoteCost(
        presentPlayers.length,
        state.voteCostState.accumulatedSkippedMultiplier,
        state.voteCostState.nextVoteMultiplier,
        state.config,
      ),
    [presentPlayers.length, state.config, state.voteCostState.accumulatedSkippedMultiplier, state.voteCostState.nextVoteMultiplier],
  );

  function startVote() {
    try {
      setState((current) => openVote(current));
      setStep("pickVoter");
      setMessage("");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "เปิดโหวตไม่สำเร็จ");
    }
  }

  function submitBallot() {
    if (!selectedVoterId || !targetId) return;
    try {
      setState((current) =>
        submitVoteTurn(current, {
          voterId: selectedVoterId,
          targetId,
          doubleItemId: selectedItem?.type === "double" ? selectedItem.id : undefined,
          effectItem: selectedItem && effectItemTypes.includes(selectedItem.type)
            ? {
                id: selectedItem.id,
                type: selectedItem.type as Exclude<VoteItemType, "double">,
                targetId,
                firstTargetId: swapFirstId || undefined,
                secondTargetId: swapSecondId || undefined,
              }
            : undefined,
        }),
      );
      setStep("curtain");
      setMessage("");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "ส่งโหวตไม่สำเร็จ");
    }
  }

  function resetTurn() {
    setSelectedVoterId(null);
    setTargetId(null);
    setSelectedItemId(null);
    setSwapFirstId("");
    setSwapSecondId("");
    setStep("pickVoter");
  }

  const votedCount = state.currentVote?.submittedVoterIds.length ?? 0;
  const totalCount = state.currentVote?.presentPlayerIds.length ?? presentPlayers.length;

  if (step === "open") {
    return (
      <section className="scene-panel">
        <img className="scene-hero" src={gameAssets.ballotBox} alt="" aria-hidden="true" onError={(event) => { event.currentTarget.style.display = "none"; }} />
        <h2>📢 เปิดคดีล่าสายลับ!</h2>
        <p className="big-callout">ค่าเปิดโหวตรอบนี้ {openCost} เหรียญ — ทั้งทีมช่วยกันลงขัน วางที่ซุปให้ครบ</p>
        <p className="scene-lead">โหวตครบทุกคนแล้วถึงจะเปิดผล ใครโดนเสียงถล่มถึงเกณฑ์... ได้รู้กัน 🕵️‍♀️</p>
        {message && <p className="form-error">{message}</p>}
        <div className="button-row">
          <GameButton onClick={startVote}>💰 วางเหรียญครบแล้ว — เปิดโหวต!</GameButton>
          <GameButton variant="paper" onClick={() => setState((current) => ({ ...current, phase: "home" }))}>
            ยังก่อน กลับ Home
          </GameButton>
        </div>
      </section>
    );
  }

  if (step === "pickVoter") {
    if (remainingPlayers.length === 0) {
      return (
        <section className="scene-panel">
          <h2>🔒 ครบทุกเสียงแล้ว!</h2>
          <p className="big-callout">หีบคะแนนปิดผนึกเรียบร้อย ไม่มีใครแก้ได้อีก</p>
          <p className="scene-lead">เรียกทุกคนมารวมหน้าจอ... ถึงเวลารู้กันว่าใครโดน</p>
          <div className="button-row">
            <GameButton onClick={() => setState((current) => ({ ...current, phase: "voteResult" }))}>📣 ไปเปิดผลกัน!</GameButton>
          </div>
        </section>
      );
    }
    return (
      <PlayerPicker
        title={`ใครยังไม่ลงคะแนน? (ลงแล้ว ${votedCount}/${totalCount})`}
        lead="เดินมารับเครื่องทีละคน 🤫 แตะชื่อตัวเอง — คนอื่นห้ามเดินตามมาดู!"
        players={remainingPlayers}
        onPick={(playerId) => {
          setSelectedVoterId(playerId);
          setStep("confirm");
        }}
      />
    );
  }

  if (step === "confirm" && voter) {
    return <ConfirmPlayer player={voter} actionLabel="ใช่ฉันเอง — เข้าคูหา" onBack={resetTurn} onConfirm={() => setStep("ballot")} />;
  }

  if (step === "curtain") {
    return (
      <HandOffCurtain
        message="คว่ำเครื่อง แล้วส่งต่อ"
        sub={`ลงคะแนนแล้ว ${votedCount}/${totalCount} · เหลืออีก ${totalCount - votedCount} เสียง`}
        hint="เสียงคุณถูกเก็บเข้าหีบแล้ว 🤐 ใครถามก็ยิ้มอย่างเดียวพอ"
        onContinue={resetTurn}
      />
    );
  }

  return (
    <section className="scene-panel vote-ballot">
      <h2>🗳️ คูหาลับของ {voter?.name ?? "คุณ"}</h2>
      <p className="big-callout">แตะหน้าคนที่คุณสงสัยว่าเป็นสายลับ — ไม่มีใครรู้ว่าคุณเลือกใคร</p>
      {message && <p className="form-error">{message}</p>}
      <h3>🎯 เป้าหมายของคุณ</h3>
      <div className="player-grid player-grid--compact">
        {presentPlayers.map((player) => (
          <PlayerCard key={player.id} player={player} selected={targetId === player.id} onClick={() => setTargetId(player.id)} />
        ))}
      </div>
      <h3>🎒 ของลับในกระเป๋า {inventory.length === 0 ? "— ว่างเปล่า (สุ่มได้จากตู้กาชา)" : "— ใช้ตอนนี้ ไม่มีใครเห็น"}</h3>
      <div className="item-strip">
        <GameButton variant={selectedItemId === null ? "primary" : "paper"} onClick={() => setSelectedItemId(null)}>
          ไม่ใช้ไอเทม
        </GameButton>
        {inventory.map((item) => (
          <GameButton key={item.id} variant={selectedItemId === item.id ? "primary" : "paper"} onClick={() => setSelectedItemId(item.id)}>
            {labelItem(item.type)}
          </GameButton>
        ))}
      </div>
      {selectedItem?.type === "swap" && <SwapPicker players={presentPlayers} first={swapFirstId} second={swapSecondId} onFirst={setSwapFirstId} onSecond={setSwapSecondId} />}
      <div className="button-row">
        <GameButton disabled={!targetId} onClick={submitBallot}>🔒 หย่อนบัตรลงหีบ</GameButton>
        <GameButton variant="paper" onClick={resetTurn}>ย้อนกลับ</GameButton>
      </div>
    </section>
  );
}

function labelItem(type: VoteItemType): string {
  return itemCatalog.find((item) => item.type === type)?.label ?? type;
}

function SwapPicker({
  players,
  first,
  second,
  onFirst,
  onSecond,
}: {
  players: Player[];
  first: PlayerId | "";
  second: PlayerId | "";
  onFirst: (playerId: PlayerId | "") => void;
  onSecond: (playerId: PlayerId | "") => void;
}) {
  return (
    <div className="swap-picker">
      <label>
        สลับคนที่ 1
        <select value={first} onChange={(event) => onFirst(event.target.value)}>
          <option value="">เลือกคน</option>
          {players.map((player) => (
            <option key={player.id} value={player.id}>{player.name}</option>
          ))}
        </select>
      </label>
      <label>
        สลับคนที่ 2
        <select value={second} onChange={(event) => onSecond(event.target.value)}>
          <option value="">เลือกคน</option>
          {players.map((player) => (
            <option key={player.id} value={player.id}>{player.name}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
