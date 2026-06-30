// ทะเบียน asset ภาพเกม (สร้างโดย codex ตาม 02-art-direction.md)
// ไฟล์จริงเป็น WebP (สีเต็ม truecolor + โปร่งใส โหลดไว) ที่ app/public/assets/generated/*.webp → Vite เสิร์ฟที่ /assets/generated/*
// อ้างอิงผ่าน registry นี้ที่เดียว เพื่อกันพิมพ์ path ผิดกระจัดกระจาย

// ใช้ base ของ Vite (รองรับ deploy ใต้ subpath เช่น GitHub Pages /office-spies-game/)
const BASE = `${import.meta.env.BASE_URL}assets/generated`;

export const gameAssets = {
  // โลโก้
  logo: `${BASE}/logo.webp?v=2`,

  // ฉากหลัง full-bleed (2360×1640)
  bgOffice: `${BASE}/bg-office.webp?v=2`,
  bgDetectiveRoom: `${BASE}/bg-detective-room.webp?v=2`,
  bgRoleCover: `${BASE}/bg-role-cover.webp?v=2`,
  bgReveal: `${BASE}/bg-reveal.webp?v=2`,

  // การ์ดบทบาท (ดีฟอลต์ = เวอร์ชันผู้หญิง ให้ตรงกับพนักงานจริงที่เป็นผู้หญิงทั้งหมด)
  roleNormal: `${BASE}/role-normal.webp?v=2`,
  roleSpy: `${BASE}/role-spy.webp?v=2`,
  // archive เวอร์ชันผู้ชายเดิม — เก็บไว้เผื่อระบบเลือกเพศคาแรกเตอร์ในอนาคต (ยังไม่ใช้งานตอนนี้)
  roleNormalMale: `${BASE}/role-normal-male.webp?v=2`,
  roleSpyMale: `${BASE}/role-spy-male.webp?v=2`,
  spyPairBadge: `${BASE}/spy-pair-badge.webp?v=2`,

  // เหรียญ + เบ็ดเตล็ด
  coin: `${BASE}/coin.webp?v=2`,
  ballotBox: `${BASE}/ballot-box.webp?v=2`,
  magnifier: `${BASE}/magnifier.webp?v=2`,

  // กาชา
  gachaMachine: `${BASE}/gacha-machine.webp?v=2`,
  gachaCapsule: `${BASE}/gacha-capsule.webp?v=2`,

  // ตราผลโหวต + เบ็ดเตล็ดแฟ้มคดี
  voteWinStamp: `${BASE}/vote-win-stamp.webp?v=2`,
  voteLoseStamp: `${BASE}/vote-lose-stamp.webp?v=2`,
  clueCardFrame: `${BASE}/clue-card-frame.webp?v=2`,
  spyPoolBanner: `${BASE}/spy-pool-banner.webp?v=2`,

  // มาสคอต "สารวัตรแมว" + ฉากจบ
  mascotDetective: `${BASE}/mascot-detective.webp?v=2`,
  endTeamWin: `${BASE}/end-team-win.webp?v=2`,
  endSpyWin: `${BASE}/end-spy-win.webp?v=2`,

  // ภาพประกอบสอนเล่น (เน้นกลไกโหวต)
  tutVoteCast: `${BASE}/tut-vote-cast.webp?v=2`,
  tutVoteThreshold: `${BASE}/tut-vote-threshold.webp?v=2`,
  tutVoteOutcome: `${BASE}/tut-vote-outcome.webp?v=2`,

  // ไอคอนแอป (Add to Home Screen) + ไอคอน dock เมนูหน้าโฮม
  appIcon: `${BASE}/app-icon.webp?v=2`,
  dockRole: `${BASE}/dock-role.webp?v=2`,
  dockVote: `${BASE}/dock-vote.webp?v=2`,
  dockGacha: `${BASE}/dock-gacha.webp?v=2`,
  dockShop: `${BASE}/dock-shop.webp?v=2`,
  dockLearn: `${BASE}/dock-learn.webp?v=2`,
  dockSettings: `${BASE}/dock-settings.webp?v=2`,
} as const;

// ไอคอนผลกาชา 10 ตัว — key ตาม GachaOutcome
export const gachaIconAssets = {
  selfGain: `${BASE}/gacha-result-self-gain.webp?v=2`,
  selfLoseAll: `${BASE}/gacha-result-self-lose-all.webp?v=2`,
  allGain: `${BASE}/gacha-result-all-gain.webp?v=2`,
  poorGain: `${BASE}/gacha-result-poor-gain.webp?v=2`,
  allLose: `${BASE}/gacha-result-all-lose.webp?v=2`,
  voteUp: `${BASE}/gacha-result-vote-up.webp?v=2`,
  voteDown: `${BASE}/gacha-result-vote-down.webp?v=2`,
  grantItem: `${BASE}/gacha-result-grant-item.webp?v=2`,
  grantQuiz: `${BASE}/gacha-result-grant-quiz.webp?v=2`,
  spyShield: `${BASE}/gacha-result-spy-shield.webp?v=2`,
} as const;

// การ์ดไอเทมร้านค้า — map ตาม VoteItemType + พิเศษ (quiz/spy-shield)
export const itemCardAssets = {
  quiz: `${BASE}/item-quiz.webp?v=2`,
  double: `${BASE}/item-vote-double.webp?v=2`,
  remove: `${BASE}/item-vote-remove.webp?v=2`,
  swap: `${BASE}/item-vote-swap.webp?v=2`,
  reduceThreshold: `${BASE}/item-vote-reduce.webp?v=2`,
  protectThreshold: `${BASE}/item-vote-protect.webp?v=2`,
  spyShield: `${BASE}/item-spy-shield.webp?v=2`,
} as const;

export type GameAssetKey = keyof typeof gameAssets;
export type ItemCardKey = keyof typeof itemCardAssets;
