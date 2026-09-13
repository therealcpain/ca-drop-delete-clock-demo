# CA DROP Delete Clock

**Paste (1) California resident? yes/no, (2) DROP request submit date OR “not submitted”, (3) view date → one shareable card:**  
giant **eligible to file** / **waiting for broker cycle** / **inside 45-day processing window** / **up-to-90-day status lag** / **not CA-eligible** · **Aug 1 2026** “brokers must access ≥ every 45 days” chip · **November 2026** “first full download/upload cycle should complete” milestone · days-since-submit vs 45/90 bars when submitted · pointer **privacy.ca.gov/drop** only.

Brand on the surface: **CA DROP Delete Clock** only.

**Not legal advice. Official DROP only / not a paid removal service.** CA residents only. We never submit on your behalf. Never invent a broker’s Deleted / Exempted / Not found status. User-pasted dates only — zero DROP-account scrape; never ask SSN.

## Hypothesis

Californians who filed DROP in H1 2026 still see “pending” while spam continues — “did Aug 1 start the clock?” / “is 90 days the max?” fog. Flip that into a **timeline-honest share card** — without scraping broker portals or selling a cleanup package. Success = “paste your DROP submit date — inside the 45/90-day window?” shares around Aug processing headlines and the Nov milestone.

## How to test (local)

```bash
cd kb/mde/ca-drop-delete-clock
npm run build          # copies assets → dist/
npm run verify         # CA gate + Aug1/45/90/Nov + seeds + brand-clean
# either open the file:
open index.html        # or dist/index.html
# or serve:
npm start              # http://localhost:4246
```

Manual checklist:

1. Open the page → click **CA · Mar submit / Aug processing** → giant **inside 45-day processing window** (14 days since Aug 1), Aug/Nov chips, 45/90 bars, privacy.ca.gov/drop footer.
2. Click **Not submitted · eligible to file** → eligible to file · Aug/Nov context chips.
3. Click **Non-CA · not eligible** → not CA-eligible.
4. Click **Past 90-day status lag** → up-to-90-day status lag (past 90).
5. Click **Nov milestone view** → Nov chip / status lag vs first full cycle.
6. Click **Empty / missing dates** → honest miss (submitted without date).
7. Paste your own CA flag + dates → **Show delete clock**.
8. Missing view date or CA → honest status (no invented days).
9. **Copy summary** → clipboard has status + Aug/Nov + privacy.ca.gov cites.
10. **Share link** → `#p=` restores the card.
11. **Export PNG** → dark clock card with status text + **disclaimer** on the face.
12. Surface brand is **CA DROP Delete Clock** only (no Conglomerate / personal names).

### GitHub Pages

This folder is static-ready. Point Pages at `/` of a dedicated repo (or `/docs` after copying `dist/`), with `index.html` at the site root. Relative paths (`styles.css`, `app.js`) work on project pages.

```bash
npm run build   # optional artifact in dist/
```

Do **not** create the public repo or post from this build step — Steward handles Pages + distro. Distro stays product-linked only (e.g. r/privacy, r/California in the Aug–Nov window). **No sock accounts.** No “DROP is broken sue CPPA” farms. **Hard-avoid** paid data-removal affiliates on share PNG — privacy.ca.gov only.

## Seed cohort (MVP)

Labeled teaching dates — not live DROP scrapes. Never invent a broker’s Deleted / Exempted / Not found status.

| Chip | Inputs | Teaching point |
|------|--------|----------------|
| CA · Mar submit / Aug processing | CA yes · submitted 2026-03-15 · view 2026-08-15 | 14d since Aug 1 · inside 45-day |
| Not submitted · eligible to file | CA yes · not submitted · view 2026-09-13 | File at privacy.ca.gov/drop |
| Non-CA · not eligible | CA no · view 2026-09-13 | DROP is CA residents only |
| Past 90-day status lag | CA yes · Mar 15 · view 2026-11-15 | 106d · past 90-day lag |
| Nov milestone view | CA yes · Mar 15 · view 2026-11-01 | First full-cycle milestone day |
| Empty / missing dates | CA yes · submitted · blank date | Honest miss |

## Calendar logic (public privacy.ca.gov / CPPA framing)

| Rule | Framing |
|------|---------|
| Not CA | → **not CA-eligible** |
| CA + not submitted | → **eligible to file** (+ Aug / Nov chips) |
| CA + submitted, view &lt; Aug 1 2026 | → **waiting for broker cycle** (processing starts Aug 1) |
| CA + submitted, view ≥ Aug 1 | Processing start = later of (submit, Aug 1); days since that start vs **45-day** access cycle and **up-to-90-day** status lag |
| days since &lt; 45 | → **inside 45-day processing window** |
| days since ≥ 45 | → **up-to-90-day status lag** |
| Aug 1 2026 chip | Brokers must access DROP ≥ every 45 days |
| November 2026 chip | First full download/upload cycle should complete |
| Pointer | **privacy.ca.gov/drop** only |
| Broker status | **Never invent** Deleted / Exempted / Not found |

## Ads pathway (ad-only free utility — do not spend yet)

| Path | Notes |
|------|--------|
| **Revenue (primary)** | **AdSense / display under the card + “what is California DROP and how long until brokers act?” explainer** (not inside the PNG). Inventory spikes around Aug processing headlines and Nov cycle milestone. Justified when sessions cover hosting. Free card forever — **no paywall**, **no Gumroad**. |
| **Acquisition (optional later)** | Google “California DROP delete data brokers 45 days” / “Delete Act August 2026 status” + Reddit privacy promo · creative = “Paste your DROP submit date — inside the 45/90-day window?” · max CPA abort if CPA &gt; ~$0.30–0.50 without a completed share · UTM + resident/submit bucket + share · spend only after one organic privacy-thread test. Debit/cash only. |
| **Hard rules** | **Ad-only OK.** **No spend** from this ready_for_pages step. **Hard-avoid** paid data-removal affiliates that compete with free DROP — pointer is **privacy.ca.gov** only. Brand-safe: informational timeline literacy; **not** legal advice; “CA residents only — file/check status at privacy.ca.gov/drop; we never submit on your behalf.” |

## Cites

- https://privacy.ca.gov/drop/
- https://cppa.ca.gov/data_brokers/
- https://privacy.ca.gov/drop-for-data-brokers/process-drop-requests/

## Steward ship note

Experiment status: **ready_for_pages**. Steward ships Pages — no GitHub create / no public posts from this step.
