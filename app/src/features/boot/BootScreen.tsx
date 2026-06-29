import { useGameStore } from "../../state/useGameStore";
import { GameButton } from "../../ui/components/GameButton";

export function BootScreen() {
  const { setState } = useGameStore();

  return (
    <main className="app-shell">
      <section className="boot-card">
        <p className="eyebrow">Office Spies</p>
        <h1>สายลับในออฟฟิศ</h1>
        <p>แตะเริ่มเพื่อปลดล็อกเสียงและเข้าสู่กระดานคดี</p>
        <div className="button-row">
          <GameButton onClick={() => setState((current) => ({ ...current, phase: "home" }))}>เริ่มเกม</GameButton>
        </div>
      </section>
    </main>
  );
}
