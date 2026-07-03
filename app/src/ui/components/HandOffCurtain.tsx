import { GameButton } from "./GameButton";

export function HandOffCurtain({
  message,
  sub,
  hint,
  onContinue,
}: {
  message: string;
  sub?: string; // ความคืบหน้า เช่น "ลงคะแนนแล้ว 4/11"
  hint?: string; // ประโยคแซวสั้นๆ คั่นจังหวะรอ
  onContinue: () => void;
}) {
  return (
    <section className="handoff-curtain">
      <div className="handoff-curtain__spotlight">🔎</div>
      <h2>{message}</h2>
      {sub && <p className="handoff-curtain__sub">{sub}</p>}
      <p>{hint ?? "ส่ง iPad ให้คนถัดไป แล้วค่อยกดปุ่ม"}</p>
      <GameButton onClick={onContinue}>คนถัดไป กดเลย</GameButton>
    </section>
  );
}
