# Kyte website

Editable implementation of the approved audit and Services plan. The original captured Framer website remains in `public/` for comparison. The updated site is generated into `dist/` and served by `server.mjs`.

## Preview

Requires Node.js 20 or newer. No npm dependencies or installation are required.

```sh
npm run dev
```

Open http://localhost:4173. Build again after editing content or templates. The server serves generated files; it does not have hot reload.

```sh
npm run build
npm run check
npm test
```

To test an already running server as well:

```sh
CHECK_URL=http://localhost:4173 npm run check
```

## Edit

| File | Purpose |
|---|---|
| `content/site.json` | Shared business details, 19 projects and eight articles |
| `content/services.json` | Four service pages, scope, process, proof and FAQs |
| `content/redirects.json` | Explicit legacy/repair redirects |
| `src/build.mjs` | Shared templates, page generation, metadata and structured data |
| `src/site.css` | Responsive design system and reduced-motion behavior |
| `src/site.js` | Navigation dialog, project filters and inquiry states |
| `src/inquiry.mjs` | Inquiry validation and delivery adapter |
| `server.mjs` | Routes, redirects, headers, static assets and inquiry endpoint |
| `audit/IMPLEMENTATION.md` | Completed work, verification and remaining launch dependencies |

`import-content.py` and `refine-content.py` were one-time migration tools. Do not rerun them over edited JSON unless you intentionally want to reimport the historical documents. `optimize-images.py` creates responsive WebP assets from preserved originals and requires Pillow. The generated assets are already included, so ordinary builds do not need Python.

## Forms

The public email is taken from the local Kyte documents: contact@kyte-agency.com. Unverified phone and street-address fields are omitted.

The form validates on both client and server, limits request size, includes a honeypot and basic in-process rate limiting, preserves user text on errors, and reports success only after the configured delivery service returns success. This is suitable as a small-site adapter; high-traffic or multi-instance deployment needs shared rate limiting and appropriate upstream spam protection.

Set `INQUIRY_WEBHOOK_URL` to the owner's HTTPS inbox/CRM endpoint, with optional server-only `INQUIRY_WEBHOOK_TOKEN`. The destination receives JSON with name, email, company, service and message. The app does not persist inquiry bodies or log them. Configure the receiving system's retention and access policies before public launch.

Without configuration the form returns an honest unavailable message and offers a prefilled email link. It never silently drops an inquiry or pretends it was delivered. No external delivery was tested in this implementation.

The browser dispatches `kyte:inquiry-success` only on confirmed success, with no personal-data payload. No analytics vendor is installed; connect the owner's approved analytics integration separately.

## Indexing and production

Preview builds have `noindex,follow` and the server sets an `X-Robots-Tag` header. The default canonical domain is `https://kyte-agency.com`; confirm before release.

```sh
SITE_ENV=production SITE_URL=https://kyte-agency.com npm run build
npm run check
npm run package
```

`npm run package` regenerates the disposable `release/` folder with only the site, runtime and referenced assets. It excludes the captured Framer runtime, local source documents and audit evidence. The current package is a **noindex preview**, not a deployed production release.

Deploy the `release/` folder to a Node-capable host behind HTTPS. Start it with `HOST=0.0.0.0 PORT=<host-port> npm start` and configure server-only delivery variables. Restart the server after changing build mode because it reads the build manifest at startup. Never expose a local preview to the network unintentionally.

Before production: confirm business/contact details; configure and test real inquiry delivery; approve client/editorial claims and asset/font use; review privacy text for the actual hosting/receiving services; verify final domain and old production redirects; connect the owner's Search Console/analytics; run the release checklist in `audit/IMPLEMENTATION.md`.

## Original reference

```sh
PORT=4175 npm run reference
```

This serves the preserved Framer capture. See `REFERENCE.md` and the original `VERIFICATION.md` for its limitations. `scripts/mirror.py` rewrites the capture, not the clean editable build; do not run it as part of normal development.
