# API Contract

## `GET /api/ai-news`

Returns a JSON array of news items.

```ts
interface NewsItem {
  title: string;
  source: string;
  link: string;
  time: string;
  category: string;
  summary: string;
  image?: string;
  tags?: string[];
  recommendedReason?: string;
  avatar?: string;
}
```

Behavior:

- The upstream feed is fetched only when a client requests this endpoint.
- Responses may be cached by the deployment platform.
- `avatar`, when present, is an HTTPS URL generated for `unavatar.io`; it is not proxied by TemporalSync.
- Upstream or parsing failures return `500` with `{ "error": "Failed to fetch news" }`.

## Removed endpoints

The following endpoints are intentionally removed because they accepted caller-controlled remote URLs and were not required by the product:

- `GET /api/link-metadata`
- `GET /api/avatar`

Clients must not depend on either endpoint.

## Blog authorization contract

- Blog reads are public.
- Blog insert, update, and delete operations require an authenticated Supabase JWT containing:

```json
{
  "app_metadata": {
    "role": "admin"
  }
}
```

- The browser gate improves UX but is not the security boundary. Supabase RLS is the enforcement boundary.
