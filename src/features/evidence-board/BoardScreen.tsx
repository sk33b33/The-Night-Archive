import { useCallback, useState, type ReactNode } from 'react';
import { SegmentedControl } from '../../components/SegmentedControl';
import { ScreenLayout } from '../../components/ScreenLayout';
import {
  addLink,
  evaluateLink,
  moveCard,
  positionOf,
  removeLink,
  type BoardLink,
  type BoardState,
} from '../../domain/board';
import type { CaseDefinition } from '../../domain/case';
import type { EvidenceId, EvidenceItem } from '../../domain/evidence';
import { BoardCanvas } from './BoardCanvas';
import { ConnectionForm, type ConnectionDraft } from './ConnectionForm';
import { ConnectionList } from './ConnectionList';

type View = 'board' | 'list';

const VIEW_OPTIONS = [
  { value: 'board', label: 'Board' },
  { value: 'list', label: 'List' },
] as const;

/** Narrow screens start in the list view; the board stays available. */
function initialView(): View {
  if (typeof window === 'undefined' || !window.matchMedia) return 'board';
  return window.matchMedia('(max-width: 719px)').matches ? 'list' : 'board';
}

interface BoardScreenProps {
  readonly caseFile: CaseDefinition;
  readonly evidence: readonly EvidenceItem[];
  readonly board: BoardState;
  readonly onChange: (change: (board: BoardState) => BoardState) => void;
  readonly onBack: () => void;
  readonly focusOnMount: boolean;
  readonly notice?: ReactNode;
}

const EMPTY_DRAFT: ConnectionDraft = { from: '', relation: 'contradicts', to: '' };

export function BoardScreen({
  caseFile,
  evidence,
  board,
  onChange,
  onBack,
  focusOnMount,
  notice,
}: BoardScreenProps) {
  const [view, setView] = useState<View>(initialView);
  const [draft, setDraft] = useState<ConnectionDraft>(EMPTY_DRAFT);
  const [message, setMessage] = useState<{ tone: 'info' | 'warning'; text: string } | null>(null);

  const evaluate = useCallback(
    (link: BoardLink) => evaluateLink(caseFile.boardRules, link),
    [caseFile.boardRules],
  );
  const available = new Set<string>(evidence.map((e) => e.id));
  const visibleLinks = board.links.filter((l) => available.has(l.from) && available.has(l.to));
  const titleOf = (id: EvidenceId) => evidence.find((e) => e.id === id)?.title ?? 'Unknown item';
  const indexOf = (id: EvidenceId) => evidence.findIndex((e) => e.id === id);

  const select = (id: EvidenceId) => {
    setMessage(null);
    setDraft((d) => {
      if (d.from === '' || (d.from !== '' && d.to !== '')) return { ...d, from: id, to: '' };
      if (d.from === id) return { ...d, from: '' };
      return { ...d, to: id };
    });
  };

  const submit = () => {
    if (draft.from === '' || draft.to === '') return;
    const link: BoardLink = { from: draft.from, to: draft.to, relation: draft.relation };
    const result = addLink(board, link);
    if (!result.ok) {
      setMessage({
        tone: 'warning',
        text:
          result.reason === 'same-item'
            ? 'Choose two different items.'
            : 'That connection is already on the board.',
      });
      return;
    }
    onChange((current) => {
      const again = addLink(current, link);
      return again.ok ? again.board : current;
    });
    const evaluation = evaluate(link);
    setMessage({
      tone: 'info',
      text:
        evaluation.status === 'supported'
          ? `Connection added. Supported by the records: ${evaluation.reason}`
          : 'Connection added as a hypothesis. The records do not establish it.',
    });
    setDraft({ ...EMPTY_DRAFT, relation: draft.relation });
  };

  return (
    <ScreenLayout
      title="Evidence board"
      eyebrow={`Case ${caseFile.number} · ${caseFile.title}`}
      onBack={onBack}
      backLabel="Case files"
      focusOnMount={focusOnMount}
      wide
    >
      <div className="board-toolbar">
        <SegmentedControl legend="View" options={VIEW_OPTIONS} value={view} onChange={setView} />
        <p className="prose board-help">
          {view === 'board'
            ? 'Drag cards to arrange them, or focus a card and use the arrow keys. Tap two cards to fill in a new connection.'
            : 'Choose two items and how they relate. Your connections and card layout are saved.'}
        </p>
      </div>

      {view === 'board' && (
        <BoardCanvas
          evidence={evidence}
          positionOf={(id) => positionOf(board, id, indexOf(id))}
          links={visibleLinks}
          evaluate={evaluate}
          selected={[draft.from, draft.to].filter((v): v is EvidenceId => v !== '')}
          onMove={(id, position) => onChange((current) => moveCard(current, id, position))}
          onSelect={select}
        />
      )}

      <div className="board-panels">
        <ConnectionForm
          evidence={evidence}
          draft={draft}
          onDraftChange={(next) => {
            setMessage(null);
            setDraft(next);
          }}
          onSubmit={submit}
          message={message}
        />
        <ConnectionList
          links={visibleLinks}
          evaluate={evaluate}
          titleOf={titleOf}
          onRemove={(key) => onChange((current) => removeLink(current, key))}
        />
      </div>
      {notice}
    </ScreenLayout>
  );
}
