# 🚀 Quick Start Guide

## For Interviewers

### First Time Setup:
```bash
# Install all dependencies
cd backend && npm install
cd ../next && npm install
cd ..
```

### Start Interview:
Open **two terminal windows**:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Should see: `🚀 Backend server running on http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd next
npm run dev
```
Should see: Next.js running on `http://localhost:3000`

### Verify Setup:
- http://localhost:3001/health → Should return `{"status":"ok"}`
- http://localhost:3000 → Should load the app

---

## For Candidates

1. Read the `README.md` file
2. Follow the Quick Start instructions
3. Start coding! Read the TODO comments in each file

---

## File Structure

```
/backend          - Express API server
  /src
    /middleware   - Express middleware (validateUsername task here)
    /routes       - API routes (apply middleware here)
    mockData.ts   - Mock creator data
    server.ts     - Express app setup

/next             - Next.js frontend  
  /src
    /app          - Next.js pages
    /contexts     - Auth context (login/logout task here)
    /types        - TypeScript types

README.md         - Candidate instructions
INTERVIEW_GUIDE.md - Interviewer evaluation guide
SOLUTION.md       - Complete solution (interviewers only)
```

---

## Troubleshooting

**Port already in use:**
- Kill process on port 3000: `lsof -ti:3000 | xargs kill -9`
- Kill process on port 3001: `lsof -ti:3001 | xargs kill -9`

**CORS errors:**
- Make sure backend is running first
- Check backend console for errors

**TypeScript errors:**
- Run `npm install` in both `/backend` and `/next`

---

## Testing the Solution

After candidate completes:

```bash
# Test valid username
curl http://localhost:3001/api/creators/sarah_designs

# Test invalid username (should return 400)
curl http://localhost:3001/api/creators/test@user

# Test the full flow in browser
http://localhost:3000
```

