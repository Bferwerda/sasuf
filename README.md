# SASUF comparative GenAI student survey — v10

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

## v10 study design

Ten academic scenarios are presented in randomized order for each participant:

1. Proofreading your own text
2. Understanding a difficult concept
3. Working through an academic reading
4. Brainstorming ideas
5. Language support
6. Finding academic sources
7. Organising information
8. Getting feedback on your own work
9. Drafting assessed work
10. Interpreting data or visual information

The set spans editing, tutoring, comprehension, ideation, accessibility/language support, evidence discovery, synthesis, critique, assessed-content generation, and analytical reasoning.

### Per-scenario measures

Each scenario first asks what type of assistance the participant would normally choose:

1. No AI assistance
2. Conventional digital tool
3. Specialized AI tool
4. General-purpose GenAI
5. Advanced / reasoning GenAI

These are **assistance categories**, not an environmental-impact scale. They should be analysed as categorical/ordinal choices; the dashboard reports their distribution rather than a mean.

Participants then rate:

- difficulty completing the task satisfactorily without GenAI
- importance of getting a highly accurate/high-quality result
- confidence judging whether AI output is correct and appropriate
- appropriateness of AI use
- meaningful added value of AI
- adequacy of a simpler digital/non-AI option
- whether AI supports rather than replaces learning

Finally, each scenario contains a separate 1–7 **resource–capability trade-off**:

- 1 = strongly prefer the simpler option requiring fewer computing resources
- 4 = neutral / depends
- 7 = strongly prefer the more capable AI option requiring more computing resources

The trade-off prompt does **not** assume the simpler option is adequate. Adequacy is measured independently, preventing the trade-off wording from contaminating that construct.

The resource trade-off is shown after the task ratings so explicit sustainability/resource information does not prime the preceding appropriateness/value/difficulty measures.

## Participant/context measures

To support a defensible Sweden–South Africa comparison while limiting identifiability, the survey now records grouped rather than exact demographics:

- age group
- gender, including `Prefer not to say`
- study level
- year in current programme
- broad field of study
- whether the programme language is one of the participant's first/home languages
- comfort studying in the programme language

It also asks whether the participant has received **formal university teaching/training on effective GenAI use**. This is distinct from whether the institution has merely issued rules or guidance.

## Baseline coverage

The survey covers current use and purposes, paid access, university-provided GenAI access, internet and cost constraints, perceived equality of access, institutional guidance, formal GenAI training, academic-integrity concern, language support, local/cultural mismatch, perceived AI literacy, output verification, privacy knowledge, sustainability attitudes, preference for lower-resource options, and career relevance.

## Participant information / data storage

The visible study introduction no longer contains a placeholder ethics-reference field. It states that the research dataset intentionally avoids names, email addresses, student numbers, IP addresses, and browser identifiers; uses a random study identifier; stores submitted answers in the password-protected research database; and may temporarily keep an unfinished draft in the participant's own browser. Routine web-server logs are described separately from the research dataset. Confirm that the final wording meets the participating institutions' ethics/data-management requirements before recruitment.

## Contacts configured

### Sweden
- Bruce Ferwerda — Jönköping University — bruce.ferwerda@ju.se
- Alan Said — University of Gothenburg — alan.said@ait.gu.se

### South Africa
- Nobert Jere — University of Fort Hare — njere@ufh.ac.za
- Nosipho Mavuso — Walter Sisulu University — mavuso.nosipho@gmail.com

## Backend

Both survey pages submit to:

`https://wabisabitech.hk/sasuf/api/submit.php`

The API routes fixed `study_site` values to `responses_SE` or `responses_SA`.

Existing MySQL response tables do not need questionnaire-specific schema changes because the complete submission is stored in `response_json`. Replace `submit.php`, `admin-api.php`, and the standalone `admin.php` with the v10 versions.

The v10 admin API deliberately reports and exports only `2026-09-v10` responses so previous test/pilot versions cannot contaminate the deployed dataset.

## Mobile design

The survey is mobile-first: large native range controls, 48px-class touch targets, one scenario per page, a one-column scenario layout on phones, stacked choices, compact task illustrations, full-width primary navigation, and responsive trade-off labels. Admin tables scroll horizontally inside their own containers rather than causing page-level overflow.

## v10 explanatory-context additions

The v10 instrument adds one non-identifying educational-background item (whether most pre-university education was completed in the current study country) and four 1–7 explanatory measures: peer GenAI-use norm, perceived lecturer support for responsible GenAI use, preference for clear GenAI rules, and concern about over-reliance / loss of independent academic capability. They are included in backend validation, dashboard summaries, and the flat analysis export.


## v10 participant information

The participant introduction now contains separate **Ethics and participant rights** and **Data storage and privacy** sections. It does not claim a formal ethics approval number. The storage text accurately describes HTTPS submission, the project MySQL database, the variables stored in the research dataset, temporary browser draft storage, possible routine server logs, restricted research-team access, de-identified reporting, and institution-governed retention/disposal.
