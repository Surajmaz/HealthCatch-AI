# Bug-fix + feature-completion pass

## How this was actually verified (important)
Earlier rounds I could only eyeball brace/paren counts. This round I found
real tooling already sitting in this sandbox (esbuild + a fully configured
ESLint with `eslint-plugin-react-hooks`) and used it properly:

- **esbuild** actually parses and compiles the JSX — this is a real syntax
  check, not a heuristic. The final file compiles cleanly (182kb output, 0
  errors).
- **ESLint** (using this project's own `eslint.config.js`) went from **43
  problems down to 16** after this pass. The remaining 16 are explained
  below — none of them are functional bugs.
- I do **not** have a live browser here, so I still can't click through every
  flow myself. Run `npm run build` (or `npm run lint`) yourself once you have
  this — it'll catch anything specific to your environment.

## Bugs found and fixed this round

1. **Duplicate `useState` declaration** (`bookedDoctors`/`purchasedItems`
   declared twice) — this was a bug *I* introduced mid-session; caught by
   the audit before it shipped. Removed the duplicate.
2. **Mismatched/unclosed `<div>`** in the Health Circle tab — a real
   JSX structural bug from an earlier edit that would have failed to build.
   Traced the exact nesting and added the missing closing tag. This is the
   one esbuild caught directly (see conversation).
3. **`ref.current` read during render** (×2, in both scroll rails) — reading
   a ref's value directly in a render-time style object is unreliable
   because ref changes don't trigger re-renders, so the displayed value can
   lag behind reality. Both now read the `isDragging` **state** variable
   instead, which was already being tracked correctly alongside the ref.
4. **Dead/duplicate state removed:** `healthMode` (declared, never used
   anywhere), `joinedGroups`/`toggleJoinGroup` (duplicate — Health Groups
   already had its own working local state), `profilePicRef` (declared,
   never referenced).
5. **13 unused imports removed** (`React` default import, all of `recharts`,
   `HeartPulse`, `Camera`, `Clock3`, `Heart`, `Plus`, `Utensils`, a
   duplicate `Stethoscope` binding that would've been a hard SyntaxError,
   and 2 unused destructured props).
6. **Google login showed a scary "Login Failed!" error** even when you just
   closed the popup. Now only shows an error for actual failures.
7. **Forgot Password was completely missing** — added, using Firebase's
   password reset email.
8. **Signup collected DOB and gender and then threw them away** — Firebase
   Auth has nowhere to store custom fields without adding a database, so
   this data just vanished. Now persisted (localStorage, keyed by user ID)
   and actually used: real age shows on the Health Identity page.
9. **No signup validation** for password length or minimum age — added.

## Features that were visually present but did nothing — now wired up

| Feature | What it does now |
|---|---|
| Like / Follow / Share on posts | Real toggle state, share uses native share sheet or clipboard |
| Post composer | Actually posts to the feed |
| Health Circle sidebar filters (9 of them) | Actually filter the list (used to just highlight item 1 forever) |
| Confirm / Delete / Connect on people cards | Actually update your connections |
| Book Appointment / Join Video Call (Doctors) | Real booked/available state per doctor |
| Apply (Jobs) | Tracks which jobs you've applied to |
| Browse all jobs / Details (Professional Network) | Navigates to the full Jobs tab |
| Edit Profile | Inline-editable tagline, actually saves |
| Buy Now (Market) | Was already working from last round — confirmed still correct |
| Open Demo (utility pages) | These pages are *intentionally* labeled as frontend-only demos (says so on the page) — wired to give honest feedback rather than pretending to do something real |

A global toast notification system (bottom of screen) powers all of the
above feedback — one component, usable from anywhere without prop-drilling.

## What I deliberately did NOT change
ESLint still flags 16 things — I traced every one and left them on purpose:

- **The 3D particle background** (`NeuralParticles`) directly mutates arrays
  inside its animation loop. ESLint flags this as "impure"/"modifies a
  value" — but that's flagging compatibility with React Compiler, which
  this project doesn't use (confirmed: no compiler plugin in
  `package.json`/`vite.config.js`). Mutating typed arrays in a
  react-three-fiber animation loop is the *standard, correct, performant*
  pattern — rewriting it would risk breaking working code for a rule that
  doesn't apply here.
- **3 "setState in effect" warnings** — resetting avatar-fallback state when
  the photo prop changes, closing the mobile drawer on navigation, reading
  a persisted age on mount. All three are ordinary, correct patterns; the
  alternative "fixes" ESLint suggests are more convoluted for no behavioral
  gain.
- **2 "missing dependency" warnings** — both are deliberate: adding the
  suggested dependency would make the effect re-run on every render instead
  of only when intended.

None of these 16 are bugs a user would ever notice — they're all strict,
React-Compiler-era style preferences on code that behaves correctly.

## Honest scope note
I did not personally rewrite/re-verify every single one of the ~2,400 lines
by hand — I used real tooling (a real parser + a real linter with hooks
rules) to catch what a human skim would miss, which is a stronger check than
last round, but "0 bugs" isn't a claim any static review can fully back
without a live browser. If you hit something specific, tell me exactly what
happens and I'll fix it directly.
