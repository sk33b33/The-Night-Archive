# On-device playthrough checklist

Automated checks cover rules, saves, layout at 360 px and desktop, keyboard
use, and axe accessibility (see `docs/CHANGELOG.md`). This list covers what
only a real device can confirm: touch, install, the system back gesture,
offline use, and **listening**. One pass plays both seasons. Season 2
(sections 10–17) can be played on its own from a save with Season 1 closed.

**Device:** an Android phone with Chrome (primary). Repeat the
**Install** and **Audio** sections on iOS Safari if available.
**Build:** a production build served over HTTPS (`npm run build`, any static
host). The dev server has no service worker.

Mark each line ✅, ❌ (note what happened), or n/a.

## 1. Install and first run

- [ ] Opening the site shows the main menu within a few seconds on mobile data.
- [ ] "The archive is ready to work offline" appears once, and **Dismiss** hides it.
- [ ] Chrome offers **Install app** (menu ⋮ → Install). The installed app opens
      full-screen with the dark theme colour in the status bar.
- [ ] The home-screen icon is the archive box, not cropped (maskable icon).
- [ ] On a fresh install, **Continue** is unavailable and says why. **Begin shift** and **Settings** work.

## 1a. The 3D reading room

- [ ] **Continue** or **Begin shift** shows the room within a few seconds; the
      title screen appears first, without waiting for it.
- [ ] Phone: dragging the left half walks and the right half looks; walking
      stays smooth (no stutter) for a minute of moving around.
- [ ] Tapping the computer, a cabinet drawer, the Unfiled tray and the door
      uses each one. The drawer slides out with folders inside.
- [ ] Desktop: clicking the room captures the mouse for looking; **Esc** gives it back.
- [ ] **Places** reaches every object without walking.
- [ ] With a case open, its folder is on the desk; the corkboard, clipboard and
      monitor open its board, findings and footage (Case 006 has footage).
- [ ] The phone does not get hot or drain quickly in five minutes in the room.
      Note the model and Android version.

## 2. Navigation and saving

- [ ] The Android **back gesture** moves back one screen every time and never
      leaves the app from inside a case.
- [ ] Mid-case, swipe the app away, reopen it, and tap **Continue**: you return
      to the same screen, and Back still walks up the case.
- [ ] Turn on **airplane mode**, reopen the app: everything still works,
      including audio.
- [ ] Settings → **Large** text: no screen needs sideways scrolling.
- [ ] Settings → Motion **Reduced**: screen transitions stop; CCTV shows no Play button.

## 3. Case 001 — The Missing Recording

- [ ] Document search highlights matches and reports the count.
- [ ] **Audio:** play the reel through once with headphones.
  - [ ] The announcement chime and the clock chime sound like bells, not clicks.
  - [ ] The voices sound like muffled speech. Captions carry the words.
  - [ ] Speed 0.5× and 1.5× work. The pitch shifts like tape, which is expected.
  - [ ] **Voice isolation** clearly lowers the hiss and brings up a second, higher voice.
- [ ] First tap of **Play** starts within about a second.
- [ ] Evidence board: drag a card with a finger; the page does not scroll
      while dragging. Two taps fill the connection form.
- [ ] Findings: a wrong answer gives a hint and nothing is lost.
- [ ] File 0091 appears under **Unfiled**. In its photo:
  - [ ] Pinch to zoom.
  - [ ] Drag to pan.
  - [ ] Double-tap to zoom in.
  - [ ] The page itself never zooms.

## 4. Case 002 — The Empty House

- [ ] Kitchen photo: tapping **Wall calendar** files the enlargement and says so.
- [ ] Answerphone: the tone is a short beep, and the message plays clearly.
- [ ] After closing, Case 001's card says "1 record amended since filing",
      and its report ends "Filed. — M."

## 5. Case 003 — The Unknown Caller

- [ ] Recording of call 5: with **Background isolation**, a ticking clock
      and a kettle coming to the boil are audible, and the voices drop away.
- [ ] Handset (object): linked records open directly.
- [ ] Ordering question: the ↑ ↓ buttons are easy to hit with a thumb.
- [ ] After closing, the call log shows a sixth call ("Records facility,
      night entrance").

## 6. Case 004 — File 0091

- [ ] The Unfiled File 0091 card is gone; Case 004 has taken its place.
- [ ] **Papers on the desk** files the enlargement; **Entry 0091** sits on the right line.
- [ ] Select-all question: a wrong selection gives the "leaves out" or
      "includes" hint.

## 7. Case 005 — The Wrong Date

- [ ] **Compare with → Installation photograph**: the photos stack on a phone.
      With **Keep views in step** on, pinching one zooms both.
- [ ] **Terminal badge** in the regions list files the comparison note.
- [ ] After closing, the print in Case 004 shows the "14 Oct 1981 … Placed"
      entry above yours.

## 8. Case 006 — Someone Is Watching

- [ ] CCTV: ◀ ▶ step one frame; the slider scrubs; zoom stays put while stepping.
- [ ] **Play** runs through the frames and stops on the last (motion not reduced).
- [ ] Still vs File 0091 photograph: **Window** files the viewpoint note.
- [ ] After closing, Case 001's report also reads "received at extension NA-07".

## 9. Case 007 — The Impossible Call

- [ ] **Compare with → Audio reel, 1981**: switching **Listening to** stops one
      recording and plays the other; captions on both sides follow the segment.
- [ ] Tonight's recording sounds clearer than the 1981 reel.
- [ ] After closing, **File 0093** appears. Its photo imprint shows **today's
      date** on this device.

## 10. Case 008 — The Next Number

- [ ] The archive groups the cases under **Season 1** and **Season 2**.
- [ ] File 0093 photograph vs camera 2 at 05:12: **Wall clock** files the
      timing note. On camera 2 the wall clock follows each frame's time.
- [ ] After closing, the intake ledger's 0094 time reads 06:00.

## 11. Case 009 — The Hand

- [ ] The 0094 slip vs the 1979 specimen: **Crossed "M"** files the
      specimen note. Pinching one sample zooms both, each to its own letter.
- [ ] Ordering question: the four records reorder smoothly with a thumb.

## 12. Case 010 — The Handover

- [ ] Floor plan: the time buttons fit without sideways scrolling; tapping
      a room in the drawing or in the list shows its records.
- [ ] **Source** links open the named record, and Back returns to the plan.
- [ ] After closing, the **06:00 · Storage B** step shows a dashed room with no record.

## 13. Case 011 — Storage B

- [ ] Count questions open the **number keyboard**. Typing a letter shows
      "Enter a whole number" and keeps **Submit findings** unavailable.
- [ ] Answering 2 for the unaccounted boxes gives a hint naming the missing
      comparison.
- [ ] Box labels (SB-07, SB-31, SB-40) are readable when zoomed in.

## 14. Case 012 — The East Door

- [ ] Timeline: unticking a source hides its row and its list entries;
      tapping a dot in the chart highlights its entry.
- [ ] After closing, the timeline gains "Records facility, night desk,
      1981" with "Source: no record on file."

## 15. Case 013 — Ward

- [ ] Register search: **Search** on the keyboard submits. "Warden" finds
      E. Warden only; "Ward" finds E. Ward only and files the note.
- [ ] After closing, **Night desk log, 13–14 October 1981** appears in the
      case files.

## 16. Case 014 — The Night Archivist (finale)

- [ ] The post record (full) reads **Mara —**.
- [ ] After the findings are accepted, the case is **not** closed until a
      choice is made. Leaving and returning keeps the choice on offer.
- [ ] Choosing shows a plain confirmation. **Go back** returns to the two
      options with nothing saved.
- [ ] After confirming, the dashboard shows the **Shift** line and the
      Season 2 complete note for that ending.
- [ ] Play the finale twice on two installs (or erase progress between
      runs) to see both endings:
  - [ ] **Filed:** the slip reads "Received by: night archivist, NA-07. 06:12."
  - [ ] **Unfiled:** the 1981 night desk log gains "06:12 · Not filed."

## 17. Upgrading an older save

- [ ] On a device with a save from before this update (save v5), install the
      update: **Continue** works, and no case or progress is lost.

## 18. Updates

- [ ] Deploy a new build. Within a minute of reopening the app, "A new
      version of the archive is available" appears.
- [ ] **Later** keeps playing. **Update now** reloads, and **Continue** still
      returns to the same place.

## Notes

| Section | Issue | Device / browser | Severity |
|---|---|---|---|
| | | | |
