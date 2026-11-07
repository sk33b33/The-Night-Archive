# Case bible — Case 003: The Unknown Caller

Status: **approved** (2026-11-07), implemented in `src/content/cases/case-003*.ts`.
All proposals approved as written. The background-filter discovery is
**optional** (the call-box finding can be cited from the fault report or the
handset record).

**Details chosen at implementation [Added]:** addresses 4 Mill Street,
27 Church Road, 9 Canal Row, 2 Station Road, 12 Harrow Lane; call times
23:10–23:25; kiosk 3; property tag PS/86/1101; trace requested Fri 7 Nov 09:00;
engineer's background note dated Mon 10 Nov 1986. The ordering question uses
Move up / Move down buttons (no drag); they work identically for touch, mouse,
keyboard, and screen readers.

## Premise

Over five nights an anonymous caller rang the police from what they said was
the Station Road call box, each time reporting "a man watching a house" at a
different Bellwether address. Every address was attended and nothing was found.
The calls stopped and the file was closed as a hoax. The records say the caller
was not where they claimed to be.

- **Dates:** Monday 3 – Friday 7 November 1986.
- **Official finding:** "Hoax calls from a public call box. Caller not traced.
  No further action."
- **Player's question:** where were the calls really made from, and what can
  the records establish about the caller?

## Evidence

| # | Item | Type | What it shows |
|---|---|---|---|
| 1 | Control room call log, 3–7 Nov 1986 | Document | Five calls, 23:10–23:25 each night. Caller "would not give name", "says calling from Station Road call box". A different address each night; all attended, nothing found. |
| 2 | Recording of the fifth call | Audio | A low, careful voice gives the address. In the background: a clock ticking, a kettle coming to the boil, no traffic. Nothing from the caller identifies them. |
| 3 | Call box fault report | Document | Station Road call box out of order 1–10 November 1986: handset removed by an engineer for repair. |
| 4 | Call box handset | **Object (new type)** | Property-store record: removed 1 Nov by the engineer, tagged, stored, refitted 11 Nov. Provenance chain plus linked records. |
| 5 | Malicious-call trace | Document | Trace requested after call 4 and run on call 5. Result: the call came from a private line, ex-directory. Subscriber name **redacted**. Exchange: Bellwether. |
| 6 | Attendance notes | Document | One line per address. Each occupant was unaware, and each house had a lit window facing the street. The fifth address is **12 Harrow Lane** (Mrs J. Pell's house, from Case 002). |

**Discovery (proposed):** in the audio, a new authored **"background"**
filter brings up the room sound (ticking clock, kettle). Applying it during
the call records a discovery that files **Item 2a: Background analysis**, an
engineer's note that the call was made indoors. This reuses the discovery
mechanic without repeating Case 001's voice reveal.

## Supported conclusion

1. The caller was not at the Station Road call box. Its handset had been
   removed (fault report + handset provenance), and the call sounds indoors.
2. At least the fifth call came from a private line on the Bellwether
   exchange (trace).
3. Who made the calls cannot be established (subscriber redacted).

**[Rule]** Never accept:
- "the calls were a hoax", since nothing shows the watcher was or wasn't real
- "Mrs Pell made the calls"
- "the caller lived at a named address", since the trace gives a line, not a person
- any link between the caller and Cases 001 or 002

## Findings (draft)

1. *Were the calls made from the Station Road call box?* Supported: **No.**
   Cite the fault report or the handset record.
2. *Where did the fifth call come from?* Supported: **A private line,
   ex-directory.** Cite the trace.
3. *Who made the calls?* Supported: **Cannot be established.** Cite the trace
   (redacted subscriber).
4. **New question type (proposed): put events in order.** Arrange five
   events: the handset is removed, call 1, the trace is requested, call 5,
   the handset is refitted. Supported only by the records' dates and times.
   This adds a different kind of reasoning from multiple choice.

## Board relationships the records support

- Call log **contradicts** fault report (the call box was out of order)
- Call log **contradicts** handset record (the handset was in the property store)
- Fault report **corroborates** handset record (same removal date)
- Recording **contradicts** call log (indoor sound vs "call box")
- Background analysis **derived from** recording
- Trace **same subject** recording (both are the fifth call)

## Thread to the long mystery (light touch)

- **Mrs Pell's address** is one of the five (Case 002 continuity). Nothing
  says why, and nothing connects it to the caller.
- **End beat, a file changes again:** after Case 003 closes, the call log
  shows a **sixth entry** that was not there before. The date is blank, the
  time is 23:10, and the address reported is *"Records facility, night
  entrance"*. Status: *"Not attended."* Unexplained. It reads as the file
  predicting something about the player's own building. **Needs your
  approval:** this is the first change that points at the player's present,
  and it foreshadows Case 006 ("Someone Is Watching").

## Unknowns — never resolve in Case 003

- Who made the calls, and why those five addresses.
- Whether anyone was watching any of the houses.
- Who redacted the subscriber name, and why.
- The meaning of the sixth entry.

## Engine work this case needs

- **Object evidence (new type):** an object record with description,
  provenance timeline (who held it, when, where), and linked records. This is
  the CLAUDE.md "objects (provenance and linked records)" viewer.
- **Ordering question (new deduction type):** arrange items by drag, with
  up/down buttons and a list alternative for keyboard and screen readers.
  Evaluated deterministically.
- **A second audio filter style** (background instead of voice). This is data
  only; the engine already supports it.
- Amendments that add a **table row** (the sixth call) rather than a block.
  This needs a small extension, keeping existing passage keys stable.

## Open questions for you

1. Approve the premise, dates, and the five-call structure?
2. Add the **object** evidence type and the **ordering** question, or keep
   Case 003 within existing mechanics?
3. Keep Mrs Pell's address as one of the five?
4. Approve the end beat (sixth entry: "Records facility, night entrance")?
5. Keep the background-filter discovery, and should it be required?
