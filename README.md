# MR Command Center

MR Command Center is a static, browser-local collection of interactive MRI reasoning labs for trained professionals. The Labs-first home launches Parameter, Contrast, Sequence Timing, Motion, K-Space, and Artifact experiments, with comparisons, contextual references, and safety material supporting the interactive work.

## Current build
v10.1 — Interface Refinement

## Production
- Entry point: `index.html`
- Static PWA manifest: `manifest.webmanifest`
- Offline worker: `sw.js`
- Production deploy: Vercel from `main`
- Release guard: `node scripts/validate.mjs`

## Product architecture
The primary interface has five destinations:

1. **Home** — a Labs-first launcher showing current local lab state and available labs.
2. **Labs** — interactive MRI reasoning tools. Parameter Lab, Contrast Lab, Sequence Timing Lab, Motion Lab, K-Space Lab, and Artifact Lab are active reusable labs.
3. **Compare** — Snapshot A vs live B experiments and saved comparison history.
4. **Reference** — Parameter Reference plus supporting Scan Math, troubleshooting, and artifact tools.
5. **Safety** — MR safety evidence-chain reference, with RF / thermal details inside the safety context.

Constraint challenges live inside Parameter Lab rather than occupying a global navigation slot.

The legacy course-style homepage, learning-path/review UI, Pack Library, Case Lab, Study Report, Publisher Studio, creator/commercial surfaces, and Micro-Lab are retired from the normal user interface. Existing browser-local data structures may remain for backward compatibility until a later cleanup release.

## Product principles
- Interactive MRI reasoning labs are the product; reference material supports the labs rather than competing with them.
- Parameter Lab remains the flagship tradeoff workspace; Contrast Lab adds a simplified synthetic relaxation experiment for TR, TE, and TI.
- Sequence Timing Lab models a deliberately simplified echo train: TR, first echo, constant echo spacing, echo-train length, abstract center-echo assignment, phase encodes, and averages. Its outputs are educational timing relationships rather than scanner-feasibility or protocol recommendations.
- Motion Lab applies idealized rigid translation to individual synthetic phase-encoding lines using the Fourier shift theorem, then reconstructs the inconsistent dataset so users can compare motion timing and line-order effects.
- K-Space Lab uses a browser-computed 32 × 32 synthetic phantom, discrete Fourier transform, coefficient masks, and inverse transform to teach center/periphery, truncation, and uniform phase undersampling.
- Artifact Lab applies deliberately stylized artifact patterns to a synthetic 2D phantom while preserving the existing cause / first-move / tradeoff troubleshooting reference.
- The root route opens a Labs-first home screen rather than a curriculum or generic dashboard.
- A/B comparison, presets, local continuity, and constraint challenges are designed for repeat use.
- Home previews the current browser-local state of all five active Labs so users can resume without rebuilding experiments.
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
Future product work should deepen and polish the Labs model rather than restore broad course navigation. New labs should pass a strict interaction test: the user changes something, immediately sees a modeled consequence, and can explain the tradeoff. Parameter Lab, Contrast Lab, Sequence Timing Lab, Motion Lab, K-Space Lab, and Artifact Lab establish that pattern; likely future candidates include RF/SAR teaching labs.

### v10.1 release notes
- Added **Edon Kukaj** to the MR Command Center brand lockup and page author metadata.
- Reorganized the sticky header into brand identity, workspace actions, and system-status groups for clearer visual hierarchy.
- Added refined glass/surface tokens and more consistent depth across navigation, cards, notices, and system surfaces.
- Added stronger hover and keyboard-focus feedback to Lab cards and primary navigation without changing application behavior.
- Added a slim active-route indicator to the desktop workspace rail.
- Reworked the six-Lab switcher on mobile into a horizontally scrollable, snap-aligned control so it no longer consumes multiple vertical rows.
- Tightened responsive header behavior across desktop, tablet, and phone widths.
- Added subtle input/button transitions while preserving the existing reduced-motion preference behavior.
- MRI teaching models and calculations are unchanged.

### v10.0 release notes
- Added Motion Lab as the sixth active reusable Lab.
- Added a line-by-line synthetic acquisition model that applies translation-dependent Fourier phase before inverse reconstruction.
- Added motion patterns for no-motion reference, single shift, periodic translation, and slow drift.
- Added controls for translation direction, peak displacement, onset timing, periodic cycles, and linear versus centric phase-line ordering.
- Added an acquisition-history plot showing displacement by acquired phase line and when the synthetic k-space center is sampled.
- Added side-by-side stationary and motion-corrupted reconstructions from the same 32 × 32 teaching phantom.
- Added readouts for affected lines, peak translation, center-line shift, and the dominant qualitative teaching cue.
- Persisted Motion Lab state locally and integrated it with Home previews, last-Lab resume, deep links, mobile navigation, Quick Console, pinning, self-check, and every Lab switcher.
- Upgraded workspace backup schema to v3 with Motion Lab state as the 12th active key; schema-1 and schema-2 backups remain importable.
- Added a sixth PWA Lab shortcut and updated the service-worker release marker to v10.0.0.
- Motion Lab deliberately omits rotation, deformation, through-plane motion, coil sensitivity, signal evolution, gradients, gating, navigator methods, motion correction, parallel imaging, noise, and vendor reconstruction.

### v9.0 release notes
- Added Sequence Timing Lab as the fifth active reusable Lab.
- Added interactive controls for TR, first echo, constant echo spacing, echo-train length, abstract center-echo assignment, phase encodes, and averages.
- Added a visual echo-train timeline with a highlighted center echo, TR marker, train span, and toy timing-fit cue.
- Added derived educational outputs for effective-TE-like timing, train span, repetition-window count, and a simplified acquisition-time proxy.
- Added four timing teaching presets: single echo, short train, long train, and later-center assignment.
- Persisted Sequence Timing state locally and integrated it with Home previews, last-Lab resume, deep links, Quick Console, self-check, and all Lab switchers.
- Expanded workspace backup schema to v2 with backward-compatible import of v8 schema-1 files; v9 backups now include Sequence Timing state as an 11th active workspace key.
- Added a fifth PWA Lab shortcut and updated the service-worker release marker to v9.0.0.
- The Timing Lab explicitly omits scanner limits, SAR / RF power, gradient constraints, slice packages, preparation pulses, parallel imaging, partial Fourier, 3D encoding, and vendor-specific timing.

### v8.0 release notes
- Added versioned active-workspace JSON backup/export for browser-local MRCC data.
- Added staged import with format/schema validation, a 1 MB file limit, allowlisted active keys, and per-feature normalization before restore.
- Backup scope is intentionally limited to the current product: four Lab states, Parameter presets/snapshot/comparisons, display preferences, pins, and last-Lab continuity.
- Retired course, case-pack, publisher, and historical learning keys are not exported or overwritten by v8 workspace restore.
- Added non-sensitive workspace diagnostics for support; diagnostics report counts/status only and exclude Lab values and user-entered labels.
- Added Export, Import, and Diagnostics actions to both Settings and the Quick Console.
- Extended in-app self-check coverage to the portability/recovery layer.

### v7.8 release notes
- Added a persistent “resume last lab” flow across the Home hero and Labs navigation.
- Added stable deep links for A/B Compare, Constraint Challenges, Parameter Reference, and Presets.
- Updated back/forward and direct-hash restoration so workspace subviews reopen in the intended place.
- Fixed the K-Space Lab switcher so all four active Labs are available consistently.
- Routed Parameter workspace shortcuts through the new deep-link navigation without changing model behavior.

### v7.7 release notes
- Added canonical/social metadata and installed-PWA shortcuts for the four active labs.
- Updated the Labs home graphic and card labels so all four active labs are represented without temporary “new” badges.
- Improved keyboard focus coverage and native reduced-motion behavior, and removed a duplicate shortcut listing.
- Reduced unnecessary clock repaint frequency without changing workspace behavior.
- Hardened service-worker navigation handling with navigation preload and background cache refresh.
