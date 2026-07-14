# TemporalSync Project Memory

Last updated: 2026-07-15

## Product Context

- TemporalSync is a personal workspace for AI medicine, research, AI news, writing, and content-formatting tools.
- The primary user-facing routes are About, AI Hot Topics, Study Room, Blog, Settings, Admin, WeChat Converter, and Md2Red.

## Architecture Decisions

- The frontend is a React single-page application with lazy-loaded route modules.
- Development uses an Express server with Vite middleware; production builds static frontend assets and can bundle the Express server separately.
- Theme and language preferences are provided through `SettingsContext`.
- External AI/news credentials are configured through environment variables; secret values must never be stored here.
- Unused arbitrary URL metadata and avatar proxy endpoints were removed on 2026-07-14. News items now use direct avatar URLs with a client-side fallback.
- Markdown rendered into previews or blog content must pass through DOMPurify before reaching `dangerouslySetInnerHTML`.
- Admin access requires a Supabase user with `app_metadata.role = "admin"`; client-side role checks complement, but do not replace, database RLS.
- AI news loads only on the `/hot` route. Express and EdgeOne share deterministic feed normalization through `shared/ai-news.ts`; the disabled request-time scraping/model-enrichment code was removed.
- TypeScript `strict` mode is enabled. Regression tests use Node's built-in test runner with `tsx` and cover frontmatter, news normalization, Markdown sanitation boundaries, local-storage validation, and admin-role authorization.
- Markdown frontmatter parsing uses the local `src/lib/frontmatter.ts` subset parser; `gray-matter` was removed to eliminate its generated-code warning and unnecessary dependency chain.
- The unused CloudBase catch-all proxy and permissive legacy database rules were removed; Supabase is the only supported application data/auth backend.
- The secure blog RLS migration was applied to the `tsyncblog` Supabase project on 2026-07-15. Anonymous users have read-only access, authenticated writes require `app_metadata.role = "admin"`, and the project's sole existing user was assigned that role.
- Work and Blog use a shared editorial hierarchy introduced on 2026-07-15: page-level heroes, compact Barlow metadata, large display headings, semantic cards, 44px interaction targets, and reduced-motion-aware transitions. Work preview media is captured from the real product routes and stored in `public/assets/work/`; refresh those captures when the underlying interfaces change materially.
- The theme control belongs in the global navigation on desktop and in the mobile menu. Do not reintroduce a floating page-level theme button because it overlaps route content on narrow screens.
- Blog list cards are semantic route links, the newest filtered post is the featured story, and route changes reset scroll position so article details always open at the top.

## Known Constraints And Follow-ups

- Apply `supabase/migrations/202607140001_secure_blog_policies.sql` to any future Supabase project before exposing `/admin`; deployment and verification steps are documented in `supabase/DEPLOYMENT.md`.
- Supabase Auth leaked-password protection is currently disabled on `tsyncblog`; enable it from the Auth password-security settings when the plan supports the feature.
