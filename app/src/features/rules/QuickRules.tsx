import { GameButton } from "../../ui/components/GameButton";

const RULES: { icon: string; title: string; body: string }[] = [
  {
    icon: "🎯",
    title: "เป้าหมาย",
    body: "ทีมพนักงาน: จับสายลับให้ครบ 2 คนก่อนหมดสัปดาห์ · สายลับ: เอาตัวรอดถึงจันทร์หน้า แล้วปั่นให้ทีมเสียเหรียญ",
  },
  {
    icon: "🕵️",
    title: "ดูบทบาทลับ",
    body: "เดินมาที่เครื่องทีละคน เปิดดูบทบาทของตัวเอง แล้วกดปิด — คนอื่นห้ามแอบดู ทุกคนทำเหมือนกันหมด",
  },
  {
    icon: "🪙",
    title: "เหรียญ",
    body: "เหรียญเป็นของจริง รับ/คืนที่ซุป แอปไม่นับยอดรายคน · เหรียญที่เสียไปวนกลับมาแจกใหม่",
  },
  {
    icon: "🗳️",
    title: "โหวตกำจัด (วันละ 1 ครั้ง)",
    body: "ช่วยกันรวมเหรียญเปิดโหวต → เดินมาลงคะแนนลับทีละคน → ระบบประกาศเฉพาะผล ไม่บอกจำนวนเสียง",
  },
  {
    icon: "🔎",
    title: "เบาะแสหลังโหวต",
    body: "ซื้อได้ 1 ครั้งต่อรอบ เปิดการ์ดบอกข้อมูลกองผู้ถูกโหวต — เอาไปคุยกันว่าใครน่าสงสัย",
  },
  {
    icon: "🛒",
    title: "ร้านลับ & กาชา",
    body: "ร้าน: ซื้อไอเทมสายโหวตแบบลับ · กาชา: หมุนลุ้นลูกเล่นหมู่ + โจทย์เชาว์ (ผลกาชาประกาศให้ทุกคนเห็น)",
  },
];

export function QuickRules({ onClose }: { onClose: () => void }) {
  return (
    <div className="rules-overlay" role="dialog" aria-modal="true" aria-label="กฎย่อ">
      <section className="rules-card">
        <h2>กฎย่อ — เล่นยังไง?</h2>
        <p className="rules-lead">สรุปสั้นๆ ไว้เปิดดูได้ทุกเมื่อ ถ้าลืมกติกาตอนเล่นจริง</p>
        <ul className="rules-list">
          {RULES.map((rule) => (
            <li key={rule.title} className="rules-item">
              <span className="rules-item__icon" aria-hidden="true">{rule.icon}</span>
              <div>
                <strong>{rule.title}</strong>
                <span>{rule.body}</span>
              </div>
            </li>
          ))}
        </ul>
        <div className="button-row">
          <GameButton onClick={onClose}>เข้าใจแล้ว กลับไปเล่น</GameButton>
        </div>
      </section>
    </div>
  );
}
