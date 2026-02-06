# Task List: Account View Toggle (Cards / List)
*From: `prd-account-view-toggle.md`*

## Overview

Add a tab-based toggle above the accounts section that lets users switch between the existing Cards grid and a new compact List view with expandable accordion rows. The feature is purely presentational — no new data models or API calls. View preference persists via `localStorage`.

## Architecture Decisions

- **State location:** Single `viewPreference` state (`'cards' | 'list'`) lives in `App.tsx`, initialized from `localStorage` with `'cards'` as default.
- **Component pattern:** Stateless `ViewToggle` receives `activeView` + `onChange`. `AccountListView` mirrors the card-grid section props. `AccountListRow` manages its own `isExpanded` local state with accordion behavior enforced by the parent.
- **Reuse:** Expanded rows render the existing `AccountForm`, `AccountSummary`, and `AccountChart` — no duplication.
- **Storage pattern:** Follow existing `loadX` / `saveX` / `clearX` pattern in `src/utils/storage.ts` with key `investmentTracker_viewPreference`.
- **CSS:** BEM naming with `view-toggle`, `account-list`, `account-list-row` prefixes. Dark theme via existing CSS custom properties.
- **Testing:** Vitest + Testing Library, matching existing test conventions.

## Relevant Files

### New Files
- `src/components/ViewToggle.tsx` — Tab bar component with Cards/List buttons
- `src/components/ViewToggle.test.tsx` — Unit tests for ViewToggle
- `src/components/AccountListView.tsx` — Container mapping accounts to list rows
- `src/components/AccountListRow.tsx` — Compact row with expand/collapse and full account detail panel
- `src/components/AccountListRow.test.tsx` — Unit tests for AccountListRow

### Files to Modify
- `src/utils/storage.ts` — Add `loadViewPreference` / `saveViewPreference` / `clearViewPreference`
- `src/utils/storage.test.ts` — Add tests for view preference storage helpers
- `src/App.tsx` — Add `viewPreference` state, wire `ViewToggle`, conditionally render grid or list
- `src/App.css` — Add styles for view-toggle, account-list, account-list-row, expanded state, responsive

### Testing
- Unit: `npx vitest run src/components/ViewToggle.test.tsx`
- Unit: `npx vitest run src/components/AccountListRow.test.tsx`
- Unit: `npx vitest run src/utils/storage.test.ts`
- All: `npx vitest run`

## Tasks

- [x] 1.0 Foundation — Storage & Types
  - [x] 1.1 Add `ViewPreference` type (`'cards' | 'list'`) export to `src/types/investment.ts`
  - [x] 1.2 Add `loadViewPreference`, `saveViewPreference`, `clearViewPreference` to `src/utils/storage.ts` following the existing RO-RO pattern (key: `investmentTracker_viewPreference`, default: `'cards'`)
  - [x] 1.3 Add unit tests for the three new storage helpers in `src/utils/storage.test.ts` (unavailable storage returns default, round-trip save/load, clear removes key, invalid value falls back to default)

- [x] 2.0 ViewToggle Component
  - [x] 2.1 Create `src/components/ViewToggle.tsx` — stateless tab bar with `role="tablist"`, two `role="tab"` buttons ("Cards" / "List"), `aria-selected` on active tab, `role="tabpanel"` wrapper semantics. Props: `activeView: ViewPreference`, `onChange: (view: ViewPreference) => void`
  - [x] 2.2 Add keyboard navigation inside the tablist: arrow keys to move between tabs, `Enter`/`Space` to activate
  - [x] 2.3 Create `src/components/ViewToggle.test.tsx` — tests: renders both tabs, highlights active tab with `aria-selected`, calls `onChange` on click, keyboard arrow-key navigation works, `Enter`/`Space` activates tab

- [x] 3.0 AccountListRow Component
  - [x] 3.1 Create `src/components/AccountListRow.tsx` — compact row displaying: account name, account type badge (using `ACCOUNT_TYPE_LABELS`), principal (`formatCurrency`), projected final balance, and total returns. Props mirror `AccountCard` props plus `isExpanded` and `onToggle`
  - [x] 3.2 Compute projection with `useMemo` using `buildProjection` and `applyInflationToProjection` (same pattern as `AccountCard`)
  - [x] 3.3 Add expand/collapse toggle — row header is a `<button>` with `aria-expanded`. When expanded, render `AccountForm`, `AccountSummary`, `AccountChart` inside the detail panel (reuse same prop-wiring as `AccountCard`)
  - [x] 3.4 Include contribution-range adjustment and contribution-timing normalization logic (extract shared helpers from `AccountCard` or import them)
  - [x] 3.5 Add delete button in expanded row header (same confirm + `onDelete` pattern as `AccountCard`)
  - [x] 3.6 Create `src/components/AccountListRow.test.tsx` — tests: renders summary metrics, toggles `aria-expanded`, renders child components when expanded, calls `onUpdate`/`onDelete` correctly

- [x] 4.0 AccountListView Container
  - [x] 4.1 Create `src/components/AccountListView.tsx` — maps `accounts` to `AccountListRow` components. Manages accordion state: tracks `expandedId: string | null`, only one row expanded at a time. Props: `accounts`, `currentAge`, `inflationState`, `onUpdate`, `onDelete` (same as card-grid section in `App.tsx`)
  - [x] 4.2 Implement accordion behavior: clicking an expanded row collapses it, clicking a different row collapses the current and expands the new one

- [x] 5.0 App Integration
  - [x] 5.1 Add `viewPreference` state to `App.tsx`, initialized from `loadViewPreference({ storageAvailable })`
  - [x] 5.2 Add `useEffect` to persist `viewPreference` via `saveViewPreference` (same pattern as other state persistence)
  - [x] 5.3 Render `ViewToggle` above the accounts section (between the actions bar and the `account-grid` / list)
  - [x] 5.4 Conditionally render `account-grid` (cards) or `AccountListView` based on `viewPreference`
  - [x] 5.5 Include `clearViewPreference` in `handleResetAccounts` so reset restores default view

- [x] 6.0 Styling
  - [x] 6.1 Add `.view-toggle` styles in `src/App.css` — tab bar layout, active tab highlight using `var(--accent)`, hover/focus states, dark theme colors
  - [x] 6.2 Add `.account-list` styles — single-column stack layout with gap
  - [x] 6.3 Add `.account-list-row` styles — compact row with flex layout for metrics, type badge styling, subtle border/background shift for expanded state
  - [x] 6.4 Add expand/collapse animation — CSS keyframe animation for smooth open/close
  - [x] 6.5 Add responsive styles — full-width rows on ≤720px, tab bar remains horizontal at all breakpoints

- [x] 7.0 Testing & Polish
  - [x] 7.1 Run full test suite (`npx vitest run`) and fix any failures — 293 tests passing
  - [x] 7.2 Verify keyboard navigation end-to-end: Tab to toggle, arrow keys between tabs, Enter to activate, Tab into list rows, Enter to expand
  - [x] 7.3 Verify screen reader announces view changes and expanded/collapsed state (ARIA roles verified)
  - [x] 7.4 Test error fallback: if projection computation fails for a row, display fallback message instead of breaking the list
  - [x] 7.5 Verify responsive behavior at ≤720px — list rows stack, tab bar stays horizontal
  - [x] 7.6 Manual E2E: load page → switch to List → expand row → edit field → collapse → verify updated metric → reload → confirm List view persists

## Validation Checklist
- [x] All PRD functional requirements covered (toggle, cards view unchanged, list view, expandable rows, persisted preference)
- [x] Tests for all new functionality (storage helpers, ViewToggle, AccountListRow)
- [x] File paths match project structure (`src/components/`, `src/utils/`, `src/types/`)
- [x] Dependencies properly ordered (1→2→3→4→5→6→7)
- [x] Error handling addressed (localStorage unavailable, projection failure fallback)
- [x] Accessibility verified (ARIA roles, keyboard nav, screen reader)
- [x] Responsive at all breakpoints

## Estimated Effort
- **Total:** 7 parent tasks, 25 sub-tasks
- **Time:** 6–9 hours (mid-level dev)
- **Can parallelize:** Tasks 2.0 and 3.0 can be built in parallel after 1.0 is done; Task 6.0 can overlap with 4.0/5.0
