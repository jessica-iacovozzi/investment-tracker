# PRD: Remove Locked-in Account Checkbox

## Overview
Remove the manual "Locked-in account" checkbox from the account form since the locked-in status is now automatically determined by the account type (LIRA accounts are inherently locked).

## Business Context
- **Problem:** The locked-in checkbox is redundant now that account types exist. LIRA is the only locked account type, and selecting it automatically sets `isLockedIn: true`. The checkbox adds unnecessary UI complexity and potential user confusion.
- **Success Metrics:** Simplified form UI, reduced code complexity, no change in functionality for locked account behavior
- **Priority:** Low

## Target Users
Individual investors tracking their investment accounts who want a streamlined form experience.

## User Stories
1. As a user, I want the form to be simpler so that I can focus on relevant inputs for my account type.
2. As a user with a LIRA account, I expect it to automatically be treated as locked without manual intervention.

## Functional Requirements

### Core Functionality
1. **Remove locked-in checkbox UI** - Delete the checkbox input and its label from `AccountForm.tsx`
2. **Remove `handleLockedInChange` handler** - Delete the unused event handler function
3. **Keep `isLockedIn` property** - Retain in `AccountInput` type for backward compatibility and internal logic
4. **Preserve automatic locked status** - `isLockedAccountType()` already sets `isLockedIn: true` for LIRA; this behavior remains unchanged

### Data Requirements
- No schema changes required
- `isLockedIn` property remains on `AccountInput` but is now derived solely from account type
- Existing accounts with `isLockedIn: true` on non-LIRA types will have that value cleared (normalized to `false`)

### User Interface
- Remove the "Locked-in account" toggle field from the account form
- No other UI changes required

### Integration Points
- `accountNormalization.ts` - Update to always derive `isLockedIn` from account type
- Goal calculations and contribution allocation logic continue to use `isLockedIn` property

### Security & Privacy
- No changes required

### Performance
- Marginal improvement from reduced form state management

## Non-Functional Requirements

### Accessibility
- Removing an input simplifies keyboard navigation

### Error Handling
- No changes required

### Testing
- Update `AccountForm.test.tsx` to remove tests for locked-in checkbox
- Add/update tests to verify `isLockedIn` is correctly derived from account type

## Non-Goals
- Removing `isLockedIn` property from the type system (kept for internal logic)
- Adding new locked account types
- Changing how locked accounts behave in calculations

## Technical Approach

### Architecture
- Remove UI component and handler from `AccountForm.tsx`
- Update `accountNormalization.ts` to derive `isLockedIn` purely from account type

### Technology Alignment
- React functional components
- Existing type system and constants

### Database
- No changes required (localStorage-based persistence)

## Design Considerations
- Simpler form aligns with existing design patterns
- Tooltip/info icon for locked accounts can be added to account type dropdown if needed (future enhancement)

## Implementation Phases

### Phase 1: MVP (This PRD)
1. Remove checkbox UI and handler from `AccountForm.tsx`
2. Update `accountNormalization.ts` to derive `isLockedIn` from account type only
3. Update tests in `AccountForm.test.tsx`

### Phase 2: Enhancements (Future)
- Consider adding locked status indicator in account card for LIRA accounts

## Success Criteria

### Definition of Done
- Locked-in checkbox removed from UI
- `isLockedIn` correctly derived from account type
- All existing tests pass (with updates for removed checkbox)
- No regression in locked account behavior

### Acceptance Criteria
1. LIRA accounts are automatically treated as locked
2. Non-LIRA accounts are never locked
3. Form no longer displays locked-in checkbox for any account type
4. Goal contribution allocation correctly excludes LIRA accounts

## Dependencies & Risks

### Dependencies
- None

### Risks & Mitigations
- **Risk:** Users may have manually set `isLockedIn: true` on non-LIRA accounts
- **Mitigation:** Normalization will clear this; if users need this feature, they should use LIRA account type or a future "custom locked" account type

## Open Questions
None

## Assumptions
- LIRA is the only account type that should be locked
- Users do not need to manually lock non-LIRA accounts (if needed, this would be a separate feature request)
