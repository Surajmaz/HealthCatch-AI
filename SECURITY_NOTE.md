# About the Firebase "exposed" API key

You're right to want to double-check this, but there's an important
distinction worth understanding: **the Firebase Web API key is not the same
kind of secret as your Gemini API key.**

## Why the Firebase key is safe to be public

Your Gemini key, if leaked, lets anyone make API calls billed to *your*
account — that's a real secret, correctly kept server-side in `backend/.env`
(gitignored, never sent to the browser).

The Firebase Web config (`apiKey`, `authDomain`, `projectId`, etc.) is
different. It doesn't grant access to anything by itself — it just tells the
Firebase SDK *which project* to talk to. Every Firebase web app that exists
ships this config in its public JS bundle; you can view it on any site using
Firebase by opening DevTools. Google's own documentation says this
explicitly: this key is safe to include in client-side code.

**What actually protects your Firebase project:**
1. **Authorized Domains** (Firebase Console → Authentication → Settings →
   Authorized domains) — only domains on this list can complete a login,
   regardless of who has your config. Remove anything that isn't your real
   domain(s) plus `localhost` for dev.
2. **API key restrictions** (Google Cloud Console → APIs & Services →
   Credentials → your key → Application restrictions) — you can lock the key
   to only work from specific HTTP referrers (your domains), and restrict
   which Google APIs it's allowed to call.
3. **Firestore/Realtime Database security rules** — if you ever add a
   database, *these* rules are what actually decide who can read/write data,
   not the API key. This app currently only uses Firebase Auth, no database.
4. **App Check** (optional, more advanced) — cryptographically verifies
   requests are coming from your actual app, not a script using your config
   copy-pasted elsewhere.

## What I changed anyway

Even though the key itself isn't sensitive, moving config out of source code
is still good practice — different environments (dev/staging/prod) can use
different Firebase projects without code changes, and it's one less thing to
think about if you ever *do* add something sensitive later.

- `frontend/src/firebase.js` now reads config from environment variables
  (`VITE_FIREBASE_*`) instead of hardcoding it.
- Real values moved into `frontend/.env` (already gitignored).
- Added `frontend/.env.example` — a template with empty values, safe to
  commit, so anyone setting up the project knows what's needed without
  seeing real credentials.
- Fixed `frontend/.gitignore` — it only ignored `*.local` before, not plain
  `.env`. Now `.env` and `.env.*` are ignored (with `.env.example`
  explicitly allowed through).

## The one thing worth actually checking right now
Go to **Firebase Console → Authentication → Settings → Authorized domains**
and make sure only domains you control are listed. That's the setting that
actually matters here — not the key itself.
