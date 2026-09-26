# Premium Labs architecture

MR Command Center v11.0 introduces the Premium Labs product surface without enabling live charges yet.

## Product model

Two entitlement types are planned:

1. **Premium Membership** — recurring subscription that unlocks every Premium Lab while the membership is active.
2. **One-time Lab Unlock** — permanent entitlement to one selected Premium Lab.

Initial Premium Lab catalog:

- Diffusion & b-Value Lab
- Parallel Imaging Lab
- RF Power Concepts Lab

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
