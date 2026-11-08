import type { EvidenceKind } from '../domain/evidence';

/** Display label for each kind of evidence, shared by every screen that lists evidence. */
export const KIND_LABEL: Record<EvidenceKind, string> = {
  document: 'Document',
  audio: 'Audio',
  photo: 'Photograph',
  object: 'Object',
  cctv: 'CCTV',
  plan: 'Floor plan',
  timeline: 'Timeline',
};
