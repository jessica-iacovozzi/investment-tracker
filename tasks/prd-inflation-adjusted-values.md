# PRD: Inflation-Adjusted Values

## Overview

The Inflation-Adjusted Values feature enables users to see their investment projections in "today's dollars" by applying an inflation rate to future values. This transforms misleading nominal projections (e.g., "$500,000 in 30 years") into meaningful real values that reflect actual purchasing power, helping users make more informed long-term financial decisions.

## Business Context

- **Problem:** Current projections show nominal values only, which can be misleading for long-term planning. A projection showing "$1,000,000 in 30 years" doesn't account for the fact that $1M will have significantly less purchasing power due to inflation. Users may overestimate their future financial security.
- **Success Metrics:**
  - Feature toggle usage rate (% of sessions with inflation adjustment enabled)
  - User feedback on projection accuracy perception
  - Increased session duration (users exploring real vs nominal comparisons)
  - Reduced support questions about "realistic" projections
- **Priority:** High

## Target Users

| Persona | Use Case |
|---------|----------|
| **Early Career Saver (25-35)** | "What will my $1M goal actually be worth when I retire?" |
| **Mid-Career Planner (35-50)** | "Am I saving enough to maintain my lifestyle in retirement?" |
| **Pre-Retiree (50-65)** | "How much purchasing power will I actually have?" |
| **Financial Educator/Parent** | "Demonstrate inflation's impact on long-term savings" |

## User Stories

1. **As a long-term planner**, I want to see my future balance in today's dollars so that I can understand my real purchasing power at retirement.

2. **As a user**, I want to toggle between nominal and inflation-adjusted values so that I can compare both perspectives.

3. **As a user**, I want to customize the inflation rate so that I can model different economic scenarios (e.g., 2% vs 4% inflation).

4. **As a user**, I want to see both nominal and real values on the chart so that I can visualize inflation's impact over time.

5. **As a goal-mode user**, I want my goal calculations to optionally account for inflation so that my target reflects real purchasing power.

## Functional Requirements

### Core Functionality

#### FR-1: Global Inflation Rate Input
- Add an inflation rate input in the app header, near the Current Age input
- Default value: 2.5% (historical US average)
- Range: 0% to 15%
- Persisted in localStorage
- **Acceptance Criteria:** Input validates in real-time, value persists across sessions, updates all projections when changed

#### FR-2: Inflation Toggle
- Add a toggle to switch between "Nominal" and "Real (Inflation-Adjusted)" display modes
- Toggle appears near the inflation rate input
- When disabled, inflation rate input is hidden or disabled
- **Acceptance Criteria:** Toggle switches display mode instantly, preference persists across sessions

#### FR-3: Inflation-Adjusted Projection Calculation
- Extend `ProjectionPoint` to include `realBalance` and `realTotalContributions`
- Apply inflation discount: `realValue = nominalValue / (1 + inflationRate)^years`
- Calculate for each projection point
- **Acceptance Criteria:** Real values correctly discount nominal values, calculation handles edge cases (0% inflation, very high inflation)

#### FR-4: Summary Card Updates
- When inflation mode is active, display real values in `AccountSummary`
- Show label indicating values are inflation-adjusted (e.g., "Final value (today's $)")
- Optionally show both nominal and real values
- **Acceptance Criteria:** Labels clearly indicate which values are shown, values update in real-time

#### FR-5: Chart Updates
- Add a third line to `AccountChart` showing real balance when inflation mode is active
- Use distinct color for real balance line (e.g., green `#4ade80`)
- Update legend to distinguish "Projected balance" vs "Real balance (today's $)"
- **Acceptance Criteria:** Chart clearly shows both lines, tooltip displays both values

#### FR-6: Grand Totals Update
- Update grand totals in header to show real values when inflation mode is active
- Show label indicating inflation adjustment
- **Acceptance Criteria:** Grand totals reflect inflation adjustment, label is clear

#### FR-7: Goal Mode Integration
- When Goal Mode is active with inflation enabled, calculate required contributions to reach the goal in real terms
- Display message explaining that the goal is inflation-adjusted
- **Acceptance Criteria:** Goal calculations account for inflation, user understands the adjustment

### Data Requirements

#### New Types
```typescript
type InflationState = {
  isEnabled: boolean
  annualRatePercent: number // Default 2.5
}

// Extended ProjectionPoint
type ProjectionPoint = {
  month: number
  year: number
  balance: number
  totalContributions: number
  realBalance?: number // Inflation-adjusted
  realTotalContributions?: number // Inflation-adjusted
}

// Extended ProjectionTotals
type ProjectionTotals = {
  totalContributions: number
  totalReturns: number
  finalBalance: number
  realFinalBalance?: number
  realTotalContributions?: number
  realTotalReturns?: number
}
```

#### Validation Rules
- Inflation rate: 0% to 15%, step 0.1%
- Must be a valid number

#### Relationships
- Inflation state is global (not per-account)
- Affects all projection displays when enabled
- Interacts with Goal Mode calculations

### User Interface

#### Screens/Components

1. **InflationInput** - Input field for inflation rate percentage
2. **InflationToggle** - Toggle switch to enable/disable inflation adjustment
3. **Updated AccountSummary** - Shows real values with appropriate labels
4. **Updated AccountChart** - Shows real balance line when enabled
5. **Updated App header** - Shows real grand totals when enabled

#### User Flows

**Flow 1: Enable Inflation Adjustment**
1. User locates inflation controls in header (near Current Age)
2. User toggles "Show real values" on
3. Inflation rate input appears (default 2.5%)
4. All projections update to show real values
5. Charts show additional "Real balance" line
6. Summary cards show "(today's $)" labels

**Flow 2: Customize Inflation Rate**
1. User enables inflation adjustment
2. User modifies inflation rate (e.g., 3.5%)
3. All projections recalculate instantly
4. User sees impact of higher/lower inflation

**Flow 3: Compare Nominal vs Real**
1. User views projection with inflation enabled
2. Chart shows both nominal and real balance lines
3. User can see the growing gap over time
4. User toggles off to see nominal-only view

#### Responsive Behavior
- Inflation controls stack below Current Age on mobile
- Toggle and input remain accessible on all screen sizes
- Chart legend wraps appropriately with additional line

### Integration Points

- **buildProjection utility:** Add optional inflation parameter to calculate real values
- **localStorage:** Persist inflation state alongside accounts and goal state
- **formatCurrency:** Reuse existing formatter for real values
- **Goal calculations:** Extend to support inflation-adjusted targets

### Security & Privacy

- All calculations remain client-side (no backend)
- Inflation preference stored in localStorage only
- No PII collected or transmitted

### Performance

- Inflation calculations add minimal overhead (<5ms per projection)
- Real-time updates as user adjusts rate (debounce 150ms)
- Memoize calculations to avoid redundant computation

## Non-Functional Requirements

### Accessibility

- Inflation toggle must be keyboard accessible
- Input must have associated label
- Screen reader announcements for mode changes
- Chart must have accessible description of both lines
- Color choices must have sufficient contrast

### Error Handling

| Scenario | User Feedback |
|----------|---------------|
| Invalid inflation rate | Inline validation: "Enter a rate between 0% and 15%" |
| Very high inflation (>10%) | Warning: "High inflation rate may produce unexpected results" |
| Inflation exceeds return rate | Info: "With this inflation rate, your real returns are negative" |

### Testing

#### Unit Tests
- `calculateRealValue(nominalValue, inflationRate, years)` function
- `buildProjection` with inflation parameter
- Edge cases: 0% inflation, 100% inflation, negative rates (rejected)
- Real value calculation accuracy

#### Integration Tests
- Inflation toggle persists state
- Projections update when inflation rate changes
- Chart displays correct lines based on mode
- Grand totals reflect inflation adjustment

#### E2E Critical Paths
- Enable inflation → See real values in summary and chart
- Adjust inflation rate → All projections update
- Enable Goal Mode with inflation → Goal calculations adjust

## Non-Goals

- **Per-account inflation rates:** All accounts use the same global rate
- **Historical inflation data:** No integration with real inflation indices
- **Inflation forecasting:** No predictive modeling
- **Currency conversion:** Only USD assumed
- **Tax-adjusted returns:** Separate feature

## Technical Approach

### Architecture

#### New Components
```
src/components/
├── InflationControls.tsx    # Combined toggle + input
```

#### Updated Components
```
src/components/
├── AccountSummary.tsx       # Add real value display
├── AccountChart.tsx         # Add real balance line
├── App.tsx                  # Add inflation state, update grand totals
```

#### New/Updated Utilities
```
src/utils/
├── inflation.ts             # Inflation calculation helpers
│   ├── calculateRealValue()
│   └── applyInflationToProjection()
├── projections.ts           # Extend buildProjection
```

#### New Types
```
src/types/
├── inflation.ts             # InflationState type
```

#### State Management
- Inflation state managed in App.tsx alongside accounts and goal state
- Passed down via props to relevant components
- Persisted to localStorage

### Technology Alignment

- **React 19:** Functional components with hooks
- **TypeScript:** Strict typing for inflation state
- **Recharts:** Additional line for real balance
- **CSS:** Extend existing styles for inflation controls
- **Vitest:** Unit tests for inflation calculations

### Database

- No database changes (client-only app)
- localStorage schema extended:
```typescript
{
  accounts: AccountInput[],
  goalState: GoalState,
  inflationState: InflationState,
  currentAge?: number
}
```

## Design Considerations

### Visual Design
- Inflation controls use existing `.field-group` styling
- Toggle uses existing button/toggle patterns
- Real balance line uses green (`#4ade80`) for positive connotation
- Labels use "(today's $)" suffix for clarity

### Component Reuse
- Reuse `CurrentAgeInput` pattern for `InflationInput`
- Reuse existing toggle button styles
- Reuse `formatCurrency` for all monetary displays

### Color Palette for Chart
| Line | Color | Meaning |
|------|-------|---------|
| Projected balance | `#fbbf24` (amber) | Nominal future value |
| Total contributions | `#7dd3fc` (sky) | Money invested |
| Real balance | `#4ade80` (green) | Inflation-adjusted value |

## Implementation Phases

### Phase 1: MVP
- Global inflation rate input
- Inflation toggle
- Real value calculations in projections
- Updated summary cards with real values
- Updated chart with real balance line
- Updated grand totals

### Phase 2: Enhancements
- Goal Mode integration (inflation-adjusted goals)
- "Inflation impact" summary showing total purchasing power lost
- Preset inflation scenarios (low/medium/high)
- Educational tooltip explaining inflation adjustment

### Phase 3: Advanced
- Historical inflation comparison
- Custom inflation schedules (different rates for different periods)
- Integration with withdrawal modeling (future feature)

## Success Criteria

### Definition of Done
- [ ] All functional requirements implemented
- [ ] Unit tests passing with >80% coverage for new code
- [ ] Integration tests for inflation mode flows
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Code review approved
- [ ] No console errors or warnings
- [ ] Chart displays correctly with three lines

### Acceptance Criteria

| Requirement | Acceptance Test |
|-------------|-----------------|
| FR-1 | Inflation rate input validates, persists after refresh |
| FR-2 | Toggle switches mode, preference persists |
| FR-3 | Real values match manual calculation: `nominal / (1.025)^years` |
| FR-4 | Summary shows correct labels and real values |
| FR-5 | Chart shows real balance line with correct data |
| FR-6 | Grand totals show real values when enabled |
| FR-7 | Goal calculations adjust for inflation |

## Dependencies & Risks

### Dependencies
- Existing `buildProjection` function
- Existing account and goal state management
- localStorage availability
- Recharts library for chart updates

### Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| User confusion about real vs nominal | Medium | Clear labels, educational tooltip, distinct colors |
| Chart clutter with three lines | Low | Option to hide contribution line, good color contrast |
| Performance with inflation calculations | Low | Simple math, memoization |
| Inflation rate edge cases | Low | Input validation, reasonable defaults |

## Open Questions

1. Should we show a "purchasing power lost" summary (difference between nominal and real)?
2. Should the default inflation rate be customizable per region (e.g., 2% for US, 3% for other countries)?
3. Should we warn users when their real return rate (nominal rate - inflation) is very low or negative?

## Assumptions

- Users understand the basic concept of inflation
- 2.5% is a reasonable default for US-based users
- Most users will use inflation rates between 1% and 5%
- Users prefer seeing both nominal and real values simultaneously on the chart
- The feature should be opt-in (disabled by default) to avoid confusing new users
