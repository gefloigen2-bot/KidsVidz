# ShKids: discovery run for new creators (overnight)

There are 33 proposed cards in `discover.json`, from 27 new creators plus one new playlist from a creator the app already has (TYH). Every card was:
- checked with oEmbed (each playlist URL, plus a sample of its first 4 videos; every video on a pinned list). Nothing failed.
- checked by eye on a thumbnail grid. The grids are `g1.jpg` to `g5.jpg` in this folder.
- read against the channel's About text and recent titles for red flags (Christian, Messianic or Hebrew-roots, Reform or Conservative). None of the proposed cards has one.

I used about 550 YouTube requests, with at least 1.3 s between page and oEmbed requests and at least 1.2 s between thumbnails. I did not use `youtubei`.

## Best finds (high confidence, English)
1. **Rabbi Alevsky's Preschool Songs** (`alevsky-preschool-songs`): 48 classic Chabad gan songs (Modeh Ani, Hareini Mekabel, Tzitzis, Shabbos, Pesach, Footsteps of Moshiach) from a Chabad of the West Side shliach. Male voice only, ages 2-3. There's also a 9-song **Davening Songs** subset (`alevsky-tefilah`).
2. **The Kneidles: Shabbos Musical** (`kneidles-shabbos`): an animated Erev Shabbos musical by Chassidic artist Peretz Schmukler (challah, Kiddush, candles, Shulchan Aruch Yid).
3. **Shmuli Zalmanov: Jewish Story Time** (`shmuli-story-time`): the Lubavitcher storyteller you asked for. These are live stories at Oholei Torah and 770, ages 4-5 and up.
4. **Maor Kids: The 12 Pesukim** (`maor-12-pesukim`, animated) and **TYH: The 12 Pesukim** (`tyh-12-pesukim`, music videos).
5. **Sami and Tuvia** (`sami-and-tuvia`) and **Jewish Bedtime Stories** (`meir-bedtime-toddlers`), from Machon Meir's kids channel. Orthodox but Religious-Zionist rather than Chabad.
6. **Morah Music (Surie Levilev)** (`morah-music`): toddler songs. **Flag: female singing.**

## Good, medium confidence (English)
- **J Kids** (`jkids-songs`, 19K subscribers): Israeli frum toddler songs. Little girls appear on screen and I couldn't confirm the vocals.
- **Alef-Bet Adventures, Jewish Interactive** (`ji-alef-bet`): 22 letter stories ("Shin says Shema"). Uses Israeli letter names, not Chabad pronunciation.
- **Morah Rina's Aleph-Beis Songs** (`jacobs-aleph-beis`): 27 aleph-beis songs with strong frum markers, but the channel has only 13 subscribers. AI visuals, **female singing.**
- **Story Time with Rabbi and Rebbetzin Wollenberg** (`wollenberg-story-time`): Zoom read-alouds of HaChai-style books (Yossi and Laibel and others).
- **Morah Rochel Reads** (`morah-rochel-read-aloud`): read-alouds of frum books. A woman presents on camera and her hair looks uncovered.
- **JewJoy** English (`jewjoy-english`) and Hebrew (`jewjoy-hebrew`): 3D AI toddler songs. The Hebrew channel posts a "Nusach Arizal Chabad" davening video.
- **Bitachon Tunes, Idishe Mame AI** (`idishe-mame-bitachon`): AI emunah songs; the channel says all vocals are male. 77 subscribers.
- **KidEden Baal Shem Tov puppet stories** (`kideden-baal-shem-tov`) and **Yanki's Tales** (`yankis-tales`): both tiny channels. Yanki's Tales is AI animation that shows the Avos and Imahos.

## Hebrew and Yiddish (in order of strength)
- **Chassidic Dreams** (`chassidic-dreams`, 121 Chabad bedtime stories, high confidence). There's also a 3-video English playlist (`chassidic-dreams-english`).
- **Sipur Matok** (`sipur-matok`): aggados Chazal stories. **Flag:** a girl actor appears.
- **Pnei Melech** (`pnei-melech-kids`): Chassidic animation studio. Six episodes hand-picked; the rest of the channel is promos.
- **A'Maaseh** (`amaase-chassidic-stories`, mixed English and Hebrew) and **Yachad** (`yachad-tzaddikim`): animated tzaddik stories, ages 7+.
- **Chassidish Time** (`chassidish-time`): toddler content and **Petzponim baby songs** (`kacha-ze-baby-songs`). Both are AI.
- **Yiddish Nachas** (`yiddish-nachas`, Chassidish boys' choir, 19 hand-picked songs) and **Kinderlach** (`kinderlach-singles`, Israeli Chassidic boys' band).
- **Menucha Fuchs stories** (`menucha-fuchs-stories`): a woman narrates on camera. **Malkali: Shemesh & Nemesh** (`malkali-shemesh-nemesh`). **Flag: girls singing.**
- **Arutz Chabad Kids clips** (`chabad-kids-il-clips`, 7+, hand-picked) and **Tzivos Hashem Israel camp songs** (`tzivos-hashem-il-camp`). **Flag: openly meshichist** ("Yechi Adoneinu... Melech HaMoshiach").

## Decisions for the reviewing parent
- **Female voices:** Morah Music, Jacobs, Malkali and the JewJoy girls' version include female singing. Morah Rochel and Menucha Fuchs have women speaking on camera.
- **Meshichist content:** I left the "Yechi Adoneinu" episode (`NInv3bU4r2w`) out of the Maor card. Add it back if you want it. The Tzivos Hashem Israel camp card is meshichist throughout.
- **AI animation that shows Avos, Imahos or tzaddikim:** Yanki's Tales, Jacobs, Chassidic Dreams, Yachad and A'Maaseh.

## Rejected or left out
- **Parshah Puppets** (Schachet-Briskin): not Orthodox. "Jewish Arbor Day", "Jonah the Really Whiny Prophet", and Disney-in-Hebrew playlists.
- **Teach Torah To Kids**: has a "Shadows of Yeshua" playlist, so it's Christian or Messianic.
- **Neshama Kids**: new-age "Kabbalah" framing and "Bim Bam Shabbat".
- **Jewish Kids Music (Jimmy the Musical Maggid), Kerry Bar-Cohn / Rebbetzin Tap, Shalom Sesame, Maccabeats, Ms. Sara, Shaboom/BimBam, Yeladim Project, Jewish Holiday Songs:** not Orthodox, or doubtful.
- **Chassidish Playback** (חסידיש פלייבק): low-quality re-uploads of רשת חינוך חב"ד material; the original source isn't on YouTube.
- **Minny Binny, Nossy Drelich, Chana (Uncle Moishy volume uploads), 770Shua:** re-uploaders of other people's content, or mixed adult content. Where an original creator turned up, I credited that creator instead.
- **The Perlowitz Show:** a Boro Park business-promo show. **Moetzet:** adult nostalgia concerts. **Living Lchaim:** adult.
- **Micha Gamerman** (animated Shabbos and Birkat Hamazon medleys, 81K subscribers): I couldn't confirm Orthodox affiliation strongly enough. Worth a manual look.
- **סיפורי צדיקים לילדים** (UCjj1koBh0-xC8xDV-QgjYpg): a mixed bag that includes a Chanan Ben Ari music playlist and Ashlag Kabbalah stories.
- **ליבי, סיפור ושיר, Jewish Magic (Chana Has) / Children Sing and Tell:** AI-mass-produced, and largely female or girl vocals. I deprioritised these, but they could be revisited.
- **Rabbi Juravel / Uncle Yossi:** no dedicated channel exists. Juravel's material sits under Oorah, which is already in the app. Uncle Yossi appears only as a single clip on Shmuli's channel.
- **Not re-proposed:** already-excluded sources (Torah Town, More Micha, Torah Portion Films, Yoni, JEWKIDS and others), and creators already in the app (Chabad Kids Videos' "Daily Chitas for Kids" playlist and Tzivos Hashem's "Quest for Oiz" both exist but come from creators the app has).

## Other leads
- J Kids Hebrew playlists.
- Idishe Mame "Parasha Songs" (PL3IwMVa3vwTJzUqS8CbquHTyhSEoofSki).
- A'Maaseh "Yisrolik's Journey" (PLWwIU1qYP22M).
- הרבי - שיר עם סיפור (UC4rTIg1lRDOB8lLXO6g0h2w): Tzivos Hashem Israel, only 2 videos so far.
- Alevsky Shabbat and Pesach sub-playlists.
