// เสียงเอฟเฟกต์เกม — สังเคราะห์สดด้วย Web Audio API (ไม่มีไฟล์เสียง ไม่ต้องดาวน์โหลด)
// ทุกฟังก์ชันเช็ค soundEnabled + กัน error ทุกชั้น: ถ้าเบราว์เซอร์ไม่รองรับ/สร้าง context ไม่ได้
// ก็ no-op เงียบๆ ไม่ทำเกมพัง (CLAUDE.md: ห้ามปล่อยพังเงียบ → ที่นี่ "พังเงียบ" ปลอดภัยเพราะเสียงเป็น polish ล้วน)

let soundEnabled = true;
let ctx: AudioContext | null = null;

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    if (!ctx) ctx = new Ctor();
    // เบราว์เซอร์ suspend context จนกว่าจะมี user gesture — resume เมื่อมีการเล่น (ถูกเรียกจาก onClick อยู่แล้ว)
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

type ToneSpec = {
  freq: number;
  start: number; // วินาทีนับจากตอนนี้
  duration: number;
  type?: OscillatorType;
  gain?: number;
  endFreq?: number; // ถ้ากำหนด จะ glide จาก freq → endFreq
};

function playTones(tones: ToneSpec[]): void {
  if (!soundEnabled) return;
  const audio = getCtx();
  if (!audio) return;
  try {
    const now = audio.currentTime;
    for (const tone of tones) {
      const osc = audio.createOscillator();
      const amp = audio.createGain();
      osc.type = tone.type ?? "sine";
      const t0 = now + tone.start;
      const t1 = t0 + tone.duration;
      osc.frequency.setValueAtTime(tone.freq, t0);
      if (tone.endFreq) osc.frequency.linearRampToValueAtTime(tone.endFreq, t1);
      const peak = tone.gain ?? 0.18;
      amp.gain.setValueAtTime(0.0001, t0);
      amp.gain.linearRampToValueAtTime(peak, t0 + 0.01);
      amp.gain.exponentialRampToValueAtTime(0.0001, t1);
      osc.connect(amp);
      amp.connect(audio.destination);
      osc.start(t0);
      osc.stop(t1 + 0.02);
    }
  } catch {
    // ปล่อยผ่าน — เสียงพังไม่ควรทำให้ UI พัง
  }
}

// คลิกปุ่มทั่วไป — ติ๊กสั้นๆ
export function playClick(): void {
  playTones([{ freq: 420, start: 0, duration: 0.07, type: "triangle", gain: 0.12 }]);
}

// ได้เหรียญ — สองโน้ตไต่ขึ้นสดใส
export function playCoin(): void {
  playTones([
    { freq: 880, start: 0, duration: 0.08, type: "square", gain: 0.12 },
    { freq: 1320, start: 0.08, duration: 0.12, type: "square", gain: 0.12 },
  ]);
}

// หมุนกาชา — เสียงหมุนกวาดความถี่ขึ้น
export function playGacha(): void {
  playTones([{ freq: 300, endFreq: 900, start: 0, duration: 0.5, type: "sawtooth", gain: 0.1 }]);
}

// กลองรัวก่อนเฉลยผลโหวต — พัลส์ถี่ๆ
export function playDrum(): void {
  const tones: ToneSpec[] = [];
  for (let i = 0; i < 7; i += 1) {
    tones.push({ freq: 150, start: i * 0.09, duration: 0.06, type: "square", gain: 0.16 });
  }
  playTones(tones);
}

// แฟนแฟร์ชนะ — อาร์เพจจิโอขึ้น
export function playFanfare(): void {
  playTones([
    { freq: 523, start: 0, duration: 0.14, type: "triangle", gain: 0.16 },
    { freq: 659, start: 0.13, duration: 0.14, type: "triangle", gain: 0.16 },
    { freq: 784, start: 0.26, duration: 0.14, type: "triangle", gain: 0.16 },
    { freq: 1047, start: 0.39, duration: 0.26, type: "triangle", gain: 0.18 },
  ]);
}

// แพ้/พลาด (เกราะใช้เสียงนี้ตามสเปค B9) — โน้ตลงต่ำหม่นๆ ขำๆ
export function playLose(): void {
  playTones([
    { freq: 392, start: 0, duration: 0.18, type: "sawtooth", gain: 0.14 },
    { freq: 294, start: 0.16, duration: 0.3, type: "sawtooth", gain: 0.14 },
  ]);
}
