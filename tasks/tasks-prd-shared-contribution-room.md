# Task List: Shared Contribution Room Across Same-Type Accounts
*From: `prd-shared-contribution-room.md`*

## Overview
Implement shared contribution room tracking across accounts of the same type. The key changes are:
1. Add sync logic to propagate contribution room field changes across same-type accounts
2. Create aggregation utilities to calculate combined contributions per account type
3. Update UI to display shared room information and combined contribution warnings
4. Update goal calculator to respect shared room limits

## Architecture Decisions
- **Sync Strategy:** Sync contribution room fields in `App.tsx` when any account updates, propagating to all accounts of the same type
- **Aggregation:** Add utility functions in `contributionRoom.ts` to aggregate contributions across same-type accounts
- **UI Pattern:** Pass aggregated data as props to `AccountSummary` rather than computing in component
- **No Type Changes:** Use existing `AccountInput` type; sync logic handles sharing at runtime

## Relevant Files

### New Files
- `src/utils/sharedContributionRoom.ts` - Aggregation and sync utilities
- `src/utils/sharedContributionRoom.test.ts` - Unit tests for aggregation/sync

### Files to Modify
- `src/App.tsx` - Add sync logic to `handleAccountUpdate`
- `src/components/AccountCard.tsx` - Pass aggregated room data to AccountSummary
- `src/components/AccountSummary.tsx` - Display shared room info and combined contributions
- `src/components/AccountForm.tsx` - Add "shared" indicator near contribution room field
- `src/components/ContributionRoomWarning.tsx` - Update warning for multi-account context
- `src/utils/goalCalculations.ts` - Update `getAvailableRoomForAllocation` to use shared room

### Testing
- Unit: `npm test src/utils/sharedContributionRoom.test.ts`
- All: `npm test`

## Tasks

- [x] 1.0 Foundation: Aggregation Utilities
  - [x] 1.1 Create `src/utils/sharedContributionRoom.ts` with `getAccountsByType` function
  - [x] 1.2 Add `getCombinedProjectedContributions` function to calculate total contributions for an account type
  - [x] 1.3 Add `getSharedAvailableRoom` function to get available room for an account type (uses first account's room)
  - [x] 1.4 Add `getAggregatedContributionSummary` function returning `AccountTypeContributionSummary`
  - [x] 1.5 Add `AccountTypeContributionSummary` type to `src/types/investment.ts`
  - [x] 1.6 Write unit tests for all aggregation functions in `src/utils/sharedContributionRoom.test.ts`

- [x] 2.0 Foundation: Sync Logic
  - [x] 2.1 Add `syncContributionRoomFields` function to `sharedContributionRoom.ts`
  - [x] 2.2 Sync `contributionRoom` across all accounts of same type
  - [x] 2.3 Sync `annualIncomeForRrsp` across all RRSP accounts
  - [x] 2.4 Sync `fhsaLifetimeContributions` across all FHSA accounts
  - [x] 2.5 Sync `customAnnualRoomIncrease` across all accounts of same type
  - [x] 2.6 Write unit tests for sync logic

- [x] 3.0 App Integration: Sync on Update
  - [x] 3.1 Import `syncContributionRoomFields` in `App.tsx`
  - [x] 3.2 Modify `handleAccountUpdate` to call sync after updating account
  - [x] 3.3 Test sync behavior manually with multiple same-type accounts

- [x] 4.0 AccountCard: Pass Aggregated Data
  - [x] 4.1 Import aggregation utilities in `AccountCard.tsx`
  - [x] 4.2 Add `allAccounts` prop to `AccountCard` component
  - [x] 4.3 Calculate `aggregatedContributionSummary` using `getAggregatedContributionSummary`
  - [x] 4.4 Pass aggregated data to `AccountSummary` component
  - [x] 4.5 Update `App.tsx` to pass `allAccounts` prop to each `AccountCard`

- [x] 5.0 AccountSummary: Display Shared Room Info
  - [x] 5.1 Add `aggregatedSummary` prop to `AccountSummaryProps`
  - [x] 5.2 Update contribution room section header to "Shared Contribution Room"
  - [x] 5.3 Add "This account's contribution" line showing account's own contribution
  - [x] 5.4 Add "All [TYPE] contributions" line showing combined contributions
  - [x] 5.5 Update "Remaining room" to use shared remaining room from aggregated summary
  - [x] 5.6 Add count indicator (e.g., "Shared across 2 TFSA accounts")

- [x] 6.0 AccountForm: Shared Indicator
  - [x] 6.1 Add `sameTypeAccountCount` prop to `AccountForm`
  - [x] 6.2 Display "Shared across X [TYPE] accounts" text below contribution room field when count > 1
  - [x] 6.3 Update `AccountCard` to pass `sameTypeAccountCount` to `AccountForm`

- [x] 7.0 ContributionRoomWarning: Multi-Account Context
  - [x] 7.1 Add `accountCount` prop to `ContributionRoomWarning`
  - [x] 7.2 Update warning text to reference "combined contributions across X accounts" when count > 1
  - [x] 7.3 Update `AccountSummary` to pass account count to warning component

- [x] 8.0 Goal Calculator: Shared Room Limits
  - [x] 8.1 Update `getAvailableRoomForAllocation` in `goalCalculations.ts` to accept `allAccounts` parameter
  - [x] 8.2 Calculate shared available room minus contributions from other same-type accounts
  - [x] 8.3 Update `calculateAllocation` to pass `allAccounts` to room calculation
  - [x] 8.4 Write tests for goal allocation with shared room limits

- [x] 9.0 Testing & Validation
  - [x] 9.1 Add integration test: sync contribution room across 2 TFSAs
  - [x] 9.2 Add integration test: over-contribution warning with combined contributions
  - [x] 9.3 Add integration test: TFSA and RRSP maintain separate rooms
  - [x] 9.4 Verify accessibility of shared room indicators
  - [x] 9.5 Manual testing with multiple account scenarios

- [x] 10.0 Polish & Edge Cases
  - [x] 10.1 Handle edge case: first account of a type sets room, new accounts inherit
  - [x] 10.2 Handle edge case: deleting an account doesn't affect other same-type accounts' room
  - [x] 10.3 Handle edge case: changing account type clears/syncs room appropriately
  - [x] 10.4 Ensure localStorage persistence works correctly with synced values

## Validation Checklist
- [x] All PRD requirements covered
- [x] Tests for all new functionality
- [x] File paths match project structure
- [x] Dependencies properly ordered
- [x] Error handling addressed
- [x] Accessibility verified

## Estimated Effort
- Total: 10 parent tasks, 38 sub-tasks
- Time: 6-8 hours (mid-level dev)
- Can parallelize: Tasks 1.0 and 2.0 can be done together; Tasks 5.0, 6.0, 7.0 can be parallelized after 4.0
