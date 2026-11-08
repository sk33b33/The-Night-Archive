# Case bible — Case 013: Ward

Status: **approved** (2026-11-08), implemented in `src/content/cases/case-013*.ts`.
Season 2, case 6 of 7 (see `docs/seasons/season-2-arc.md`). Reveal level 1
holds. Everything approved; **end beat A** (the night desk log comes on
file).

**Changes at implementation:**
- **Ordering evidence:** a copy of the SB-07 inventory line is added (item
  9). Without it, the ordering question's "SB-07 deposited" item had no
  date in the case.
- **Registers authored once** (`case-013-registers.ts`). The four register
  documents and the search are built from the same rows.
- **Near matches:** "PC H. Edwards" in the police roll is a second near
  match. Searching "Edwards" or "Warden" finds those names, never Ward.
- **The courier log** includes S. Lyle's entries either side of Ward's, so
  "no return recorded" is read against a log where returns are recorded.
- **The "case closed" unlock rule** brings the night desk log on file. A
  record that arrives this way counts as changed on the archive card.

## Canon this case builds on

- **Case 001:** the report's caller field reads "Elias Ward (station
  staff)". The Bellwether duty roster (R. Hale, D. Okafor, T. Brennan)
  has no Ward.
- **Case 009:** the records facility staff register, 1979–1983. Night
  archivist "M. —", with a specimen signature on file.
- **Case 011:** SB-07 was deposited on 15 Oct 1981 by the night
  archivist. Storage B was sealed on 16 Oct 1981.
- **Case 012 end beat:** a timeline track "Records facility, night desk,
  1981" reads *"03:40 · Call received from E. Ward. Not filed."* No record
  of it is on file.

## Premise

Ward is not station staff. The archive asks the question the season has
put off since Case 001: then whose staff? Four staff registers from 1981
are pulled for cross-reference.

- **Assignment:** "The 1981 report names its caller as Elias Ward, station
  staff. Cross-reference the 1981 staff registers. Establish which records
  name a Ward, and what they say. Record only what the evidence supports."

## The registers [Added]

| Register | Entries | Any Ward? |
|---|---|---|
| Railway district staff, 1981 | ~30 names across six stations | **No.** There is an **E. Warden**, signalman at Harlow Junction. A near match, not a match. |
| Records facility staff, 1979–1983 | 9 names | **Yes: "E. Ward, courier, Mar 1980 – 31 Oct 1981".** Night archivist "M. —" is on the same register. |
| Telephone exchange staff, Bellwether, 1981 | 12 names | No |
| Police division, Bellwether, 1981 | 14 names | No |

Plus the **records facility courier log, 13 October 1981**:
- *22:40 · E. Ward · Out · Destination: Bellwether station · Purpose:
  collection.*
- No return is recorded. The next entry is 14 Oct, 08:10, another courier.

## Evidence

| # | Item | Type | What it shows |
|---|---|---|---|
| 1 | **Staff cross-reference, 1981** | **Register search (new type)** | Search four registers at once by surname or initial. Results are grouped by register; a register with no match says "No entry". Each result links to its register. |
| 2–5 | The four registers | Document ×4 | As above. Readable in full. Searching is faster, but not required. |
| 6 | Courier log, 13–14 October 1981 | Document | Ward out at 22:40 to Bellwether. No return recorded. |
| 7 | Incident report, 1981 (copy, as amended) | Document | "Elias Ward (station staff)". |
| 8 | Duty roster, 1981 (copy) | Document | No Ward. |

**Required discovery:** searching the cross-reference for **"Ward"**
(whole surname, any case) files a *Cross-reference note*: "One register
lists a Ward: records facility staff, E. Ward, courier, 1980–81. The
railway register's E. Warden is a different surname." Searching
"Warden" or reading the registers alone does not file it. The note is
what findings cite, as with the comparison notes in Cases 009–011.

## Supported conclusion

1. No railway, exchange or police register for 1981 lists a Ward.
2. The records facility's register lists an E. Ward, courier, from March
   1980 to 31 October 1981.
3. The courier log records E. Ward signing out to Bellwether station at
   22:40 on 13 October 1981, with no return recorded.
4. Whether the report's "Elias Ward" is the facility's "E. Ward" cannot be
   established: one gives only an initial, and the report says station
   staff.

**[Rule]** Never accept:
- that E. Ward made the 03:40 call
- that E. Ward is Elias Ward (initial only)
- that E. Warden is Ward
- that M. sent Ward
- that Ward opened the door
- any mechanism

## Findings (introduces register search; reuses select-all, ordering, choice)

1. **Select all that apply:** *Which 1981 registers list a Ward?*
   - Supported: records facility staff only.
   - Distractor: the railway register, because of E. Warden.
2. *What post did E. Ward hold?* **Courier, records facility, 1980–81.**
   Cite the cross-reference note.
3. **Ordering:**
   - E. Ward joins the facility (Mar 1980)
   - signs out to Bellwether (13 Oct, 22:40)
   - the report names "Elias Ward" (14 Oct, 03:40)
   - SB-07 is deposited (15 Oct)
   - Ward's employment ends (31 Oct)
4. *What does the courier log record after Ward signs out?* **No return.**
5. *Is the report's "Elias Ward" the records facility's E. Ward?*
   **Cannot be established.**

## Board relationships the records support

- Records facility register **same subject** incident report (a Ward, that year). Not *contradicts*: that would assume the two are the same person.
- Duty roster **contradicts** incident report (no Ward on the roster), as in Case 001
- Courier log **same subject** records facility register (E. Ward)
- Courier log **same subject** incident report (Bellwether, that night)
- Railway register **corroborates** duty roster (no Ward at Bellwether)
- Cross-reference note **derived from** the cross-reference

## End beat — choose one

- **A (recommended):** the night-desk record from Case 012's end beat comes
  on file.
  - It is the records facility night desk log, 13–14 October 1981, one
    line: *"03:40 · Call received from E. Ward. Not filed."* No signature.
  - It gives Case 014 a citable record of the 03:40 call at the facility.
- **B:** the courier log's 22:40 line gains a second signature: *"Authorised:
  M., night archivist."*
  - It ties M. to sending Ward to Bellwether, which is more than reveal
    level 1 should carry before the finale.

## Engine work this case needs

- **Register search evidence type:**
  - registers (each a source document ID with rows `{ name, post,
    from, to, note? }`)
  - a search box: whole-word match on surname or initial, case-insensitive
  - results grouped by register, with "No entry" for registers that have
    none
  - a polite live region announcing the result count
  - `revealsOnSearch: { term, discovery }` for the required discovery
  - the registers stay readable as plain documents, so no one is forced
    to search
- **Document amendment** (end beat A): unlock a document when a case
  closes, or author it as an existing document with an `appendRow`
  amendment. *Proposal:* a new unlock type, "case closed", so the record
  simply appears in the case files.
- **No save change** (discoveries are already saved).

## Unknowns — keep open

- Who E. Ward was, beyond a post and two dates. Whether E. Ward is Elias Ward.
- What Ward collected at Bellwether; whether Ward returned.
- Who made the 03:40 call. Who received it at the night desk.
