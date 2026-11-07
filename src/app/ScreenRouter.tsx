import type { ReactNode } from 'react';
import { ANOMALIES } from '../content/anomalies/file-0091';
import { CASES, findCase } from '../content/cases';
import { visibleAnomalies } from '../domain/anomaly';
import { AnomalyScreen } from '../features/anomaly/AnomalyScreen';
import { EMPTY_BOARD } from '../domain/board';
import {
  briefingReport,
  isCaseAvailable,
  type CaseDefinition,
  type CaseId,
} from '../domain/case';
import {
  availableEvidence,
  evidenceUnlockedBy,
  withAmendments,
  type DocumentEvidence,
} from '../domain/evidence';
import { caseProgress, caseStatus } from '../domain/progress';
import { ArchiveScreen } from '../features/archive/ArchiveScreen';
import { BriefingScreen } from '../features/briefing/BriefingScreen';
import type { EngineFactory } from '../features/evidence/audio/useReelPlayer';
import { EvidenceScreen } from '../features/evidence/EvidenceScreen';
import { BoardScreen } from '../features/evidence-board/BoardScreen';
import { FindingsScreen } from '../features/deductions/FindingsScreen';
import { InvestigationScreen } from '../features/investigation/InvestigationScreen';
import { MainMenu } from '../features/menu/MainMenu';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import type { SaveController } from '../services/persistence/useSaveGame';
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
function amendedRecords(caseFile: CaseDefinition, isClosed: (id: CaseId) => boolean): number {
  return caseFile.evidence.filter(
    (e) => e.kind === 'document' && (e.amendments ?? []).some((a) => isClosed(a.whenCaseClosed)),
  ).length;
}

/** Maps the current screen to its feature component. No navigation state here. */
export function ScreenRouter(props: ScreenRouterProps) {
  const { screen, focusOnMount, saveGame, notice, navigate, back } = props;
  const save = saveGame.state.status === 'ready' ? saveGame.state.save : null;
  const isClosed = (id: CaseId) => caseStatus(save, id) === 'closed';
  const anomalies = visibleAnomalies(ANOMALIES, isClosed);
  const cases = CASES.filter((c) => isCaseAvailable(c, isClosed));

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
        <ArchiveScreen
          cases={cases}
          statusOf={(id) => caseStatus(save, id)}
          amendedCount={(id) => {
            const c = findCase(id);
            return c ? amendedRecords(c, isClosed) : 0;
          }}
          onOpenCase={(caseId) => navigate({ id: 'briefing', caseId })}
          anomalies={anomalies}
          onOpenAnomaly={(anomalyId) => navigate({ id: 'anomaly', anomalyId })}
          focusOnMount={focusOnMount}
          onBack={back}
          notice={notice}
        />
      );
    case 'anomaly': {
      const anomaly = anomalies.find((a) => a.id === screen.anomalyId);
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
  const evidence = availableEvidence(caseFile.evidence, progress?.discoveries ?? []).map((e) =>
    withAmendments(e, isClosed),
  );

  switch (screen.id) {
    case 'briefing':
      return (
        <BriefingScreen
          caseFile={caseFile}
          report={withAmendments(briefingReport(caseFile), isClosed).document}
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
