// ทะเบียน asset ภาพเกม (สร้างโดย codex ตาม 02-art-direction.md)
// ไฟล์จริงอยู่ที่ app/public/assets/generated/*.png → Vite เสิร์ฟที่ /assets/generated/*
// อ้างอิงผ่าน registry นี้ที่เดียว เพื่อกันพิมพ์ path ผิดกระจัดกระจาย

const BASE = "/assets/generated";

export const gameAssets = {
  // โลโก้
  logo: `${BASE}/logo.png`,

  // ฉากหลัง full-bleed (2360×1640)
  bgOffice: `${BASE}/bg-office.png`,
  bgDetectiveRoom: `${BASE}/bg-detective-room.png`,
  bgRoleCover: `${BASE}/bg-role-cover.png`,
  bgReveal: `${BASE}/bg-reveal.png`,

  // การ์ดบทบาท (ดีฟอลต์ = เวอร์ชันผู้หญิง ให้ตรงกับพนักงานจริงที่เป็นผู้หญิงทั้งหมด)
  roleNormal: `${BASE}/role-normal.png`,
  roleSpy: `${BASE}/role-spy.png`,
  // archive เวอร์ชันผู้ชายเดิม — เก็บไว้เผื่อระบบเลือกเพศคาแรกเตอร์ในอนาคต (ยังไม่ใช้งานตอนนี้)
  roleNormalMale: `${BASE}/role-normal-male.png`,
  roleSpyMale: `${BASE}/role-spy-male.png`,
  spyPairBadge: `${BASE}/spy-pair-badge.png`,

  // เหรียญ + เบ็ดเตล็ด
  coin: `${BASE}/coin.png`,
  ballotBox: `${BASE}/ballot-box.png`,
  magnifier: `${BASE}/magnifier.png`,

  // กาชา
  gachaMachine: `${BASE}/gacha-machine.png`,
  gachaCapsule: `${BASE}/gacha-capsule.png`,

  // ตราผลโหวต + เบ็ดเตล็ดแฟ้มคดี
  voteWinStamp: `${BASE}/vote-win-stamp.png`,
  voteLoseStamp: `${BASE}/vote-lose-stamp.png`,
  clueCardFrame: `${BASE}/clue-card-frame.png`,
  spyPoolBanner: `${BASE}/spy-pool-banner.png`,

  // มาสคอต "สารวัตรแมว" + ฉากจบ
  mascotDetective: `${BASE}/mascot-detective.png`,
  endTeamWin: `${BASE}/end-team-win.png`,
  endSpyWin: `${BASE}/end-spy-win.png`,

  // ไอคอนแอป (Add to Home Screen) + ไอคอน dock เมนูหน้าโฮม
  appIcon: `${BASE}/app-icon.png`,
  dockRole: `${BASE}/dock-role.png`,
  dockVote: `${BASE}/dock-vote.png`,
  dockGacha: `${BASE}/dock-gacha.png`,
  dockShop: `${BASE}/dock-shop.png`,
  dockLearn: `${BASE}/dock-learn.png`,
  dockSettings: `${BASE}/dock-settings.png`,
} as const;

// ไอคอนผลกาชา 10 ตัว — key ตาม GachaOutcome
export const gachaIconAssets = {
  selfGain: `${BASE}/gacha-result-self-gain.png`,
  selfLoseAll: `${BASE}/gacha-result-self-lose-all.png`,
  allGain: `${BASE}/gacha-result-all-gain.png`,
  poorGain: `${BASE}/gacha-result-poor-gain.png`,
  allLose: `${BASE}/gacha-result-all-lose.png`,
  voteUp: `${BASE}/gacha-result-vote-up.png`,
  voteDown: `${BASE}/gacha-result-vote-down.png`,
  grantItem: `${BASE}/gacha-result-grant-item.png`,
  grantQuiz: `${BASE}/gacha-result-grant-quiz.png`,
  spyShield: `${BASE}/gacha-result-spy-shield.png`,
} as const;

// การ์ดไอเทมร้านค้า — map ตาม VoteItemType + พิเศษ (quiz/spy-shield)
export const itemCardAssets = {
  quiz: `${BASE}/item-quiz.png`,
  double: `${BASE}/item-vote-double.png`,
  remove: `${BASE}/item-vote-remove.png`,
  swap: `${BASE}/item-vote-swap.png`,
  reduceThreshold: `${BASE}/item-vote-reduce.png`,
  protectThreshold: `${BASE}/item-vote-protect.png`,
  spyShield: `${BASE}/item-spy-shield.png`,
} as const;

export type GameAssetKey = keyof typeof gameAssets;
export type ItemCardKey = keyof typeof itemCardAssets;
