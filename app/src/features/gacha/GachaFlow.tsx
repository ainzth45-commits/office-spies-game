import { useEffect, useRef, useState } from "react";
import { playCoin, playDrum, playGacha } from "../../audio/sounds";
import { gachaIconAssets, gameAssets, itemCardAssets } from "../../data/assets";
import { applySpyChaosBias, availableGachaWeights, selectWeightedGachaOutcome } from "../../domain/gachaEngine";
import type { GachaOutcome, PlayerId } from "../../domain/types";
import { gachaItemOutcomeToItemType, isGachaItemOutcome } from "../../domain/types";
import { applyGachaOutcome } from "../../state/actions";
import { useGameStore } from "../../state/useGameStore";
import { GameButton } from "../../ui/components/GameButton";
import { PlayerPicker } from "../../ui/components/PlayerPicker";
import { buzz } from "../../ui/haptics";
import { ThemedIcon } from "../../ui/components/ThemedIcon";
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
  const [spinnerId, setSpinnerId] = useState<PlayerId | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [reelOutcome, setReelOutcome] = useState<GachaOutcome>(ALL_OUTCOMES[0]);
  const [showPool, setShowPool] = useState(false);
  const [spinError, setSpinError] = useState("");
  const timers = useRef<number[]>([]);
  const result = state.lastGachaResult;

  // เคลียร์ timer ทั้งหมดตอน unmount (กันหมุนค้างถ้ากด 🏠 ออกกลางคัน)
  useEffect(() => () => {
    timers.current.forEach((id) => { window.clearTimeout(id); window.clearInterval(id); });
    timers.current = [];
  }, []);

  const spinner = state.players.find((player) => player.id === spinnerId) ?? null;
  const presentPlayers = state.players.filter((player) => state.attendance[player.id]);
  // ช่องที่ซุปปิดในตั้งค่า — ถอดออกจากตู้ (ไม่ออก ไม่โชว์)
  const disabled = (Object.keys(state.config.gachaEnabled) as GachaOutcome[]).filter(
    (outcome) => !state.config.gachaEnabled[outcome],
  );

  function spin() {
    if (spinning || !spinnerId) return;
    setSpinning(true);
    setSpinError("");
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
            let weights = availableGachaWeights(current.config.gachaWeights, {
              shieldExists: current.shield.exists,
              voteCostChangedToday: current.dailyUsage.voteCostChanged ?? false,
              disabled,
            });
            // สปายเป็นคนหมุน → เอียงเรทให้ของป่วนออกบ่อยขึ้น (กาชาเป็นเบาะแส)
            const role = current.roles[spinnerId];
            const spinnerIsSpy = role === "spyA" || role === "spyB";
            if (spinnerIsSpy) weights = applySpyChaosBias(weights, current.config.spyGachaBadMultiplier);
            const outcome = selectWeightedGachaOutcome(weights);
            const next = applyGachaOutcome(current, outcome, { spinnerId });
            setReelOutcome(next.lastGachaResult?.outcome ?? outcome);
            playCoin();
            buzz([50, 40, 140]); // แคปซูลป๊อป (iPad เงียบ — WebKit ไม่รองรับ vibrate)
            return next;
          } catch (caught) {
            setSpinError(caught instanceof Error ? caught.message : "หมุนกาชาไม่สำเร็จ");
            return current;
          } finally {
            setSpinning(false);
          }
        });
      }, SPIN_MS),
    );
  }

  function changeSpinner() {
    setSpinnerId(null);
    setSpinError("");
    setState((current) => ({ ...current, lastGachaResult: null }));
  }

  // จังหวะ 1: เลือกคนหมุนก่อน (เฉพาะคนที่มาวันนี้) — รู้คนหมุนถึงจะแจกไอเทม + เอียงเรทสปายได้
  if (!spinnerId) {
    return (
      <PlayerPicker
        title="ใครเดินมาหมุนกาชา?"
        lead="แตะชื่อคนที่กำลังจะหมุน 🎰 ของที่ออกจะเข้ากระเป๋าคนนี้เลย"
        players={presentPlayers}
        onPick={(playerId) => {
          setSpinnerId(playerId);
          setState((current) => ({ ...current, lastGachaResult: null }));
        }}
      />
    );
  }

  return (
    <section className="scene-panel gacha-scene">
      <h2>ตู้กาชาสายลับ</h2>
      <p className="scene-lead">
        🎰 คนหมุน: <b>{spinner?.name ?? "-"}</b> · จ่ายซุป {state.config.gachaSpinCost} เหรียญต่อการหมุน · ผลประกาศให้ทุกคนเห็น
      </p>

      {!spinning && spinError && <p className="gacha-assign__error">{spinError}</p>}

      {/* เวทีกาชา: ว่าง = ตู้กลางจอ · หมุน/เฉลย = ตู้ชิดซ้าย + ของที่สุ่มใหญ่ๆ ฝั่งขวา */}
      <div className={`gacha-stage${spinning || result ? " gacha-stage--split" : ""}`}>
        <div className={`gacha-machine${spinning ? " gacha-machine--spinning" : ""}${!spinning && result ? " gacha-machine--popped" : ""}`}>
          {/* ปุ่มส่องของในตู้ — เกาะมุมขวาบนของการ์ดตู้ */}
          {!spinning && (
            <button type="button" className="pool-peek-btn" onClick={() => setShowPool(true)} aria-label="ดูของในตู้">
              <ThemedIcon className="pool-peek-btn__icon" src={gameAssets.dockGacha} emoji="📦" />
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
        <GameButton variant="paper" onClick={changeSpinner} disabled={spinning}>👤 เปลี่ยนคนหมุน</GameButton>
        <GameButton onClick={spin} disabled={spinning}>{spinning ? "กำลังสุ่ม..." : result ? "🎰 หมุนอีกครั้ง" : "🎰 หมุน!"}</GameButton>
      </div>

      {showPool && <GachaPoolModal onClose={() => setShowPool(false)} />}
    </section>
  );
}
