# P0/P1 Hardening Technical Specification

## Security

### URL proxy removal

`/api/link-metadata` is unused by the frontend and will be removed. News avatar URLs are already generated from `https://unavatar.io`; clients will load those URLs directly, allowing `/api/avatar` to be removed from both the Express server and EdgeOne function.

### Markdown sanitization

All output passed to `dangerouslySetInnerHTML` must be sanitized. `Md2Red` will reuse the installed `dompurify` dependency. Markdown rendering failures will return escaped or empty content, never raw HTML.

### Admin authorization

The UI gate will accept only users whose Supabase JWT user object contains `app_metadata.role === "admin"`. A SQL migration will enable RLS on `public.blogs`, permit public reads, and restrict insert, update, and delete to the same JWT claim.

## Navigation

Desktop navigation retains the current structure. Below the `md` breakpoint, the header shows the brand, language control, and a menu button. The menu includes About, Hot, Work, both formatter routes, Blog, and Settings. It closes on navigation and Escape and exposes `aria-expanded` and `aria-controls`.

## Home Page

The existing hero, typography, and background remain the visual source of truth. A primary AI Signals CTA and secondary Tools CTA are added beneath the description. Decorative focus badges are reduced to useful route links.

## News Loading

The application-level prefetch component is removed. `HotTopics` remains the sole owner of news loading. Production deep enrichment is disabled in the request path until a scheduled ingestion system exists.

## Recovery

A route-level not-found page provides links to the home page and tools. A small React error boundary catches lazy-chunk and render errors and provides a reload action.

## Verification

- `npm run lint`
- `npm run build`
- `npm run build:server`
- Static search confirming removed proxy routes
- Representative Markdown sanitization check
- Desktop and 375px screenshots of home, navigation, and hot topics

---

## Phase 2 Engineering Specification

### Test baseline

Use Node's built-in test runner through the existing `tsx` dependency. Tests live in `tests/` and target extracted pure functions, avoiding a new framework and DOM emulation dependency.

### Strict TypeScript

Enable `strict`, `noUncheckedIndexedAccess`, and `exactOptionalPropertyTypes` only when the current repository passes them. If the latter two produce disproportionate migration churn, retain `strict` as the required boundary and record the deferred flag explicitly rather than weakening types with `any`.

### Frontmatter

Replace `gray-matter` with a local parser supporting the repository's actual contract: optional leading `---` fences, scalar strings, booleans, numbers, quoted strings, and bracket arrays. Malformed or unsupported metadata fails closed to string values while preserving the Markdown body.

### Shared news core

Move runtime-neutral types and helpers into `shared/ai-news.ts`. Network adapters remain in Express and EdgeOne because their request/response environments differ. Both adapters share item normalization, fallback classification, avatar selection, and response shaping. Disabled request-time scraping and model enrichment are removed instead of retained as unreachable code.

### External Supabase state

The repository provides a versioned SQL migration and deployment checklist. Applying it requires an authenticated Supabase CLI/project link or equivalent administrator access; local verification must not read credential files or guess the production project.

---

## Phase 3: Work and Blog UI Implementation

### Navigation control placement

Render the existing theme state as a compact icon button inside Navbar controls.
Desktop places it beside language and settings; mobile places it inside the menu
to avoid crowding the 390px header. Remove the fixed page-level control.

### Page hierarchy

Work and Blog reuse the existing `immersive-section`, typography, color tokens,
and motion library. Each list route gets a compact hero containing an eyebrow,
`h1`, description, and truthful count/status metadata.

### Work media

Store representative application captures in `public/assets/work/`. Captures are
decorative portfolio media with concise alt text; product names and actions remain
real text outside the image. The infrastructure card links to `/hot` and describes
the current RSS normalization pipeline without claiming removed scraping or model
enrichment.

### Blog hierarchy and accessibility

The newest filtered post renders as a featured semantic `Link`; remaining posts
use semantic card links. Search keeps its existing client-side behavior and adds a
visible result count plus a query-specific empty state. Titles may occupy two lines.

### Responsive and motion behavior

Interactive targets are at least 44px high. Decorative motion is disabled through
`motion-reduce` variants and `prefers-reduced-motion`-aware Motion configuration.
Mobile layouts stack media before content without fixed overlays.
