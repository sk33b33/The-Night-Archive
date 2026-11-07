/**
 * Playback position bookkeeping, independent of any audio API. While playing,
 * position is derived from an anchor: position = anchorPosition + elapsed * rate.
 * Every action takes `now` (seconds) so behaviour is deterministic in tests.
 */
export const PLAYBACK_RATES = [0.5, 0.75, 1, 1.5] as const;
export type PlaybackRate = (typeof PLAYBACK_RATES)[number];

export interface PlaybackState {
  readonly playing: boolean;
  readonly anchorPosition: number;
  readonly anchorTime: number;
  readonly rate: PlaybackRate;
  readonly duration: number;
}

export type PlaybackAction =
  | { readonly type: 'play'; readonly now: number }
  | { readonly type: 'pause'; readonly now: number }
  | { readonly type: 'seek'; readonly position: number; readonly now: number }
  | { readonly type: 'rate'; readonly rate: PlaybackRate; readonly now: number }
  | { readonly type: 'tick'; readonly now: number };

export function initialPlayback(duration: number): PlaybackState {
  return { playing: false, anchorPosition: 0, anchorTime: 0, rate: 1, duration };
}

export function positionAt(state: PlaybackState, now: number): number {
  const raw = state.playing
    ? state.anchorPosition + Math.max(0, now - state.anchorTime) * state.rate
    : state.anchorPosition;
  return Math.min(Math.max(raw, 0), state.duration);
}

function reanchor(state: PlaybackState, now: number, patch: Partial<PlaybackState>): PlaybackState {
  return { ...state, anchorPosition: positionAt(state, now), anchorTime: now, ...patch };
}

export function playbackReducer(state: PlaybackState, action: PlaybackAction): PlaybackState {
  switch (action.type) {
    case 'play': {
      if (state.playing) return state;
      // Playing from the very end restarts the reel.
      const atEnd = state.anchorPosition >= state.duration;
      return {
        ...state,
        playing: true,
        anchorPosition: atEnd ? 0 : state.anchorPosition,
        anchorTime: action.now,
      };
    }
    case 'pause':
      return state.playing ? reanchor(state, action.now, { playing: false }) : state;
    case 'seek':
      return {
        ...state,
        anchorPosition: Math.min(Math.max(action.position, 0), state.duration),
        anchorTime: action.now,
      };
    case 'rate':
      return action.rate === state.rate ? state : reanchor(state, action.now, { rate: action.rate });
    case 'tick':
      if (state.playing && positionAt(state, action.now) >= state.duration) {
        return { ...state, playing: false, anchorPosition: state.duration, anchorTime: action.now };
      }
      return state;
  }
}
