# PRD: Compounding Frequency & Contribution Timing

## Overview
Enhance the investment projections to support realistic compounding frequencies (annually through daily) and contribution timing (beginning/end of month or year). This allows users to more accurately model accounts that compound at different cadences and contributions posted at specific times.

## Business Context
- **Problem:** Current projections assume monthly compounding and mid-period contributions, which misrepresents accounts with daily compounding or contributions posted at the beginning/end of a period.
- **Success Metrics:**
  - 90%+ of users can model their compounding cadence without manual workarounds.
  - Projection totals match known calculator outputs within 1% for sample scenarios.
- **Priority:** High

## Target Users
- Individual investors tracking brokerage, retirement, and savings accounts with different compounding schedules.
- Power users comparing bank/APY calculators against real account behavior.

## User Stories
1. As a user, I want to select my account’s compounding frequency so the growth curve matches how my institution compounds interest.
2. As a user, I want to specify if contributions are applied at the beginning or end of a period so my totals are realistic.
3. As a user, I want to keep my existing monthly view while still modeling daily/weekly compounding accurately.
4. As a user, I want the UI to explain what each timing option means so I can choose correctly.

## Functional Requirements

### Core Functionality
1. **Compounding frequency selection**
   - Provide options: annually, semiannually, quarterly, monthly, semimonthly, biweekly, weekly, daily, continuously.
   - Default to **monthly** for new accounts.
   - Persist to local storage with accounts.
   - Acceptance: Switching frequency updates projections on the chart and summary totals.

2. **Contribution timing selection**
   - Provide options: beginning of month, end of month, beginning of year, end of year.
   - Default to **end of month** for new accounts.
   - Acceptance: Timing changes alter projection results deterministically.

3. **Projection math update**
   - Projections must respect selected compounding frequency.
   - Contributions must be applied at the chosen timing within the relevant period.
   - Acceptance: Test scenarios confirm expected ordering of contribution and compounding.

### Data Requirements
- Extend `AccountInput` with:
  - `compoundingFrequency: CompoundingFrequency`
  - `contributionTiming: ContributionTiming`
- Validation:
  - Frequency must be one of the allowed options.
  - Timing must be one of the allowed options.

### User Interface
- Add two inputs to each account card:
  - **Compounding frequency** (select).
  - **Contribution timing** (select).
- Provide inline help text for timing choices.
- Maintain existing layout and styling; avoid crowding on mobile by stacking.

### Integration Points
- Projection utilities (`buildProjection`) update to use new parameters.
- Local storage read/write should include new fields.

### Security & Privacy
- No new PII or external services.
- Continue to store data locally in browser storage.

### Performance
- Projection calculation should remain O(n) in months.
- Target render update under 50ms for 30-year horizons.

## Non-Functional Requirements

### Accessibility
- Ensure select inputs are fully labeled and keyboard accessible.
- Maintain WCAG 2.1 AA contrast and focus states.

### Error Handling
- If stored data is malformed, fall back to defaults and log a warning.
- Clamp unsupported values to default frequency/timing.

### Testing
- Unit tests for compounding math at multiple frequencies.
- Unit tests for contribution timing order (begin/end).
- Regression tests for existing monthly behavior.

## Non-Goals
- No external API integrations.
- No CSV import/export.
- No per-contribution calendar scheduling beyond timing selection.

## Technical Approach

### Architecture
- Extend account model with new fields.
- Update `AccountForm` to collect values.
- Update `buildProjection` to apply compounding per selected cadence.

### Technology Alignment
- React + TypeScript + local storage (existing stack).
- Reuse existing form and projection utilities.

### Database
- None (local storage only).

## Design Considerations
- Keep the form readable; consider grouping “Contribution schedule” fields together.
- Use clear labels (e.g., “Compounds: Daily” and “Contribution timing: End of month”).

## Implementation Phases

### Phase 1: MVP
- Add new fields and UI controls.
- Update projection calculations.
- Add tests for new logic.

### Phase 2: Enhancements
- Tooltip explanations for each compounding/timing option.
- Advanced calculator parity tests.

## Success Criteria

### Definition of Done
- Projections change correctly with compounding frequency and timing.
- Tests added and passing.
- UI updates are accessible and responsive.
- Local storage persists new fields.

### Acceptance Criteria
1. When compounding frequency changes, total returns update within one render and match expected calculations for provided fixtures.
2. When timing is “beginning of month,” contributions apply before monthly compounding in that period.
3. When timing is “end of month,” contributions apply after monthly compounding in that period.
4. When timing is “beginning of year,” contributions apply only at year boundaries.
5. When timing is “end of year,” contributions apply only at year boundaries after compounding.

## Dependencies & Risks

### Dependencies
- None beyond existing projection utilities.

### Risks & Mitigations
- **Risk:** User confusion about timing definitions.
  - **Mitigation:** Add helper text and tooltip descriptions.
- **Risk:** Increased computation for daily compounding.
  - **Mitigation:** Use effective rate conversion rather than per-day simulation.

## Open Questions
1. Should “begin/end of year” apply only to annual contributions or all schedules?
2. Should projections remain monthly points regardless of compounding cadence?
3. Do we need an option for “beginning/end of period” tied to the selected frequency instead of fixed month/year?

## Assumptions
- Monthly projection points remain the default visualization.
- Effective periodic rate conversion is acceptable for non-monthly compounding.
- Contribution amount is per contribution occurrence, not per period total.
