# Creator Platform - 1 Hour Coding Challenge

**Goal**: Build a protected creator profile page with authentication and Express middleware.

## Architecture

This project has **two separate applications** (like our production setup):
- **Frontend**: Next.js app in `/next`
- **Backend**: Express API in `/backend`

---

## Your 4 Tasks

### 1️⃣ Auth Context (10 min)
**File**: `next/src/contexts/AuthContext.tsx`

Complete the `login` and `logout` functions:
- `login`: Accept any email/password, create a User object with email, store in state
- `logout`: Clear the user state

Example: `setUser({ email })`

### 2️⃣ Login Page (10 min)
**File**: `next/src/app/login/page.tsx`

Complete `handleSubmit`:
- The `email` and `password` are already in state (no need to use `e.target`)
- Call `login(email, password)` from auth context
- Use try/catch to handle errors and call `setError()`
- On success, redirect to `/creator/sarah_designs` using `router.push()`

### 3️⃣ Express Middleware (15 min) 🔥
**File**: `backend/src/middleware/validateUsername.ts`

Create a validation middleware for the Express API (the backend server on port 3001):
- Validate that the `username` parameter is not empty
- If invalid: return 400 error response
- If valid: call `next()` to continue

**Then apply it**: In `backend/src/routes/creators.ts`, apply the middleware to protect the GET route
- This will validate usernames BEFORE the route handler runs
- Example: `router.get("/:username", validateUsername, handler)`

### 4️⃣ Protected Profile Page (25 min)
**File**: `next/src/app/creator/[username]/page.tsx`

**Auth & Data**:
- Check if user is authenticated, redirect to `/login` if not
- Fetch creator data from Express backend: `http://localhost:3001/api/creators/[username]`
  - This calls the backend API you protected with middleware in Task 3
- Handle loading/error states

**Display** (simple layout):
- Name and username (@username)
- Bio
- Follower count
- Logout button
- Basic Tailwind styling

---

## Resources

**Test Usernames**: `sarah_designs`, `tech_mike`, `fitness_emma`, `chef_marco`, `music_alex`

**Types**: 
- Frontend: `next/src/types/creator.ts`
- Backend: `backend/src/types.ts`

**Mock Data**: `backend/src/mockData.ts`

**Auth Hook**: `useAuth()` provides `{ user, isAuthenticated, login, logout }`

**Express API**: `GET http://localhost:3001/api/creators/:username`

---

## Testing Flow

1. Start both servers (backend + frontend)
2. Go to http://localhost:3000
3. Click "Try Creator Profile" → should redirect to login
4. Login with any email/password
5. Should see creator profile with all data
6. Try invalid username (with special chars) → should see validation error
7. Logout button should clear auth

---

## Tips

✅ Read TODO comments in each file  
✅ Test frequently (save & refresh browser)  
✅ Start with: auth context → login → **Express middleware** → profile page  
✅ Express middleware uses `req`, `res`, `next` - just like real Express apps  
✅ Remember to **apply** the middleware to the route!

**Need help?** Ask your interviewer!
