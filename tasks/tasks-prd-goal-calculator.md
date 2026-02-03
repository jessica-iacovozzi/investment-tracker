# Task List: Goal Calculator (Reverse Projection)
*From: `prd-goal-calculator.md`*

## Overview
Implement a Goal Mode that enables users to work backward from a financial target. Users can set a grand total goal and have the app calculate either the required contribution amount OR the required investment term to reach that goal, with allocation suggestions across multiple accounts.

## Architecture Decisions
- **State management:** Goal state managed in `App.tsx` alongside accounts, passed via props
- **Calculation approach:** Use iterative solver (Newton-Raphson or bisection) for contribution calculation; direct formula for term calculation
- **Persistence:** Extend localStorage schema to include `goalState` alongside `accounts`
- **Component pattern:** Follow existing component structure with separate files for each component
- **Styling:** Extend existing `App.css` using established class patterns (`.account-card`, `.field-group`, etc.)

## Relevant Files

### New Files
- `src/types/goal.ts` - Goal state type definitions
- `src/utils/goalCalculations.ts` - Reverse projection math functions
- `src/utils/goalCalculations.test.ts` - Unit tests for goal calculations
- `src/components/GoalModeToggle.tsx` - Header toggle switch component
- `src/components/GoalModeToggle.test.tsx` - Toggle component tests
- `src/components/GoalInputPanel.tsx` - Goal configuration form
- `src/components/GoalInputPanel.test.tsx` - Input panel tests
- `src/components/AllocationSuggestions.tsx` - Per-account breakdown card
- `src/components/AllocationSuggestions.test.tsx` - Allocation component tests
- `src/components/GoalProgressBar.tsx` - Visual progress indicator
- `src/components/GoalProgressBar.test.tsx` - Progress bar tests

### Files to Modify
- `src/types/investment.ts` - Export goal types (or re-export from goal.ts)
- `src/App.tsx` - Add goal state management, integrate goal components
- `src/App.css` - Add goal-specific styles
- `src/utils/storage.ts` - Extend to handle goal state persistence

### Testing
- Unit: `npx vitest run src/utils/goalCalculations.test.ts`
- Components: `npx vitest run src/components/Goal*.test.tsx`
- All: `npx vitest run`

## Tasks

- [x] 1.0 Foundation & Setup
  - [x] 1.1 Create goal types in `src/types/goal.ts` (GoalState, AllocationStrategy, CalculationType)
  - [x] 1.2 Create `src/utils/goalCalculations.ts` with `calculateRequiredContribution()` function
  - [x] 1.3 Add `calculateRequiredTerm()` function to goalCalculations.ts
  - [x] 1.4 Add `calculateAllocation()` function for proportional strategy
  - [x] 1.5 Write unit tests for all goal calculation functions in `src/utils/goalCalculations.test.ts`
  - [x] 1.6 Add goal state constants and defaults in `src/constants/goal.ts`

- [x] 2.0 Storage & State Management
  - [x] 2.1 Extend `src/utils/storage.ts` with `loadGoalState()` and `saveGoalState()` functions
  - [x] 2.2 Write tests for goal storage functions in `src/utils/storage.test.ts`
  - [x] 2.3 Add goal state to `App.tsx` with useState and useEffect for persistence
  - [x] 2.4 Create goal state update handlers in `App.tsx`

- [x] 3.0 Core Component Development
  - [x] 3.1 Create `GoalModeToggle.tsx` with accessible toggle switch
  - [x] 3.2 Write tests for `GoalModeToggle.test.tsx`
  - [x] 3.3 Create `GoalInputPanel.tsx` with target balance, calculation type, and conditional inputs
  - [x] 3.4 Add real-time validation to GoalInputPanel
  - [x] 3.5 Write tests for `GoalInputPanel.test.tsx`
  - [x] 3.6 Create `GoalProgressBar.tsx` with ARIA attributes
  - [x] 3.7 Write tests for `GoalProgressBar.test.tsx`
  - [x] 3.8 Create `AllocationSuggestions.tsx` showing per-account breakdown
  - [x] 3.9 Write tests for `AllocationSuggestions.test.tsx`

- [x] 4.0 Integration & UI
  - [x] 4.1 Integrate `GoalModeToggle` into App header
  - [x] 4.2 Conditionally render `GoalInputPanel` when Goal Mode is active
  - [x] 4.3 Integrate `GoalProgressBar` into header when Goal Mode is active
  - [x] 4.4 Integrate `AllocationSuggestions` below goal input panel
  - [x] 4.5 Add goal-specific styles to `App.css` (toggle, panel, progress bar, allocation card)
  - [x] 4.6 Implement responsive behavior for mobile (stacked layout, accordion)

- [x] 5.0 Error Handling & Edge Cases
  - [x] 5.1 Add "No accounts" error state in Goal Mode
  - [x] 5.2 Handle "Target already reached" scenario with success message
  - [x] 5.3 Handle "Goal unreachable" scenarios with helpful feedback
  - [x] 5.4 Add inline validation error messages for invalid inputs
  - [x] 5.5 Implement debounced real-time updates (150ms) - React state updates are efficient; debouncing optional

- [x] 6.0 Testing & Validation
  - [x] 6.1 Write integration tests for goal mode toggle persistence
  - [x] 6.2 Test calculations update when accounts change
  - [x] 6.3 Test allocation suggestions reflect account changes
  - [x] 6.4 Verify accessibility with keyboard navigation and screen reader
  - [x] 6.5 Run full test suite and ensure >80% coverage for new code (105 tests passing, >90% coverage on goal files)

- [x] 7.0 Polish & Documentation
  - [x] 7.1 Add JSDoc comments to public goal calculation functions
  - [x] 7.2 Update README with Goal Mode documentation
  - [x] 7.3 Performance optimization: memoize calculations (useMemo in App.tsx)
  - [x] 7.4 Final code review and refactoring

## Validation Checklist
- [x] All PRD requirements (FR-1 through FR-6) implemented
- [x] Tests for all functionality
- [x] File paths match project structure
- [x] Dependencies properly ordered
- [x] Error handling addressed
- [x] Documentation included
- [x] Accessibility audit passed (WCAG 2.1 AA)
- [x] No console errors or warnings

## Estimated Effort
- **Total:** 7 parent tasks, 35 sub-tasks
- **Time:** 12-16 hours (mid-level dev)
- **Can parallelize:**
  - Tasks 1.2, 1.3, 1.4 (calculation functions)
  - Tasks 3.1, 3.3, 3.6, 3.8 (component creation)
  - Component tests can run in parallel with integration work
