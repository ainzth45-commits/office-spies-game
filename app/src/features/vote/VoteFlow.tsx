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

  if (step === "open") {
    return (
      <section className="scene-panel">
        <img className="scene-hero" src={gameAssets.ballotBox} alt="" aria-hidden="true" onError={(event) => { event.currentTarget.style.display = "none"; }} />
        <h2>เปิดโหวตวันนี้</h2>
        <p className="big-callout">รวมเหรียญจ่ายที่ซุป: {openCost} เหรียญ</p>
        {message && <p className="form-error">{message}</p>}
        <div className="button-row">
          <GameButton onClick={startVote}>ยืนยันว่าจ่ายครบแล้ว</GameButton>
          <GameButton variant="paper" onClick={() => setState((current) => ({ ...current, phase: "home" }))}>
            กลับ Home
          </GameButton>
        </div>
      </section>
    );
  }

  if (step === "pickVoter") {
    if (remainingPlayers.length === 0) {
      return (
        <section className="scene-panel">
          <h2>โหวตครบแล้ว</h2>
          <p className="big-callout">พร้อมประกาศผลบนจอใหญ่</p>
          <div className="button-row">
            <GameButton onClick={() => setState((current) => ({ ...current, phase: "voteResult" }))}>ไปหน้าประกาศผล</GameButton>
          </div>
        </section>
      );
    }
    return (
      <PlayerPicker
        title={`เลือกผู้โหวต (${state.currentVote?.submittedVoterIds.length ?? 0}/${state.currentVote?.presentPlayerIds.length ?? presentPlayers.length})`}
        lead="เดินมาลงคะแนนทีละคน 🗳️ เลือกชื่อตัวเอง คนอื่นห้ามแอบดูว่าโหวตใคร"
        players={remainingPlayers}
        onPick={(playerId) => {
          setSelectedVoterId(playerId);
          setStep("confirm");
        }}
      />
    );
  }

  if (step === "confirm" && voter) {
    return <ConfirmPlayer player={voter} actionLabel="ลงคะแนนลับ" onBack={resetTurn} onConfirm={() => setStep("ballot")} />;
  }

  if (step === "curtain") {
    return <HandOffCurtain message="ส่งเครื่องให้ผู้โหวตคนถัดไป" onContinue={resetTurn} />;
  }

  return (
    <section className="scene-panel vote-ballot">
      <h2>ลงคะแนนลับ</h2>
      {voter && <p className="big-callout">{voter.name} เลือกเป้าหมายและไอเทมที่จะใช้</p>}
      {message && <p className="form-error">{message}</p>}
      <h3>เลือกเป้าหมาย</h3>
      <div className="player-grid player-grid--compact">
        {presentPlayers.map((player) => (
          <PlayerCard key={player.id} player={player} selected={targetId === player.id} onClick={() => setTargetId(player.id)} />
        ))}
      </div>
      <h3>กระเป๋าไอเทม</h3>
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
        <GameButton disabled={!targetId} onClick={submitBallot}>ยืนยันโหวต</GameButton>
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
