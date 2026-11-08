# Changelog

## 0.21.0 — Case 012: The East Door (2026-11-08)

Built from the approved case bible (`docs/cases/case-012-bible.md`). Season 2.

### Added
- **Timeline evidence type.** Several records on one time axis.
  - **Chart:** one row per source, drawn as a picture. Clicking an event
    highlights its entry in the list.
  - **List:** every event in time order, tagged with its source and linked
    to it. The list is the control and the accessible view.
  - **Source filters** show or hide each record. An empty state explains
    when every source is hidden.
  - **Amendments:** a track can be appended when a case closes.
- Case 012 content:
  - the 1979 works order (hasp, padlock, key to the district engineer)
  - the night of 13–14 October 1981 from five records: signal box, porter,
    supervisor, exchange route BW-4, and the incident report
  - copies of the duty roster and the SB-07 inventory line
  - seven board rules and five findings: ordering, select-all, a count (15
    minutes), "the records disagree", and "cannot be established"
- End beat A: once Case 012 closes, the timeline gains a track, "Records
  facility, night desk, 1981". Its one entry: "03:40 · Call received from
  E. Ward. Not filed." No record of it is on file.

## 0.20.0 — Case 011: Storage B (2026-11-08)

Built from the approved case bible (`docs/cases/case-011-bible.md`). Season 2.

### Added
- **Count findings.** A question type whose answer is a whole number, with
  authored near misses.
  - A near miss is unsupported, like any wrong answer, but its hint names
    the record the count left out.
  - The input brings up the numeric keyboard.
  - Anything that is not a whole number is explained inline and blocks
    submission.
- Storage B photographs drawn from shared layout data, so regions line up
  between the 1981 sealing photograph and the File 0094 photograph.
- Case 011 content:
  - P. Nash's 06:07 note
  - the File 0094 photograph and the 1981 sealing photograph, with a
    required location note (matched by the barred window)
  - the sealing inventory (48 boxes), the 1997 clearance list (46
    transferred, 2 not found) and the stack room accession (45 received)
  - copies of the building history and tonight's intake ledger
  - six board rules and five findings: two counts, a select-all question,
    a choice, and "cannot be established"
- End beat A: once Case 011 closes, the SB-07 line in the inventory reads
  "Contents: east door key, Bellwether."

### Changed
- Reference codes such as "SB-07" and "NA-07" no longer break at the hyphen
  in narrow document tables.

## 0.19.0 — Case 010: The Handover (2026-11-08)

Built from the approved case bible (`docs/cases/case-010-bible.md`). Season 2.

### Added
- **Floor plan evidence type.** Authored rooms on a 400×300 plan and time
  steps, each with per-room entries naming their source record. The viewer
  has a time selector, a room list (the accessible alternative and the
  actual control), and per-room entries with links to their sources. The
  plan only ever shows what a record says: an unlit room means no record,
  not nobody.
- Plan amendments: a time step appended when a case closes.
- Case 010 content:
  - the first-floor plan (05:50–06:05)
  - the door and badge log, your shift log (end), and P. Nash's handover log
  - camera 2, 05:55–06:06, with a seated figure and the day archivist at
    06:00:10
  - tonight's intake ledger (0093, 0094)
  - the handover "M." and a copy of the 0094 slip, with a required
    comparison note (crossed M, "consistent with")
  - six board rules and five findings, including a select-all question and
    "cannot be established"
- End beat A: once Case 010 closes, the plan gains a step "06:00 · Storage B"
  showing a sealed room that is not on the plan, with no record.

## 0.18.0 — Case 009: The Hand (2026-11-08)

Built from the approved case bible (`docs/cases/case-009-bible.md`). Season 2.

### Added
- Handwriting samples rendered from layout data: a crossed "M", an open "0",
  and a slanted "1" drawn identically in every sample, with marked regions
  computed from the same coordinates.
- Case 009 content:
  - the 0094 intake slip from Case 008's envelope
  - four Season 1 handwriting samples and the 1979 specimen signature card
  - the staff register (night archivist "M. —", 1979–1983) and the
    examiner's method note ("consistent with" is the limit)
  - two comparison notes (required, filed by matching letterforms)
  - the opened envelope and the current post record
  - six board rules and five findings
- End beat A: once Case 009 closes, the register's 1979–1983 line reads
  "1983 — tonight".

### Fixed
- **Photo comparison with "Keep views in step":** choosing a region zoomed
  both photographs to the *left* photograph's region coordinates, so the
  right one showed the wrong area whenever the region sat elsewhere. Each
  photograph now zooms to its own copy of the region, and in-step zoom/pan
  applies the same change to both rather than copying one view onto the
  other. A regression test covers it. (Cases 005, 006, and 008 were
  unaffected: their regions sit at identical positions.)

### Verified
- typecheck, lint, 346 tests (season integrity across nine cases), build;
  Chromium at 360px and 1280px for Cases 008 and 009; axe: no violations;
  no overflow; no console errors.

## 0.17.0 — Case 008: The Next Number (Season 2 opener) (2026-11-08)

Built from the approved case bible (`docs/cases/case-008-bible.md`). Beyond
CLAUDE.md's roadmap.

### Added
- Engine: **seasons**. Cases carry a season, and the archive groups them
  under "Season 1" / "Season 2" headings when more than one exists.
- Artwork:
  - a **pre-dawn** workstation view (lamp off, sealed envelope, clock 05:12),
    now used by File 0093
  - a shared **wall clock** above position 7 in every view: 03:40 in File
    0091, 11:05 in the 1998 photograph, following the timestamp on camera 2
  - envelope and night-porter scene states in the CCTV artwork
- Case 008 content: File 0093 photograph and the camera 2 still at 05:12
  (matching the wall clock files the required timing note); camera 2
  footage 04:10–05:20; tonight's intake ledger (0093 at 03:40, 0094
  reserved); internal post log; lamp circuit log; the sealed envelope (object);
  your shift log continued; six board rules; five findings.
- End beat A: once Case 008 closes, ledger 0094's time reads 06:00.

### Changed
- File 0093's photograph is the pre-dawn view (approved canon change).
- Case 008 does not take over File 0093's Unfiled card, so Case 007's final
  beat stays visible.

### Verified
- typecheck, lint, 329 tests (including season integrity across eight
  cases), build; Chromium at 360px and 1280px from a Season 1-complete save;
  axe: no violations; no overflow; no console errors.

## 0.16.2 — Polish and hardening (2026-11-08)

### Changed
- **Vendor chunk:** dependencies (React and Workbox's window helper) are
  built into their own chunk. Game code is ~50 KB gzipped and vendor ~70 KB.
  An update now re-downloads only the game chunk. No lazy loading: the
  service worker downloads everything for offline play anyway, and our own
  code is small.
- **Shared code instead of copies:**
  - Evidence-kind labels → `src/components/evidenceKind.ts`.
  - "Remember comparison" helpers → `src/features/evidence/compareChoice.ts`.
  - The "Compare with" picker → `CompareSelect`, used by the document, photo,
    and audio viewers (previously three copies).
- Removed `EvidenceCard`'s unused `disabledReason` prop (dead since audio
  playback was enabled).
- Playthrough tests share helpers in `src/test/playthrough.ts` (click, back,
  case-file stack, closed-case saves, question queries) instead of seven
  copies.

### Dependencies (reviewed, accepted)
- `npm audit` reports 15 advisories (13 moderate, 2 low), **all in
  development/build tooling**: ESLint, typescript-eslint, and Workbox's build
  step, via `minimatch`, `glob`, and `deepmerge`. The shipped app's runtime
  dependencies are only `react` and `react-dom`, which are unaffected.
- `npm audit fix` changes nothing. `--force` would *downgrade* ESLint to 9
  and vite-plugin-pwa to 1.1. Pinning patched versions needs major jumps
  (minimatch 11, glob 14), and deepmerge has no patched release. Not done:
  the risk of silently breaking linting or service-worker generation
  outweighs build-time-only advisories. Re-check when ESLint or Workbox
  release updates.

### Verified
- typecheck, lint, 309 tests, build; offline reload and Continue; the full
  seven-case browser pass at 360px and 1280px with axe (no violations).

## 0.16.1 — Season integrity and README (2026-11-08)

### Added
- `src/content/season.test.ts`: for every case, computes the evidence the
  player can reach (initial items plus everything unlocked by discoveries the
  case can produce: photo regions, filtered audio lines, CCTV regions, and
  photo/audio matches), then checks the authored supported answers close the
  case using only reachable evidence. Also checks the unlock chain,
  well-formed questions, amendment and anomaly references, and unique IDs.
  Verified to fail when a required discovery is removed.

### Changed
- `README.md` rewritten for the game: what it is, case list, running and
  checking it, installing on a phone, and project structure. Replaces the
  starter-kit instructions.

## 0.16.0 — Case 007: The Impossible Call (2026-11-08)

Built from the approved case bible (`docs/cases/case-007-bible.md`): reveal
level 1, final beat A. All seven roadmap cases are now playable.

### Added
- Engine: **audio comparison**. Two recordings side by side; the player
  chooses which to listen to; both caption boxes follow the same segment;
  an aligned segment list jumps both recordings, and a segment marked
  `revealsOnMatch` records a discovery when matched.
- Engine: anomalies can carry an imprint dated **tonight** (device clock),
  and their record stamp is now content rather than fixed.
- Case 007 content: tonight's NA-07 answerphone recording (same segments as
  the 1981 reel, clearer; voice isolation), audio comparison note (required),
  extension log, exchange routing record (route BW-4 withdrawn 1983),
  extension register (NA-07 created 1998), 1981 reel copy, night archivist
  post record ("M. —"), Case 001 report copy; six board rules; five findings.
- Final beat A: once Case 007 closes, **File 0093** appears in Unfiled: a
  photograph of Workstation NA-07 dated tonight, intake number 0093 issued at
  03:40, filed by M. Unexplained.

### Verified
- Chromium at 360px and 1280px, **Cases 001–007 played in one save** through
  the UI; axe: no violations; no overflow; no console errors.

## 0.15.0 — Case 006: Someone Is Watching (2026-11-08)

Built from the approved case bible (`docs/cases/case-006-bible.md`). The
story reaches the player's current shift.

### Added
- Engine: **CCTV evidence** (frames with timestamps, scene state, regions,
  and descriptions) and a CCTV viewer: previous/next frame, frame slider
  with spoken position, a frame list, play/pause, and frame inspection with
  zoom, pan, and regions; zoom is kept while stepping. Under reduced motion
  there is no playback, with an explanation.
- `prefersReducedMotion()` helper honouring the player's setting, then the
  device.
- Artwork: camera 2's monochrome reading-room view (door, lamp, archivist,
  figure states, scanlines, timestamp) on the File 0091 layout; an exported
  03:40 still; the night-entrance door added to the File 0091 artwork.
- Case 006 content: camera 2 footage (12 frames), the 03:40 still, viewpoint
  note (required, unlocked by matching the window against the File 0091
  photograph), File 0091 photograph copy, access log, the player's shift log,
  camera installation record, call 6 extract; six board rules; five findings.
- End beat A: once Case 006 closes, Case 001's incident report carries
  "Report time 03:40: received at extension NA-07." Unexplained.

### Verified
- Chromium at 360px and 1280px, Cases 001–006 in one save through the UI;
  axe: no violations; no overflow; no console errors; playback advances and
  stops on the last frame when motion is allowed.

## 0.14.0 — Case 005: The Wrong Date (2026-11-07)

Built from the approved case bible (`docs/cases/case-005-bible.md`). Proves
the File 0091 date wrong and the records contradictory; never explains how.

### Added
- Engine: **photo comparison**. Photographs can be opened side by side with
  "Keep views in step"; choosing a region present in both zooms each to it,
  and a region marked `revealsOnMatch` records a discovery.
- Engine: `PhotoViewer` supports a controlled view (shared between viewers).
- Engine: **object amendments** add custody entries ahead of the existing
  ones once a case closes; case cards count amended objects too.
- Artwork: HALDEN 486 maker's badge on the File 0091 terminal; a daylight
  1998 installation photograph of the same desk (no lamp, no papers, position
  tag, no imprint).
- Case 005 content: File 0091 photograph (badge region), installation
  photograph, Estates comparison note (required, unlocked by matching the
  badge), camera manual, Halden catalogue, paper data sheet, companies
  register, asset register; six board rules; five findings (choice,
  select-all, ordering).
- End beat B: once Case 005 closes, the File 0091 print's chain of custody
  shows an earlier entry: "14 Oct 1981 · Night archivist (Workstation NA-07)
  · Unfiled tray · Placed." Unexplained.

### Fixed
- A switch placed directly in a screen column no longer stretches tall.

### Verified
- Chromium at 360px and 1280px, Cases 001–005 in one save through the UI;
  axe: no violations; no overflow; no console errors.

## 0.13.0 — Case 004: File 0091 (2026-11-07)

Built from the approved case bible (`docs/cases/case-004-bible.md`).
Provenance only; the photograph's date is left for Case 005.

### Added
- Engine: **select-all-that-apply** questions, evaluated as an exact set,
  with distinct hints for a missing record and an extra one.
- Engine: a case can **take over an Unfiled anomaly** (`replacesAnomaly`);
  File 0091's card becomes Case 004 once it is available.
- Engine: amendments can **change a single table cell**.
- Artwork: the File 0091 photograph is registered as case evidence, plus a
  desk-papers enlargement (an intake-ledger page with 0091 freshly written).
- Case 004 content: photograph (new "papers on the desk" region, required
  discovery), the print as an object (custody begins with the player),
  intake ledger (0091 voided), Kessler Photo order book, building history,
  asset register; six board rules; four findings including select-all.
- End beat A: once Case 004 closes, the voided 0091 line is dated "14 Oct".

### Fixed
- Notices shown inside a photo print (e.g. "Added to the case files") now
  use dark text on the light paper (axe colour-contrast).

### Verified
- Chromium at 360px and 1280px, Cases 001–004 in one save through the UI;
  axe: no violations; no overflow; no console errors; region alignment
  checked by screenshot.

## 0.12.0 — Case 003: The Unknown Caller (2026-11-07)

Built from the approved case bible (`docs/cases/case-003-bible.md`).

### Added
- Engine: **object evidence** with property record, chain of custody, and
  linked records that open directly.
- Engine: **ordering questions** (put events in order) with Move up / Move
  down buttons and announced moves; answers stored as strings, so no save
  migration. Buttons at the ends stay focusable (`aria-disabled`).
- Engine: amendments can **append a table row**; existing passage keys and
  highlights are unaffected.
- Synth: clock-tick and kettle sound layers for the background filter.
- Case 003 content: call log, recording of call 5 with a background-isolation
  filter that files an optional engineer's analysis, fault report, call box
  handset (object), malicious-call trace (subscriber redacted), attendance
  notes; six board rules; four findings including the ordering question.
- End beat: after Case 003 closes, the call log shows a sixth call —
  "Records facility, night entrance", "Not attended." Unexplained.
- Tests: ordering logic, Case 003 content and findings, the row amendment,
  synth output, and a full Case 003 playthrough.

### Verified
- Chromium at 360px and 1280px, Cases 001–003 played in sequence through the
  UI; ordering solved with the keyboard; axe: no violations; no overflow; no
  console errors.

## 0.11.0 — Case 002: The Empty House (2026-11-07)

Built from the approved case bible (`docs/cases/case-002-bible.md`).

### Added
- Engine: **photos as evidence** (`PhotoEvidence`) using the existing viewer,
  with an artwork registry; examining a photo region can record a discovery.
- Engine: **case availability** (`availableAfter`): Case 002 appears in the
  archive once Case 001 is closed; locked cases cannot be opened via history.
- Engine: **record amendments**: a document gains a block once a case is
  closed, appended so existing passage keys and highlights stay valid. Case
  cards show "N records amended since filing".
- Case 002 content: inspection report, welfare request, meter card, kitchen
  photograph (calendar, radio, cup), calendar enlargement (unlocked by
  examining the calendar; required for the findings), answerphone cassette,
  tenancy register; six board rules; three findings with hints.
- End beat: once Case 002 closes, Case 001's incident report carries a new
  annotation, "Filed. — M." Unexplained.
- Tests: Case 002 content integrity, findings (never accepting Ellery, Pell,
  vacancy, or a motive), amendments, and a full Case 002 playthrough.

### Notes
- No save-format change: availability and amendments derive from closed
  cases; discoveries, board, and highlights already work per case.

## 0.10.0 — Document highlighting and comparison (2026-11-07)

Completes the CLAUDE.md document tools (read, search, highlight, compare).

### Added
- Highlight passages: a "Highlight passages" mode adds a star toggle
  (`aria-pressed`, named by the passage text) to each paragraph, field, and
  table row. Marked passages keep a marker background; "Clear highlights on
  this record" removes them.
- Compare with: shows a second document beside the first (stacked on narrow
  screens). Search covers both, with per-record counts. The choice is kept
  for the tab in session storage.
- Save format v5: highlights per document, validated against the content
  (`passageKeys`) so removed passages are dropped; v4 → v5 migration.

### Changed
- Wide layouts are a `ScreenLayout` option (`wide`) instead of an app-shell
  special case; the board and document comparison use it.
- Focus rings on paper records use ink blue.

### Verified
- axe audit including highlight mode and comparison: no violations.
- 360px and 1280px: no horizontal overflow; two columns only when wide.

## 0.9.0 — Photo inspection (2026-11-07)

General photo viewer from the CLAUDE.md evidence list (zoom, pan, regions),
first used by File 0091's photograph. Still within Case 001 scope.

### Added
- Viewport maths (`src/domain/photoView.ts`): clamped zoom (1×–4×) about a
  fixed point, bounded panning, and fit-to-region. Unit tested.
- `PhotoViewer` (`src/features/evidence/photo/`): drag to pan; pinch,
  double-tap/double-click, and Ctrl+wheel (trackpad pinch) to zoom; keyboard
  `+` `−` `0` and arrows; zoom buttons with a readout; Reset view. Zoom
  transitions follow the motion setting.
- Authored photo regions: a "Marked regions" list zooms to each region and
  shows a neutral observation; outlines can be hidden.
- File 0091 regions: asset label (NA-07), terminal screen, date imprint.
  Observations only; nothing is explained.

### Changed
- Focus rings on light "paper" surfaces use ink blue for contrast.
- The File 0091 print is no longer tilted, so pointer positions map exactly.

### Verified
- Touch pinch and pan, double-click, and Ctrl+wheel in Chromium; the page
  itself does not scroll or zoom during photo gestures.
- axe-core audit of all screens (now including the viewer): no violations.

## 0.8.1 — Case 001 polish and QA (2026-11-07)

### Added
- Full Case 001 playthrough regression test (`src/app/playthrough.test.tsx`),
  including a refresh mid-case and a later session.
- Case bible (`docs/cases/case-001-bible.md`) separating canon, added
  details, supported conclusions, and unknowns.

### Fixed
- Evidence board cards: the accessible name now matches the visible text
  (axe `label-content-name-mismatch`); movement instructions are a shared
  description instead.

### Verified
- axe-core 4.14 (WCAG 2.1 A/AA + best practice) on 15 screen states at 360px
  (standard and large text) and 1280px: no violations, no horizontal
  overflow, no console errors.
- Keyboard-only playthrough from the main menu to File 0091, with a visible
  focus indicator at every stop.

## 0.8.0 — Phase 8 (assumed): installable PWA and offline play (2026-11-07)

`docs/ROADMAP.md` is still absent. With Case 001 playable end to end, this
makes the app installable and playable offline, per the product constraints.

### Added
- `vite-plugin-pwa` (dev dependency, plus `workbox-window`): generates the
  web app manifest and a Workbox service worker that precaches the whole
  build, so the game runs fully offline after the first visit.
- Manifest: name, short name, standalone display, dark theme colours, and
  icons (192, 512, maskable 512, SVG) plus an Apple touch icon, all rendered
  from one source SVG (`public/icons/icon.svg`).
- Update prompt (`src/app/UpdatePrompt.tsx`): new versions wait until the
  player chooses **Update now**; "Later" keeps the current version. An
  "offline ready" notice appears once caching finishes. Page content is
  padded so the banner never covers controls.

### Verified
- Chromium reports no manifest or installability errors.
- Offline reload, Continue, and audio playback all work with the network off.
- Shipping a new build shows the update prompt; updating keeps saved progress.

## 0.7.0 — Phase 7 (assumed): Case 001 end anomaly (2026-11-07)

`docs/ROADMAP.md` is still absent. This completes the Case 001 loop with the
canon end anomaly. No later cases are started.

### Added
- Anomaly model (`src/domain/anomaly.ts`) and File 0091 content
  (`src/content/anomalies/file-0091.ts`): appears in an **Unfiled** section of
  the archive once Case 001 is closed. It holds a photograph of workstation
  NA-07 with a 14 OCT 1981 date imprint, beside an asset-register entry
  showing NA-07 was installed in 1998. Nothing explains it.
- The archive dashboard shows the player's workstation (NA-07) from the
  first shift, so the photograph is recognisable.
- The photograph is a static SVG with a full text alternative.
- "Return to the archive" on accepted findings.

### Fixed
- Unsubmitted findings are kept in session storage, so a refresh no longer
  loses answers in progress. Submitting clears the draft.

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
