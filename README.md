# MR Command Center

MR Command Center is a static, browser-local MRI learning hub for trained professionals. It combines safety foundations, scan math, parameter tradeoff modeling, sequence rescue, artifact reasoning, thermal/RF concepts, short practice drills, module-specific visual identity, a connected local learning path, and guided browser-local study sessions, a rotating daily focus, a local seven-day return loop, importable Case Lab packs, portable study activity reports, a browser-local Publisher Studio for authoring case-pack products, a Product Kit for generating storefront metadata, listing copy, and catalog manifests, and a buyer-side Pack Library with progress, resume points, pack routes, and file-based updates.

## Current build
v5.2 — Pack Library

## Production
- Entry point: `index.html`
- Static PWA manifest: `manifest.webmanifest`
- Offline worker: `sw.js`
- Production deploy: Vercel from `main`
- Release guard: `node scripts/validate.mjs`

## Product principles
- Educational learning support, not patient-specific clearance or protocol prescription.
- Manufacturer labeling, scanner IFU/limits, authoritative MR safety guidance, and local policy take precedence.
- Presets, comparison history, display preferences, pins, study markers, Micro-Lab practice history, and recent study-session history, daily-focus completion, active-day history, imported case packs, Case Lab completion history, Publisher Studio drafts and product metadata, Pack Library resume state, and study-report data remain browser-local unless the user explicitly exports data.
- Unknown or incomplete device conditions are never treated as cleared by the application.

## Release workflow
MR Command Center uses one consolidated production commit per batch whenever practical. A release commit should include the application change, validator updates, and service-worker cache bump together so one product batch produces one deployment.

Before moving `main`, validate:
1. JavaScript parses.
2. HTML ends with exactly one `</html>`.
3. Inline handlers reference defined functions.
4. Required learning modules and IDs remain present.
5. Removed legacy product surfaces do not return.
6. The service-worker cache marker matches the release.

## Architecture
The application is intentionally dependency-light: static HTML/CSS/JavaScript with browser-local storage and no patient-data backend.

## Monetization direction
Core safety foundations remain free. The v5.2 Pack Library completes the static digital-product loop: Publisher Studio creates packs, Product Kit creates storefront assets, and buyers can install delivered pack files into a persistent local library with completion progress, resume points, and compatible file updates. The manifest deliberately records commerce as not connected; the static app does not simulate payment, purchase verification, licensing, or entitlement. Installed content is not proof of ownership. Planned paid differentiation should center on deeper case/practice packs, advanced session libraries, larger reusable workspaces, branded study summaries, and department-managed training features. Paid plans are not active in the current static build.
