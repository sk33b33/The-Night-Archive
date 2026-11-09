# The 3D reading room — engine plan

Status: **Phases 1 and 2 built** (2026-11-08, 2026-11-09). Requested by the project owner: a
more 3D look and feel, first-person, moving around, opening drawers, PCs
and doors.

## Decisions (owner's choices)

| Question | Choice |
|---|---|
| Movement | **Free roam**: walk and look anywhere in the room |
| What becomes 3D | **The world is 3D; evidence stays 2D.** Documents, photos, audio, CCTV, plans, timelines, registers, the board and findings open over the room as before |
| Art | **Free CC0 models**: Kenney Furniture Kit (CC0), plus interactive pieces built in code |
| Classic 2D view | **No.** 3D only. Accessibility comes from the Places list inside the room (below), not a separate mode |

## How it works

- **Engine:** three.js through React Three Fiber, with drei for glTF loading.
  - It loads lazily with the reading room. The title screen never waits
    for it.
  - Everything is cached for offline play.
- **One world, many screens.**
  - The room is mounted once, behind every screen.
  - The archive screen *is* the room.
  - Every other screen is an overlay on the dimmed room.
  - Navigation, saves, content and the 2D evidence viewers are unchanged.
- **Stations.** Using an object opens its panel. Coming back from a case
  reopens the station you left.

  | Object | Panel |
  |---|---|
  | NA-07 computer | The archive terminal (status, seasons, Unfiled) |
  | Filing cabinet, Season 1 / Season 2 drawers | The drawer slides out with a folder per case; its panel lists them |
  | Unfiled tray (on the desk) | Unregistered files |
  | Door | Leaves the reading room (title screen) |

- **Controls.**
  - **Keyboard:** W A S D or the arrows to walk, R and F to look up and
    down, E to use.
  - **Mouse:** click the room to look with the mouse (pointer lock); click
    to use what is in front of you.
  - **Touch:** drag the left half to walk, drag the right half to look, tap
    an object to use it.
- **Accessibility.**
  - The scene is decorative to assistive technology.
  - **Places** (a list in the room's bar) reaches every object without
    moving: by keyboard, by screen reader, or on a device that cannot draw
    WebGL. On those devices the list is always open, with an explanation.
  - Panels take focus. Escape and "Step back" close them.
  - Reduced motion snaps drawers instead of sliding them.
- **Pure, tested parts:**
  - `src/world/layout.ts`: the room in metres, objects, obstacles
  - `src/world/collision.ts`: walking, sliding and turning rules
  - `src/world/roomStore.ts`: focus and the open panel, shared by the
    scene and the on-screen layer

## Phases

1. **Done.** The reading room covers what the archive dashboard did:
   - free roam
   - the PC terminal, the cabinet drawers and the Unfiled tray
   - the door to the title screen
   - overlays for every other screen
   - Places for accessibility
2. **Done.** The case you are working is in the room.
   - **Which case:** the one you last opened this session. Otherwise it is
     the most recently started case still open. With nothing in progress,
     there is no case.
   - **The case folder** lies open on your desk, labelled with its number.
     It opens the case files.
   - **The case wall** (left wall) has a corkboard and a findings clipboard.
     - The corkboard carries the case number and an index card per record,
       with pins and red string. It opens the evidence board, with the case
       files behind it.
     - The clipboard opens the findings.
   - **The camera 2 monitor** (front right) shows CAM 2 when the case has
     footage, and opens it. Otherwise it reads "No footage filed" and says
     so.
   - **Without a case,** the corkboard and clipboard say how to open one.
   - **Places** lists these objects with the case named in a description,
     so the buttons keep stable names.
3. **Rooms.**
   - The door opens onto a corridor, with the stack room and (once Case
     010 closes) Storage B.
   - Season content can live in the places it describes.
4. **Device tuning.**
   - A quality setting (shadows, resolution) for low-end Android.
   - Ambient sound: the building hum, the lamp, footsteps.

## Known limits

- In WebGL software rendering (the test browser), the room runs at a few
  frames a second. Real phones and desktops use the GPU.
- three.js logs a deprecation *warning* ("THREE.Clock … use THREE.Timer")
  from inside React Three Fiber. It is not an error and does not affect
  play. It goes away when React Three Fiber updates.
