# SASUF GenAI Student Survey — v17 data dictionary

## Design
Each respondent is randomly assigned **5 of the 10** academic scenarios. `payload.scenario_order` records the five scenarios and their presentation order.

## Context
`institution`, `studyLevel`, `discipline`, `age`, `gender`, `programmeLanguageFirst`, `languageComfort`.

## Current GenAI use / access
`useFrequency`, `purposes`, `paidAccess`, `institutionalAccess`, `formalTraining`, `resourceAwareness`, `localContextMismatch`.

## Access, guidance and inclusion ratings (1–7)
`internetAccess`, `costConstraint`, `guidanceUnderstanding`, `integrityConcern`, `languageBenefit`, `equalAccess`.

## AI literacy / sustainability / future orientation ratings (1–7)
`aiLiteracy`, `verifyOutput`, `privacyKnowledge`, `sustainabilityImportance`, `lowerResourcePreference`, `dependencyConcern`, `careerImportance`.

## Scenario pool
`proofreading`, `concept_explanation`, `reading_summary`, `brainstorming`, `language_support`, `academic_sources`, `organising_information`, `feedback_work`, `assessed_writing`, `data_interpretation`.

Only the five scenarios assigned to a respondent are present in `payload.scenarios`.

### Scenario fields
- `assistanceLevel` (1–5)
- `difficulty` (1–7)
- `stakes` (1–7)
- `value` (1–7)
- `alternative` (1–7)
- `learning` (1–7)
- `resourceTradeoff` (1–7)

## Reflection
- `decisionFactors`: 1–5 selected factors
- `worthUsing`: required combined reflection on when more capable GenAI is justified and when a simpler option is sufficient
- `guidanceWanted`: optional university-support reflection

## Timing
`active_seconds`, `elapsed_seconds`, `step_seconds`, `median_scenario_seconds`, `survey_sessions`, `idle_limit_seconds`.
