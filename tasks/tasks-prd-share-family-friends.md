# Task List: Share the Investment Tracker with Family & Friends
*From: `prd-share-family-friends.md`*

## Overview
Ship a static-hosted version of the app with in-app share guidance, a privacy note, local-storage availability messaging, and SPA-friendly hosting configuration. Keep the UI consistent with the current layout while ensuring accessibility and performance targets.

## Progress
**Last Updated:** 2026-01-30 23:25 UTC-05:00
**Current:** Complete
**Completed:** 21/21 tasks (100%)

Hosting target:
- Vercel (primary), with SPA fallback via `vercel.json`

## Relevant Files
### Completed ✓
- `src/App.tsx` - Reviewed local storage usage and integration points - ✓ Task 1.1
- `tasks/tasks-prd-share-family-friends.md` - Share/privacy copy defined - ✓ Task 1.2
- `tasks/tasks-prd-share-family-friends.md` - Hosting target selected - ✓ Task 1.3
- `src/utils/storage.ts` - Storage availability helper - ✓ Task 2.1
- `src/App.tsx` - Local storage availability checks - ✓ Task 2.2
- `src/App.tsx` - Local storage warning banner - ✓ Task 2.3
- `src/utils/storage.test.ts` - Storage availability tests - ✓ Task 2.4
- `src/components/ShareFooter.tsx` - Share guidance + privacy note UI - ✓ Task 3.1
- `src/components/ShareFooter.tsx` - Footer accessibility semantics - ✓ Task 3.2
- `src/components/ShareFooter.test.tsx` - Share footer rendering tests - ✓ Task 3.3
- `src/App.tsx` - Share footer integrated in layout - ✓ Task 4.1
- `src/App.css` - Footer styling - ✓ Task 3.4
- `src/components/ShareFooter.tsx` - Copy link button + feedback state - ✓ Task 4.2
- `vercel.json` - Vercel SPA fallback - ✓ Task 4.3
- Manual QA - Layout check - ✓ Task 4.4
- Manual QA - Persistence check - ✓ Task 5.1
- Validation - Lighthouse score - ✓ Task 5.3
- Validation - Footer contrast check - ✓ Task 5.4
- Manual QA - Mobile/desktop check - ✓ Task 5.2
- `README.md` - Hosting URL + deployment steps - ✓ Task 6.1
- `README.md` - Local-only FAQ blurb - ✓ Task 6.2
- `README.md` - Final copy pass - ✓ Task 6.3
- `/tasks/review-task-6.0.md` - Code review summary - ✓ Task 6.4

### In Progress 🔄
- None

### Planned 📋
- `README.md` - Hosting URL + deployment steps - 📋 Task 6.1

## Architecture Decisions
- Add a small, reusable `ShareFooter` component to keep App layout clean and maintainable.
- Introduce a `localStorage` availability helper to gate persistence and surface a non-blocking warning.
- Use static-host SPA fallbacks (`vercel.json` for Vercel and/or `public/404.html` for GitHub Pages) to avoid refresh 404s.

## Relevant Files

### New Files
- `src/components/ShareFooter.tsx` - Share guidance + privacy note UI.
- `src/components/ShareFooter.test.tsx` - Unit tests for share content and a11y.
- `src/utils/storage.ts` - `isLocalStorageAvailable` helper.
- `src/utils/storage.test.ts` - Unit tests for local storage helper.
- `vercel.json` - Vercel SPA fallback (optional).
- `public/404.html` - GitHub Pages SPA fallback (optional).

### Files to Modify
- `src/App.tsx` - Render footer + show local storage warning.
- `src/App.css` - Footer styles and warning styles.
- `src/index.css` - Minor shared styles (if needed for footer text).
- `README.md` - Hosted URL + deployment steps + share guidance.

### Testing
- Unit: `npm run test -- src/components/ShareFooter.test.tsx`
- Unit: `npm run test -- src/utils/storage.test.ts`
- All: `npm run test`

## Tasks

- [ ] 1.0 Foundation & Setup
  - [x] 1.1 Review existing local storage usage in `src/App.tsx` and identify integration points for warnings.
  - [x] 1.2 Define copy for share guidance and privacy note (short, accessible).
  - [x] 1.3 Decide hosting target (Vercel/Netlify/GitHub Pages) and confirm required static SPA fallback file.

- [ ] 2.0 Utilities & Persistence Guardrails
  - [x] 2.1 Create `src/utils/storage.ts` with `isLocalStorageAvailable()` helper (try/catch set/remove item).
  - [x] 2.2 Update `src/App.tsx` to check availability before `loadAccounts` and `saveAccounts`.
  - [x] 2.3 Add a non-blocking warning banner when local storage is unavailable.
  - [x] 2.4 Write unit tests in `src/utils/storage.test.ts` for success/failure paths.

- [ ] 3.0 Share UI Components
  - [x] 3.1 Create `src/components/ShareFooter.tsx` with share hint + privacy note text.
  - [x] 3.2 Ensure component is keyboard accessible with semantic HTML and ARIA where needed.
  - [x] 3.3 Add unit tests in `src/components/ShareFooter.test.tsx` for rendering and a11y text.
  - [x] 3.4 Style footer and warning banner in `src/App.css` to match existing layout.

- [ ] 4.0 App Integration & Hosting Config
  - [x] 4.1 Render `ShareFooter` in `src/App.tsx` within one scroll of the landing view.
  - [x] 4.2 Add optional "Copy link" button (Phase 2) with `navigator.clipboard` + feedback state.
  - [x] 4.3 Add SPA fallback file(s): `vercel.json` (Vercel) and/or `public/404.html` (GitHub Pages).
  - [x] 4.4 Confirm layout stays consistent on mobile and desktop.

- [ ] 5.0 Testing & Validation
  - [x] 5.1 Verify local storage persists across refresh after deployment.
  - [x] 5.2 Manual QA on iOS/Android + desktop for load and layout.
  - [x] 5.3 Run Lighthouse and confirm performance ≥ 85 on mobile.
  - [x] 5.4 Validate color contrast for footer text (WCAG 2.1 AA).

- [ ] 6.0 Documentation & Polish
  - [x] 6.1 Update `README.md` with public URL, deployment steps, and privacy note.
  - [x] 6.2 Add a short FAQ blurb about local-only data (Phase 2).
  - [x] 6.3 Final pass for copy clarity and alignment with existing tone.
  - [x] 6.4 Code review and wrap-up.

## Validation Checklist
- [x] All PRD requirements covered
- [x] Share guidance visible within one scroll
- [x] Privacy note included
- [x] Local storage warning displayed when unavailable
- [x] Static hosting fallback configured
- [x] Tests passing
- [x] README includes hosted URL and share guidance

## Estimated Effort
- Total: 6 parent tasks, 21 sub-tasks
- Time: 6-10 hours
- Can parallelize: 2.0 Utilities, 3.0 Share UI, 6.0 Documentation

---
**Task list complete!**

Summary:
- 6 parent tasks
- 21 sub-tasks
- 6 new files
- 4 modified files
- Estimated: 6-10 hours

Review and:
- Type "Start" to begin
- Or provide feedback
