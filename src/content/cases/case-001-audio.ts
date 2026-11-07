import { retimeSegment, type AudioFilter, type AudioSegment, type AudioTimeline } from '../../domain/audio';

/**
 * Case 001 audio reel. Canon: station announcements, a clock chime, an
 * obscured voice ("Don't open the east door."), and — only with the filter —
 * a second voice ("Mara, don't file this."). Speakers are never named: the
 * archive cannot establish who they are.
 */
export const VOICE_ISOLATION: AudioFilter = {
  id: 'voice-isolation',
  label: 'Voice isolation',
  description: 'Narrows the recording to the speech band and suppresses tape noise.',
};

export const SECOND_VOICE_DISCOVERY = 'c001-second-voice';

const HISS = { type: 'hiss', level: 0.06, filtered: { filterId: VOICE_ISOLATION.id, level: 0.015 } } as const;

const VOICES_SEGMENT: AudioSegment = {
  id: 'voices',
  label: 'Voices',
  start: 30,
  end: 46,
  layers: [
    HISS,
    {
      type: 'voice',
      pitch: 'low',
      start: 2,
      end: 7.5,
      level: 0.12,
      seed: 23,
      filtered: { filterId: VOICE_ISOLATION.id, level: 0.3 },
    },
    {
      // Buried under the tape noise until the filter is applied.
      type: 'voice',
      pitch: 'high',
      start: 9,
      end: 14,
      level: 0.02,
      seed: 37,
      filtered: { filterId: VOICE_ISOLATION.id, level: 0.24 },
    },
  ],
  lines: [
    { speaker: 'Unidentified voice (partly obscured)', text: 'Don’t open the east door.' },
    {
      speaker: null,
      text: '[Tape noise rises]',
      condition: { filterId: VOICE_ISOLATION.id, applied: false },
    },
    {
      speaker: 'Second voice (unidentified)',
      text: 'Mara, don’t file this.',
      condition: { filterId: VOICE_ISOLATION.id, applied: true },
      revealsDiscovery: SECOND_VOICE_DISCOVERY,
    },
  ],
};

export const CASE_001_REEL: AudioTimeline = {
  duration: 50,
  segments: [
    {
      id: 'leader',
      label: 'Reel start',
      start: 0,
      end: 6,
      layers: [HISS],
      lines: [{ speaker: null, text: '[Tape hiss]' }],
    },
    {
      id: 'announcement',
      label: 'Announcement',
      start: 6,
      end: 20,
      layers: [
        HISS,
        { type: 'bell', at: 0.4, notes: [659, 523], spacing: 0.6, decay: 0.5, level: 0.22 },
        { type: 'voice', pitch: 'mid', start: 2, end: 12.5, level: 0.2, seed: 11 },
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
      start: 20,
      end: 30,
      layers: [
        HISS,
        { type: 'bell', at: 0.5, notes: [659, 523, 587, 392], spacing: 0.9, decay: 1.4, level: 0.28 },
      ],
      lines: [{ speaker: null, text: '[A station clock chimes]' }],
    },
    VOICES_SEGMENT,
    {
      id: 'end',
      label: 'Reel end',
      start: 46,
      end: 50,
      layers: [{ type: 'hiss', level: 0.03 }],
      lines: [{ speaker: null, text: '[Recording ends]' }],
    },
  ],
};

/** The voices segment on its own, with the filter permanently applied. */
export const CASE_001_FILTERED_CLIP: AudioTimeline = {
  duration: VOICES_SEGMENT.end - VOICES_SEGMENT.start,
  segments: [retimeSegment(VOICES_SEGMENT, 0)],
};
