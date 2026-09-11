# SASUF v10 data dictionary

## Top-level

- `study_site`: `SE` or `SA`
- `session_id`: random UUID
- `study_version`: `2026-09-v10`
- `institution`, `study_level`, `discipline`

## `payload`

- `study_site`
- `started_at`
- `submitted_at_client`
- `scenario_order`: randomized array of the ten scenario IDs shown to that participant

## `payload.context`

- `institution`
- `studyLevel`
- `programmeYear`: `1`, `2`, `3`, `4+`, or `Not applicable`
- `discipline`
- `ageGroup`: `18-20`, `21-24`, `25-29`, `30-39`, `40+`, or `Prefer not to say`
- `gender`: `Woman`, `Man`, `Non-binary or another gender`, or `Prefer not to say`
- `programmeLanguageFirst`: `Yes`, `No`, or `Prefer not to say`
- `preUniversitySameCountry`: whether most pre-university education was completed in the current study country (Yes / No / Prefer not to say)
- `languageComfort`: 1–7
- `studySite`

## `payload.baseline`

Categorical / multiple response:
- `useFrequency`
- `purposes`: array of purpose codes
  - `explain`
  - `brainstorm`
  - `summarise`
  - `write`
  - `proofread`
  - `translate`
  - `code_data`
  - `sources`
  - `search`
  - `feedback`
  - `other`
  - `not_using`
- `paidAccess`: Yes / No / Unsure
- `institutionalAccess`: Yes / No / Unsure
- `guidance`: Yes / No / Unsure
- `formalTraining`: Yes / No / Unsure
- `resourceAwareness`: Yes / No / Unsure
- `localContextMismatch`: Yes / No / Unsure / Not applicable

1–7 agreement scales:
- `internetAccess`
- `costConstraint`
- `guidanceUnderstanding`
- `integrityConcern`
- `languageBenefit`
- `equalAccess`
- `peerNorm`
- `lecturerNorm`
- `rulePreference`
- `aiConfidence`
- `aiLiteracy`
- `verifyOutput`
- `privacyKnowledge`
- `sustainabilityImportance`
- `lowerResourcePreference`
- `dependencyConcern`
- `careerImportance`

## `payload.scenarios`

Scenario IDs:
- `proofreading`
- `concept_explanation`
- `reading_summary`
- `brainstorming`
- `language_support`
- `academic_sources`
- `organising_information`
- `feedback_work`
- `assessed_writing`
- `data_interpretation`

Each scenario contains:

- `assistanceLevel`: 1–5 categorical assistance choice
  - 1 No AI assistance
  - 2 Conventional digital tool
  - 3 Specialized AI tool
  - 4 General-purpose GenAI
  - 5 Advanced / reasoning GenAI
- `difficulty`: 1–7 — difficulty completing satisfactorily without GenAI
- `stakes`: 1–7 — importance of highly accurate/high-quality outcome
- `evaluation`: 1–7 — confidence judging AI output correctness/appropriateness
- `appropriate`: 1–7
- `value`: 1–7
- `alternative`: 1–7 — adequacy of simpler option
- `learning`: 1–7
- `resourceTradeoff`: 1–7
  - 1 = strongly prefer simpler option / fewer computing resources
  - 4 = neutral / depends
  - 7 = strongly prefer more capable AI / more computing resources

`assistanceLevel` should not be interpreted as a quantitative environmental-impact scale. For descriptive analysis, use category distributions or a categorical/ordinal model. `resourceTradeoff` is the direct hypothetical capability/resource preference measure.

## `payload.reflection`

- `decisionFactors`: 1–5 selected factor codes
  - `time`
  - `complexity`
  - `quality`
  - `stakes`
  - `oversight`
  - `learning`
  - `language`
  - `alternative`
  - `cost_access`
  - `integrity`
  - `privacy`
  - `sustainability`
  - `habit`
- `worthUsing`
- `avoidUsing`
- `guidanceWanted`
- `otherComments`

## v10 explanatory-context measures

All four are 1–7 agreement ratings.

- `peerNorm`: perceived prevalence of GenAI use for coursework among programme peers.
- `lecturerNorm`: perceived lecturer support for responsible GenAI use.
- `rulePreference`: preference for clear rules about when GenAI is and is not allowed.
- `dependencyConcern`: concern that over-reliance on GenAI could reduce independent academic capability.
