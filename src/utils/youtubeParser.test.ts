import { describe, expect, it } from 'vitest';
import { parseYouTubeUrl } from './youtubeParser';

describe('parseYouTubeUrl', () => {
  const cases: [string, ReturnType<typeof parseYouTubeUrl>][] = [
    ['https://www.youtube.com/watch?v=kr56PrKr6Ps', { videoId: 'kr56PrKr6Ps' }],
    ['youtube.com/watch?v=kr56PrKr6Ps&t=42s', { videoId: 'kr56PrKr6Ps' }],
    ['https://m.youtube.com/watch?v=2_hQYZqlmk8', { videoId: '2_hQYZqlmk8' }],
    ['https://youtu.be/FF-LXuOph2g?si=abc', { videoId: 'FF-LXuOph2g' }],
    ['https://www.youtube.com/shorts/FF-LXuOph2g', { videoId: 'FF-LXuOph2g' }],
    ['https://www.youtube-nocookie.com/embed/FF-LXuOph2g', { videoId: 'FF-LXuOph2g' }],
    ['https://613tube.com/watch?v=kr56PrKr6Ps', { videoId: 'kr56PrKr6Ps' }],
    ['https://www.613tube.com/watch?v=kr56PrKr6Ps', { videoId: 'kr56PrKr6Ps' }],
    ['https://www.youtube.com/playlist?list=PL350C21A99B2CCBC9', { playlistId: 'PL350C21A99B2CCBC9' }],
    [
      'https://www.youtube.com/watch?v=kr56PrKr6Ps&list=PLvCc74uM4dx9h8bKfkzot1_iam34d6ma6&index=3',
      { videoId: 'kr56PrKr6Ps', playlistId: 'PLvCc74uM4dx9h8bKfkzot1_iam34d6ma6' },
    ],
    [
      'https://www.youtube-nocookie.com/embed/videoseries?list=PLvCc74uM4dx9h8bKfkzot1_iam34d6ma6',
      { playlistId: 'PLvCc74uM4dx9h8bKfkzot1_iam34d6ma6' },
    ],
    ['kr56PrKr6Ps', { videoId: 'kr56PrKr6Ps' }],
    ['PLvCc74uM4dx9h8bKfkzot1_iam34d6ma6', { playlistId: 'PLvCc74uM4dx9h8bKfkzot1_iam34d6ma6' }],
    ['https://vimeo.com/12345', null],
    ['https://www.youtube.com/watch?v=short', null],
    ['not a url at all', null],
    ['', null],
  ];
  it.each(cases)('%s', (input, expected) => {
    expect(parseYouTubeUrl(input)).toEqual(expected);
  });
});
