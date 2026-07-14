# Supabase security deployment

The repository contains the required RLS migration at
`supabase/migrations/202607140001_secure_blog_policies.sql`. Applying it changes
external database state, so deploy it only from an authenticated, explicitly
linked Supabase project.

## Current status

Applied to the `tsyncblog` project on 2026-07-15 through the authenticated
Supabase plugin. Anonymous reads, admin writes, non-admin write rejection, and
zero test-row residue were verified after deployment.

## Deploy

1. Authenticate with the Supabase CLI: `supabase login`.
2. Link the intended project: `supabase link --project-ref <project-ref>`.
3. Review the linked project name and migration SQL before continuing.
4. Preview pending migrations: `supabase db push --dry-run`.
5. Apply migrations: `supabase db push`.
6. Assign administrators through a trusted server or the Supabase dashboard by
   setting `app_metadata.role` to `admin`. Never grant this role from browser
   code or `user_metadata`.

## Verify

- An anonymous user can read `blog_posts`.
- An anonymous user cannot insert, update, or delete `blog_posts`.
- An authenticated non-admin cannot insert, update, or delete `blog_posts`.
- An authenticated user with `app_metadata.role = admin` can insert, update,
  and delete `blog_posts`.
- Removing the role immediately removes write access after the session token is
  refreshed.

Keep project references, access tokens, service-role keys, and database
credentials out of this repository and its logs.
