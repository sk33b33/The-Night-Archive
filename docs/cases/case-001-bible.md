# Case bible — Case 001: The Missing Recording

Source of truth for what the game states, implies, and leaves unknown.
Content lives in `src/content/cases/case-001*.ts` and
`src/content/anomalies/file-0091.ts`; if this file and the content disagree,
fix one of them in the same change.

Legend: **[Canon]** from CLAUDE.md · **[Added]** invented during implementation
and open to revision · **[Rule]** design constraint.

## Facts in the records

| Detail | Where | Status |
|---|---|---|
| Bellwether Railway Station, 14 October 1981 (a Wednesday) | Report, timetable | [Canon] (weekday [Added], checked against the calendar) |
| Official report time 03:40 | Report | [Canon] |
| Report names caller Elias Ward | Report | [Canon] |
| Caller field reads "Elias Ward (station staff)" | Report | [Added] — needed so the roster contradiction is fair |
| Unusual activity near the east platform; no incident confirmed | Report | [Canon] |
| Last train 02:10 cancelled | Timetable, reel announcement | [Canon] |
| Destination "Carrow Junction"; departures 23:05, 00:20, 01:15 (mail) | Timetable | [Added] |
| Announcement wording, "Platform one" | Reel | [Added] |
| East platform access door sealed 1979 | Works register | [Canon] |
| "Frame welded and boarded"; day and month illegible; needs district engineer's written authority to reopen | Works register | [Added] |
| Elias Ward not rostered that night | Duty roster | [Canon] |
| Rostered staff R. Hale (supervisor), D. Okafor (porter), T. Brennan (signal box), 22:00–06:00 | Duty roster | [Added] |
| Reel: announcements, clock chime, obscured voice "Don't open the east door." | Audio reel | [Canon] |
| Clock chime is a four-note phrase with no hour strikes | Audio reel | [Added] — avoids implying a time |
| Filtered segment: second voice "Mara, don't file this." | Filtered segment | [Canon] |
| "[Tape noise rises]" caption marks where the second voice is buried | Audio reel | [Added] — fair-play clue |
| Reel running time 0:50; voices at 0:30–0:46 | Audio reel | [Added] |

## Supported conclusion (what the player may establish)

1. The official report is unreliable or incomplete.
2. The recording contains information the report omits.
3. The caller's identity remains unknown.

## Unknowns — never resolve in Case 001

- Who made the call. **[Rule]** Never assert Elias Ward, Mara, either voice,
  or anyone else. Tests enforce that no accepted finding names a caller.
- Who the two voices are, and who Mara is.
- Why the reel was filed but never transcribed.
- What happened at the east door.

## Board relationships the records support

Report contradicts roster · report leaves out reel · report leaves out
filtered segment · reel corroborates timetable · reel and works register share
a subject (east door) · filtered segment derived from reel. All other links
remain hypotheses. **[Rule]** Reasons state what the records show, never why.

## End anomaly — File 0091

| Detail | Status |
|---|---|
| Appears after Case 001 closes; photograph of the player's workstation dated 14 October 1981 | [Canon] |
| Archive records show the workstation was installed in 1998 | [Canon] |
| Workstation ID "NA-07", shown on the dashboard from the first shift | [Added] |
| "Previous asset at this position: None recorded" | [Added] |
| No intake record; filed by "Not recorded" | [Added] |
| Photo regions: asset label, terminal screen (on; text unreadable), date imprint | [Added] |
| Wall clock above position 7 reads 03:40 (Case 001's report time); not a marked region | [Added in Case 008] |
| Night-entrance door, shut, on the far wall | [Added in Case 006] |
| HALDEN 486 maker's badge on the terminal | [Added in Case 005] |

**[Rule]** Leave it unexplained. Tests reject explanatory wording in its content.
Case 004 is titled "File 0091": nothing here may pre-empt it.
