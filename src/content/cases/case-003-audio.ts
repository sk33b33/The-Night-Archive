import type { AudioFilter, AudioTimeline } from '../../domain/audio';

/**
 * Case 003: recording of the fifth call. The caller is never identified.
 * The background filter brings up the room sound (a clock and a kettle):
 * the call was made indoors, not from a call box.
 */
export const BACKGROUND_ISOLATION: AudioFilter = {
  id: 'background-isolation',
  label: 'Background isolation',
  description: 'Suppresses the voices and brings up the sound of the room behind them.',
};

export const ROOM_SOUND_DISCOVERY = 'c003-room-sound';

const ON = BACKGROUND_ISOLATION.id;
const HISS = { type: 'hiss', level: 0.04, filtered: { filterId: ON, level: 0.01 } } as const;
const TICK = { type: 'tick', perSecond: 1, level: 0.008, filtered: { filterId: ON, level: 0.12 } } as const;

export const CASE_003_CALL: AudioTimeline = {
  duration: 22,
  segments: [
    {
      id: 'connect',
      label: 'Line opens',
      start: 0,
      end: 3,
      layers: [HISS, TICK],
      lines: [{ speaker: null, text: '[Line connects]' }],
    },
    {
      id: 'call',
      label: 'The call',
      start: 3,
      end: 17,
      layers: [
        HISS,
        TICK,
        { type: 'voice', pitch: 'mid', start: 0.3, end: 2.6, level: 0.2, seed: 9, filtered: { filterId: ON, level: 0.03 } },
        { type: 'voice', pitch: 'low', start: 3.4, end: 12.5, level: 0.16, seed: 86, filtered: { filterId: ON, level: 0.025 } },
        { type: 'kettle', start: 5, end: 14, level: 0.006, filtered: { filterId: ON, level: 0.09 } },
      ],
      lines: [
        { speaker: 'Operator', text: 'Police. What is the address?' },
        {
          speaker: 'Caller (unidentified)',
          text: 'Station Road call box. There’s a man watching the house at 12 Harrow Lane.',
        },
        { speaker: null, text: '[Faint background noise]', condition: { filterId: ON, applied: false } },
        { speaker: null, text: '[A clock ticking, close to the handset]', condition: { filterId: ON, applied: true } },
        {
          speaker: null,
          text: '[A kettle coming to the boil]',
          condition: { filterId: ON, applied: true },
          revealsDiscovery: ROOM_SOUND_DISCOVERY,
        },
      ],
    },
    {
      id: 'end',
      label: 'Line closes',
      start: 17,
      end: 22,
      layers: [HISS, TICK],
      lines: [{ speaker: null, text: '[Caller hangs up]' }],
    },
  ],
};
