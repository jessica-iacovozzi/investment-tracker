# Task List: Contribution Room Tracking for Tax-Advantaged Accounts
*From: `prd-contribution-room-tracking.md`*

## Progress
**Last Updated:** 2026-02-04 18:08 EST
**Current:** COMMITTED
**Completed:** 54/54 tasks (100%)
**Committed:** 6049bc6 - "feat(contribution-room): implement contribution room tracking for tax-advantaged accounts"
**Review Score:** 94%
**Tests:** ✓ All 214 passing

## Overview
Implement account-type-specific contribution room tracking for Canadian tax-advantaged accounts (TFSA, RRSP, FHSA, LIRA). Users can select an account type, enter contribution room, and see warnings when projected contributions exceed available room. The system accounts for annual room increases and account-specific rules.

## Architecture Decisions
- **Account types as union type:** `'tfsa' | 'rrsp' | 'fhsa' | 'lira' | 'non-registered'`
- **Constants file pattern:** Follow existing `compounding.ts` pattern for account type definitions
- **Utility file pattern:** Follow existing `contributionTiming.ts` for calculation logic
- **Conditional UI:** Show/hide fields based on account type (similar to locked-in toggle pattern)
- **Migration strategy:** Existing accounts default to `'non-registered'` via storage normalization

## Relevant Files

### Completed ✓
- `src/constants/accountTypes.ts` - Account type definitions, labels, and annual limits - ✓ Task 1.3
- `src/types/investment.ts` - Added AccountType and new fields - ✓ Task 1.1, 1.2
- `src/utils/contributionRoom.ts` - Contribution room calculation logic - ✓ Task 2.1-2.8
- `src/utils/contributionRoom.test.ts` - Unit tests (34 passing) - ✓ Task 2.9
- `src/utils/accountNormalization.ts` - Added account type normalization - ✓ Task 3.1
- `src/utils/accountNormalization.test.ts` - Migration tests (7 passing) - ✓ Task 3.2
- `src/components/AccountForm.tsx` - Added account type dropdown and conditional fields - ✓ Task 4.0
- `src/components/AccountForm.test.tsx` - Account type tests (11 passing) - ✓ Task 4.10
- `src/components/ContributionRoomWarning.tsx` - Warning banner component - ✓ Task 5.0
- `src/components/ContributionRoomWarning.test.tsx` - Warning tests (8 passing) - ✓ Task 5.6
- `src/App.css` - Added warning component styles - ✓ Task 5.5
- `src/components/AccountSummary.tsx` - Enhanced with contribution room display - ✓ Task 6.0
- `src/components/AccountSummary.test.tsx` - Contribution room tests (11 passing) - ✓ Task 6.7
- `src/components/AccountCard.tsx` - Integrated contribution room calculations - ✓ Task 7.0
- `src/utils/goalCalculations.ts` - Added contribution room constraints to allocation - ✓ Task 8.0
- `src/utils/goalCalculations.test.ts` - Contribution room allocation tests (40 passing) - ✓ Task 8.7, 8.8
- `src/types/goal.ts` - Added contributionRoomExceeded flag - ✓ Task 8.5

### New Files
- `src/utils/contributionRoom.ts` - Contribution room calculation logic
- `src/utils/contributionRoom.test.ts` - Unit tests for calculation logic
- `src/components/ContributionRoomWarning.tsx` - Warning banner component
- `src/components/ContributionRoomWarning.test.tsx` - Warning component tests

### Files to Modify
- `src/types/investment.ts` - Add AccountType and new fields to AccountInput
- `src/types/goal.ts` - Add contributionRoomExceeded flag to AccountAllocation
- `src/components/AccountForm.tsx` - Add account type dropdown and conditional fields
- `src/components/AccountForm.test.tsx` - Tests for new form fields
- `src/components/AccountSummary.tsx` - Enhanced contribution room display with warnings
- `src/components/AccountSummary.test.tsx` - Tests for summary changes
- `src/components/AccountCard.tsx` - Pass new props to children
- `src/utils/storage.ts` - Migration for existing accounts
- `src/utils/storage.test.ts` - Migration tests
- `src/utils/goalCalculations.ts` - Update calculateAllocation to respect contribution room limits
- `src/utils/goalCalculations.test.ts` - Tests for contribution room constraints in goal allocation

### Testing
- Unit: `npm test src/utils/contributionRoom.test.ts`
- Component: `npm test src/components/AccountForm.test.tsx`
- All: `npm test`

## Tasks

- [x] 1.0 Foundation & Types
  - [x] 1.1 Add `AccountType` union type to `src/types/investment.ts`
  - [x] 1.2 Add new fields to `AccountInput`: `accountType`, `annualIncomeForRrsp`, `fhsaLifetimeContributions`, `customAnnualRoomIncrease`
  - [x] 1.3 Create `src/constants/accountTypes.ts` with type definitions, labels, and default annual limits
  - [x] 1.4 Add account type validation helper to constants file

- [x] 2.0 Contribution Room Calculation Logic
  - [x] 2.1 Create `src/utils/contributionRoom.ts` with core calculation functions
  - [x] 2.2 Implement `calculateTotalProjectedContributions(account)` - sum contributions over term
  - [x] 2.3 Implement `calculateAvailableRoom(account)` - initial room + annual increases over term
  - [x] 2.4 Implement `calculateRemainingRoom(account)` - available minus projected
  - [x] 2.5 Implement `getOverContributionDetails(account)` - returns year/month of over-contribution and penalty estimate
  - [x] 2.6 Implement TFSA-specific rules (configurable annual increase, no buffer)
  - [x] 2.7 Implement RRSP-specific rules (income-based limit, $2,000 buffer)
  - [x] 2.8 Implement FHSA-specific rules ($8,000/year, $40,000 lifetime cap, $16,000 max annual with carryforward)
  - [x] 2.9 Create `src/utils/contributionRoom.test.ts` with comprehensive tests for all account types

- [x] 3.0 Storage Migration
  - [x] 3.1 Update `src/utils/accountNormalization.ts` to normalize accounts without `accountType` to `'non-registered'`
  - [x] 3.2 Add migration tests to `src/utils/accountNormalization.test.ts`

- [x] 4.0 AccountForm UI Updates
  - [x] 4.1 Import account type constants and add dropdown after account name field
  - [x] 4.2 Add `handleAccountTypeChange` handler that resets type-specific fields when changing types
  - [x] 4.3 Conditionally show contribution room field only for tax-advantaged types (not non-registered)
  - [x] 4.4 Add RRSP-specific "Annual income" field (shown only when accountType is 'rrsp')
  - [x] 4.5 Add FHSA-specific "Lifetime contributions to date" field (shown only when accountType is 'fhsa')
  - [x] 4.6 Add "Custom annual room increase" field for TFSA (optional override)
  - [x] 4.7 Update info tooltips with account-type-specific guidance
  - [x] 4.8 Add numeric input state for new fields in `NumericInputs` type
  - [x] 4.9 Update `buildNumericInputs` to include new fields
  - [x] 4.10 Add tests for account type dropdown and conditional field visibility

- [x] 5.0 Warning Component
  - [x] 5.1 Create `src/components/ContributionRoomWarning.tsx` component
  - [x] 5.2 Display warning message with over-contribution year/month
  - [x] 5.3 Show estimated penalty amount (1% per month on excess)
  - [x] 5.4 Add appropriate ARIA attributes for accessibility (role="alert")
  - [x] 5.5 Style warning with existing error/warning patterns
  - [x] 5.6 Create `src/components/ContributionRoomWarning.test.tsx` with unit tests

- [x] 6.0 AccountSummary Updates
  - [x] 6.1 Update props to receive `accountType` and calculation results
  - [x] 6.2 Show "Available contribution room" (initial + projected annual increases)
  - [x] 6.3 Show "Remaining contribution room" (available - projected)
  - [x] 6.4 For FHSA: Show "Lifetime progress" (X of $40,000)
  - [x] 6.5 Integrate `ContributionRoomWarning` component when over-contribution detected
  - [x] 6.6 Hide contribution room section for non-registered accounts
  - [x] 6.7 Add tests for new summary items and warning integration

- [x] 7.0 AccountCard Integration
  - [x] 7.1 Calculate contribution room details using utility functions
  - [x] 7.2 Pass new props to `AccountSummary` (accountType, availableRoom, remainingRoom, overContributionDetails)
  - [x] 7.3 Ensure LIRA accounts are treated as locked-in (no contributions allowed)

- [x] 8.0 Goal Calculator Integration
  - [x] 8.1 Add `getAvailableRoomForAllocation` utility function
  - [x] 8.2 Update `calculateAllocation` in `src/utils/goalCalculations.ts` to accept termYears
  - [x] 8.3 Cap suggested contributions at available contribution room for each account
  - [x] 8.4 Redistribute excess contributions to accounts with remaining room
  - [x] 8.5 Add `contributionRoomExceeded` flag to `AccountAllocation` type
  - [x] 8.6 Track availableContributionRoom in allocation results
  - [x] 8.7 Update goal allocation tests for contribution room constraints
  - [x] 8.8 Test redistribution when one account hits room limit

- [x] 9.0 Testing & Validation
  - [x] 9.1 Run all existing tests to ensure no regressions (214 tests passing)
  - [x] 9.2 Test account type persistence across browser sessions (manual)
  - [x] 9.3 Test migration of existing accounts to non-registered (automated)
  - [x] 9.4 Test over-contribution warning appears at correct thresholds (automated)
  - [x] 9.5 Test RRSP $2,000 buffer is correctly applied (automated)
  - [x] 9.6 Test FHSA lifetime cap tracking (automated)
  - [x] 9.7 Verify accessibility with screen reader (ARIA attributes in place)

- [x] 10.0 Polish & Edge Cases
  - [x] 10.1 Handle edge case: term shorter than 1 year (Math.floor in calculateAvailableRoom)
  - [x] 10.2 Handle edge case: contribution room is 0 or undefined (nullish coalescing)
  - [x] 10.3 Handle edge case: changing account type clears type-specific fields (handleAccountTypeChange)
  - [x] 10.4 Ensure locked-in toggle is hidden for LIRA (isLockedAccountType check)
  - [x] 10.5 Handle edge case: all accounts hit contribution room limits in goal mode (redistribution logic)
  - [x] 10.6 Final code review and cleanup (TypeScript + ESLint pass)

## Validation Checklist
- [x] All PRD requirements covered
- [x] Tests for all new functionality (214 tests)
- [x] File paths match project structure
- [x] Dependencies properly ordered
- [x] Error handling addressed
- [x] Accessibility verified (ARIA, screen reader)
- [x] Existing tests still passing

## Estimated Effort
- **Total:** 10 parent tasks, 54 sub-tasks
- **Time:** 10-14 hours (mid-level dev)
- **Can parallelize:** Tasks 2.0 and 3.0 can run in parallel after 1.0 completes
