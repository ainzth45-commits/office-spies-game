import { useMemo, useState } from "react";
import { exportBackup, parseBackup } from "../../state/backup";
import { useGameStore } from "../../state/useGameStore";
import { GameButton } from "../../ui/components/GameButton";

export function BackupPanel() {
  const { state, setState } = useGameStore();
  const backupText = useMemo(() => exportBackup(state), [state]);
  const [importText, setImportText] = useState("");
  const [message, setMessage] = useState("");

  function downloadBackup() {
    const blob = new Blob([backupText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `office-spies-backup-day-${state.manualDay.index}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("สร้างไฟล์ backup แล้ว");
  }

  function restore(raw: string) {
    try {
      const parsed = parseBackup(raw);
      setState(parsed);
      setMessage("นำเข้า backup สำเร็จ");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "นำเข้า backup ไม่สำเร็จ");
    }
  }

  function copyBackup() {
    if (!navigator.clipboard) {
      setMessage("เครื่องนี้ไม่รองรับการคัดลอกอัตโนมัติ ให้ดาวน์โหลดไฟล์แทน");
      return;
    }
    navigator.clipboard.writeText(backupText).then(() => setMessage("คัดลอก backup แล้ว")).catch(() => setMessage("คัดลอกไม่ได้ ให้ดาวน์โหลดไฟล์แทน"));
  }

  return (
    <section className="scene-panel backup-panel">
      <h2>Backup เกม</h2>
      <p className="settings-preview">ใช้ก่อนเริ่มวันใหม่หรือก่อนปิดเครื่อง เผื่อ iPad รีเฟรช/เปลี่ยนเครื่อง</p>
      {message && <p className="settings-preview">{message}</p>}
      <div className="button-row">
        <GameButton onClick={downloadBackup}>ดาวน์โหลด Backup</GameButton>
        <label className="file-button">
          นำเข้าไฟล์
          <input
            type="file"
            accept="application/json,.json"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              file.text().then(restore).catch(() => setMessage("อ่านไฟล์ไม่ได้"));
            }}
          />
        </label>
      </div>
      <textarea className="backup-textarea" value={importText} onChange={(event) => setImportText(event.target.value)} placeholder="หรือวาง JSON backup ที่นี่" />
      <div className="button-row">
        <GameButton variant="paper" onClick={copyBackup}>
          คัดลอก JSON
        </GameButton>
        <GameButton variant="danger" disabled={!importText.trim()} onClick={() => restore(importText)}>
          นำเข้าจากช่องข้อความ
        </GameButton>
      </div>
    </section>
  );
}
