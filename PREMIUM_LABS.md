# Premium Labs architecture

MR Command Center v11.0 introduces the Premium Labs product surface without enabling live charges yet.

## Product model

Two entitlement types are planned:

1. **Premium Membership** — recurring subscription that unlocks every Premium Lab while the membership is active.
2. **One-time Lab Unlock** — permanent entitlement to one selected Premium Lab.

Initial Premium Lab catalog:

- Diffusion & b-Value Lab — v11.1 includes a deliberately limited public teaser using one normalized mono-exponential model; the full premium workspace remains entitlement-gated.
- Parallel Imaging Lab — v11.2 includes a deliberately limited public teaser for acceleration, synthetic encoding diversity, sampling burden, and an invented g-like penalty; the full reconstruction-focused workspace remains entitlement-gated.
- RF Power Concepts Lab — v11.3 includes a deliberately limited public teaser with a normalized relative RF-activity sensitivity index; the full safety-bounded premium workspace remains entitlement-gated.
- Gradient Encoding Concepts Lab — v11.5 includes a deliberately limited public teaser using a dimensionless trapezoidal-lobe area model; the full premium workspace remains entitlement-gated.
- Off-Resonance & Phase Lab — v12.0 includes a deliberately limited public teaser for generic frequency-offset phase accrual; the full premium workspace remains entitlement-gated.

The free Lab catalog remains available independently of Premium access.

## Security rule

Premium access must never be enforced by a browser-local flag such as `localStorage.premium = true`.

The server is authoritative for identity and entitlements. The browser may cache display state, but access decisions must be confirmed server-side.

## Planned production flow

1. User signs in.
2. Client requests checkout for a server-known product key.
3. Server creates a Stripe Checkout Session.
4. Stripe sends a signed webhook after payment or subscription changes.
5. Webhook handler verifies the Stripe signature before changing access.
6. Entitlement store records access against the authenticated account.
7. Premium Lab requests verify entitlement server-side before premium content is delivered.

## Planned server contract

### `POST /api/billing/checkout`

Authenticated.

Input:

```json
{
  "productKey": "premium_membership",
  "purchaseMode": "subscription"
}
```

or:

```json
{
  "productKey": "premium_diffusion",
  "purchaseMode": "payment"
}
```

The server must map product keys to configured Stripe Price IDs. The client must never choose arbitrary Stripe Price IDs.

### `POST /api/billing/webhook`

Unauthenticated public Stripe webhook endpoint, protected by Stripe signature verification.

Expected event families include checkout completion and subscription lifecycle events. Entitlements are written only after trusted server-side verification.

### `GET /api/billing/entitlements`

Authenticated.

Returns the current account's server-authoritative access state, for example:

```json
{
  "membership": {
    "active": true
  },
  "labs": ["diffusion", "parallel"]
}
```

### `POST /api/billing/portal`

Authenticated.

Creates a Stripe Customer Portal session for subscription management.

## Identity and storage

A production billing release also needs:

- authenticated MRCC accounts;
- an account-linked entitlement store;
- Stripe customer IDs associated with accounts;
- Stripe subscription / purchase references stored server-side;
- idempotent webhook handling;
- cancellation / refund handling;
- a migration path for future Premium Labs.

## Environment configuration

Secrets belong in Vercel environment variables and must never be committed to the repository.

Expected server-side variables will include:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- server-side product / price mapping
- authentication secrets / provider configuration
- entitlement database credentials

## Medical / educational boundary

Payment status never changes the scope of the educational models.

Premium Labs must retain the same MRCC product boundary:

- no patient-specific decisions;
- no scanner-specific protocol prescriptions;
- no claim of diagnostic adequacy;
- no substitution for manufacturer labeling, scanner IFU, authoritative MR safety guidance, or local policy;
- advanced RF / safety teaching models must not calculate or imply patient- or device-specific clearance.


## Public teaser rule

Premium marketing may include limited interactive teasers, but a teaser must not become the entitlement boundary.

For the v11.1 Diffusion teaser:

- the public model is limited to one generic normalized mono-exponential relationship;
- it contains no saved premium workspace, multi-model comparison, premium history, or account entitlement;
- no tissue labels, diagnostic categories, thresholds, or patient-specific interpretation are included;
- the full premium implementation must remain behind server-authoritative entitlement checks once billing launches.


## Parallel Imaging teaser rule

For the v11.2 Parallel Imaging teaser:

- acceleration R is a pedagogical sampling factor rather than a scanner-specific implementation;
- encoding diversity is a generic 0–1 teaching variable and does not represent a measured coil-sensitivity matrix;
- g̃ is explicitly an invented noise-amplification proxy, not a calculated g-factor;
- the displayed SNR-like efficiency is a relative teaching relationship only;
- no coil calibration, alias unfolding, noise covariance, reconstruction method, image adequacy, or scanner-specific recommendation is modeled;
- the full premium implementation must remain behind server-authoritative entitlement checks once billing launches.


## RF Power Concepts teaser rule

For the v11.3 RF Power Concepts teaser:

- all controls are generic, unitless teaching variables;
- the RF-activity index is an invented relative sensitivity proxy;
- no output may be represented as SAR, B1+rms, RF power, deposited energy, temperature, operating mode, scanner compliance, or patient/device heating;
- no result may be described as safe, unsafe, compliant, cleared, or acceptable;
- manufacturer labeling, scanner IFU, authoritative MR safety guidance, and local policy remain controlling;
- the full premium implementation must remain behind server-authoritative entitlement checks once billing launches.


## v11.4 product-key contract

v11.4 adds a provider-neutral `premium-products.json` manifest before any payment provider is provisioned.

Stable public product keys:

- `premium_membership` — recurring access to all Premium Labs while active;
- `premium_diffusion` — one-time entitlement to Diffusion & b-Value Lab;
- `premium_parallel` — one-time entitlement to Parallel Imaging Lab;
- `premium_rfpower` — one-time entitlement to RF Power Concepts Lab;
- `premium_gradient` — one-time entitlement to Gradient Encoding Concepts Lab;
- `premium_offresonance` — one-time entitlement to Off-Resonance & Phase Lab.

These are MRCC product identifiers, not payment-provider price IDs.

Rules:

- prices remain unconfigured until the payment integration is actually provisioned;
- the browser may display the stable MRCC product key, but never a secret or arbitrary provider price ID;
- purchase controls remain non-charging readiness controls until identity, pricing, checkout, webhook verification, and entitlement persistence are all connected;
- `PREMIUM_ACCESS_MODE='preview-only'` is a product-state marker, not an entitlement;
- ownership must still come from authenticated server-side entitlement checks.


## Gradient Encoding Concepts teaser rule

For the v11.5 Gradient Encoding Concepts teaser:

- amplitude, duration, and ramp share are dimensionless teaching variables;
- the displayed area is normalized to a reference trapezoid and is not a physical gradient moment;
- no output may be represented as gradient strength, slew rate, PNS, acoustic behavior, k-space position, timing feasibility, or scanner hardware compliance;
- no setting may be described as optimal, feasible, scanner-valid, safe, or within hardware limits;
- the full premium implementation must remain behind server-authoritative entitlement checks once billing launches.


## Premium Lab Hub

v12.0 introduces a filterable Premium Lab Hub. Categories are presentation metadata only and never entitlement boundaries.

Current preview categories:

- Signal — Diffusion & b-Value; Off-Resonance & Phase
- Acquisition — Parallel Imaging; Gradient Encoding Concepts
- Safety-bounded — RF Power Concepts

Filtering is client-side discovery only. It must not alter product ownership, billing, or server authorization.

## Off-Resonance & Phase teaser rule

For the v12.0 Off-Resonance & Phase teaser:

- the model uses the generic relationship `φ = 2π·Δf·t`;
- frequency offset and elapsed time are teaching inputs, not scanner prescriptions;
- wrapped phase and vector projection are mathematical teaching outputs only;
- the teaser is not a field map, shim recommendation, chemical-species classifier, artifact severity predictor, correction algorithm, or image-quality assessment;
- the full premium implementation must remain behind server-authoritative entitlement checks once billing launches.
