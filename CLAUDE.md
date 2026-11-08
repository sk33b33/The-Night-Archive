# CLAUDE.md — The Night Archive

## Mission
Build **The Night Archive**, a polished, mysterious, interface-driven investigation game. The player is a night-shift archivist in a government records facility, reopening unresolved incidents through documents, photographs, audio, CCTV, and object records. As cases progress, files begin to change and appear to predict events.

**Tagline:** “Every file has a story. Some stories refuse to stay buried.”

## Product constraints
- Browser-first, installable PWA; Android-friendly from the first release.
- Solo-developer scope. Finish and polish the first case before adding chapters.
- Modern premium dark interface. Since 2026-11-08 the archive is a first-person 3D reading room (free roam; see `docs/3D-engine-plan.md`); evidence, board and findings stay 2D overlays. Every object in the room must also be reachable from the Places list.
- Sessions target 10–20 minutes; save and resume at any point.
- No energy systems, wait timers, or pay-to-progress mechanics.
- Deductions are authored and deterministic. No LLM/API calls during gameplay.
- Never invent conclusions beyond what evidence supports.
- Every visible control must work or be clearly disabled with an explanation.
- Avoid giant components; use typed domain models and clear boundaries.

## Recommended stack
- React + TypeScript + Vite.
- Lightweight CSS system or CSS modules; justify extra UI dependencies.
- IndexedDB for durable saves; localStorage only for lightweight preferences.
- Web Audio API for playback and basic audio interaction.
- SVG for evidence-board connections.
- Add a maintained Vite PWA plugin when the app shell is stable.
- Capacitor is a later packaging step. The 3D room uses three.js via React Three Fiber and drei (lazily loaded); Phaser is unnecessary.
- Inspect the repo before changing it; preserve existing work. Explain dependencies before adding them.

## Visual direction
Charcoal/midnight-blue surfaces, restrained teal and amber accents, crisp typography, generous spacing, subtle purposeful motion. Mobile-first for Android, then tablet and desktop. Accessible contrast, visible focus, touch-friendly targets, reduced-motion support. Never rely on hover alone.

## Core screens and features
1. Main menu / continue.
2. Archive dashboard with case list, status, access level.
3. Case briefing.
4. Investigation workspace and evidence inventory.
5. Evidence inspection: photos (zoom/pan/regions), documents (read/search/highlight/compare), audio (play/pause/scrub/speed/segments), CCTV (scrub/frame inspection), objects (provenance and linked records).
6. Evidence board: arrange cards and create labelled relationships.
7. Deduction submission with correct/partial/incomplete/incorrect feedback.
8. Save/resume and settings/accessibility.

## Evidence board rules
- Mouse and touch support.
- Labelled connections; distinguish confirmed links from hypotheses.
- Incorrect links must not unfairly punish or block progress.
- Persist layout and links.
- Provide a list-based accessible alternative, especially on narrow screens.

## Deduction rules
- Authored, deterministic rules per case.
- Outcomes: `correct`, `partial`, `incomplete`, `incorrect`.
- Progressive hints; do not trap players.
- Never accept unsupported theories as facts.
- Store evidence IDs and submitted answer with each attempt.

## Story rules
Atmosphere comes from precise details, contradictions, silence, and procedural language—not constant jump scares. Maintain a case bible. Distinguish facts, plausible inferences, and unknowns. Keep content data separate from UI. Do not reveal the long mystery too early.

## Case roadmap
- Tutorial / Case 001: **The Missing Recording**
- Case 002: **The Empty House**
- Case 003: **The Unknown Caller**
- Case 004: **File 0091**
- Case 005: **The Wrong Date**
- Case 006: **Someone Is Watching**
- Case 007: **The Impossible Call**

Build only Case 001 until its complete loop is playable, tested, and polished.

## Case 001 canon — The Missing Recording
**Location:** Bellwether Railway Station. **Date:** 14 October 1981. **Official report time:** 03:40.

The report names caller **Elias Ward**, mentions unusual activity near the east platform, and says no incident was confirmed.

Evidence:
- Audio reel: station announcements, clock chime, obscured voice, “Don't open the east door.”
- Filtered segment reveals a second voice: “Mara, don't file this.”
- Timetable: last train cancelled at 02:10.
- Maintenance record: east door sealed in 1979.
- Duty roster: Elias Ward was not assigned there that night.

**Supported conclusion:** the official report is unreliable/incomplete; the recording contains information omitted from it; the caller's identity remains unknown. Do not assert that Elias, Mara, or anyone else was the caller.

**End anomaly:** File 0091 appears with a photograph of the player's own workstation dated 14 October 1981. Archive records show that workstation was installed in 1998. Leave this unexplained.

## Architecture expectations
Use strict TypeScript; avoid `any`. Separate domain types, case content, persistence, game logic, and presentation. Keep rules testable without React. Use stable IDs. Version save data and plan migrations. Handle loading, empty, and error states. No lorem ipsum in player-facing UI. No secrets/API keys in repo.

Suggested structure (adapt to repo):
```text
src/app/ components/ features/{archive,investigation,evidence,evidence-board,deductions,settings}/ content/cases/ domain/ services/{persistence,audio}/ styles/ test/
docs/ .claude/
```

## Quality gates
- TypeScript check, lint (if configured), and production build pass.
- Tests cover deduction evaluation, evidence unlocks, save/restore, and board relationships.
- No console errors in normal flows.
- Main flows work at 360px viewport width.
- Keyboard/touch and reduced motion are respected.
- No accidental progress loss on refresh.

## Claude Code working agreement
1. Read this file and relevant docs before coding.
2. Inspect actual repository; preserve existing work.
3. Work in small phases; do not silently implement later phases.
4. State a short plan and likely files before large changes.
5. Implement, run checks, fix failures, and report exact results.
6. Never claim checks passed unless run.
7. No polished-looking placeholder screens with dead controls.
8. Resolve ambiguity with the smallest safe assumption; ask only if blocked.
9. Prefer maintainable, accessible solutions over clever abstractions.
10. Update `docs/CHANGELOG.md` for meaningful milestones.

## Definition of done
Requested scope implemented; relevant checks run; mobile/desktop considered; no known broken controls; summary lists files changed, checks run, and remaining risks.
