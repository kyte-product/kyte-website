# Kyte website: original Framer components

The default preview now uses the actual published Framer components and their original layouts, typography, assets and animation runtime. The independently styled rebuild is kept as a backup and is no longer the default.

## Run

```sh
npm run dev
```

Open http://localhost:4173/services. Requires Node20+, with no npm dependencies.

```sh
npm run build
npm run check
npm test
CHECK_ORIGIN=http://localhost:4173 npm run check
```

## Where changes live

- `public/`: untouched original captured website.
- `framer-site/`: generated working version, copied from the original with targeted repairs.
- `scripts/build-framer.mjs`: original-component build, metadata and exact contact-text corrections.
- `framer-fixes/enhancements.js`: content, links, semantic controls and form integration around the existing components.
- `framer-fixes/repairs.css`: narrowly scoped mobile/functional fixes. No replacement design system.
- `server-framer.mjs`: current server, with Framer CMS range requests, video seeking, redirects and inquiry API.
- `content/`: editable metadata, verified content and inquiry details reused by the correction layer.

Changes are generated. Edit the build or repair files, then rebuild. The new layer waits for Framer rendering and applies idempotent corrections when navigating between pages. It reuses published compiled components, not the original Framer editor source. Keep browser regression checks when updating the captured Framer version.

## Preserved and corrected

All39 original page stylesheets are preserved. Navigation, hero typography, animated headings, service cards, footer, project templates and media remain the original Framer components.

Targeted changes include page metadata, corrected contact destinations, article/related-work paths, Product-first service ordering and distinct service summaries, removal of mixed-client/repeated Smash Guys content, mobile heading wrapping and a usable original contact dialog on mobile. The dialog gains a name, focus handling and a labeled keyboard-operable close control.

Form submissions are intercepted before the original Framer integration so duplicate field names do not lose the visitor's email/message. Delivery uses the existing validated HTTPS webhook adapter. Without `INQUIRY_WEBHOOK_URL`, an honest error and prefilled email fallback are shown. Actual inbox delivery remains unconfigured and unverified. No new production deployment or tracking-account changes were made in this correction pass.

Preview indexing remains disabled. The full launch dependencies in the audit still apply. This restoration does not claim a completed accessibility certification or new performance scores.

## Other versions

Untouched captured reference:

```sh
PORT=4175 npm run reference
```

Earlier independent redesign, kept for recovery/comparison:

```sh
npm run build:redesign
PORT=4176 npm run preview:redesign
```

The backup uses `src/`, `dist/`, `server.mjs` and `REDESIGN.md`. Its old release package is not the current Framer-preserving version and must not be mistaken for the default site.

See [Framer restoration verification](audit/FRAMER-RESTORATION.md).

## Vercel deployment

Import this repository as an Other framework project. `vercel.json` runs `npm run build:vercel`, which emits Vercel Build Output API v3 output. It includes the original site, versioned assets, CMS binary-range support and the inquiry endpoint. Use Node.js 22.

Keep `SITE_ENV` unset while reviewing the deployment to retain noindex. Before launching the final domain, set `SITE_URL` to its HTTPS origin and `SITE_ENV=production`. To enable form delivery, configure the server-only `INQUIRY_WEBHOOK_URL` and optional `INQUIRY_WEBHOOK_TOKEN`. Without them, visitors receive an honest email fallback.

Local preparation: `npm run build:vercel && npm run check && npm test`.
