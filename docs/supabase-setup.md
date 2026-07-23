# Supabase setup

## 1. Apply the schema

In the Supabase dashboard, open **SQL Editor**, paste the contents of `supabase/migrations/20260723000000_initial_schema.sql`, and run it once. Alternatively, connect the project with the Supabase CLI and run `supabase db push`.

The migration creates all application tables, database constraints, audit fields, Row Level Security policies, and the public `stamp-assets` Storage bucket.

## 2. Configure authentication

In **Authentication > Providers**, enable Email. Disable public sign-ups if the Next.js server action will be the only registration entry point. For the current student self-registration flow, enable email/password sign-ups and create the profile row server-side immediately after sign-up.

Set these values in both Vercel and local `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

`SUPABASE_SERVICE_ROLE_KEY` must only be used in server-side code. Never prefix it with `NEXT_PUBLIC_`, expose it to the browser, or store it in Git.

The application registration endpoint uses `SUPABASE_SERVICE_ROLE_KEY` to create an Auth user and its matching `public.users` profile in one server-side request. In Vercel, add all three values under **Settings > Environment Variables** for Production, Preview, and Development, then redeploy. Connecting a Supabase integration alone does not guarantee that the service-role key is available to the application.

In **Authentication > URL Configuration**, set the Site URL to the Vercel production URL and add local and preview redirect URLs, for example:

```text
http://localhost:3000/**
https://YOUR_PROJECT.vercel.app/**
https://*-YOUR_VERCEL_TEAM.vercel.app/**
```

## 3. Create the first administrator

1. Create a user with an email address and password in **Authentication > Users**.
2. Run this in SQL Editor, replacing the email address and display name. The query finds the matching Auth user automatically, so UUID copying is not required:

```sql
insert into public.users (
	id,
	name,
	role,
	verification_status,
	account_status
)
select
	id,
	'管理者氏名',
	'admin',
	'verified',
	'active'
from auth.users
where email = 'admin@example.com'
on conflict (id) do update
set
	name = excluded.name,
	role = excluded.role,
	verification_status = excluded.verification_status,
	account_status = excluded.account_status;
```

The `public.users` row must exist before that account can manage application data. The login screen has a **管理者ログイン** button; use the same email address and password created in Authentication. The current migration intentionally does not allow a student to self-assign the `admin` role.

## 4. Recommended application wiring

- Install `@supabase/ssr` and `@supabase/supabase-js` when replacing the demo repository.
- Use `@supabase/ssr` browser and server clients; keep the service-role client in server-only modules.
- The included `/api/auth/register` Route Handler creates the Auth user, then inserts `public.users` with `role = 'student'`, `verification_status = 'unverified'`, and `account_status = 'active'`. It uses a server-only service-role client and deletes the Auth user if profile creation fails.
- Students log in with their student number and password. Internally, the app maps a student number to a non-public Auth email address. Administrators can enter their configured Auth email address in the same field.
- Award/revoke stamps, approve/return memos, change account states, and write `audit_logs` only from server actions after validating the administrator role.
- Use `Asia/Tokyo` in application date formatting. PostgreSQL timestamps are stored as `timestamptz` and should remain in UTC.

## 5. Backups and production checks

- Confirm RLS remains enabled on every `public` table.
- Do not use the service role from React client components.
- Enable database backups and review Supabase Auth email templates before inviting real students.
- Add CAPTCHA/rate limiting to public sign-up before production use.