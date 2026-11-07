# Case bible — Case 002: The Empty House

Status: **approved** (2026-11-07). All proposals below were approved as
written and are now canon for Case 002, implemented in
`src/content/cases/case-002*.ts`. Approval answers: premise, location and date
kept; answerphone echo and "M." initial kept; end beat approved; calendar
discovery **required**.

**Names chosen at implementation [Added]:** neighbour Mrs J. Pell (No. 12,
tenant since April 1961); inspecting officer "D.R." (initials only); No. 16
tenants R. & S. Coyle. Meter readings: 04217 (12 Nov 1982, disconnection;
9 Jan 1984, unchanged), 04561 (5 Mar 1984). Kitchen photo regions: wall
calendar, radio (dial lit), cup.

## Premise

A council welfare check on a house in Bellwether was closed because the
property was recorded as vacant. The records filed with it say otherwise.

- **Location:** 14 Harrow Lane, Bellwether (same town as Case 001).
- **Date of the official record:** Friday 2 March 1984.
- **Official finding:** "Property vacant since November 1982. No occupants.
  Utilities disconnected. No further action."
- **Player's question:** was the house empty, and does the record support
  closing the check?

## Evidence (uses viewers that already exist)

| # | Item | Type | What it shows |
|---|---|---|---|
| 1 | Housing inspection report, 2 Mar 1984 | Document | Vacant since Nov 1982; utilities disconnected; "no signs of occupation"; inspector's initials only. |
| 2 | Welfare check request | Document | A neighbour (named) reports lights after dark and a radio playing "most nights" since January. |
| 3 | Electricity meter card | Document | Supply marked disconnected Nov 1982, yet readings rise between the January and March 1984 visits. |
| 4 | Kitchen photograph, taken at the inspection | **Photo (new as evidence)** | Regions: wall calendar open at **March 1984**; a cup on the table; a radio with its dial lit. |
| 5 | Answerphone cassette, recovered from the hall | Audio | Machine's outgoing message (unidentified voice); one incoming message, 1 Mar 1984: *"It's me. Don't open the door for anyone tonight."* |
| 6 | Tenancy register extract | Document | Last recorded tenant "M. Ellery", tenancy ended Nov 1982, forwarding address "not given". |

**Unlock (discovery):** examining the calendar region in the photograph records
a discovery that files **Item 4a: Enlargement of calendar**. The enlargement
shows a handwritten note on 2 March: *"Inspector — 10:00"*. That is someone
in the house expecting the inspection, written in the house's own calendar.
This reuses the discovery mechanic from Case 001's audio filter.

## Supported conclusion

1. The inspection's finding is unreliable: the house showed signs of
   occupation in 1984 (meter, calendar, neighbour's report).
2. Someone in the house knew about the inspection in advance (calendar
   enlargement).
3. Who was living there cannot be established from the records.

**[Rule]** Do not accept "M. Ellery was living there". The tenancy ended in
1982 and nothing places Ellery in the house in 1984. Do not accept "the house
was empty". Do not accept "the inspector lied", which is a motive the records
cannot show.

## Findings (draft questions)

1. *Was the property vacant on 2 March 1984?* Supported: **No, it showed
   signs of recent occupation.** Cite the meter card or the photograph.
   Options include "Yes, as recorded" and "It was being used by the former
   tenant" (unsupported).
2. *Was the inspection expected?* Supported: **Yes. The house's own
   calendar records it.** Cite the calendar enlargement. This makes the
   discovery necessary, unlike Case 001's optional filtered segment.
3. *Who was living there?* Supported: **Cannot be established.** Cite the
   tenancy register (Ellery left in 1982).

## Board relationships the records support

- Inspection report **contradicts** meter card (disconnected vs rising readings)
- Inspection report **contradicts** kitchen photograph (calendar at March 1984)
- Welfare request **corroborates** meter card (activity since January)
- Calendar enlargement **derived from** kitchen photograph
- Inspection report **same subject** calendar enlargement (2 March, 10:00)
- Tenancy register and inspection report **corroborate** (vacated Nov 1982)
  - Deliberately supported. It shows the report is partly accurate, so the
    player has to separate what holds from what doesn't.

## Thread to the long mystery (light touch)

- **Echo, unexplained:** the answerphone message ("Don't open the door…")
  echoes Case 001's "Don't open the east door." No speaker is identified, and
  nothing links them in the records.
- **"M." initial:** the tenant's initial is the same as Mara's first letter.
  **[Rule]** Never connect them in any record, hint, or finding. It stays a
  coincidence the player may notice.
- **End beat — files begin to change** (per CLAUDE.md's premise): after
  Case 002 closes, Case 001's incident report shows a new handwritten
  annotation that was not there before: *"Filed. — M."* It is not
  explained, and Case 001's findings and save are unaffected.
  **Needs your approval:** this is the first time a closed file visibly
  changes.

## Unknowns — never resolve in Case 002

- Who lived at 14 Harrow Lane in 1984, and who left the answerphone message.
- Who wrote "Inspector — 10:00".
- Who "M." is, on either record.
- Why the inspection recorded the house as vacant.

## Engine work this case needs

- **Photo as an evidence type** (viewer exists; today photos only appear in
  File 0091), including a discovery fired by examining a region.
- **Case availability:** Case 002 appears in the archive after Case 001
  closes. Access level stays 1.
- **Changed-file mechanic** for the end beat: a document variant shown once a
  condition is met, without altering saved progress.
- No CCTV or object viewers needed.

## Open questions for you

1. Approve the premise, location, and date?
2. Keep the answerphone echo and the "M." initial, or drop either?
3. Approve the end beat (Case 001's report gains "Filed. — M.")?
4. Should the calendar discovery be required (as drafted) or optional?
5. Any names you want to use or avoid (neighbour, inspector)?
