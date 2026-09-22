# MR Command Center

MR Command Center is a static, browser-local MRI learning hub for trained professionals. It combines safety foundations, scan math, parameter tradeoff modeling, sequence rescue, artifact reasoning, thermal/RF concepts, short practice drills, and a module-specific visual learning system.

## Current build
v4.5 — Module Art Direction

## Production
- Entry point: `index.html`
- Static PWA manifest: `manifest.webmanifest`
- Offline worker: `sw.js`
- Production deploy: Vercel from `main`
- Release guard: `node scripts/validate.mjs`

## Product principles
- Educational learning support, not patient-specific clearance or protocol prescription.
- Manufacturer labeling, scanner IFU/limits, authoritative MR safety guidance, and local policy take precedence.
- Presets, comparison history, display preferences, pins, study markers, and Micro-Lab practice history remain browser-local unless the user explicitly exports data.
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
