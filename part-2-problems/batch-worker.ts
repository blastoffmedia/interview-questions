/**
 * PROBLEM, Batch Worker — Production Bug
 *
 * PRODUCTION CONTEXT
 *   Once a day we batch-process a list of tasks, one per creator. The
 *   system has two moving parts, both in this file:
 *
 *     1. CRON, fires every 3h (8 ticks/day).
 *     2. WORKER, invoked by each tick. Concurrency 1 per tick (the platform
 *        only gives us one process). It claims tasks one at a time, runs
 *        `doWork` on each, completes them, and exits when either the queue
 *        is empty or the tick's HTTP budget runs out (the platform kills
 *        the process at that point).
 *
 *   The DB is an in-memory `Map` here. In production it's Postgres.
 *
 * PRODUCTION SYMPTOMS (last night's run)
 *   - The job ledger has more rows than tasks completed; downstream
 *     reports are over-counting.
 *   - A handful of tasks never finished in the 24h window
 *     (status='leased' at end of day).
 *
 * YOUR TASK
 *   Find the cause(s) and ship a fix. The simulator at the bottom replays
 *   a deterministic 24h compressed run with seed=42 and prints the same
 *   metrics ops sees in production. Iterate against it.
 *
 *   Acceptance:
 *     ledger_entries == tasks_completed
 *     leased_at_end == 0
 *     sla_hit_24h == true
 *
 * Run:    npm run batch
 */

// ---------- config ----------------------------------------------------------

const CONFIG = {
  TOTAL_TASKS: 60,
  FAILURE_RATE: 0.07,
  TASK_DURATION_MIN_MIN: 8,
  TASK_DURATION_MAX_MIN: 22,

  CRON_INTERVAL_HOURS: 3, // 8 ticks/day
  TICK_BUDGET_MIN: 175, // platform kills the process at this point
  LEASE_TIMEOUT_MIN: 30, // how long a claim is considered fresh

  SIM_HORIZON_HOURS: 24,
  RNG_SEED: 42,
};

// ---------- types -----------------------------------------------------------

interface Task {
  id: number;
  creator_id: string;
}

interface TaskRow {
  task: Task;
  status: "pending" | "leased" | "done";
  attempts: number;
  lease_expires_at: number | null;
}

interface LedgerEntry {
  task_id: number;
  creator_id: string;
  processed_at_min: number;
}

// ---------- seeded RNG (mulberry32) -----------------------------------------

function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- in-memory queue -------------------------------------------------

function makeQueue(tasks: Task[]) {
  const rows: TaskRow[] = tasks.map(task => ({
    task,
    status: "pending",
    attempts: 0,
    lease_expires_at: null,
  }));

  return {
    dequeue(now_min: number): Task | null {
      const row = rows.find(r => r.status === "pending");
      if (!row) return null;
      row.status = "leased";
      row.attempts += 1;
      row.lease_expires_at = now_min + CONFIG.LEASE_TIMEOUT_MIN;
      return row.task;
    },
    complete(id: number) {
      const row = rows.find(r => r.task.id === id);
      if (row) {
        row.status = "done";
        row.lease_expires_at = null;
      }
    },
    release(id: number) {
      const row = rows.find(r => r.task.id === id);
      if (row) {
        row.status = "pending";
        row.lease_expires_at = null;
      }
    },
    reapStale(now_min: number): number {
      let reaped = 0;
      for (const row of rows) {
        if (row.status === "leased" && row.lease_expires_at !== null && row.lease_expires_at <= now_min) {
          row.status = "pending";
          row.lease_expires_at = null;
          reaped += 1;
        }
      }
      return reaped;
    },
    stats() {
      return {
        pending: rows.filter(r => r.status === "pending").length,
        leased: rows.filter(r => r.status === "leased").length,
        done: rows.filter(r => r.status === "done").length,
      };
    },
  };
}

type Queue = ReturnType<typeof makeQueue>;

// ---------- the work --------------------------------------------------------
// doWork is invoked by the worker for each claimed task. It writes one row
// to the job ledger and occasionally throws a transient error to model
// network/db flakes.

const ledger: LedgerEntry[] = [];

function doWork(task: Task, now_min: number, rng: () => number): number {
  const duration_min =
    CONFIG.TASK_DURATION_MIN_MIN +
    Math.floor(rng() * (CONFIG.TASK_DURATION_MAX_MIN - CONFIG.TASK_DURATION_MIN_MIN + 1));

  ledger.push({
    task_id: task.id,
    creator_id: task.creator_id,
    processed_at_min: now_min,
  });

  if (rng() < CONFIG.FAILURE_RATE) {
    throw new Error(`transient failure on task ${task.id}`);
  }

  return duration_min;
}

// ---------- worker ----------------------------------------------------------
// One worker invocation = one cron tick. Drains the queue until either it's
// empty or we hit the tick budget (at which point the platform kills us).

interface TickStats {
  processed: number;
  failed: number;
  killed: boolean;
}

function processTick(tickStart_min: number, queue: Queue, rng: () => number): TickStats {
  let now_min = tickStart_min;
  const tickEnd_min = tickStart_min + CONFIG.TICK_BUDGET_MIN;
  const stats: TickStats = { processed: 0, failed: 0, killed: false };

  while (now_min < tickEnd_min) {
    const task = queue.dequeue(now_min);
    if (!task) break;

    try {
      const duration = doWork(task, now_min, rng);
      now_min += duration;

      if (now_min > tickEnd_min) {
        // Platform killed the process mid-task; we never reach `complete`.
        stats.killed = true;
        return stats;
      }

      queue.complete(task.id);
      stats.processed += 1;
    } catch {
      now_min += 1; // small cost for the failed attempt
      queue.release(task.id);
      stats.failed += 1;
    }
  }

  return stats;
}

// ---------- simulator -------------------------------------------------------

function simulate() {
  const rng = makeRng(CONFIG.RNG_SEED);

  const tasks: Task[] = Array.from({ length: CONFIG.TOTAL_TASKS }, (_, i) => ({
    id: i + 1,
    creator_id: `creator-${String(i + 1).padStart(3, "0")}`,
  }));
  const queue = makeQueue(tasks);

  ledger.length = 0;

  const horizon_min = CONFIG.SIM_HORIZON_HOURS * 60;
  const tickInterval_min = CONFIG.CRON_INTERVAL_HOURS * 60;

  let ticksFired = 0;
  let ticksKilled = 0;
  let totalProcessed = 0;
  let totalFailed = 0;

  for (let tickStart = 0; tickStart < horizon_min; tickStart += tickInterval_min) {
    const stats = processTick(tickStart, queue, rng);
    ticksFired += 1;
    if (stats.killed) ticksKilled += 1;
    totalProcessed += stats.processed;
    totalFailed += stats.failed;
  }

  const final = queue.stats();
  const slaHit = final.done === CONFIG.TOTAL_TASKS;
  const expectedLedger = CONFIG.TOTAL_TASKS;
  const duplicates = ledger.length - final.done;

  console.log("=== Batch run complete (24h simulated, seed=" + CONFIG.RNG_SEED + ") ===");
  console.log("");
  console.log("  ticks_fired:                  " + ticksFired);
  console.log("  ticks_killed_by_budget:       " + ticksKilled);
  console.log("  tasks_attempted:              " + (totalProcessed + totalFailed));
  console.log("  tasks_failed_transient:       " + totalFailed);
  console.log("");
  console.log("  job_table.done:               " + final.done + " / " + CONFIG.TOTAL_TASKS + "  " + (slaHit ? "OK" : "MISS"));
  console.log("  job_table.pending_at_end:     " + final.pending);
  console.log("  job_table.leased_at_end:      " + final.leased + "  " + (final.leased === 0 ? "OK" : "ORPHANED"));
  console.log("");
  console.log("  ledger_entries:               " + ledger.length + " (expected " + expectedLedger + ")  " + (duplicates === 0 ? "OK" : "DUPLICATES=" + duplicates));
  console.log("");
  console.log("  sla_hit_24h:                  " + slaHit);

  if (duplicates > 0) {
    const dupCreators = new Map<string, number>();
    for (const entry of ledger) {
      dupCreators.set(entry.creator_id, (dupCreators.get(entry.creator_id) ?? 0) + 1);
    }
    const offenders = [...dupCreators.entries()].filter(([, n]) => n > 1).slice(0, 5);
    if (offenders.length > 0) {
      console.log("");
      console.log("  first 5 duplicated creators:");
      for (const [cid, n] of offenders) {
        console.log("    " + cid + "  -> " + n + " ledger rows");
      }
    }
  }
}

simulate();

export {};
