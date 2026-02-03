# PRD: Goal Calculator (Reverse Projection)

## Overview

The Goal Calculator enables users to work backward from a financial target. Instead of only projecting future balances from current inputs, users can set a grand total goal and have the app calculate either the required contribution amount OR the required investment term to reach that goal. The app will then suggest how to allocate contributions across multiple accounts to achieve the target.

## Business Context

- **Problem:** Users know their retirement or savings target (e.g., "$1M by age 65") but don't know how much to contribute or how long it will take. The current projection-only mode requires trial-and-error to find the right inputs.
- **Success Metrics:**
  - Feature adoption rate (% of sessions using goal mode)
  - Time to first meaningful projection reduced by 30%
  - User satisfaction score for "planning confidence"
  - Return user rate increase
- **Priority:** High

## Target Users

| Persona | Use Case |
|---------|----------|
| **Early Career Saver (25-35)** | "How much do I need to save monthly to retire with $1.5M?" |
| **Mid-Career Planner (35-50)** | "If I contribute $500/month, when will I hit my goal?" |
| **Pre-Retiree (50-65)** | "Can I reach my goal in 10 years with my current accounts?" |
| **Financial Educator/Parent** | "Show my child what it takes to become a millionaire" |

## User Stories

1. **As a saver**, I want to enter my target balance and see how much I need to contribute monthly so that I can plan my budget accordingly.

2. **As a planner**, I want to enter my target balance and contribution amount so that I can see how many years it will take to reach my goal.

3. **As a multi-account investor**, I want the app to suggest how to allocate my contributions across accounts so that I can optimize my path to the goal.

4. **As a user**, I want to toggle between "projection mode" and "goal mode" so that I can explore both forward and backward calculations.

5. **As a user**, I want to see real-time updates as I adjust goal parameters so that I can quickly iterate on my plan.

## Functional Requirements

### Core Functionality

#### FR-1: Goal Mode Toggle
- Add a global toggle in the header to switch between "Projection Mode" (current) and "Goal Mode"
- Default to Projection Mode for existing users
- Persist mode preference in localStorage
- **Acceptance Criteria:** Toggle is visible, switches modes instantly, preference persists across sessions

#### FR-2: Goal Input Panel
- Display a goal input panel when Goal Mode is active
- Inputs:
  - Target balance (required, currency input)
  - Calculation type toggle: "Calculate Contribution" or "Calculate Term"
  - When calculating contribution: Term (years) is input
  - When calculating term: Contribution amount and frequency are inputs
- **Acceptance Criteria:** Panel appears only in Goal Mode, all inputs validate in real-time

#### FR-3: Contribution Calculation
- Given: Target balance, term (years), existing accounts with rates and principals
- Calculate: Required total contribution per period to reach target
- Support all existing contribution frequencies: bi-weekly, monthly, quarterly, annually
- **Acceptance Criteria:** Calculation updates in real-time, handles edge cases (already at goal, impossible goal)

#### FR-4: Term Calculation
- Given: Target balance, contribution amount and frequency, existing accounts with rates and principals
- Calculate: Required term (years and months) to reach target
- **Acceptance Criteria:** Calculation updates in real-time, shows "Goal unreachable" if contribution is too low

#### FR-5: Allocation Suggestions
- When multiple accounts exist, suggest how to distribute contributions across accounts
- Allocation strategies:
  - **Proportional:** Distribute based on current balance ratios
  - **Highest return first:** Prioritize accounts with higher annual rates
  - **Equal split:** Divide evenly across accounts
- Display suggested contribution per account
- **Acceptance Criteria:** Suggestions update when accounts or goal changes, user can see breakdown per account

#### FR-6: Goal Progress Indicator
- Show progress toward goal as a percentage and visual bar
- Display in header alongside grand total when Goal Mode is active
- **Acceptance Criteria:** Progress updates in real-time, shows 100%+ if already exceeding goal

### Data Requirements

#### New State Fields
```typescript
type GoalState = {
  isGoalMode: boolean
  targetBalance: number
  calculationType: 'contribution' | 'term'
  contributionFrequency: ContributionFrequency
  contributionAmount?: number // When calculating term
  termYears?: number // When calculating contribution
  allocationStrategy: 'proportional' | 'highest-return' | 'equal'
}
```

#### Validation Rules
- Target balance: Must be positive, max 100,000,000
- Term years: 1-100 years
- Contribution amount: Must be positive when calculating term
- At least one account must exist to use Goal Mode

#### Relationships
- Goal state is global, not per-account
- Allocation suggestions reference existing accounts
- Goal calculations use account rates and principals

### User Interface

#### Screens/Components

1. **GoalModeToggle** - Header toggle switch
2. **GoalInputPanel** - Collapsible panel below header with goal inputs
3. **AllocationSuggestions** - Card showing per-account contribution breakdown
4. **GoalProgressBar** - Visual progress indicator in header

#### User Flows

**Flow 1: Calculate Required Contribution**
1. User enables Goal Mode via toggle
2. Goal Input Panel appears
3. User enters target balance ($1,000,000)
4. User selects "Calculate Contribution"
5. User enters term (30 years)
6. User selects contribution frequency (monthly)
7. App displays: "Contribute $X/month to reach your goal"
8. Allocation Suggestions show breakdown per account

**Flow 2: Calculate Required Term**
1. User enables Goal Mode via toggle
2. User enters target balance ($500,000)
3. User selects "Calculate Term"
4. User enters contribution amount ($500) and frequency (monthly)
5. App displays: "You'll reach your goal in X years, Y months"
6. Allocation Suggestions show breakdown per account

#### Responsive Behavior
- Goal Input Panel stacks vertically on mobile
- Allocation Suggestions collapse to accordion on mobile
- Progress bar remains visible on all screen sizes

### Integration Points

- **buildProjection utility:** Extend or create inverse function for goal calculations
- **localStorage:** Persist goal state alongside account data
- **formatCurrency/formatNumber:** Reuse existing formatters

### Security & Privacy

- All calculations remain client-side (no backend)
- Goal data stored in localStorage only
- No PII collected or transmitted

### Performance

- Goal calculations must complete in <50ms
- Real-time updates as user types (debounce 150ms)
- No perceptible lag when switching modes

## Non-Functional Requirements

### Accessibility

- Goal Mode toggle must be keyboard accessible
- All inputs must have associated labels
- Progress bar must have aria-valuenow, aria-valuemin, aria-valuemax
- Screen reader announcements for calculation results
- Focus management when switching modes

### Error Handling

| Scenario | User Feedback |
|----------|---------------|
| No accounts exist | "Add at least one account to use Goal Mode" |
| Target already reached | "Congratulations! Your projected balance already exceeds your goal" |
| Goal unreachable (term calc) | "This goal cannot be reached with the current contribution. Try increasing the amount or adjusting account rates." |
| Goal unreachable (contribution calc) | "This goal requires contributions exceeding $X/month. Consider extending your term." |
| Invalid input | Inline validation with specific error message |

### Testing

#### Unit Tests
- `calculateRequiredContribution` function
- `calculateRequiredTerm` function
- `calculateAllocation` function
- Edge cases: zero principal, zero rate, already at goal

#### Integration Tests
- Goal Mode toggle persists state
- Calculations update when accounts change
- Allocation suggestions reflect account changes

#### E2E Critical Paths
- Enable Goal Mode → Enter goal → See calculation result
- Switch calculation type → Inputs update correctly
- Add/remove account → Allocation suggestions update

## Non-Goals

- **Per-account goals:** This version focuses on grand total goal only
- **Multiple goals:** Users cannot set multiple target milestones
- **Goal timeline visualization:** Chart showing goal line is out of scope for MVP
- **Inflation adjustment:** Real vs nominal values handled separately
- **Tax implications:** No tax calculations in goal mode
- **Withdrawal modeling:** Drawdown phase not included

## Technical Approach

### Architecture

#### New Components
```
src/components/
├── GoalModeToggle.tsx      # Header toggle switch
├── GoalInputPanel.tsx      # Goal configuration form
├── AllocationSuggestions.tsx # Per-account breakdown
└── GoalProgressBar.tsx     # Visual progress indicator
```

#### New Utilities
```
src/utils/
└── goalCalculations.ts     # Reverse projection math
    ├── calculateRequiredContribution()
    ├── calculateRequiredTerm()
    └── calculateAllocation()
```

#### State Management
- Goal state managed in App.tsx alongside accounts
- Passed down via props to goal components
- Persisted to localStorage with accounts

### Technology Alignment

- **React 19:** Functional components with hooks
- **TypeScript:** Strict typing for goal state and calculations
- **Recharts:** Potential future use for goal visualization
- **CSS:** Extend existing App.css with goal-specific styles
- **Vitest:** Unit tests for calculation functions

### Database

- No database changes (client-only app)
- localStorage schema extended:
```typescript
{
  accounts: AccountInput[],
  goalState: GoalState
}
```

## Design Considerations

### Visual Design
- Goal Mode toggle uses existing `.button` styles
- Goal Input Panel uses existing `.account-card` styling
- Progress bar uses accent color (`--accent: #fde047`)
- Allocation card uses existing `.summary-card` pattern

### Component Reuse
- Reuse `field-group`, `field-row` classes from AccountForm
- Reuse `formatCurrency` for all monetary displays
- Reuse existing button variants

## Implementation Phases

### Phase 1: MVP (This PRD)
- Goal Mode toggle
- Calculate required contribution (single mode)
- Calculate required term (single mode)
- Basic allocation suggestions (proportional only)
- Goal progress indicator

### Phase 2: Enhancements
- Multiple allocation strategies (highest-return, equal)
- Goal line overlay on projection charts
- "What-if" comparison between goal scenarios
- Keyboard shortcuts for goal mode

### Phase 3: Advanced
- Multiple milestone goals
- Goal sharing via URL
- Integration with inflation adjustment feature

## Success Criteria

### Definition of Done
- [ ] All functional requirements implemented
- [ ] Unit tests passing with >80% coverage for new code
- [ ] Integration tests for goal mode flows
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Code review approved
- [ ] README updated with goal mode documentation
- [ ] No console errors or warnings

### Acceptance Criteria

| Requirement | Acceptance Test |
|-------------|-----------------|
| FR-1 | Toggle switches mode, preference persists after refresh |
| FR-2 | All inputs validate, panel shows/hides correctly |
| FR-3 | Contribution calculation matches manual verification |
| FR-4 | Term calculation matches manual verification |
| FR-5 | Allocation sums to total required contribution |
| FR-6 | Progress bar shows correct percentage |

## Dependencies & Risks

### Dependencies
- Existing `buildProjection` function for validation
- Existing account state management
- localStorage availability

### Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Complex math for inverse projection | Medium | Use iterative solver with convergence check |
| Performance with many accounts | Low | Memoize calculations, debounce inputs |
| User confusion between modes | Medium | Clear visual distinction, onboarding tooltip |
| Edge cases in allocation | Low | Comprehensive unit tests, fallback to equal split |

## Open Questions

1. Should allocation suggestions be editable (user can override suggested amounts)?
2. Should we show a warning when goal requires very high contribution rates (>50% of typical income)?

## Assumptions

- Users understand compound interest basics
- Most users will have 1-5 accounts
- Target balances will typically be $10,000 - $10,000,000
- Terms will typically be 5-40 years
- Users prefer seeing results immediately (real-time calculation)
