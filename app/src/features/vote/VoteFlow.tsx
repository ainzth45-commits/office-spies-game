import { useMemo, useState } from "react";
import { gameAssets, itemCardAssets } from "../../data/assets";
import { itemCatalog } from "../../data/items";
import { calculateVoteCost } from "../../domain/economy";
import type { Player, PlayerId, VoteItem, VoteItemType } from "../../domain/types";
import { openVote, submitVoteTurn } from "../../state/actions";
import { useGameStore } from "../../state/useGameStore";
import { ConfirmPlayer } from "../../ui/components/ConfirmPlayer";
import { GameButton } from "../../ui/components/GameButton";
import { HandOffCurtain } from "../../ui/components/HandOffCurtain";
import { PlayerCard } from "../../ui/components/PlayerCard";
import { PlayerPicker } from "../../ui/components/PlayerPicker";

type Step = "open" | "pickVoter" | "confirm" | "ballot" | "curtain";

// ไอเทมที่วางแผนจะใช้ในตานี้ (คนละส่วนกับการโหวต — โหวตยังต้องเลือกเป้าตามปกติ)
type PlannedItem =
  | { id: string; type: "double" }
  | { id: string; type: "remove"; targetId: PlayerId }
  | { id: string; type: "swap"; firstTargetId: PlayerId; secondTargetId: PlayerId }
  | { id: string; type: "reduceThreshold" }
  | { id: string; type: "protectThreshold" };

const itemDescriptions: Record<VoteItemType, string> = {
  double: "เสียงโหวตของคุณในตานี้ นับเป็น 2 เสียง — แค่กดใช้ แล้วไปเลือกเป้าโหวตตามปกติ",
  remove: "เลือก 1 คน เพื่อลบเสียงของคนนั้นลง 1 เสียง — ไม่เกี่ยวกับเสียงโหวตของคุณ ยังต้องโหวตตามปกติ",
  swap: "เลือก 2 คน เพื่อสลับจำนวนเสียงที่สองคนนั้นได้รับ — ไม่เกี่ยวกับเสียงโหวตของคุณ ยังต้องโหวตตามปกติ",
  reduceThreshold: "ลดเกณฑ์เสียงที่ต้องถึงของรอบนี้ลง 25% — โหวตโดนง่ายขึ้นทั้งรอบ",
  protectThreshold: "กันไม่ให้ไอเทม R ลดเกณฑ์ได้ผลในรอบนี้",
};

function labelItem(type: VoteItemType): string {
  return itemCatalog.find((item) => item.type === type)?.label ?? type;
}

export function VoteFlow() {
  const { state, setState } = useGameStore();
  const [step, setStep] = useState<Step>(state.currentVote ? "pickVoter" : "open");
  const [selectedVoterId, setSelectedVoterId] = useState<PlayerId | null>(null);
  const [targetId, setTargetId] = useState<PlayerId | null>(null);
  const [plannedItem, setPlannedItem] = useState<PlannedItem | null>(null);
  const [bagOpen, setBagOpen] = useState(false);
  const [message, setMessage] = useState("");
  const presentPlayers = state.players.filter((player) => state.attendance[player.id]);
  const remainingPlayers = state.currentVote
    ? presentPlayers.filter((player) => !state.currentVote?.submittedVoterIds.includes(player.id))
    : presentPlayers;
  const voter = state.players.find((player) => player.id === selectedVoterId) ?? null;
  const inventory = selectedVoterId ? state.inventories[selectedVoterId] ?? [] : [];
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

  function submitBallot() {
    if (!selectedVoterId || !targetId) return;
    try {
      setState((current) =>
        submitVoteTurn(current, {
          voterId: selectedVoterId,
          targetId,
          doubleItemId: plannedItem?.type === "double" ? plannedItem.id : undefined,
          effectItem:
            plannedItem && plannedItem.type !== "double"
              ? {
                  id: plannedItem.id,
                  type: plannedItem.type,
                  targetId: plannedItem.type === "remove" ? plannedItem.targetId : undefined,
                  firstTargetId: plannedItem.type === "swap" ? plannedItem.firstTargetId : undefined,
                  secondTargetId: plannedItem.type === "swap" ? plannedItem.secondTargetId : undefined,
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
    setPlannedItem(null);
    setBagOpen(false);
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
          <GameButton variant="paper" onClick={() => setState((current) => ({ ...current, phase: "home" }))}>
            ยังก่อน กลับ Home
          </GameButton>
          <GameButton
            onClick={() => {
              try {
                setState((current) => openVote(current));
                setStep("pickVoter");
                setMessage("");
              } catch (caught) {
                setMessage(caught instanceof Error ? caught.message : "เปิดโหวตไม่สำเร็จ");
              }
            }}
          >
            💰 วางเหรียญครบแล้ว — เปิดโหวต!
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
      <div className="player-grid player-grid--compact">
        {presentPlayers.map((player) => (
          <PlayerCard key={player.id} player={player} selected={targetId === player.id} onClick={() => setTargetId(player.id)} />
        ))}
      </div>
      {plannedItem && (
        <p className="planned-item">
          🎒 จะใช้: <b>{labelItem(plannedItem.type)}</b>
          {plannedItem.type === "remove" && ` → ลบเสียง ${presentPlayers.find((p) => p.id === plannedItem.targetId)?.name ?? ""}`}
          {plannedItem.type === "swap" &&
            ` → สลับ ${presentPlayers.find((p) => p.id === plannedItem.firstTargetId)?.name ?? ""} ↔ ${presentPlayers.find((p) => p.id === plannedItem.secondTargetId)?.name ?? ""}`}
          <button type="button" className="planned-item__cancel" onClick={() => setPlannedItem(null)}>✕ ไม่ใช้แล้ว</button>
        </p>
      )}
      <div className="button-row">
        <GameButton variant="paper" onClick={resetTurn}>ย้อนกลับ</GameButton>
        <GameButton variant="paper" onClick={() => setBagOpen(true)}>
          🎒 กระเป๋าไอเทม ({inventory.length})
        </GameButton>
        <GameButton disabled={!targetId} onClick={submitBallot}>🔒 หย่อนบัตรลงหีบ</GameButton>
      </div>

      {bagOpen && (
        <ItemBagModal
          inventory={inventory}
          players={presentPlayers}
          planned={plannedItem}
          onPlan={(planned) => {
            setPlannedItem(planned);
            setBagOpen(false);
          }}
          onClose={() => setBagOpen(false)}
        />
      )}
    </section>
  );
}

// กระเป๋าไอเทมในคูหา — เลือกไอเทม → อ่านคำอธิบาย → เลือกเป้า (ถ้าต้องมี) → ยืนยัน
function ItemBagModal({
  inventory,
  players,
  planned,
  onPlan,
  onClose,
}: {
  inventory: VoteItem[];
  players: Player[];
  planned: PlannedItem | null;
  onPlan: (planned: PlannedItem | null) => void;
  onClose: () => void;
}) {
  const [openedItem, setOpenedItem] = useState<VoteItem | null>(null);
  const [pickedIds, setPickedIds] = useState<PlayerId[]>([]);
  const [confirming, setConfirming] = useState(false);

  function resetDetail() {
    setOpenedItem(null);
    setPickedIds([]);
    setConfirming(false);
  }

  // จอเลือกไอเทมในกระเป๋า
  if (!openedItem) {
    return (
      <div className="overlay" onClick={onClose}>
        <div className="admin-menu bag-modal" onClick={(event) => event.stopPropagation()}>
          <h2>🎒 กระเป๋าไอเทมลับ</h2>
          {inventory.length === 0 ? (
            <p className="confirm-modal__body">กระเป๋าว่างเปล่า... ไอเทมสุ่มได้จากตู้กาชาเท่านั้น</p>
          ) : (
            <>
              <p className="confirm-modal__body">แตะไอเทมเพื่อดูว่ามันทำอะไร — ใช้ได้ตาละ 1 ชิ้น ไม่มีใครเห็นว่าคุณใช้</p>
              <div className="bag-grid">
                {inventory.map((item) => (
                  <button key={item.id} type="button" className="bag-item" onClick={() => setOpenedItem(item)}>
                    <img src={itemCardAssets[item.type]} alt="" aria-hidden="true" onError={(event) => { event.currentTarget.style.display = "none"; }} />
                    <span>{labelItem(item.type)}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          {planned && (
            <GameButton variant="paper" onClick={() => onPlan(null)}>✕ ยกเลิกไอเทมที่เลือกไว้ ({labelItem(planned.type)})</GameButton>
          )}
          <div className="button-row">
            <GameButton onClick={onClose}>ปิดกระเป๋า</GameButton>
          </div>
        </div>
      </div>
    );
  }

  const type = openedItem.type;
  const needsOne = type === "remove";
  const needsTwo = type === "swap";
  const readyToConfirm = needsOne ? pickedIds.length === 1 : needsTwo ? pickedIds.length === 2 : true;
  const pickedNames = pickedIds.map((id) => players.find((p) => p.id === id)?.name ?? "");

  function togglePick(playerId: PlayerId) {
    setPickedIds((current) => {
      if (current.includes(playerId)) return current.filter((id) => id !== playerId);
      const limit = needsTwo ? 2 : 1;
      return current.length >= limit ? [...current.slice(1), playerId] : [...current, playerId];
    });
    setConfirming(false);
  }

  function confirmUse() {
    if (type === "double") onPlan({ id: openedItem!.id, type: "double" });
    else if (type === "remove") onPlan({ id: openedItem!.id, type: "remove", targetId: pickedIds[0] });
    else if (type === "swap") onPlan({ id: openedItem!.id, type: "swap", firstTargetId: pickedIds[0], secondTargetId: pickedIds[1] });
    else if (type === "reduceThreshold") onPlan({ id: openedItem!.id, type: "reduceThreshold" });
    else onPlan({ id: openedItem!.id, type: "protectThreshold" });
  }

  return (
    <div className="overlay" onClick={resetDetail}>
      <div className="admin-menu bag-modal" onClick={(event) => event.stopPropagation()}>
        <div className="bag-detail__head">
          <img src={itemCardAssets[type]} alt="" aria-hidden="true" onError={(event) => { event.currentTarget.style.display = "none"; }} />
          <h2>{labelItem(type)}</h2>
        </div>
        <p className="confirm-modal__body">{itemDescriptions[type]}</p>

        {(needsOne || needsTwo) && (
          <>
            <p className="bag-detail__pick-label">
              {needsOne ? "แตะเลือก 1 คนที่จะโดนลบเสียง" : `แตะเลือก 2 คนที่จะสลับผลกัน (เลือกแล้ว ${pickedIds.length}/2)`}
            </p>
            <div className="player-grid player-grid--pick bag-detail__grid">
              {players.map((player) => (
                <PlayerCard key={player.id} player={player} selected={pickedIds.includes(player.id)} onClick={() => togglePick(player.id)} />
              ))}
            </div>
          </>
        )}

        {confirming ? (
          <div className="button-row">
            <GameButton variant="paper" onClick={() => setConfirming(false)}>ยกเลิก</GameButton>
            <GameButton
              onClick={confirmUse}
            >
              {type === "swap"
                ? `ยืนยันสลับ ${pickedNames[0]} ↔ ${pickedNames[1]}`
                : type === "remove"
                  ? `ยืนยันลบเสียง ${pickedNames[0]}`
                  : `ยืนยันใช้ ${labelItem(type)}`}
            </GameButton>
          </div>
        ) : (
          <div className="button-row">
            <GameButton variant="paper" onClick={resetDetail}>← กลับกระเป๋า</GameButton>
            <GameButton disabled={!readyToConfirm} onClick={() => setConfirming(true)}>
              ใช้ไอเทมนี้
            </GameButton>
          </div>
        )}
      </div>
    </div>
  );
}
