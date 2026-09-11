# SASUF v5 data dictionary

## Top-level

- `study_site`: `SE` or `SA`
- `session_id`: anonymous UUID
- `study_version`: `2026-09-v5`
- `institution`, `study_level`, `discipline`

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
- `guidance`: Yes / No / Unsure
- `resourceAwareness`: Yes / No / Unsure
- `localContextMismatch`: Yes / No / Unsure / Not applicable

1–7 agreement scales:
- `internetAccess`
- `costConstraint`
- `guidanceUnderstanding`
- `integrityConcern`
- `languageBenefit`
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
  - 3 Targeted / lightweight AI
  - 4 General-purpose GenAI
  - 5 Advanced GenAI
- `appropriate`: 1–7
- `value`: 1–7
- `alternative`: 1–7
- `learning`: 1–7
- `resourceInfluence`: 1–7
- `reasons`: 1–3 selected reason codes

## `payload.reflection`

- `worthUsing`
- `avoidUsing`
- `guidanceWanted`
- `otherComments`
