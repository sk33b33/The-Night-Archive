# The Night Archive

*Every file has a story. Some stories refuse to stay buried.*

An interface-driven investigation game. You are the night archivist in a
government records facility, reopening unresolved incidents through
documents, photographs, audio, CCTV, and object records. As the cases go on,
the files begin to change.

Browser-first and installable (PWA). It plays offline once loaded and saves as
you go. No accounts, timers, or purchases.

## Status

All seven cases on the roadmap are playable, in order:

| # | Case | Introduces |
|---|---|---|
| 001 | The Missing Recording | Documents, audio reel with a voice filter, evidence board, findings |
| 002 | The Empty House | Photographs as evidence, records that change |
| 003 | The Unknown Caller | Objects (chain of custody), ordering questions |
| 004 | File 0091 | Select-all-that-apply questions |
| 005 | The Wrong Date | Side-by-side photo comparison |
| 006 | Someone Is Watching | CCTV footage |
| 007 | The Impossible Call | Side-by-side audio comparison |

Each case unlocks when the one before it is closed. Case canon (what is
established, what is invented, and what must stay unknown) lives in
[`docs/cases/`](docs/cases/). The change history is in
[`docs/CHANGELOG.md`](docs/CHANGELOG.md).

## Running it

Requires Node.js 22.12 or later (the test runner needs it; Vite alone runs on 20.19+).

```bash
npm install
```

```bash
npm run dev
```

Opens a development server. The service worker is only active in production
builds:

```bash
npm run build
```

```bash
npm run preview
```

### Checks

```bash
npm run typecheck
```

```bash
npm run lint
```

```bash
npm test
```

`npm test` includes a full playthrough of every case and a season-integrity
check (`src/content/season.test.ts`). That check confirms each case can be
closed using only evidence the player can reach inside it.

## Installing on a phone

Serve a production build over HTTPS (any static host). Open it in Chrome on
Android and choose **Install app**, or **Add to Home screen** in Safari on
iOS. New versions wait until the player taps **Update now**. Saves are kept.

The app assumes it is served from the domain root (`/`). To host it under a
subpath, set Vite's `base` and the manifest's `start_url` and `scope` in
`vite.config.ts`.

## How it is built

React, TypeScript (strict), and Vite. No UI framework; styles are plain CSS
with design tokens.

```text
src/
  app/            Navigation, history sync, screen router, update prompt
  components/     Shared UI (buttons, layout, document view, controls)
  content/        Case data, anomalies, the player's desk. No UI code.
  domain/         Pure rules: evidence, deductions, board, saves, playback
  features/       Screens: archive, briefing, investigation, evidence
                  viewers (document, audio, photo, CCTV, object), board,
                  findings, anomaly, settings
  services/       Persistence (IndexedDB saves), audio synthesis and playback,
                  preferences
  styles/         Tokens and global styles
docs/             Changelog and per-case bibles
.claude/          Agent definitions, skills, and settings for Claude Code
```

- **Deterministic:** all deductions, unlocks, and board relationships are
  authored data evaluated by pure functions in `src/domain/`. There are no
  network or AI calls during play.
- **Saves:** IndexedDB, versioned with migrations (currently v5).
  Preferences use localStorage, and unsubmitted findings drafts use
  sessionStorage.
- **Audio:** synthesised in code (seeded, so every render is identical),
  played through the Web Audio API. Words are carried by captions. Real
  recordings can replace the synthesis behind the same timeline model.
- **Accessibility:** keyboard and touch throughout, visible focus, reduced
  motion respected (CCTV never autoplays under it), a list alternative to the
  evidence board, and no hover-only controls. Screens are audited with axe at
  360 px and desktop widths.

## Working on it with Claude Code

`CLAUDE.md` is the project brief and working agreement. Case content changes
should start from the relevant bible in `docs/cases/`.
