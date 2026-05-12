# Blastoff, Full-Stack Interview

Welcome. This repo is a small full-stack app you'll be working with during the interview. Your interviewer will walk you through everything verbally, you don't need to read more than this to get started.

---

## Architecture

Two apps that mirror Blastoff's production setup:

- **Backend**, Express + TypeScript in `/backend` (port 3001)
- **Frontend**, Next.js 15 + TypeScript + Tailwind in `/next` (port 3000)

---

## Running

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

Once both are up, the main page is at `http://localhost:3000/content`.

The `part-2-problems/` folder is a separate set of standalone exercises, see its own README for setup.
