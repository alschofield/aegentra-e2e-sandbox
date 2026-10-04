# Task Board Product Contract

## Purpose

This disposable project tests whether Aegentra can compare an explicit product
requirement against code, create justified work, implement it and independently
review the resulting task-linked PR. Nothing here authorizes production work,
deployments, spending or changes to Aegentra itself.

## Existing Behavior

`src/task-board.js` exports `summarizeTasks(tasks)`. It counts ready, in_progress,
blocked and completed tasks without mutation. Invalid task IDs, duplicate IDs and
unsupported statuses throw `TypeError`. Preserve this behavior and its tests.

## Required Next Feature

The module must also export `selectNextTask(tasks)`, selecting the next eligible
task from the same board. This feature is required but intentionally not implemented
in the initial sandbox baseline. An Auditor should establish the gap from the
source code rather than assume this document proves implementation.

### Acceptance Criteria

1. Return the original eligible task object, or `null` if none is eligible.
2. Only tasks whose status is `ready` are eligible. Never select blocked,
   in_progress or completed tasks.
3. A task may declare `dependencies`, an array of task IDs. Every dependency must
   exist in this board and have status `completed`. Missing, incomplete or self
   dependencies make the task ineligible. Omitted dependencies mean no dependencies.
4. A task may declare numeric integer `priority` from 1 through 4; 1 is highest.
   Omitted priority means 3. Choose the lowest number among eligible tasks; break
   ties by task ID using deterministic JavaScript string ordering, not input order
   or locale-sensitive comparison.
5. Invalid base task IDs/statuses, duplicate IDs, invalid priority values or invalid
   dependency array/entry types must throw `TypeError`. Duplicate dependency IDs
   are allowed and have no additional effect.
6. Do not mutate the task objects, dependencies or input array. Repeated calls with
   the same board must return the same selection. Empty boards return `null`.
7. Extend the test suite for eligibility, ordering, defaults, dependency states,
   missing/self dependencies, invalid input, empty results and frozen inputs.
   Keep the existing summary tests passing. `npm test` is the validation command.

## Delivery And Review

Changes belong only under `src/` and `tests/`. No dependencies or external services
are needed. Preserve this contract and the test command. Link implementation PRs
to their actual authorized Linear/local task, not invented identifiers.

The Auditor reviews the exact submitted revision in a fresh context, repeats the
tests and checks acceptance coverage. Passing the baseline tests alone does not
prove the new selection feature. Requested changes return to the Worker. A PR is
not Done until authorized independent review and merge are verified; partial
contributions must leave unfinished acceptance criteria open.
