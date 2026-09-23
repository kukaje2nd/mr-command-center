# MR Command Center

MR Command Center is a static, browser-local collection of interactive MRI reasoning labs for trained professionals. The Labs-first home launches Parameter, Contrast, and K-Space experiments, with comparisons, contextual references, and safety material supporting the interactive work.

## Current build
v7.6 — Artifact Lab

## Production
- Entry point: `index.html`
- Static PWA manifest: `manifest.webmanifest`
- Offline worker: `sw.js`
- Production deploy: Vercel from `main`
- Release guard: `node scripts/validate.mjs`

## Product architecture
The primary interface has five destinations:

1. **Home** — a Labs-first launcher showing current local lab state and available labs.
2. **Labs** — interactive MRI reasoning tools. Parameter Lab, Contrast Lab, K-Space Lab, and Artifact Lab are active reusable labs.
3. **Compare** — Snapshot A vs live B experiments and saved comparison history.
4. **Reference** — Parameter Reference plus supporting Scan Math, troubleshooting, and artifact tools.
5. **Safety** — MR safety evidence-chain reference, with RF / thermal details inside the safety context.

Constraint challenges live inside Parameter Lab rather than occupying a global navigation slot.

The legacy course-style homepage, learning-path/review UI, Pack Library, Case Lab, Study Report, Publisher Studio, creator/commercial surfaces, and Micro-Lab are retired from the normal user interface. Existing browser-local data structures may remain for backward compatibility until a later cleanup release.

## Product principles
- Interactive MRI reasoning labs are the product; reference material supports the labs rather than competing with them.
- Parameter Lab remains the flagship tradeoff workspace; Contrast Lab adds a simplified synthetic relaxation experiment for TR, TE, and TI.
- K-Space Lab uses a browser-computed 32 × 32 synthetic phantom, discrete Fourier transform, coefficient masks, and inverse transform to teach center/periphery, truncation, and uniform phase undersampling.
- Artifact Lab applies deliberately stylized artifact patterns to a synthetic 2D phantom while preserving the existing cause / first-move / tradeoff troubleshooting reference.
- The root route opens a Labs-first home screen rather than a curriculum or generic dashboard.
- A/B comparison, presets, local continuity, and constraint challenges are designed for repeat use.
- Home previews the current browser-local state of Parameter Lab, Contrast Lab, and K-Space Lab so users can resume without rebuilding experiments.
- Lab restoration is ordered after each lab engine initializes; mobile active states and the built-in self-check use the current Home/Labs navigation contract.
- Retired course, study-session, pack, creator, engagement, and dashboard renderers remain available only for backward compatibility; they are no longer executed by the normal boot or navigation path.
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
Each release updates the application, validator, and service-worker cache marker together. Before moving `main`, validate JavaScript parsing, required workspace IDs, lab initialization order, navigation-state contracts, the Labs-only runtime path, retired-surface guards, and the release cache marker.

## Product direction
Future product work should deepen and polish the Labs model rather than restore broad course navigation. New labs should pass a strict interaction test: the user changes something, immediately sees a modeled consequence, and can explain the tradeoff. Parameter Lab, Contrast Lab, K-Space Lab, and Artifact Lab establish that pattern; likely future candidates include Sequence Timing, Motion, and RF/SAR teaching labs.
