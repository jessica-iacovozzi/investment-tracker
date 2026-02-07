# Task List: Global Term Input
*From: `prd-global-term-input.md`*

## Overview

Move `termYears` from a per-account field to a single global state in `App.tsx`. Create a `GlobalTermInput` component in the header, thread the global value through all components and utilities, remove the per-account term input from `AccountForm`, unify Goal Mode to use the global term, and update all tests.

## Architecture Decisions

- **State location:** `termYears` becomes a top-level `useState<number>` in `App.tsx`, following the same pattern as `currentAge` and `inflationState`.
- **Prop threading:** Global `termYears` is passed as a prop to `AccountCard`, `AccountListRow`, `AccountListView`, `AccountForm`, `AccountSummary`, and `GoalInputPanel`.
- **Projection input:** `buildProjection` will receive `termYears` as a separate parameter (added to the function signature) rather than reading it from `AccountInput`.
- **Contribution room:** Functions like `calculateAvailableRoom`, `getContributionRoomResult`, `calculateMonthsOfExcess`, and `getAnnualContributionRoomLimits` that read `account.termYears` will receive `termYears` as an explicit parameter.
- **Migration:** On first load, if saved accounts contain `termYears`, derive the global term from `Math.max(…accounts.map(a => a.termYears))` and persist it. The field is then ignored on accounts going forward.
- **Contribution adjustment on term change:** Reuse existing `adjustContributionRange` logic from `accountCardHelpers.ts`, adapted for bulk application across all accounts when the global term changes.

## Relevant Files

### New Files
- `src/components/GlobalTermInput.tsx` — Global term input component (header control)
- `src/components/GlobalTermInput.test.tsx` — Unit tests for GlobalTermInput

### Files to Modify
- `src/types/investment.ts` — Remove `termYears` from `AccountInput`
- `src/types/goal.ts` — Remove `termYears` from `GoalState` and `DEFAULT_GOAL_STATE`
- `src/App.tsx` — Add global `termYears` state, persistence, migration, thread as prop
- `src/utils/storage.ts` — Add `loadTermYears`, `saveTermYears`, `clearTermYears`
- `src/utils/projections.ts` — Update `buildProjection` to accept `termYears` param
- `src/utils/contributionRoom.ts` — Update functions to accept `termYears` param instead of reading from account
- `src/utils/goalCalculations.ts` — Remove `goalState.termYears` usage, use global term
- `src/utils/inflation.ts` — No changes needed (already receives `termYears` as param)
- `src/utils/ageLabel.ts` — No changes needed (already receives `termYears` as param)
- `src/utils/accountCardHelpers.ts` — Adapt `adjustContributionRange` for global term changes
- `src/utils/sharedContributionRoom.ts` — Update functions that reference `account.termYears`
- `src/utils/accountNormalization.ts` — No changes needed (doesn't reference `termYears`)
- `src/components/AccountForm.tsx` — Remove term input field group and `handleTermChange`; receive `termYears` as prop for `totalMonths`
- `src/components/AccountCard.tsx` — Receive and thread `termYears` prop
- `src/components/AccountListRow.tsx` — Receive and thread `termYears` prop; remove term from collapsed metric
- `src/components/AccountListView.tsx` — Receive and thread `termYears` prop
- `src/components/AccountSummary.tsx` — Receive `termYears` from prop (already does, no type change needed)
- `src/components/GoalInputPanel.tsx` — Remove term input when `calculationType === 'contribution'`

### Test Files to Update
- `src/components/AccountForm.test.tsx` — Remove term-related tests, remove `termYears` from `buildAccount`
- `src/components/AccountCard.test.tsx` — Pass `termYears` prop, remove from account fixture
- `src/components/AccountListRow.test.tsx` — Pass `termYears` prop, remove from account fixture
- `src/components/AccountSummary.test.tsx` — Already receives `termYears` as prop; remove from account fixture if used
- `src/components/GoalInputPanel.test.tsx` — Remove `termYears` from goal state fixtures
- `src/utils/projections.test.ts` — Update `buildProjection` calls to pass `termYears`
- `src/utils/goalCalculations.test.ts` — Update to use global term param
- `src/utils/contributionRoom.test.ts` — Pass `termYears` param to functions
- `src/utils/sharedContributionRoom.test.ts` — Update fixtures, pass `termYears` where needed
- `src/utils/accountNormalization.test.ts` — Remove `termYears` from `baseAccount` fixture
- `src/utils/accountCardHelpers.test.ts` — Update tests for adapted `adjustContributionRange`
- `src/utils/ageLabel.test.ts` — No changes needed

### Testing
- Unit: `npx vitest run src/components/GlobalTermInput.test.tsx`
- All: `npx vitest run`

## Tasks

- [x] 1.0 Foundation: Types & Storage
  - [x] 1.1 Remove `termYears` from `AccountInput` in `src/types/investment.ts`
  - [x] 1.2 Remove `termYears` from `GoalState` and `DEFAULT_GOAL_STATE` in `src/types/goal.ts`
  - [x] 1.3 Add `loadTermYears`, `saveTermYears`, `clearTermYears` to `src/utils/storage.ts` (follow existing `loadCurrentAge`/`saveCurrentAge` pattern in `App.tsx`, or add to `storage.ts`)
  - [x] 1.4 Update `src/utils/accountNormalization.test.ts` — remove `termYears` from `baseAccount` fixture

- [x] 2.0 Core Utilities: Thread `termYears` as Parameter
  - [x] 2.1 Update `buildProjection` in `src/utils/projections.ts` to accept `termYears` as a second parameter (e.g., `buildProjection(input, termYears)`) instead of reading `input.termYears`
  - [x] 2.2 Update `src/utils/projections.test.ts` — pass `termYears` to all `buildProjection` calls
  - [x] 2.3 Update `src/utils/contributionRoom.ts` — add explicit `termYears` parameter to `calculateAvailableRoom`, `getAnnualContributionRoomLimits`, `getAnnualProjectedContributions` (remove default of `account.termYears`), `calculateMonthsOfExcess`, `getOverContributionDetails`, `getContributionRoomResult`, `getRemainingContributionRoomForGoal`
  - [x] 2.4 Update `src/utils/contributionRoom.test.ts` — pass `termYears` to all updated functions
  - [x] 2.5 Update `src/utils/sharedContributionRoom.ts` — thread `termYears` through `getCombinedProjectedContributions`, `getSharedAvailableRoom`, `getSharedOverContributionDetails`, `getAggregatedContributionSummary` (remove references to `account.termYears` / `acc.termYears`)
  - [x] 2.6 Update `src/utils/sharedContributionRoom.test.ts` — pass `termYears`, remove from account fixtures
  - [x] 2.7 Update `src/utils/accountCardHelpers.ts` — adapt `adjustContributionRange` to work with global term change (receive `previousTermYears` and `newTermYears` instead of reading from account)
  - [x] 2.8 Update `src/utils/accountCardHelpers.test.ts` — update tests for new signature
  - [x] 2.9 Update `src/utils/goalCalculations.ts` — all functions that build projections or call contribution room functions must pass `termYears` explicitly; remove any `{ ...account, termYears }` patterns that set `termYears` on account objects
  - [x] 2.10 Update `src/utils/goalCalculations.test.ts` — remove `termYears` from account fixtures, pass as parameter

- [x] 3.0 Global Term Input Component
  - [x] 3.1 Create `src/components/GlobalTermInput.tsx` — controlled number input following `CurrentAgeInput` pattern; label "Term (years)", min 1, max 100, `aria-describedby` help text, validation error state
  - [x] 3.2 Create `src/components/GlobalTermInput.test.tsx` — renders correctly, validates input range, calls `onChange` with parsed number, shows error for invalid input

- [x] 4.0 App Integration: State, Persistence & Prop Threading
  - [x] 4.1 Update `src/App.tsx` — add `termYears` state with `useState<number>`, `loadTermYears`/`saveTermYears` persistence, migration from per-account term on first load, `clearTermYears` on reset, pass `termYears` to all child components
  - [x] 4.2 Update `src/App.tsx` — add `GlobalTermInput` to `.app__header-controls`; wire `onChange` to `setTermYears`
  - [x] 4.3 Update `src/App.tsx` — adapt `handleAccountUpdate` to run bulk `adjustContributionRange` when global term changes (or handle in a `useEffect` on `termYears`); update `buildNewAccount` to remove `termYears`; update `seedAccounts` to remove per-account `termYears`; fix `maxTermYears` (now just `termYears`), `grandTotals`, `goalProjectedTotals`, `goalCalculationResult`, and `allocations` to use global `termYears`
  - [x] 4.4 Update `src/App.tsx` — remove `termYears` from `GoalState` usage: `goalState.termYears` → global `termYears` in `goalProjectedTotals`, `goalCalculationResult`, and `allocations` computations

- [x] 5.0 Component Updates: Remove Per-Account Term
  - [x] 5.1 Update `src/components/AccountForm.tsx` — add `termYears` prop; remove `termYears` from `NumericInputs`; remove `handleTermChange`; remove the term `<input>` from the JSX; compute `totalMonths` from the `termYears` prop; remove `termYears` from `buildNumericInputs`
  - [x] 5.2 Update `src/components/AccountForm.test.tsx` — remove `termYears` from `buildAccount` fixture; pass `termYears` prop to `<AccountForm>`; remove any term-specific tests
  - [x] 5.3 Update `src/components/AccountCard.tsx` — accept `termYears` prop; pass to `AccountForm`, `AccountSummary`; use for `applyInflationToProjection` and `buildProjection` calls; pass to contribution room functions
  - [x] 5.4 Update `src/components/AccountCard.test.tsx` — pass `termYears` prop; remove from account fixtures
  - [x] 5.5 Update `src/components/AccountListRow.tsx` — accept `termYears` prop; pass to `AccountForm`, `AccountSummary`; use for projection/inflation calls; remove "Term" metric from collapsed header
  - [x] 5.6 Update `src/components/AccountListRow.test.tsx` — pass `termYears` prop; remove from account fixtures
  - [x] 5.7 Update `src/components/AccountListView.tsx` — accept and thread `termYears` prop to `AccountListRow`
  - [x] 5.8 Update `src/components/GoalInputPanel.tsx` — remove the "Term (years)" input field for `calculationType === 'contribution'`; receive global `termYears` as prop if needed for display
  - [x] 5.9 Update `src/components/GoalInputPanel.test.tsx` — remove `termYears` from goal state fixtures

- [x] 6.0 Testing & Validation
  - [x] 6.1 Run full test suite (`npx vitest run`) and fix any remaining type errors or broken tests
  - [x] 6.2 Manual smoke test: verify global term input appears in header, changing it updates all projections, contribution months auto-adjust, goal mode uses global term, localStorage persistence works, reset clears term
  - [x] 6.3 Verify accessibility: label, aria-describedby, aria-invalid, keyboard navigation on `GlobalTermInput`

## Validation Checklist
- [x] All PRD requirements covered
- [x] Tests for all new functionality
- [x] File paths match project structure
- [x] Dependencies properly ordered (types → utils → components → app)
- [x] Error handling addressed (validation, localStorage fallback, migration)
- [x] `termYears` fully removed from `AccountInput` — TypeScript compiler catches all stale references

## Estimated Effort
- **Total:** 6 parent tasks, 28 sub-tasks
- **Time:** 6–10 hours (mid-level dev)
- **Can parallelize:** Tasks 1.1 + 1.2 + 1.3; Tasks 2.1–2.10 are sequential within but 3.0 can run in parallel with 2.0; Task 5.0 depends on 2.0 and 4.0
