/**
 * PROBLEM 1, Batch Worker
 *
 * Context:
 *   We run a batch system with 1000 tasks per cycle, each takes ~15 minutes,
 *   workers fail about 7% of the time, and everything must complete within 24h.
 *
 * YOUR TASK:
 *   Implement `processNextTask(queue)`, the inner loop of one worker, given
 *   the `TaskQueue` interface below.
 *
 * Run:    npm run batch
 * Expect: the demo enqueues 50 tasks and runs your worker repeatedly until
 *         the queue drains. The final state should report every task done.
 */

// ---------- types ----------

interface Task {
  id: number;
  payload: string;
}

interface ClaimedTask extends Task {
  attempt: number; // how many times this task has been attempted
}

interface TaskQueue {
  /** Claim the next unleased task (returns null if queue is empty). */
  dequeue(): Promise<ClaimedTask | null>;
  /** Mark a claimed task as successfully completed. */
  complete(id: number): Promise<void>;
  /** Release a claimed task back to the queue so another worker can retry it. */
  release(id: number): Promise<void>;
}

// ---------- stubbed in-memory queue ----------

interface QueueRow {
  task: Task;
  status: "pending" | "leased" | "done";
  attempts: number;
}

function makeQueue(tasks: Task[]): TaskQueue & { stats: () => { done: number; pending: number; leased: number } } {
  const rows: QueueRow[] = tasks.map(task => ({ task, status: "pending", attempts: 0 }));

  return {
    async dequeue() {
      const row = rows.find(r => r.status === "pending");
      if (!row) return null;
      row.status = "leased";
      row.attempts += 1;
      return { ...row.task, attempt: row.attempts };
    },
    async complete(id: number) {
      const row = rows.find(r => r.task.id === id);
      if (row) row.status = "done";
    },
    async release(id: number) {
      const row = rows.find(r => r.task.id === id);
      if (row) row.status = "pending";
    },
    stats() {
      return {
        done: rows.filter(r => r.status === "done").length,
        pending: rows.filter(r => r.status === "pending").length,
        leased: rows.filter(r => r.status === "leased").length,
      };
    },
  };
}

// ---------- stubbed work, randomly fails 7% of the time ----------

const FAILURE_RATE = 0.07;

async function doWork(_task: Task): Promise<void> {
  if (Math.random() < FAILURE_RATE) {
    throw new Error("transient worker failure");
  }
}

// ----------------------------------------------------------------
// YOUR IMPLEMENTATION
// ----------------------------------------------------------------

async function processNextTask(queue: TaskQueue): Promise<void> {
  
  // TODO: implement
  throw new Error("Not implemented");
}

// ----------------------------------------------------------------
// DEMO RUNNER, drains the queue and reports results
// ----------------------------------------------------------------

async function runDemo() {
  const TASK_COUNT = 50;
  const tasks: Task[] = Array.from({ length: TASK_COUNT }, (_, i) => ({
    id: i + 1,
    payload: `payload-${i + 1}`,
  }));

  const queue = makeQueue(tasks);

  let iterations = 0;
  let totalAttempts = 0;

  // Drain the queue. In production you'd have many concurrent workers, here we just loop.
  while (true) {
    const before = queue.stats();
    if (before.done === TASK_COUNT) break;
    if (iterations > 10_000) throw new Error("Stuck loop, bailing");

    await processNextTask(queue);
    iterations += 1;

    const after = queue.stats();
    if (after.done > before.done || after.pending > before.pending) {
      totalAttempts += 1;
    }
  }

  const final = queue.stats();
  console.log(`Done. iterations=${iterations}  attempts=${totalAttempts}  state=${JSON.stringify(final)}`);
  console.log(`Failure rate: ${FAILURE_RATE * 100}%  |  Expected retries: ~${Math.round(TASK_COUNT * FAILURE_RATE / (1 - FAILURE_RATE))}`);
}

runDemo().catch(err => {
  console.error("Demo crashed:", err);
  process.exit(1);
});

export {};
