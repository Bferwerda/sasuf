# SASUF v7 data dictionary

## Top-level

- `study_site`: `SE` or `SA`
- `session_id`: anonymous UUID
- `study_version`: `2026-09-v7`
- `institution`, `study_level`, `discipline`

## `payload`

- `study_site`
- `started_at`
- `submitted_at_client`
- `scenario_order`: randomized array of the ten scenario IDs shown to that participant

## `payload.context`

- `institution`
- `studyLevel`
- `discipline`
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
- `resourceAwareness`: Yes / No / Unsure
- `localContextMismatch`: Yes / No / Unsure / Not applicable

1–7 agreement scales:
- `internetAccess`
- `costConstraint`
- `guidanceUnderstanding`
- `integrityConcern`
- `languageBenefit`
- `equalAccess`
- `aiConfidence`
- `aiLiteracy`
- `verifyOutput`
- `privacyKnowledge`
- `sustainabilityImportance`
- `lowerResourcePreference`
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

`assistanceLevel` should not be interpreted as a quantitative environmental-impact scale. For descriptive analysis, use category distributions. `resourceTradeoff` is the direct hypothetical capability/resource preference measure.

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
