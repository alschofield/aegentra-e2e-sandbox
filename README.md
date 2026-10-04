# Aegentra E2E Sandbox

Disposable, dependency-free JavaScript project for testing the Auditor -> Worker
-> fresh Auditor review -> task-linked PR workflow. This is not a production app.

## Baseline

The task-board module validates task IDs/statuses and summarizes a task list.
Its tests pass before any agent work. There are no credentials, network calls,
databases, third-party dependencies or deployment steps.

```powershell
npm test
```

No `npm install` is required. Node.js is the only prerequisite.

GitHub Actions runs the same tests on pushes to main and pull requests, providing
check-run evidence for authorized PR review/merge. Its five-minute test-job limit
is separate from the agent profile's longer execution timeout.

## Intended First Agent Task

Read [Product Contract](docs/product.md). The desired `selectNextTask(tasks)`
export is deliberately absent from the baseline. This is the first evidence-backed
feature gap for the Auditor to propose and the Worker to implement with tests.
The baseline tests are not deliberately broken.

## Profile Scope

Auditor allowed code paths, one per line:

```text
src/
tests/
docs/
package.json
```

Worker allowed code paths:

```text
src/
tests/
```

Use `npm test` as the validation command for both profiles. Point the project's
document evidence folder at this repository's `docs/` folder when configuring it.
If the already-registered project uses the sibling empty sandbox-docs folder,
the Auditor's declared `docs/` code path still includes this product contract;
there is no need to create another project or duplicate the source document.

Keep the product contract, package scripts and review policy outside Worker edit
scope. The Worker must add implementation/tests, not weaken requirements or
replace verification with a command that always succeeds.

The baseline must be committed before worktree execution: isolated Git worktrees
do not receive uncommitted scaffolding. Commit/push and live model/service actions
remain separately authorized. Never use this repo to deploy or access production.
