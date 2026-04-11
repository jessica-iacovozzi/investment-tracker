# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server
npm run build     # TypeScript check + Vite build (output: dist/)
npm run lint      # ESLint with TypeScript
npm run test      # Vitest unit tests (watch mode)
npm run preview   # Preview production build locally
```

To run a single test file:
```bash
npx vitest run src/utils/projections.test.ts
```

## Architecture

This is a **client-only React SPA** — no backend, no database. All state lives in `localStorage`. The app models investment account projections with compound interest, contribution scheduling, and tax-advantaged account rules for Canadian account types (TFSA, RRSP, FHSA, LIRA).

### Data Flow

1. User edits accounts via `AccountForm` or `AccountListView`
2. `App.tsx` holds all state; updates sync to localStorage via `useEffect`
3. `useMemo` in `App.tsx` recomputes projections and goal calculations on every state change
4. Components receive memoized projections as props

### Key Layers

**`src/types/`** — Core data models:
- `AccountInput` — single account with principal, rate, compounding, contribution schedule, and tax room fields
- `ProjectionPoint` — monthly balance snapshot (with optional inflation-adjusted real values)
- `GoalState` — reverse-calculation mode (find required contribution or time to hit a target)
- `InflationState` — inflation adjustment settings

**`src/constants/`** — Account type definitions (`accountTypes.ts`), compounding/timing options, and goal defaults. Account type limits (TFSA $7k/yr, RRSP 18% income, FHSA $8k/yr lifetime $40k) are defined here.

**`src/utils/`** — All business logic, no React:
- `projections.ts` — Core month-by-month compound interest engine
- `compounding.ts` — Converts compounding frequency to effective monthly rate
- `goalCalculations.ts` — Binary search reverse-calculations (required contribution or term)
- `sharedContributionRoom.ts` — Synchronizes room limits across accounts of the same tax type
- `inflation.ts` — Discounts future values to present dollars
- `storage.ts` — localStorage read/write with size-limit guards
- `validation.ts` — Input validation and storage quota checks
- `accountNormalization.ts` — Normalizes legacy/partial account data on load

**`src/components/`** — React UI; most components receive data and callbacks as props from `App.tsx`.

### localStorage Keys

| Key | Content |
|-----|---------|
| `investment-tracker-accounts` | Serialized `AccountInput[]` |
| `investment-tracker-term-years` | Global projection period (1–100 years) |
| `investment-tracker-current-age` | Current age (optional) |
| `investment-tracker-goal` | `GoalState` |
| `investment-tracker-inflation` | `InflationState` |
| `investmentTracker_viewPreference` | `'cards' \| 'list'` |

### Goal Mode

Two reverse-calculation modes driven by `goalCalculations.ts`:
- **Contribution mode** — binary search for the contribution amount required to reach a target balance
- **Term mode** — binary search for the number of years required at a fixed contribution

Allocation strategies (`proportional`, `highest-return`, `equal`) split calculated contributions across multiple accounts.

### Testing

Tests live alongside source files (`*.test.ts` / `*.test.tsx`). Utilities are unit-tested directly; components use `@testing-library/react` with a happy-dom environment. The test environment is configured in `vite.config.ts`.
