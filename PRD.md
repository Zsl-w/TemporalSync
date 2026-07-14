# TemporalSync P0/P1 Hardening and Core UX

Date: 2026-07-14

## Problem

TemporalSync has a recognizable visual identity, but production readiness is limited by unsafe server-side URL proxying, unsanitized Markdown preview HTML, an implicit admin authorization boundary, an overloaded mobile header, and expensive global news prefetching. The home page also lacks a direct path into the product's core experiences.

## Goal

Make the public site safe and understandable enough for broader use without redesigning its established visual language.

## In Scope

- Remove unused arbitrary URL metadata proxying and the server-side avatar proxy.
- Sanitize all Markdown preview and fallback HTML.
- Require the Supabase JWT claim `app_metadata.role = admin` for the admin console and blog writes.
- Add a compact, keyboard-accessible mobile navigation menu.
- Add clear home-page calls to action for AI Signals and Tools.
- Fetch news only when the hot-topics route is visited.
- Add a not-found route and an application error boundary.
- Improve hot-topic search clarity and focus visibility.

## Out of Scope

- Full visual redesign.
- A scheduled news-ingestion service.
- Strict TypeScript migration across the entire repository.
- Full WCAG conformance certification.
- Blog CMS or database schema redesign beyond access policies.

## Acceptance Criteria

- No public endpoint fetches a caller-provided arbitrary URL.
- Imported Markdown containing raw HTML is sanitized before preview rendering.
- A signed-in non-admin user cannot enter the admin workspace or write blog rows when the supplied RLS migration is applied.
- At 375px width, navigation remains usable without horizontal clipping and every primary route is discoverable.
- The home page exposes direct links to `/hot` and `/work` above the fold.
- Visiting non-news routes does not call `/api/ai-news`.
- Unknown routes render a useful recovery screen.
- Type checking, frontend build, and server build pass.

## Risks

- Existing Supabase users need the admin role added to `app_metadata` before the new admin gate permits access.
- Removing the avatar proxy may expose the visitor's IP address to the avatar provider, as ordinary third-party image loading does.
- The RLS migration must be applied to the active Supabase project; committing it alone does not change production policy.

---

## Phase 2: Engineering Risk Reduction

Date: 2026-07-15

### Goal

Convert the remaining local engineering risks into verified controls without changing the product design or deployed external state.

### In Scope

- Add an automated test baseline using the already installed TypeScript runtime.
- Enable strict TypeScript and resolve repository-owned type errors.
- Replace `gray-matter` with a small frontmatter parser for the subset used by TemporalSync.
- Consolidate duplicated AI news normalization, fallback classification, avatar selection, and response shaping into a runtime-neutral shared module.
- Document the exact external Supabase deployment steps that remain outside local execution authority.

### Acceptance Criteria

- `npm test`, `npm run lint`, `npm run build`, and `npm run build:server` pass.
- `tsconfig.json` enables `strict` and does not suppress repository-owned errors with new `any` types.
- Production bundles no longer contain the `gray-matter` eval warning.
- Express and EdgeOne news handlers import the same shared transformation helpers.
- Automated tests cover frontmatter parsing, news normalization, Markdown sanitization, and admin-role authorization.
- No external Supabase project is mutated without an authenticated project link and explicit deployment authority.

### Non-goals

- Replacing the upstream AI news service.
- Building scheduled ingestion or a new database schema.
- Adding a second test framework or browser-test dependency.

---

## Phase 3: Work and Blog Visual Hierarchy

Date: 2026-07-15

### Goal

Turn Work into a credible product portfolio and Blog into a clear editorial
homepage while preserving TemporalSync's existing visual language.

### In Scope

- Move the theme control into desktop and mobile navigation.
- Add page-level heroes and semantic headings to Work and Blog.
- Replace abstract Work previews with representative product UI captures.
- Present the latest blog post as a featured article and retain a secondary grid.
- Normalize cover treatments, typography, spacing, focus states, and reduced motion.
- Keep every existing route, article, search behavior, and language mode working.

### Acceptance Criteria

- No fixed control overlaps Work CTAs, Blog metadata, or article content at 390px.
- Work and Blog list pages each expose one clear `h1` and supporting description.
- Work projects use real product UI captures and truthful capability copy.
- Blog cards are semantic links, the latest post is visually featured, and search
  still filters title, summary, body, and tags.
- Desktop 1440x900 and mobile 390x844 screenshots show no clipping, overlap, or
  unreadable text.
- `npm test`, `npm run lint`, `npm run build`, and `npm run build:server` pass.
