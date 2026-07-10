# Plan: Jester Role + Topic Image Mode + Fingerprint hold-cue

Specs: `specs/2026-07-10-jester-role-design.md` · `specs/2026-07-10-topic-image-mode-design.md`

**ลำดับทำ (TDD ที่ layer domain/state, verify browser ที่ UI):**

### A. Jester role
1. types: Role += "jester", EndWinner += "jester", publicResult += "caughtJester", GameConfig.jesterEnabled
2. configDefaults: jesterEnabled false · storage migration (auto)
3. roleEngine: `promoteJester()` + test
4. actions.assignNewRoles: jester pick + guard eligible≥3 + test
5. voteEngine: winner jester → caughtJester + test
6. actions.advanceFromVoteResult: caughtJester → ended/jester + test
7. RoleRevealFlow: jester card (role-jester.webp) — no partner/shield
8. VoteResultScene: caughtJester banner + reveal
9. EndGameScene: endWinner jester branch (end-jester-win.webp)
10. SettingsPanel: jesterEnabled toggle
11. assets.ts: roleJester, endJesterWin

### B. Topic image mode
12. types: GamePhase += "topic"
13. helper `imageForRole` + test
14. TopicFlow.tsx: input → picker → confirm → hold-view → discuss → home
15. App.tsx route · HomeHub dock button · assets dockTopic

### C. Fingerprint hold-cue
16. assets iconFingerprint · role-hold-btn + topic hold-btn เพิ่มไอคอนขวา + CSS
17. reveal layout เลี่ยงฝั่งขวา (บทบาท+รูป)

### D. Verify + ship
18. tsc + vitest + build · browser verify (jester end-to-end, topic walk-through, fingerprint)
19. commit + push + wait live + LINE
20. brief Codex 4 รูป (เมื่อเครื่องว่าง): role-jester, end-jester-win, dock-topic, icon-fingerprint
