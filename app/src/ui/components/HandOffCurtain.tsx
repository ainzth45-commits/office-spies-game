import { GameButton } from "./GameButton";

export function HandOffCurtain({ message, onContinue }: { message: string; onContinue: () => void }) {
  return (
    <section className="handoff-curtain">
      <div className="handoff-curtain__spotlight">🔎</div>
      <h2>{message}</h2>
      <p>ส่ง iPad ให้คนถัดไป แล้วค่อยกดต่อ</p>
      <GameButton onClick={onContinue}>พร้อมแล้ว</GameButton>
    </section>
  );
}
