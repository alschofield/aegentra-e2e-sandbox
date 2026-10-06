# Approved Enhancement: Portable Offline Task Boards

Extend the existing Task Board website; do not build a second website or replace
its server/utility contracts. Users need to move their illustrative board between
browsers without accounts, a backend database, new dependencies or remote services.
The Word requirements document specifies the JSON interchange and acceptance rules.
The CSV is corroborating test observations. Preserve all existing behavior/tests.

Add Export tasks and a labelled Import tasks JSON file control. Transfers apply to
the existing demo only, use its existing localStorage key and work in a loaded tab
without a network connection. Successful import replaces the current board atomically
after validation and survives reload; failure must leave existing tasks unchanged.
Show an accessible explicit import result. Clearing stale search/status filters on
successful import avoids hiding the imported board. Reset demo still restores seeds.

Export filename: task-board.json. Data format: exactly
{"schema_version":1,"tasks":[{"id":"a","title":"A title","status":"ready"}]}.
Export all tasks in board order regardless of filters. Validate imports before any
storage/DOM update: JSON object with schema_version1 and tasks array, at most200 tasks,
file at most100KiB, unique nonempty string IDs, nonempty string titles (trim them),
status ready/blocked/completed. Reject malformed JSON, missing/wrong fields,
unsupported version/status, duplicate IDs, extra root/task fields and oversized input.
An empty task array is valid. Treat titles as text, never HTML. No import merges,
external fetches, credential operations, backend persistence or deployment are requested.

Add deterministic Node coverage for interchange validation/export and retain the
existing browser contract. Actual browser verification must exercise download contents,
valid/empty imports, reload, atomic rejection, duplicate/version/status/size limits,
HTML-looking title safety, filter clearing and isolation of unrelated localStorage.
