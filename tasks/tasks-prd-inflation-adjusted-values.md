# Task List: Inflation-Adjusted Values
*From: `prd-inflation-adjusted-values.md`*

## Overview

This feature adds inflation adjustment to investment projections, allowing users to see their future balances in "today's dollars." The implementation follows existing patterns from `CurrentAgeInput` and `GoalState` for state management and localStorage persistence. The core calculation applies the discount formula `realValue = nominalValue / (1 + inflationRate)^years` to each projection point.

## Architecture Decisions

- **State management:** Inflation state managed in `App.tsx` alongside existing `goalState` and `currentAge`, passed via props
- **Calculation approach:** Apply inflation adjustment as a post-processing step on projection points rather than modifying `buildProjection` core logic
- **Component pattern:** Follow `CurrentAgeInput` pattern for `InflationControls` component
- **Storage pattern:** Follow `storage.ts` pattern with `loadInflationState`, `saveInflationState`, `clearInflationState`
- **Chart integration:** Add optional third line to existing `AccountChart` component

## Relevant Files

### New Files
- `src/types/inflation.ts` - InflationState type and defaults
- `src/utils/inflation.ts` - Inflation calculation utilities
- `src/utils/inflation.test.ts` - Unit tests for inflation calculations
- `src/components/InflationControls.tsx` - Combined toggle + rate input component
- `src/components/InflationControls.test.tsx` - Component tests

### Files to Modify
- `src/types/investment.ts` - Extend ProjectionPoint and ProjectionTotals with real value fields
- `src/utils/storage.ts` - Add inflation state persistence functions
- `src/utils/storage.test.ts` - Add tests for inflation storage
- `src/components/AccountSummary.tsx` - Display real values when inflation enabled
- `src/components/AccountChart.tsx` - Add real balance line when inflation enabled
- `src/components/AccountCard.tsx` - Pass inflation state to children
- `src/App.tsx` - Add inflation state, update grand totals display
- `src/App.css` - Styles for inflation controls

### Testing
- Unit: `npm run test src/utils/inflation.test.ts`
- Component: `npm run test src/components/InflationControls.test.tsx`
- All: `npm run test`

## Tasks

- [x] 1.0 Foundation & Types
  - [x] 1.1 Create `src/types/inflation.ts` with `InflationState` type and `DEFAULT_INFLATION_STATE` constant
  - [x] 1.2 Extend `ProjectionPoint` in `src/types/investment.ts` with optional `realBalance` and `realTotalContributions` fields
  - [x] 1.3 Extend `ProjectionTotals` in `src/types/investment.ts` with optional `realFinalBalance`, `realTotalContributions`, `realTotalReturns` fields

- [x] 2.0 Inflation Calculation Utilities
  - [x] 2.1 Create `src/utils/inflation.ts` with `calculateRealValue(nominalValue, inflationRatePercent, years)` function
  - [x] 2.2 Add `applyInflationToProjection(projection, inflationRatePercent)` function to transform projection points
  - [x] 2.3 Add `applyInflationToTotals(totals, inflationRatePercent, termYears)` function for summary totals
  - [x] 2.4 Create `src/utils/inflation.test.ts` with unit tests for all calculation functions
  - [x] 2.5 Test edge cases: 0% inflation, high inflation (10%+), very long terms (50+ years)

- [x] 3.0 Storage & Persistence
  - [x] 3.1 Add `INFLATION_STORAGE_KEY` constant to `src/utils/storage.ts`
  - [x] 3.2 Add `loadInflationState({ storageAvailable })` function following existing pattern
  - [x] 3.3 Add `saveInflationState({ inflationState, storageAvailable })` function
  - [x] 3.4 Add `clearInflationState({ storageAvailable })` function
  - [x] 3.5 Add unit tests for inflation storage functions in `src/utils/storage.test.ts`

- [x] 4.0 InflationControls Component
  - [x] 4.1 Create `src/components/InflationControls.tsx` with toggle and rate input
  - [x] 4.2 Implement toggle for enabling/disabling inflation adjustment
  - [x] 4.3 Implement rate input (0-15%, step 0.1%, default 2.5%)
  - [x] 4.4 Add input validation and error state display
  - [x] 4.5 Add accessibility attributes (labels, aria-describedby, aria-invalid)
  - [x] 4.6 Add styles for inflation controls in `src/App.css`
  - [x] 4.7 Create `src/components/InflationControls.test.tsx` with component tests

- [x] 5.0 App Integration & State Management
  - [x] 5.1 Add inflation state to `App.tsx` using `useState` with `loadInflationState`
  - [x] 5.2 Add `useEffect` to persist inflation state changes to localStorage
  - [x] 5.3 Add `handleInflationStateUpdate` callback function
  - [x] 5.4 Render `InflationControls` in header near `CurrentAgeInput`
  - [x] 5.5 Update `handleResetAccounts` to also clear inflation state
  - [x] 5.6 Calculate inflation-adjusted grand totals when inflation is enabled
  - [x] 5.7 Update grand totals display to show real values with appropriate labels

- [x] 6.0 AccountCard & AccountSummary Updates
  - [x] 6.1 Pass `inflationState` prop through `AccountCard` to children
  - [x] 6.2 Update `AccountSummary` to accept `inflationEnabled` prop
  - [x] 6.3 Apply inflation adjustment to totals in `AccountSummary` when enabled
  - [x] 6.4 Update labels to show "(today's $)" suffix when inflation is enabled
  - [x] 6.5 Update `AccountSummary` tests for inflation scenarios

- [x] 7.0 AccountChart Updates
  - [x] 7.1 Update `AccountChart` to accept `inflationEnabled` prop
  - [x] 7.2 Apply inflation adjustment to chart data points when enabled
  - [x] 7.3 Add third line for "Real balance (today's $)" with green color (`#4ade80`)
  - [x] 7.4 Update tooltip to show both nominal and real values when inflation enabled
  - [x] 7.5 Update legend with clear labels for all lines

- [x] 8.0 Testing & Polish
  - [x] 8.1 Run full test suite and fix any failures
  - [x] 8.2 Test keyboard navigation for inflation controls
  - [x] 8.3 Test localStorage persistence across page refreshes
  - [x] 8.4 Verify chart displays correctly with three lines
  - [x] 8.5 Test responsive behavior on mobile viewport
  - [x] 8.6 Verify no console errors or warnings

## Validation Checklist
- [x] FR-1: Inflation rate input validates (0-15%), persists after refresh
- [x] FR-2: Toggle switches mode instantly, preference persists
- [x] FR-3: Real values match formula: `nominal / (1 + rate)^years`
- [x] FR-4: Summary shows correct labels and real values
- [x] FR-5: Chart shows real balance line with correct data
- [x] FR-6: Grand totals show real values when enabled
- [x] All PRD requirements covered
- [x] Tests for all new functionality (148 tests passing)
- [x] File paths match project structure
- [x] Dependencies properly ordered
- [x] Error handling addressed
- [x] Accessibility requirements met

## Estimated Effort
- **Total:** 8 parent tasks, 35 sub-tasks
- **Time:** 6-8 hours (mid-level dev)
- **Can parallelize:** Tasks 1.0 and 2.0 can run in parallel; Task 3.0 depends on 1.0; Tasks 4.0-7.0 depend on 1.0-3.0

## Notes
- Goal Mode integration (FR-7) is deferred to Phase 2 per PRD
- Chart color for real balance: `#4ade80` (green)
- Default inflation rate: 2.5%
- Feature is opt-in (disabled by default)
