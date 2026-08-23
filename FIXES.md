# What was fixed

## 1. Scrolling past the login page
`CinematicLanding` uses a tall (`600vh`) scroll-driven container to animate through
4 sections, with the login card (section 4) reaching full opacity at 80% of that
scroll distance. That left an extra ~20% of empty scroll space *after* the login
card where nothing changed, so you could keep scrolling and see the fixed 3D
background around/behind it.

Fixed in `frontend/src/App.jsx`:
- Shrunk the scroll container to `480vh` and rescaled all the section
  breakpoints so the login card reaches full view exactly at the bottom of the
  page — there's no extra scroll room left after it.
- Added `overscroll-behavior: none` on `html`/`body` so trackpad/mobile
  "rubber-band" bounce past the end of the page no longer reveals anything
  behind the content.

## 2. General site lagginess
The biggest offender was `NeuralParticles` (part of the always-mounted 3D
background): every animation frame it ran an O(n²) distance check over 100
particles **and allocated a brand new `Float32Array` + `BufferAttribute`** to
show connecting lines — 60 times a second, on every single page. That's a lot
of constant garbage collection and object churn, which shows up as jank.

Fixed in `frontend/src/App.jsx`:
- The line-buffer is now mutated in place and reused every frame instead of
  being reallocated — the biggest win.
- The connection check now compares squared distances (no `Math.sqrt` per
  pair) and only runs every other frame, since the effect is visually
  identical but is the single most expensive part of the scene.

## 3. Laggy AI chat
In `backend/main.py`, the `/chat` endpoint is declared `async def` but called
the *blocking* `requests.post(...)` directly inside it. In FastAPI's
single-threaded event loop, a blocking call like this freezes the **entire
server** — every user, every request — for as long as the AI call takes
(which can be several seconds on the free OpenRouter model). That's what made
the AI integration feel laggy, and could make the rest of the app feel
unresponsive at the same time.

Fixed:
- The call now runs via `asyncio.to_thread(...)`, so it executes in a worker
  thread and the event loop stays free.
- Added a 30s timeout server-side so a stalled OpenRouter request fails fast
  with a friendly message instead of hanging indefinitely.
- On the frontend, the chat `fetch` now has a 35s `AbortController` timeout
  too, so the "thinking..." spinner can't get stuck forever if something goes
  wrong.

## 4. Simplified 3D background (extra reliability)
The DNA helix mesh grid (160+ individual animated spheres/cylinders) was disabled
in `App.jsx` — it now returns `null` instead of rendering — while the particle
field (`NeuralParticles`) stays active and optimized. This removes the heaviest
part of the 3D scene, which is the safest way to rule out GPU/driver-related
rendering issues (e.g. blank/white canvas on some machines) while keeping the
background effect. The original full version is saved as
`frontend/src/App_3D_VERSION.jsx` if you want to restore it later — just copy
its contents into `App.jsx`.

## Note on `node_modules` / `.venv`
This zip does **not** include `frontend/node_modules`, `.venv`, or `venv` —
they're large, platform-specific, and regenerable. To run:

```bash
cd frontend && npm install && npm run dev
cd backend && python -m venv venv && venv/Scripts/activate  # or source venv/bin/activate on mac/linux
pip install fastapi uvicorn python-dotenv requests python-multipart
uvicorn main:app --reload
```

Your `backend/.env` (with your OpenRouter key) is included as-is.

## Running it
You need **two terminals running at the same time**:
1. `backend` folder → `uvicorn main:app --reload` → serves http://127.0.0.1:8000
2. `frontend` folder → `npm run dev` → serves http://localhost:5173

Open **http://localhost:5173** in your browser once both show no errors.
If `npm run dev` isn't printing a `Local: http://localhost:5173/` line, the
dev server isn't running yet — that's why the browser shows a 404, not
because of a code bug.
