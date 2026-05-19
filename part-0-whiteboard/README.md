# Part 0 — Architecture Whiteboard

**~20 min · No code · Boxes and arrows** — your interviewer shares a whiteboard (e.g. Excalidraw).

---

## Goal

Design **our** system for refreshing **80,000 creator profiles every 24 hours** using a **third-party vendor API** (we don't scrape platforms ourselves).

Your whiteboard should cover:

- **Store** — what tracks each profile's refresh for the day
- **Schedule** — what starts the daily 80k workload
- **Process** — what picks up work and calls the vendor
- **Failures** — timeouts, retries, deploys, vendor errors
- **Batch execution** — when you reach how a worker runs a batch, be specific (`Promise.all`, `Promise.allSettled`, a queue, Temporal, etc.) and **why** at this scale

---

## Platform limits

- **Cloud Run:** max **600 seconds** per HTTP request — you cannot loop through all 80k profiles in one request
- **Deploys:** containers can be **killed mid-request** (`SIGTERM` / `SIGKILL`)
- **Scale:** ~**55 profiles/minute** average over 24h — design for **many short worker runs**, not one giant job
- **Partial failure:** one bad profile must not block the other 79,999

---

## View counts (`metrics-accumulator`)

We store **`total_views`** per creator in Postgres.

The vendor sends **`views_delta`** — views gained **since yesterday**, not a lifetime total.

On each successful refresh: **`total_views += views_delta`**

A shared **`metrics-accumulator`** library does that update. Both the **sync worker** and the **async webhook handler** call it.

---

## Vendor modes (support both)

**What we're asking the vendor for (every profile, every day):**

Once per 24-hour cycle, for each creator, we need the vendor to tell us **`views_delta`** — how many views that creator gained **since yesterday**. Our workers don't compute that number; the vendor pulls it from YouTube/TikTok/etc. and hands it to us.

The vendor exposes **two APIs** for the same daily request. Some profiles use one, some the other. Your system must support **both** and write results into the **same job table** (`pending` → `in_progress` → `completed` | `failed`).

---

### Sync mode — "give me yesterday's views now"

**What it does:** Our worker asks the vendor for today's daily view count **and waits on the phone** until the vendor answers. The vendor does the platform fetch internally and returns **`views_delta` in the same HTTP response** (~2–5 seconds).

**Flow:**

1. Worker **`POST /v1/refresh`** for `creator_id=X` ("refresh this creator's daily views").
2. Worker **blocks** until vendor responds **`200 OK`** with `{ "views_delta": 12400 }`.
3. Worker calls **`metrics-accumulator`** (`total_views += 12400`), marks job **`completed`**.

**Design for:** worker **dies after step 2 but before step 3** — views may or may not be in our DB; need **retry** and **stuck `in_progress`** recovery (reclaim / lease timeout).

---

### Async mode — "start the daily refresh; call me back"

**What it does:** Same daily request ("what were yesterday's views for this creator?"), but the vendor needs **longer** to finish (heavy accounts, their own rate limits). We **don't wait**. We get a job id, move on, and the vendor **`POST`s our webhook later** with `views_delta`.

**Flow:**

1. Worker **`POST /v1/refresh/async`** for `creator_id=Y`.
2. Vendor immediately returns **`202 Accepted`** + `{ "external_job_id": "abc123" }` — **no `views_delta` yet**.
3. Worker saves **`external_job_id`**, job → **`in_progress`**, **closes** the HTTP request (never block for hours).
4. **30 seconds to 6 hours later**, vendor **`POST`s our webhook** with `{ "external_job_id": "abc123", "views_delta": 12400 }`.
5. **Webhook handler** (separate Cloud Run service) finds the row by `external_job_id`, runs **`metrics-accumulator`**, job → **`completed`**.

**`external_job_id`** is how the webhook knows which daily refresh row to update.

---

## Async webhook behavior (design for these)

**There is no guarantee of exactly-once delivery.** Treat every webhook as **at-least-once**: the same `external_job_id` + `views_delta` payload may hit your endpoint **multiple times**, even after you already returned **`200`**. Your handler must be safe if it runs twice.

Why duplicates happen:

- Vendor policy: if we don't return **`200` within 30s**, they **retry the same callback** up to **5 times** in 24h
- We've seen a **second delivery after we already responded `200`** (retry raced with our response, or their side resent anyway)
- A callback can arrive **before** our worker commits `external_job_id` to the database
- If **we** retry a failed submit, the vendor may issue a **new** `external_job_id`; a webhook for the **old** id can still arrive later

**Impact:** each delivery calls **`metrics-accumulator`** (`total_views += views_delta`). Two deliveries for the same daily refresh **double-count** unless your webhook path prevents it.

---

## Other failures to address

| Issue | What to plan for |
|---|---|
| **HTTP 429** | Vendor rate-limits us — backoff and retry |
| **Dropped / timed-out requests** | No response ≠ success — safe retry story |
| **Worker killed mid-tick** | In-flight work abandoned — reclaim or lease expiry |
| **Stuck `in_progress`** | Row never completes — recovery cron / max attempts → `failed` |

---

## Checklist (on the whiteboard)

1. **Job store** — fields you need (`creator_id`, `external_job_id`, `status`, attempts, timestamps, …)
2. **Scheduler** — how 80k rows get created or marked due each day
3. **Worker tick** — claim a batch, call **sync** or **async** vendor, update state; respect the **600s** deadline
4. **Webhook handler** — correlate on `external_job_id`, call **`metrics-accumulator`**, handle **duplicate** callbacks
5. **Failure paths** — 429s, retries, reclaim, webhook ordering

State assumptions out loud if something is unclear. Your interviewer will keep time and ask follow-ups.
