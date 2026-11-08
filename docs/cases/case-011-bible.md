# Case bible — Case 011: Storage B (DRAFT for review)

Status: **proposal**. Season 2, case 4 of 7 (see
`docs/seasons/season-2-arc.md`). Reveal level 1 holds. Nothing is built
until approved.

## Canon this case builds on

- Building history (Case 004): **1981**, first floor, east: Storage B
  (sealed). **1997–98**, refit: Storage B converted to the reading room.
  **1998**, workstations NA-01 to NA-12 installed.
- Staff register (Case 009): night archivist "M. —", 1979–1983.
- Intake ledger (Cases 008 and 010): **0094, 06:00, Photograph, M.** No
  photograph has been filed yet.
- Case 010's end beat: the floor plan shows Storage B, sealed, at 06:00,
  with no record.

## Premise

**06:07.** The day archivist finds the 0094 photograph in the Unfiled tray.
It shows a small room with steel shelving and a barred east window. Three
archive boxes are on otherwise empty shelves. The room is not on the
current plan.

- **Assignment:** "File 0094's photograph shows a room with archive boxes.
  Establish what room it shows, and reconcile the boxes against the
  records. Record only what the evidence supports."

## The numbers (all invented here [Added])

| Record | Year | Count | Detail |
|---|---|---|---|
| Sealing inventory | 16 Oct 1981 | **48** boxes, SB-01 to SB-48 | Signed by the night archivist "M." |
| Refit clearance list | 1997 | **46** transferred to the stack room, **2 not found** | Not found: **SB-07, SB-31** |
| Stack room accession | 1997 | **45** received from Storage B | **SB-40** is on the clearance list as transferred, but not in the accession |
| 0094 photograph | undated | **3** boxes visible | Labels **SB-07, SB-31, SB-40** |

Reconciliation: 48 sealed − 45 received = **3 unaccounted for**: two never
found at clearance, and one transferred but never received.

What the 1981 night archivist kept there: the inventory line for **SB-07**
reads *"Deposited 15 Oct 1981, night archivist. Contents: not listed.
— M."* That is the day after the Bellwether report (14 October 1981).

## Evidence

| # | Item | Type | What it shows |
|---|---|---|---|
| 1 | **File 0094 photograph** | Photo | Steel shelving, the barred east window, three boxes. No date imprint. Regions: window bars, box labels (SB-07, SB-31, SB-40), the shelf numbering. |
| 2 | Storage B sealing photograph, 1981 | Photo | The same room at sealing: full shelves, the same window. Regions: window bars, shelf numbering. |
| 3 | Sealing inventory, 1981 | Document | 48 boxes in a table. SB-07 is the night archivist's deposit. Signed "M.", 16 Oct 1981. |
| 4 | Refit clearance list, 1997 | Document | Per-box status. 46 transferred, 2 not found (SB-07, SB-31). Estates, initials R.D. |
| 5 | Stack room accession, 1997 | Document | 45 boxes received "from Storage B". SB-40 is absent. |
| 6 | Building history (copy, Case 004) | Document | Sealed 1981; converted 1997–98. |
| 7 | Intake ledger, tonight | Document | 0094, 06:00, Photograph, M. |

**Required discovery (photo comparison, existing mechanic):** compare the
0094 photograph with the 1981 sealing photograph. Matching the **window
bars** files a *Location note*: "The 0094 photograph shows Storage B: same
window, same shelving." The shelf numbering can be matched too, but only
the window files the note.

## Supported conclusion

1. The 0094 photograph shows Storage B (location note, sealing photograph).
2. The 1981 inventory lists 48 boxes. The stack room received 45. Three
   are unaccounted for: SB-07, SB-31 and SB-40.
3. The clearance list and the accession disagree about SB-40.
4. The three boxes in the 0094 photograph carry the labels of the three
   unaccounted boxes.
5. SB-07 was deposited by the 1981 night archivist "M.". Its contents
   were not listed.
6. When the 0094 photograph was taken cannot be established. Storage B was
   converted in 1997–98, and the photograph was filed tonight.

**[Rule]** Never accept:
- that the photograph was taken tonight, or that Storage B still exists
- a theft, or anyone having removed the boxes (the records show absence,
  not an act)
- what SB-07 contains
- that the 1981 "M." is the player
- any mechanism

## Findings (introduces numeric answers)

1. **Number:** *How many boxes did the sealing inventory list?* **48.**
   Cite the inventory.
2. **Number:** *Reconciling the inventory, clearance list and accession,
   how many boxes are unaccounted for?* **3.** Cite all three.
   - **2** is *partial*: "You've counted the boxes not found at clearance.
     Compare the clearance list with the accession too."
   - **1** is *partial*: "You've found the transfer gap. Check what the
     clearance list could not find."
3. **Select all that apply:** *Which boxes are unaccounted for?* SB-07,
   SB-31, SB-40. Distractors: SB-12, SB-48.
4. *What does the 0094 photograph show?* **Storage B, with the three
   unaccounted boxes on its shelves.** Cite the location note and the
   photograph. Wrong options:
   - "Storage B at sealing in 1981": the sealing shelves are full.
   - "The stack room".
   - "Storage B as it is tonight": no record says it exists.
5. *When was the 0094 photograph taken?* **Cannot be established.**

## Board relationships the records support

- Clearance list **contradicts** accession (46 transferred, 45 received; SB-40)
- Inventory **corroborates** sealing photograph (48 boxes, 1981)
- Clearance list **same subject** 0094 photograph (SB-07, SB-31)
- Building history **corroborates** inventory (sealed 1981)
- Location note **derived from** 0094 photograph
- Intake ledger **same subject** 0094 photograph

## End beat — choose one

- **A (recommended):** SB-07's inventory line "Contents: not listed" gains,
  in the same hand: *"Contents: east door key, Bellwether."* It leads
  into Case 012, *The East Door*. The key is a record's claim, not an
  established fact.
- **B:** The building history's 1981 line gains *"— 3 boxes remain"*.

## Engine work this case needs

- **Numeric question type (`kind: 'number'`):**
  - an integer answer
  - authored near-misses, each with an outcome (usually *partial*) and a
    hint, evaluated deterministically
  - a labelled numeric input (`inputmode="numeric"`)
  - validation: an empty or non-integer answer cannot be submitted, and
    the input explains why
  - the answer is stored as a string, like the other types: **no save
    change**
- New photo artwork:
  - Storage B at sealing (full shelves)
  - Storage B with three labelled boxes
  - both drawn from the same layout data, so the window and shelf regions
    line up
- Reuses comparison, select-all, choice and document amendments.

## Unknowns — keep open

- Where SB-07, SB-31 and SB-40 are now. What SB-07 contains.
- Who took the 0094 photograph and when. Who put it in the Unfiled tray.
- Why Storage B was sealed two days after the Bellwether report.

## Open questions for you

1. Approve the premise: the 0094 photograph shows Storage B?
2. Approve the numbers (48 / 46 + 2 / 45 / 3) and SB-07 as the 1981 night
   archivist's deposit?
3. Approve the numeric question type, with authored near-misses scored as
   partial?
4. End beat A (the east door key) or B ("3 boxes remain")?
