# Case bible — Case 009: The Hand

Status: **approved** (2026-11-08), implemented in `src/content/cases/case-009*.ts`.
Season 2. All proposals approved, including the envelope's contents.
**End beat A** chosen ("— tonight" in the staff register): B would have
shown the player's own initial on the dashboard, the identity link that
reveal level 1 holds back.

**Changes at implementation:**
- Board rules: the proposed "method note contradicts post record" rule was
  dropped as semantically odd. Two plain *derived-from* rules (each
  comparison note from its samples) replace it.
- The ordering question orders the **records** the samples appear in
  (specimen card 1979, intake ledger 1981, calendar 1984, slip tonight), as
  the bible proposed.
- Handwriting samples are generated from layout data
  (`case-009-hands.ts`). The three compared letterforms are drawn as
  glyphs, and their regions are computed from the same coordinates.

## The envelope (Claude's proposal, as asked)

Case 008's sealed envelope holds a single **intake slip for 0094**. It is
handwritten in blue ink:

| Field | Value |
|---|---|
| Number | 0094 |
| Time | 06:00 |
| Description | Photograph |
| Filed by | M. |

The ink is the same blue as the 0091 entry in the desk papers. Handwriting has
run through Season 1 without anyone examining it:

| Sample | Where | Year |
|---|---|---|
| "Inspector — 10:00" | 14 Harrow Lane calendar (Case 002) | 1984 |
| "0091" | Desk papers enlargement (Case 004) | photographed with a 1981 imprint |
| "14 Oct" | Voided ledger line (Case 004 end beat) | added tonight |
| "Filed. — M." | Case 001 report annotation (Case 002 end beat) | added tonight |
| "0094 … M." | The envelope's slip | tonight |

Case 009 asks the question the season has avoided: **whose hand is it?**

## Scope guard

**[Rule]** Case 009 may establish:
- that the five samples share one hand
- that a night archivist recorded only as **"M."** held the post at the
  records facility in 1981, with a specimen signature on file, and that the
  specimen matches

It must **not** establish that the player is M. (reveal level 1 still
holds), who Mara is, or how a 1981 hand writes tonight.

## Premise

At 05:20 you open the envelope (end of Case 008's footage). Security asks
for one review before 06:00: who wrote this slip?

- **Assignment:** "The envelope delivered to NA-07 holds a handwritten intake
  slip. Establish what the records can say about the hand that wrote it.
  Record only what the evidence supports."

## Evidence

| # | Item | Type | What it shows |
|---|---|---|---|
| 1 | The 0094 intake slip | Photo (handwriting artwork) | The slip as above. Regions: the "M.", the "0" of 0094, the ink. |
| 2 | Handwriting samples, Season 1 | Photo ×4 (enlargements) | "Inspector — 10:00", "0091", "14 Oct", "Filed. — M.". Regions on the same letterforms. |
| 3 | Staff register extract, 1979–1983 | Document | Records facility, **night archivist: "M. —" (surname withheld), 1979–1983, specimen signature on file**. |
| 4 | Specimen signature card, 1979 | Photo (handwriting artwork) | The 1979 specimen: a signed "M." with the same letterforms. |
| 5 | Examiner's method note | Document | How letterforms are compared: the crossed "M", the open "0", the slanted "1". "Consistent with" is the strongest conclusion the method allows. |
| 6 | The envelope (as opened) | Object | Its custody gains "05:20 · Night archivist (NA-07) · Opened". |
| 7 | Night archivist post record | Document (copy, Case 007) | Holder "M. —" (current post). |

**Required discoveries (photo comparison, existing mechanic):**
- Matching the **crossed "M"** between the slip and the 1979 specimen files
  **Item 4a: Specimen comparison note**: *"Consistent with the 1979
  specimen."*
- Matching the **open "0"** between the slip and the desk-papers "0091"
  files **Item 2a: Sample comparison note**: *"Consistent with each other."*

## Supported conclusion

1. The slip and the Season 1 samples are consistent with one hand
   (sample comparison, method note).
2. That hand is consistent with the 1979 specimen of a night archivist "M."
   who held the post from 1979 to 1983 (specimen comparison, staff
   register).
3. The current post holder is also recorded as "M. —" (post record). The
   records do **not** say whether these are the same person.
4. How a hand on file since 1979 wrote tonight's slip cannot be established.

**[Rule]** Never accept:
- "the player wrote it" or "the player is the 1979 archivist"
- "the hand is Mara's"
- "it was forged"
- any mechanism
- anything stronger than "consistent with" (the method note forbids it)

## Findings

1. *Are the samples consistent with one hand?* **Yes.** Cite the sample
   comparison note and the method note.
2. *What is the strongest thing handwriting comparison can say here?*
   **"Consistent with", not "the same person".** Cite the method note.
   (This teaches the evidence standard directly.)
3. **Select all that apply:** *Which records name a night archivist "M."?*
   The staff register and the post record. Not the specimen card, which is
   a signature and not a record of a name.
4. **Ordering:** specimen signed (1979); calendar note (1984); 0091 voided
   (1981 ledger), placed carefully by date of the *record*; 0094 slip
   (tonight).
   - Needs care: some samples are dated by the record they appear in, not
     by when they were written. *Proposal:* order the records the samples
     appear in (1979 card, 1981 ledger, 1984 calendar, tonight's slip). The
     question wording makes that explicit.
5. *Are the 1979 archivist and the current post holder the same person?*
   **The records cannot establish it.**

## Board relationships the records support

- Slip **corroborates** specimen card (crossed "M")
- Slip **corroborates** desk-papers sample (open "0")
- Staff register **same subject** specimen card
- Staff register **same subject** post record (both "M. —")
- Method note **contradicts** "same person" findings. *Proposal:* modelled
  as a board rule only between the method note and the post record, with a
  reason that explains the limit.
- Sample enlargements **derived from** their source records

## End beat — choose one

- **A:** after Case 009 closes, the staff register's 1979–1983 line gains a
  second date in the same hand: **"— tonight"**.
- **B:** your **dashboard's workstation line** changes to *"NA-07 · M. —"*,
  the first time the game shows the player's own recorded initial.

## Engine work this case needs

- **Handwriting artwork:** a parametrised "handwritten specimen" drawing
  (text, ink, paper, letterform region anchors), so samples are generated
  from content rather than drawn one by one.
- **Envelope opened:** its custody amendment appears when Case 009 becomes
  available (a new amendment trigger, "case available", or authored as
  initial custody in Case 009's copy). *Proposal:* Case 009 gets its own
  copy of the envelope with the 05:20 entry, so Case 008's record stays as
  it was.
- **No save change.** Reuses comparison, select-all and ordering.

## Unknowns — keep open

- Whether the 1979 archivist and the current holder are the same person.
- How the hand writes tonight; who Mara is; who sent the envelope.

## Open questions for you

1. Approve the envelope's contents (the handwritten 0094 slip)?
2. Approve the scope (one hand, a 1979 "M.", and no identity link to the
   player)?
3. End beat A ("— tonight" in the staff register) or B (your dashboard
   shows "M. —")?
4. Approve finding 2, which teaches the "consistent with" standard?
