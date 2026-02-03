---
description: Generate a comprehensive PRD from a brief feature prompt
---
# Generate PRD Workflow

This workflow generates a comprehensive Product Requirements Document (PRD) from a brief prompt using intelligent inference and best practices.

## Step 1: Receive Feature Prompt

Ask the user to describe the feature they want to build in 1-3 sentences.

## Step 2: Analyze Context (Autonomous)

1. Review codebase for architecture, patterns, and tech stack
2. Identify similar existing features
3. Map to common product patterns (CRUD, auth, search, etc.)
4. Infer requirements from industry standards

## Step 3: Targeted Clarification (3-5 Questions Max)

Ask only business-critical questions that cannot be inferred:
- Business logic that can't be determined from context
- Ambiguous requirements with multiple valid approaches
- Significant scope/resource trade-offs

Format questions with options and recommendations:
```
I recommend option A based on existing patterns.

A) [Recommended option with reasoning]
B) [Alternative option]
C) [Minimal option]

Your choice [A/B/C]:
```

## Step 4: Generate Complete PRD

Create the PRD with this structure in `/tasks/prd-[feature-name-slug].md`:

```markdown
# PRD: [Feature Name]

## Overview
[Problem and solution description]

## Business Context
- **Problem:** User pain point
- **Success Metrics:** Measurable outcomes
- **Priority:** [High/Medium/Low]

## Target Users
[Primary personas - inferred from codebase]

## User Stories
As a [user], I want to [action] so that [benefit].
*Generate 3-5 stories covering main and edge cases*

## Functional Requirements

### Core Functionality
1. [Requirement with acceptance criteria]

### Data Requirements
- Models needed
- Validation rules
- Relationships

### User Interface
- Screens/components needed
- User flows
- Responsive behavior

### Integration Points
- APIs to integrate
- External dependencies

### Security & Privacy
- Auth/authorization (match existing)
- Data protection
- Input validation

### Performance
- Load expectations
- Response time targets

## Non-Functional Requirements

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support

### Error Handling
- Error scenarios
- User feedback
- Fallback behaviors

### Testing
- Unit test coverage
- Integration test scenarios
- E2E critical paths

## Non-Goals
[Explicitly state what's out of scope]

## Technical Approach

### Architecture
- Component structure
- State management approach
- API design

### Technology Alignment
- Frameworks/libraries from stack
- Design system components
- Reusable utilities

### Database
- Schema changes
- Migration strategy

## Design Considerations
- Reference existing design system
- Component reuse opportunities

## Implementation Phases

### Phase 1: MVP
[Core functionality for launch]

### Phase 2: Enhancements
[Future iterations]

## Success Criteria

### Definition of Done
- Functional requirements met
- Tests passing
- Code review approved
- Documentation updated
- Accessibility verified

### Acceptance Criteria
[Specific, testable criteria per requirement]

## Dependencies & Risks

### Dependencies
- External services/APIs
- Other features/teams

### Risks & Mitigations
- Technical challenges
- Proposed solutions

## Open Questions
*Only questions requiring human input*

## Assumptions
[Key assumptions made during PRD creation]
```

## Step 5: Autonomous Decisions

Make these decisions without asking:
- Technology choices (use existing stack)
- UI components (leverage design system)
- Data validation (industry standards)
- Error messages (existing patterns)
- API design (match conventions)
- Testing strategy (project standards)
- Accessibility (WCAG 2.1 AA default)
- Security (OWASP top 10)
- Performance targets (<200ms response)

## Step 6: Present PRD

Present the complete PRD and ask:
```
PRD complete! Review and:
- Type "generate tasks" or call /generate-tasks to create the task list
- Or provide feedback for revisions
```
