# Selling MR Command Center Case Packs

MR Command Center v5.1 separates **content creation** from **commerce**.

Publisher Studio creates the educational product. Product Kit creates storefront-ready metadata and handoff assets. A real commerce or digital-delivery platform should handle payment, tax, customer access, refunds, and file delivery.

## Product workflow

1. Build and review the case pack in **Publisher Studio**.
2. Complete the **Storefront product kit** metadata: SKU, category, audience, headline, and learning outcomes.
3. Resolve the required preflight checks. “Storefront metadata ready” means the listing metadata is complete; it does **not** mean the pack has been clinically validated, legally reviewed, accredited, or approved by an institution.
4. Export the case pack JSON.
5. Export the listing copy and `mrcc-product-manifest`.
6. Create the corresponding digital product in the chosen commerce platform and attach the case-pack file as the delivered asset.
7. Keep the product ID/SKU and pack ID stable when publishing updates. Use the edition field for content revisions.

## Exported assets

- **Case pack** — `<pack-id>.json`; imported by MRCC Case Lab.
- **Listing copy** — `<pack-id>-listing.txt`; a starting point for a storefront product page.
- **Product manifest** — `<pack-id>-product-manifest.json`; structured metadata for future catalog/store integrations.

The product manifest intentionally contains:

```json
"commerce": {
  "status": "not-connected",
  "checkoutUrl": null
}
```

A checkout URL should only be populated by a real commerce integration.

## Content and claims

Case packs are educational practice content. Before selling or distributing a pack, independently review source accuracy, copyright/licensing rights, manufacturer information where relevant, local policy implications, commercial terms, privacy, and customer-support obligations.

Do not market MRCC case completion or Study Reports as certification, competency documentation, CE credit, compliance evidence, patient-specific clearance, or scanner-specific protocol prescription unless a separate verified program legitimately supports those claims.

Do not include patient identifiers or other PHI in case-pack content.

## Free vs paid

Core safety foundations and the basic learning utility remain part of the free product. Paid differentiation should focus on additional depth and convenience: advanced case packs, larger practice libraries, advanced guided sessions, reusable workspace capacity, premium reporting/customization, and eventually managed department features.
