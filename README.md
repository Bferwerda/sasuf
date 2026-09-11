# SASUF comparative GenAI student survey — v5

Static GitHub Pages frontend for the Sweden (SE) and South Africa (SA) versions of the same comparative survey.

## Public pages

- `SE/` — Sweden entry point
- `SA/` — South Africa entry point
- `admin/` — password-protected research dashboard frontend

With GitHub Pages enabled for `Bferwerda/sasuf`, the expected URLs are:

- `https://bferwerda.github.io/sasuf/SE/`
- `https://bferwerda.github.io/sasuf/SA/`
- `https://bferwerda.github.io/sasuf/admin/`

Both survey versions load the same questionnaire from `shared/app.js`. Country/site is fixed by each folder's `config.js`, so respondents never select their country.

## Main design change in v5

Each academic scenario now asks participants to choose a level of assistance on a five-step slider:

1. No AI assistance
2. Conventional digital tool
3. Targeted / lightweight AI
4. General-purpose GenAI
5. Advanced GenAI

This is followed by 1–7 ratings of appropriateness, meaningful value, adequacy of a simpler option, learning support, and whether computing/resource use influences the choice. The slider is explicitly described as an assistance/capability scale rather than a precise energy scale.

The baseline section was expanded to cover current use, purposes, access/cost, institutional guidance, academic-integrity concern, language support, AI literacy, verification, privacy knowledge, sustainability, lower-resource preference, and career relevance.

## Contacts configured

### Sweden
- Bruce Ferwerda — Jönköping University — bruce.ferwerda@ju.se
- Alan Said — University of Gothenburg — alan.said@gu.se

### South Africa
- Nobert Jere — University of Fort Hare — NJere@ufh.ac.za
- Nosipho Mavuso — Walter Sisulu University — nmavuso@wsu.ac.za

Before recruitment, replace the bracketed ethics reference and privacy/data-storage text in both `SE/config.js` and `SA/config.js`.

## Backend

Both survey pages submit to:

`https://wabisabitech.hk/sasuf/api/submit.php`

The API routes fixed `study_site` values to `responses_SE` or `responses_SA`.

The MySQL tables do not need new questionnaire columns for v5 because the complete submission is stored in `response_json`. The updated backend package changes validation, statistics, and CSV export to understand the new v5 variables.

## Mobile design

The survey is built mobile-first for the response controls: native range sliders have large touch targets, scenario cards collapse to one column, scenario illustrations become non-sticky, response choices stack vertically, buttons reach at least touch-friendly heights, and no questionnaire table/layout requires horizontal page scrolling.
