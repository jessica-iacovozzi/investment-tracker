# PRD: Account View Toggle (Cards / List)

## Overview

Users currently view their investment accounts exclusively as cards in a 2-column grid. This feature adds a tab-based toggle that lets users switch between the existing **Cards** view and a new compact **List** view with expandable rows — giving them a quick-scan option while preserving full edit-in-place capability.

## Business Context

- **Problem:** With several accounts, the card grid pushes content far down the page. Users who want a quick overview must scroll through large cards to compare key metrics.
- **Success Metrics:**
  - Users can switch views in one click
  - List view loads with the same data, no delay
  - Preference persists across sessions
- **Priority:** Medium

## Target Users

Individual investors using the app to track multiple Canadian investment accounts (TFSA, RRSP, FHSA, LIRA, non-registered). Primary persona: someone with 3+ accounts who wants a compact overview before drilling into details.

## User Stories

1. As a user, I want to toggle between Cards and List views so that I can choose the layout that best fits my workflow.
2. As a user, I want the List view to show key metrics (name, type, principal, projected balance, total returns) per account so I can quickly compare accounts.
3. As a user, I want to expand a list row to reveal the full account form, summary, and chart so I can edit without switching tabs.
4. As a user, I want my view preference to be remembered across sessions so I don't have to re-select it each time.
5. As a user, I want the toggle to be keyboard-accessible so I can navigate the interface without a mouse.

## Functional Requirements

### Core Functionality

1. **View toggle tabs** — Two tabs ("Cards" and "List") rendered above the accounts section. The active tab is visually highlighted.
   - Acceptance: clicking a tab instantly switches the view; the accounts section re-renders with the selected layout.
2. **Cards view** — Identical to the current implementation (`account-grid` with `AccountCard` components). No changes.
3. **List view** — A single-column stack of compact account rows.
   - Each row displays: account name, account type badge, principal, projected final balance, and total returns.
   - Acceptance: all accounts render as rows; values match the card view.
4. **Expandable rows** — Clicking a list row toggles an expanded panel containing the full `AccountForm`, `AccountSummary`, and `AccountChart`.
   - Acceptance: expanding a row shows the same editable form as the card; changes propagate to state immediately.
   - Only one row may be expanded at a time (accordion behavior) to keep the layout clean.
5. **Persisted preference** — The selected tab (`cards` | `list`) is saved to `localStorage` using the existing storage utility pattern.
   - Acceptance: reloading the page restores the last-selected view.

### Data Requirements

- No new data models. The feature is purely presentational — it consumes the existing `AccountInput[]` array and projection utilities.
- New `localStorage` key: `investmentTracker_viewPreference` (string: `'cards'` | `'list'`).

### User Interface

#### Screens / Components

| Component | Description |
|---|---|
| `ViewToggle` | Tab bar with "Cards" and "List" buttons. Manages active state. |
| `AccountListView` | Container that maps accounts to `AccountListRow` components. |
| `AccountListRow` | Compact row showing summary metrics + expand/collapse toggle. When expanded, renders `AccountForm`, `AccountSummary`, `AccountChart`. |

#### User Flows

1. User lands on page → sees the last-used view (default: Cards).
2. User clicks "List" tab → grid fades out, list fades in (or instant swap).
3. User clicks a list row → row expands with full account details.
4. User edits a field in the expanded row → state updates; collapsed row metrics update in real time.
5. User clicks row header again or clicks another row → current row collapses.

#### Responsive Behavior

- On viewports ≤ 720px, the Cards view already collapses to single-column. The List view should similarly be full-width with stacked row content.
- The tab bar should remain horizontally laid out at all breakpoints.

### Integration Points

- Consumes `buildProjection` and `applyInflationToProjection` from existing utils to compute row metrics.
- Reuses `AccountForm`, `AccountSummary`, `AccountChart` components inside expanded rows — no duplication.
- Uses existing `isLocalStorageAvailable`, and follows the `loadX` / `saveX` / `clearX` storage pattern for persistence.

### Security & Privacy

- No new auth or data concerns. View preference is stored locally, same as existing settings.

### Performance

- List rows should compute projections lazily (only when rendered or expanded) to avoid blocking on mount with many accounts.
- Tab switch should feel instant (<50ms re-render).

## Non-Functional Requirements

### Accessibility

- Tab bar uses `role="tablist"`, each tab uses `role="tab"` with `aria-selected`, content panel uses `role="tabpanel"`.
- Expandable rows use `aria-expanded`, with the row header as a `<button>` (or equivalent keyboard-focusable element).
- Full keyboard navigation: `Tab` to move between tabs, `Enter`/`Space` to activate, arrow keys within tablist.
- Screen reader announces view changes and expanded/collapsed state.

### Error Handling

- If `localStorage` is unavailable (already detected by `isLocalStorageAvailable`), default to Cards view silently — no error shown.
- If projection computation fails for a row, display a fallback message in that row rather than breaking the whole list.

### Testing

- **Unit tests:**
  - `ViewToggle` renders both tabs, highlights active, calls `onChange`.
  - `AccountListRow` renders summary metrics, toggles expanded state, renders child components when expanded.
  - Storage helpers correctly save/load/clear view preference.
- **Integration tests:**
  - Switching tabs preserves account data (no re-fetch or data loss).
  - Editing in expanded row propagates changes to parent state.
- **E2E critical path:**
  - Load page → switch to List → expand row → edit field → collapse → verify updated metric in collapsed row → reload → confirm List view persists.

## Non-Goals

- Sorting or filtering accounts within the list view (future enhancement).
- Drag-and-drop reordering in list view.
- Inline editing of individual cells in the collapsed list row.
- A third "table" view with column headers and sortable columns.

## Technical Approach

### Architecture

- **State:** A single `viewPreference` state (`'cards' | 'list'`) in `App.tsx`, initialized from `localStorage`.
- **Tab component:** Stateless `ViewToggle` receives `activeView` and `onChange`.
- **List container:** `AccountListView` receives the same props as the current card-grid section (`accounts`, `currentAge`, `inflationState`, handlers).
- **Row component:** `AccountListRow` manages its own `isExpanded` local state. Computes projection via `useMemo` (same pattern as `AccountCard`).

### Technology Alignment

- React 19 + TypeScript (existing stack).
- Plain CSS following existing BEM naming conventions (`view-toggle`, `account-list`, `account-list-row`, etc.).
- Vitest + Testing Library for tests.
- No new dependencies required.

### Database

- No database changes. Only a new `localStorage` key.

## Design Considerations

- Match existing dark theme: `var(--surface)`, `var(--accent)`, `var(--text-primary)`, `var(--text-muted)`.
- Tab bar styling should echo the existing button styles (`.button`, `.button--primary`) but adapted for tab semantics.
- Expanded row should have a subtle border/background shift to differentiate it from collapsed rows.
- Collapse/expand animation: a simple `max-height` or CSS transition for smoothness.
- Reuse existing component composition — `AccountForm`, `AccountSummary`, `AccountChart` rendered as-is inside the expanded area.

## Implementation Phases

### Phase 1: MVP

1. `ViewToggle` component with Cards/List tabs.
2. `AccountListView` + `AccountListRow` with summary metrics and expandable detail panel.
3. Wire into `App.tsx`, conditionally render card grid or list based on active tab.
4. Persist view preference to `localStorage`.
5. CSS for tab bar, list rows, expanded state, and responsive behavior.
6. Unit + integration tests.

### Phase 2: Enhancements

- Sort accounts within list view (by name, balance, type).
- Filter by account type.
- Mini sparkline chart in the collapsed row for at-a-glance trend.
- Animated tab transitions.

## Success Criteria

### Definition of Done

- Functional requirements met
- Tests passing
- Code review approved
- Accessibility verified (keyboard nav, screen reader, ARIA)
- Responsive at all breakpoints

### Acceptance Criteria

1. Two tabs render above the accounts section; clicking switches views instantly.
2. List rows display name, type, principal, projected balance, total returns.
3. Clicking a row expands it with the full form/summary/chart; clicking again collapses it.
4. Only one row is expanded at a time.
5. View preference is saved to localStorage and restored on page load.
6. All existing account CRUD operations work identically in both views.
7. Tab bar is fully keyboard-navigable with correct ARIA roles.

## Dependencies & Risks

### Dependencies

- None. Feature is self-contained and uses only existing utilities and components.

### Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Performance with many accounts in list view computing projections | Use `useMemo` per row; only compute when row is visible or expanded |
| Expanded row form state conflicts with card view | Both views operate on the same `accounts` state array — no duplication |
| CSS specificity conflicts between card and list styles | Use distinct BEM class prefixes (`account-list-row__` vs `account-card__`) |

## Open Questions

None — all ambiguities resolved during clarification.

## Assumptions

- The existing `AccountForm`, `AccountSummary`, and `AccountChart` components are sufficiently decoupled to render inside a list row context without layout issues.
- Users have a manageable number of accounts (< 20) so rendering all list rows is performant without virtualization.
- The accordion (one-expanded-at-a-time) pattern is preferred over allowing multiple expanded rows.
