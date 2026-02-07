# PRD: Global Term Input

## Overview

Currently, the investment term (`termYears`) is a per-account field — each account has its own term input inside `AccountForm`. This creates unnecessary repetition since most users want to project all accounts over the same time horizon. This feature moves the term input to a single global control in the app header, so all accounts share one projection term.

## Business Context

- **Problem:** Users must manually set the same term on every account. If they want to change the projection horizon, they must edit each account individually, which is tedious and error-prone.
- **Success Metrics:** Fewer user interactions to set up a multi-account projection; consistent term across all accounts by default.
- **Priority:** Medium

## Target Users

Individual investors who use the tracker to model multiple investment accounts over a common time horizon (e.g., "How does my portfolio look in 20 years?").

## User Stories

1. As a user, I want to set a single investment term so that all my accounts project over the same time horizon without editing each one.
2. As a user, I want the global term to persist across sessions so I don't have to re-enter it each time.
3. As a user, I want my contribution end months to auto-adjust when I change the global term so my contributions stay aligned with the projection length.
4. As a user, I want Goal Mode to use the same global term so I don't have to configure term in two places.
5. As a user, I want to see the term displayed in account list rows so I can confirm all accounts share the same horizon.

## Functional Requirements

### Core Functionality

1. **Remove `termYears` from `AccountInput`**
   - Remove the `termYears` field from the `AccountInput` type.
   - Remove the term input from `AccountForm`.
   - All references to `account.termYears` must read from the global term instead.

2. **Add global `termYears` state to `App`**
   - New state variable in `App.tsx`: `termYears: number` (default: `10`).
   - Persisted to `localStorage` under a dedicated key (e.g., `investment-tracker-term-years`).
   - Cleared on "Reset defaults".

3. **Global term input component**
   - A new `GlobalTermInput` component placed in the header controls (next to `CurrentAgeInput` and `InflationControls`).
   - Follows the same controlled-input pattern as `CurrentAgeInput`.
   - Label: "Term (years)".
   - Validation: min `1`, max `100`, whole or half-year increments.
   - Includes `aria-describedby` help text.

4. **Contribution end month auto-adjustment**
   - When the global term increases and an account's `contribution.endMonth` equals the previous total months, extend it to the new total months.
   - When the global term decreases, clamp `contribution.startMonth` and `contribution.endMonth` to the new total months.
   - Reuse existing `adjustContributionRange` logic from `accountCardHelpers.ts`, adapted to work with a global term change across all accounts.

5. **Unify Goal Mode term with global term**
   - Remove `termYears` from `GoalState`.
   - Goal calculations that reference `goalState.termYears` should read the global `termYears` instead.
   - Remove the "Term (years)" input from `GoalInputPanel` when `calculationType === 'contribution'`.

### Data Requirements

- **Global term state:** `number` (default `10`), persisted in `localStorage`.
- **Migration:** On load, if accounts have per-account `termYears`, use the maximum value to seed the global term. Then strip `termYears` from each account before saving.
- **Validation:** `1 ≤ termYears ≤ 100`.

### User Interface

- **Header controls:** `GlobalTermInput` sits alongside `CurrentAgeInput` and `InflationControls` in `.app__header-controls`.
- **AccountForm:** The "Term (years)" field group and its associated numeric input handling (`handleTermChange`, `termYears` in `NumericInputs`) are removed.
- **AccountListRow collapsed view:** The "Term" metric column (`account.termYears`) now reads from the global term prop. Consider whether to keep or remove it (since all accounts share the same value, it may be redundant — remove it).
- **GoalInputPanel:** Remove the term input field; goal calculations use the global term directly.
- **AccountSummary:** `termYears` prop comes from the global term, not per-account.

### Integration Points

- `buildProjection(input)` in `projections.ts` currently reads `input.termYears`. Must be updated to accept `termYears` as a separate parameter or have callers inject it into the input.
- `applyInflationToProjection` and `applyInflationToTotals` receive `termYears` — callers must pass the global value.
- `contributionRoom.ts` uses `account.termYears` — must receive global term.
- `goalCalculations.ts` uses `termYears` from `GoalState` — must receive global term.
- `ageLabel.ts` `getFinalAgeLabel` receives `termYears` — callers pass global term.
- `accountCardHelpers.ts` `adjustContributionRange` logic must be adapted for bulk adjustment when global term changes.

### Security & Privacy

- No authentication changes.
- No sensitive data introduced.
- Input validation prevents unreasonable term values.

### Performance

- No measurable impact; projections are already computed per-account on state change.
- Changing the global term triggers a single re-render of all accounts (same as today when any account changes).

## Non-Functional Requirements

### Accessibility

- `GlobalTermInput` must have a visible `<label>`, `aria-describedby` for help text, and `aria-invalid` for validation errors.
- Keyboard navigable (already handled by native `<input type="number">`).

### Error Handling

- Invalid input (empty, NaN, out of range) shows inline help text; the global term falls back to the last valid value.
- On localStorage parse failure, fall back to the default term (`10`).

### Testing

- **Unit tests:**
  - `GlobalTermInput` renders, validates, and calls `onChange` correctly.
  - `adjustContributionRange` bulk adjustment works for term increase and decrease.
  - `buildProjection` works with externally provided `termYears`.
  - Goal calculations use the global term.
  - `getFinalAgeLabel` continues to work with global term.
  - localStorage persistence: save, load, clear, migration from per-account term.
- **Integration tests:**
  - Changing global term updates all account projections.
  - Contribution end months auto-extend/clamp correctly.
  - "Reset defaults" clears global term to default.
- **Existing test updates:**
  - `AccountForm.test.tsx` — remove term-related tests.
  - `AccountCard.test.tsx`, `AccountListRow.test.tsx`, `AccountSummary.test.tsx` — pass global term as prop.
  - `accountCardHelpers.test.ts` — update `adjustContributionRange` tests.
  - `projections.test.ts` — update `buildProjection` calls.
  - `goalCalculations.test.ts` — remove `goalState.termYears` references.
  - `contributionRoom.test.ts` — pass global term.
  - `ageLabel.test.ts` — no changes needed (already receives `termYears` as param).

## Non-Goals

- Per-account term override (all accounts must share the global term).
- Fractional-month term precision (months are derived as `Math.round(termYears * 12)`).
- Changing the chart X-axis to a unified view across accounts (out of scope).

## Technical Approach

### Architecture

- **State:** `termYears` becomes a top-level `useState` in `App.tsx`, alongside `currentAge` and `inflationState`.
- **Props:** `termYears` is passed down to `AccountCard`, `AccountListRow`, `AccountForm`, `AccountSummary`, `GoalInputPanel`, and any utility that needs it.
- **Type changes:**
  - Remove `termYears` from `AccountInput`.
  - Remove `termYears` from `GoalState` and `DEFAULT_GOAL_STATE`.
  - Add `termYears` parameter to `buildProjection` (or create a new input type that includes it).
  - Update `AccountUpdatePayload` — `changes` no longer includes `termYears`.

### Technology Alignment

- React + TypeScript (existing stack).
- No new dependencies.
- Follows the `CurrentAgeInput` pattern for the new component.
- Uses existing `localStorage` persistence helpers from `utils/storage.ts`.

### Database

- No database; localStorage only.
- New key: `investment-tracker-term-years`.
- Migration: on first load with existing accounts, derive global term from `Math.max(...accounts.map(a => a.termYears))`.

## Design Considerations

- Match the visual style of `CurrentAgeInput` (label + number input + help text).
- Header controls row may need minor CSS adjustment to accommodate a third control.
- Removing term from `AccountForm` simplifies the form and reduces cognitive load.

## Implementation Phases

### Phase 1: MVP

1. Add global `termYears` state, persistence, and `GlobalTermInput` component.
2. Remove `termYears` from `AccountInput` and `AccountForm`.
3. Thread global `termYears` through all components and utilities.
4. Adapt contribution end-month auto-adjustment for global term changes.
5. Unify Goal Mode to use global term.
6. Update all existing tests.

### Phase 2: Enhancements

- Consider showing the global term in the header totals area (e.g., "Grand total after 20 years").
- Potential per-account term override toggle (if user feedback demands it).

## Success Criteria

### Definition of Done

- Functional requirements met.
- All existing tests updated and passing.
- New unit tests for `GlobalTermInput` and adapted utilities.
- Accessibility verified (label, aria attributes, keyboard nav).
- localStorage persistence works (save, load, clear, migration).

### Acceptance Criteria

1. A single "Term (years)" input in the header controls all account projections.
2. Changing the global term immediately updates all account projections, charts, and summaries.
3. Contribution end months auto-extend when term grows and clamp when term shrinks.
4. Goal Mode calculations use the global term (no separate term input in Goal Settings).
5. "Reset defaults" resets the global term to `10`.
6. The global term persists across page reloads.
7. Existing accounts with per-account terms are migrated to the global term on first load.

## Dependencies & Risks

### Dependencies

- None external. All changes are within the existing React + TypeScript codebase.

### Risks & Mitigations

- **Breaking localStorage data:** Users with saved accounts have `termYears` per-account. **Mitigation:** Migration logic on load derives global term from max per-account term, then strips the field.
- **Wide refactor surface:** `termYears` is referenced in ~25 files. **Mitigation:** TypeScript compiler will catch all broken references once the field is removed from the type.
- **Contribution month edge cases:** Bulk-adjusting contribution ranges when term changes could produce unexpected behavior. **Mitigation:** Reuse the proven `adjustContributionRange` logic; add thorough tests.

## Open Questions

None — all critical decisions resolved during clarification.

## Assumptions

- All accounts should always share the same projection term (no per-account override).
- The default global term of `10` years matches the current `buildNewAccount` default.
- Migration from per-account term uses `Math.max()` to preserve the longest horizon.
- Goal Mode's "Calculate term" option (find how long to reach goal) remains functional — it calculates required months but doesn't change the global term.
