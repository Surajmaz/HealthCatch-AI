# 🧠 HealthCatch AI — Health & Wellness Platform

![React](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20TailwindCSS-teal)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python-green)
![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini%20API-orange)
![Firebase](https://img.shields.io/badge/Auth-Firebase-yellow)

**HealthCatch AI** is a full-stack health & wellness platform — an AI
counselor chat, a social "Health Circle" feed, doctor booking, healthcare
job listings, and more — built with React + Vite on the frontend, FastAPI on
the backend, Firebase for authentication, and Google's Gemini API for the
AI chat.

---

## ✨ Features

- **AI Health Coach** — real-time chat backed by Gemini, supports text and
  image/file attachments (e.g. a prescription photo), with automatic
  fallback across multiple Gemini models if one is unavailable.
- **Firebase Authentication** — email/password (with email verification) and
  Google sign-in, plus a working "Forgot password?" flow.
- **Health Circle** — a social feed with Like/Follow/Share, connection
  requests, and suggestions, all with working state (not just decoration).
- **Consult Doctors** — browse doctors and book appointments / start a video
  consult.
- **Healthcare Jobs** — browse and apply to listings.
- **Health Identity, Smart Challenges, Professional Network, Health Groups**
  — additional dashboard sections.
- **Interactive 3D landing page** — a scroll-driven DNA helix background
  (react-three-fiber), plus a draggable scroll rail on the left.
- **Fully responsive** — the dashboard sidebar becomes a slide-out drawer
  below 900px width, with a second, differently-styled draggable scroll rail
  on the right for dashboard content.
- **Dark/light mode**, toast notifications for user feedback, and a
  `/health` endpoint on the backend for quick connectivity checks.

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, Framer Motion, react-three-fiber (Three.js), lucide-react |
| Backend | FastAPI, Uvicorn, Python |
| Auth | Firebase Authentication (email/password + Google) |
| AI | Google Gemini API (direct REST calls, no SDK) |

---

## 📁 Project Structure

```
HealthCatch-AI/
├── backend/
│   ├── main.py              # FastAPI app — /health and /chat (Gemini) endpoints
│   ├── requirements.txt
│   └── .env                 # GEMINI_API_KEY (you create this — see below)
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Entire app UI (landing page + dashboard)
│   │   ├── firebase.js      # Firebase init, reads config from .env
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env                 # VITE_API_URL + Firebase config (you create this)
│   ├── .env.example         # Template showing what .env needs (safe to share)
│   └── package.json
├── SECURITY_NOTE.md         # Why the Firebase config isn't a "secret" the way an API key is
└── WHATS_FIXED_NOW.md       # Running changelog of fixes across sessions
```

---

## 🚀 Full Setup Instructions

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.9+ and pip
- A **Firebase project** (free) — [console.firebase.google.com](https://console.firebase.google.com)
- A **Gemini API key** (free) — [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

### 1. Backend setup

```bash
cd backend

# create and activate a virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# install dependencies
pip install -r requirements.txt
```

Create `backend/.env` (or edit the one already there) with:
```
GEMINI_API_KEY=your_real_gemini_key_here
```
Get a free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

Start the backend:
```bash
uvicorn main:app --reload
```
It should start on `http://127.0.0.1:8000`. Confirm it's working by visiting
`http://127.0.0.1:8000/health` in a browser — you should see
`{"status":"ok","api_key_loaded":true}`. If `api_key_loaded` is `false`,
your `.env` isn't being read (check it's saved in the `backend/` folder,
not the project root).

### 2. Firebase setup

1. Go to [Firebase Console](https://console.firebase.google.com) → create a
   project (or use an existing one).
2. In the project, go to **Build → Authentication → Get started**, and
   enable the **Email/Password** and **Google** sign-in providers.
3. Go to **Project settings → General → Your apps**, add a **Web app** if
   you haven't already, and copy the config values shown there
   (`apiKey`, `authDomain`, `projectId`, etc.).
4. Under **Authentication → Settings → Authorized domains**, make sure
   `localhost` is listed (it is by default) — add your real domain here too
   once you deploy.

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env` (copy `frontend/.env.example` as a starting point)
and fill in:

```
VITE_API_URL=http://127.0.0.1:8000

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```
Fill the Firebase values in with what you copied from the Firebase Console
in step 2. Leave `VITE_API_URL` as-is for local development — only change
it if you deploy the backend somewhere public (see Deployment below).

Start the frontend:
```bash
npm run dev
```
It should start on `http://localhost:5173`. **Both the backend and frontend
need to be running at the same time** — use two terminal windows/tabs.

### 4. Open the app
Visit `http://localhost:5173`. Sign up or sign in with Google, and you
should land on the dashboard.

---

## 🔑 Environment Variables Reference

### `backend/.env`
| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Your Gemini API key from Google AI Studio |

### `frontend/.env`
| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Where the backend is running. `http://127.0.0.1:8000` for local dev |
| `VITE_FIREBASE_API_KEY` | Yes | From Firebase Console → Project settings |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | Same |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Same |
| `VITE_FIREBASE_STORAGE_BUCKET` | Yes | Same |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes | Same |
| `VITE_FIREBASE_APP_ID` | Yes | Same |
| `VITE_FIREBASE_MEASUREMENT_ID` | No | Only needed if you use Firebase Analytics |

**Important:** Vite only reads `.env` files when the dev server *starts* —
if you edit `.env` while `npm run dev` is already running, stop it
(`Ctrl+C`) and restart it. Editing `.env` does not hot-reload.

---

## 🩺 Troubleshooting

**Chat says "Sorry, network issue" / "Couldn't reach the AI server"**
The frontend can't reach the backend at all. Checklist:
- Is `uvicorn main:app --reload` actually running in a terminal?
- Open the browser console (F12) — the error message now includes the
  exact URL it tried to reach. If that URL looks wrong (e.g. it matches
  your frontend's own address instead of `127.0.0.1:8000`), your
  `frontend/.env`'s `VITE_API_URL` is misconfigured — fix it and **restart**
  `npm run dev`.
- Visit `http://127.0.0.1:8000/health` directly in a browser to confirm the
  backend itself is up.

**Chat says "Sorry, the AI service is temporarily busy"**
The backend reached Gemini but got an error back. Check the backend's
terminal — it prints exactly which model failed and why. Common causes:
an invalid/missing `GEMINI_API_KEY`, or (rarely) all three fallback models
being briefly unavailable. Google periodically retires older Gemini models;
if this keeps happening, check [ai.google.dev/gemini-api/docs/models](https://ai.google.dev/gemini-api/docs/models)
for current model names and update the `MODELS_TO_TRY` list near the top of
`backend/main.py`.

**Google sign-in doesn't complete**
Check Firebase Console → Authentication → Settings → Authorized domains
includes `localhost` (for dev) or your real domain (in production).

**Site looks broken / unstyled after pulling new code or installing a package**
Vite's dependency cache can go stale. Stop the dev server and run:
```bash
rm -rf node_modules/.vite
npm run dev
```

**"Only worked on the first run"**
This is almost always the `.env`-requires-restart issue above, not an
actual bug — Vite's shorter startup output on the 2nd+ run (no dependency
pre-bundling messages) is normal and expected, not a sign of failure.

---

## 🔒 Security Notes

See `SECURITY_NOTE.md` for a full explanation, but in short:
- **`GEMINI_API_KEY`** is a real secret — never commit it, never put it in
  frontend code. It's already gitignored in `backend/.env`.
- **Firebase's `VITE_FIREBASE_*` config** is *not* a secret in the same way
  — it's designed to be visible in the browser. It's still kept in `.env`
  (gitignored) as good practice, but the actual protection is Firebase's
  Authorized Domains list and API key restrictions in Google Cloud Console,
  not hiding these values.

---

## 🌍 Deployment

If you deploy the backend somewhere public (Render, Railway, Fly.io, a VPS,
etc.), update `frontend/.env`'s `VITE_API_URL` to that backend's real
public URL before building the frontend — `127.0.0.1` only ever means
"this computer," so it will not work for real visitors once deployed.

---

Created for a better tomorrow.
