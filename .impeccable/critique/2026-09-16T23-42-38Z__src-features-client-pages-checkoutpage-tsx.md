---
target: Cart + Checkout
total_score: 16
max_score: 36
na_heuristics: 10
p0_count: 3
p1_count: 0
target_identity: "file:C:\\Users\\USUARIO\\OneDrive\\Escritorio\\repos JGC\\domicilios\\src\\features\\client\\pages\\CheckoutPage.tsx"
target_fingerprint: "sha256:0cf893e04076e1fa158e50a6ae44e8c8b90ff350b83ff27109d3f5b8a3881679"
target_path: "C:\\Users\\USUARIO\\OneDrive\\Escritorio\\repos JGC\\domicilios\\src\\features\\client\\pages\\CheckoutPage.tsx"
timestamp: 2026-09-16T23-42-38Z
slug: src-features-client-pages-checkoutpage-tsx
---
# Crítica: Cart + Checkout (flujo de pago)

Method: dual-agent (A: design review with a real live order · B: detector + browser evidence), isolated, run in parallel.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | No delivery-time estimate anywhere in the flow. |
| 2 | Match System / Real World | 3 | COP formatting, Spanish copy, Riohacha references land well. |
| 3 | User Control and Freedom | 1 | Tapping the address-edit affordance submitted the whole form by accident. |
| 4 | Consistency and Standards | 1 | Two different empty-cart implementations; restaurant "icon" rendered as a raw string. |
| 5 | Error Prevention | 1 | Buttons without `type="button"` inside a `<form>` — the classic React footgun. |
| 6 | Recognition Rather Than Recall | 3 | Address persists in localStorage and prefills on the next order. |
| 7 | Flexibility and Efficiency | 2 | Only one address slot, no quick reorder. |
| 8 | Aesthetic and Minimalist Design | 3 | ENTREGA/MÉTODO/RESUMEN sectioning is clean and legible. |
| 9 | Error Recovery | 0 | The red error banner stayed on screen even after the CTA was already enabled. |
| 10 | Help and Documentation | n/a | Not meaningful for a 3-field checkout. |
| **Total** | | **16/36** | **Poor (44%) — needed a real UX pass** |

## Design Specificity Verdict

Mixed. Copy is well localized (COP, "Riohacha, La Guajira", "Pagas al recibir tu pedido") and there are real product decisions (offline gating, address persistence). But the interaction layer had basic-manual React errors — two different empty-cart states for the same concept, and a restaurant icon printed as raw text instead of going through the component that already solves this elsewhere.

Deterministic scan: `impeccable detect` clean (0 findings) on both pages and their components — confirms again that the real bugs here are behavioral (a missing `type` attribute, a `useEffect` that was never written), invisible to an HTML/CSS linter.

Browser evidence: real authenticated session, full order placed end to end. The detector found unlabeled back buttons (same pattern in Cart and Checkout) and the "Referencia" textarea with no associated `<label>` (already fixed during the Home audit). The most severe finding — the address button submitting the form — only surfaced because Assessment A actually interacted with the screen instead of just reading the DOM; the detector would never have caught it.

## Overall Impression

This is the highest commercial-risk point in the app, and it had three P0 basic-React-forms bugs that a real user triggers just by tapping the screen in the wrong order. All three are now fixed.

## What's Working

1. Offline gating done right: `useOnlineStatus` disables the button, swaps its label to "Sin conexión", and shows a banner — exactly the error prevention a payment flow needs.
2. Persistent address: saved to localStorage and prefilled on the next order — real recognition-over-recall for returning users.
3. Double-submit guard: real protection against duplicate orders from a double-tap.

## Issues Found and Their Status

- **[P0] The address button submitted the whole form** — `AddressCard.tsx` had two `<button>`s without `type="button"` inside a `<form onSubmit>`; tapping "¿Dónde entregamos?" triggered a failed validation and painted an error before the user had done anything. **Fixed** (added `type="button"` to both).
- **[P0] The error banner never cleared itself** — `error` was only reset on the next submit attempt, not when its actual cause (address, connection) was already resolved; the user saw the red error sitting above an already-enabled button. **Fixed** (`useEffect` clears `error` once `hasAddress`/`isOffline`/`checkoutInfoReady` become valid).
- **[P0] Product name truncated to "cos…"** — the single-row layout left the name ~41px of real width on a 335px-wide row, measured live. Exactly where the user confirms what they're paying for. **Fixed** (redesigned the row to two lines: name full-width on top, price+stepper+delete below).
- **[P2] Restaurant icon rendered as a raw string** — `{restaurant.image_url}` printed literally instead of going through `ProductImage` (which already resolves real photo vs. emoji elsewhere in the app). **Fixed** in Cart and Checkout.
- **[P2] Two different empty-cart implementations** — Checkout had a version with no header, no `EmptyState`, a raw 🛒 emoji; Cart used the good version. **Fixed** (Checkout now uses the same pattern as Cart).
- **[P3] "Pagar en línea" only distinguished by `opacity-50`** — no `cursor-not-allowed`, easy to tap by mistake. **Fixed**.
- **Extra found in passing**: `ProtectedRoute`'s loading spinner used an ⏳ emoji; swapped for the same lucide icon the rest of the app uses. The "Vaciar carrito" button was overriding the variant system with `!bg-danger`; added a real `danger` variant to the shared `Button` component.

## Persona Red Flags

**Casey (distracted, interrupted)**: if their phone was in system dark mode, they couldn't see the cart quantity number or type into the "Referencia" field — the same bug already fixed during the Home audit, independently confirmed here. The address-button bug was exactly the kind of interaction a half-attentive user triggers by accident and reads as "something broke."

**Riley (edge-case tester)**: Checkout's empty cart left Riley with no `BottomNav` and no way out except one button — now fixed. The "back button after paying" flow works correctly (cart clears before showing success, no double-charge risk). One thing intentionally left untouched, outside these two files: if the order-items insert fails after the order row is created, the error is only console-logged and the user still sees "¡Pedido confirmado!" with an item-less order — worth a follow-up look at `createOrder` in `useLocalData.ts`.

## Minor Observations

- The success screen (`OrderSuccessView`) shows no delivery ETA — the highest-anxiety question right after paying goes unanswered.
- "Envío: Gratis" appears unconditionally; confirm it isn't a placeholder that will surprise users later.

## Questions to Consider

- Given the error-prevention instinct already present (offline gating, double-submit guard), why did `type="button"` — the most well-documented React forms footgun — slip through? Worth a lint rule for it?
- Why doesn't the success screen answer "how long until it arrives" at the exact moment the user is most anxious to know?
