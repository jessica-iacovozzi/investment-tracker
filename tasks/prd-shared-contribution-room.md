# PRD: Shared Contribution Room Across Same-Type Accounts

## Overview
Enhance the contribution room tracking system to share contribution room limits across all accounts of the same type. Currently, each account tracks its contribution room independently, but in reality, a person's TFSA/RRSP/FHSA contribution room is a single pool shared across all accounts of that type. This feature ensures accurate over-contribution warnings when users have multiple accounts of the same type.

## Business Context
- **Problem:** Users with multiple accounts of the same type (e.g., 2 TFSA accounts at different institutions) see contribution room tracked per-account, which is incorrect. CRA tracks contribution room per person, not per account. A user with $50,000 TFSA room and two TFSA accounts can only contribute $50,000 total, not $50,000 to each.
- **Success Metrics:**
  - Contribution room is correctly shared across same-type accounts
  - Over-contribution warnings trigger when combined contributions exceed shared room
  - Users understand that room is shared (clear UI messaging)
- **Priority:** High

## Target Users
Canadian investors with multiple accounts of the same tax-advantaged type (e.g., TFSA at Bank A and TFSA at Bank B) who need accurate contribution room tracking.

## User Stories
1. As a user with multiple TFSA accounts, I want my contribution room to be shared across all TFSA accounts so that I can accurately track my total contributions against CRA limits.
2. As a user, I want to see a warning when my combined contributions across all accounts of the same type exceed my contribution room.
3. As a user, I want to enter my contribution room once per account type rather than per account, so I don't have to duplicate data.
4. As a user, I want to see how my contribution room is allocated across my accounts of the same type.
5. As a user with one TFSA and one RRSP, I want each account type to track its own separate contribution room.

## Functional Requirements

### Core Functionality

#### 1. Shared Contribution Room Model
- Contribution room is tracked per account type, not per account
- All accounts of the same type share the same contribution room pool
- Each account type (TFSA, RRSP, FHSA) has its own independent room
- Acceptance criteria: Two TFSA accounts with $50,000 room have $50,000 total available, not $100,000

#### 2. Contribution Room Input Location
- Allow input on any account of that type and sync to all accounts of same type
- Acceptance criteria: Changing contribution room on one TFSA updates all TFSAs

#### 3. Combined Contribution Tracking
- Calculate total projected contributions across all accounts of the same type
- Compare combined contributions against shared room
- Display combined contribution totals per account type
- Acceptance criteria: If TFSA-1 contributes $30,000 and TFSA-2 contributes $25,000, system shows $55,000 total TFSA contributions

#### 4. Shared Over-Contribution Warnings
- Trigger warning when combined contributions exceed shared room
- Show which accounts are contributing to the over-contribution
- Calculate penalty based on combined excess
- Acceptance criteria: Warning appears when sum of all TFSA contributions exceeds TFSA room

#### 5. Per-Account Contribution Display
- Each account still shows its own contribution amount
- Each account shows its share of the total room usage
- Summary shows remaining room after all same-type accounts' contributions
- Acceptance criteria: Each account card shows "Using $X of $Y shared room"

#### 6. Account-Type-Specific Fields Sync
- `contributionRoom` syncs across all accounts of same type
- `annualIncomeForRrsp` syncs across all RRSP accounts
- `fhsaLifetimeContributions` syncs across all FHSA accounts
- `customAnnualRoomIncrease` syncs across all accounts of same type
- Acceptance criteria: Updating annual income on one RRSP updates all RRSPs

### Data Requirements

**New/Modified Types:**
```typescript
// No changes to AccountInput type needed
// Sync logic handles sharing at runtime

// New utility type for aggregated room tracking
export type AccountTypeContributionSummary = {
  accountType: AccountType
  sharedContributionRoom: number
  totalProjectedContributions: number
  remainingRoom: number
  accountIds: string[]
  isOverContributing: boolean
  overContributionDetails?: OverContributionDetails
}
```

**Validation Rules:**
- When updating contribution room on one account, propagate to all accounts of same type
- Ensure consistency when accounts are added/removed
- Handle edge case: first account of a type sets the room, subsequent accounts inherit it

### User Interface

#### AccountForm Changes
1. Add visual indicator that contribution room is shared (e.g., "Shared across all TFSA accounts")
2. Show count of accounts sharing this room (e.g., "2 TFSA accounts share this room")
3. Optional: Add link/button to view other accounts of same type

#### AccountSummary Changes
1. Show "Shared contribution room" instead of just "Contribution room"
2. Display "Your contribution: $X" and "All [TYPE] contributions: $Y"
3. Show "Remaining shared room: $Z"
4. Warning banner references all accounts contributing to over-contribution

#### App-Level Changes (Optional Enhancement)
1. Consider adding an account-type summary section showing:
   - Total room per type
   - Combined contributions per type
   - Remaining room per type
2. This provides at-a-glance view of contribution room status

### Integration Points
- `src/utils/contributionRoom.ts` - Add functions for aggregated room calculations
- `src/components/AccountCard.tsx` - Pass all accounts of same type for context
- `src/components/AccountSummary.tsx` - Display shared room information
- `src/components/AccountForm.tsx` - Sync contribution room changes
- `src/App.tsx` - Handle syncing logic when accounts update
- `src/utils/goalCalculations.ts` - Respect shared room limits in allocation

### Security & Privacy
- All data remains local (existing pattern)
- No additional security concerns

### Performance
- Aggregation calculations should be memoized
- Sync operations should be efficient (O(n) where n = number of accounts)

## Non-Functional Requirements

### Accessibility
- Shared room indicators must be screen-reader friendly
- Warning messages clearly state which accounts are affected

### Error Handling
- Graceful handling when accounts of same type have conflicting room values (use most recently updated)
- Clear messaging when sync occurs

### Testing
- Unit tests for aggregated contribution room calculations
- Unit tests for sync logic
- Integration tests for multi-account scenarios
- Test over-contribution detection across multiple accounts

## Non-Goals
- Separate contribution room tracking per account (this is the current incorrect behavior)
- Automatic room detection from CRA
- Cross-user room sharing (spousal accounts)

## Technical Approach

### Architecture
1. **Sync Strategy:** When contribution room (or related fields) changes on one account, propagate to all accounts of same type via `handleAccountUpdate` in App.tsx
2. **Aggregation:** Create utility functions to aggregate contributions across same-type accounts
3. **Display:** Pass aggregated data to AccountSummary for display

### Key Functions to Add/Modify

```typescript
// src/utils/contributionRoom.ts

// Aggregate contributions across all accounts of a given type
export const getAggregatedContributionRoom = (
  accounts: AccountInput[],
  accountType: AccountType
): AccountTypeContributionSummary

// Get all accounts of a specific type
export const getAccountsByType = (
  accounts: AccountInput[],
  accountType: AccountType
): AccountInput[]

// Calculate combined projected contributions for an account type
export const getCombinedProjectedContributions = (
  accounts: AccountInput[],
  accountType: AccountType
): number
```

### Sync Logic in App.tsx
```typescript
const handleAccountUpdate = (payload: AccountUpdatePayload) => {
  setAccounts((prev) => {
    const updated = updateAccount({ accounts: prev, payload })
    // If contribution room fields changed, sync to same-type accounts
    return syncContributionRoomFields(updated, payload)
  })
}
```

### Technology Alignment
- React functional components (existing)
- TypeScript strict mode (existing)
- Vitest for testing (existing)

### Database
- No schema changes (localStorage)
- Migration: Existing accounts keep their values; sync occurs on first edit

## Design Considerations
- Use existing form field patterns
- Add subtle "shared" indicator (icon or text) near contribution room field
- Warning styling matches existing patterns

## Implementation Phases

### Phase 1: Core Sync Logic
1. Implement sync logic for contribution room fields
2. Update App.tsx to propagate changes
3. Add aggregation utility functions

### Phase 2: UI Updates
1. Update AccountSummary to show shared room info
2. Add "shared" indicators to AccountForm
3. Update over-contribution warnings for multi-account context

### Phase 3: Testing & Polish
1. Comprehensive unit tests
2. Edge case handling (add/remove accounts)
3. UI polish and accessibility verification

## Success Criteria

### Definition of Done
- Contribution room syncs across same-type accounts
- Combined contributions correctly calculated
- Over-contribution warnings work for multi-account scenarios
- Tests passing
- Accessibility verified

### Acceptance Criteria
1. Changing contribution room on one TFSA updates all TFSAs
2. Two TFSAs contributing $30k each with $50k room shows over-contribution warning
3. TFSA and RRSP maintain separate contribution rooms
4. UI clearly indicates room is shared
5. Goal calculator respects shared room limits

## Dependencies & Risks

### Dependencies
- Existing contribution room tracking (implemented)

### Risks & Mitigations
- **Risk:** Users confused by auto-sync behavior
  - **Mitigation:** Clear UI messaging ("Shared across X accounts")
- **Risk:** Conflicting values when feature launches
  - **Mitigation:** Use most recent value or highest value as source of truth
- **Risk:** Performance with many accounts
  - **Mitigation:** Memoize aggregation calculations

## Open Questions
None - requirements are clear based on CRA rules.

## Assumptions
- Users understand that CRA tracks room per person, not per account
- Syncing contribution room is the expected behavior
- Most users have 1-3 accounts per type (performance not a concern)
