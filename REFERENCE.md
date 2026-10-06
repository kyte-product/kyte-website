# Codex Kyte Website

A local copy of <https://kytenewwebsite.framer.website/>, captured October 2, 2026. Includes all 39 published pages: home, work, services, contact, careers, about, product home, service details, case studies, and news articles.

## Run

Requires Node.js 18 or newer. No package installation is needed.

```sh
cd "Codex Kyte Website"
npm start
```

Open <http://localhost:4173>. Set `PORT` to choose another port. The server binds to your computer's loopback interface by default.

```sh
npm run check
```

Run the check while the preview server is running. It verifies all pages and asset files, module dependencies, CMS byte ranges, and video range requests.

## What is included

- Original published HTML, CSS, fonts, imagery, videos, and JavaScript, preserving the original responsive layouts and animated components.
- Local runtime dependencies and CMS collection files.
- Original internal routes and client-side navigation.
- A dependency-free Node server that supports clean page URLs, video seeking, and Framer's CMS range protocol.
- `mirror-manifest.json`, listing every source URL and its local file.
- `scripts/mirror.py`, the reproducible download and adaptation script. It requires Python 3, curl, and internet access. Downloaded originals are cached in `.cache/`.

## Editing and hosting

`public/` contains the website. For example, `public/index.html` is the homepage, `public/contact/index.html` is the contact page, and `public/assets/` contains the downloaded assets and runtime.

This is a faithful copy of the **published Framer output**, including compiled JavaScript. It is not the original Framer editor project or a newly authored React component library. For content edits, take care to update both the initial HTML and the corresponding runtime/CMS content; hydration can replace HTML-only edits.

Use the included Node server when hosting: the CMS uses `?range=` requests that a generic static server will not implement. Regenerating with `scripts/mirror.py` overwrites mirrored files, so save manual changes separately first.

## External behavior

Contact forms retain the original Framer integration and require its external service; delivery from a different hostname has not been verified. No test inquiries were submitted. External social, email, telephone, and AI links retain their original destinations, including placeholder contact details already present in the reference.

The visible Framer attribution is preserved for visual fidelity. The standalone Framer analytics script is omitted. This copy does not include the Framer editor, account access, or a replacement form backend.
