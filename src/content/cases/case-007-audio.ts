import type { AudioSegment, AudioTimeline } from '../../domain/audio';
import { VOICE_ISOLATION } from './case-001-audio';

/**
 * Case 007: the call recorded on the NA-07 answerphone tonight. Same
 * segments as the 1981 reel (matched by segment ID), clearer. The second
 * voice is faint without the filter. Speakers are never identified.
 * Reveal level 1 (approved): nothing here names who answers NA-07.
 */
export const RECORDINGS_MATCH_DISCOVERY = 'c007-recordings-match';

const ON = VOICE_ISOLATION.id;
const HISS = { type: 'hiss', level: 0.035, filtered: { filterId: ON, level: 0.01 } } as const;

const VOICES: AudioSegment = {
  id: 'voices',
  label: 'Voices',
  start: 19,
  end: 29,
  revealsOnMatch: RECORDINGS_MATCH_DISCOVERY,
  layers: [
    HISS,
    { type: 'voice', pitch: 'low', start: 0.6, end: 5, level: 0.2, seed: 23, filtered: { filterId: ON, level: 0.3 } },
    { type: 'voice', pitch: 'high', start: 5.6, end: 9.4, level: 0.08, seed: 37, filtered: { filterId: ON, level: 0.26 } },
  ],
  lines: [
    { speaker: 'Unidentified voice', text: 'Don’t open the east door.' },
    { speaker: null, text: '[A second voice, faint]', condition: { filterId: ON, applied: false } },
    {
      speaker: 'Second voice (unidentified)',
      text: 'Mara, don’t file this.',
      condition: { filterId: ON, applied: true },
    },
  ],
};

export const CASE_007_TONIGHT: AudioTimeline = {
  duration: 31,
  segments: [
    {
      id: 'leader',
      label: 'Line opens',
      start: 0,
      end: 3,
      layers: [HISS],
      lines: [{ speaker: null, text: '[Line opens. Hiss]' }],
    },
    {
      id: 'announcement',
      label: 'Announcement',
      start: 3,
      end: 12,
      layers: [
        HISS,
        { type: 'bell', at: 0.3, notes: [659, 523], spacing: 0.6, decay: 0.5, level: 0.22 },
        { type: 'voice', pitch: 'mid', start: 1.6, end: 8.4, level: 0.22, seed: 11 },
      ],
      lines: [
        {
          speaker: 'Station announcer',
          text: 'Platform one. The two-ten service to Carrow Junction has been cancelled.',
        },
        { speaker: 'Station announcer', text: 'We apologise for any inconvenience.' },
      ],
    },
    {
      id: 'clock',
      label: 'Clock chime',
      start: 12,
      end: 19,
      layers: [
        HISS,
        { type: 'bell', at: 0.4, notes: [659, 523, 587, 392], spacing: 0.9, decay: 1.4, level: 0.28 },
      ],
      lines: [{ speaker: null, text: '[A station clock chimes]' }],
    },
    VOICES,
    {
      id: 'end',
      label: 'Line clears',
      start: 29,
      end: 31,
      layers: [{ type: 'hiss', level: 0.02 }],
      lines: [{ speaker: null, text: '[Line clears]' }],
    },
  ],
};
