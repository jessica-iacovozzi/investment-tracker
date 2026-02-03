---
description: Generate a complete task list from an existing PRD file
---
# Generate Tasks Workflow

This workflow generates a complete, actionable task list from a PRD in one pass.

## Step 1: Identify PRD

Ask the user which PRD to use, or automatically detect the most recent PRD in `/tasks/prd-*.md`.

## Step 2: Analysis (Autonomous)

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

## Step 3: Generate Complete Task Structure

Generate ALL parent tasks AND sub-tasks in a single pass.

### Parent Task Pattern (4-7 tasks):
1. **Foundation & Setup** - data models, types, utilities
2. **Backend/API** - API routes, data layer (if applicable)
3. **Core Components** - main feature components
4. **Integration** - connecting pieces, state management
5. **Testing** - comprehensive test coverage
6. **Polish** - refinement, docs, edge cases

### Sub-Task Principles:
- Atomic (15-45 min each)
- Include specific file paths
- Cover: implementation, types, tests, docs, error handling
- Ordered by logical dependency

## Step 4: Identify Files

List all files to create/modify:

```markdown
## Relevant Files

### New Files
- `path/Component.tsx` - Main component for [feature]
- `path/Component.test.tsx` - Unit tests
- `path/api/endpoint.ts` - API handler
- `types/feature.ts` - Type definitions

### Files to Modify
- `path/existing.tsx` - Add integration
- `types/index.ts` - Export new types

### Testing
- Unit: `npx jest path/to/test.tsx`
- All: `npx jest`
```

## Step 5: Generate Task List

Create the task list in `/tasks/tasks-[prd-filename].md`:

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
  - [ ] 1.1 Create types in `types/feature.ts`
  - [ ] 1.2 Create utils in `lib/utils/helpers.ts`
  - [ ] 1.3 Write tests for utils
  - [ ] 1.4 Define constants
  - [ ] 1.5 Create mock data

- [ ] 2.0 Backend/API Implementation
  - [ ] 2.1 Create API route
  - [ ] 2.2 Add request validation
  - [ ] 2.3 Implement error handling
  - [ ] 2.4 Write API tests

- [ ] 3.0 Core Component Development
  - [ ] 3.1 Create main component structure
  - [ ] 3.2 Implement component logic
  - [ ] 3.3 Add TypeScript types
  - [ ] 3.4 Write component tests

- [ ] 4.0 Integration & State
  - [ ] 4.1 Create data fetching hook
  - [ ] 4.2 Write hook tests
  - [ ] 4.3 Integrate API calls
  - [ ] 4.4 Add error boundary
  - [ ] 4.5 Implement loading/error states

- [ ] 5.0 Testing & Validation
  - [ ] 5.1 Write E2E tests
  - [ ] 5.2 Add accessibility tests
  - [ ] 5.3 Test error scenarios
  - [ ] 5.4 Verify mobile responsiveness
  - [ ] 5.5 Achieve >80% coverage

- [ ] 6.0 Polish & Documentation
  - [ ] 6.1 Add JSDoc to public functions
  - [ ] 6.2 Update README
  - [ ] 6.3 Optimize performance
  - [ ] 6.4 Final refactoring

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
```

## Step 6: Present and Await Approval

```markdown
Task list complete!

Summary:
- X parent tasks
- Y sub-tasks
- Z new files
- W modified files
- Estimated: X-Y hours

Review and:
- Type "Start" to begin execution
- Or provide feedback for revisions
```

## Step 7: Begin Execution

When user types "Start", begin task execution following the task management rule (Rule 3).
