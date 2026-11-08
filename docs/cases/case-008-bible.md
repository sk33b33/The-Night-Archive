# Case bible — Case 008: The Next Number

Status: **approved** (2026-11-08), implemented in `src/content/cases/case-008*.ts`.
Beyond CLAUDE.md's roadmap. The approval did not pick between options;
these were chosen to fit together (each can be switched):
- **Framing A, Season 2 opener.** The archive groups cases by season.
- **Title: "The Next Number".**
- **File 0093's photograph** changed to the pre-dawn view (approved).
- **Envelope A, stays sealed.** Its contents are Case 009's question.
- **End beat A.** 0094's time fills in as 06:00.

**Changes at implementation:**
- **Case 008 does not take over File 0093's Unfiled card.** It becomes
  available the moment Case 007 closes, so taking over the card would hide
  Case 007's final beat entirely. The Unfiled card stays, and this case
  investigates it.
- **The wall clock is in every view of position 7.** It reads 03:40 in the
  File 0091 photograph (Case 001's report time), 11:05 in the 1998
  installation photograph, and 05:12 in File 0093. On camera 2 it follows
  each frame's timestamp. A clock appearing only in File 0093 would have been
  an unintended contradiction with the earlier views of the same wall.
- The unfiled-tray region was dropped. Its position conflicted between the
  photograph and CCTV layouts, and the clock, envelope and lamp carry the
  match.
- Your shift log adds "05:00–05:14 Retrieval, stack room", so position 7 is
  empty at 05:12. The lamp going off at 05:08 with no one at the desk is
  left unexplained.

**Details chosen at implementation [Added]:** porter initials "J.T."; lamp
circuit back on at 05:19; ten frames 04:10:00–05:20:00.

## Framing — choose one

- **A: Season 2 opener.** The archive menu marks Cases 001–007 as
  "Season 1"; Case 008 opens "Season 2". Gives room for a new arc.
- **B: Epilogue.** Case 008 is a single coda to Season 1, shorter (three
  findings), and the last case for now.

## Title — choose one

- **"The Next Number"** (proposed): the intake numbers keep coming.
- **"Before Dawn"**: the case is set in the last hours of the same shift.
- **"File 0093"**: mirrors Case 004.

## Premise

Still **tonight's shift**, after Case 007. CLAUDE.md's premise is that files
"appear to predict events". This is the first case built on that directly.

File 0093 was filed at **03:40**. Looked at closely, its photograph does not
show the desk as it was at 03:40. It shows the desk as the facility's own
records describe it **at 05:10–05:12**, later tonight.

- **Assignment:** "File 0093 was filed at 03:40. Establish what its
  photograph shows, and when that matches the records. Record only what the
  evidence supports."

## Change to approved canon (needs your approval)

File 0093's photograph is currently the same image as File 0091, with
tonight's date. This case needs it to be its own image, a **pre-dawn
variant** of the same view:
- the desk lamp is off
- a wall clock on the far wall reads **05:12**
- a **sealed internal-mail envelope** lies on the desk, addressed "Night
  archivist, NA-07"
- the Unfiled tray is empty

Players who have already opened File 0093 would see the new image from now
on. It isn't explained.

## Evidence

| # | Item | Type | What it shows |
|---|---|---|---|
| 1 | File 0093 photograph | Photo (new variant) | As above. Regions: wall clock (05:12), envelope, lamp (off), Unfiled tray (empty), date imprint (tonight). |
| 2 | Intake ledger, tonight | Document | **0093, 03:40, "Photograph", filed by M.** Then **0094: no time, "Reserved"**. |
| 3 | Internal post log | Document | **05:10: one envelope delivered to NA-07.** Sender: not recorded. Courier: night porter (initials). |
| 4 | Lamp circuit log | Document | Reading-room circuit 7 (the desk lamp): **off 05:08**. |
| 5 | Camera 2 footage, 04:10–05:20 | CCTV (continues Case 006) | 05:08 lamp off; 05:10 the porter leaves an envelope; 05:12 the desk is empty and the lamp is off. **The 05:12 frame matches File 0093's photograph.** |
| 6 | The envelope | Object | Sealed. Addressed "Night archivist, NA-07". Custody: delivered 05:10 by the porter; the sender is unrecorded. |
| 7 | Your shift log (continued) | Document | 04:05 File 0091 recorded. **05:15 "Envelope received. Not opened."** |

**Required discovery:** compare the File 0093 photograph with the camera 2
frame at 05:12. Matching the **wall clock** files **Item 1a: Timing
note**: *"The File 0093 photograph matches camera 2 at 05:12: lamp off,
envelope on the desk, tray empty."*

## Supported conclusion

1. File 0093 was filed at 03:40 (intake ledger).
2. Its photograph matches the desk as recorded at 05:12, after it was filed
   (timing note, lamp log, post log).
3. Who took the photograph, who filed it, and who sent the envelope cannot
   be established.

**[Rule]** Never accept:
- "the photograph predicts the future" (the records show a match and an
  order, not a cause)
- "M. sent the envelope"
- "the player filed 0093"
- any mechanism

The finding wording stays with the records: *"matches a later moment"*.

## Findings

1. *When was File 0093 filed?* **03:40.** Cite the intake ledger.
2. *When does its photograph match the records?* **05:12.** Cite the timing note.
3. **Ordering:** File 0093 filed (03:40); lamp off (05:08); envelope delivered
   (05:10); the moment in the photograph (05:12); envelope logged by you
   (05:15).
4. **Select all that apply:** which records describe the desk at 05:12? The
   CCTV frame, the lamp log, the post log. Not the intake ledger or your
   04:05 entry.
5. *Who sent the envelope?* **Cannot be established.** Cite the post log.

## Board relationships the records support

- Intake ledger **contradicts** File 0093 photograph (filed before the moment it shows)
- CCTV **corroborates** File 0093 photograph (05:12)
- Lamp log **corroborates** CCTV (lamp off by 05:08)
- Post log **corroborates** envelope (delivered 05:10)
- Timing note **derived from** File 0093 photograph
- Shift log **same subject** envelope (received 05:15, not opened)

## The envelope — choose one

- **A: Stays sealed (proposed).** The envelope is evidence; it is never
  opened in this case. Its contents are Case 009's question.
- **B: The player may open it.** A one-time, saved choice. It must not
  affect the findings, which stay deterministic. Inside: an intake slip for
  **0094**, the time blank, "filed by M." This adds the game's first
  player choice, and a second ending state.

## End beat — choose one

- **A:** after Case 008 closes, ledger 0094's time fills in as **06:00**:
  the end of your shift.
- **B:** the dashboard's shift clock (new) reads **05:59**, and the
  archive's next file is "0094 — reserved for you".

## Engine work this case needs

- A **pre-dawn variant** of the workstation artwork (clock, lamp off,
  envelope, empty tray), with File 0093 switched to it.
- **Extended CCTV** (a second camera 2 footage item, 04:10–05:20, same
  artwork with new scene keys: clock time, envelope, porter).
- If envelope option B: a saved one-time choice (save format v6).
- If framing A: season grouping on the archive screen.

## Unknowns — keep open

- Who took the 0093 photograph, how it shows 05:12 when it was filed at 03:40,
  who sent the envelope, and what is inside it (if it stays sealed).
- Who "M." is.

## Open questions for you

1. Framing A (Season 2 opener) or B (epilogue)?
2. Title?
3. Approve changing File 0093's photograph to the pre-dawn variant?
4. Envelope A (sealed) or B (player may open)?
5. End beat A or B?
