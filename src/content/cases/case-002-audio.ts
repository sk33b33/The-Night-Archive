import type { AudioTimeline } from '../../domain/audio';

/**
 * Case 002 answerphone cassette. The outgoing message is too worn to make
 * out (so it identifies nobody). One incoming message, 1 March 1984. The
 * caller is never identified. [Approved echo of Case 001; never linked.]
 */
const HISS = { type: 'hiss', level: 0.05 } as const;
const BEEP = { type: 'bell', at: 0.3, notes: [1046], spacing: 0, decay: 0.12, level: 0.25 } as const;

export const CASE_002_TAPE: AudioTimeline = {
  duration: 26,
  segments: [
    {
      id: 'start',
      label: 'Tape start',
      start: 0,
      end: 3,
      layers: [HISS],
      lines: [{ speaker: null, text: '[Tape hiss]' }],
    },
    {
      id: 'outgoing',
      label: 'Outgoing message',
      start: 3,
      end: 12,
      layers: [{ type: 'hiss', level: 0.09 }, { type: 'voice', pitch: 'mid', start: 0.5, end: 8, level: 0.08, seed: 52 }],
      lines: [{ speaker: null, text: '[Outgoing message, too worn to make out]' }],
    },
    {
      id: 'beep',
      label: 'Tone',
      start: 12,
      end: 14,
      layers: [HISS, BEEP],
      lines: [{ speaker: null, text: '[Tone]' }],
    },
    {
      id: 'message',
      label: 'Message',
      start: 14,
      end: 22,
      layers: [HISS, { type: 'voice', pitch: 'low', start: 0.8, end: 6.5, level: 0.22, seed: 71 }],
      lines: [{ speaker: 'Caller (unidentified)', text: 'It’s me. Don’t open the door for anyone tonight.' }],
    },
    {
      id: 'end',
      label: 'Tape end',
      start: 22,
      end: 26,
      layers: [{ type: 'hiss', level: 0.03 }],
      lines: [{ speaker: null, text: '[End of recording]' }],
    },
  ],
};
