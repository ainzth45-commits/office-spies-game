import { useEffect, useRef, useState } from "react";
import { playCoin, playDrum, playGacha } from "../../audio/sounds";
import { gachaIconAssets, gameAssets, itemCardAssets } from "../../data/assets";
import { availableGachaWeights, selectWeightedGachaOutcome } from "../../domain/gachaEngine";
import type { GachaOutcome } from "../../domain/types";
import { gachaItemOutcomeToItemType, isGachaItemOutcome } from "../../domain/types";
import { applyGachaOutcome, assignGachaItem } from "../../state/actions";
import { useGameStore } from "../../state/useGameStore";
import { GameButton } from "../../ui/components/GameButton";
import { PlayerCard } from "../../ui/components/PlayerCard";
import { buzz } from "../../ui/haptics";
import { GachaPoolModal } from "./GachaPoolModal";

const ALL_OUTCOMES = Object.keys(gachaIconAssets) as GachaOutcome[];
const SPIN_MS = 4000; // ลุ้นยาวขึ้น: reel เร็ว → ช้า → ค้าง → เฉลย

// ไอคอนผลกาชา: ช่องไอเทมใช้การ์ดไอเทมจริง ที่เหลือใช้ชุด gacha-result
export function gachaOutcomeIcon(outcome: GachaOutcome): string {
  if (isGachaItemOutcome(outcome)) return itemCardAssets[gachaItemOutcomeToItemType[outcome]];
  return gachaIconAssets[outcome as keyof typeof gachaIconAssets];
}

export function GachaFlow() {
  const { state, setState } = useGameStore();
  const [spinning, setSpinning] = useState(false);
  const [reelOutcome, setReelOutcome] = useState<GachaOutcome>(ALL_OUTCOMES[0]);
  const [showPool, setShowPool] = useState(false);
  const [assignError, setAssignError] = useState("");
  // จังหวะแจกไอเทม: โชว์ของก่อน → กด "ใส่กระเป๋า" → ค่อยเลือกคนรับ
  const [pickingReceiver, setPickingReceiver] = useState(false);
  const timers = useRef<number[]>([]);
  const result = state.lastGachaResult;
  const pendingGrant = state.pendingGachaGrant;

  // เคลียร์ timer ทั้งหมดตอน unmount (กันหมุนค้างถ้ากด 🏠 ออกกลางคัน)
  useEffect(() => () => {
    timers.current.forEach((id) => { window.clearTimeout(id); window.clearInterval(id); });
    timers.current = [];
  }, []);

  function spin() {
    if (spinning || pendingGrant) return;
    setSpinning(true);
    setAssignError("");
    playGacha();

    // reel เร่งลุ้น: สลับไอคอนถี่ๆ แล้วค่อยๆ ช้าลงช่วงท้าย (เหมือนวงล้อใกล้หยุด)
    let delay = 80;
    const tick = () => {
      setReelOutcome(ALL_OUTCOMES[Math.floor(Math.random() * ALL_OUTCOMES.length)]);
      delay = Math.min(360, delay * 1.09);
      timers.current.push(window.setTimeout(tick, delay));
    };
    tick();

    timers.current.push(window.setTimeout(() => playGacha(), 1400));
    timers.current.push(window.setTimeout(() => playGacha(), 2700));
    // ช่วงหน่วงก่อนเฉลย — กลองรัว
    timers.current.push(window.setTimeout(() => playDrum(), SPIN_MS - 700));

    timers.current.push(
      window.setTimeout(() => {
        timers.current.forEach((id) => { window.clearTimeout(id); window.clearInterval(id); });
        timers.current = [];
        setState((current) => {
          try {
            const weights = availableGachaWeights(current.config.gachaWeights, {
              shieldExists: current.shield.exists,
              voteCostChangedToday: current.dailyUsage.voteCostChanged ?? false,
            });
            const outcome = selectWeightedGachaOutcome(weights);
            const next = applyGachaOutcome(current, outcome);
            setReelOutcome(next.lastGachaResult?.outcome ?? outcome);
            playCoin();
            buzz([50, 40, 140]); // แคปซูลป๊อป (iPad เงียบ — WebKit ไม่รองรับ vibrate)
            return next;
          } catch (caught) {
            setAssignError(caught instanceof Error ? caught.message : "หมุนกาชาไม่สำเร็จ");
            return current;
          } finally {
            setSpinning(false);
          }
        });
      }, SPIN_MS),
    );
  }

  function assignTo(playerId: string) {
    try {
      setState((current) => assignGachaItem(current, playerId));
      setAssignError("");
      setPickingReceiver(false);
      playCoin();
    } catch (caught) {
      setAssignError(caught instanceof Error ? caught.message : "แจกไอเทมไม่สำเร็จ");
    }
  }

  // โหมดแจกไอเทม — จังหวะ 1: โชว์ไอเทมใหญ่ก่อน · จังหวะ 2: กด "ใส่กระเป๋า" แล้วค่อยเลือกคนรับ
  if (pendingGrant) {
    if (!pickingReceiver) {
      return (
        <section className="scene-panel gacha-scene">
          <h2>🎉 ได้ไอเทมใหม่!</h2>
          <div className="gacha-assign__showcase">
            <img src={itemCardAssets[pendingGrant.itemType]} alt="" aria-hidden="true" onError={(event) => { event.currentTarget.style.display = "none"; }} />
          </div>
          <p className="big-callout">{pendingGrant.message}</p>
          <div className="button-row">
            <GameButton onClick={() => setPickingReceiver(true)}>🎒 ใส่กระเป๋า ➜</GameButton>
          </div>
        </section>
      );
    }
    return (
      <section className="scene-panel gacha-scene">
        <h2>ใส่กระเป๋าใคร?</h2>
        <div className="gacha-assign__item">
          <img src={itemCardAssets[pendingGrant.itemType]} alt="" aria-hidden="true" onError={(event) => { event.currentTarget.style.display = "none"; }} />
        </div>
        {assignError && <p className="gacha-assign__error">{assignError}</p>}
        <div className="player-grid player-grid--pick player-grid--compact">
          {state.players.map((player) => {
            const count = (state.inventories[player.id] ?? []).length;
            const full = count >= state.config.inventoryLimit;
            return (
              <PlayerCard
                key={player.id}
                player={player}
                dimmed={full}
                badge={`${count}/${state.config.inventoryLimit}`}
                onClick={() => assignTo(player.id)}
              />
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section className="scene-panel gacha-scene">
      <h2>ตู้กาชาสายลับ</h2>
      <p className="scene-lead">หมุนได้ทุกคน ไม่จำกัดครั้ง 🎰 จ่ายซุป {state.config.gachaSpinCost} เหรียญต่อการหมุน · ผลประกาศให้ทุกคนเห็น</p>

      {!spinning && !result && assignError && <p className="gacha-assign__error">{assignError}</p>}

      {/* เวทีกาชา: ว่าง = ตู้กลางจอ · หมุน/เฉลย = ตู้ชิดซ้าย + ของที่สุ่มใหญ่ๆ ฝั่งขวา */}
      <div className={`gacha-stage${spinning || result ? " gacha-stage--split" : ""}`}>
        <div className={`gacha-machine${spinning ? " gacha-machine--spinning" : ""}${!spinning && result ? " gacha-machine--popped" : ""}`}>
          {/* ปุ่มส่องของในตู้ — เกาะมุมขวาบนของการ์ดตู้ */}
          {!spinning && (
            <button type="button" className="pool-peek-btn" onClick={() => setShowPool(true)} aria-label="ดูของในตู้">
              📦
            </button>
          )}
          <img
            className="gacha-machine__img"
            src={gameAssets.gachaMachine}
            alt=""
            aria-hidden="true"
            onError={(event) => { event.currentTarget.style.display = "none"; }}
          />
          {!spinning && result && (
            <img
              className="gacha-machine__capsule"
              src={gameAssets.gachaCapsule}
              alt=""
              onError={(event) => { event.currentTarget.style.display = "none"; }}
            />
          )}
        </div>

        {spinning && (
          <div className="gacha-reel">
            <img className="gacha-reel__icon" src={gachaOutcomeIcon(reelOutcome)} alt="" aria-hidden="true" onError={(event) => { event.currentTarget.style.visibility = "hidden"; }} />
            <p className="gacha-reel__text">🎰 กำลังสุ่ม...</p>
          </div>
        )}

        {!spinning && result && (
          <div className="gacha-result">
            <img
              className="gacha-result__icon"
              src={gachaOutcomeIcon(result.outcome)}
              alt=""
              onError={(event) => { event.currentTarget.style.display = "none"; }}
            />
            <p className="settings-preview gacha-result__text">{result.message}</p>
          </div>
        )}
      </div>

      <div className="button-row">
        <GameButton onClick={spin} disabled={spinning}>{spinning ? "กำลังสุ่ม..." : "🎰 หมุน!"}</GameButton>
      </div>

      {showPool && <GachaPoolModal onClose={() => setShowPool(false)} />}
    </section>
  );
}
