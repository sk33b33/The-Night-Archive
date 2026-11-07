import type { DeductionQuestion } from '../../domain/deduction';
import { evidenceId } from '../../domain/evidence';

/**
 * Case 005 findings (approved bible). Establish that the date is wrong and
 * that the records contradict each other. Never explain how: no "taken in
 * 1981", no motive, no forgery, no "printed after 1989".
 */
const id = {
  photo: evidenceId('c005-photograph'),
  manual: evidenceId('c005-camera-manual'),
  catalogue: evidenceId('c005-catalogue'),
  comparison: evidenceId('c005-comparison-note'),
  paper: evidenceId('c005-paper-sheet'),
  companies: evidenceId('c005-companies-register'),
} as const;

export const CASE_005_QUESTIONS: readonly DeductionQuestion[] = [
  {
    id: 'imprint',
    prompt: 'Does the date imprint establish when the photograph was taken?',
    options: [
      { id: 'yes', text: 'Yes. It records 14 October 1981.' },
      { id: 'set-by-hand', text: 'No. The date is set by hand on the camera.' },
      { id: 'altered', text: 'No. It was altered after printing.' },
    ],
    supportedOptionId: 'set-by-hand',
    requires: { allOf: [id.manual], anyOf: [] },
    hints: ['Find out how a date imprint gets onto a photograph.', 'The camera manual says how the date is set.'],
    citationHint: 'Your answer may hold. Cite the record that explains how the imprint is set.',
    finding: 'The date imprint does not establish when the photograph was taken: it is set by hand.',
  },
  {
    id: 'terminal',
    prompt: 'What does the terminal in the photograph establish?',
    options: [
      { id: '1981', text: 'That the scene is from 1981, as the imprint says.' },
      { id: 'not-before-1996', text: 'That the scene cannot date from before 1996.' },
      { id: 'nothing', text: 'Nothing. The terminal cannot be identified.' },
    ],
    supportedOptionId: 'not-before-1996',
    requires: { allOf: [id.catalogue, id.comparison], anyOf: [] },
    hints: [
      'Identify the terminal, then find out when it first existed.',
      'Match the terminal’s badge against the 1998 photograph, then check the catalogue.',
    ],
    citationHint: 'Your answer may hold. Cite the catalogue and the record that identifies the terminal.',
    finding: 'The scene cannot date from before 1996: the terminal in it was introduced that year.',
  },
  {
    kind: 'multi',
    id: 'dates-print',
    prompt: 'Which records date the print, rather than the scene it shows?',
    options: [
      { id: 'paper', text: 'The paper data sheet' },
      { id: 'companies', text: 'The companies register' },
      { id: 'catalogue', text: 'The Halden catalogue' },
      { id: 'installation', text: 'The installation photograph' },
      { id: 'register', text: 'The asset register' },
    ],
    supportedOptionIds: ['companies', 'paper'],
    requires: { allOf: [id.paper, id.companies], anyOf: [] },
    hints: [
      'Some records describe the room. Others describe the piece of paper you are holding.',
      'The paper’s stock and the lab’s existence date the print. The terminal, the room, and the register date the scene.',
    ],
    missingHint: 'Your selection leaves out a record about the print itself.',
    extraHint: 'Your selection includes a record about the scene, not the print.',
    citationHint: 'Your selection may hold. Cite the paper data sheet and the companies register.',
    finding: 'The paper data sheet and the companies register date the print; the other records date the scene.',
  },
  {
    kind: 'ordering',
    id: 'dates',
    prompt: 'Put these dates in order.',
    items: [
      { id: 'installed', text: 'Workstation NA-07 is installed (1998).' },
      { id: 'imprint', text: 'The date on the imprint (14 October 1981).' },
      { id: 'terminal', text: 'The Halden 486 is introduced (1996).' },
      { id: 'paper', text: 'The print’s paper is made (1980).' },
      { id: 'dissolved', text: 'Kessler Photo is dissolved (1989).' },
    ],
    supportedOrder: ['paper', 'imprint', 'dissolved', 'terminal', 'installed'],
    requires: { allOf: [id.paper, id.catalogue], anyOf: [] },
    hints: [
      'Each item carries its year. Earliest at the top.',
      'Everything about the print ends by 1989; everything about the scene begins in 1996.',
    ],
    citationHint: 'Your order may hold. Cite the paper data sheet and the catalogue.',
    finding: 'Every record of the print ends by 1989; every record of the scene begins in 1996.',
  },
  {
    id: 'how',
    prompt: 'How was a print of this scene made on 1980 paper, stamped by a lab dissolved in 1989?',
    options: [
      { id: 'old-stock', text: 'Old paper was used after 1998, with an old stamp.' },
      { id: 'forgery', text: 'It is a forgery.' },
      { id: 'unknown', text: 'The records cannot establish how.' },
    ],
    supportedOptionId: 'unknown',
    requires: { allOf: [id.paper, id.companies], anyOf: [] },
    hints: [
      'Ask what the records actually show, not what would make sense of them.',
      'No record shows old stock being used, or anyone forging anything. They only contradict each other.',
    ],
    citationHint: 'Your answer may hold. Cite the records that date the print.',
    finding: 'When and how the print was made cannot be established from the records.',
  },
];
