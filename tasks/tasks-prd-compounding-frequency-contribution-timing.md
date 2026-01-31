# Task List: Compounding Frequency & Contribution Timing
*From: `tasks/prd-compounding-frequency-contribution-timing.md`*

## Overview
Add compounding frequency and contribution timing fields to account inputs, persist them in local storage, and update projection math to apply effective periodic rates and timing ordering while keeping monthly projection points. Extend UI with accessible selects and helper text, then add unit/regression tests for math and storage normalization.

## Architecture Decisions
- Use effective periodic rate conversion in `buildProjection` to avoid per-day simulation while preserving monthly projection points.
- Add `CompoundingFrequency` and `ContributionTiming` enums to `src/types/investment.ts` and normalize stored values with fallback defaults in load/validation paths.
- Extend `AccountForm` to include new selects and inline help, grouped with contribution fields, while keeping existing layout and stacking on mobile.

## Relevant Files

### New Files
- `src/constants/compounding.ts` - Frequency/timing labels, defaults, and allowed values.
- `src/utils/compounding.ts` - Effective rate conversion utilities and timing helpers.
- `src/utils/compounding.test.ts` - Unit tests for frequency/timing utilities.

### Files to Modify
- `src/types/investment.ts` - Add `CompoundingFrequency`, `ContributionTiming`, and fields on `AccountInput`.
- `src/utils/projections.ts` - Apply compounding frequency and contribution timing ordering in projection math.
- `src/utils/projections.test.ts` - Add unit/regression tests for new logic.
- `src/components/AccountForm.tsx` - Add compounding/timing selects and helper text.
- `src/components/AccountCard.tsx` - Ensure updates flow through and any new validation hooks used.
- `src/App.tsx` - Seed defaults and normalize local storage values.
- `src/App.css` - Adjust layout/spacing for new inputs and mobile stacking.

### Testing
- Unit: `npx vitest src/utils/compounding.test.ts`
- Unit: `npx vitest src/utils/projections.test.ts`
- All: `npx vitest`

## Tasks

- [x] 1.0 Foundation & Setup
  - [x] 1.1 Add `CompoundingFrequency` and `ContributionTiming` types in `src/types/investment.ts` and extend `AccountInput` with new fields.
  - [x] 1.2 Create `src/constants/compounding.ts` with allowed values, defaults, and labels for UI.
  - [x] 1.3 Build `src/utils/compounding.ts` utilities for effective periodic rates and timing checks.
  - [x] 1.4 Write unit tests in `src/utils/compounding.test.ts` for rate conversion and timing helpers.

- [x] 2.0 Backend/API Implementation
  - [x] 2.1 Add local-storage normalization helpers in `src/App.tsx` to clamp unsupported frequency/timing values to defaults.
  - [x] 2.2 Update seed data in `src/App.tsx` with default compounding frequency and contribution timing.
  - [x] 2.3 Add validation guards in `src/App.tsx` for malformed account payloads and log warnings on fallback.

- [x] 3.0 Core Component Development
  - [x] 3.1 Add compounding frequency select to `src/components/AccountForm.tsx` using constants/labels.
  - [x] 3.2 Add contribution timing select to `src/components/AccountForm.tsx` with helper text and accessible labels.
  - [x] 3.3 Group new selects with contribution inputs and ensure mobile stacking matches existing layout.
  - [x] 3.4 Update account update handlers in `src/components/AccountForm.tsx` to pass new fields.

- [x] 4.0 Integration & State
  - [x] 4.1 Wire `AccountCard` updates to apply any new normalization logic in `src/components/AccountCard.tsx` if needed.
  - [x] 4.2 Update `buildProjection` in `src/utils/projections.ts` to use compounding frequency rate conversions.
  - [x] 4.3 Apply contribution timing ordering in `src/utils/projections.ts` (begin/end of month/year).
  - [x] 4.4 Ensure projection output remains monthly while using selected compounding cadence.

- [x] 5.0 Testing & Validation
  - [x] 5.1 Add unit tests in `src/utils/projections.test.ts` for multiple frequencies (daily/weekly/monthly/annual).
  - [x] 5.2 Add tests for contribution timing order (begin/end month/year) in `src/utils/projections.test.ts`.
  - [x] 5.3 Add regression test to preserve previous monthly behavior in `src/utils/projections.test.ts`.
  - [x] 5.4 Validate local storage normalization with malformed values in `src/App.tsx` (test via helper or unit).

- [x] 6.0 Polish & Documentation
  - [x] 6.1 Add inline helper text/tooltip copy for timing options in `src/components/AccountForm.tsx`.
  - [x] 6.2 Update `src/App.css` for spacing and focus styles for new selects.
  - [x] 6.3 Add brief docs/comment block in `src/utils/projections.ts` describing compounding/timing rules.

## Validation Checklist
- [x] All PRD requirements covered
- [x] Tests for all functionality
- [x] File paths match project structure
- [x] Dependencies properly ordered
- [x] Error handling addressed
- [x] Documentation included

## Estimated Effort
- Total: 6 parent, 22 sub-tasks
- Time: 10-14 hours (mid-level dev)
- Can parallelize: 1.2 + 1.3, 3.1 + 3.2, 5.1 + 5.2

---
**Ready:** Respond "Start" to begin or provide feedback.
