# Blastoff, Full-Stack Interview

Welcome. This interview runs about **70 minutes**: architecture whiteboard (~20 min), then coding without AI, then coding with AI. Setup instructions and problem descriptions are below. Your interviewer will walk you through each part when we get there.

**Before the interview:** make sure your AI tool of choice (Cursor, Claude Code, etc.) is installed and ready to go. You'll need it for Part 2.

---

## Format

| Part | AI | What you'll do |
|---|---|---|
| **Part 0** (~20 min) | N/A | Whiteboard a system design — boxes and arrows, no code |
| **Part 1** (~27 min) | Off | Read the existing app, add a feature, debug a reported issue |
| **Part 2** (~12 min) | On | Diagnose and fix a focused standalone problem |

---

## Part 0, Architecture Whiteboard

A shared whiteboard exercise (Excalidraw or similar). You'll design how to refresh metrics for 80k creator profiles on a 24h cycle, with sync and async vendor calls, rate limits, and Cloud Run constraints.

Full problem statement: [`part-0-whiteboard/README.md`](part-0-whiteboard/README.md)

No repo setup — your interviewer shares the canvas at the start of this block.

---

## Part 1, Creator Content List

A small full-stack app (Express backend, Next.js frontend) that lists creator content with filtering and pagination. Part 1 has three phases, in order.

### Setup

Open **two terminals**:

```bash
# Terminal 1
cd backend
npm install
npm run dev
# → http://localhost:3001
```

```bash
# Terminal 2
cd next
npm install
npm run dev
# → http://localhost:3000
```

Main page: `http://localhost:3000/content`

### Architecture

- **Backend**, Express + TypeScript in `/backend` (port 3001)
- **Frontend**, Next.js 15 + TypeScript + Tailwind in `/next` (port 3000)

### Phase 1 - Walkthrough (~5-7 min)

Read through the code, then walk your interviewers through how it works: the backend, the frontend, and how data flows between them. You don't need to explain every line, just the general shape.

### Phase 2 - Feature (~10-12 min)

Add a platform filter alongside the existing category filter. Each content item already has a `platform` field (YouTube, Instagram, TikTok, X). A user should be able to filter by both at the same time, for example all Tech content on YouTube. Touch whatever layers you need to.

### Phase 3 - Debug (~10-12 min)

There is a bug in the app. To reproduce it:

1. Open `http://localhost:3000/content`
2. Click through the category pills as fast as you can: Design, Tech, Fitness, Food, Music, repeat
3. Watch the content list

You should see the list flash incorrect results - settling on content from a category you didn't end up on. Find and fix the cause. The bug is not in the category pill UI.

---

## Part 2, Batch Worker Production Bug

A single self-contained file in `part-2-problems/`. It simulates a production batch system over a deterministic 24h compressed run. Some tasks are being processed more than once, and a handful never finish in the window. Find the cause(s) and fix.

### Setup

```bash
cd part-2-problems
npm install
```

### Run

```bash
npm run batch     # → batch-worker.ts
```

Read the problem header at the top of `batch-worker.ts` for context and acceptance criteria, run the simulator, and iterate against the metrics.
