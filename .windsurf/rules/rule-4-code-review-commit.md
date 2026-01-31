---
trigger: model_decision
description: After all tasks in a task-prd file are completed
---
# Rule 4: Autonomous Code Review & Commit

## Goal

Perform senior-level code review and autonomously commit approved code after each parent task completion.

## Trigger

Automatically after parent task completes with all tests passing.

## Review Process

### Phase 1: Pre-Review Validation

Verify before review:
- [ ] All sub-tasks complete
- [ ] All tests passing
- [ ] No build/linter errors
- [ ] Task list updated

### Phase 2: Review Criteria

#### 2.1 Requirements (CRITICAL - Must be 100%)
- [ ] All functional requirements implemented
- [ ] User stories work end-to-end
- [ ] Acceptance criteria met
- [ ] Edge cases handled

#### 2.2 Code Quality
- [ ] Clear, self-documenting code
- [ ] DRY principle followed
- [ ] Functions focused and small (<50 lines)
- [ ] Proper TypeScript types (no `any`)
- [ ] Error handling on all async operations
- [ ] Meaningful variable/function names

#### 2.3 Testing (CRITICAL - Must be 100%)
- [ ] Unit tests for all functions
- [ ] Integration tests for main flows
- [ ] Edge cases covered
- [ ] All tests passing
- [ ] Coverage >80%

#### 2.4 Security (CRITICAL - Must be 100%)
- [ ] Input validation everywhere
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitized outputs)
- [ ] Auth checks on protected routes
- [ ] No hardcoded credentials
- [ ] Secrets in environment variables

#### 2.5 Performance
- [ ] No O(n²) where O(n) possible
- [ ] Proper React memoization (useMemo/useCallback)
- [ ] No N+1 query problems
- [ ] Event listeners cleaned up

#### 2.6 Accessibility
- [ ] Semantic HTML
- [ ] Proper ARIA labels
- [ ] Keyboard navigation works
- [ ] Color contrast meets standards

#### 2.7 Integration
- [ ] Follows existing patterns
- [ ] Uses established utilities
- [ ] No code duplication
- [ ] Matches project style

#### 2.8 Documentation
- [ ] JSDoc for public functions
- [ ] Complex logic commented
- [ ] README updated if needed

### Phase 3: Scoring & Decision

Calculate review score:

```markdown
Requirements:  [X/Y] ✓/✗
Code Quality:  [X/Y] ✓/✗
Testing:       [X/Y] ✓/✗ (CRITICAL)
Security:      [X/Y] ✓/✗ (CRITICAL)
Performance:   [X/Y] ✓/✗
Accessibility: [X/Y] ✓/✗
Integration:   [X/Y] ✓/✗
Documentation: [X/Y] ✓/✗

Overall: [X%]
```

**Decision Rules:**

- **APPROVE & COMMIT:** All critical categories 100%, overall ≥90%
- **APPROVE WITH NOTES:** All critical 100%, overall ≥85%
- **REVISE:** Any critical <100% or overall <85%

### Phase 4: Auto-Fix

Before committing, auto-fix:
- Linting errors (run auto-fix)
- Formatting (run prettier)
- Missing JSDoc (add basic docs)
- Console.logs (remove)

Then re-test and re-score.

### Phase 5: Remediation (If Needed)

If score below threshold:

**Critical Issues:**
1. Identify root cause
2. Implement fix
3. Verify with tests
4. Re-review affected sections
5. Update score

**Max 3 revision cycles.** If still failing, create detailed report and pause (exceptional case only).

## Commit Protocol

### Step 1: Stage Files

```bash
# Add all files related to this parent task
git add path/to/file1.tsx
git add path/to/file1.test.tsx
# ... all relevant files
```

### Step 2: Generate Commit Message

Use conventional commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:** feat, fix, refactor, test, docs, style, perf

**Example:**
```
feat(user-profile): implement profile editing

- Add ProfileEditForm with validation
- Create useProfileUpdate hook
- Implement error handling and loading states
- Add comprehensive tests (95% coverage)

Tests: All passing
```

### Step 3: Pre-Commit Checks

```bash
npm run lint
npx jest
npm run build  # if applicable
npx tsc --noEmit
```

All must pass.

### Step 4: Execute Commit

```bash
git commit -m "[generated message]"
```

### Step 5: Update Task List

```markdown
- [x] 3.0 Core Component Development
  **Committed:** [hash] - "feat(feature): description"
  **Review Score:** 95%
  **Tests:** ✓ All passing
```

### Step 6: Continue

Immediately proceed to next parent task (Rule 3) or trigger final review if all tasks complete.

## Review Documentation

Save review report as `/tasks/review-task-[X.0].md`:

```markdown
## Code Review: Task X.0

**Decision:** ✓ APPROVED
**Score:** 95%
**Commit:** [hash]

### Scores
| Category | Score |
|----------|-------|
| Requirements | 100% ✓ |
| Code Quality | 95% ✓ |
| Testing | 100% ✓ |
| Security | 100% ✓ |
| Performance | 90% ✓ |
| Accessibility | 95% ✓ |
| Integration | 100% ✓ |
| Documentation | 90% ✓ |

### Test Results
- Unit: 45/45 passing (92% coverage)
- Integration: 12/12 passing

### Files Changed
- 8 files modified
- +250 lines, -30 lines

### Next Steps
Proceeding to Task Y.0...
```

## Error Recovery

**Minor Issues:** Auto-fix and proceed
**Major Issues:** Fix, re-test, re-review
**Cannot Fix (after 3 cycles):** Pause for human review (exceptional only)

## Quality Metrics

Track across commits:

```markdown
## Metrics

**Total Commits:** N
**Avg Review Score:** X%
**Test Coverage:** X%
**Last 5 Commits Avg:** X%
```

## Workflow Integration

```
Parent Task Done (Rule 3)
    ↓
Pre-Review Validation
    ↓
Review All Criteria
    ↓
[≥90%] → Auto-Fix → Commit → Next Task
[<90%] → Fix Issues → Re-Review → Commit → Next Task
    ↓
Continue until all tasks complete
```

**No human intervention unless 3 review cycles fail.**

---

**The AI autonomously reviews and commits with senior-level rigor, ensuring production-ready quality.**
