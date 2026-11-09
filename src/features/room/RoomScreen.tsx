import { useEffect, useId, useRef, useState } from 'react';
import { seasonOf } from '../../domain/case';
import { ArchiveTerminal, CaseFolders, UnfiledList, type ArchiveView } from '../archive/ArchiveScreen';
import { CASE_OBJECTS, INTERACTABLES, interactable, type Interactable, type InteractableId } from '../../world/layout';
import { panelFor, roomStore, useRoom, type PanelId } from '../../world/roomStore';

/** The case you are working, as the room shows it. */
export interface CurrentCase {
  readonly number: string;
  readonly title: string;
}

interface RoomScreenProps {
  readonly view: ArchiveView;
  readonly actions: RoomActions;
  readonly current: CurrentCase | null;
  readonly onOpenSettings: () => void;
  readonly focusOnMount: boolean;
}

const PANEL_TITLE: Record<PanelId, string> = {
  terminal: 'Archive terminal · NA-07',
  'drawer-1': 'Filing cabinet · Season 1',
  'drawer-2': 'Filing cabinet · Season 2',
  tray: 'Unfiled tray',
  'no-case': 'No case open',
  'no-footage': 'Camera 2 monitor',
};

/**
 * Which objects are in the room, given the case you are working: the case
 * folder is only on the desk when a case is open.
 */
export function present(i: Interactable, current: CurrentCase | null): boolean {
  return i.id !== 'folder' || current !== null;
}

/** The case an object belongs to, shown under it in Places and the prompt. */
export function caseNote(i: Interactable, current: CurrentCase | null): string | null {
  if (!CASE_OBJECTS.includes(i.id)) return null;
  return current ? `Case ${current.number} · ${current.title}` : 'No case open';
}

/** Where the room's objects lead. Case actions are absent when there is no case (or no footage). */
export interface RoomActions {
  readonly leave: () => void;
  readonly openCaseFiles?: (() => void) | undefined;
  readonly openBoard?: (() => void) | undefined;
  readonly openFindings?: (() => void) | undefined;
  readonly openFootage?: (() => void) | undefined;
}

/**
 * Uses an object in the room. Stations open their panel; the door leaves;
 * the case objects open the case's screens, or a panel saying why not.
 */
export function operate(id: InteractableId, actions: RoomActions): void {
  const panel = panelFor(id);
  if (panel) {
    roomStore.openPanel(panel);
    return;
  }
  const noCase = () => roomStore.openPanel('no-case');
  switch (id) {
    case 'door':
      actions.leave();
      return;
    case 'folder':
      (actions.openCaseFiles ?? noCase)();
      return;
    case 'board':
      (actions.openBoard ?? noCase)();
      return;
    case 'findings':
      (actions.openFindings ?? noCase)();
      return;
    case 'monitor':
      if (actions.openFootage) actions.openFootage();
      else if (actions.openCaseFiles) roomStore.openPanel('no-footage');
      else noCase();
      return;
    default:
      return;
  }
}

/**
 * The reading room's on-screen layer, drawn over the 3D scene. Everything
 * the scene offers can also be reached from the Places list, by keyboard
 * or screen reader, and still works when the scene cannot be shown.
 */
export function RoomScreen({ view, actions, current, onOpenSettings, focusOnMount }: RoomScreenProps) {
  const id = useId();
  const room = useRoom();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const panelHeadingRef = useRef<HTMLHeadingElement>(null);
  const [placesOpen, setPlacesOpen] = useState(false);
  const [hintOpen, setHintOpen] = useState(true);
  const showPlaces = placesOpen || room.sceneUnavailable;

  useEffect(() => {
    if (focusOnMount && !room.panel) headingRef.current?.focus();
    // Only on arrival; panels move focus themselves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusOnMount]);

  useEffect(() => {
    if (room.panel) panelHeadingRef.current?.focus();
  }, [room.panel]);

  useEffect(() => {
    if (!room.panel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') roomStore.openPanel(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [room.panel]);

  const use = (target: InteractableId) => {
    setPlacesOpen(false);
    operate(target, actions);
  };

  const focusedItem = room.focus ? interactable(room.focus) : null;
  const focused = focusedItem && present(focusedItem, current) ? focusedItem : null;
  const places = INTERACTABLES.filter((i) => present(i, current));

  return (
    <div className="room-hud">
      <header className="room-hud__bar">
        <div>
          <p className="eyebrow">Night shift · NA-07</p>
          <h1 ref={headingRef} tabIndex={-1} className="room-hud__title">
            Reading room
          </h1>
        </div>
        <div className="room-hud__actions">
          <button
            type="button"
            className="btn btn--secondary"
            aria-expanded={showPlaces}
            aria-controls={`${id}-places`}
            onClick={() => setPlacesOpen((o) => !o)}
          >
            Places
          </button>
          <button type="button" className="btn btn--quiet" onClick={onOpenSettings}>
            Settings
          </button>
        </div>
      </header>

      {room.sceneUnavailable && (
        <p className="notice notice--warning" role="status">
          The 3D reading room cannot be shown on this device. Every object can still be used from the list below.
        </p>
      )}

      {showPlaces && (
        <nav id={`${id}-places`} className="room-hud__places panel" aria-label="Places">
          <h2 className="panel__title">Places</h2>
          <ul>
            {places.map((i) => {
              const note = caseNote(i, current);
              return (
                <li key={i.id}>
                  <button
                    type="button"
                    className="room-hud__place"
                    onClick={() => use(i.id)}
                    aria-describedby={note ? `${id}-note-${i.id}` : undefined}
                  >
                    <span className="room-hud__place-name">{i.name}</span>
                    <span className="room-hud__place-action">{i.action}</span>
                  </button>
                  {note && (
                    <span id={`${id}-note-${i.id}`} className="room-hud__place-note">
                      {note}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {!room.panel && !room.sceneUnavailable && (
        <>
          <span className="room-hud__crosshair" aria-hidden="true" />
          {focused ? (
            <div className="room-hud__prompt">
              <span className="room-hud__prompt-name">
                {focused.name}
                {caseNote(focused, current) && ` · ${caseNote(focused, current)}`}
              </span>
              <button type="button" className="btn btn--primary" onClick={() => use(focused.id)}>
                {focused.action}
                <span className="room-hud__key" aria-hidden="true">
                  E
                </span>
              </button>
            </div>
          ) : (
            hintOpen && (
              <div className="room-hud__hint">
                <p>
                  <span className="room-hud__hint-keys">
                    Walk with <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> or the arrow keys; look up and down with{' '}
                    <kbd>R</kbd> and <kbd>F</kbd>, or click the room and move the mouse. Face an object and press{' '}
                    <kbd>E</kbd> to use it. <kbd>Tab</kbd> reaches Places.
                  </span>
                  <span className="room-hud__hint-touch">
                    Drag the left side of the screen to walk and the right side to look. Tap an object to use it, or
                    open Places.
                  </span>
                </p>
                <button type="button" className="link-button" onClick={() => setHintOpen(false)}>
                  Hide controls
                </button>
              </div>
            )
          )}
        </>
      )}

      {room.panel && (
        <section className="room-hud__panel panel" aria-labelledby={`${id}-panel`}>
          <div className="room-hud__panel-head">
            <h2 id={`${id}-panel`} ref={panelHeadingRef} tabIndex={-1} className="panel__title">
              {PANEL_TITLE[room.panel]}
            </h2>
            <button type="button" className="btn btn--secondary" onClick={() => roomStore.openPanel(null)}>
              Step back
            </button>
          </div>
          <PanelContent panel={room.panel} view={view} current={current} />
        </section>
      )}
    </div>
  );
}

function PanelContent({
  panel,
  view,
  current,
}: {
  readonly panel: PanelId;
  readonly view: ArchiveView;
  readonly current: CurrentCase | null;
}) {
  if (panel === 'terminal') return <ArchiveTerminal view={view} />;
  if (panel === 'no-case') {
    return (
      <p className="prose">
        No case is open on your desk. Take a folder from the filing cabinet, or open one from the archive terminal,
        and its board, findings and footage will be here.
      </p>
    );
  }
  if (panel === 'no-footage') {
    return (
      <p className="prose">
        {current
          ? `No camera footage is filed with Case ${current.number} yet. The monitor shows camera 2 when a case has footage.`
          : 'No case is open.'}
      </p>
    );
  }
  if (panel === 'tray') return <UnfiledList view={view} />;
  const season = panel === 'drawer-1' ? 1 : 2;
  const cases = view.cases.filter((c) => seasonOf(c) === season);
  return cases.length === 0 ? (
    <p className="prose">This drawer is empty. No files from this season have been assigned yet.</p>
  ) : (
    <CaseFolders view={view} cases={cases} />
  );
}
