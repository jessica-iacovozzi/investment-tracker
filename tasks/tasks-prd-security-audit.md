# Task List: Comprehensive Security Audit
*From: `prd-security-audit.md`*

## Overview

Harden the investment-tracker SPA against OWASP client-side risks by adding HTTP security headers, a Content Security Policy, runtime schema validation for all localStorage reads, input bounds enforcement, and account name sanitization. All changes are Phase 1 (MVP) items; Phase 2 enhancements are documented but not tasked.

## Architecture Decisions

- **TypeScript type guards over schema libraries** — keeps bundle size at zero impact; aligns with existing `isValidCompoundingFrequency` / `isValidAccountType` patterns in `src/constants/`.
- **Validators compose** — `isValidAccountInput` calls `isValidContributionSchedule`, mirroring how `normalizeAccount` calls `normalizeTimingForFrequency`.
- **Vercel-native headers** — no middleware or edge functions; declarative `headers` array in `vercel.json`.
- **Sanitization as a pure utility** — `sanitizeName` lives in `src/utils/validation.ts` alongside schema validators for co-location.
- **Test conventions** — follow existing `storage.test.ts` patterns: `vi.stubGlobal` for `window`, `buildMockStorage` helper, `describe`/`it` blocks.

## Relevant Files

### New Files
- `src/utils/validation.ts` — Runtime schema validators + `sanitizeName`
- `src/utils/validation.test.ts` — Unit tests for all validators and sanitization

### Files to Modify
- `vercel.json` — Add `headers` array with security headers + CSP
- `src/utils/storage.ts` — Replace `as` type assertions with validator calls in `loadGoalState`, `loadInflationState`, `migrateLegacyTermYears`
- `src/utils/storage.test.ts` — Add wrong-shape JSON and malformed-data test cases
- `src/App.tsx` — Replace `as AccountInput[]` cast in `loadAccounts` with validator; apply `sanitizeName` in `handleNameChange` flow
- `src/components/AccountForm.tsx` — Add `maxLength={100}` to name input; add runtime clamps to numeric handlers

### Testing
- Unit: `npx vitest run src/utils/validation.test.ts`
- Unit: `npx vitest run src/utils/storage.test.ts`
- All: `npx vitest run`

## Tasks

- [x] 1.0 Deployment Security Headers
  - [x] 1.1 Add `headers` array to `vercel.json` with all 6 security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`, `X-DNS-Prefetch-Control`) applied to `source: "/(.*)"`.
  - [x] 1.2 Add `Content-Security-Policy` header to the same `headers` array in `vercel.json` with directives: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`.
  - [x] 1.3 Verify locally by running `npx vercel dev` (or deploy to a preview branch) and checking response headers with `curl -I`. Confirm no CSP violations in browser console while using the app (add/edit accounts, view charts).

- [x] 2.0 Runtime Schema Validators
  - [x] 2.1 Create `src/utils/validation.ts` with the following pure-function type guards:
    - `isValidContributionSchedule(data: unknown): data is ContributionSchedule` — checks `amount` (number), `frequency` (one of the 4 valid values), `startMonth` (number ≥ 1), `endMonth` (number ≥ 1).
    - `isValidAccountInput(data: unknown): data is AccountInput` — checks all required fields (`id`, `name`, `principal`, `annualRatePercent`, `compoundingFrequency`, `contributionTiming`, `accountType`); if `contribution` is present, delegates to `isValidContributionSchedule`.
    - `isValidAccountInputArray(data: unknown): data is AccountInput[]` — checks `Array.isArray` and every element passes `isValidAccountInput`.
    - `isValidGoalState(data: unknown): data is GoalState` — checks `isGoalMode` (boolean), `targetBalance` (number), `calculationType` (one of `'contribution' | 'term'`), `contributionFrequency` (valid value), `allocationStrategy` (valid value).
    - `isValidInflationState(data: unknown): data is InflationState` — checks `isEnabled` (boolean), `annualRatePercent` (number).
  - [x] 2.2 Add `sanitizeName` function to `src/utils/validation.ts`: strips control characters (`/[\x00-\x1F\x7F]/g`), trims whitespace, caps at 100 characters. Returns empty string if input is not a string.
  - [x] 2.3 Add `MAX_STORAGE_PAYLOAD_BYTES` constant (1 MB = 1_048_576) and a `isStoragePayloadWithinLimit(raw: string): boolean` guard to `src/utils/validation.ts`.

- [x] 3.0 Validator Unit Tests
  - [x] 3.1 Create `src/utils/validation.test.ts` with tests for `isValidContributionSchedule`:
    - Valid schedule passes
    - Missing `amount` → false
    - Invalid `frequency` string → false
    - `null` → false
  - [x] 3.2 Add tests for `isValidAccountInput`:
    - Valid full account passes
    - Valid account without optional `contribution` passes
    - Missing `id` → false
    - `principal` as string → false
    - Invalid `accountType` → false
    - `null` → false
    - Non-object → false
  - [x] 3.3 Add tests for `isValidAccountInputArray`:
    - Valid array passes
    - Empty array passes (valid, just no accounts)
    - Array with one invalid element → false
    - Non-array → false
  - [x] 3.4 Add tests for `isValidGoalState`:
    - Valid state passes
    - Missing `isGoalMode` → false
    - Invalid `calculationType` → false
  - [x] 3.5 Add tests for `isValidInflationState`:
    - Valid state passes
    - `annualRatePercent` as string → false
    - Missing `isEnabled` → false
  - [x] 3.6 Add tests for `sanitizeName`:
    - Normal string passes through
    - Control characters stripped
    - Leading/trailing whitespace trimmed
    - Caps at 100 characters
    - Non-string input returns `''`
  - [x] 3.7 Add tests for `isStoragePayloadWithinLimit`:
    - String under 1 MB → true
    - String over 1 MB → false

- [x] 4.0 Integrate Validators into Storage Layer
  - [x] 4.1 Refactor `loadGoalState` in `src/utils/storage.ts`: after `JSON.parse`, validate with `isValidGoalState` before spreading onto `DEFAULT_GOAL_STATE`. If invalid shape, `console.warn` and return `DEFAULT_GOAL_STATE`. Add size check with `isStoragePayloadWithinLimit` before parsing.
  - [x] 4.2 Refactor `loadInflationState` in `src/utils/storage.ts`: same pattern — validate with `isValidInflationState`, fallback to `DEFAULT_INFLATION_STATE` on failure. Add size check.
  - [x] 4.3 Refactor `migrateLegacyTermYears` in `src/utils/storage.ts`: replace `as LegacyAccount[]` with `Array.isArray` + per-element object check. Add size check before parsing.
  - [x] 4.4 Refactor `loadAccounts` in `src/App.tsx`: replace `as AccountInput[]` with `isValidAccountInputArray`. If validation fails, `console.warn` and return seed/default accounts. Add size check.
  - [x] 4.5 Update `src/utils/storage.test.ts` with new test cases:
    - `loadGoalState` with wrong-shape JSON (e.g., `{"foo": "bar"}`) → returns `DEFAULT_GOAL_STATE`
    - `loadGoalState` with number instead of object → returns `DEFAULT_GOAL_STATE`
    - `loadInflationState` with `annualRatePercent` as string → returns `DEFAULT_INFLATION_STATE`
    - `loadInflationState` with null → returns `DEFAULT_INFLATION_STATE`

- [x] 5.0 Input Sanitization & Bounds Enforcement
  - [x] 5.1 In `src/components/AccountForm.tsx`, add `maxLength={100}` to the account name `<input>` element (the one with `id={account.id}-name`).
  - [x] 5.2 In `src/components/AccountForm.tsx`, update `handleNameChange` to apply `sanitizeName` before calling `onUpdate`: `onUpdate(buildPayload(account.id, { name: sanitizeName(value) }))`. Import `sanitizeName` from `src/utils/validation.ts`.
  - [x] 5.3 In `src/components/AccountForm.tsx`, update `handleNumericInputChange` to clamp parsed values: `Math.max(0, parsed)` for general numeric fields. This ensures negative values from paste/programmatic input are rejected.
  - [x] 5.4 In `src/components/AccountForm.tsx`, update `handlePrincipalChange` — already uses `handleNumericInputChange`, so the clamp from 5.3 covers it. No additional change needed (verify only).
  - [x] 5.5 In `src/components/AccountForm.tsx`, update `handleRateChange` to clamp: `Math.max(0, Math.min(100, parsed))` — rates above 100% are unrealistic for this tool.
  - [x] 5.6 In `src/components/AccountForm.tsx`, update `handleContributionNumberChange` for `startMonth` and `endMonth` fields to clamp values: `Math.max(1, Math.min(totalMonths, parsed))`.
  - [x] 5.7 In `src/App.tsx`, apply `sanitizeName` to account names when loading from localStorage in `loadAccounts` (via the normalization step) to clean legacy data.

- [x] 6.0 Testing & Validation
  - [x] 6.1 Run full test suite (`npx vitest run`) — confirm zero regressions.
  - [x] 6.2 Run coverage on new files (`npx vitest run --coverage src/utils/validation.ts`) — confirm ≥ 90% coverage.
  - [x] 6.3 Manual smoke test: add account, edit name with long string, paste negative numbers, toggle goal mode, view chart — confirm no CSP errors in console if deployed.
  - [x] 6.4 Deploy to Vercel preview and verify headers with `curl -I <preview-url>` — all 7 headers (6 security + CSP) present.
  - [x] 6.5 Manual test: in browser DevTools, set `localStorage.setItem('investment-tracker-accounts', '{"bad":true}')` then reload — app falls back to defaults without crashing.

## Validation Checklist
- [ ] All PRD requirements covered (headers, CSP, validators, input bounds, name sanitization)
- [ ] Tests for all new functionality
- [ ] File paths match project structure
- [ ] Dependencies properly ordered (validators before integration, integration before input bounds)
- [ ] Error handling addressed (fallback to defaults, console.warn)
- [ ] No new external dependencies added

## Estimated Effort
- **Total:** 6 parent tasks, 27 sub-tasks
- **Time:** 4–6 hours (mid-level dev)
- **Can parallelize:** Tasks 1.0 (headers) and 2.0–3.0 (validators + tests) are independent
