# AAW Speed Optimize — Core Web Vitals tracking (Shopify app)

This is a real, runnable Shopify app skeleton — one feature implemented
end-to-end: **real-user Core Web Vitals tracking**, scored the way Google
actually scores them (75th percentile of real visitor sessions).

It will NOT run inside this sandbox — Shopify's CLI needs to reach your
Partner account and a live tunnel URL, which this environment can't reach.
Run it on your own machine.

## What's included

- `app/routes/api.vitals.jsx` — public endpoint the storefront beacon posts to
- `extensions/web-vitals-beacon/` — a theme app extension (app embed) that
  loads Google's `web-vitals` library on every storefront page and reports
  LCP, INP, and CLS for real visitors
- `app/routes/app.vitals.jsx` — the admin dashboard page, showing p75 scores
  with the same good/needs-improvement/poor thresholds as PageSpeed Insights
- `prisma/schema.prisma` — `VitalSample` table storing every beacon hit

## What's NOT included yet (next steps once this is running)

- The other dashboard panels (JS/CSS optimization, image optimization, theme
  cleanup, app management) — those need theme Asset API read/write logic,
  which is a separate, larger piece of work
- Billing / subscription setup
- Production database (this uses SQLite for local dev — swap the
  `datasource` in `prisma/schema.prisma` for Postgres before deploying)

## Setup

### 1. Install the Shopify CLI (if you haven't)

```bash
npm install -g @shopify/cli@latest
```

### 2. Install dependencies

```bash
cd velocity-app
npm install
```

### 3. Link to your app in the Partner dashboard

```bash
npm run config:link
```

This walks you through selecting (or creating) the app in your Partner
account and writes the real `client_id` into `shopify.app.toml`, replacing
the placeholder.

### 4. Start the dev server

```bash
npm run dev
```

This opens a Cloudflare tunnel, starts Remix, and gives you a URL to
install the app on your dev store. Follow the prompt — it opens your
browser and walks through OAuth automatically.

### 5. One manual step: point the beacon at your real ingest URL

The beacon script (`extensions/web-vitals-beacon/assets/velocity-vitals.js`)
has a placeholder:

```js
var ingestUrl = configuredIngestUrl || "__VELOCITY_INGEST_URL__/api/vitals";
```

Replace `__VELOCITY_INGEST_URL__` with the tunnel URL `shopify app dev`
printed in your terminal (e.g. `https://abcd-1234.trycloudflare.com`), so
the line reads:

```js
var ingestUrl = configuredIngestUrl || "https://abcd-1234.trycloudflare.com/api/vitals";
```

Note this URL changes every time you restart `shopify app dev` on the free
tunnel — that's fine for testing, but means production needs a permanent
domain (see Deploying, below).

### 6. Turn on the beacon on your dev store

In your dev store admin: **Online Store > Themes > Customize > App
embeds**, find "Velocity vitals beacon," and toggle it on.

### 7. Generate traffic, then check the dashboard

Visit a few storefront pages as a real shopper (not inside the theme
editor — the editor doesn't run page scripts the same way). Then open the
app in Shopify admin and click "Core Web Vitals" in the nav. Scores need a
handful of real page loads before percentiles are meaningful — the page
will tell you if there's no data yet.

## Deploying for real

1. Push the theme extension: `npm run deploy`
2. Move off SQLite — change `prisma/schema.prisma`'s datasource to
   `postgresql` and point it at a real database (Railway, Supabase, Fly.io
   Postgres, etc. all work)
3. Host the Remix server somewhere with a stable URL (Fly.io and Render
   both have Shopify-app-friendly docs) and update `application_url` and
   `redirect_urls` in `shopify.app.toml` to that permanent domain
4. Once you have a stable domain, hardcode it into the beacon JS instead of
   the placeholder, so it never depends on a dev tunnel
