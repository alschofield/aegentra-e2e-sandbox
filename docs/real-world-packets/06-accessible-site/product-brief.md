# Task Board Website: Approved Sandbox Scope

The repository already contains task-board utility functions but no usable website.
Build a coherent, accessible, responsive local task-board website using those
existing contracts where appropriate. This is approved implementation work, not
an invitation to invent other products. Keep existing utilities/tests working.

## Deliverable

Use Node's built-in modules and browser-native HTML/CSS/JavaScript only; no new
dependencies, external fonts/scripts, credentials, deployment or remote services.
Place the HTTP entry point at src/task-board-server.js and the browser assets under
src/web/. Start with node src/task-board-server.js. Bind to127.0.0.1, honor the PORT
environment variable and default to4178. Export createTaskBoardServer() returning
an unstarted Node HTTP server so tests can use an ephemeral port without side
effects on import. Serve only /, /app.js and /app.css from fixed allowlisted files.
Unknown paths and traversal attempts return404. Do not expose the repository.
Responses include Content-Security-Policy and X-Content-Type-Options:nosniff. No
inline scripts or eval; the page must actually work with its CSP enabled.

## User Experience

Make a considered light-theme desktop/mobile interface, not a bare unstyled test
form. Include a main heading Task Board, a visible task list with status labels,
and a useful empty state. At390px width it must not overflow horizontally. Use
proper labels, visible keyboard focus and semantic controls; do not rely on color
alone. The UI must work entirely offline once loaded.

On first visit seed exactly these three illustrative tasks:

| Title | Status |
|---|---|
| Ship launch checklist | ready |
| Wait for design sign-off | blocked |
| Review accessibility notes | completed |

Required controls and behavior:

- A text input labelled Task title, a select labelled Task status with ready,
  blocked and completed options, and an Add task button.
- Trim entered titles. Reject blank/whitespace-only titles with an accessible
  visible error; do not append an empty record. New IDs must be unique.
- A Search tasks input performs case-insensitive title substring matching.
- A Filter status select supports all, ready, blocked and completed and combines
  with the search, rather than overriding it.
- Every task has an accessible Complete task button associated with its title.
  Completion changes that record to completed without duplicating it.
- Store task state in localStorage. Adding/completing tasks survives page reload.
  Invalid saved JSON/records must not crash the page; recover to valid demo data
  with an explicit notice. Browser data is illustrative, not a real task-system
  integration. Do not claim server/database persistence.
- A Reset demo button restores exactly the three seed tasks and clears filters;
  it only affects this demo's localStorage key, never other browser storage.
- Render task titles as text, never executable HTML. A title such as
  <img src=x onerror=alert(1)> must be visible literally and create no image/script.
- When filters match nothing, display No matching tasks.

Add meaningful Node tests under tests/ for the server, route whitelist/security
headers and any extracted deterministic task-state helpers. npm test must finish
and all existing tests must still pass. Record only actual validation evidence;
browser verification is separate from Node tests. No README/package.json edits are
required or authorized by this packet.
