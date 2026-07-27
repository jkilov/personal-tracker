# Growth OS - Fitness Tracker

**Live Demo:** https://personal-tracker-vert.vercel.app/

A full-stack fitness tracking application that demonstrates backend engineering skills through deterministic scoring, database-level constraints, and server-side validation.

---

## What This Project Shows

Growth OS demonstrates backend architecture with a focus on data integrity and system design:

- **Database Functions & Triggers** - Server-side scoring with automatic recalculation
- **Deterministic Scoring Checks** - A manual verification script confirms recalculation consistency
- **Backend Validation** - Security constraints at the database level
- **API Integration** - Secure third-party API consumption via edge functions
- **Data Aggregation** - Time-series analysis and trend visualization
- **Batch Processing** - Retry logic and idempotency for robustness

---

## Tech Stack

### Frontend
- **React** (functional components, hooks)
- **TypeScript** (type-safe data flows)
- **Recharts** (data visualization)
- **Supabase Client** (real-time auth & queries)

### Backend
- **PostgreSQL** (Supabase)
- **plpgsql** (database functions)
- **Database Triggers** (automatic score recalculation)
- **Supabase Edge Functions** (Deno + TypeScript)

### Infrastructure
- **Vercel** (frontend deployment)
- **Supabase** (database + auth + edge functions)

---

## Core Features

### 1. Workout Logging
Users create sessions, add exercises, and log sets (reps × weight). Frontend validation prevents invalid entries; backend validation enforces constraints at the database level.

### 2. Scoring Engine
**The Technical Highlight:** Deterministic scoring system with rep-range weighting.

```
Total Daily Volume = SUM(reps × weight) for all sets
Adjusted Daily Volume = SUM(reps × weight × rep_multiplier)

Rep Multiplier:
  1-5 reps   → 0.9  (strength focus)
  6-8 reps   → 1.0  (balanced)
  9-12 reps  → 1.1  (hypertrophy - highest)
  13-15 reps → 1.0  (balanced)
  16-20 reps → 0.9  (endurance)
  21+ reps   → 0.8  (cardio)
```

**Implementation:**
- `calculate_daily_scores()` database function computes both metrics
- Trigger on `sets` table (INSERT/UPDATE/DELETE) automatically recalculates
- Backend validation prevents invalid data (reps ≤ 0 rejected at DB level)
- `fitness_scores` table stores daily aggregates for historical tracking
- The full schema — tables, function, triggers, and RLS policies — is committed at [`supabase/schema.sql`](supabase/schema.sql)

**Why this matters:** Server-side scoring prevents client-side manipulation. Triggers ensure scores always reflect current data. Deterministic tests prove consistency.

### 3. Progress Analytics
Three complementary visualizations:

**Volume Progression (Line Chart)**
- Total and adjusted daily volume over time
- Sorted chronologically, shows trends
- Data source: `fitness_scores` table grouped by date

**Body Part Distribution (Radar Chart)**
- Frequency count of sets per body part
- Identifies training imbalances
- Helps with program design decisions

**1 Rep Max Estimation (Bar Chart)**
- Estimated 1RM per exercise using Epley formula: `weight × (1 + reps/30)`
- Exercise selector filters by chosen movement
- Shows maximum estimated strength per session


**Workout History (Calendar)**
- Month view with workout indicators
- Click day to view exercises and sets
- Visual representation of training consistency

---

## Architecture

```
┌─────────────────────────────────────┐
│          React Frontend             │
│  (Auth, Session, Analytics Views)   │
└──────────────┬──────────────────────┘
               │ HTTPS
               ▼
┌─────────────────────────────────────┐
│   Supabase (Authentication)         │
│   - Row Level Security (RLS)        │
│   - JWT-based access control        │
└──────────────┬──────────────────────┘
               │
     ┌─────────┴─────────┐
     ▼                   ▼
┌──────────────┐  ┌────────────────────────┐
│  PostgreSQL  │  │ Edge Functions (Deno)  │
│              │  │ - ExerciseDB API       │
│ Tables:      │  │ - Batch Image Upload   │
│ - user       │  │ - AI Recommendations   │
│ - session    │  │                        │
│ - sets       │  └────────────────────────┘
│ - exercise   │
│ - fitness_   │
│   scores     │
│              │
│ Functions:   │
│ - calculate_ │
│   daily_     │
│   scores()   │
│              │
│ Triggers:    │
│ - update_    │
│   scores     │
└──────────────┘
```

**Key Design Decisions:**

1. **Database Functions over Edge Functions for Scoring**
   - Scoring is data operation, not business logic
   - Runs inside database (faster, no network latency)
   - Automatic via triggers (no client call needed)

2. **Server-Side Validation**
   - Frontend validates for UX (immediate feedback)
   - Backend validates for security (enforced constraints)
   - RAISE EXCEPTION prevents invalid data reaching database

3. **Deterministic Scoring**
   - Same input data always produces same output
   - No randomness, no state mutations
   - Proven via test that inserts data twice and compares results

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20.19+ (required by Vite 7)
- A Supabase project (database, auth, storage, and the edge functions under `supabase/functions/`)

### Install & Run

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

### Environment Variables

Create a `.env` file in the project root (never commit it — it is gitignored):

```bash
VITE_API_URL="https://<your-project-ref>.supabase.co"   # Supabase project URL
VITE_API_KEY="<your-supabase-anon-key>"                 # Supabase anon (public) key
```

The edge functions additionally read `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `RAPID_API_KEY`, and `RAPID_API_HOST` from Supabase function secrets (never from the repo). The operator scripts in `src/scripts/` read `SUPABASE_SERVICE_KEY` (service-role key, local use only) plus, for the determinism script, `TEST_USER_ID`/`TEST_SESSION_ID`/`TEST_EXERCISE_ID`.

### Other Commands

```bash
npm run lint      # ESLint
npm run build     # type check (tsc -b) + production build
npm run preview   # serve the production build locally
```

---

## 🧪 Testing & Validation

### Deterministic Scoring Check (manual)

A manual verification script — not an automated test suite — that checks the scoring trigger recalculates identically for identical input:

```bash
node src/scripts/testFitnessScoreDeterminism.js
```

It requires the env vars listed above (including `TEST_*` ids pointing at real rows in a database you control), writes and deletes real data, and exits non-zero on failure.

**What it does:**
1. Inserts a test set → trigger calculates scores into `fitness_scores`
2. Deletes the derived scores (not the data)
3. Reinserts the same set → trigger recalculates
4. Compares the two calculations; passes only if identical

**Known limitation:** there is no automated test suite (no unit or integration tests, no CI test gate). This script is the only verification tooling.

### Edge Cases Handled
- Empty sessions (0 sets) → no score row created
- Invalid data (reps ≤ 0) → RAISE EXCEPTION at DB level
- Deleted sets → trigger recalculates daily total
- Session ID changes on update → both old and new sessions recalculated

---

## Highlights

- Deterministic business logic at the database layer
- Automatic recalculation via triggers
- Backend validation (can't bypass with DevTools)
- Third-party API integration with error handling
- Time-series data aggregation and visualization

## What's Next

**Potential Enhancements** (deferred for ship speed):
- Personal record tracking with notifications when PRs are broken
- Workout templates (save/reuse common routines)
- Advanced filtering (date ranges, exercise families)
- Progressive overload analysis

These weren't added because the core product (deterministic scoring + analytics) was the priority.
