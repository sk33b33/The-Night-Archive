import type { ReactNode } from 'react';
import { ANOMALIES } from '../content/anomalies/file-0091';
import { FINALE } from '../content/archive';
import { CASES, closingChoiceOf, findCase } from '../content/cases';
import { visibleAnomalies } from '../domain/anomaly';
import { AnomalyScreen } from '../features/anomaly/AnomalyScreen';
import { EMPTY_BOARD } from '../domain/board';
import {
  briefingReport,
  caseId,
  isCaseAvailable,
  type CaseDefinition,
  type CaseId,
} from '../domain/case';
import {
  availableEvidence,
  evidenceUnlockedBy,
  isAmended,
  type ChoseFn,
  withAmendments,
  type DocumentEvidence,
} from '../domain/evidence';
import { caseProgress, caseStatus, choiceOf } from '../domain/progress';
import { RoomScreen, type CurrentCase, type RoomActions } from '../features/room/RoomScreen';
import { BriefingScreen } from '../features/briefing/BriefingScreen';
import type { EngineFactory } from '../features/evidence/audio/useReelPlayer';
import { EvidenceScreen } from '../features/evidence/EvidenceScreen';
import { BoardScreen } from '../features/evidence-board/BoardScreen';
import { FindingsScreen } from '../features/deductions/FindingsScreen';
import { InvestigationScreen } from '../features/investigation/InvestigationScreen';
import { MainMenu } from '../features/menu/MainMenu';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import type { SaveController } from '../services/persistence/useSaveGame';
import type { SaveGame } from '../domain/save';
import type { PreferencesController } from '../services/preferences/usePreferences';
import type { Screen } from './navigation';

export interface ScreenRouterProps {
  readonly screen: Screen;
  readonly focusOnMount: boolean;
  readonly saveGame: SaveController;
  readonly preferences: PreferencesController;
  readonly notice: ReactNode;
  readonly navigate: (to: Screen) => void;
  readonly back: () => void;
  readonly onContinue: () => void;
  readonly createEngine?: EngineFactory | undefined;
  /** What the reading room's objects lead to, and the case you are working. */
  readonly room: { readonly actions: RoomActions; readonly current: CurrentCase | null };
}

function Unavailable({ title, body, onBack }: { title: string; body: string; onBack: () => void }) {
  return (
    <div className="empty-state" role="alert">
      <p className="empty-state__lead">{title}</p>
      <p className="empty-state__body">{body}</p>
      <button type="button" className="back-button" onClick={onBack}>
        <span aria-hidden="true">←</span> Back
      </button>
    </div>
  );
}

/** How many of a case's records currently carry an amendment. */
function amendedRecords(caseFile: CaseDefinition, isClosed: (id: CaseId) => boolean, chose: ChoseFn): number {
  return caseFile.evidence.filter((e) => isAmended(e, isClosed, chose)).length;
}

/** What is on file for this save: the cases assigned and anything unfiled. */
export function shiftContents(save: SaveGame | null) {
  const statusOf = (id: CaseId) => caseStatus(save, id, closingChoiceOf(id));
  const isClosed = (id: CaseId) => statusOf(id) === 'closed';
  const cases = CASES.filter((c) => isCaseAvailable(c, isClosed));
  // An anomaly taken over by an available case leaves the Unfiled section.
  const replaced = new Set(cases.flatMap((c) => (c.replacesAnomaly ? [c.replacesAnomaly] : [])));
  const anomalies = visibleAnomalies(ANOMALIES, isClosed).filter((a) => !replaced.has(a.id));
  return { statusOf, isClosed, cases, anomalies };
}

/** Maps the current screen to its feature component. No navigation state here. */
export function ScreenRouter(props: ScreenRouterProps) {
  const { screen, focusOnMount, saveGame, notice, navigate, back } = props;
  const save = saveGame.state.status === 'ready' ? saveGame.state.save : null;
  const { statusOf, isClosed, cases, anomalies } = shiftContents(save);
  const chose: ChoseFn = (choiceId, value) => choiceOf(save, choiceId) === value;
  const finaleChoice = choiceOf(save, FINALE.choiceId);
  const anomalyRoute = visibleAnomalies(ANOMALIES, isClosed);

  switch (screen.id) {
    case 'menu':
      return (
        <MainMenu
          focusOnMount={focusOnMount}
          saveState={saveGame.state}
          onContinue={props.onContinue}
          onOpenArchive={() => navigate({ id: 'archive' })}
          onOpenSettings={() => navigate({ id: 'settings' })}
        />
      );
    case 'settings':
      return (
        <SettingsScreen
          focusOnMount={focusOnMount}
          preferences={props.preferences.preferences}
          onChange={props.preferences.update}
          persistFailed={props.preferences.persistFailed}
          saveState={saveGame.state}
          onEraseProgress={saveGame.erase}
          onBack={back}
        />
      );
    case 'archive':
      return (
        <>
          <RoomScreen
            view={{
              cases,
              statusOf,
              amendedCount: (id) => {
                const c = findCase(id);
                return c ? amendedRecords(c, isClosed, chose) : 0;
              },
              onOpenCase: (id) => navigate({ id: 'briefing', caseId: id }),
              anomalies,
              onOpenAnomaly: (anomalyId) => navigate({ id: 'anomaly', anomalyId }),
              shiftLine: finaleChoice && FINALE.shiftLine[finaleChoice],
              seasonComplete:
                finaleChoice && isClosed(caseId(FINALE.caseId)) ? FINALE.ending[finaleChoice] : undefined,
            }}
            actions={props.room.actions}
            current={props.room.current}
            onOpenSettings={() => navigate({ id: 'settings' })}
            focusOnMount={focusOnMount}
          />
          {notice}
        </>
      );
    case 'anomaly': {
      // Still reachable after a case takes it over (e.g. from history).
      const anomaly = anomalyRoute.find((a) => a.id === screen.anomalyId);
      return anomaly ? (
        <AnomalyScreen anomaly={anomaly} onBack={back} focusOnMount={focusOnMount} />
      ) : (
        <Unavailable title="File not found." body="There is no record of this file." onBack={back} />
      );
    }
    default:
      break;
  }

  const found: CaseDefinition | undefined = findCase(screen.caseId);
  const caseFile = found && isCaseAvailable(found, isClosed) ? found : undefined;
  if (!caseFile) {
    return <Unavailable title="File not found." body="This case file is not in the archive." onBack={back} />;
  }
  const progress = caseProgress(save, caseFile.id);
  // Records read as they currently stand, including any amendments in effect.
  const evidence = availableEvidence(caseFile.evidence, progress?.discoveries ?? [], isClosed).map((e) =>
    withAmendments(e, isClosed, chose),
  );

  switch (screen.id) {
    case 'briefing':
      return (
        <BriefingScreen
          caseFile={caseFile}
          report={withAmendments(briefingReport(caseFile), isClosed, chose).document}
          onBeginInvestigation={() => navigate({ id: 'investigation', caseId: caseFile.id })}
          focusOnMount={focusOnMount}
          onBack={back}
          notice={notice}
        />
      );
    case 'investigation':
      return (
        <InvestigationScreen
          caseFile={caseFile}
          evidence={evidence}
          isExamined={(id) => progress?.examined.includes(id) ?? false}
          onOpenEvidence={(evidenceId) =>
            navigate({ id: 'evidence', caseId: caseFile.id, evidenceId })
          }
          onOpenBriefing={() => navigate({ id: 'briefing', caseId: caseFile.id })}
          onOpenBoard={() => navigate({ id: 'board', caseId: caseFile.id })}
          onOpenFindings={() => navigate({ id: 'findings', caseId: caseFile.id })}
          focusOnMount={focusOnMount}
          onBack={back}
          notice={notice}
        />
      );
    case 'board':
      return (
        <BoardScreen
          caseFile={caseFile}
          evidence={evidence}
          board={progress?.board ?? EMPTY_BOARD}
          onChange={(change) => saveGame.updateBoard(caseFile.id, change)}
          focusOnMount={focusOnMount}
          onBack={back}
          notice={notice}
        />
      );
    case 'findings':
      return (
        <FindingsScreen
          caseFile={caseFile}
          evidence={evidence}
          attempts={progress?.attempts ?? []}
          onSubmit={(attempt) => saveGame.submitAttempt(caseFile.id, attempt)}
          onReturnToArchive={() => navigate({ id: 'archive' })}
          chosen={caseFile.closingChoice ? choiceOf(save, caseFile.closingChoice.id) : undefined}
          onChoose={(value) => {
            if (caseFile.closingChoice) saveGame.choose(caseFile.closingChoice.id, value);
          }}
          focusOnMount={focusOnMount}
          onBack={back}
          notice={notice}
        />
      );
    case 'evidence': {
      const item = evidence.find((e) => e.id === screen.evidenceId);
      if (!item) {
        return (
          <Unavailable
            title="Item not available."
            body="This evidence has not been filed with your case yet."
            onBack={back}
          />
        );
      }
      return (
        <EvidenceScreen
          item={item}
          documents={evidence.filter((e): e is DocumentEvidence => e.kind === 'document')}
          available={evidence}
          onOpenEvidence={(evidenceId) => navigate({ id: 'evidence', caseId: caseFile.id, evidenceId })}
          highlightsOf={(id) => progress?.highlights[id] ?? []}
          onHighlight={(id, key, on) => saveGame.highlight(caseFile.id, id, key, on)}
          onClearHighlights={(id) => saveGame.clearHighlights(caseFile.id, id)}
          onDiscover={(discoveryId) => {
            const alreadyKnown = progress?.discoveries.includes(discoveryId) ?? false;
            saveGame.discover(caseFile.id, discoveryId);
            return alreadyKnown ? [] : evidenceUnlockedBy(caseFile, discoveryId).map((e) => e.title);
          }}
          createEngine={props.createEngine}
          focusOnMount={focusOnMount}
          onBack={back}
          notice={notice}
        />
      );
    }
  }
}
