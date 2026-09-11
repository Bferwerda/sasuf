# SASUF comparative GenAI student survey — v6

Static GitHub Pages frontend for the Sweden (SE) and South Africa (SA) versions of the same comparative survey.

## Public pages

- `SE/` — Sweden entry point
- `SA/` — South Africa entry point
- `admin/` — password-protected research dashboard frontend

Expected GitHub Pages URLs for `Bferwerda/sasuf`:

- `https://bferwerda.github.io/sasuf/SE/`
- `https://bferwerda.github.io/sasuf/SA/`
- `https://bferwerda.github.io/sasuf/admin/`

Both country versions load the identical questionnaire from `shared/app.js`. The country/site is fixed by each folder's `config.js`.

## v6 study design

The eight academic scenarios are presented in a randomized order for each participant. Each scenario separates two concepts that should not be conflated:

1. **Normal assistance choice** — a five-step capability/assistance scale:
   1. No AI assistance
   2. Conventional digital tool
   3. Specialized AI tool
   4. General-purpose GenAI
   5. Advanced / reasoning GenAI

2. **Resource–capability trade-off** — a 1–7 hypothetical preference scale between a simpler option requiring fewer computing resources and a more capable AI option requiring more computing resources, under the stated assumption that the simpler option could adequately complete the task.

The five assistance categories are **not** treated as a fixed environmental-impact scale. This avoids assuming that any real-world category always uses a particular amount of energy or computation.

Each scenario also measures:
- appropriateness of AI use
- meaningful added value
- adequacy of a simpler alternative
- whether AI supports rather than replaces learning

The previous repeated “top three reasons” question was removed from every scenario to reduce fatigue. Decision factors are now selected once at the end of the survey.

## Baseline coverage

The survey covers current use and purposes, paid access, university-provided GenAI access, internet and cost constraints, perceived equality of access, institutional guidance, academic-integrity concern, language support, local/cultural mismatch, perceived AI literacy, output verification, privacy knowledge, sustainability attitudes, preference for lower-resource options, and career relevance.

## Contacts configured

### Sweden
- Bruce Ferwerda — Jönköping University — bruce.ferwerda@ju.se
- Alan Said — University of Gothenburg — alan.said@ait.gu.se

### South Africa
- Nobert Jere — University of Fort Hare — njere@ufh.ac.za
- Nosipho Mavuso — Walter Sisulu University — mavuso.nosipho@gmail.com

Before recruitment, replace the bracketed ethics reference and privacy/data-storage text in both `SE/config.js` and `SA/config.js`.

## Backend

Both survey pages submit to:

`https://wabisabitech.hk/sasuf/api/submit.php`

The API routes fixed `study_site` values to `responses_SE` or `responses_SA`.

Existing MySQL tables do not need questionnaire-specific schema changes because the complete submission is stored in `response_json`. Replace `submit.php` and `admin-api.php` with the v6 versions so validation, statistics and CSV export understand the new variables.

## Mobile design

The survey is mobile-first: large native range controls, 48px-class touch targets, a one-column scenario layout on phones, stacked response choices, non-sticky illustrations on small screens, full-width primary navigation, and responsive trade-off labels. The admin dashboard uses horizontally scrollable tables rather than forcing page-level overflow.
