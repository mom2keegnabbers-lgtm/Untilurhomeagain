# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Android / Play Store build (Capacitor)

The web app is wrapped with [Capacitor](https://capacitorjs.com) for the Google
Play Store. The native app loads a static build; the Nitro server keeps
running the web version unchanged.

### Prerequisites (one-time, done by the app owner)

1. **Deploy the backend.** The native app has no local server, so `/api/*`
   calls (Ask, Notice explainer, membership) go to your deployed Nitro
   backend. Deploy this repo (Cloudflare Workers preset is already
   configured) and note its public base URL, e.g.
   `https://kindred-api.example.workers.dev`.
2. **RevenueCat account.** In-app purchases on Android must use Google Play
   Billing, which this app does through RevenueCat:
   - Create a free account at https://app.revenuecat.com
   - Add the Android app (package id `com.kindred.app`) and link Google Play
   - Create an entitlement with id `lifetime`, attach the $4.99 one-time
     Play product to the default offering
   - Copy the **public** Google SDK key → `VITE_REVENUECAT_API_KEY`
   - Copy the **secret** API key → `REVENUECAT_SECRET_KEY` (backend only;
     enables server-side purchase verification)
   - Stripe stays for the **web** version only. Never offer Stripe checkout
     inside the native app — Play policy forbids it for digital goods.
3. **Android keystore** for signing the release AAB (keep it safe and backed
   up; Google Play needs the same key for every future update).

### Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `VITE_API_URL` | native build | Public base URL of the deployed backend (no trailing slash). Web builds omit it and keep using relative `/api/*` URLs. |
| `VITE_REVENUECAT_API_KEY` | native build | RevenueCat **public** Google SDK key. Without it, the native purchase button shows a setup message instead of charging. |
| `REVENUECAT_SECRET_KEY` | backend | RevenueCat **secret** key for server-side purchase verification. |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | backend | Web-only Stripe checkout (unchanged). Not used by the native app. |

### Build commands

```sh
# install dependencies
bun install

# web (SSR) build — unchanged
bun run build

# native static build (SPA + index.html for Capacitor's webDir)
VITE_API_URL=https://kindred-api.example.workers.dev \
VITE_REVENUECAT_API_KEY=goog_... \
bun run build:capacitor

# generate / refresh the Android project (android/ is gitignored)
bunx cap add android
bunx cap sync android
```

Then open `android/` in Android Studio, configure signing with your keystore,
and build the release bundle (`Build > Generate Signed Bundle / APK > Android
App Bundle`).

### Play Console checklist (app owner)

- $25 one-time Play developer account; complete identity verification.
- New personal accounts: 14-day closed test with ≥12 opted-in testers before
  production access can be requested — recruit testers early, the clock can't
  be compressed.
- Store listing (icon, screenshots, description), privacy policy URL, Data
  safety form, content rating questionnaire, target API level per current
  Play requirements.
