# AR Drawing Pro

Trace any image through your camera. Record your drawing session. Save to Photos.
Built with plain HTML/CSS/JS and wrapped in [Capacitor](https://capacitorjs.com/)
so it ships as a real native app on iOS and Android.

Live web preview: https://davidcrafter.github.io/AR/

---

## Repository layout

```
app/
├── www/                    ← the web app (Capacitor bundles this)
│   ├── index.html
│   ├── style.css
│   ├── app.js              ← main logic
│   ├── samples.js          ← built-in traceable images
│   └── manifest.json       ← PWA manifest
├── resources/
│   ├── icon.svg            ← source app icon (1024×1024)
│   └── splash.svg          ← source splash (2732×2732)
├── ios-permissions/        ← Info.plist keys to add after `cap add ios`
├── android-permissions/    ← AndroidManifest.xml entries to add
├── capacitor.config.json
├── package.json
└── .github/workflows/
    └── android.yml         ← auto-builds Android APK in CI
```

The web files under `www/` are the *entire* app. Everything else exists only
so the app can be installed like a native app on iOS and Android.

---

## Quick preview in a browser

```bash
cd app
npx http-server www -p 8080
# Open http://localhost:8080
```

On mobile you'll need HTTPS for camera access. The easiest option is the live
GitHub Pages URL above.

---

## Build the real Android app

You need Node 20+, Java 21, and Android Studio (or just the Android SDK).

```bash
cd app
npm install                 # installs Capacitor + plugins
npx capacitor-assets generate \
    --iconBackgroundColor '#ff3b30' \
    --splashBackgroundColor '#0a0a0f'
npx cap add android          # first time only
npx cap sync android
```

Then either:
- **From the command line:**  `cd android && ./gradlew assembleDebug`
  → APK at `android/app/build/outputs/apk/debug/app-debug.apk`.
- **Or open in Android Studio:**  `npx cap open android`, then click Run.

Before you build, apply the permission additions from
`android-permissions/AndroidManifest.additions.md` to
`android/app/src/main/AndroidManifest.xml`.

### Zero-setup Android build via GitHub Actions

This repo ships a workflow at `.github/workflows/android.yml`. Every push to
the `capacitor` (or `main`) branch under `app/` builds an APK and attaches it
to the Actions run.

1. Push a commit.
2. Go to **Actions → Build Android APK** on GitHub.
3. Download the `ar-drawing-pro-debug-apk` artifact and install it on your
   Android phone (enable *Install unknown apps* for your browser first).

---

## Build the real iOS app

You need a Mac (or a cloud Mac like MacinCloud / Codemagic), Xcode 15+, and an
Apple Developer account ($99/yr) for App Store distribution.

```bash
cd app
npm install
npx capacitor-assets generate \
    --iconBackgroundColor '#ff3b30' \
    --splashBackgroundColor '#0a0a0f'
npx cap add ios              # first time only
npx cap sync ios
```

Then apply the plist keys from `ios-permissions/Info.plist.additions.md` to
`ios/App/App/Info.plist`, and open Xcode:

```bash
npx cap open ios
```

1. In Xcode, select your team under **Signing & Capabilities**.
2. Set a unique **Bundle Identifier** (default: `com.davidcrafter.ardrawingpro`).
3. Plug in your iPhone, select it as the run target, hit **⌘R**.

### No Mac? Build in the cloud with Codemagic

1. Sign up at https://codemagic.io (free tier: 500 build minutes/mo).
2. Add this repo. Under *Build for platforms* select **iOS**.
3. Add your Apple Developer credentials in Codemagic → Teams → Code signing.
4. Trigger a build. It produces a signed `.ipa` you can install via TestFlight
   or upload to the App Store.

---

## Publish to the stores

### Apple App Store

1. Enroll in the **Apple Developer Program** ($99/yr): https://developer.apple.com/programs/
2. In [App Store Connect](https://appstoreconnect.apple.com), create a new app.
   Use bundle ID `com.davidcrafter.ardrawingpro`.
3. Fill in:
   - App name (≤30 chars) & subtitle
   - App icon (1024×1024, auto-generated from `resources/icon.svg`)
   - Screenshots for **6.7"** and **6.5"** iPhone at minimum (portrait)
   - Description, keywords, category → *Photo & Video*
   - **Privacy Policy URL** (mandatory — see below)
   - **Privacy Nutrition Labels** — declare: *Camera access, no data collected*
   - Age rating (probably 4+)
4. Archive & upload via Xcode: **Product → Archive → Distribute App → App Store Connect**.
5. Once uploaded, submit for review. Typical wait: 24–48 hours.

### Google Play Store

1. One-time **Google Play Console** signup ($25): https://play.google.com/console/
2. Create a new app. Upload a **signed AAB** (not APK) for release:
   ```bash
   cd android
   ./gradlew bundleRelease
   ```
   Signed with a keystore you generate once:
   ```bash
   keytool -genkey -v -keystore ar-drawing.jks -keyalg RSA \
     -keysize 2048 -validity 10000 -alias ar-drawing
   ```
   **⚠ Never lose this keystore.** Without it you can never update the app.
3. Fill in the Play Console listing:
   - Short description (≤80 chars) + full description (≤4000)
   - App icon (512×512), feature graphic (1024×500)
   - Phone screenshots (min 3), 7" tablet, 10" tablet
   - **Privacy policy URL**
   - Data safety declaration (*Camera used; no data collected*)
   - Content rating questionnaire
4. Roll out to internal testing first, then production.

### Privacy policy

You need a public URL to a privacy policy. Both stores enforce this because
you request camera permission. Free options:
- https://www.freeprivacypolicy.com/free-privacy-policy-generator/
- https://app-privacy-policy-generator.nisrulz.com/

Sample bullet points to include:
- Camera used only on-device for the tracing overlay and video capture.
- Videos saved only on the user's device unless they explicitly share.
- No analytics, no accounts, no third-party SDKs.
- Contact email for questions.

Host it as a page on GitHub Pages, Notion, or your website. Paste the URL into
App Store Connect and Play Console.

---

## Native features enabled

| Feature | Web fallback | Native (Capacitor) |
|---|---|---|
| Camera | `getUserMedia` | same (via WebView) |
| Recording | `MediaRecorder` | same |
| Save video | `<a download>` | **@capacitor-community/media** → saves to Photos / Gallery |
| Haptic feedback | `navigator.vibrate` | **@capacitor/haptics** (rich feedback on iOS) |
| Splash screen | none | **@capacitor/splash-screen** |
| Status bar | none | **@capacitor/status-bar** (dark, edge-to-edge) |
| Share sheet | `navigator.share` | **@capacitor/share** |

---

## Editing the app

All app code lives in `app/www/`. It's plain HTML/CSS/JS — no build step, no
bundler. Change a file, then either:

- **For a web-only test:**  refresh your browser at `localhost:8080` /
  gh-pages URL.
- **For a native test:**  `npx cap sync` then rebuild in Xcode / Android Studio.

### Adding more sample images

Edit `app/www/samples.js`. Each entry is:

```js
{ id: 'unique-id', name: 'Display Name', category: 'Animals', svg: wrap(`<path .../>`) }
```

SVGs are line art — keep them simple and monochrome so they read well as a
tracing ghost on top of the camera feed.

---

## License

Private. All rights reserved by davidcrafter.
