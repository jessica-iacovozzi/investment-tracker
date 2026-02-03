---
trigger: model_decision
description: When executing tasks from a task-prd file or implementing features sequentially
---
# Rule 3: Autonomous Task Execution

## Goal

Execute all tasks autonomously with zero human intervention. The AI self-manages workflow, updates progress, and maintains quality through continuous testing.

## Core Principle

**Execute → Test → Update → Continue**

No approvals. No confirmations. Only pause for catastrophic failures (filesystem corruption, missing critical dependencies).

## Execution Protocol

### Per Sub-Task

1. **Implement**
   - Follow existing codebase patterns
   - Include TypeScript types
   - Add error handling
   - Write inline documentation

2. **Test**
   - Run: `npx jest [test-file]`
   - If fails: debug and fix immediately (max 3 attempts)
   - Must pass before proceeding

3. **Mark Complete**
   - Update task list: `[ ]` → `[x]`
   - Move to next sub-task immediately

### Per Parent Task

When all sub-tasks complete:
1. Mark parent complete: `[x]`
2. Run integration tests
3. Trigger Rule 4 (Code Review)
4. Continue to next parent task

## Task List Maintenance

Update task file after each sub-task:

```markdown
## Progress
**Last Updated:** [Timestamp]
**Current:** Task X.Y
**Completed:** N/M tasks (X%)

## Relevant Files
### Completed ✓
- `path/file.tsx` - Description - ✓ Task 2.3

### In Progress 🔄
- `path/current.tsx` - Description - 🔄 Task 3.2

### Planned 📋
- `path/future.tsx` - Description - 📋 Task 4.1
```

## Error Handling

### Auto-Resolution Strategy

**Test Failures:**
1. Analyze error message
2. Fix code
3. Re-run tests
4. Max 3 attempts → simplify approach

**Build Errors:**
1. Check syntax, types, imports
2. Fix and rebuild
3. Verify success

**Integration Issues:**
1. Review integration points
2. Verify interfaces match
3. Fix and test end-to-end

### Fallback Patterns
- Simplify implementation
- Use alternative approach
- Defer optimization
- Add TODO for future
- Continue forward

## Quality Standards

Every implementation must have:
- TypeScript types for all functions
- Error handling for async operations
- Input validation where applicable
- Meaningful names
- JSDoc for public APIs
- Tests for all logic
- No linter/compiler errors

## Workflow Automation

```
For each Sub-Task:
  Implement → Test → Fix if needed → Mark complete → Next
  
All Sub-Tasks Done:
  Mark Parent complete → Integration tests → Code Review (Rule 4) → Next Parent
  
Repeat until all tasks complete
```

**Never:**
- Wait for approval
- Ask permission
- Request confirmation
- Stop between tasks

**Always:**
- Continue immediately
- Self-validate through testing
- Fix issues autonomously
- Update task list in real-time

## Testing Requirements

- **Coverage:** >80% for new code
- **Run tests:** After each sub-task with logic
- **Fix failures:** Before marking complete

```bash
# Run specific test
npx jest path/to/test.tsx

# Run all tests
npx jest

# With coverage
npx jest --coverage
```

## Emergent Tasks

When discovering new required tasks:
1. Add to task list in logical position
2. Use numbering like 3.1a for insertions
3. Implement immediately if blocking

## Final Summary

When all tasks complete:

```markdown
## Implementation Complete ✓

**Tasks:** X parent, Y sub-tasks
**Files Created:** N new
**Files Modified:** M existing
**Test Coverage:** X%
**Status:** All tests passing ✓

Proceeding to automated code review (Rule 4)...
```

## Integration with Rule 4

After all tasks complete:
1. Run full test suite
2. Automatically trigger Rule 4
3. No pause - seamless transition

---

**The AI is trusted to execute autonomously and deliver production-ready code without human intervention.**
