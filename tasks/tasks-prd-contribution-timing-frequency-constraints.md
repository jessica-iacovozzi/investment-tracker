# Task List: Contribution Timing/Frequency Constraints
*From: `tasks/prd-contribution-timing-frequency-constraints.md`*

## Overview
Introduce contribution timing constraints based on the selected contribution frequency, normalize invalid stored values on load and before persistence, and update the AccountForm UI to filter options with accessible helper text. Add unit/UI tests to validate normalization, filtering, and regression behavior.

## Architecture Decisions
- Add a timing/frequency utility module to centralize valid-option computation and normalization defaults for reuse in form state and storage hydration.
- Keep `AccountForm` as the UI integration point, filtering timing options and ensuring the selected value is always valid for the current frequency.
- Normalize invalid combinations during load (and before save) with a dev-only warning to prevent invalid state from persisting.

## Relevant Files

### New Files
- `src/utils/contributionTiming.ts` - Valid timing map, default timing lookup, and normalization helpers.
- `src/utils/contributionTiming.test.ts` - Unit tests for timing/frequency validation and normalization.

### Files to Modify
- `src/constants/compounding.ts` - Extend timing options/labels for quarterly/biweekly and yearly variants.
- `src/types/investment.ts` - Add quarterly/biweekly timing literals to `ContributionTiming` if missing.
- `src/components/AccountForm.tsx` - Filter timing options by frequency, update helper text, and guard selected timing.
- `src/App.tsx` - Normalize stored accounts using timing/frequency utilities on load and before persist.
- `src/utils/projections.ts` - Ensure timing validation is assumed normalized (add defensive guard if needed).
- `src/App.css` - Adjust helper text spacing/readability on mobile if needed.

### Testing
- Unit: `npx vitest src/utils/contributionTiming.test.ts`
- Unit/UI: `npx vitest src/components/AccountForm.test.tsx`
- All: `npx vitest`

## Tasks

- [ ] 1.0 Foundation & Setup
  - [ ] 1.1 Add quarterly/biweekly timing literals in `src/types/investment.ts` (`beginning-of-quarter`, `end-of-quarter`, `beginning-of-biweekly`, `end-of-biweekly`) if not already present.
  - [ ] 1.2 Extend `src/constants/compounding.ts` with new timing options, labels, and helper text variants.
  - [ ] 1.3 Create `src/utils/contributionTiming.ts` with:
    - `getValidTimingsForFrequency(frequency)`
    - `getDefaultTimingForFrequency(frequency)`
    - `normalizeTimingForFrequency({ timing, frequency })`
  - [ ] 1.4 Write unit tests in `src/utils/contributionTiming.test.ts` covering all frequencies and default mappings.

- [ ] 2.0 Backend/API Implementation
  - [ ] 2.1 Update `normalizeAccount` in `src/App.tsx` to use timing/frequency normalization (map invalid combos to defaults).
  - [ ] 2.2 Add dev-only warning in `src/App.tsx` when normalization changes a stored timing value.
  - [ ] 2.3 Normalize timing before persistence in `saveAccounts` (or pre-save hook) to prevent invalid values from being stored.

- [ ] 3.0 Core Component Development
  - [ ] 3.1 Update `AccountForm` in `src/components/AccountForm.tsx` to filter timing options based on selected contribution frequency.
  - [ ] 3.2 Ensure timing selection auto-corrects when frequency changes (use normalization helper before calling `onUpdate`).
  - [ ] 3.3 Update helper text to explain constraints and wire `aria-describedby` to the timing select.
  - [ ] 3.4 Add labels like “Beginning of month (monthly only)” in `CONTRIBUTION_TIMING_LABELS` where appropriate.

- [ ] 4.0 Integration & State
  - [ ] 4.1 Ensure `AccountCard` updates (if any) route through timing normalization helpers before state updates.
  - [ ] 4.2 Verify `buildProjection` in `src/utils/projections.ts` relies on normalized timing and add a safeguard for unexpected timing values.
  - [ ] 4.3 Add regression guard to keep valid existing accounts unchanged after load.

- [ ] 5.0 Testing & Validation
  - [ ] 5.1 Add UI tests in `src/components/AccountForm.test.tsx` to confirm timing options change when frequency changes.
  - [ ] 5.2 Add tests for auto-correction on frequency change (timing resets to default).
  - [ ] 5.3 Add storage normalization test to confirm invalid combinations are corrected on load.
  - [ ] 5.4 Add accessibility test to confirm helper text is announced via `aria-describedby`.

- [ ] 6.0 Polish & Documentation
  - [ ] 6.1 Update `src/App.css` helper text spacing to keep mobile readability.
  - [ ] 6.2 Add concise inline docs in `src/utils/contributionTiming.ts` describing mapping rules and defaults.
  - [ ] 6.3 Add brief note in README or feature notes if a docs section exists.

## Validation Checklist
- [ ] All PRD requirements covered
- [ ] Tests for all functionality
- [ ] File paths match project structure
- [ ] Dependencies properly ordered
- [ ] Error handling addressed
- [ ] Documentation included

## Estimated Effort
- Total: 6 parent, 22 sub-tasks
- Time: 8-12 hours (mid-level dev)
- Can parallelize: 1.2 + 1.3, 3.1 + 3.3, 5.1 + 5.4

---
**Ready:** Respond "Start" to begin or provide feedback.
