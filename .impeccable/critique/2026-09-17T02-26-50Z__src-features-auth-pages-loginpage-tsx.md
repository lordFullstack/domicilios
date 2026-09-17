---
target: LoginPage
total_score: 32
max_score: 36
na_heuristics: 10
p0_count: 0
p1_count: 1
target_identity: "file:C:\\Users\\USUARIO\\OneDrive\\Escritorio\\repos JGC\\domicilios\\src\\features\\auth\\pages\\LoginPage.tsx"
target_fingerprint: "sha256:5771c57b617844cf0f88e9a28432076df0cfba0e18d1d38a13951627b0d85b17"
target_path: "C:\\Users\\USUARIO\\OneDrive\\Escritorio\\repos JGC\\domicilios\\src\\features\\auth\\pages\\LoginPage.tsx"
timestamp: 2026-09-17T02-26-50Z
slug: src-features-auth-pages-loginpage-tsx
---
# Critique: Login (/login)

Method: dual-agent (A: design review with real interaction · B: detector + browser evidence), isolated, in parallel.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Loading spinner covers the async wait well. |
| 2 | Match System / Real World | 4 | Real bandeja-paisa photo, Colombian copy, city name in the H1. |
| 3 | User Control and Freedom | 3 | Password toggle, always-visible recovery link. |
| 4 | Consistency and Standards | 3 | Own AuthInput/AuthPasswordInput consistent; two dead duplicates sat in the same folder. |
| 5 | Error Prevention | 2 to 4 | Relied entirely on native browser validation, no autoComplete/name. |
| 6 | Recognition Rather Than Recall | 3 | Password isn't cleared on a failed login. |
| 7 | Flexibility and Efficiency | 2 to 4 | No autoComplete meant no password manager could autofill. |
| 8 | Aesthetic and Minimalist Design | 3 to 4 | Form floated in ~300px of empty white space on wide screens. |
| 9 | Error Recovery | 3 | getAuthErrorMessage() maps Supabase errors to safe Spanish, with its own test. |
| 10 | Help and Documentation | n/a | Not applicable to a login screen. |
| **Total** | | **26 to 32/36** | **Good (72%) to Excellent after fixes** |

## Design Specificity Verdict

Genuinely local — the strongest thing about this screen. Real bandeja paisa photography (not a generic "delivery guy on scooter"), Colombian Spanish copy, consistent cobalt brand, and code comments documenting real design iterations. Not a reskinned auth template.

Deterministic scan: `impeccable detect` clean. The real issues here weren't mechanical either: missing HTML attributes (autoComplete, name) and a validation UI that was built but never wired up.

## Overall Impression

The screen that most needs to build trust already had the brand/copy work done, but was missing basic-forms-manual details that matter in practice: no password-manager autofill, no validation in the app's own voice, and floating in white space on wide screens. All four are now fixed.

## What's Working

1. Password survives a failed login — doesn't force retyping if the error was in the email.
2. Deliberate error mapping with its own test file (authErrors.ts + authErrors.test.ts) — never exposes raw Supabase errors.
3. The password show/hide button already had correct type="button" and aria-label — doesn't repeat the Checkout bug.

## Issues and Status

- [P1] No autoComplete/name — no password manager could offer autofill on the app's highest-traffic form. Fixed.
- [P2] Form floated in white space on desktop (~300px above/below at 1440x900) — the screen most likely to get desktop/marketing traffic had its right half nearly empty. Fixed: anchored near the top instead of pure vertical centering.
- [P2] No email-format validation in the app's voice — AuthInput already had the error/aria-invalid/aria-describedby plumbing built and unused; the only feedback was the browser's native tooltip, in system language, not guaranteed Spanish. Fixed.
- [P3] No autoFocus on the first field. Fixed.
- Extra: deleted LoginInput.tsx/LoginPasswordInput.tsx, dead duplicates the code itself already documented as superseded.

## Persona Red Flags

Jordan (deciding whether to trust the app): the real photo and city name build trust fast; the weak point was the native browser tooltip on a malformed email feeling off-brand at exactly the trust-building moment — now fixed.

Sam (keyboard/screen-reader/password-manager-dependent): tab order and focus ring were already correct; the real gap was their password manager being unable to offer autofill without autoComplete/name — now fixed.

## Not Addressed (out of scope this pass)

- No acknowledgment after a successful login — navigate() is an abrupt cut to the next screen, no transition.
