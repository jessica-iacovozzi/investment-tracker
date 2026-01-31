# Rule 1: AI-Driven PRD Generation

## Goal

Generate comprehensive PRDs from brief prompts using intelligent inference and best practices, minimizing human input to critical business decisions only.

## Philosophy

Act as a senior product manager making informed decisions based on:
- Industry best practices and common patterns
- Existing codebase architecture and conventions
- User experience principles
- Technical feasibility

## Process

### Phase 1: Initial Analysis (Autonomous)

1. **Receive prompt** from user
2. **Analyze context:**
   - Review codebase for architecture, patterns, tech stack
   - Identify similar existing features
   - Map to common product patterns (CRUD, auth, search, etc.)
3. **Infer requirements** from industry standards

### Phase 2: Targeted Clarification (Selective)

Ask 3-5 questions MAX for business-critical decisions only:
- Business logic that can't be inferred
- Ambiguous requirements with multiple valid approaches
- Significant scope/resource trade-offs

**Format with options:**
```markdown
I recommend option A based on existing patterns.

A) Real-time updates via WebSockets (recommended - matches existing chat)
B) Polling every 30 seconds (simpler, lower load)
C) Manual refresh only (minimal implementation)

Your choice [A/B/C]:
```

### Phase 3: PRD Generation (Autonomous)

Generate complete PRD with intelligent defaults for all sections.

## PRD Structure

```markdown
# PRD: [Feature Name]

## Overview
[Problem and solution description]

## Business Context
- **Problem:** User pain point
- **Success Metrics:** Measurable outcomes (inferred)
- **Priority:** [High/Medium/Low]

## Target Users
[Primary personas - inferred from codebase]

## User Stories
As a [user], I want to [action] so that [benefit].
*Generate 3-5 stories covering main and edge cases*

## Functional Requirements

### Core Functionality
1. [Requirement with acceptance criteria]
2. [Requirement with acceptance criteria]

### Data Requirements
- Models needed (infer from similar features)
- Validation rules (industry standards)
- Relationships

### User Interface
- Screens/components needed
- User flows
- Responsive behavior (from existing patterns)

### Integration Points
- APIs to integrate (identify from codebase)
- External dependencies

### Security & Privacy
- Auth/authorization (match existing)
- Data protection (best practices)
- Input validation and sanitization

### Performance
- Load expectations (reasonable defaults)
- Response time targets (industry standards)

## Non-Functional Requirements

### Accessibility
- WCAG 2.1 AA compliance (or project standard)
- Keyboard navigation
- Screen reader support

### Error Handling
- Error scenarios
- User feedback
- Fallback behaviors

### Testing
- Unit test coverage (match project standards)
- Integration test scenarios
- E2E critical paths

## Non-Goals
[Explicitly state what's out of scope]

## Technical Approach

### Architecture
- Component structure (existing patterns)
- State management approach
- API design (REST/GraphQL from existing)

### Technology Alignment
- Frameworks/libraries (from stack)
- Design system components
- Reusable utilities

### Database
- Schema changes
- Migration strategy
- Indexing

## Design Considerations
- Reference existing design system
- Component reuse opportunities
- Accessibility patterns

## Implementation Phases

### Phase 1: MVP
[Core functionality for launch]

### Phase 2: Enhancements
[Future iterations]

## Success Criteria

### Definition of Done
- Functional requirements met
- Tests passing (unit, integration, E2E)
- Code review approved
- Documentation updated
- Accessibility verified

### Acceptance Criteria
[Specific, testable criteria per requirement]

## Dependencies & Risks

### Dependencies
- External services/APIs
- Other features/teams
- Design assets

### Risks & Mitigations
- Technical challenges
- Proposed solutions

## Open Questions
*Only questions requiring human input per Phase 2*

## Assumptions
[Key assumptions made during PRD creation]
```

## Autonomous Decisions

AI makes these decisions without asking:
- Technology choices (use existing stack)
- UI components (leverage design system)
- Data validation (industry standards)
- Error messages (existing patterns)
- API design (match conventions)
- Testing strategy (project standards)
- Accessibility (WCAG 2.1 AA default)
- Security (OWASP top 10)
- Performance targets (e.g., <200ms response)
- Documentation (existing patterns)

## Quality Standards

PRD must be:
- Clear for junior developers
- Include measurable acceptance criteria
- Anticipate edge cases and errors
- Align with codebase patterns
- Follow industry best practices
- Comprehensive enough to start immediately

## Output

- **Format:** Markdown
- **Location:** `/tasks/`
- **Filename:** `prd-[feature-name-slug].md`

## Instructions

1. **Prioritize autonomy:** Make informed decisions from context
2. **Minimize questions:** Only ask what can't be inferred (3-5 max)
3. **Provide recommendations:** Suggest best option when asking
4. **Be comprehensive:** Fill all sections with intelligent defaults
5. **Stay aligned:** Match project patterns
6. **Think like PM:** Consider users, business value, technical feasibility

**PRD should be immediately actionable without further clarification.**
