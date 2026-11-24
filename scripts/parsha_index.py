"""Builds src/data/parsha-videos.json: parsha (Hebcal name) -> episodes from parsha-specific playlists.
Run: python3 scripts/parsha_index.py   (reads YouTube's public playlist pages; first ~100 videos each)"""
import json, re, ssl, os, urllib.request

_cfg = json.load(open('src/data/parsha-sources.json'))
SOURCES = [(x['list'], x['label'], x['showId']) for x in _cfg['sources']]
ALIASES = _cfg['aliases']  # Hebcal name -> regex of common spellings (shared with worker/parsha.ts)
CTX = ssl.create_default_context(cafile=os.environ.get('SSL_CERT_FILE') or None)
HDR = {'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'en-US,en;q=0.9', 'Cookie': 'CONSENT=YES+1; SOCS=CAI'}

def walk(o, key):
    if isinstance(o, dict):
        for k, v in o.items():
            if k == key: yield v
            yield from walk(v, key)
    elif isinstance(o, list):
        for v in o: yield from walk(v, key)

def playlist(pid):
    html = urllib.request.urlopen(urllib.request.Request(f'https://www.youtube.com/playlist?list={pid}', headers=HDR), context=CTX, timeout=30).read().decode()
    d = json.loads(re.search(r'var ytInitialData = (\{.*?\});</script>', html).group(1))
    vids = []
    for c in walk(d.get('contents', {}), 'lockupViewModel'):
        if c.get('contentType') == 'LOCKUP_CONTENT_TYPE_VIDEO':
            texts = [t for t in walk(c.get('metadata', {}), 'content') if isinstance(t, str)]
            vids.append((c['contentId'], texts[0] if texts else '', texts[1] if len(texts) > 1 else ''))
    from collections import Counter
    main = Counter(v[2] for v in vids).most_common(1)[0][0] if vids else ''
    for vid, title, ch in vids:
        if ch == main:  # only the playlist creator's own uploads (no strays)
            yield vid, title

index, unmatched = {}, []
for pid, label, show_id in SOURCES:
    for vid, title in playlist(pid):
        if re.search(r'[֐-׿]', title) and 'yiddish' not in title.lower() and not re.search(r'[a-z]{4}', title.lower()):
            continue
        if 'yiddish' in title.lower() or 'אידיש' in title:
            continue  # keep the English versions
        t = re.sub(r'[^a-z ]+', ' ', title.lower().replace("'", ''))
        t = re.sub(r'\s+', ' ', t)
        hits = [p for p, rx in ALIASES.items() if re.search(rx, t)]
        if not hits:
            unmatched.append(f'{label}: {title}')
        for p in hits:
            if all(e['videoId'] != vid for e in index.setdefault(p, [])):
                index[p].append({'videoId': vid, 'title': title, 'label': label, 'showId': show_id})

json.dump(index, open('src/data/parsha-videos.json', 'w'), ensure_ascii=False, indent=1)
print(f'{sum(len(v) for v in index.values())} episodes across {len(index)}/{len(ALIASES)} parshiyos')
print('missing:', [p for p in ALIASES if p not in index])
print('unmatched titles:', len(unmatched)); print('\n'.join(unmatched[:40]))
