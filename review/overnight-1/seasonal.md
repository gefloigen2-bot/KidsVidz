# ShKids: Yom Tov and kids' music cards (overnight, 2026-11-15)

**Output:** `seasonal.json` (same folder) has 17 cards: 13 pinned lists with 266 videos and 4 official playlists with 53 videos.

**How every card was checked:**
- Every list video passed oEmbed (200).
- No list video is already in `catalog.json`. That covers the listed IDs, the first page of every catalog playlist, and the first 100 videos of each uploads-playlist card (Rabbi B, Morah Ester, Torah Tots TV, ...).
- No video appears in two cards. The playlist cards are not deduped against each other or the lists beyond what is noted below.
- About 500 YouTube page and oEmbed requests (searches, playlists, channel tabs and oEmbed), plus thumbnail grids for visual checks. Requests were throttled to at least 1.4s apart. There was no 403 or 429, no youtubei and no watch pages.

**Suggested seasonal order:** Chanukah (Kislev, now), then Tu B'Shvat, Purim, Pesach, Lag BaOmer, Shavuos, and Tishrei/Sukkos next fall. Shabbos, bedtime, brachos and music cards apply all year.

## Yom Tov cards (category `yom-tov`)

| Card | # | What's in it | Best picks |
|---|---|---|---|
| **yt-chanukah** Chanukah Fun | 39 | Rabbi B (Chanukah Story, Antiochus, Happy Chanukah episode), Uncle Moishy "Spinning", Mitzvah Boulevard puppets, Micha Gamerman animated medley, Shazak Miracle Lights, Hidabroot AI Chanukah story, Fiveish in the shuk, Chabad.org dreidel game and menorah how-to, Shpielmans cartoons, Toveedo (Shuey safety, Chef Leibish), JCM interactive game, Tzivos story and juggling, crafts (CKids, Chaim's Corner, clay dreidel) | -0JP18T3gPU Rabbi B Chanukah Story; S0gbvH_LqP4 Gamerman medley; 1aoxWQts6sk Mitzvah Blvd; 35ndFZViNcM Miracle Lights; rCNvYs4ONsQ Fiveish |
| **yt-purim** | 24 | Rabbi B x4 (Boo Hoo Haman, Purim Senses...), Gamerman medley, CKids Purim story and dances, BeEzrat AI Megillah, Hidabroot AI Purim, Shpielmans, NYBC x5, Mishalot and Pirchei Yerushalayim medleys | BybVtlbwZLI Boo Hoo Haman; JKxQ4_LRBkI Gamerman; 9sUKqbiAl1U CKids story |
| **yt-pesach** | 33 | Rabbi B Pesach episode, Chad Gadya and Favorite Pesach Things; Uncle Moishy Pesach; Gamerman medley; Shazak *Out of Egypt* ch. 2-7 (1 and 8-11 already in catalog); KITA matzah; CKids Mah Nishtana karaoke (2 tunes); Chabad.org seder plate; choirs (NYBC Dayeinu, Boys Town Avadim Hayinu, Pirchei Shomayim Pesach Libi, Mishalot, Cheder Lubavitch) | vNvs5Zu6d_o Rabbi B Pesach; Shazak chapters; FmApfEEtJ_A Mah Nishtana |
| **yt-sukkos** Sukkos & Simchas Torah | 18 | Gamerman medley, KITA Sukkah and Simchas Torah songs, CKids and J Kids sukkah building, Chabad.org lulav/etrog, Hidabroot AI Ushpizin, Tzivos Rebbeim's esrogim, Boys Town/YBC; a few adult frum Sukkos songs (Ari Hill, Rogers Park, Beri Weber) | tRr5casj124, ztNSzHBoVCU |
| **yt-rosh-hashana-yom-kippur** | 20 | Rabbi B RH show, shofar song and "Saying I'm Sorry"; Oorah "Sound of the Shofar"; Gamerman Yamim Noraim medley; CKids shofar parable, Yonah and teshuva stories; Chabad.org explainers; then family listening (Avinu Malkeinu, Kol Nidrei, Tik'u medley) | XiYZrymQtrk, JWNkamObGKc, FUrKLJ-enRM |
| **yt-shavuos** | 15 | Rabbi B "Little Har Sinai", Gamerman medley, AI Har Sinai stories, KITA Matan Torah, CKids Ruth story, Torah-themed boys choirs | OkIUOlbmu3g, _2fuHZpLDfc |
| **yt-tu-bshvat** | 14 | Rabbi B "Tu Bishvat is Here" and "Seven Wonderful Fruits", Hidabroot AI, CKids crafts and lessons, fruit-bracha songs, JEM brachos song, Aleph Beta (7+) | ZDzOrmwEwM0, cixCEicguT4 |
| **yt-lag-baomer** | 15 | Stories of Rashbi (Toveedo, TorahKids AI, Hebrew 3D AI), CKids Rabbi Akiva, Tzivos *Quest for Oiz* parade episode, Great Parade clowns, Cape Town parade, Shalhevet "Bar Yochai", Likkutei Sichos kids, CKids Sefirah Surfers | 5d4M8S8O0Ak, lC_RQlwCaEI, MaFziHEfKJc |
| **yt-shabbos** | 18 | Rabbi B Kiddush Cup, Uncle Moishy Shabbos song and medley, Gamerman Leil Shabbos, Shmueli Ungar "Yosef Moker Shabbos", CKids animation, Mendy Worch *Heiliger Shabbos Stories*, challah and candles, Eli Marcus niggun, Cheder boys choir, Shneor Lerer piano | TJ9EA2BfHtI, kGM7I6bpRR8, fr5QPeECaCA |

The holiday catalog was already used up for several sources. The Shazak *Queen of Persia* chapters, most Rabbi B holiday episodes, Morah Ester holiday lessons and the Chabad.org holiday explainers are all in existing cards, so they were left out here.

## Music cards (`songs-stories` / `niggunim`)

| Card | Type | # | Notes |
|---|---|---|---|
| **yt-chanukah-choirs** | list | 13 | YBC "Those Were the Nights" and "Yivonim", MBC "Light Up the Nights" and "This Chanukah", NYBC x6, Tzlil V'Zemer, Kol Torah, Kinderlach Chanukah medley |
| **yt-shira-chadasha** | playlist | 12 | Official channel playlist (includes 2 Chanukah medleys) |
| **yt-ybc-acappella** | playlist | 11 | EG Productions official; useful for Sefira and the Three Weeks |
| **yt-kinderlach** | playlist | 13 | Official album 3 (Modeh Ani, Shema Hashem, Hamalach Hagoel) |
| **yt-tzivos-nigunim-english** | playlist | 17 | Tzivos rally songs: Shine Your Light (Chanukah), Rosh Chodesh Kislev song, Shamil, Tatenyu. **Girls sing in the Hakhel Song.** |
| **yt-chabad-niggunim-choirs** | list | 24 | Chabad.org "Singing the Nigun" (Poltava, Shamil, Hinei Ma Tov), Tomchei Tmimim boys clips, Cheder boys choir, 12 Pesukim, the official Seder Nigunim project (Eli Marcus, Benny Friedman, Shlomo Simcha, Avraham Fried), The Kapelle, Malchus, Shira choir. No Rebbe talks. |
| **yt-bedtime-niggunim** | list | 16 | 3 Shema bedtime songs (AI), Uncle Moishy Lullabies, instrumental piano Chabad niggunim for babies (Shneor Lerer, Meir Shitrit). Some run 1-2 hours. |
| **yt-brachos-davening** | list (ageGroup 2-3) | 17 | Modeh Ani (KITA, Simcha Sing-Along, Neshama Kids, Chabad preschool, Rebbe Glanz), morning tefilla, Mizmor L'Sodah, "Which Bracha?", CKids brachos, Rabbi B and Uncle Moishy "Hashem is Here" |

## Flags to review (kol isha and provenance)
- **J KIDS TV** (Israeli frum kids channel): girls and small children sing. Flagged in Chanukah, Purim, Pesach, Sukkos, RH, Shavuos, Tu B'Shvat, Shabbos and Brachos.
- **"Thank You Hashem" kids channel** (UCt-dDtK6GGFfizaRzJrsJRA): AI songs whose vocals may be female. It is **not confirmed** to be the official TYH Nation organization. Flagged in Chanukah, Purim, Pesach and Shavuos. Easy to drop as a group.
- **AI kids-song channels** (Neshama Kids, Simcha Sing-Along, Idishe Mame AI, Torah Time Travelers, TorahKids, BeEzrat, "ילדים שרים ומספרים"): allowed by policy, but the voice gender was not verified.
- **Tzivos playlist:** the Hakhel Song has a girls' choir on screen.
- **Fan uploads:** Uncle Moishy tracks from "Chana" (the same uploader the existing card uses), plus David Issever, Moshe Borisoff and MontrealJews. Also an Eli Marcus album uploaded by "Yoel".
- **Adult frum pop** (family-safe, not kids-specific): Sukkos (Ari Hill, Rogers Park, Beri Weber), Shavuos (Simcha Leiner), RH (Avinu Malkeinu and Kol Nidrei).

## Rejected and why
- **Non-Orthodox or unclear provenance:** BimBam, Shaboom, Ms. Sara, Shalom Sesame, PJ/Kar-Ben read-alouds, Maccabeats/Six13, Jacobs Jewish Videos, Yeladim Project, FromGrandmaWithLove, Mr Daniel, Twinkl, temple/Schechter school videos, Tooli show (woman singing, unclear orthodoxy). Also "Am Yisrael Chai - Ohr LaGoyim" (possible Hebrew-roots) and Hebrew-roots/Messianic results (Clean Slate Ministries, Yahuah Kids, Onyx and Olive).
- **Rebbe talks** (singing only is allowed): Maor Daily Rebbe clips (Tu B'Shvat, parade), JEM parade highlights, Fax-A-Sicha.
- **Adult, promo or fundraising:** Oorah Chanukah event highlights and Rabbi Mintz messages, Tzivos rallies (40-80 min), the Chabad.org menorah-lighting broadcasts, the Uncle Moishy ArtScroll album sampler (an ad), the MostlyMusic Pesach sample clip, the Hidabroot lectures, 8th Day "Shabbos Now"/"Just One Shabbos" and Shwekey (adult rather than kids songs).
- **Content:** "Multi Media Megilla" (Vashti scene, unknown uploader), Tzivos "Chana and her Seven Sons" play (martyrdom theme, likely girls acting), Chabad.org "Yes We Can" (2008 parody, unclear), Rabbi Kachlon's Megillah (a reupload of BeEzrat's).
- **Technical:** T3or_umlbnY (TYH-kids Tu B'Shvat) failed oEmbed. All the user-made "(Full Album)" playlists for MBC, NYBC, Suki & Ding, Abie Rotenberg and Golden Crown are dead ("Unreleased").
- **Duplicates of the catalog:** about 40 candidates, including the Rabbi B Dreidel song, Morah Ester holiday lessons, Torah Tots TV Chanukah, JCM History's Heroes Chanukah, the Shazak chapters, the 8th Day Chanukah medley and the MBC Chanukah Nights video.

## Gaps and ideas for next time
- **Not reached:** Suki & Ding, Country Yossi, Abie Rotenberg kids albums (Golden Crown) and Mitzvah Kinder. Their YouTube presence is mostly dead user playlists. The next step would be to find the official Topic-channel album playlists (OLAK5uy_ IDs) via `channel_tab(<Topic cid>,'releases')`.
- **Tu B'Shvat** has 14 videos, one short of the 15 target; there isn't much Orthodox kids' content for it on YouTube.
- **NYBC** (Yitzy Bald's channel) and **Seder Nigunim** each have enough content for their own playlist card if wanted.
