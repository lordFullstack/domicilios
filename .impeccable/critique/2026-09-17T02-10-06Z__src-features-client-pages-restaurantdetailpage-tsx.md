---
target: RestaurantDetailPage
total_score: 24
max_score: 36
na_heuristics: 10
p0_count: 1
p1_count: 2
target_identity: "file:C:\\Users\\USUARIO\\OneDrive\\Escritorio\\repos JGC\\domicilios\\src\\features\\client\\pages\\RestaurantDetailPage.tsx"
target_fingerprint: "sha256:3c5ac248d8e2119dccd5cd0ef2cde75b1be48273f30cfbb8d2907a1684caa7a4"
target_path: "C:\\Users\\USUARIO\\OneDrive\\Escritorio\\repos JGC\\domicilios\\src\\features\\client\\pages\\RestaurantDetailPage.tsx"
timestamp: 2026-09-17T02-10-06Z
slug: src-features-client-pages-restaurantdetailpage-tsx
---
# Critique: RestaurantDetailPage.tsx (menu)

Method: dual-agent (A: design review with live cart interaction · B: detector + browser evidence), isolated, in parallel.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Good skeletons; toast double-signaled success (icon + literal ✓). |
| 2 | Match System / Real World | 1 | "25-35 min · $3.000 · 1.2 km" hardcoded identically for every restaurant; fee contradicted "Envío gratis". |
| 3 | User Control and Freedom | 3 | Back, Escape-to-close, decrement-to-remove all work. |
| 4 | Consistency and Standards | 2 | Quick-add was coral in the list but gradient in the featured strip; emoji icons next to lucide ones. |
| 5 | Error Prevention | 4 | Mixed-restaurant cart confirmation is a real, well-worded guard. |
| 6 | Recognition Rather Than Recall | 3 | Sticky categories, inline quantities on cards. |
| 7 | Flexibility and Efficiency | 3 | Quick-add without opening the detail sheet. |
| 8 | Aesthetic and Minimalist Design | 2 | Hero meta row overloaded and colliding with text inside cover photos. |
| 9 | Error Recovery | 3 | Clear offline/not-found/suspended states. |
| 10 | Help and Documentation | n/a | Not meaningful for this transactional screen. |
| **Total** | | **24/36** | **Acceptable (67%)** |

## Resolution of conflicting evidence

Assessment B reported add-to-cart "not working". Independently re-verified in the parent context: items were written to the cart (localStorage) correctly. The failure was a test artifact — the PWA update banner covered CartFloatingBar, so the updated total was never visible. That overlap was itself the real P0.

## Issues and status

- [P0] PWA update banner (bottom-20, z-50) covered CartFloatingBar (bottom-24, z-30) right after adding an item. **Fixed**: banner moved to top, dismissible.
- [P1] Fabricated delivery time/fee/distance identical across restaurants. **Fixed**: removed; shows real rating + "Envío gratis" (consistent with cart/checkout).
- [P1] Cover-photo text (phone numbers) collided with name/rating overlay. **Fixed**: denser scrim, shorter meta row.
- [P2] Quick-add styled differently in strip vs list. **Fixed**: coral in both.
- [P3] Back/favorite/category buttons lacked type="button"; category tabs lacked aria-pressed. **Fixed**.
- Minor: raw restaurant.image_url interpolation → ProductImage; emoji icons (⭐ 🟢 🔴 ⛔ 🔥 📴) → lucide; offline badge off raw yellow-* onto warning token; unlabeled featured-card buttons got aria-labels. **Fixed**.

## Not addressed

- ProductImage falls back to 🍽️ for every product without a photo, including drinks.
- Supabase Realtime websocket reconnect loop floods the console on this page.
- BottomSheet has no focus trap / focus return.
