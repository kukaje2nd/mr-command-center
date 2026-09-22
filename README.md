# MR Command Center

MR Command Center is a static, browser-local MRI parameter reasoning workspace for trained professionals. Its recurring core is the Parameter Lab: a relative educational model for changing parameter stacks, inspecting tradeoffs, saving reusable generic setups, comparing A/B states, and approaching common constraints such as scan burden, SNR, spatial detail, and distortion sensitivity.

Safety foundations, scan math, sequence rescue, artifact reasoning, thermal/RF concepts, short drills, Case Lab packs, and publishing tools remain available as reference, onboarding, practice, or creator layers rather than equal-weight daily destinations.

## Current build
v6.0 — Lab Continuity

## Production
- Entry point: `index.html`
- Static PWA manifest: `manifest.webmanifest`
- Offline worker: `sw.js`
- Production deploy: Vercel from `main`
- Release guard: `node scripts/validate.mjs`

## Product principles
- The Parameter Lab is the primary recurring workspace; reference material supports it rather than competing with it.
- Goal tracking reports relative model movement and tradeoffs, not protocol recommendations or diagnostic adequacy.
- Constraint challenges use generic starting stacks and relative model guardrails for repeatable practice; satisfying a challenge is not protocol validation.
- Dense reference material is presented as indexed, scan-friendly reference UI rather than undifferentiated reading blocks.
- Home, reusable Parameter Lab tools, and secondary workspaces share a consistent hierarchy so the recurring workbench remains visually dominant.
- Focus navigation is workspace-oriented rather than course-oriented: the Lab stays primary, references expose related tools, and linear previous/next completion controls are not part of the main flow.
- The live Parameter Lab stack auto-saves browser-locally and restores on return, including active goal/challenge context when available.
- Educational learning support, not patient-specific clearance or protocol prescription.
- Manufacturer labeling, scanner IFU/limits, authoritative MR safety guidance, and local policy take precedence.
- Parameter presets, snapshots, comparison history, display preferences, pins, practice history, imported case packs, Case Lab completion history, Publisher Studio drafts/product metadata, Pack Library resume state, and study-report data remain browser-local unless the user explicitly exports data.
- Unknown or incomplete device conditions are never treated as cleared by the application.
- Engagement mechanics such as daily streaks or required study-session loops are not part of the primary product experience.

## Release workflow
MR Command Center uses one consolidated production commit per batch whenever practical. A release commit should include the application change, validator updates, and service-worker cache bump together so one product batch produces one deployment.

Before moving `main`, validate:
1. JavaScript parses.
2. HTML ends with exactly one `</html>`.
3. Inline handlers reference defined functions.
4. Required Parameter Lab, reference, pack, and creator IDs remain present.
5. Removed legacy/engagement surfaces do not return.
6. The service-worker cache marker matches the release.

## Architecture
The application is intentionally dependency-light: static HTML/CSS/JavaScript with browser-local storage and no patient-data backend.

## Product direction
The strongest reusable value is parameter reasoning, not course completion. Home therefore centers on opening the Lab, selecting an optimization goal, reopening saved parameter stacks, and comparing A/B states. Goal mode tracks relative movement against a user-selected teaching target for sampling burden, SNR, or spatial detail and surfaces the largest modeled opposing tradeoff. Distortion remains directional-only because MRCC does not claim a universal distortion equation. Constraint Challenges add repeatable multi-lever exercises with generic starting stacks and simultaneous relative guardrails, evaluated against each challenge's own reference state. The Parameter Reference is organized as an indexed reference desk, and Safety, Scan Math, Rescue, Artifact, RF, and Micro-Lab use a shared presentation system for faster scanning. Home, constraint challenges, presets, comparisons, histories, and the Reference/Practice/Creator zones use the same workbench-oriented visual language. Focused tools use a workspace context bar and contextual footer navigation instead of a linear course sequence. The live Parameter Lab workspace now persists locally between visits, with explicit current-state status, one-click Snapshot A capture, and quick preset saving. Scan Math, Sequence Rescue, Artifact Solver, safety foundations, and RF material are supporting references. Case packs should increasingly become reusable parameter challenges and scenarios rather than primarily reading exercises.

## Monetization direction
Core safety foundations and the essential Parameter Lab remain free. Paid differentiation should center on deeper parameter challenge packs, advanced scenario collections, larger reusable preset/comparison libraries, exportable comparison reports, and department-managed learning content after appropriate backend, authentication, and privacy work. Publisher Studio and Product Kit continue to create digital-product handoff assets; commerce itself is not connected in the static app.
