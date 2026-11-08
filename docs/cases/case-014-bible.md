# Case bible — Case 014: The Night Archivist (DRAFT for review)

Status: **proposal**. Season 2 finale, case 7 of 7 (see
`docs/seasons/season-2-arc.md`). **Reveal level 2**, as approved for this
case only. Nothing is built until approved.

## Canon this case builds on

- **Case 001:** the 1981 reel's second voice, under the filter, says "Mara,
  don't file this."
- **Case 007:**
  - a call reached NA-07 tonight at 03:40 by route BW-4 (withdrawn 1983)
  - NA-07 was created in 1998
  - tonight's recording matches the reel segment for segment
  - the post record for NA-07 reads "M. —"
- **Case 008–011:**
  - intake 0094: 06:00, Photograph, filed by M.
  - the handwritten 0094 slip
  - the photograph shows Storage B
- **Case 012–013:**
  - the 1981 kiosk call at 03:40
  - the night desk log, 1981: "03:40 · Call received from E. Ward. Not
    filed."
- **Arc (approved):**
  - Case 014 is where a record first names the night archivist at NA-07
    as **"Mara —"**, surname withheld.
  - Supported finding: *the second voice addresses the night archivist at
    NA-07 by first name.*
  - Never accepted, even here: how the 1981 voice knew; whether the 1979
    "M." and the player are the same person; time travel or any mechanism.

## Premise

**06:10.** The shift is over, except for one thing. Intake 0094 is in the
ledger, but an intake is only filed when the receiving archivist signs the
slip. The 0094 slip's *Received by* line is blank. The archive asks for the
night's last review: assemble the 03:40 call, then close the shift.

- **Assignment:** "Assemble what the records say about the 03:40 call, in
  1981 and tonight. Establish whom the second voice addresses. Then close
  the shift. Record only what the evidence supports."

## Evidence

| # | Item | Type | What it shows |
|---|---|---|---|
| 1 | **Post record, NA-07 (full)** | Document | The personnel copy, not the summary seen in Case 007. Holder: **"Mara —"**, surname withheld. Post: night archivist. Workstation NA-07. |
| 2 | Tonight's NA-07 recording | Audio (copy, Case 007) | With voice isolation: "Mara, don't file this." |
| 3 | The 1981 reel | Audio (copy, Case 001) | With the filter: the same words. |
| 4 | Audio comparison note | Document (copy, Case 007) | The two match segment for segment. |
| 5 | Extension log, NA-07, tonight | Document (copy) | 03:40:00, incoming, 0:31, not answered, recorded. |
| 6 | Exchange record, BW-4, 1981 | Document (copy, Case 012) | 03:40, outgoing, 0:31. |
| 7 | Night desk log, 1981 | Document (copy, Case 013) | 03:40, call received from E. Ward, not filed. |
| 8 | Intake procedure | Document (new) | "An intake is filed when the receiving archivist signs the slip. Until then the ledger line is provisional." |
| 9 | The 0094 slip, as it stands | Photo (handwriting, Case 009 layout) | 0094 · 06:00 · Photograph · M. *Received by:* blank. |

**Required discovery:** none. The finale's new mechanic is the choice,
and every finding uses mechanics the player already knows. *(Alternative:
require playing tonight's recording with voice isolation again, which
re-files the comparison note. Not proposed: it repeats Case 007.)*

## Supported conclusion

1. The full post record names the night archivist at NA-07 "Mara —".
2. The second voice, in 1981 and tonight, says "Mara, don't file this."
   It addresses the night archivist at NA-07 by first name.
3. Calls at 03:40 are recorded in 1981 (exchange record, night desk log)
   and tonight (extension log). Both last 0:31.
4. How a 1981 voice addresses tonight's night archivist by name cannot be
   established.
5. Intake 0094 is provisional until the slip is signed.

**[Rule]** Never accept:
- that the player made either call
- that the voice is the player's
- that the 1979 "M." is the player
- that Mara wrote the slip (the hand is only "consistent with" the 1979
  specimen)
- any mechanism
- that filing or not filing is "correct"

## Findings (evaluated before the choice; deterministic)

1. *Which record names the night archivist at NA-07, and how?* **The full
   post record: "Mara —".**
2. *Whom does the second voice address?* **The night archivist at NA-07,
   by first name.** Cite the post record and either recording.
3. **Select all that apply:** *Which records log a 0:31 call at 03:40?*
   - Supported: the exchange record (1981) and the extension log
     (tonight).
   - Not supported: the night desk log (no duration) or the incident
     report.
4. **Ordering:**
   - the east door sealed (1979)
   - the call at 03:40 (1981)
   - route BW-4 withdrawn (1983)
   - NA-07 created (1998)
   - the call at NA-07 (tonight)
5. *How did a voice recorded in 1981 know the name of tonight's night
   archivist?* **Cannot be established.**

Once the findings are accepted, the case does **not** close yet. It
offers the choice.

## The choice: file 0094, or don't

After the findings are accepted, the findings screen shows the 0094 slip
with *Received by* blank and two actions:

- **Sign and file 0094**
- **Leave 0094 unfiled**

A confirmation explains that this closes the shift and cannot be undone
in this save. Starting a new game resets it. The choice is saved once
(**save v6**: `choices: { 'file-0094': 'filed' | 'unfiled' }`, migrated
from v5 with no choice). The case closes on the choice.

**Two closing states** (records only; no cutscene, no verdict):

- **Filed:**
  - the slip's *Received by* reads "Night archivist, NA-07", and the
    ledger line is no longer provisional
  - the dashboard's shift line reads *"Shift closed 06:12. Filed: 0091,
    0093, 0094."*
  - the 1981 night desk log is unchanged: "Not filed."
- **Unfiled:**
  - the slip stays blank, and the ledger line reads *"0094 — not filed"*
  - the dashboard reads *"Shift closed 06:12. Not filed: 0094."*
  - the 1981 night desk log gains, in the blue hand, a second line:
    *"06:12 · Not filed."*

Neither ending says which was right. Both leave the Season 3 question
open: how.

## Board relationships the records support

- Post record **same subject** tonight's recording (the name the voice uses)
- Tonight's recording **corroborates** the 1981 reel
- Exchange record (1981) **corroborates** extension log (tonight) (03:40, 0:31)
- Night desk log **same subject** exchange record (03:40, 1981)
- Intake procedure **same subject** the 0094 slip (unsigned)
- Comparison note **derived from** tonight's recording

## Engine work this case needs

- **Save v6:** a `choices` map, with migration from v5 and validation of
  known choice IDs and values.
- **Choice-driven amendments:** `whenChoice: { id, value }` beside
  `whenCaseClosed`, for documents and the dashboard line.
- **Closing on a choice:** the case counts as closed once the choice is
  made. Findings must be accepted first; findings alone do not close
  Case 014.
- **The choice UI:** two buttons, a confirmation dialog, and focus
  management. No timer. The choice is explained in plain words.
- **The archive screen:** a "Season 2 complete" state, stating which
  ending this save reached.
- Reuses the audio, comparison, ordering and select-all mechanics.

## Unknowns — kept open after Season 2

- How the voice knew the name; who placed either call; whose obscured voice
  says "Don't open the east door".
- Whether the 1979 "M." and Mara are the same person; Mara's surname.
- Who sat at position 7 at 06:00; where SB-07 is; what the 0094 photograph
  is for.

## Open questions for you

1. Approve the full post record as the record that names "Mara —"?
2. Approve the intake procedure (filed only when signed), which turns
   "file 0094" into a concrete act?
3. Approve the two closing states, and that neither is marked as right?
4. Approve that the choice is permanent for the save (a new game resets
   it)?
