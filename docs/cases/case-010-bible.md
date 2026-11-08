# Case bible — Case 010: The Handover (DRAFT for review)

Status: **proposal**. Season 2, case 3 of 7 (see
`docs/seasons/season-2-arc.md`). Reveal level 1 holds. Nothing is built
until approved.

## Premise

**06:00, the end of your shift.** Intake 0094 is due at 06:00 (Case 008's
end beat), and the day archivist's handover log records a handover at
position 7 at 06:00. Your own records put you somewhere else.

- **Assignment:** "The day archivist's handover log records receiving the
  desk from the night archivist at 06:00. Establish where the records place
  the night archivist at 06:00, and what happened at position 7. Record only
  what the evidence supports."

## Evidence

| # | Item | Type | What it shows |
|---|---|---|---|
| 1 | **Floor plan, first floor** | **Plan (new type)** | Reading room (positions 5–8), stack room, staff room, night entrance, main stair, security office. A time selector steps through 05:50, 05:58, 05:59, 06:00, 06:04. At each step, each room shows **only what a record says** about it then, with the record named. |
| 2 | Door and badge log | Document | 05:50 night archivist badge **into the stack room**. 05:58 day archivist badge at the main entrance. 05:59 day archivist into the reading room. 06:04 night archivist badge **out of the stack room**. |
| 3 | Your shift log (end) | Document | 05:50–06:04 "Returns, stack room." 06:05 "Handover: day archivist already at desk." |
| 4 | Handover log | Document | Day archivist **P. Nash**: "06:00. Received from night archivist at position 7. Desk clear. Filed tonight: 0094. Signed: P. Nash / night archivist: **M.**" The "M." is handwritten. |
| 5 | Camera 2, 05:55–06:06 | CCTV | 05:59 the day archivist enters. **06:00:10: a figure seated at position 7, back to camera, the day archivist standing beside them.** 06:02 the seat is empty. 06:05 the night archivist (you) arrives from the stack room door. |
| 6 | Intake ledger, tonight | Document | 0093, 03:40, M.; **0094, 06:00, Photograph, M.** |
| 7 | Handwriting: the handover "M." | Photo (handwriting) | The "M." in the handover log, with the crossed-M region. |

**Required discovery:** compare the handover "M." with Case 009's 0094 slip
"M." (a copy is filed here). Matching the **crossed M** files a
*Handover comparison note*: "Consistent with the slip and the 1979
specimen." This reuses Case 009's standard.

**Floor-plan rule [Rule]:** the plan is a *view of the records*, never an
inference. It never shows a person in a room unless a named record puts
them there at that step. An empty room means "no record", not "nobody".

## Supported conclusion

1. At 06:00 the badge records place the night archivist in the stack room
   (05:50 in, 06:04 out; your shift log agrees).
2. At 06:00 camera 2 shows someone seated at position 7 with the day
   archivist, and the handover log records a handover there.
3. The handover log's "from night archivist" is contradicted by the badge
   records.
4. The "M." in the handover log is consistent with the hand of 0094 and
   the 1979 specimen.
5. Who was seated at position 7 cannot be established.

**[Rule]** Never accept:
- that the player was in two places
- that the day archivist lied (a motive)
- "it was M." or "it was Mara"
- anything beyond "consistent with" for handwriting
- any mechanism

## Findings

1. *Where do the badge records place the night archivist at 06:00?* **The
   stack room.** Cite the door log.
2. *What does camera 2 show at position 7 at 06:00?* **Someone seated with
   the day archivist; the face is not visible.** Cite the CCTV.
3. **Select all that apply:** *Which records say the night archivist was
   at position 7 at 06:00?* The handover log only. Not the door log, your
   shift log, or the CCTV (which shows *someone*, not who).
4. *Is the handover log's "M." consistent with the hand of 0094?* **Yes,
   consistent with.** Cite the comparison note.
5. *Who was seated at position 7?* **Cannot be established.**

## Board relationships the records support

- Door log **contradicts** handover log (stack room vs position 7)
- Door log **corroborates** your shift log (05:50–06:04)
- CCTV **corroborates** handover log (a handover at position 7 at 06:00)
- Handover "M." **corroborates** the 0094 slip (crossed M)
- Intake ledger **same subject** handover log (0094)
- Comparison note **derived from** handover "M."

## End beat — choose one

- **A:** the floor plan gains a sixth time step, **06:00 · Storage B
  (sealed)**: a room that is not on the current plan, with no record shown.
  It leads into Case 011, *Storage B*.
- **B:** the handover log's "Desk clear" gains, in the same hand, *"— not
  yet"*.

## Engine work this case needs

- **Plan evidence type:**
  - authored rooms (SVG polygons on a 400×300 plan)
  - time steps, each with per-room entries `{ room, text, source evidence ID }`
  - a viewer with a time selector (segmented control), highlighted rooms,
    a room list as the accessible alternative, and tapping a room to see
    its entries and source records
  - regions per room for comparison and discoveries if needed
- **Plan amendments** (if end beat A): a time step appended when a case
  closes.
- Reuses handwriting, CCTV, comparison, select-all and choice.

## Unknowns — keep open

- Who sat at position 7 at 06:00; how the day archivist was handed over to
  by someone the badge records put elsewhere.
- Who "M." is; the 0094 photograph's subject. *Proposal:* the ledger says
  "Photograph", but no photograph is filed yet. It is Case 011's opening
  item.

## Open questions for you

1. Approve the premise and the floor-plan rule ("a view of the records,
   never an inference")?
2. Name for the day archivist: "P. Nash" OK?
3. End beat A (Storage B appears on the plan) or B ("— not yet")?
