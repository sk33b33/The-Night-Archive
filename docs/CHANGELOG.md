# Changelog

## 0.3.0 — Phase 3 (assumed): investigation workspace, evidence inventory, documents (2026-11-07)

`docs/ROADMAP.md` is still absent; this follows the CLAUDE.md core-screen order
(investigation workspace and evidence inventory, then document inspection).
The evidence board and deductions are not started.

### Added
- Evidence domain model (`src/domain/evidence.ts`): typed document blocks,
  audio catalogue entries, and deterministic unlock rules (`initial`,
  `discovery`).
- Case 001 records authored from canon: incident report, night timetable
  (02:10 cancelled), works register (east door sealed 1979), duty roster
  (Elias Ward not listed), and the audio reel catalogue entry. No record
  interprets the evidence or names the second voice.
- Investigation workspace with the evidence inventory and examined progress.
- Document viewer with in-document search, match count (announced), and
  highlighted matches. Tables scroll inside the record on narrow screens.
- Save format v2: per-case examined evidence and discoveries; workspace and
  evidence resume points. A v1 → v2 migration upgrades existing saves.
- Briefing now opens the case files; Continue can resume on an evidence item.

### Notes
- The audio reel is listed but disabled with an explanation until the audio
  viewer exists. The filtered segment is not authored yet.
- Screen rendering moved from `App.tsx` into `src/app/ScreenRouter.tsx`.

## 0.2.0 — Phase 2 (assumed): case model, briefing, save/resume (2026-11-07)

`docs/ROADMAP.md` is still absent, so this slice was chosen as the smallest next
step toward Case 001's loop: open a case, read its briefing, leave, and resume.
The investigation workspace and evidence viewers are not started.

### Added
- Domain model (`src/domain/case.ts`) and Case 001 briefing content
  (`src/content/cases/case-001.ts`). The briefing reproduces only the official
  report's claims; nothing about the caller's identity is resolved.
- Versioned save format with a migration hook (`src/domain/save.ts`) and pure
  progress rules (`src/domain/progress.ts`). Corrupt saves are reported; saves
  from a newer build are refused and never overwritten.
- IndexedDB save repository with an in-memory twin for tests
  (`src/services/persistence/`). Writes are queued in order; failed writes show
  a warning instead of failing silently.
- Archive case list with New/Opened status; Case 001 briefing screen with the
  official report presented as a paper record.
- Main menu **Continue** resumes the last archive/briefing screen and rebuilds
  history so Back still works. **Begin shift** is held until the save has loaded.
- Settings: **Erase saved progress** with an explicit confirmation step.

### Notes
- **Begin investigation** on the briefing is disabled with an explanation until
  the investigation workspace exists.

## 0.1.0 — Phase 1: App foundation (2026-11-07)

Scope taken from the README's first-session prompt, because `docs/ROADMAP.md`
was not present in the repository: app foundation, responsive visual system,
screen/navigation shell, and main menu. Case 001 is intentionally not started.

### Added
- React 19 + TypeScript (strict) + Vite 8 project; ESLint (typescript-eslint strict,
  react-hooks) and Vitest + Testing Library.
- Design tokens (`src/styles/tokens.css`): charcoal/midnight surfaces, teal and amber
  accents, spacing/type scale, 48px touch targets, motion durations that drop to zero
  under reduced motion.
- Framework-free navigation model (`src/app/navigation.ts`) mirrored into browser
  history, so Android/browser back moves between screens and refresh keeps your place.
- Screens: main menu, archive dashboard (honest empty state), settings.
- Settings: motion (match device / reduced / full) and text size (standard / large),
  stored in localStorage with a version stamp and defensive parsing.
- Accessible disabled-button pattern: `aria-disabled` plus a visible, announced reason
  (used for **Continue**, which is unavailable until saving exists).
- Focus moves to each screen's heading after navigation.

### Not yet done
- PWA manifest/service worker, IndexedDB saves, Case 001 content — later phases.
