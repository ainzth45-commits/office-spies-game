// ทะเบียน asset ภาพเกม (สร้างโดย codex ตาม 02-art-direction.md)
// ไฟล์จริงเป็น WebP (สีเต็ม truecolor + โปร่งใส โหลดไว) ที่ app/public/assets/generated/*.webp → Vite เสิร์ฟที่ /assets/generated/*
// อ้างอิงผ่าน registry นี้ที่เดียว เพื่อกันพิมพ์ path ผิดกระจัดกระจาย

// ใช้ base ของ Vite (รองรับ deploy ใต้ subpath เช่น GitHub Pages /office-spies-game/)
const BASE = `${import.meta.env.BASE_URL}assets/generated`;

export const gameAssets = {
  // โลโก้
  logo: `${BASE}/logo.webp`,

  // ฉากหลัง full-bleed (2360×1640)
  bgOffice: `${BASE}/bg-office.webp`,
  bgDetectiveRoom: `${BASE}/bg-detective-room.webp`,
  bgRoleCover: `${BASE}/bg-role-cover.webp`,
  bgReveal: `${BASE}/bg-reveal.webp`,

  // การ์ดบทบาท (ดีฟอลต์ = เวอร์ชันผู้หญิง ให้ตรงกับพนักงานจริงที่เป็นผู้หญิงทั้งหมด)
  roleNormal: `${BASE}/role-normal.webp`,
  roleSpy: `${BASE}/role-spy.webp`,
  // archive เวอร์ชันผู้ชายเดิม — เก็บไว้เผื่อระบบเลือกเพศคาแรกเตอร์ในอนาคต (ยังไม่ใช้งานตอนนี้)
  roleNormalMale: `${BASE}/role-normal-male.webp`,
  roleSpyMale: `${BASE}/role-spy-male.webp`,
  spyPairBadge: `${BASE}/spy-pair-badge.webp`,

  // เหรียญ + เบ็ดเตล็ด
  coin: `${BASE}/coin.webp`,
  ballotBox: `${BASE}/ballot-box.webp`,
  magnifier: `${BASE}/magnifier.webp`,

  // กาชา
  gachaMachine: `${BASE}/gacha-machine.webp`,
  gachaCapsule: `${BASE}/gacha-capsule.webp`,

  // ตราผลโหวต + เบ็ดเตล็ดแฟ้มคดี
  voteWinStamp: `${BASE}/vote-win-stamp.webp`,
  voteLoseStamp: `${BASE}/vote-lose-stamp.webp`,
  clueCardFrame: `${BASE}/clue-card-frame.webp`,
  spyPoolBanner: `${BASE}/spy-pool-banner.webp`,

  // มาสคอต "สารวัตรแมว" + ฉากจบ
  mascotDetective: `${BASE}/mascot-detective.webp`,
  endTeamWin: `${BASE}/end-team-win.webp`,
  endSpyWin: `${BASE}/end-spy-win.webp`,

  // ภาพประกอบสอนเล่น (เน้นกลไกโหวต)
  tutVoteCast: `${BASE}/tut-vote-cast.webp`,
  tutVoteThreshold: `${BASE}/tut-vote-threshold.webp`,
  tutVoteOutcome: `${BASE}/tut-vote-outcome.webp`,

  // ไอคอนแอป (Add to Home Screen) + ไอคอน dock เมนูหน้าโฮม
  appIcon: `${BASE}/app-icon.webp`,
  dockRole: `${BASE}/dock-role.webp`,
  dockVote: `${BASE}/dock-vote.webp`,
  dockGacha: `${BASE}/dock-gacha.webp`,
  dockShop: `${BASE}/dock-shop.webp`,
  dockLearn: `${BASE}/dock-learn.webp`,
  dockSettings: `${BASE}/dock-settings.webp`,
} as const;

// ไอคอนผลกาชา 10 ตัว — key ตาม GachaOutcome
export const gachaIconAssets = {
  selfGain: `${BASE}/gacha-result-self-gain.webp`,
  selfLoseAll: `${BASE}/gacha-result-self-lose-all.webp`,
  allGain: `${BASE}/gacha-result-all-gain.webp`,
  poorGain: `${BASE}/gacha-result-poor-gain.webp`,
  allLose: `${BASE}/gacha-result-all-lose.webp`,
  voteUp: `${BASE}/gacha-result-vote-up.webp`,
  voteDown: `${BASE}/gacha-result-vote-down.webp`,
  grantItem: `${BASE}/gacha-result-grant-item.webp`,
  grantQuiz: `${BASE}/gacha-result-grant-quiz.webp`,
  spyShield: `${BASE}/gacha-result-spy-shield.webp`,
} as const;

// การ์ดไอเทมร้านค้า — map ตาม VoteItemType + พิเศษ (quiz/spy-shield)
export const itemCardAssets = {
  quiz: `${BASE}/item-quiz.webp`,
  double: `${BASE}/item-vote-double.webp`,
  remove: `${BASE}/item-vote-remove.webp`,
  swap: `${BASE}/item-vote-swap.webp`,
  reduceThreshold: `${BASE}/item-vote-reduce.webp`,
  protectThreshold: `${BASE}/item-vote-protect.webp`,
  spyShield: `${BASE}/item-spy-shield.webp`,
} as const;

export type GameAssetKey = keyof typeof gameAssets;
export type ItemCardKey = keyof typeof itemCardAssets;
