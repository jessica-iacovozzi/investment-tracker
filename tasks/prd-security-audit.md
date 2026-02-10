# PRD: Comprehensive Security Audit

## Overview

The investment-tracker is a client-side React + TypeScript SPA deployed on Vercel. It has no backend, no authentication, and no external API calls — all data lives in the browser's `localStorage`. While this architecture inherently limits the attack surface, the application currently ships with **no HTTP security headers**, **no Content Security Policy**, **no runtime validation of persisted data**, and **several input-handling gaps** that could lead to data corruption or client-side abuse. This PRD addresses all identified vulnerabilities and prepares the codebase for a future backend.

## Business Context

- **Problem:** The app lacks standard web security hardening, exposing users to clickjacking, MIME-sniffing attacks, XSS via injected localStorage data, and potential data corruption from malformed persisted state.
- **Success Metrics:**
  - All OWASP-recommended HTTP security headers present in production responses
  - Zero `dangerouslySetInnerHTML` or `eval` usage (already passing — maintain this)
  - Runtime schema validation on every `localStorage` read path
  - All text inputs bounded by `maxLength`
  - Lighthouse "Best Practices" security score ≥ 95
- **Priority:** High

## Target Users

- **Primary:** Individual investors using the tool to model multi-account growth projections in-browser.
- **Secondary:** Developers who may fork or extend the project with a backend.

## User Stories

1. As a user, I want my browser to reject framing attacks so that my data cannot be hijacked via clickjacking.
2. As a user, I want confidence that corrupted or malicious localStorage data won't crash the app or produce misleading projections.
3. As a user, I want input fields to enforce reasonable limits so that I can't accidentally (or maliciously) create payloads that degrade performance.
4. As a developer, I want security headers configured declaratively in `vercel.json` so that every deployment is hardened by default.
5. As a developer, I want a clear pattern for runtime data validation so that future features (e.g., URL-shared state, backend sync) inherit the same safety guarantees.

## Functional Requirements

### Core Functionality

#### 1. HTTP Security Headers (Vercel deployment)

Add the following headers to `vercel.json` for all routes:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME-sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limit referrer leakage |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disable unused browser APIs |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Enforce HTTPS |
| `X-DNS-Prefetch-Control` | `off` | Prevent DNS prefetching leaks |

**Acceptance criteria:** `curl -I` against the production URL returns all six headers.

#### 2. Content Security Policy

Add a CSP via `vercel.json` header (preferred over `<meta>` for full directive support):

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data:;
font-src 'self';
connect-src 'self';
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

`'unsafe-inline'` for `style-src` is required because the app uses inline styles (Recharts SVG rendering). If a future refactor removes inline styles, tighten to `'self'` only.

**Acceptance criteria:** No CSP violations in browser console during normal app usage. `frame-ancestors 'none'` reinforces the `X-Frame-Options: DENY` directive.

#### 3. Runtime Schema Validation for localStorage

Replace all `as` type assertions on `JSON.parse()` results with runtime validation functions.

**Files affected:**
- `src/utils/storage.ts` — `loadGoalState`, `loadInflationState`, `migrateLegacyTermYears`
- `src/App.tsx` — `loadAccounts`

**Pattern:**

```typescript
const isValidAccountInput = (data: unknown): data is AccountInput => {
  if (typeof data !== 'object' || data === null) return false
  const obj = data as Record<string, unknown>
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.principal === 'number' &&
    typeof obj.annualRatePercent === 'number'
    // ... remaining required fields
  )
}
```

Create a dedicated `src/utils/validation.ts` module with validators for:
- `AccountInput`
- `GoalState`
- `InflationState`
- `ContributionSchedule`

**Acceptance criteria:**
- Malformed localStorage data (missing fields, wrong types, injected extra properties) gracefully falls back to defaults.
- Unit tests cover: valid data, missing required fields, wrong types, null, empty string, array of wrong shape.

#### 4. Input Sanitization & Bounds

| Input | Current | Required |
|-------|---------|----------|
| Account name (`AccountForm.tsx`) | No `maxLength` | Add `maxLength={100}` and trim on save |
| Principal | `min="0"` only (HTML) | Add runtime clamp: `Math.max(0, value)` |
| Annual rate | `min="0"` only (HTML) | Add runtime clamp: `Math.max(0, Math.min(100, value))` — rates above 100% are unrealistic |
| Contribution amount | `min="0"` only (HTML) | Add runtime clamp: `Math.max(0, value)` |
| Start/end month | `min="1"` only (HTML) | Add runtime clamp: `Math.max(1, Math.min(totalMonths, value))` |
| Contribution room | `min="0"` only (HTML) | Add runtime clamp: `Math.max(0, value)` |

**Acceptance criteria:** Pasting `-999` into any numeric field results in `0` (or the field minimum). Pasting a 10,000-character string into the account name field is truncated to 100 characters.

#### 5. Sanitize Account Name Before Persisting

Although React's JSX auto-escapes rendered strings, the account name is stored in `localStorage` and could be read by other scripts on the same origin. Strip control characters and trim whitespace before saving:

```typescript
const sanitizeName = (name: string): string =>
  name.replace(/[\x00-\x1F\x7F]/g, '').trim().slice(0, 100)
```

**Acceptance criteria:** Unit test confirms control characters are stripped and length is capped.

### Data Requirements

- **No new models** — all changes operate on existing `AccountInput`, `GoalState`, and `InflationState` types.
- **Validation rules** — codified in `src/utils/validation.ts` as pure functions.
- **Relationships** — validators compose (e.g., `isValidAccountInput` calls `isValidContributionSchedule`).

### User Interface

- No visible UI changes. All security hardening is transparent to the user.
- The only user-facing change: long account names are truncated at 100 characters.

### Integration Points

- **Vercel** — `vercel.json` header configuration.
- **No external APIs** — no CORS or API key concerns at this time.

### Security & Privacy

- **Auth/authorization:** N/A (no user accounts). If a backend is added in the future, implement:
  - OAuth 2.0 / OIDC for authentication
  - CSRF tokens for state-changing requests
  - HttpOnly, Secure, SameSite=Strict cookies
- **Data protection:** All data is local to the browser. No PII is transmitted. The CSP `connect-src 'self'` directive prevents accidental data exfiltration.
- **Input validation:** Runtime validators (requirement 3) + HTML attribute bounds (requirement 4) + name sanitization (requirement 5).

### Performance

- **Runtime validators** add negligible overhead (microseconds per load).
- **No additional network requests** introduced.
- **localStorage write debouncing** (optional enhancement): currently every keystroke triggers a `useEffect` → `localStorage.setItem`. Consider debouncing saves by 300ms to reduce I/O. _This is a performance improvement, not a security fix, but reduces the window for race conditions._

## Non-Functional Requirements

### Accessibility

- No accessibility changes required — this is a security-only audit.
- Maintain existing ARIA attributes and keyboard navigation.

### Error Handling

| Scenario | Current Behavior | Required Behavior |
|----------|-----------------|-------------------|
| Corrupted localStorage JSON | `catch` block falls back to seed/default | **No change** (already correct) |
| Valid JSON but wrong shape | Silently uses bad data via `as` cast | Fall back to defaults + `console.warn` |
| Extremely large localStorage payload | No protection | Add a size check (reject payloads > 1 MB) |
| CSP violation | N/A (no CSP) | Log to console; future: report-uri endpoint |

### Testing

#### Unit Tests (`src/utils/validation.test.ts` — new file)
- Valid `AccountInput` object passes validation
- Missing `id` field → returns false
- Wrong type for `principal` (string instead of number) → returns false
- `null` input → returns false
- Extra properties are stripped or ignored
- Valid `GoalState`, `InflationState` objects pass
- Partial `GoalState` merges with defaults correctly
- Account name sanitization strips control characters
- Account name sanitization caps at 100 characters

#### Unit Tests (updates to `src/utils/storage.test.ts`)
- `loadGoalState` with malformed JSON falls back to default
- `loadGoalState` with wrong-shape JSON falls back to default
- `loadInflationState` with missing fields merges with defaults
- `loadAccounts` with array of invalid objects returns empty/seed

#### Integration / E2E
- Verify all security headers present on production deployment
- Verify CSP does not break Recharts rendering
- Verify CSP does not block Vite HMR in development (CSP should only apply in production)

## Non-Goals

- **Authentication / authorization** — no user accounts exist; out of scope for implementation but documented for future reference.
- **Server-side rendering (SSR)** — the app is a pure SPA.
- **Encryption of localStorage** — data is not sensitive enough to warrant client-side encryption. If financial data syncs to a backend in the future, re-evaluate.
- **Automated penetration testing** — manual audit only for this phase.
- **Dependency vulnerability scanning** — `npm audit` should be run regularly but is a CI/CD concern, not a code change.

## Technical Approach

### Architecture

```
vercel.json                    ← Security headers + CSP
src/
  utils/
    validation.ts              ← NEW: runtime schema validators
    validation.test.ts         ← NEW: unit tests for validators
    storage.ts                 ← MODIFIED: use validators instead of `as` casts
    storage.test.ts            ← MODIFIED: add malformed-data test cases
  components/
    AccountForm.tsx            ← MODIFIED: maxLength, runtime clamps
  App.tsx                      ← MODIFIED: use validators in loadAccounts
```

### Technology Alignment

- **TypeScript** type guards for runtime validation (no external schema library needed — keeps bundle size zero-impact).
- **Existing test framework** (Vitest + Testing Library) for all new tests.
- **Vercel-native** header configuration — no middleware or edge functions required.

### Database

- N/A — no database. localStorage is the persistence layer.

## Design Considerations

- No UI design changes.
- Validation errors in localStorage fall back silently to defaults (existing UX pattern).

## Implementation Phases

### Phase 1: MVP (Security Hardening)

1. **Add security headers to `vercel.json`** — lowest effort, highest impact.
2. **Add CSP to `vercel.json`** — test thoroughly with Recharts.
3. **Create `src/utils/validation.ts`** with runtime validators.
4. **Refactor `storage.ts` and `App.tsx`** to use validators.
5. **Add `maxLength` and runtime clamps** to `AccountForm.tsx`.
6. **Add account name sanitization**.
7. **Write unit tests** for all new code.
8. **Verify in production** — check headers, CSP console, Recharts rendering.

### Phase 2: Enhancements

1. **Debounce localStorage writes** (300ms) to reduce I/O frequency.
2. **Add localStorage size guard** (reject payloads > 1 MB).
3. **Add CSP `report-uri`** directive pointing to a logging service (e.g., Sentry).
4. **Set up `npm audit`** in CI pipeline for dependency scanning.
5. **Document security architecture** for future contributors.
6. **If backend is added:** implement CSRF protection, secure cookie configuration, API rate limiting, and server-side input validation.

## Success Criteria

### Definition of Done

- All six HTTP security headers present in production responses
- CSP active with no violations during normal usage
- All `as` type assertions on `JSON.parse()` replaced with runtime validators
- All text inputs have `maxLength` attributes
- All numeric inputs have runtime clamp guards
- Account name sanitization strips control characters and caps length
- Unit tests pass with ≥ 90% coverage on new code
- No regressions in existing test suite
- Lighthouse Best Practices score ≥ 95

### Acceptance Criteria

| Requirement | Test |
|------------|------|
| Security headers | `curl -I <prod-url>` returns all 6 headers |
| CSP | Browser console shows no CSP violations during app usage |
| localStorage validation | Inject `{"bad": true}` into `investment-tracker-accounts` key, reload → app uses defaults |
| Input bounds | Paste `-999` into principal field → value becomes `0` |
| Name sanitization | Type `\x00Test\x01` into account name → stored as `Test` |
| Name length | Paste 200-char string into name → truncated to 100 |

## Dependencies & Risks

### Dependencies

- **Vercel** — header configuration relies on Vercel's `headers` support in `vercel.json`.
- **Recharts** — CSP `style-src 'unsafe-inline'` is required due to Recharts' inline SVG styles.

### Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| CSP breaks Recharts rendering | High — charts disappear | Test CSP in staging before production; use `Content-Security-Policy-Report-Only` header first |
| CSP breaks Vite HMR in dev | Medium — dev experience degrades | Only apply CSP header in Vercel (production), not in Vite dev server |
| Overly strict input clamps frustrate users | Low | Use reasonable bounds (e.g., rate ≤ 100%) with clear validation messages |
| Runtime validators reject valid legacy data | Medium — users lose saved data | Validators use `DEFAULT` fallbacks with `console.warn`; never throw |

## Open Questions

1. Should `style-src 'unsafe-inline'` be accepted long-term, or should Recharts' inline styles be addressed in a follow-up?
2. Is there a preferred error-reporting service (e.g., Sentry) for CSP violation reports?
3. For the potential future backend: will it be a separate repo/service, or integrated (e.g., Next.js API routes)?

## Assumptions

- Vercel remains the deployment platform for the foreseeable future.
- The app will remain a client-side SPA for Phase 1.
- No sensitive PII (SSN, bank credentials) is ever entered — the app handles hypothetical projection data only.
- `localStorage` is the only persistence mechanism (no IndexedDB, cookies, or sessionStorage).
- The existing test suite (Vitest) is the standard for all new tests.
