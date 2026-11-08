import { describe, expect, it } from 'vitest';
import { keepCodesTogether } from './textSearch';

describe('keepCodesTogether', () => {
  it('joins reference codes with a non-breaking hyphen, one character for one', () => {
    expect(keepCodesTogether('SB-01 – SB-06, NA-07')).toBe('SB‑01 – SB‑06, NA‑07');
    expect(keepCodesTogether('night-shift, 1962-70, re-filed')).toBe('night-shift, 1962-70, re-filed');
    expect(keepCodesTogether('SB-07').length).toBe(5);
  });
});
