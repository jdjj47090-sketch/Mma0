# Mahdi Digital Space

A responsive bilingual portfolio and content dashboard built with Next.js, TypeScript, Prisma, and PostgreSQL.

## Setup

1. Install Node.js 20+ and PostgreSQL.
2. Copy `.env.example` to `.env` and set `DATABASE_URL`, a random `AUTH_SECRET` of at least 32 characters, `ADMIN_EMAIL`, and a unique `ADMIN_PASSWORD` (12+ characters).
3. Run `npm install`, `npm run db:generate`, `npm run db:migrate`, `npm run db:seed`, then `npm run dev`.
4. Visit `/` for the public site and `/admin` to sign in.

The database migration folder is generated with `npx prisma migrate dev --name init` on a configured development database. `npm run db:migrate` applies committed migrations in a deployment environment. Project CRUD and contact inbox are database-backed. The admin password is bcrypt hashed; sessions are signed, eight-hour, HTTP-only cookies. Admin APIs check the signed session on every request. Public contact and login APIs validate inputs and use per-IP in-memory rate limits. Production deployments should provide a shared rate limiter (for example Redis) when running multiple instances and configure TLS/reverse-proxy trusted IP handling.

Unknown biography, links, location, and personal history are editable placeholders or clearly generic copy. Do not publish until Mahdi replaces them. Set `NEXT_PUBLIC_SITE_URL` to the canonical deployment URL for metadata.
