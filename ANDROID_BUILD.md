# HN-AI — Android Build Guide (PWA → APK)

HN-AI ships as a fully installable PWA. This guide shows how to wrap it as a native Android APK / AAB for direct distribution or Google Play.

App identity (use these everywhere):

| Field          | Value                                |
|----------------|--------------------------------------|
| App name       | HN-AI                                |
| Package name   | `com.hngroup.hnai`                   |
| Start URL      | `/?source=pwa`                       |
| Display        | `standalone`                         |
| Theme color    | `#0b0a1f`                            |
| Background     | `#0b0a1f`                            |
| Icon (any)     | `public/icons/icon-512.png`          |
| Icon (maskable)| `public/icons/icon-maskable-512.png` |

There are three supported paths. Pick **one**.

---

## Option 1 — Capacitor (recommended, full native control)

```bash
# 1. Build the web app
bun run build

# 2. Install Capacitor
bun add @capacitor/core @capacitor/cli @capacitor/android

# 3. Initialize (uses capacitor.config.ts already in repo)
npx cap add android

# 4. Sync web build into the Android project
npx cap copy android
npx cap sync android

# 5. Open in Android Studio and build APK / AAB
npx cap open android
```

In Android Studio: **Build → Generate Signed Bundle / APK → APK** → choose your keystore → release.

The icon is generated from `public/icons/icon-512.png`. To regenerate Android adaptive icons:

```bash
npx @capacitor/assets generate --android \
  --icon-background "#0b0a1f" \
  --icon-foreground public/icons/icon-maskable-512.png
```

---

## Option 2 — Bubblewrap (Trusted Web Activity, smallest APK)

Best when you want the APK to simply load the deployed PWA.

```bash
# Requires Java 17+ and Android SDK
npm i -g @bubblewrap/cli

bubblewrap init --manifest=https://code-neon-ai.lovable.app/manifest.webmanifest
bubblewrap build       # produces app-release-signed.apk + .aab
```

Bubblewrap reads `manifest.webmanifest` and generates a TWA wrapper. To pass the Digital Asset Links check on Play Store, upload `assetlinks.json` to `public/.well-known/assetlinks.json` with your signing fingerprint.

---

## Option 3 — PWABuilder (zero-CLI)

1. Visit https://www.pwabuilder.com
2. Enter `https://code-neon-ai.lovable.app`
3. Click **Package for Stores → Android**
4. Download the signed `.apk` and `.aab`

PWABuilder uses Bubblewrap under the hood and produces a Play-Store-ready bundle.

---

## App icon checklist

- `public/icons/icon-192.png` — 192×192 (any)
- `public/icons/icon-512.png` — 512×512 (any)
- `public/icons/icon-maskable-512.png` — 512×512 (maskable, edge-to-edge fill)
- `public/icons/apple-touch-icon.png` — 180×180 (iOS home screen)

Replace these PNGs and re-run `npx cap sync android` (or rebuild with Bubblewrap) to apply new branding.

---

## Splash screen

The splash uses `theme_color` (`#0b0a1f`) plus the maskable icon. For a custom splash with Capacitor:

```bash
bun add @capacitor/splash-screen
npx cap sync android
```

Place a 2732×2732 splash at `resources/splash.png` and run
`npx @capacitor/assets generate --android` to regenerate native splashes.

---

## Publishing to Google Play

1. Create a Play Console developer account ($25 one-time).
2. Create a new app → upload the `.aab` from `android/app/build/outputs/bundle/release/`.
3. Fill in: title (`HN-AI`), short description, screenshots (phone + 7-inch + 10-inch), feature graphic (1024×500), privacy policy URL.
4. Roll out to Internal testing first, then Production.

---

## Versioning

Bump in `android/app/build.gradle`:

```gradle
versionCode 2
versionName "1.0.1"
```

Then rebuild and re-upload the AAB.

---

© HN-Group — جميع الحقوق محفوظة مولاي إسماعيل الحسني
