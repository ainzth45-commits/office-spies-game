# Office Spies Game App Design

Date: 2026-06-29
Project: เกมที่ 1 — สายลับในออฟฟิศ
Status: User-approved design draft pending written-spec review

## Goal

Build the full "สายลับในออฟฟิศ" game as a polished iPad-first game master app. The first release should include complete game functionality, generated cartoon detective art, sound/motion, tutorial, persistence, backup/restore, and deployment readiness.

The app should feel like a party game, not an admin dashboard. React/Vite/PWA is the delivery approach, but the experience is framed as a detective game with scenes, mission panels, reveal moments, gacha animation, stamps, mascot narration, and large player cards.

## Delivery Shape

- Build a React + Vite single-page PWA.
- Develop and test locally first.
- Deploy the production build to GitHub Pages.
- Store live game state in the iPad browser, not on GitHub.
- Use export/import JSON backup so the game can be recovered or moved to another device.
- Include basic `noindex` metadata, while accepting that the GitHub Pages URL may be publicly accessible to anyone with the link.
- Do not require an admin PIN.
- Employee photos are acceptable on a publicly reachable GitHub Pages URL for this release. If privacy requirements change, hosting must move to an access-controlled option.

## Target Device

- iPad Air 5 in landscape orientation.
- Design canvas follows the existing 1180 x 820 pt brief.
- Touch targets should be large enough for people standing around an iPad.
- Text must be readable from 1-2 meters.
- The app should work in Safari and as an installed PWA where possible.

## Preloaded Players

The app starts ready to play with these 11 employees preloaded. The app uses their real Google image URLs as player avatars.

| Code | Name | Image URL |
| --- | --- | --- |
| C001 | เรน มัศรินทร์ | https://lh3.googleusercontent.com/d/1szQVV5nqE9Wrs8E2rsGq_326sLjGPEkN |
| C002 | เบ้นซ์ สุกัญญา | https://lh3.googleusercontent.com/d/1T92lVNLVU42uw7T8UgG7fE4_Z_DZ1r3V |
| C003 | อาย อนุธิดา | https://lh3.googleusercontent.com/d/1L0dUHzCAfFggHOCdq5KeutOxl3vj_Ps9 |
| C004 | บี้ ปิยะนันท์ | https://lh3.googleusercontent.com/d/1ExYO7NtNKNTTQrLLjIIuFjOw52UfKQGX |
| C005 | แป้ง บุษบาวรรณ | https://lh3.googleusercontent.com/d/1GqnsrmDTWpgdyZ41H5iit0k1U8NIvF1n |
| C006 | เตย มนัสนันท์ | https://lh3.googleusercontent.com/d/1fiZaaoPDu22H7KZ_dwFXhLfaTfXpMmUf |
| C007 | แป้ง วศิณี | https://lh3.googleusercontent.com/d/1CeZgS6-bZc1ntRe5mEC75__a4rNIFzdb |
| C008 | แบม สุนิสา | https://lh3.googleusercontent.com/d/1Eir0YERChc1tJiqrw0q9U0fUXEeAI6wy |
| C009 | อีฟ พิมชนก | https://lh3.googleusercontent.com/d/1d05jzX6gfUqZUCuqJRx8FArlC7-FVqAE |
| C010 | เรย์ พรธิศา | https://lh3.googleusercontent.com/d/1HjLBR1b3qoKXTKTJ9nBu3QtACwEOh3xP |
| C011 | เบ้นซ์ กนกพร | https://lh3.googleusercontent.com/d/1iKGto7htyXqIKgBRuOKpnsnDzOg-7F2g |

Player image presentation:

- Use portrait cards with a 4:5 image area.
- Put full name and employee code below the image.
- Use the same card style for player selection, vote targets, clue reveals, role-related identity displays, and guess screens.
- Cards must be large, spaced apart, and followed by a confirmation screen before entering a secret/private flow.
- If an image fails to load, show a clear fallback with employee code, name, and a generated silhouette.
- Google image URLs must be shared so anyone with the link can view them. If a URL is not public, the fallback card must appear without breaking the game flow.

## Game Feel

The app should look and move like a comedic detective game.

Visual direction:

- Cartoon detective noir, but bright and funny.
- Generated art pack aligned with the existing art direction.
- Main palette: navy, cream paper, evidence red, spotlight yellow, mint, charcoal.
- Use generated backgrounds and characters for the game world, while real employee photos represent players.

Generated assets:

- Logo.
- Detective office / case-board home background.
- Role cards for normal player and spy.
- Mascot detective cat in multiple poses.
- Gacha machine and capsules.
- Item cards and icons.
- Vote win/lose stamps.
- Clue card frame / wanted poster frame.
- End-game scenes for team win and spy win.
- Tutorial scene art.

Motion and sound:

- Boot unlocks audio after the first user gesture.
- Buttons use playful press feedback.
- Scene transitions use spotlight/magnifier wipes.
- Role reveal uses card flip.
- Gacha uses shake, capsule drop, reveal pop, and result fanfare.
- Vote result uses drumroll and stamp impact.
- Shield activation must be indistinguishable from a normal failed vote: no special sound, animation, text, or timing.
- Every page has a sound toggle.

## Main Screens

### Boot / Continue

- Unlock audio.
- If saved state exists, offer to continue.
- If no saved state exists, enter Home with default config and preloaded players.

### Home / Mission Hub

Home is a detective case-board game hub, not a plain admin dashboard.

Show:

- Manual game day label.
- Current vote cost.
- Whether a vote has opened on the current game day.
- Present/absent player count.
- Spy shield public status by slot, if known.
- Buttons for role reveal, vote, shop, gacha, clue-related results, day control, backup, and settings.
- Tutorial replay button.

### Player Picker

Used before role reveal, shop, gacha, vote, guess targets, and clue displays when selecting a person.

Flow:

1. Player taps their own 4:5 photo card.
2. Confirm screen shows large photo, full name, and employee code.
3. Player confirms before entering the private action.
4. When the action ends, the app returns to a hand-off curtain or public result screen depending on the action.

### Hand-Off Curtain

Used after every private action.

Purpose:

- Hide previous player's secret screen.
- Prompt the next player or admin to take the iPad.
- Maintain the repeated rhythm: choose self -> confirm -> act -> curtain.

### Role Reveal

- Players select themselves.
- Confirm identity.
- Hold/tap to reveal role.
- Normal players see only their own normal role.
- Spy A/B sees their slot and partner identity.
- If the current spy slot has an unused shield, the relevant spy can see it when role/item information is shown according to the game rules.
- After release/finish, return to curtain.

### Shop

- Player selects self.
- Confirm identity.
- Show secret item shop.
- Items: double vote, remove vote, swap vote, R reduce threshold, P protect threshold.
- Purchased item goes into that player's inventory.
- Respect inventory limit.
- Finish with curtain.

### Gacha

- Player selects self.
- Confirm identity.
- Show full game-style gacha scene.
- Result is public after spin.
- If result gives an item, add to player inventory and announce item type.
- If result gives quiz, launch quiz flow immediately.
- If result gives spy shield, announce only the spy slot A/B as specified.
- Apply fallbacks for full inventory or already-existing shield.

### Vote

1. Admin opens vote and confirms the group paid the required coins.
2. Players who are present today take turns:
   - select self,
   - confirm identity,
   - choose target,
   - optionally use eligible inventory item,
   - confirm vote,
   - return to curtain.
3. When all present players have voted, the vote engine calculates the result.
4. Public result screen shows only win/fail state and allowed narrative information.
5. If a spy is successfully caught, the app enters Guess Second Spy.
6. If an innocent player is caught, the app enters refund allocation.
7. Spy-in-pool reveal and post-vote clue purchase run after the result when conditions allow.

Vote UI details that must be preserved:

- The UI must never show vote counts.
- The vote result screen runs before spy-in-pool reveal and clue purchase.
- Shield-triggered failed votes must use the exact same public screen, sound, animation, text, and timing as ordinary failed votes.
- R/P blocked or duplicate-use feedback must use the generic message: "มีคนใช้ไอเทมหมวดเกณฑ์ไปแล้ว". It must not reveal whether the earlier item was R or P.

### Spy-in-Pool Reveal

This runs after the public vote result for both failed and successful votes.

Rules:

- Compute the voted pool after all vote items and effects are applied.
- Trigger only when the voted pool has at least 4 players and at least 1 spy is in that pool.
- Announce only: "มีสายลับ S คน จากผู้ถูกโหวต T คน".
- Do not reveal names.
- Do not reveal vote counts.
- If no spy is in the voted pool, stay silent.
- By default, this still runs when a shield silently flips a successful spy catch into a failed vote.
- The threshold for this reveal is 4 players and is separate from the post-vote clue threshold.

### Post-Vote Clue Purchase

This is a group action like opening a vote.

Rules:

- The team pools real coins and admin confirms payment.
- Price is one quarter of that vote round's opening cost, rounded down.
- Limit is 1 clue purchase per vote round for the whole team.
- The result is public on the main screen.
- The clue uses the voted and not-voted pools after all vote items and effects are applied.
- The team chooses exactly one clue type:
  - Voted-player clue: if voted pool has at least 3 players, randomly show 1 player from that pool. If voted pool has fewer than 3 players, the team pays but receives no useful clue.
  - Not-voted-player clue: randomly show up to 4 players from the not-voted pool. If fewer than 4 are available, show all available players.
- The voted-player clue threshold is 3 players and must not be confused with the spy-in-pool threshold of 4 players.

### Innocent-Catch Refund

When a vote succeeds but catches an innocent player:

- Refund one quarter of the paid vote-opening coin pool, rounded down.
- The number of recipients must be fewer than the number of present players.
- Players who are absent that day are not eligible for the share.
- The team chooses 1 holder.
- That holder decides the allocation.
- The app records the holder and allocation note, but it does not maintain per-player coin balances.

### Guess Second Spy

- Team gets one public guess.
- If correct, team wins.
- If wrong, app re-randomizes spy roles and sends all players through role reveal again.
- General inventory remains attached to people.
- Unused shield remains attached to spy slot A/B.
- Used shield is gone.

### Manual Day Control

The app does not advance the game based on the real calendar.

Admin controls:

- Edit current game day label.
- End working day.
- Rest/pause day without penalty.
- Mark final day / deadline decision.
- Undo day transition where safe.

Rules:

- If admin ends a working day without opening a vote, the next vote cost increases according to config.
- If admin chooses rest/pause day, the day can be recorded without increasing vote cost.
- The app never automatically moves from Wednesday to day 3 just because the real date changed.
- Deadline is admin-triggered, not clock-triggered.
- Opening a vote resets the skipped-working-day cost accumulation.
- A vote may be opened at most once per manual game day.
- When admin triggers the final-day decision, spies win if the team has not already caught both spies.

### Tutorial

- 10-scene tutorial with mascot detective cat.
- Thai subtitles on every scene.
- Voice or generated narration support.
- Skip, replay, and short mode.
- Short mode covers the essential role, coin, vote, and win/loss concepts.

## Data Model

The implementation should use a single versioned game state object, split into well-named domains.

Required domains:

- `config`: all editable values from the config brief.
- `players`: preloaded employee records and image URLs.
- `attendance`: present/absent state for the current game day.
- `roles`: normal, spyA, spyB.
- `inventories`: vote items by player id.
- `shield`: slot, exists, consumed status.
- `manualDay`: label, index, openedVoteToday, day history, final-day marker.
- `voteCostState`: base cost, accumulated multiplier, next vote multiplier.
- `gachaState`: limits and result history.
- `quizState`: used quiz ids.
- `history`: action log for undo and audit.
- `phase`: setup, playing, roleReveal, voting, guessing, ended, etc.
- `settings`: sound, tutorial completion, PWA preferences.

State requirements:

- Autosave after every game action.
- Store primary state in IndexedDB on the iPad for better resilience during a multi-day game.
- Keep a small localStorage pointer/metadata record only if helpful for bootstrapping.
- Export/import full JSON backup.
- Validate imported backups by version and schema before replacing current state.
- Keep a readable action history for admin review.
- Prompt or remind the admin to export a backup at the end of every game day.
- Warn before refresh/navigation where the browser allows it.
- Use Wake Lock where available and show a practical fallback reminder when unavailable.

## Economy And Attendance Rules

The app is the game master, not a coin ledger.

- Real coins are managed by the supervisor outside the app.
- The app does not track each player's coin balance.
- Vote threshold uses only players marked present for that manual game day.
- Default threshold is `round(0.72 * presentPlayerCount)`, configurable with a minimum of 2 and maximum of present player count.
- Vote opening cost scales by present player count.
- If a working game day ends without a vote, the next vote cost increases by the configured skipped-day multiplier, default +50%.
- Skipped-working-day increases accumulate until a vote is opened.
- Gacha next-vote multipliers x1.5 and x0.5 apply to the next vote opening cost once, then clear.
- Absent players are not counted in threshold and are not eligible for innocent-catch refund shares.

## Vote Engine

Vote calculation must be a pure function independent from UI.

Input:

- Present player ids.
- Roles.
- Votes.
- Used items in turn order.
- Config.
- Shield state.

Output:

- Public result type.
- Winner id when allowed internally.
- Whether winner is spy internally.
- Whether shield was consumed internally.
- Voted pool after item effects.
- Not-voted pool.
- Spy count in voted pool.
- Clue eligibility.
- Refund amount and eligibility when an innocent player is caught.
- Generic item-use feedback events, including blocked R/P messages.
- State patches needed for consumed items and shield.

Public UI must never expose vote counts.

Calculation order follows the existing game design:

1. Tally raw votes including double vote.
2. Apply remove vote, floor at zero.
3. Apply swap vote.
4. Resolve R/P threshold mini-game in turn order.
5. Calculate threshold from present players and config.
6. Determine whether exactly one player reaches threshold.
7. If winner is shielded spy, silently flip to failed vote and consume shield.
8. Build voted and not-voted pools from adjusted counts.
9. Resolve spy-in-pool reveal.
10. Enable post-vote clue purchase if allowed.

R/P threshold mini-game:

- R succeeds only if no threshold-category item has already been used. A successful R applies the configured reduction, default 25%.
- If R is used after any threshold-category item, it is blocked, consumed, and emits only the generic blocked message.
- P succeeds only if no P has already been used.
- If P is used before R, it waits to block a later R.
- If P is used after a successful R, it weakens the reduction to the configured weakened reduction, default 12%.
- A duplicate P is consumed and emits only the generic blocked message.
- The threshold is `round(base * (1 - reduction))` with minimum 2.

## Testing Plan

Required automated tests:

- Vote engine edge cases:
  - ties,
  - no one reaches threshold,
  - exactly one reaches threshold,
  - double vote,
  - remove to zero,
  - swap with self,
  - swap between players,
  - R only,
  - P before R,
  - R before P,
  - repeated R,
  - repeated P,
  - threshold floor,
  - shield silent flip,
  - spy-in-pool with threshold met and not met,
  - spy-in-pool still eligible after a shield flip,
  - clue pool for voted and not-voted groups,
  - voted-player clue threshold 3,
  - spy-in-pool threshold 4,
  - innocent-catch refund rounding and recipient eligibility.
- State reducer / action tests for:
  - autosave-ready state transitions,
  - inventory changes,
  - role re-randomization,
  - shield persistence by slot,
  - manual day transitions,
  - backup import validation.

Required manual/browser verification:

- Build succeeds.
- App loads at iPad Air landscape viewport.
- Player cards are large, spaced, and 4:5.
- Role reveal hides secrets after each player.
- Vote flow completes end-to-end.
- Gacha result and quiz flow work.
- Backup export/import restores a playable game.
- End-of-day backup reminder appears.
- Manual rest/pause day does not increase vote cost.
- Manual working-day end without vote increases vote cost.
- Final-day decision gives spies the win when both spies have not been caught.
- GitHub Pages build path works.
- Dry-run simulates a full week with manual day control.

## Implementation Boundaries

In scope for the first full release:

- Full game rules from the provided docs.
- Game-like visual shell.
- Generated art pack integration.
- Real employee photo player cards.
- Manual game day.
- Local browser persistence.
- JSON backup/restore.
- GitHub Pages deploy readiness.
- Tutorial.
- Sound/motion with mute control.

Out of scope for the first release:

- Backend database.
- Multi-device real-time sync.
- Login/PIN system.
- Coin accounting per person.
- Automatic calendar-based day progression.
- Private hosting with access control.

## Planning Notes

No blocking product decisions remain from brainstorming. Implementation planning should assume:

- IndexedDB is the primary browser storage.
- `01-game-design-spec.md` is the source of truth if any rule conflicts arise.
- Generated final art is required for release, though implementation may use temporary placeholders while building flows.
- GitHub Pages is the target production host.
