# Task List: Remove Locked-in Account Checkbox
*From: `prd-remove-locked-in-checkbox.md`*

## Overview
Remove the redundant "Locked-in account" checkbox from the account form. The `isLockedIn` property will be derived solely from account type (LIRA = locked, all others = not locked).

## Architecture Decisions
- Keep `isLockedIn` property on `AccountInput` type for backward compatibility
- Derive `isLockedIn` purely from `isLockedAccountType()` in normalization
- Remove UI checkbox and handler; no user override allowed

## Relevant Files

### Files to Modify
- `src/components/AccountForm.tsx` - Remove checkbox UI and `handleLockedInChange` handler
- `src/components/AccountForm.test.tsx` - Remove/update locked-in checkbox tests
- `src/utils/accountNormalization.ts` - Simplify `isLockedIn` derivation

### Testing
- Unit: `npm test -- src/components/AccountForm.test.tsx`
- Unit: `npm test -- src/utils/accountNormalization.test.ts`
- All: `npm test`

## Tasks

- [x] 1.0 Remove Locked-in Checkbox from AccountForm
  - [x] 1.1 Remove `handleLockedInChange` handler function (lines 132-134)
  - [x] 1.2 Remove locked-in checkbox UI block (lines 439-469)
  - [x] 1.3 Update `handleAccountTypeChange` to always derive `isLockedIn` from account type

- [x] 2.0 Update Account Normalization
  - [x] 2.1 Simplify `normalizedIsLockedIn` to always use `isLockedAccountType()` result (not preserve existing value for non-locked types)

- [x] 3.0 Update Tests
  - [x] 3.1 Remove test "hides locked-in toggle for LIRA accounts" (now irrelevant)
  - [x] 3.2 Add test verifying locked-in checkbox is not rendered for any account type

- [x] 4.0 Validation
  - [x] 4.1 Run all tests to verify no regressions
  - [x] 4.2 Manual verification that LIRA accounts are still treated as locked

## Validation Checklist
- [x] All PRD requirements covered
- [x] Tests for all functionality
- [x] File paths match project structure
- [x] Dependencies properly ordered
- [x] Error handling addressed

## Estimated Effort
- Total: 4 parent tasks, 8 sub-tasks
- Time: 30-45 minutes
- Can parallelize: None (sequential changes)
