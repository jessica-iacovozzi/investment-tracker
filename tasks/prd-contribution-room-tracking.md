# PRD: Contribution Room Tracking for Tax-Advantaged Accounts

## Overview
Enhance the investment tracker to support account-type-specific contribution room tracking for Canadian tax-advantaged accounts (TFSA, RRSP, FHSA). Users will be able to set their current contribution room, see warnings when projected contributions exceed available room, and track remaining room after planned contributions with support for annual room increases.

## Business Context
- **Problem:** Users with tax-advantaged accounts need to track contribution room to avoid CRA penalties (1% per month on over-contributions). The current implementation only displays a static contribution room value without validation or dynamic tracking.
- **Success Metrics:**
  - Users can accurately track remaining contribution room
  - Warnings prevent accidental over-contributions
  - Annual room increases are correctly projected
- **Priority:** High

## Target Users
Individual investors in Canada managing TFSA, RRSP, and/or FHSA accounts who want to maximize contributions without exceeding CRA limits.

## User Stories
1. As a user, I want to select an account type (TFSA, RRSP, FHSA, or Non-registered) so that the app applies the correct contribution rules.
2. As a user, I want to enter my current contribution room so that I can track how much I can still contribute.
3. As a user, I want to see a warning when my projected contributions exceed my available contribution room so that I can avoid penalties.
4. As a user, I want the app to account for annual contribution room increases so that my long-term projections are accurate.
5. As a user with an RRSP, I want to enter my income-based contribution limit so that my room is calculated correctly.

## Functional Requirements

### Core Functionality

#### 1. Account Type Selection
- Add `accountType` field with options: `'tfsa' | 'rrsp' | 'fhsa' | 'non-registered'`
- Default to `'non-registered'` for new accounts
- Account type determines which contribution room rules apply
- Acceptance criteria: User can select account type from dropdown; selection persists across sessions

#### 2. Contribution Room Input
- Show contribution room field only for tax-advantaged account types (TFSA, RRSP, FHSA)
- Hide for non-registered accounts
- Acceptance criteria: Field visibility toggles based on account type

#### 3. Account-Specific Rules

**TFSA:**
- Annual limit: $7,000 (2024-2026), indexed to inflation
- No income-based limit
- Unused room carries forward indefinitely
- No over-contribution buffer (1% penalty on every dollar over)
- Withdrawals restore room the following year (out of scope for MVP)

**RRSP:**
- Annual limit: 18% of previous year's earned income, up to maximum ($31,560 for 2024)
- Requires income input to calculate limit
- $2,000 over-contribution buffer before penalties apply
- Unused room carries forward indefinitely
- Withdrawals do NOT restore room

**FHSA:**
- Annual limit: $8,000
- Lifetime maximum: $40,000
- Unused room carries forward (max $8,000 carryforward per year, so max annual contribution is $16,000)
- No over-contribution buffer
- Account must be closed within 15 years of opening or when user turns 71

#### 4. Contribution Room Tracking
- Calculate total projected contributions over the term
- Compare against available room (initial room + annual increases over term)
- Display remaining room after all projected contributions
- Acceptance criteria: Summary shows "Remaining contribution room" with accurate calculation

#### 5. Over-Contribution Warnings
- Display warning when projected contributions exceed available room
- Show which year the over-contribution would occur
- Calculate potential penalty amount (1% per month on excess)
- Acceptance criteria: Warning appears in AccountSummary when contributions exceed room

#### 6. Annual Room Increase Projection
- For multi-year terms, add annual room increases to available room
- TFSA: Add $7,000 per year (or configurable amount for future indexing)
- RRSP: Add user-specified annual limit or use default maximum
- FHSA: Add $8,000 per year until lifetime max reached
- Acceptance criteria: Projections correctly account for room increases each year

#### 7. Goal Calculator Integration
- When calculating "Additional Contributions Needed" in goal mode, respect contribution room limits
- Do not suggest contribution increases for accounts that have hit their contribution room limit
- Cap suggested contributions at the available contribution room for each account
- Redistribute excess contributions to other accounts with available room
- If total goal cannot be reached due to contribution room limits, display a warning message
- Acceptance criteria: Goal allocation never suggests contributions exceeding available room

### Data Requirements

**New/Modified Types:**
```typescript
export type AccountType = 'tfsa' | 'rrsp' | 'fhsa' | 'non-registered'

export type AccountInput = {
  // ... existing fields
  accountType: AccountType
  contributionRoom?: number
  // RRSP-specific
  annualIncomeForRrsp?: number
  // FHSA-specific
  fhsaLifetimeContributions?: number
}
```

**Validation Rules:**
- `contributionRoom` must be >= 0
- `annualIncomeForRrsp` must be >= 0 when account type is RRSP
- `fhsaLifetimeContributions` must be >= 0 and <= 40,000

### User Interface

#### AccountForm Changes
1. Add account type dropdown (first field after account name)
2. Conditionally show contribution room field based on account type
3. For RRSP: Add "Annual income" field to calculate contribution limit
4. For FHSA: Add "Lifetime contributions to date" field
5. Update info tooltips with account-specific guidance

#### AccountSummary Changes
1. Show "Available contribution room" (initial + projected annual increases)
2. Show "Projected contributions" total
3. Show "Remaining contribution room" (available - projected)
4. Show warning banner if over-contribution detected
5. For FHSA: Show progress toward $40,000 lifetime limit

### Integration Points
- Existing `AccountForm` component
- Existing `AccountSummary` component
- Existing projection calculation utilities
- Local storage persistence (existing pattern)
- **Goal calculator** (`src/utils/goalCalculations.ts`) - `calculateAllocation` function must respect contribution room limits

### Security & Privacy
- All data stored locally in browser (existing pattern)
- No external API calls required
- Income data (for RRSP) stays on device

### Performance
- Contribution room calculations should be instant (<50ms)
- No impact on existing projection performance

## Non-Functional Requirements

### Accessibility
- All new form fields must have proper labels
- Warning messages must be announced to screen readers
- Color-coded warnings must have text alternatives

### Error Handling
- Invalid contribution room values default to 0
- Clear error messages for validation failures
- Graceful handling of missing optional fields

### Testing
- Unit tests for contribution room calculation logic
- Unit tests for each account type's rules
- Integration tests for AccountForm with account types
- Test over-contribution warning display

## Non-Goals
- Withdrawal tracking and room restoration (future enhancement)
- Spousal RRSP contributions
- HBP (Home Buyers' Plan) or LLP (Lifelong Learning Plan) tracking
- Integration with CRA to fetch actual contribution room
- Tax calculation or optimization recommendations
- RESP or RDSP account types

## Technical Approach

### Architecture
- Add new `accountType` field to `AccountInput` type
- Create `src/constants/accountTypes.ts` for account type definitions and rules
- Create `src/utils/contributionRoom.ts` for room calculation logic
- Extend `AccountForm` with conditional fields
- Extend `AccountSummary` with room tracking display

### Technology Alignment
- React functional components (existing pattern)
- TypeScript strict mode (existing pattern)
- Vitest for testing (existing pattern)
- CSS modules for styling (existing pattern)

### Database
- No database changes (localStorage only)
- Migration: Existing accounts default to `accountType: 'non-registered'`

## Design Considerations
- Use existing form field patterns and styling
- Warning styling should match any existing warning/error patterns
- Info tooltips follow existing pattern with SVG icon

## Implementation Phases

### Phase 1: MVP
1. Add account type selection
2. Implement TFSA contribution room tracking with warnings
3. Show remaining room in summary
4. Basic annual room increase projection

### Phase 2: Full Account Support
1. Add RRSP-specific fields and rules
2. Add FHSA-specific fields and lifetime tracking
3. Enhanced warning details (penalty calculations)

### Phase 3: Enhancements (Future)
1. Withdrawal tracking for TFSA room restoration
2. Visual timeline showing when room runs out
3. Contribution optimization suggestions

## Success Criteria

### Definition of Done
- All functional requirements implemented
- Unit tests passing with >80% coverage on new code
- Existing tests still passing
- Code review approved
- Accessibility verified with screen reader

### Acceptance Criteria
1. User can select account type for any account
2. Contribution room field appears only for tax-advantaged accounts
3. Summary displays remaining contribution room
4. Warning appears when projected contributions exceed room
5. Annual room increases are factored into multi-year projections
6. All data persists across browser sessions

## Dependencies & Risks

### Dependencies
- None (self-contained feature)

### Risks & Mitigations
- **Risk:** CRA changes annual limits
  - **Mitigation:** Make annual limits configurable constants, easy to update
- **Risk:** Complex RRSP rules (pension adjustments, etc.)
  - **Mitigation:** MVP uses simplified model; advanced rules in future phase

## Open Questions
1. Should we support custom annual room increase amounts for future TFSA indexing? yes
2. Should locked-in accounts (LIRA) have a separate account type or remain as a flag? separated from non-registered accounts

## Assumptions
- Users know their current contribution room (can check CRA My Account)
- Annual TFSA limit remains $7,000 for near-term projections
- Users will manually update contribution room as needed
- Existing accounts without `accountType` are treated as non-registered
