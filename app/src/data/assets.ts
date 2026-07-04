// ทะเบียน asset ภาพเกม (สร้างโดย codex ตาม 02-art-direction.md)
// ไฟล์จริงเป็น WebP (สีเต็ม truecolor + โปร่งใส โหลดไว) ที่ app/public/assets/generated/*.webp → Vite เสิร์ฟที่ /assets/generated/*
// อ้างอิงผ่าน registry นี้ที่เดียว เพื่อกันพิมพ์ path ผิดกระจัดกระจาย

// ใช้ base ของ Vite (รองรับ deploy ใต้ subpath เช่น GitHub Pages /office-spies-game/)
const BASE = `${import.meta.env.BASE_URL}assets/generated`;

export const gameAssets = {
  // โลโก้
  logo: `${BASE}/logo.webp?v=3`,

  // ฉากหลัง full-bleed (2360×1640)
  bgOffice: `${BASE}/bg-office.webp?v=3`,
  bgDetectiveRoom: `${BASE}/bg-detective-room.webp?v=3`,
  bgRoleCover: `${BASE}/bg-role-cover.webp?v=3`,
  bgReveal: `${BASE}/bg-reveal.webp?v=3`,

  // การ์ดบทบาท (ดีฟอลต์ = เวอร์ชันผู้หญิง ให้ตรงกับพนักงานจริงที่เป็นผู้หญิงทั้งหมด)
  roleNormal: `${BASE}/role-normal.webp?v=3`,
  roleSpy: `${BASE}/role-spy.webp?v=4`, // v=4: เวอร์ชันกวนๆ ทะเล้น (codex 2026-07-03)
  // archive เวอร์ชันผู้ชายเดิม — เก็บไว้เผื่อระบบเลือกเพศคาแรกเตอร์ในอนาคต (ยังไม่ใช้งานตอนนี้)
  roleNormalMale: `${BASE}/role-normal-male.webp?v=3`,
  roleSpyMale: `${BASE}/role-spy-male.webp?v=3`,
  spyPairBadge: `${BASE}/spy-pair-badge.webp?v=3`,

  // เหรียญ + เบ็ดเตล็ด
  coin: `${BASE}/coin.webp?v=3`,
  ballotBox: `${BASE}/ballot-box.webp?v=3`,
  magnifier: `${BASE}/magnifier.webp?v=3`,

  // กาชา
  gachaMachine: `${BASE}/gacha-machine.webp?v=3`,
  gachaCapsule: `${BASE}/gacha-capsule.webp?v=3`,

  // ตราผลโหวต + เบ็ดเตล็ดแฟ้มคดี
  voteWinStamp: `${BASE}/vote-win-stamp.webp?v=3`,
  // v=5: แผ่นตราเปล่า (AI เจนตัวอักษรไทยเพี้ยน → แอปวางคำว่า "พลาด!" ด้วยฟอนต์จริงทับเอง)
  voteLoseStamp: `${BASE}/vote-lose-stamp.webp?v=5`,
  // ตรา "จับแล้ว" สำหรับปั๊มทับรูปสายลับที่โดนรวบ (codex)
  stampCaught: `${BASE}/stamp-caught.webp?v=1`,
  clueCardFrame: `${BASE}/clue-card-frame.webp?v=3`,
  spyPoolBanner: `${BASE}/spy-pool-banner.webp?v=3`,

  // มาสคอต "สารวัตรแมว" + ฉากจบ
  mascotDetective: `${BASE}/mascot-detective.webp?v=3`,
  endTeamWin: `${BASE}/end-team-win.webp?v=3`,
  endSpyWin: `${BASE}/end-spy-win.webp?v=3`,

  // ภาพประกอบสอนเล่น (เน้นกลไกโหวต)
  tutVoteCast: `${BASE}/tut-vote-cast.webp?v=3`,
  tutVoteThreshold: `${BASE}/tut-vote-threshold.webp?v=3`,
  tutVoteOutcome: `${BASE}/tut-vote-outcome.webp?v=3`,
  // ฉากชี้ตัวสายลับคนที่ 2
  tutGuessSecondSpy: `${BASE}/tut-guess-second-spy.webp?v=1`,

  // สายข่าวเยาะเย้ย — โผล่ตอนซื้อเบาะแสแล้วกองเล็กเกิน ไม่มีข้อมูลขาย (กับดักตามดีไซน์)
  clueNoInfo: `${BASE}/clue-no-info.webp?v=1`,

  // ชุดไอคอน UI ธีมเกมแทนอิโมจิ (codex 2026-07-03)
  iconHome: `${BASE}/icon-home.webp?v=1`,
  iconSoundOn: `${BASE}/icon-sound-on.webp?v=1`,
  iconSoundOff: `${BASE}/icon-sound-off.webp?v=1`,
  iconReset: `${BASE}/icon-reset.webp?v=1`,
  iconTimer: `${BASE}/icon-timer.webp?v=1`,
  iconMagnifierSpot: `${BASE}/icon-magnifier-spot.webp?v=1`,

  // ไอคอนแอป (Add to Home Screen) + ไอคอน dock เมนูหน้าโฮม
  appIcon: `${BASE}/app-icon.webp?v=3`,
  dockRole: `${BASE}/dock-role.webp?v=3`,
  dockVote: `${BASE}/dock-vote.webp?v=3`,
  dockGacha: `${BASE}/dock-gacha.webp?v=3`,
  dockShop: `${BASE}/dock-shop.webp?v=3`,
  dockLearn: `${BASE}/dock-learn.webp?v=3`,
  dockSettings: `${BASE}/dock-settings.webp?v=3`,
} as const;

// ไอคอนผลกาชา 10 ตัว — key ตาม GachaOutcome
export const gachaIconAssets = {
  selfGain: `${BASE}/gacha-result-self-gain.webp?v=3`,
  selfLoseAll: `${BASE}/gacha-result-self-lose-all.webp?v=3`,
  allGain: `${BASE}/gacha-result-all-gain.webp?v=3`,
  poorGain: `${BASE}/gacha-result-poor-gain.webp?v=3`,
  allLose: `${BASE}/gacha-result-all-lose.webp?v=3`,
  voteUp: `${BASE}/gacha-result-vote-up.webp?v=3`,
  voteDown: `${BASE}/gacha-result-vote-down.webp?v=3`,
  grantItem: `${BASE}/gacha-result-grant-item.webp?v=3`,
  grantQuiz: `${BASE}/gacha-result-grant-quiz.webp?v=3`,
  spyShield: `${BASE}/gacha-result-spy-shield.webp?v=3`,
} as const;

// การ์ดไอเทมร้านค้า — map ตาม VoteItemType + พิเศษ (quiz/spy-shield)
export const itemCardAssets = {
  quiz: `${BASE}/item-quiz.webp?v=3`,
  double: `${BASE}/item-vote-double.webp?v=3`,
  remove: `${BASE}/item-vote-remove.webp?v=3`,
  swap: `${BASE}/item-vote-swap.webp?v=3`,
  reduceThreshold: `${BASE}/item-vote-reduce.webp?v=3`,
  protectThreshold: `${BASE}/item-vote-protect.webp?v=3`,
  spyShield: `${BASE}/item-spy-shield.webp?v=3`,
} as const;

export type GameAssetKey = keyof typeof gameAssets;
export type ItemCardKey = keyof typeof itemCardAssets;
