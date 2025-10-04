# Creator Platform - 1 Hour Coding Challenge

**Goal**: Build a content viewer with viewing history tracking and Express middleware.

## Architecture

This project has **two separate applications** (like our production setup):
- **Frontend**: Next.js app in `/next`
- **Backend**: Express API in `/backend`

## Quick Start

Open **two terminal windows**:

### Terminal 1 - Backend (Express):
```bash
cd backend
npm install
npm run dev
```
Backend runs on http://localhost:3001

### Terminal 2 - Frontend (Next.js):
```bash
cd next
npm install
npm run dev
```
Frontend runs on http://localhost:3000

Then visit http://localhost:3000

---

## What You're Building

### 📊 Viewing History Tracker (Home Page)

The home page displays a table that tracks **how many times** you've viewed each post:

**Initial State (no posts viewed yet):**
```
┌─────────────────────────────────────────────┐
│ 📊 Viewing History Tracker                  │
├─────────────────────────────────────────────┤
│ Click any post below to start tracking     │
│ your viewing history!                       │
└─────────────────────────────────────────────┘
```

**After viewing: 101 (once), 102 (three times), 105 (once):**
```
┌─────────────────────────────────────────────┐
│ 📊 Viewing History Tracker    [Clear history]│
├─────────────────────────────────────────────┤
│ ┌──────────┬─────────────┐                  │
│ │ Post ID  │ View Count  │                  │
│ ├──────────┼─────────────┤                  │
│ │  101     │      1      │                  │
│ │  102     │      3      │                  │
│ │  105     │      1      │                  │
│ └──────────┴─────────────┘                  │
│                                             │
│ Total views: 5 across 3 posts              │
└─────────────────────────────────────────────┘
```

**On the content page itself:**
- Shows YOUR personal view count from context (e.g., "You've viewed this post 3 times")
- Post details from backend (title, creator, description, date, category)

---

## Your 3 Tasks

### 1️⃣ Viewing History Context (15 min)
**File**: `next/src/contexts/ViewingHistoryContext.tsx`

**What it does**: Powers the "📊 Viewing History Tracker" table on the home page (see visual above).

Complete three functions to track view counts:
- `addToHistory(postId)`: Increment the view count for this postId
  - If post hasn't been viewed yet, add it with count of 1
  - If post exists, increment its count by 1
- `clearHistory()`: Empty the viewHistory array
- `getViewCount(postId)`: Return the number of times this post has been viewed (0 if never viewed)

Example structure:
```typescript
// Store as: [{ postId: 101, count: 3 }, { postId: 102, count: 1 }]
const addToHistory = (postId: number) => {
  const existing = viewHistory.find(item => item.postId === postId);
  if (existing) {
    // Increment count for existing post
    setViewHistory(viewHistory.map(item => 
      item.postId === postId ? { ...item, count: item.count + 1 } : item
    ));
  } else {
    // Add new post with count 1
    setViewHistory([...viewHistory, { postId, count: 1 }]);
  }
};
```

**Test it**: The table should update with view counts as you click posts!

### 2️⃣ Express Middleware (15 min) 🔥
**File**: `backend/src/middleware/validatePostId.ts`

**What it does**: The backend serves content data and validates requests using Express middleware.

Create a validation middleware for the Express API (the backend server on port 3001):
- Validate that the `postId` parameter is a valid number
- Check if it's positive (greater than 0)
- If invalid (not numeric, negative, or zero): return 400 error response
- If valid: call `next()` to continue

**Then apply it**: In `backend/src/routes/content.ts`, apply the middleware to protect the GET route
- This will validate post IDs BEFORE the route handler runs
- Example: `router.get("/:postId", validatePostId, handler)`

**Purpose**: Backend only serves content (title, description, etc.) and validates. It does NOT track view counts.

### 3️⃣ Content Page with History (30 min)
**File**: `next/src/app/content/[postId]/page.tsx`

**What it does**: This is the page users see when they click a post ID. It fetches content from the backend and tracks the view count.

**Data & History**:
- Fetch content from Express backend: `http://localhost:3001/api/content/[postId]`
  - This calls the backend API you protected with middleware in Task 2
- When content loads successfully, call `addToHistory(Number(postId))`
  - This updates the view count in the "📊 Viewing History Tracker" table!
- Handle loading/error states

**Display** (simple layout):
- **From API**: Post title, creator name, description, published date, category
- **From context**: 
  - "You've viewed this post X time(s)" using `getViewCount(Number(postId))`
  - "Total views across all posts: Y" using `viewHistory.reduce((sum, item) => sum + item.count, 0)`
- Back to home button
- Basic Tailwind styling

**Simple architecture**: Backend serves content → Frontend context tracks your viewing behavior

**The full loop**: Click post → API validates → Content loads → View count increments → Return home to see table updated!

---

## Resources

**Test Post IDs**: `101`, `102`, `103`, `104`, `105`

**Types**: 
- Frontend: `next/src/types/creator.ts` (Content interface)
- Backend: `backend/src/types.ts` (Content interface)

**Mock Data**: `backend/src/mockData.ts`

**History Hook**: `useViewingHistory()` provides:
```typescript
{
  viewHistory: Array<{ postId: number; count: number }>,
  addToHistory: (postId: number) => void,
  clearHistory: () => void,
  getViewCount: (postId: number) => number
}
```

**Express API**: `GET http://localhost:3001/api/content/:postId`

---

## Testing Flow - Visual Journey

### Step-by-Step with Expected UI:

**1. Start both servers & visit home page**
```
Home Page (http://localhost:3000)
┌──────────────────────────────────────────────┐
│ Creator Platform - Interview Challenge      │
│                                              │
│ 📊 Viewing History Tracker                   │
│ Click any post below to start tracking      │
│ your viewing history!                        │
│                                              │
│ 📝 Available Content Posts                   │
│ [101] [102] [103] [104] [105]               │
└──────────────────────────────────────────────┘
```

**2. Click post "101" → Content page loads**
```
Content Page (/content/101)
┌──────────────────────────────────────────────┐
│ 10 Tips for Better UI Design                │
│ by Sarah Chen | Design                      │
│ 📅 Published: Jan 15, 2024                  │
│ (↑ from backend API)                        │
│                                              │
│ Learn the fundamental principles of         │
│ creating beautiful and functional UIs...    │
│                                              │
│ ───────────────────────────────────────────  │
│ 📊 Your Viewing Stats (from context):       │
│ • You've viewed this post 1 time            │
│ • Total views across all posts: 1           │
│                                              │
│ [← Back to Home]                            │
└──────────────────────────────────────────────┘
```

**3. Navigate back home → Table now shows post 101!**
```
Home Page (http://localhost:3000)
┌──────────────────────────────────────────────┐
│ 📊 Viewing History Tracker    [Clear history]│
│ ┌──────────┬─────────────┐                   │
│ │ Post ID  │ View Count  │                   │
│ ├──────────┼─────────────┤                   │
│ │  101     │      1      │                   │
│ └──────────┴─────────────┘                   │
│ Total views: 1 across 1 post                │
│                                              │
│ 📝 Available Content Posts                   │
│ [101] [102] [103] [104] [105]               │
└──────────────────────────────────────────────┘
```

**4. Click post "102", then click "101" again, return home**
```
Home Page (http://localhost:3000)
┌──────────────────────────────────────────────┐
│ 📊 Viewing History Tracker    [Clear history]│
│ ┌──────────┬─────────────┐                   │
│ │ Post ID  │ View Count  │                   │
│ ├──────────┼─────────────┤                   │
│ │  101     │      2      │  ← Incremented!  │
│ │  102     │      1      │                   │
│ └──────────┴─────────────┘                   │
│ Total views: 3 across 2 posts               │
└──────────────────────────────────────────────┘
```

**5. View post "101" for the third time**
```
Content Page (/content/101)
┌──────────────────────────────────────────────┐
│ 10 Tips for Better UI Design                │
│ by Sarah Chen | Design                      │
│ (backend content - same as always)          │
│                                              │
│ 📊 Your Viewing Stats (from context):       │
│ • You've viewed this post 3 times ← Changed! │
│ • Total views across all posts: 4           │
└──────────────────────────────────────────────┘
```

**6. Test validation: Try `/content/abc` in URL**
```
Content Page (/content/abc)
┌──────────────────────────────────────────────┐
│ ❌ Error: Invalid post ID                   │
└──────────────────────────────────────────────┘
```

### Quick Checklist:
- [ ] Viewing history tracker shows table on home page
- [ ] Clicking a post adds it to table with count = 1
- [ ] Viewing same post again increments its count
- [ ] Viewing multiple posts shows multiple table rows
- [ ] "Clear history" button empties the table
- [ ] Content page shows "You've viewed this post X time(s)"
- [ ] Total view count across all posts calculates correctly
- [ ] Invalid post IDs return 400 error (Express middleware working)

---

## Tips

✅ Read TODO comments in each file  
✅ Test frequently (save & refresh browser)  
✅ Start with: viewing history context → **Express middleware** → content page  
✅ Remember to call `addToHistory()` when content loads successfully  
✅ Use array methods: `.includes()`, spread operator `[...]`  
✅ Express middleware uses `req`, `res`, `next` - just like real Express apps  
✅ Remember to **apply** the middleware to the route!

**Need help?** Ask your interviewer!
