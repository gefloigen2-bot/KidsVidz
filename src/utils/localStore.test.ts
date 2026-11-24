import { describe, expect, it } from 'vitest';
import { fmtBytes, titleFromFilename } from './localStore';

describe('titleFromFilename', () => {
  it('strips the extension', () => {
    expect(titleFromFilename('Uncle Moishy - 01.mp4')).toBe('Uncle Moishy - 01');
    expect(titleFromFilename('story.MKV')).toBe('story');
  });
  it('falls back for empty names', () => {
    expect(titleFromFilename('.mp4')).toBe('Video');
  });
});

describe('fmtBytes', () => {
  it('formats KB/MB/GB', () => {
    expect(fmtBytes(500)).toBe('1 KB');
    expect(fmtBytes(25e6)).toBe('25 MB');
    expect(fmtBytes(1.5e9)).toBe('1.5 GB');
  });
});
