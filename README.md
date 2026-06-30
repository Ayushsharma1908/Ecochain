# EcoChain Link

A circular-economy mobile app: scan a product barcode, see a sustainability
score, and get routed to a real disposal action — recycle, resell, donate,
reuse, or standard waste — plus the nearest local recycler. Built with Expo
+ Expo Router, in the visual brand of the EcoChain Link concept documentation
(paper/canopy surfaces, Fraunces + Archivo + JetBrains Mono, four accent
hues, the five-stage "loop" motif).

## What's actually wired up

This is a real, runnable app — not a mockup. Specifically:

- **Barcode scanning** via `expo-camera`, on-device, no data leaves the phone.
- **Live product lookups** against the free [Open Food Facts](https://world.openfoodfacts.org)
  API (no key required). Unknown barcodes fall back to seeded demo products
  so the flow never dead-ends.
- **A transparent scoring formula** (`src/lib/scoring.ts`) — base category
  emissions + label bonus − packaging penalty + nearby-recycler bonus —
  matching the formula in the concept doc, with a plain-language "why" for
  every score.
- **Rule-based waste classification & disposal guidance** (`src/lib/wasteMapping.ts`).
- **Real device location** (`expo-location`) to sort seeded recyclers by
  actual distance, with "open in Maps" deep links.
- **On-device scan history & analytics**, persisted with `AsyncStorage` —
  the Dashboard tab's charts are computed from your real usage, not fake data.
- **An AI advisor** for the four use cases from the doc (sustainability
  advisor, alternative finder, waste guidance, pickup & value prediction) —
  currently a deterministic on-device layer over your real scan data. See
  the comment at the top of `src/lib/aiAdvisor.ts` for the few lines needed
  to swap in a live LLM call.

## Honest notes on the requested stack

A few of the requested tools are web-only and don't run inside React Native.
Here's what was substituted, and why:

| Requested | Why it doesn't apply as-is | What's actually used |
|---|---|---|
| **shadcn/ui** | It's Tailwind + Radix UI components for the DOM — there's no React Native runtime for either. | A small hand-built component system in `src/components/ui/` (Button, Card, Badge, Chip, ScoreGauge…) using the same idea — typed variants, consistent tokens, drop shadows — just as RN `StyleSheet`s instead of Tailwind classes. |
| **Framer Motion** | Also DOM-only (animates CSS/SVG via the browser). | [`moti`](https://moti.fyi) — built on Reanimated, with an almost identical `animate`/`transition` API. Used throughout (tab transitions, gauge fill, scan frame pulse, chat bubbles). |
| **Magnific illustrations** | `magnific.com` (formerly Freepik) is a licensed stock marketplace — assets need to be picked and downloaded per your own account, and I can't redistribute or auto-fetch licensed artwork on your behalf. | Custom line-art illustrations in `src/components/illustrations/` drawn in the same brand style as the concept PDF. Swap-in instructions are in the comment at the top of that file — drop a Magnific SVG into `assets/illustrations/` and point one `<Image>`/import at it; nothing else changes. |
| **lucide-react-native** | ✅ works natively | Used throughout via `lucide-react-native`. |
| **Drop shadows / modern fonts / modern design** | ✅ works natively | `Shadow` presets in `src/constants/theme.ts`; Fraunces / Archivo / JetBrains Mono via `@expo-google-fonts/*`. |

## Getting started

This project was scaffolded with `create-expo-app` and already has every
dependency installed (check `package.json`). From here:

```bash
# 1. Install dependencies (if you cloned this fresh, or after pulling changes)
npm install

# 2. Start the dev server
npx expo start
```

Scan the QR code with **Expo Go** for the fastest preview — note that camera
barcode scanning and background location work in Expo Go, but for full
parity with a production build (and before submitting to a store), make a
development build:

```bash
npx eas-cli build --profile development --platform ios
# or
npx eas-cli build --profile development --platform android
```

That requires a free [Expo account](https://expo.dev/signup) — running it
the first time will prompt you to log in and will generate `eas.json` and
ask a couple of platform questions (bundle identifier, etc.) if you haven't
configured EAS before. Once the build finishes, install it on a device or
simulator, then run `npx expo start --dev-client` to connect to it.

Then, from your [Expo dashboard](https://expo.dev), you can see build
status, share install links with testers, and (once ready) submit to the
App Store / Play Store with `npx eas-cli submit`.

## Project structure

```
src/
  app/                  Expo Router screens (file-based routing)
    (tabs)/              Home · Scan · Recyclers · Dashboard
    product/[barcode]    Sustainability profile + disposal guidance (modal)
    recycler/[id]         Recycler detail (modal)
    advisor.tsx           AI advisor (modal)
  components/
    ui/                  Button, Card, Badge, ScoreGauge, FactorBar, LoopMark…
    illustrations/        Brand-style SVG illustrations
  context/               ScanHistoryContext (AsyncStorage), CurrentContext
  lib/                    scoring.ts, wasteMapping.ts, openFoodFacts.ts,
                          recyclers.ts, aiAdvisor.ts, storage.ts
  constants/theme.ts      Colors, type scale, spacing, radii, shadows
  types/domain.ts         Shared TypeScript types
```

## Permissions

- **Camera** — barcode scanning only, processed on-device.
- **Location (when in use)** — sorts seeded recycler data by real distance.
  The app works without granting either permission; it just falls back to
  manual barcode entry and unsorted/demo recycler data.

## Design tokens

Light mode is "paper" (`#ECE6D3`), dark mode is "canopy" (`#152D26`) — the
same two surfaces used for the concept documentation. Four accent hues run
through both: teal, gold, clay, lichen. See `src/constants/theme.ts` for the
full palette, type scale, and shadow presets.
