# PRD: Age Input for Final Value Label

## Overview
Add an age input per account so the projection summary’s “Final value” label becomes “Final value at X years old,” where X = current age + term years (rounded to whole years). This makes results more intuitive by tying the projection horizon to the user’s age.

## Business Context
- **Problem:** Users see “Final value” without clear context for when that value applies, which reduces interpretability.
- **Success Metrics:**
  - 80% of sessions with age entered show the new label.
  - Reduced user confusion in feedback (qualitative).
- **Priority:** Medium

## Target Users
Individuals comparing long-term investment outcomes who think in terms of age (retirement planning, milestones).

## User Stories
1. As a user, I want to enter my current age for each account so I can see how old I’ll be when the final value is reached.
2. As a user, I want the final value label to update automatically when I change the term length so the displayed age stays accurate.
3. As a user, I want my age input validated so I don’t accidentally enter an unrealistic age.
4. As a user, I want saved accounts to remember my age input so I don’t need to re-enter it.

## Functional Requirements

### Core Functionality
1. **Age input field**
   - Add a numeric “Current age” field to each account form.
   - Acceptance Criteria:
     - Field accepts integer values.
     - Values outside [0, 120] are rejected with inline validation.
     - Empty input is allowed and does not break projections.
2. **Dynamic label**
   - Update the “Final value” label in the account summary to:
     - “Final value at {age + termYears} years old” when age is present.
     - “Final value” when age is empty or invalid.
   - Acceptance Criteria:
     - Label updates immediately when age or term changes.
     - Uses whole years (rounded to nearest integer).
3. **Persistence**
   - Store the age value with account data in local storage.
   - Acceptance Criteria:
     - Age persists across refreshes.
     - Default seed accounts include a sensible age (e.g., 30).

### Data Requirements
- **AccountInput** model: add `currentAge?: number`.
- Validation rule: 0 ≤ currentAge ≤ 120; integer only.

### User Interface
- Add a “Current age” input near “Term (years)” in each account form.
- Display the updated label in AccountSummary.
- Responsive layout should remain consistent with existing form grid.

### Integration Points
- None beyond existing local storage persistence.

### Security & Privacy
- Local-only data storage; no new security risks.
- Input sanitation to prevent NaN persistence.

### Performance
- No measurable impact expected; label computation is trivial.

## Non-Functional Requirements

### Accessibility
- Label and input must be properly associated via `htmlFor` and `id`.
- Use `aria-live="polite"` for the summary label if needed for updates.

### Error Handling
- Invalid age input should show inline validation message and revert to last valid value for calculations.

### Testing
- Unit tests:
  - Label formatting with age and term.
  - Validation boundaries.
- Integration tests:
  - Updating age updates label.
  - Updating term updates label.

## Non-Goals
- Global user profile age shared across accounts.
- Retirement planning calculators beyond labeling.

## Technical Approach

### Architecture
- Update `AccountInput` type and AccountForm state.
- Pass `currentAge` into AccountSummary for label logic.
- Derive `finalAge` via helper function (e.g., `getFinalAge({ currentAge, termYears })`).

### Technology Alignment
- React + TypeScript, local storage persistence already in place.

### Database
- No database changes.

## Design Considerations
- Keep label concise and readable.
- Ensure inline validation doesn’t disrupt layout.

## Implementation Phases

### Phase 1: MVP
- Add field, validation, label update, and persistence.

### Phase 2: Enhancements
- Optional helper text for retirement milestones.

## Success Criteria

### Definition of Done
- Feature implemented and tested.
- No regressions in projection calculations.
- Accessibility verified.

### Acceptance Criteria
1. When age = 30 and term = 30, label displays “Final value at 60 years old.”
2. When age is cleared, label falls back to “Final value.”
3. Age persists in local storage after refresh.
4. Age input rejects values outside 0–120.

## Dependencies & Risks

### Dependencies
- None.

### Risks & Mitigations
- **Risk:** Users enter fractional ages.
  - **Mitigation:** Enforce integer input and round for display.

## Open Questions
- None.

## Assumptions
- Age is per account rather than a global profile setting.
- Term years are treated as whole years (already integer input).
