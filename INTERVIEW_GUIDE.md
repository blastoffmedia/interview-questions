# Interview Guide - For Interviewers

## Overview
1-hour challenge testing Next.js, React, **Express.js**, TypeScript, and Tailwind CSS.

**Architecture**: Two separate apps (mirrors your production setup)
- Backend: Express API (`/backend`)
- Frontend: Next.js app (`/next`)

---

## Before Interview

1. Install dependencies for both apps:
```bash
cd backend && npm install
cd ../next && npm install
```

2. Start both servers:
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2  
cd next && npm run dev
```

3. Verify:
- http://localhost:3001/health → `{"status":"ok"}`
- http://localhost:3000 → Next.js app loads

---

## Time Structure

- **0-5 min**: Read README, setup if needed
- **5-55 min**: Coding (4 tasks)
  - Auth Context (10 min)
  - Login Page (10 min)
  - **Express Middleware (15 min)** ← Key differentiator
  - Profile Page (25 min)
- **55-60 min**: Discussion

---

## What to Watch For

### 🚩 Red Flags
- Doesn't understand Express middleware concept
- Forgets to apply middleware to route
- Ignores TypeScript errors
- Doesn't test their code
- Confused by two-app architecture

### ✅ Green Flags
- Understands req/res/next pattern
- Applies middleware correctly to route
- Tests with valid/invalid usernames
- Comfortable with separate frontend/backend
- Uses TypeScript properly
- Clean code organization

---

## Hints (If Stuck 2-3 min)

**Auth**: "Any email/password works - just do setUser({ email })"

**Login**: "email and password are already in state - just call login(email, password)"

**Express Middleware**: "Check if username is empty, if invalid: res.status(400).json(...), if valid: next()"

**Apply Middleware**: "router.get('/:username', validateUsername, handler)"

**Middleware Example**: "if (!username || username.trim() === '') return res.status(400).json({error: '...'})"

**API URL**: "Backend is at localhost:3001, not Next.js API routes"

**CORS Error**: "Backend already has CORS enabled, should work"

---

## Evaluation Checklist

### Core (Must Complete)
- [ ] Login works
- [ ] **Middleware validates username format correctly**
- [ ] **Middleware applied to Express route**
- [ ] **Middleware rejects invalid usernames (400)**
- [ ] Protected route redirects when not authenticated
- [ ] Data fetches from Express backend (port 3001)
- [ ] Profile displays: name, username, bio, followers, logout
- [ ] No TypeScript/runtime errors

### Strong (Above Expectations)
- [ ] Understands Express patterns (req, res, next)
- [ ] Error handling for validation, network, 404
- [ ] Loading states
- [ ] Clean code structure
- [ ] Tests with various username formats

### Exceptional
- [ ] Explains two-app architecture benefits
- [ ] Additional validation (min length, etc.)
- [ ] Polished UI design
- [ ] Suggests improvements (env vars for API URL, etc.)

---

## Scoring

- **0-5**: Major functionality missing, doesn't understand Express
- **6-7**: Core works, basic Express understanding
- **8-9**: Clean implementation, strong Express knowledge
- **10**: Exceptional - production-quality, deep understanding

---

## Common Issues

| Issue | Cause | Hint |
|-------|-------|------|
| CORS error | Backend not running | Start backend on port 3001 |
| Middleware not working | Not applied to route | Add as 2nd arg: `router.get('/:username', validateUsername, handler)` |
| Can't find req.params | TypeScript confusion | `const { username } = req.params;` |
| Validation always passes | Forgot to check regex | Use `!usernameRegex.test(username)` |
| 404 on valid username | Wrong API URL | Should be `http://localhost:3001/api/creators/${username}` |

---

## Discussion Questions

- "Explain how Express middleware works"
- "Why separate frontend and backend?"
- "How would you deploy this architecture?"
- "What's the difference between this and Next.js API routes?"

---

## Interview Notes

**Candidate**: ________________  **Date**: ________  **Score**: ___ / 10

**Strengths**:

**Express Knowledge**: ☐ Strong  ☐ Moderate  ☐ Weak

**Improvements**:

**Proceed to next round?**: ☐ YES  ☐ NO

