import { useRef, useState } from "react";
import type { Player } from "../../domain/types";
import { addPlayer, removePlayer, rolesAssigned, updatePlayer } from "../../state/actions";
import { useGameStore } from "../../state/useGameStore";
import { GameButton } from "../../ui/components/GameButton";
import { processPlayerImage, validateImageLink } from "./playerImage";

// หมวด "ผู้เล่น" ในตั้งค่าแอดมิน — ลงทะเบียน/แก้/ลบ เก็บใน local เท่านั้น (ไม่มีข้อมูลจริงใน source)
// ฟอร์มเพิ่มกับแก้ใช้ตัวเดียวกัน (editing = null → โหมดเพิ่ม)
export function PlayersSection() {
  const { state, setState } = useGameStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Player | null>(null);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkDraft, setLinkDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const locked = rolesAssigned(state);

  function openForm(player: Player | null) {
    setEditing(player);
    setName(player?.name ?? "");
    setImageUrl(player?.imageUrl ?? "");
    setLinkDraft(player && /^https?:/i.test(player.imageUrl) ? player.imageUrl : "");
    setError(null);
    setConfirmDeleteId(null);
    setFormOpen(true);
  }

  async function onPickFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // เคลียร์เพื่อให้เลือกไฟล์เดิมซ้ำได้
    if (!file) return;
    setBusy(true);
    try {
      setImageUrl(await processPlayerImage(file));
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "อ่านรูปไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  function applyLink() {
    try {
      setImageUrl(validateImageLink(linkDraft));
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "ลิงก์ไม่ถูกต้อง");
    }
  }

  function save() {
    try {
      setState((current) =>
        editing ? updatePlayer(current, editing.id, { name, imageUrl }) : addPlayer(current, { name, imageUrl }),
      );
      setFormOpen(false);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "บันทึกไม่สำเร็จ");
    }
  }

  function confirmDelete(playerId: string) {
    try {
      setState((current) => removePlayer(current, playerId));
      setConfirmDeleteId(null);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "ลบไม่สำเร็จ");
    }
  }

  return (
    <fieldset className="settings-cat players-section">
      <legend>👥 ผู้เล่น ({state.players.length} คน)</legend>
      {locked ? (
        <p className="players-section__note">🔒 เกมกำลังเล่นอยู่ — เพิ่ม/ลบได้หลังจบเกมหรือเริ่มรอบใหม่ (แก้ชื่อ/รูปได้ตลอด)</p>
      ) : null}
      {state.players.length === 0 ? (
        <p className="players-section__note">ยังไม่มีผู้เล่นเลย — ลงทะเบียนอย่างน้อย 3 คนถึงจะเริ่มเกมได้นะ</p>
      ) : null}
      <ul className="players-list">
        {state.players.map((player) => (
          <li key={player.id} className="players-list__row">
            {player.imageUrl ? (
              <img src={player.imageUrl} alt="" className="players-list__thumb" />
            ) : (
              <span className="players-list__thumb players-list__thumb--empty">{player.code}</span>
            )}
            <span className="players-list__code">{player.code}</span>
            <span className="players-list__name">{player.name}</span>
            <button type="button" className="players-list__btn" aria-label={`แก้ไข ${player.name}`} onClick={() => openForm(player)}>
              ✏️
            </button>
            {confirmDeleteId === player.id ? (
              <button type="button" className="players-list__btn players-list__btn--danger" onClick={() => confirmDelete(player.id)}>
                ยืนยันลบ?
              </button>
            ) : (
              <button
                type="button"
                className="players-list__btn"
                aria-label={`ลบ ${player.name}`}
                disabled={locked}
                onClick={() => {
                  setConfirmDeleteId(player.id);
                  setError(null);
                }}
              >
                🗑
              </button>
            )}
          </li>
        ))}
      </ul>
      <GameButton variant="paper" disabled={locked} onClick={() => openForm(null)}>
        ➕ เพิ่มผู้เล่น
      </GameButton>
      {error && !formOpen ? <p className="form-error">⚠️ {error}</p> : null}

      {formOpen ? (
        <div className="player-form">
          <h4>{editing ? `แก้ไข ${editing.code}` : "ลงทะเบียนผู้เล่นใหม่"}</h4>
          <label className="player-form__field">
            ชื่อ
            <input value={name} maxLength={40} onChange={(event) => setName(event.target.value)} placeholder="ชื่อเล่น + ชื่อจริง" />
          </label>
          <div className="player-form__photo">
            {imageUrl ? (
              <img src={imageUrl} alt="ตัวอย่างรูป" className="player-form__preview" />
            ) : (
              <div className="player-form__preview player-form__preview--empty">ไม่มีรูป</div>
            )}
            <div className="player-form__photo-actions">
              <GameButton variant="paper" disabled={busy} onClick={() => cameraInputRef.current?.click()}>
                📷 ถ่ายรูป
              </GameButton>
              <GameButton variant="paper" disabled={busy} onClick={() => fileInputRef.current?.click()}>
                🖼 เลือกรูป
              </GameButton>
              <div className="player-form__link">
                <input value={linkDraft} onChange={(event) => setLinkDraft(event.target.value)} placeholder="https://... วางลิงก์รูป" />
                <GameButton variant="paper" onClick={applyLink}>
                  ใช้ลิงก์
                </GameButton>
              </div>
            </div>
          </div>
          <input ref={cameraInputRef} type="file" accept="image/*" capture="user" hidden onChange={onPickFile} />
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={onPickFile} />
          {busy ? <p className="players-section__note">กำลังย่อรูป…</p> : null}
          {error ? <p className="form-error">⚠️ {error}</p> : null}
          <div className="player-form__actions">
            <GameButton variant="paper" onClick={() => setFormOpen(false)}>
              ยกเลิก
            </GameButton>
            <GameButton onClick={save}>{editing ? "บันทึก" : "เพิ่มเข้าทีม"}</GameButton>
          </div>
        </div>
      ) : null}
    </fieldset>
  );
}
