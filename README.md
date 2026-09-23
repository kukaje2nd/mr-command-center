# MR Command Center

MR Command Center is a static, browser-local MRI parameter reasoning workspace for trained professionals. The product opens directly into the Parameter Workspace: a relative educational model for changing parameter stacks, inspecting tradeoffs, comparing A/B states, saving reusable generic setups, and working through common constraints such as scan burden, SNR, spatial detail, and distortion sensitivity.

## Current build
v7.2 — Labs Home + Polish

## Production
- Entry point: `index.html`
- Static PWA manifest: `manifest.webmanifest`
- Offline worker: `sw.js`
- Production deploy: Vercel from `main`
- Release guard: `node scripts/validate.mjs`

## Product architecture
The primary interface has five destinations:

1. **Home** — a Labs-first launcher showing current local lab state and available labs.
2. **Labs** — interactive MRI reasoning tools. Parameter Lab remains the flagship; Contrast Lab is the second reusable lab.
3. **Compare** — Snapshot A vs live B experiments and saved comparison history.
4. **Reference** — Parameter Reference plus supporting Scan Math, troubleshooting, and artifact tools.
5. **Safety** — MR safety evidence-chain reference, with RF / thermal details inside the safety context.

Constraint challenges live inside Parameter Lab rather than occupying a global navigation slot.

The legacy course-style homepage, learning-path/review UI, Pack Library, Case Lab, Study Report, Publisher Studio, creator/commercial surfaces, and Micro-Lab are retired from the normal user interface. Existing browser-local data structures may remain for backward compatibility until a later cleanup release.

## Product principles
- Interactive MRI reasoning labs are the product; reference material supports the labs rather than competing with them.
- Parameter Lab remains the flagship tradeoff workspace; Contrast Lab adds a simplified synthetic relaxation experiment for TR, TE, and TI.
- The root route opens a Labs-first home screen rather than a curriculum or generic dashboard.
- A/B comparison, presets, local continuity, and constraint challenges are designed for repeat use.
- Home previews the current browser-local state of Parameter Lab and Contrast Lab so users can resume without rebuilding experiments.
- Goal tracking reports relative model movement and tradeoffs, not protocol recommendations or diagnostic adequacy.
- Constraint challenges use generic starting stacks and relative model guardrails; satisfying a challenge is not protocol validation.
- Parameter Reference is indexed and contextual; Scan Math, Rescue, Artifact, and Safety are supporting tools.
- Educational support only: no patient-specific clearance, protocol prescription, or scanner-specific recommendation.
- Manufacturer labeling, scanner IFU/limits, authoritative MR safety guidance, and local policy take precedence.
- Unknown or incomplete device conditions are never treated as cleared.
- The live Parameter Workspace, presets, snapshots, comparison history, and display preferences stay browser-local unless explicitly exported.

## Architecture
The application is intentionally dependency-light: static HTML/CSS/JavaScript with browser-local storage and no patient-data backend.

## Release workflow
Each release updates the application, validator, and service-worker cache marker together. Before moving `main`, validate JavaScript parsing, required workspace IDs, retired-surface guards, and the release cache marker.

## Product direction
Future product work should deepen and polish the Labs model rather than restore broad course navigation. New labs should pass a strict interaction test: the user changes something, immediately sees a modeled consequence, and can explain the tradeoff. Parameter Lab and Contrast Lab establish that pattern; likely future candidates include K-Space, Artifact, Sequence Timing, and RF/SAR teaching labs.
