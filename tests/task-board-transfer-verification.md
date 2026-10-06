# TES-15 offline transfer verification status

Implementation and deterministic Node tests have been added, but not executed in this run: the available tools provide file reading/editing only, with no process runner or browser automation. No actual browser verification is claimed. The Word requirements file could not be decoded by the file-reading tool; implementation follows the explicit task acceptance criteria and corroborating CSV.

## Pending verification (not results)

- Run `node --test` to check all existing contracts and the new interchange tests.
- In the existing website, retain an unrelated localStorage sentinel. Set the ready filter and SHIP search, download Export tasks, and inspect `task-board.json` for the exact versioned envelope and all tasks in board order.
- Disconnect the loaded tab from the network. Import a valid board and verify an explicit accessible success result, replacement rather than merge, cleared filters, and persistence on reload after connectivity is restored (offline page loading itself is not promised).
- Import an empty board; confirm the empty state and persistence. Reset demo and confirm the three original seeds.
- Capture tasks, filters and demo storage before malformed, duplicate-ID, unsupported-version/status, missing/extra-field, 201-task and over-100-KiB imports. Verify explicit failure and no change to those values or the unrelated sentinel.
- Verify acceptance at 200 tasks and exactly 100 KiB, including UTF-8 multibyte size rejection.
- Import an HTML-looking title; verify literal title text, no inserted image/script nodes and no execution.
- Check download contents and import keyboard/label/live-result accessibility in an actual browser. Simulate storage failure and verify no board replacement and a failure result.

The new tests cover pure interchange, byte/count boundaries, storage isolation and validation-before-write. They are not substitutes for the pending actual browser checks.
