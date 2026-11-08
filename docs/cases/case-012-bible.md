# Case bible — Case 012: The East Door (DRAFT for review)

Status: **proposal**. Season 2, case 5 of 7 (see
`docs/seasons/season-2-arc.md`). Reveal level 1 holds. Nothing is built
until approved.

## Canon this case builds on

- **Case 001:**
  - Bellwether Railway Station, night of 13–14 October 1981; report time
    03:40.
  - The last train (02:10) was cancelled.
  - The report's caller field reads "Elias Ward (station staff)". Ward was
    not on the roster.
  - Rostered staff (22:00–06:00): **R. Hale** (supervisor), **D. Okafor**
    (porter), **T. Brennan** (signal box).
  - The east platform access door was sealed in 1979: "Frame welded and
    boarded", day and month illegible. "Door not to be reopened without
    written authority from the district engineer."
  - The reel's obscured voice says "Don't open the east door."
- **Case 007:** exchange route BW-4 is the kiosk on the east platform,
  withdrawn in 1983.
- **Case 011 end beat:** box SB-07, deposited at the records facility on
  15 Oct 1981 by the night archivist, now reads "Contents: east door key,
  Bellwether." That line is a record's claim, not a fact.

## Premise

Back to 1981. The east door was sealed in 1979, and an inventory line now
says its key was deposited at the records facility the day after the
Bellwether report. The archive asks for the station's own records of that
night, side by side.

- **Assignment:** "Assemble the station's records for the night of 13–14
  October 1981 on one timeline. Establish what each record says about the
  east door, and in what order. Record only what the evidence supports."

## The night, by source [Added unless marked]

| Time | Signal box (Brennan) | Porter's log (Okafor) | Supervisor's book (Hale) | Exchange, BW-4 | Incident report |
|---|---|---|---|---|---|
| 02:10 | Service cancelled [Canon] | | | | |
| 02:15 | | | Station closed to the public | | |
| 02:20 | | Platforms swept. East door sealed, boards in place | | | |
| 03:00 | | | "Office. Returns." (to 03:50) | | |
| 03:18 | Lights seen at the east platform end | | | | |
| 03:25 | | **East door standing open. Boards stacked on the platform** | | | |
| 03:30 | | Phoned the supervisor's office. No answer | | | |
| 03:40 | | | | Outgoing call, 0:31. Destination not recorded | Call received [Canon] |
| 04:05 | | | **Attended the east platform: door sealed, boarding intact, no sign of interference** | | |

Plus the **1979 works order** (full copy). It extends Case 001's register
entry with "Boarding secured by hasp and padlock. Key to the district
engineer." This explains why a key exists for a welded door: the key is
for the boarding.

## Evidence

| # | Item | Type | What it shows |
|---|---|---|---|
| 1 | **The night of 13–14 October 1981** | **Timeline (new type)** | Five tracks, one per record above, on a shared axis from 02:00 to 04:30. Each event names its source record. |
| 2 | Signal box register | Document | Brennan's entries. |
| 3 | Porter's log | Document | Okafor's entries. |
| 4 | Supervisor's occurrence book | Document | Hale's entries. |
| 5 | Exchange record, route BW-4 | Document | One outgoing call at 03:40, lasting 0:31. Destination not recorded. |
| 6 | Incident report (copy, as amended) | Document | Case 001's report. |
| 7 | Works order, 1979 | Document | Welded and boarded; hasp and padlock; key to the district engineer. |
| 8 | Sealing inventory, SB-07 line (copy, as amended) | Document | "Contents: east door key, Bellwether." |

**Required discovery:** none, by proposal. The timeline is the tool, and
every finding can be read from it or from its sources. Case 007's audio
comparison and Case 009's letterforms were discoveries because they needed
a match. Here the question is order.

## Supported conclusion

1. The porter's log records the east door open at 03:25. The supervisor's
   book records it sealed, with the boarding intact, at 04:05.
2. Only the porter's log says the door was open.
3. A call left the east platform kiosk at 03:40, 15 minutes after the door
   was recorded open.
4. The records disagree about the door. Whether it was open cannot be
   established.
5. Who used the kiosk cannot be established.

**[Rule]** Never accept:
- that the door was opened by anyone named (Ward, M., Mara, staff)
- that the porter or the supervisor lied
- that the key in SB-07 opened the door
- that the 03:18 lights were a person
- any mechanism

## Findings (reuses ordering, select-all, counts, choice)

1. **Ordering:**
   - lights seen (03:18)
   - door recorded open (03:25)
   - porter's call unanswered (03:30)
   - kiosk call (03:40)
   - door recorded sealed (04:05)
2. **Select all that apply:** *Which records say the east door was open
   that night?*
   - Supported: the porter's log only.
   - Not supported: the signal box register (lights), the exchange record,
     or the report ("unusual activity").
3. **Count:** *How many minutes after the door was recorded open was the
   kiosk call made?* **15.**
   - A near miss of **10**: "That is from the porter's unanswered call.
     Start from the door."
4. *Was the east door open that night?* **The records disagree, so it
   cannot be established.** Cite the porter's log and the supervisor's
   book.
5. *Who used the kiosk at 03:40?* **Cannot be established.** Cite the
   exchange record and the roster or report.

## Board relationships the records support

- Porter's log **contradicts** supervisor's book (open at 03:25; sealed at 04:05)
- Exchange record **corroborates** incident report (03:40)
- Signal box register **same subject** porter's log (the east platform end, 03:18–03:25)
- Works order **corroborates** Case 001's maintenance record (sealed 1979)
- Works order **same subject** SB-07 line (the key)
- Supervisor's book **same subject** incident report (attended re the report, 04:05)

## End beat — choose one

- **A (recommended):** the timeline gains a sixth track, **"Records
  facility, night desk, 1981"**, with one entry: *03:40 · Call received
  from E. Ward. Not filed.*
  - It gives Ward a place in another organisation's records and leads into
    Case 013, *Ward*.
  - It echoes "Mara, don't file this" without naming anyone.
- **B:** the porter's log gains a line in the blue hand: *"03:41 — door
  closed. M."*
  - This puts "M." at the station, which is stronger than reveal level 1
    allows. Not recommended.

## Engine work this case needs

- **Timeline evidence type:**
  - tracks `{ id, label, source evidence ID }`
  - events `{ track, time, text }`
  - a time range
- **Viewer, on wide screens:**
  - a horizontal time axis with one row per track
  - events as buttons, which open their text and a link to the source
- **Viewer, on narrow screens and as the accessible alternative:**
  - one merged list in time order, each event tagged with its track
  - track filters (checkboxes) to show or hide sources
- **Timeline amendments:** a track appended when a case closes (end beat A).
- **No save change.**

## Unknowns — keep open

- Whether the door opened; who stacked the boards, or restored them.
- What the 03:18 lights were. Who used the kiosk; where the call went.
- Why the key is claimed to be in SB-07; who deposited it and why.

## Open questions for you

1. Approve the premise and the five-source night (times and names)?
2. Approve the 1979 works order's padlock and key, which reconciles a
   welded door with a key?
3. Approve no required discovery for this case?
4. End beat A (the records facility track, "E. Ward. Not filed.") or B?
