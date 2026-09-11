# SASUF v6 data dictionary

## Top-level

- `study_site`: `SE` or `SA`
- `session_id`: anonymous UUID
- `study_version`: `2026-09-v6`
- `institution`, `study_level`, `discipline`

## `payload`

- `study_site`
- `started_at`
- `submitted_at_client`
- `scenario_order`: randomized array of the eight scenario IDs shown to that participant

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
- `paidAccess`: Yes / No / Unsure
- `institutionalAccess`: Yes / No / Unsure — university-provided GenAI service/licence
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
- `factual_information`
- `organising_information`
- `assessed_writing`

Each scenario contains:
- `assistanceLevel`: 1–5
  - 1 No AI assistance
  - 2 Conventional digital tool
  - 3 Specialized AI tool
  - 4 General-purpose GenAI
  - 5 Advanced / reasoning GenAI
- `resourceTradeoff`: 1–7
  - 1 = strongly prefer simpler option / fewer computing resources
  - 4 = neutral / depends
  - 7 = strongly prefer more capable AI / more computing resources
- `appropriate`: 1–7
- `value`: 1–7
- `alternative`: 1–7
- `learning`: 1–7

The resource–capability item is explicitly hypothetical and is the direct sustainability trade-off measure. `assistanceLevel` should not be interpreted as an environmental-impact scale.

## `payload.reflection`

- `decisionFactors`: 1–5 selected factor codes
- `worthUsing`
- `avoidUsing`
- `guidanceWanted`
- `otherComments`
