# Mahdi Digital Space

A responsive bilingual portfolio and content dashboard built with Next.js, TypeScript, Prisma, and PostgreSQL.

## Setup

1. Install Node.js 20+ and PostgreSQL.
2. Copy `.env.example` to `.env` and set `DATABASE_URL`, a random `AUTH_SECRET` of at least 32 characters, `ADMIN_EMAIL`, and a unique `ADMIN_PASSWORD` (12+ characters).
3. Run `npm install`, `npm run db:generate`, `npm run db:migrate`, `npm run db:seed`, then `npm run dev`.
4. Visit `/` for the public site and `/admin` to sign in.

`npm run create-admin` creates the first admin using `ADMIN_EMAIL` and `DATABASE_URL`. Set `ADMIN_PASSWORD` to choose the password; if it is unset, the script generates a 24-character password and prints it once after successful creation. It hashes passwords with the same bcrypt configuration used by login and safely skips an existing email. Apply migrations with `npm run db:migrate` first. On Vercel, configure `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `AUTH_SECRET` for Production, then run the command with `vercel env run -e production -- npm run create-admin` from a linked project.

`prisma/migrations` contains the initial PostgreSQL schema. `npm run db:migrate` applies the committed migration in development or deployment. Project CRUD and contact inbox are database-backed. The admin password is bcrypt hashed; sessions are signed, eight-hour, HTTP-only cookies. Admin APIs check the signed session on every request. Public contact and login APIs validate inputs and use per-IP in-memory rate limits. Production deployments should provide a shared rate limiter (for example Redis) when running multiple instances and configure TLS/reverse-proxy trusted IP handling.

Unknown biography, links, location, and personal history are editable placeholders or clearly generic copy. Do not publish until Mahdi replaces them. Set `NEXT_PUBLIC_SITE_URL` to the canonical deployment URL for metadata.

## Current scope

The public site supports English/Arabic language and layout direction, theme switching, project search/filtering, database-backed project details, contact submissions, and editable projects through the admin dashboard. The admin currently includes sign-in, project create/delete, inbox viewing, visit counts, and activity entries. Skills, experience, biography/settings editing, file uploads, and social link management still need admin interfaces and routes; uploads are not enabled. Personal content remains a placeholder until supplied.

### Termux note

Prisma Client uses its JavaScript query engine with the `pg` adapter, which avoids platform-specific Rust query binaries. Prisma CLI migrations still require Prisma’s schema engine; this Termux/Android environment reports an unsupported platform for that CLI command. On Termux, apply the committed SQL with `psql -f prisma/migrations/20261108000000_init/migration.sql` for a fresh database. On supported Linux/macOS deployments, use `npm run db:migrate`.

## Automated Git workflow

- GitHub Actions runs `npm run validate` for pushes to `main`, pull requests into `main`, and manual workflow dispatch. The checks include Prisma client generation, TypeScript, ESLint, unit tests, and a production build.
- For a local save and push in one step, run `npm run ship -- "feat: describe the change"`. It validates first, refuses to touch an already-staged index, checks changed paths for likely secrets, prints the files it will commit, then creates a commit and pushes the current branch to `origin`.
- Configure your Git author identity and GitHub HTTPS/SSH authentication once. If the push is rejected, the completed commit remains local and the script reports the Git error; it will not claim a successful push.
- Run `npm run validate` directly when you only want checks without creating a commit.
