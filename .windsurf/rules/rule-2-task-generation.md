# Rule 2: Autonomous Task Generation from PRD

## Goal

Generate a complete, actionable task list from a PRD in one pass. Single human approval at the end only.

## Philosophy

Act as a senior technical lead creating a complete implementation roadmap with all parent tasks and sub-tasks generated together.

## Process

### Phase 1: Analysis (Autonomous)

1. **Read PRD thoroughly**
   - Extract all functional requirements
   - Identify user stories and acceptance criteria
   - Note technical considerations

2. **Assess codebase**
   - Review architecture and file structure
   - Identify reusable components and patterns
   - Locate similar implementations
   - Map existing APIs and data models
   - Understand testing conventions

3. **Plan architecture**
   - Determine component hierarchy
   - Design data flow
   - Plan API endpoints
   - Identify shared utilities
   - Plan test coverage

### Phase 2: Generate Complete Task Structure (Autonomous)

Generate ALL parent tasks AND sub-tasks in single pass.

#### Parent Task Pattern (4-7 tasks):
1. **Foundation & Setup** - data models, types, utilities
2. **Backend/API** - API routes, data layer (if applicable)
3. **Core Components** - main feature components
4. **Integration** - connecting pieces, state management
5. **Testing** - comprehensive test coverage
6. **Polish** - refinement, docs, edge cases

#### Sub-Task Principles:
- Atomic (15-45 min each)
- Include specific file paths
- Cover: implementation, types, tests, docs, error handling
- Ordered by logical dependency

### Phase 3: Identify Files (Autonomous)

List all files to create/modify:

```markdown
## Relevant Files

### New Files
- `path/Component.tsx` - Main component for [feature]
- `path/Component.test.tsx` - Unit tests
- `path/api/endpoint.ts` - API handler for [action]
- `types/feature.ts` - Type definitions

### Files to Modify
- `path/existing.tsx` - Add integration with new feature
- `types/index.ts` - Export new types

### Testing
- Unit: `npx jest path/to/test.tsx`
- All: `npx jest`
```

### Phase 4: Generate Task List (Autonomous)

## Output Format

```markdown
# Task List: [Feature Name]
*From: `[prd-file].md`*

## Overview
[Brief summary of implementation approach]

## Architecture Decisions
- [Key technical decision with reasoning]
- [Pattern/convention to follow]
- [Integration points]

## Relevant Files
[As shown above]

## Tasks

- [ ] 1.0 Foundation & Setup
  - [ ] 1.1 Create types in `types/feature.ts` (User, Data, Response interfaces)
  - [ ] 1.2 Create utils in `lib/utils/helpers.ts` (validation, formatting)
  - [ ] 1.3 Write tests `lib/utils/helpers.test.ts` for all utils
  - [ ] 1.4 Define constants in `lib/constants/feature.ts`
  - [ ] 1.5 Create mock data in `lib/mocks/feature.ts`
  
- [ ] 2.0 Backend/API Implementation
  - [ ] 2.1 Create API route `pages/api/feature/index.ts` (GET/POST)
  - [ ] 2.2 Add request validation
  - [ ] 2.3 Implement error handling
  - [ ] 2.4 Write API tests `pages/api/feature/index.test.ts`
  - [ ] 2.5 Create `pages/api/feature/[id].ts` route
  - [ ] 2.6 Test [id] endpoint
  
- [ ] 3.0 Core Component Development
  - [ ] 3.1 Create `components/Feature/Main.tsx` structure
  - [ ] 3.2 Implement component logic (state, handlers)
  - [ ] 3.3 Add TypeScript types and prop validation
  - [ ] 3.4 Write tests `components/Feature/Main.test.tsx`
  - [ ] 3.5 Create `components/Feature/Item.tsx` sub-component
  - [ ] 3.6 Test Item component
  - [ ] 3.7 Create `components/Feature/Form.tsx` with validation
  - [ ] 3.8 Test form validation and submission
  
- [ ] 4.0 Integration & State
  - [ ] 4.1 Create hook `hooks/useFeature.ts` for data fetching
  - [ ] 4.2 Write hook tests `hooks/useFeature.test.ts`
  - [ ] 4.3 Integrate API calls using existing patterns
  - [ ] 4.4 Add error boundary `components/Feature/ErrorBoundary.tsx`
  - [ ] 4.5 Implement loading/error states
  - [ ] 4.6 Create integration tests `tests/integration/feature.test.tsx`
  
- [ ] 5.0 Testing & Validation
  - [ ] 5.1 Write E2E tests `e2e/feature.spec.ts` for main flows
  - [ ] 5.2 Add accessibility tests (keyboard, ARIA, screen reader)
  - [ ] 5.3 Test error scenarios and edge cases
  - [ ] 5.4 Verify mobile responsiveness
  - [ ] 5.5 Achieve >80% coverage
  - [ ] 5.6 Manual QA checklist
  
- [ ] 6.0 Polish & Documentation
  - [ ] 6.1 Add JSDoc to all public functions
  - [ ] 6.2 Update README.md
  - [ ] 6.3 Add inline comments for complex logic
  - [ ] 6.4 Optimize (memoization, lazy loading)
  - [ ] 6.5 Add loading skeletons
  - [ ] 6.6 Final refactoring
  - [ ] 6.7 Update CHANGELOG.md

## Validation Checklist
- [ ] All PRD requirements covered
- [ ] Tests for all functionality
- [ ] File paths match project structure
- [ ] Dependencies properly ordered
- [ ] Error handling addressed
- [ ] Documentation included

## Estimated Effort
- Total: X parent, Y sub-tasks
- Time: X-Y hours (mid-level dev)
- Can parallelize: [List concurrent tasks]

---
**Ready:** Respond "Start" to begin or provide feedback.
```

## Autonomous Decisions

AI decides: task granularity, ordering, file structure, testing approach, component architecture, integration strategy, error handling, optimizations, documentation.

## Quality Standards

Task list must: cover 100% PRD requirements, include all tests, follow conventions, be logically ordered, include specific paths, be actionable.

## Single Approval Point

After generating complete task list:

```markdown
Task list complete!

Summary:
- X parent tasks
- Y sub-tasks  
- Z new files
- W modified files
- Estimated: X-Y hours

Review and:
- Type "Start" to begin
- Or provide feedback
```

**No intermediate approvals during generation.**

## Output

- **Format:** Markdown
- **Location:** `/tasks/`
- **Filename:** `tasks-[prd-filename].md`

Automatically trigger Rule 3 after the user types "Start".

---

**Generate complete, production-ready task list in one comprehensive pass.**
