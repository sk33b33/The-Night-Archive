# Changelog

## 0.6.0 — Phase 6 (assumed): case findings and deductions (2026-11-07)

`docs/ROADMAP.md` is still absent. This adds deduction submission to complete
the Case 001 investigation loop. The end anomaly (File 0091) is not started.

### Added
- Deduction domain (`src/domain/deduction.ts`): authored questions with a
  single supported answer and evidence requirements (`allOf` / `anyOf`);
  deterministic outcomes `correct`, `partial`, `incomplete`, `incorrect`;
  progressive hints keyed to the first finding that does not hold.
- Case 001 questions from canon: the report is unreliable/incomplete; the
  recording contains information the report omits; the caller's identity
  remains unknown. Options naming Elias Ward, Mara, or the second voice are
  never accepted. The case can close without the filtered segment.
- Case findings screen: answers, citations per question, procedural feedback,
  a "Reviewer's note" hint, submission count, and accepted findings once
  closed. The form starts from the last submission.
- Case status `closed` (archive chip) once findings are accepted.
- Save format v4: every attempt is stored with its answers, cited evidence
  IDs, outcome, and time; findings resume point; v3 → v4 migration.

## 0.5.0 — Phase 5 (assumed): evidence board (2026-11-07)

`docs/ROADMAP.md` is still absent. Case 001 has no photo, CCTV, or object
evidence, so the next step in its loop is the board. Deductions and the end
anomaly are not started.

### Added
- Board domain (`src/domain/board.ts`): relations (contradicts, corroborates,
  same subject, leaves out, derived from), add/remove/move with duplicate and
  self-link guards, clamped positions, and line/edge geometry.
- Authored Case 001 board rules. A connection matching a rule is **Supported**
  and shows what the records say; anything else stays a **Hypothesis** with
  no penalty and nothing blocked.
- Board view: SVG connections (solid teal = supported, dashed amber =
  hypothesis, arrows for directed relations); cards drag by mouse, touch, or
  pen, move with arrow keys, and select with tap/Enter to fill the form.
- List view and connection form as the accessible alternative; narrow screens
  start in the list view.
- Save format v3: per-case board positions and connections, board resume
  point, and a v2 → v3 migration.

### Changed
- The incident report's caller field reads "Elias Ward (station staff)" so
  the roster contradiction is fair. It still only records whom the report
  names; it does not establish who called.

## 0.4.0 — Phase 4 (assumed): audio evidence (2026-11-07)

`docs/ROADMAP.md` is still absent; this continues the CLAUDE.md evidence order
with audio inspection. The evidence board and deductions are not started.

### Added
- Audio model (`src/domain/audio.ts`): authored timelines of segments with
  sound layers, transcript lines, and deterministic filters that change the
  mix and can reveal lines.
- Playback reducer (`src/domain/playback.ts`): play/pause/seek/speed/end,
  driven by an injected clock so it is testable without audio APIs.
- Procedural reel synthesis (`src/services/audio/reelSynth.ts`): seeded tape
  hiss, chimes, and speech-like voices rendered directly to samples. Words are
  carried by captions. Mixes are cached and pre-rendered while idle.
- Web Audio engine created on the first Play (a user gesture, as Android
  requires). If sound is unavailable, captions and segments keep working.
- Audio player: play/pause, scrub slider with spoken time, 0.5×–1.5× speed,
  segment list, live captions, and filter switches.
- Case 001 reel: announcement (02:10 cancelled), clock chime, the obscured
  voice ("Don't open the east door."). With **Voice isolation** applied, a
  second voice is revealed ("Mara, don't file this."), recording a discovery
  that files the **Filtered segment** (Item 2a) to the case.
- Speakers stay unidentified; no line attributes either voice to anyone.

### Notes
- Sound is synthesised placeholder audio by design: real recordings can
  replace it behind the same timeline model later.

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
