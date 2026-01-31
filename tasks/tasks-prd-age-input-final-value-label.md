# Task List: Age Input for Final Value Label
*From: `prd-age-input-final-value-label.md`*

## Overview
Add `currentAge` to the account model, capture it in the account form with validation, compute the final-age label in the summary, persist it via existing local storage flow, and cover with unit tests.

## Progress
**Last Updated:** 2026-01-30
**Current:** Complete
**Completed:** 17/17 tasks (100%)

## Relevant Files
### Completed ✓
- `src/components/AccountForm.tsx` - Age input + validation - ✓ Tasks 2.1–2.4
- `src/components/AccountSummary.tsx` - Final label helper usage - ✓ Task 3.1
- `src/components/AccountCard.tsx` - Pass age + term - ✓ Task 3.2
- `src/App.tsx` - Seed + normalize age - ✓ Tasks 3.3–3.4
- `src/utils/ageLabel.ts` - Label helpers + docs - ✓ Tasks 1.2, 5.1
- `src/utils/ageLabel.test.ts` - Helper tests - ✓ Tasks 1.3–1.4
- `src/components/AccountSummary.test.tsx` - Label update test - ✓ Task 4.1
- `src/components/AccountForm.test.tsx` - Validation test - ✓ Task 4.2

### In Progress 🔄
- None

## Architecture Decisions
- **Age stored per account** in `AccountInput` to align with existing per-account settings and persistence.
- **Label logic centralized** in a small helper (e.g., `getFinalAgeLabel`) to keep `AccountSummary` simple and testable.
- **Validation enforced at input level** to avoid polluting projections with invalid values.

## Relevant Files

### New Files
- `src/utils/ageLabel.ts` - Label formatting + validation helpers.
- `src/utils/ageLabel.test.ts` - Unit tests for label formatting and validation.

### Files to Modify
- `src/types/investment.ts` - Add `currentAge?: number` to `AccountInput`.
- `src/components/AccountForm.tsx` - Add “Current age” input and validation handling.
- `src/components/AccountSummary.tsx` - Use age label helper for “Final value” label.
- `src/components/AccountCard.tsx` - Pass age + term into summary if needed.
- `src/App.tsx` - Seed default accounts with `currentAge` and normalize persisted data.

### Testing
- Unit: `npx jest src/utils/ageLabel.test.ts`
- All: `npx jest`

## Tasks

- [x] 1.0 Foundation & Setup
  - [x] 1.1 Update `AccountInput` with `currentAge?: number` in `src/types/investment.ts`.
  - [x] 1.2 Create `src/utils/ageLabel.ts` with helpers:
    - `isValidAge(age: number): boolean`
    - `getFinalAgeLabel({ currentAge, termYears }): string`.
  - [x] 1.3 Write unit tests in `src/utils/ageLabel.test.ts` for boundaries and label output.
  - [x] 1.4 Add test cases for empty/invalid ages returning default label.

- [x] 2.0 Core Component Development
  - [x] 2.1 Add “Current age” field to `AccountForm` near term input with proper `label`/`id`.
  - [x] 2.2 Extend `NumericInputs` and numeric input handling for `currentAge`.
  - [x] 2.3 Add inline validation message for invalid age (0–120) and prevent invalid saves.
  - [x] 2.4 Ensure empty age clears display but does not break projections.

- [x] 3.0 Integration & State
  - [x] 3.1 Update `AccountSummary` to use `getFinalAgeLabel` when rendering “Final value” label.
  - [x] 3.2 Pass `currentAge` and `termYears` into summary (direct props or derived in summary).
  - [x] 3.3 Update account seed data in `App.tsx` with a default `currentAge`.
  - [x] 3.4 Confirm local storage persistence with `currentAge` in load/save flows.

- [x] 4.0 Testing & Validation
  - [x] 4.1 Add UI-focused tests (if existing pattern): update age/term updates label.
  - [x] 4.2 Verify validation prevents values outside 0–120.
  - [x] 4.3 Manual QA: clear age, ensure label reverts to “Final value”.

- [x] 5.0 Polish & Documentation
  - [x] 5.1 Add concise helper doc comments for non-obvious logic in `ageLabel` utilities.
  - [x] 5.2 Confirm a11y: `htmlFor`/`id` link and no ARIA regressions.

## Validation Checklist
- [x] All PRD requirements covered
- [x] Label updates with age + term changes
- [x] Age persists across refresh
- [x] Tests added for helpers and edge cases
- [x] Accessibility verified

## Estimated Effort
- Total: 5 parent tasks, 17 sub-tasks
- Time: 4-6 hours
- Can parallelize: 1.1–1.4 with 2.1–2.2 after types are updated

---
**Ready:** Respond "Start" to begin or provide feedback.
