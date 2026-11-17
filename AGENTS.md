<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Guides

Keep `docs/setup-guide.md` and `docs/structure-guide.md` true: they show on
Peter's ControlNow Development card. Update them in the same pull request as
any change to hosting, keys (names only), accounts, databases or layout.

## How changes go in

Peter, Chris and Tess ask Claude for changes in plain words; see
`docs/working-with-claude.md`.

- Open pull requests into `dev` (the sandbox), never into `main`. Merge
  `dev` into `main` (live) only when the person asks to go live, and
  first say what else is waiting on `dev`.
- Never ask for passwords or keys in chat; they live in Netlify's settings
  and the shared password manager.
