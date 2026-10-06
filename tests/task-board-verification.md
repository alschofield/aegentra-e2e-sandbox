# TES-14 / task 10 verification record

Authorized reference: https://linear.app/scholocaltest/issue/TES-14/build-and-validate-the-accessible-local-task-board-website

## Implementation inspection (not execution evidence)

Inspected `src/` and `tests/`: existing task utilities and Node tests were present, but no website implementation or web assets. Existing utilities, tests, package.json and README remain unchanged. Added a standalone server and browser-native assets. The existing task utilities support a different four-status domain; this demo's three-status state helpers live in app.js without changing those APIs.

The server uses a fixed map and compares raw paths without URL normalization or decoding. Browser task titles use textContent. Storage writes target only `aegentra.task-board.demo.v1`; reset never calls localStorage.clear(). All scripts/styles are external, no eval is used, and there are no runtime network requests after initial asset loading. These are source-inspection observations, not proof of runtime behavior.

## Node verification — NOT RUN

Added `task-board-server.test.js` and `task-board-web-state.test.js`. They cover the unstarted factory, allowed routes, raw/encoded traversal and repository paths, response security headers, seeds, title validation, unique-ID rejection, combined filtering, immutable completion, serialized state recovery and literal-title state handling.

`npm test` could not be run: this harness exposes file reading/searching/patching only, with no command-execution tool. No test pass count, exit code or successful run is claimed. All prior tests remain present. CLI binding, PORT handling and default port have only been inspected in source, not exercised.

## Browser verification — NOT RUN (separate from Node tests)

No browser automation or interactive browser tool is available. The following checks remain unperformed:

- Form validation: submit empty and whitespace titles, confirm visible alert, aria-invalid and focused title input; add one trimmed title and verify exactly one record.
- Combined filtering: search SHIP with Ready selected and confirm only Ship launch checklist; select Blocked and confirm No matching tasks.
- Completion: activate a title-associated Complete task control, confirm completed status and no duplicate; check focus after a filtered record disappears.
- Reload persistence: add and complete tasks, reload on the same origin and confirm persistence.
- Invalid-data recovery: write malformed JSON, invalid records and duplicate IDs to the demo key; reload and confirm three seeds plus explicit notice.
- Reset isolation: create an unrelated localStorage sentinel, alter the demo and filters, reset; confirm three seeds, clear filters and unchanged sentinel.
- Literal rendering: add `<img src=x onerror=alert(1)>`; confirm visible literal text, no image element and no executed handler.
- CSP compatibility: load with response CSP enabled, inspect console for violations and exercise all controls.
- Keyboard accessibility: tab through labels/controls, verify visible focus, operate selects and buttons by keyboard, inspect accessible names/status announcements.
- Offline: load all three assets, take the browser offline and exercise adding/filtering/completion/reset in the loaded tab. An offline reload is not promised.
- 390px layout: inspect document scrollWidth against viewport width, including a long unbroken title, focus outlines and all controls. Responsive CSS is implemented but no measured no-overflow result is claimed.

Runtime acceptance, including npm test and the above browser checks, remains pending. No commit, push, approval or merge was performed; those actions belong to the control plane.
