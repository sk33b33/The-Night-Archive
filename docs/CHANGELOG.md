# Changelog

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
