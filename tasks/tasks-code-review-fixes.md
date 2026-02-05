# Task List: Code Review Fixes for Shared Contribution Room
*From: Code review recommendations*

## Overview
Fix critical and minor issues identified in the shared contribution room implementation to ensure type safety, consistency, and proper edge case handling.

## Architecture Decisions
- **Source of Truth Strategy**: Use most recently updated account as the source of truth for synced fields
- **Type Safety**: Remove all unsafe type assertions and add proper null checks
- **Performance**: Cache filtered account results to avoid redundant filtering operations
- **Error Handling**: Add graceful degradation for edge cases with clear error messages

## Relevant Files

### Files to Modify
- `src/utils/sharedContributionRoom.ts` - Fix race condition, type safety, and consistency issues
- `src/components/AccountSummary.tsx` - Add null checks for aggregated summary calculations
- `src/utils/sharedContributionRoom.test.ts` - Add missing test cases for edge conditions

### Testing
- Unit: `npm test src/utils/sharedContributionRoom.test.ts`
- All: `npm test`

## Tasks

- [x] 1.0 Critical Fixes: Type Safety & Race Conditions
  - [x] 1.1 Fix unsafe type assertion in `syncContributionRoomFields` (line 235)
  - [x] 1.2 Add proper typing for syncValues object using Partial<Pick<AccountInput, typeof SYNCED_FIELDS_BY_TYPE[AccountType]>>>
  - [x] 1.3 Add null checks in AccountSummary for aggregatedSummary calculations (line 67)
  - [x] 1.4 Add defensive programming for undefined values in contribution room calculations

- [x] 2.0 Consistency: Source of Truth Strategy
  - [x] 2.1 Update `getSharedContributionRoom` to use most recently updated account instead of first account
  - [x] 2.2 Update `getSharedAvailableRoom` to use same source of truth strategy
  - [x] 2.3 Update `getSharedFieldSeedValues` to use most recently updated account with defined values
  - [x] 2.4 Add helper function `getMostRecentAccountByType` to centralize source of truth logic
  - [x] 2.5 Add timestamp tracking to AccountInput type for "most recent" determination (or use array order as proxy)

- [x] 3.0 Edge Cases & Error Handling
  - [x] 3.1 Fix `getSharedAvailableRoom` to return appropriate value when no accounts exist (should return -1 for non-registered, 0 for others)
  - [x] 3.2 Add graceful handling when all accounts of a type have undefined contribution room
  - [x] 3.3 Add error boundary for malformed account data in aggregation functions
  - [x] 3.4 Add validation for negative contribution room values

- [x] 4.0 Performance Optimization
  - [x] 4.1 Create `getAccountsByTypeCached` function to cache filtered results
  - [x] 4.2 Refactor `getAggregatedContributionSummary` to pass filtered accounts between functions
  - [x] 4.3 Add memoization for expensive calculations using React.useMemo in components
  - [x] 4.4 Optimize test data building to reduce object creation overhead

- [x] 5.0 Test Coverage: Missing Edge Cases
  - [x] 5.1 Add test for `getSharedFieldSeedValues` when no accounts have defined synced fields
  - [x] 5.2 Add test for race condition scenario with multiple field updates
  - [x] 5.3 Add test for inconsistent contribution room values across accounts
  - [x] 5.4 Add test for undefined/null values in aggregated summary calculations
  - [x] 5.5 Add test for performance with large number of accounts (50+ accounts)

- [x] 6.0 Documentation & Code Quality
  - [x] 6.1 Add JSDoc comments explaining source of truth strategy
  - [x] 6.2 Add inline comments for complex sync logic
  - [x] 6.3 Add error messages for debugging sync issues
  - [x] 6.4 Add TypeScript eslint rules to prevent unsafe type assertions

## Validation Checklist
- [x] All critical issues from code review addressed
- [x] Type safety verified with strict TypeScript mode
- [x] Edge cases properly handled with graceful degradation
- [x] Performance optimized for large account sets
- [x] Test coverage >95% for shared contribution room functionality
- [x] No unsafe type assertions remain
- [x] Consistent source of truth strategy implemented

## Estimated Effort
- Total: 6 parent tasks, 22 sub-tasks
- Time: 4-5 hours (mid-level dev)
- Can parallelize: Tasks 3.0 and 4.0 can be done together; Task 5.0 can parallelize after 1.0-2.0 complete
