# URL Shortener

A full-stack URL shortener that converts long URLs into short, shareable links. Built with **Node.js**, **Express**, **MongoDB**, and plain **HTML/CSS/JS**.

---

## How It Works (Simple Version)

1. You paste a long URL (like `https://example.com/some/really/long/path`)
2. The backend generates a unique short ID (like `3kT9xP`)
3. It saves the mapping (short ID → original URL) in MongoDB
4. You get back a short link (like `http://localhost:8000/3kT9xP`)
5. When someone visits that short link, the server looks up the original URL and redirects them

---

## Features

### 1. Snowflake ID Generation
**What:** Instead of using a simple counter (1, 2, 3...) or random strings, we use a Snowflake algorithm to generate unique IDs.

**Why:** 
- A counter needs a central database to keep track → slow, single point of failure
- Random strings can collide (two URLs get the same ID) → broken links
- Snowflake generates IDs based on **timestamp + machine ID + sequence number**, so:
  - IDs are always unique (no collisions)
  - No database needed for ID generation (fast)
  - You can run multiple servers and they won't clash (scalable)

**File:** `backend/src/utils/snowflake.js`

### 2. Base62 Encoding
**What:** Converts the numeric Snowflake ID into a short string using characters `0-9`, `A-Z`, `a-z`.

**Why:**
- A Snowflake ID is a huge number (like `7345982347283456`)
- Base62 compresses it into something short and URL-safe (like `3kT9xP`)
- 62 characters = maximum shortness while staying readable (no special characters)

**File:** `backend/src/utils/base62.js`

### 3. Click Tracking & Analytics
**What:** Every time someone visits a short URL, we record the click count, timestamp, IP, and browser info.

**Why:**
- Useful to know how many people clicked your link
- Analytics data is stored per-click so you could build dashboards later
- Uses MongoDB's `$inc` (atomic increment) so click counts stay accurate even under heavy traffic

**File:** `backend/src/controllers/url.controller.js`

### 4. 302 Redirect (Not 301)
**What:** When someone visits a short URL, the server responds with HTTP status `302` (temporary redirect).

**Why:**
- `301` (permanent redirect) gets cached by browsers → subsequent visits skip the server entirely → we can't track clicks
- `302` (temporary redirect) makes the browser ask the server every time → we can count every click

### 5. Error Handling
**What:** Custom `ApiError` class and a central error-handling middleware.

**Why:**
- Without it, any unhandled error crashes the server
- Custom error class lets us send clean error responses like `{ success: false, message: "URL not found" }` instead of ugly stack traces
- The `asyncHandler` wrapper catches promise rejections automatically

**Files:** `backend/src/utils/ApiError.js`, `backend/src/utils/asyncHandler.js`

### 6. Frontend with Local History
**What:** A clean HTML/CSS/JS frontend that stores your recently shortened URLs in `localStorage`.

**Why:**
- No login needed — your history stays in your browser
- Simple and fast (no React/Vue overhead)
- Responsive design works on mobile too

**Files:** `frontend/index.html`, `frontend/style.css`, `frontend/script.js`

---

## Project Structure

```
url-shortner/
├── readme.md
├── backend/
│   ├── package.json
│   ├── .env.sample          # Environment variable template
│   └── src/
│       ├── index.js          # Server entry point
│       ├── app.js            # Express app setup (middleware, routes)
│       ├── constants.js      # DB name constant
│       ├── controllers/
│       │   └── url.controller.js   # Shorten + Redirect logic
│       ├── db/
│       │   └── index.js      # MongoDB connection
│       ├── models/
│       │   └── url.js        # Mongoose schema for URLs
│       ├── routes/
│       │   ├── url.routes.js     # POST /api/v1/url/shorten
│       │   └── index.routes.js   # GET /:shortId (redirect)
│       └── utils/
│           ├── ApiError.js       # Custom error class
│           ├── ApiResponse.js    # Standard response format
│           ├── asyncHandler.js   # Async wrapper for controllers
│           ├── base62.js         # Base62 encoding/decoding
│           └── snowflake.js      # Unique ID generator
└── frontend/
    ├── index.html
    ├── style.css
    └── script.js
```

---

## Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)

### 1. Clone the repo
```bash
git clone <repo-url>
cd url-shortner
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:
```env
PORT=8000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net
CORS_ORIGIN=*
MACHINE_ID=1
```

Start the server:
```bash
npm run dev
```

### 3. Open Frontend
Just open `frontend/index.html` in your browser. No build step needed.

Or serve it with any static server:
```bash
npx serve frontend
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/url/shorten` | Shorten a URL |
| GET | `/:shortId` | Redirect to original URL |

### Shorten URL
```bash
curl -X POST http://localhost:8000/api/v1/url/shorten \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://github.com"}'
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "shortUrl": "http://localhost:8000/3kT9xP",
    "shortId": "3kT9xP",
    "originalUrl": "https://github.com"
  },
  "message": "URL shortened successfully",
  "success": true
}
```

---

## Tech Stack

| Technology | Why |
|------------|-----|
| **Express** | Lightweight web framework, easy to learn, huge community |
| **MongoDB + Mongoose** | Flexible schema, great for storing URL documents, easy indexing |
| **Snowflake IDs** | Distributed unique ID generation without a central counter |
| **Base62** | Compact URL-safe encoding (no special characters) |
| **Vanilla JS Frontend** | No build tools needed, fast to load, easy to understand |

---

## What Makes This Scalable

1. **No counter in the database** → ID generation is local to each server
2. **Machine ID support** → Run multiple server instances with different `MACHINE_ID` values
3. **Indexed database lookups** → `shortId` field is indexed for O(log N) reads
4. **Atomic click updates** → `$inc` operator prevents race conditions
5. **Stateless API** → Any request can go to any server (load balancer friendly)
