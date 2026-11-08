# Case bible — Case 006: Someone Is Watching

Status: **approved** (2026-11-08), implemented in `src/content/cases/case-006*.ts`.
All proposals approved; **end beat A** chosen, the 1981 call "received at
extension NA-07". The figure stays faceless and unattributed.

**Changes at implementation:**
- The end-beat note is appended at the end of Case 001's report ("Report
  time 03:40: received at extension NA-07."), not placed under the field, so
  existing passage keys and highlights stay valid.
- So camera 2's viewpoint can genuinely match the File 0091 photograph, the
  CCTV frames share that photograph's layout, and the **night-entrance door**
  (shut) has been added to the far wall of the File 0091 artwork.
- The shift log adds "23:05–23:15 Retrieval, stack room", so position 7 is
  empty when the door opens at 23:10.

**Details chosen at implementation [Added]:** twelve frames, 22:00:00 to
04:10:00; the figure appears only at 03:40:02; the door stands open only at
23:10:04.

## Scope guard

Threads this case may pick up:
- Case 003's sixth call ("Records facility, night entrance", 23:10, not attended)
- Case 004/005's File 0091 print, "placed" at position 7 and "found" by the
  player
- the watching motif

**[Rule]** Case 006 may establish that **someone else was at the player's
desk during the player's own shift**, and **where the File 0091 photograph
was taken from**. It must not identify that person, explain "M.", or say who
Mara is. Those belong to Case 007, *The Impossible Call*.

## Premise

The present day, for the first time: **the player's current shift**. The
archive's security office pulls the night's reading-room CCTV after File 0091
was found. The player is reviewing their own night.

- **Assignment:** "Security has pulled tonight's reading-room footage after
  File 0091 was found at your workstation. Establish what the records show
  about the night. Record only what the evidence supports."

## Evidence

| # | Item | Type | What it shows |
|---|---|---|---|
| 1 | Reading-room CCTV, camera 2, tonight | **CCTV (new type)** | Time-lapse frames 22:00–04:10. 23:10: the night-entrance door, in the far wall, stands ajar, then is closed by 23:11. **03:40: a figure at position 7**, back to camera, at the Unfiled tray. 04:05: the night archivist returns to the desk. |
| 2 | Night-entrance access log | Document | Badge entries tonight: **22:02, night archivist**. No other entries until 06:00. |
| 3 | Your shift log | Document | 22:02 on shift. **03:30–03:50 break, staff room.** 04:05: "Item found in Unfiled tray (File 0091). Recorded." |
| 4 | Camera installation record | Document | Camera 2: reading room, north-east corner, 2.4 m up. Installed 1998. Covers positions 5–8 and the far wall, including the night entrance. |
| 5 | Camera 2 still, 03:40 | Photo (exported frame) | A single exported frame for close inspection and comparison. |
| 6 | File 0091 photograph | Photo (existing) | For comparison with the still. |
| 7 | Control-room call log extract | Document (copy) | Case 003's sixth entry: blank date, 23:10, "Records facility, night entrance", "Not attended". |

**Discovery (required):** compare the **Camera 2 still** with the **File 0091
photograph**. Matching the **window** region, at the same angle and height in
both, files **Item 5a: Viewpoint note**: *"The File 0091 photograph shares
camera 2's viewpoint: north-east corner, 2.4 m."*

**Frame inspection:** in the CCTV, frames can be stepped one by one. In the
03:40 frame, the region **Unfiled tray** notes *"Something white is being placed
in the tray."* In the 23:10 frame, the region **Night entrance** notes *"The door
is open. No one is in frame."*

## Supported conclusion

1. Someone was at position 7 at 03:40 while the night archivist was on a
   recorded break (CCTV and shift log).
2. The night entrance opened at 23:10 with no badge entry recorded (CCTV and
   access log), at the time given in the unattended sixth call.
3. The File 0091 photograph was taken from camera 2's viewpoint (viewpoint
   note).
4. Who was at position 7 cannot be established. Their face is never in frame.

**[Rule]** Never accept:
- "it was the player"
- "it was M." or "it was Mara"
- "camera 2 took the File 0091 photograph" (a viewpoint is not a device)
- "the sixth call was made tonight" (the date is blank)
- any explanation

## Findings

1. *Who was at position 7 at 03:40?* Supported: **Someone who cannot be
   identified, while you were on break.** Cite the CCTV and the shift log.
2. *Did anyone enter through the night entrance after 22:02?* Supported:
   **The door opened at 23:10, but no badge entry is recorded.** Cite the CCTV
   and the access log.
3. *Where was the File 0091 photograph taken from?* Supported: **Camera
   2's viewpoint.** Cite the viewpoint note.
4. **Ordering:** *Put tonight's events in order:* on shift 22:02; door ajar
   23:10; break begins 03:30; figure at position 7 03:40; break ends 03:50;
   item found 04:05.
5. **Select all that apply:** *Which records place someone other than you
   in the reading room tonight?* Supported: the CCTV and the still.
   Not the access log, the shift log, or the call log extract.

## Board relationships the records support

- CCTV **contradicts** access log (door opens, no badge)
- CCTV **corroborates** shift log (the archivist's desk is empty 03:30–03:50)
- Still **derived from** CCTV
- Viewpoint note **derived from** still
- Installation record **same subject** still (camera 2)
- Call log extract **same subject** CCTV (night entrance, 23:10)

## End beat (sets up Case 007) — choose one

- **A:** after Case 006 closes, Case 001's incident report gains a note in
  the same hand as before, under "Report time 03:40": *"Received at
  extension NA-07."* The 1981 call, to the player's desk.
- **B:** a new Unfiled item appears: *"Extension NA-07: incoming call,
  03:40. Duration 0:31. Not answered."* It has no date. It opens as a record,
  not audio. The audio belongs to Case 007.

## Engine work this case needs

- **CCTV evidence type:** a sequence of frames, each with a timestamp, its
  own regions and an artwork state. Viewer: frame scrubber, previous/next
  frame, play/pause at a fixed rate (honours reduced motion: stepping only,
  no autoplay), a timestamp overlay, and frame inspection using the existing
  photo viewer (zoom, pan, regions).
- **CCTV artwork:** a high-angle reading-room view in monochrome with
  scanlines. Its variations: door shut or ajar, figure absent or present,
  archivist present or absent.
- **An exported still** as photo evidence, reusing the comparison mechanic
  for the viewpoint discovery.
- **An Unfiled item without an anomaly screen** (only for end beat B).

## Unknowns — never resolve in Case 006

- Who was at position 7, and how they entered.
- Who placed File 0091 in 1981 (Case 005's custody entry).
- Who "M." is; who Mara is.
- How a photograph from camera 2's viewpoint exists on 1980 paper.

## Open questions for you

1. Approve moving the story into the player's present (tonight's shift)?
2. Approve the CCTV viewer as described (including no autoplay under reduced
   motion)?
3. End beat A or B?
4. Keep the figure faceless and unattributed throughout?
