# Verification — October 2, 2026

## Automated checks

`npm run check` passed:

- All 39 published routes return HTTP 200.
- All 479 mirrored resources exist and contain data; the download manifest reports zero failures.
- 403 JavaScript module import references resolve to local files.
- CMS requests correctly return concatenated byte ranges without modifying binary offsets.
- Video byte-range requests return HTTP 206 with the expected body length.
- Invalid CMS ranges return HTTP 416; unknown routes return HTTP 404.

## Browser checks

- Compared the homepage at 1440 × 1000 and 390 × 844 against the live source in the same browser viewport. All four hero headings match exactly in text, font, font size, line height, x/y position, width, and height.
- Visually checked the animated grid, video, logo, buttons, spacing, and mobile wrapping against the source. Video frames and animation timing naturally vary between visits.
- Confirmed the hero video plays from a local file.
- Opened the mobile navigation and verified its seven destination links; navigated through it to Design News.
- Navigated from the homepage to Contact, verified the form controls, and left the form unsubmitted.
- Opened the Smash Guys case study and followed its Work breadcrumb to the local work listing.
- Opened the Product & UI/UX Design service detail page.
- Opened the sensory branding news article and verified its loaded article content.
- Expanded the Define process step and confirmed `aria-expanded="true"`.
- The final browser verification session reported no JavaScript errors.

## Scope

This preserves the published site's content and behavior, including existing placeholder content and links. The desktop hamburger did not expand at 1440px on either the reference or the copy during testing; the mobile menu worked on both. Form submission delivery through Framer is not verified from the local hostname. Visual inspection sampled the principal page types; the automated route and resource checks cover all published pages.
