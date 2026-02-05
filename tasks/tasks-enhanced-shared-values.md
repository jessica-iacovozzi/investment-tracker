# Task List: Enhanced Shared Account Values
*From: `prd-shared-contribution-room.md`*

## Overview
Enhance the shared account values functionality to provide clear visual indicators and proper synchronization for both contribution room and custom annual room increase fields across same-type accounts. The implementation will ensure users understand when values are shared and provide immediate visual feedback when changes are propagated.

## Architecture Decisions
- **Visual Consistency:** Apply shared indicators to all synced fields (contribution room, custom annual room increase, annual income for RRSP, FHSA lifetime contributions)
- **Real-time Feedback:** Show shared indicators immediately when multiple same-type accounts exist
- **Field-specific Messaging:** Provide clear, field-specific shared indicators that explain what's being shared
- **Accessibility:** Ensure all shared indicators are properly announced by screen readers
- **Validation:** Maintain existing validation and sync logic while improving UX

## Relevant Files

### Files to Modify
- `src/components/AccountForm.tsx` - Add shared indicators to all synced fields
- `src/components/AccountSummary.tsx` - Enhance shared room display with field-specific info
- `src/utils/sharedContributionRoom.ts` - Add utility functions for field-specific messaging
- `src/utils/sharedContributionRoom.test.ts` - Add tests for new utility functions

### Testing
- Unit: `npm test src/utils/sharedContributionRoom.test.ts`
- Integration: Manual testing with multiple same-type accounts

## Tasks

- [x] 1.0 Foundation: Field-specific Messaging Utilities
  - [x] 1.1 Add `getSharedFieldLabel` function to return field-specific labels
  - [x] 1.2 Add `getSharedFieldDescription` function to return field-specific descriptions
  - [x] 1.3 Add `getFieldSharedMessage` function to generate complete shared indicator text
  - [x] 1.4 Write unit tests for new messaging utility functions

- [x] 2.0 AccountForm: Enhanced Shared Indicators
  - [x] 2.1 Add shared indicator to contribution room field (enhance existing)
  - [x] 2.2 Add shared indicator to custom annual room increase field for TFSA
  - [x] 2.3 Add shared indicator to annual income field for RRSP
  - [x] 2.4 Add shared indicator to FHSA lifetime contributions field for FHSA
  - [x] 2.5 Create reusable `SharedFieldIndicator` component for consistency
  - [x] 2.6 Ensure proper accessibility attributes on all shared indicators

- [x] 3.0 AccountSummary: Enhanced Shared Room Display
  - [x] 3.1 Add field-specific breakdown in shared room section
  - [x] 3.2 Show which fields are being shared in the summary
  - [x] 3.3 Add tooltip or expandable section for detailed shared field information
  - [x] 3.4 Update shared room calculation to reflect all synced fields

- [x] 4.0 User Experience Improvements
  - [x] 4.1 Add visual emphasis (icon, color) to shared fields
  - [x] 4.2 Add hover states to shared indicators with additional information
  - [x] 4.3 Ensure shared indicators appear/disappear dynamically as accounts are added/removed
  - [x] 4.4 Add smooth transitions for shared indicator appearance

- [x] 5.0 Testing & Validation
  - [x] 5.1 Test shared indicators with multiple TFSA accounts
  - [x] 5.2 Test shared indicators with multiple RRSP accounts
  - [x] 5.3 Test shared indicators with multiple FHSA accounts
  - [x] 5.4 Test shared indicators when account type is changed
  - [x] 5.5 Test shared indicators when accounts are deleted
  - [x] 5.6 Verify accessibility with screen reader testing
  - [x] 5.7 Test edge cases: empty values, zero values, invalid inputs

- [x] 6.0 Polish & Documentation
  - [x] 6.1 Add JSDoc comments to new utility functions
  - [x] 6.2 Update component prop types for enhanced shared indicators
  - [x] 6.3 Optimize performance of shared indicator rendering
  - [x] 6.4 Ensure consistent styling across all shared indicators

## Validation Checklist
- [x] All synced fields have appropriate shared indicators
- [x] Shared indicators are field-specific and informative
- [x] Accessibility standards are met for all shared indicators
- [x] Visual consistency across all shared field indicators
- [x] Proper sync behavior maintained for all fields
- [x] Edge cases handled appropriately
- [x] Performance impact is minimal

## Estimated Effort
- Total: 6 parent tasks, 22 sub-tasks
- Time: 4-5 hours (mid-level dev)
- Can parallelize: Tasks 2.0 and 3.0 can be parallelized after 1.0; Task 5.0 can run in parallel with development
