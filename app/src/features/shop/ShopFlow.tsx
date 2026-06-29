import { useState } from "react";
import { playCoin } from "../../audio/sounds";
import { itemCardAssets, gameAssets } from "../../data/assets";
import { itemCatalog } from "../../data/items";
import type { PlayerId, VoteItemType } from "../../domain/types";
import { buyVoteItem } from "../../state/actions";
import { useGameStore } from "../../state/useGameStore";
import { ConfirmPlayer } from "../../ui/components/ConfirmPlayer";
import { GameButton } from "../../ui/components/GameButton";
import { HandOffCurtain } from "../../ui/components/HandOffCurtain";
import { PlayerPicker } from "../../ui/components/PlayerPicker";

type Step = "pick" | "confirm" | "shop" | "curtain";

const itemDescriptions: Record<VoteItemType, string> = {
  double: "คะแนนโหวตของคุณนับเป็น 2 เสียงในรอบนี้",
  remove: "ลบ 1 เสียงออกจากคนที่คุณเลือก",
  swap: "เลือก 2 คน สลับจำนวนเสียงที่ได้รับให้กัน",
  reduceThreshold: "R: ลดเกณฑ์ชนะของโหวตรอบนี้ 25% — โหวตโดนง่ายขึ้น",
  protectThreshold: "P: กันไม่ให้ไอเทม R ลดเกณฑ์ได้ผลในรอบนี้",
};

export function ShopFlow() {
  const { state, setState } = useGameStore();
  const [step, setStep] = useState<Step>("pick");
  const [selectedPlayerId, setSelectedPlayerId] = useState<PlayerId | null>(null);
  const [message, setMessage] = useState("");
  const player = state.players.find((candidate) => candidate.id === selectedPlayerId) ?? null;

  function buy(type: VoteItemType) {
    if (!selectedPlayerId) return;
    try {
      setState((current) => buyVoteItem(current, selectedPlayerId, type, "shop"));
      playCoin();
      setMessage("ซื้อสำเร็จ เก็บเข้ากระเป๋าลับแล้ว");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "ซื้อไม่สำเร็จ");
    }
  }

  if (step === "pick") {
    return <PlayerPicker title="เลือกผู้ซื้อไอเทม" lead="เดินมาทีละคน 🛒 ซื้อแบบลับๆ คนอื่นห้ามแอบดูว่าใครซื้ออะไร" players={state.players} onPick={(playerId) => { setSelectedPlayerId(playerId); setStep("confirm"); }} />;
  }

  if (step === "confirm" && player) {
    return <ConfirmPlayer player={player} actionLabel="เข้าร้านลับ" onBack={() => setStep("pick")} onConfirm={() => setStep("shop")} />;
  }

  if (step === "curtain") {
    return <HandOffCurtain message="คืนเครื่องให้แอดมิน" onContinue={() => setState((current) => ({ ...current, phase: "home" }))} />;
  }

  return (
    <section className="scene-panel">
      <h2>ร้านลับ</h2>
      {player && <p className="big-callout">{player.name} ถือไอเทม {state.inventories[player.id]?.length ?? 0}/{state.config.inventoryLimit} ชิ้น</p>}
      {message && <p className="settings-preview">{message}</p>}
      <div className="shop-grid">
        {itemCatalog.map((item) => (
          <button key={item.type} type="button" className="shop-item" onClick={() => buy(item.type)}>
            <img
              className="shop-item__img"
              src={itemCardAssets[item.type]}
              alt={item.label}
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
            <span className="shop-item__label">{item.label}</span>
            <span className="shop-item__desc">{itemDescriptions[item.type]}</span>
            <span className="shop-item__price">
              <img className="shop-item__coin" src={gameAssets.coin} alt="" aria-hidden="true" />
              {state.config.itemPrices[item.type]}
            </span>
          </button>
        ))}
      </div>
      <div className="button-row">
        <GameButton onClick={() => setStep("curtain")}>เสร็จแล้ว</GameButton>
      </div>
    </section>
  );
}
