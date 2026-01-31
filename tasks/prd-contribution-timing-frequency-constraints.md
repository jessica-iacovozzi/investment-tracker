# PRD: Contribution Timing/Frequency Constraints

## Overview
Limit contribution timing options to valid combinations with the selected contribution frequency. Beginning/end of month are only selectable with monthly frequency; beginning/end of quarter are only selectable with quarterly frequency; beginning/end of biweekly are only selectable with biweekly frequency (once every two weeks); and beginning/end of year are only selectable with yearly frequency. This prevents invalid modeling and reduces user confusion.

## Business Context
- **Problem:** The UI allows timing/frequency combinations that do not make sense (e.g., yearly timing with monthly contributions), producing incorrect projections and user confusion.
- **Success Metrics:**
  - 95%+ of users select valid timing/frequency combinations without error states.
  - Support tickets or feedback referencing “invalid timing” reduced to near zero.
- **Priority:** High

## Target Users
- Investors modeling periodic contributions who expect timing choices to match the selected contribution frequency.
- Users comparing projections against bank/brokerage statements.

## User Stories
1. As a user, I want only valid timing options for my selected contribution frequency so I don’t pick a combination that can’t exist.
2. As a user, I want the UI to explain why some timing options are unavailable so I understand how to adjust my inputs.
3. As a user, I want my previously saved accounts to safely default to valid selections if they become invalid.

## Functional Requirements

### Core Functionality
1. **Timing options constrained by frequency**
   - If contribution frequency is **monthly**, allow only **beginning of month** and **end of month**.
   - If contribution frequency is **quarterly**, allow only **beginning of quarter** and **end of quarter**.
   - If contribution frequency is **biweekly** (once every two weeks), allow only **beginning of biweekly** and **end of biweekly**.
   - If contribution frequency is **yearly**, allow only **beginning of year** and **end of year**.
   - Acceptance: UI prevents selecting invalid combinations and projections use only valid timing values.

2. **Automatic correction of invalid saved data**
   - When loading account data, if timing/frequency combination is invalid, map to the nearest valid default:
     - Monthly frequency → default timing **end of month**.
     - Quarterly frequency → default timing **end of quarter**.
     - Biweekly frequency → default timing **end of biweekly**.
     - Yearly frequency → default timing **end of year**.
   - Acceptance: No invalid combination persists in state or local storage after load.

3. **User feedback for unavailable timing options**
   - Provide helper text under the timing selector explaining the constraint based on the chosen frequency.
   - Acceptance: Users can identify why options are unavailable without error messages.

### Data Requirements
- Validation rules:
  - `contributionTiming` must be compatible with `contributionFrequency`.
  - Invalid combinations are normalized on read and before persist.

### User Interface
- Update the contribution timing selector in `AccountForm`:
  - Fully filter options based on selected frequency.
  - Provide descriptive help text that updates when frequency changes.
- Maintain existing layout; ensure the helper text remains readable on mobile.

### Integration Points
- `AccountForm` and any shared form components.
- Local storage persistence and account hydration logic.
- Projection utilities should assume inputs are already normalized.

### Security & Privacy
- No new data collection; local-only data handling unchanged.

### Performance
- Constraint logic should be O(1) on render and not impact chart performance.

## Non-Functional Requirements

### Accessibility
- Helper text should be associated with the timing select via `aria-describedby`.
- Keyboard navigation must remain intact for both selects.

### Error Handling
- On load, invalid combinations are corrected silently and logged (dev-only warning).
- UI should never render a selected timing value that is not in the visible options.

### Testing
- Unit tests for validation/normalization logic.
- UI tests to confirm timing options update when frequency changes.
- Regression test to ensure existing valid accounts remain unchanged.

## Non-Goals
- Introducing new timing options tied to every possible frequency.
- Changing projection formulas beyond input validation.
- Adding new scheduling granularity beyond monthly/quarterly/biweekly/yearly timing.

## Technical Approach

### Architecture
- Add a small utility to:
  - Compute valid timing options from frequency.
  - Normalize invalid combinations to defaults.
- Use the utility in both form state and persistence layer.

### Technology Alignment
- React + TypeScript + local storage (existing stack).
- Reuse existing `AccountForm` and validation patterns.

### Database
- None (local storage only).

## Design Considerations
- Prefer filtering invalid options for clarity.
- Keep labels explicit, e.g., “Beginning of month (monthly only)”.

## Implementation Phases

### Phase 1: MVP
- Add validation + normalization utility.
- Update `AccountForm` timing options based on frequency.
- Add helper text and aria linkage.
- Add unit tests.

### Phase 2: Enhancements
- Add tooltip or info icon with examples of timing definitions.
- Provide gentle inline confirmation when values auto-correct.

## Success Criteria

### Definition of Done
- Invalid timing/frequency combinations cannot be selected.
- Existing accounts are normalized on load and persist valid values.
- Tests pass and accessibility checks verified.

### Acceptance Criteria
1. If frequency is monthly, the timing selector offers only beginning/end of month.
2. If frequency is quarterly, the timing selector offers only beginning/end of quarter.
3. If frequency is biweekly, the timing selector offers only beginning/end of biweekly (once every two weeks).
4. If frequency is yearly, the timing selector offers only beginning/end of year.
5. If frequency changes to monthly/quarterly/biweekly/yearly, the timing value updates to a valid default if currently incompatible.
6. On app reload, any invalid stored combination is corrected before render.
7. Helper text is announced by screen readers and reflects the current frequency constraint.

## Dependencies & Risks

### Dependencies
- None beyond current form and storage utilities.

### Risks & Mitigations
- **Risk:** Users may miss why options are hidden.
  - **Mitigation:** Provide helper text tied to the timing selector and update it dynamically.
- **Risk:** Silent normalization could surprise users.
  - **Mitigation:** Use subtle UI copy to explain auto-correction when it occurs.

## Assumptions
- Contribution frequency already exists and is required for projection calculations.
- Monthly/quarterly/biweekly/yearly timing options are the only ones to enforce at this stage.
- Local storage is the source of truth for saved accounts.
