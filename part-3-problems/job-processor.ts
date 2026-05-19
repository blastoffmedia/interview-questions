/**
 * PROBLEM, Metric Refresh Webhooks — Production Bug
 *
 * PRODUCTION CONTEXT
 *   Every day we refresh creator profile metrics from an external vendor.
 *   Each profile gets one polling job. The worker submits a refresh request
 *   to the vendor, and the vendor later calls our webhook with the result.
 *
 *   The system has four moving parts, all modeled in this file:
 *
 *     1. SCHEDULER, creates one refresh job per profile.
 *     2. WORKER, runs every 10 minutes and submits due jobs to the vendor.
 *     3. WATCHDOG, resets in-progress jobs whose webhook never arrived.
 *     4. WEBHOOK HANDLER, receives vendor callbacks and marks jobs complete.
 *
 *   The DB is an in-memory table here. In production it's Postgres.
 *
 * PRODUCTION SYMPTOMS (last night's run)
 *   - Vendor submissions were higher than the number of profiles. Some
 *     profiles were sent to the vendor more than once.
 *   - A few webhook callbacks were logged as "unknown attempt token" even
 *     though the worker had just submitted those jobs.
 *   - Some completed profiles ended with older metric snapshots than the
 *     vendor sent earlier in the run.
 *
 * YOUR TASK
 *   Find the cause(s) and ship a fix. The simulator at the bottom replays
 *   a deterministic compressed run and prints the same metrics ops sees in
 *   production. Iterate against it.
 *
 *   Acceptance:
 *     profiles_completed        == TOTAL_PROFILES
 *     duplicate_vendor_calls    == 0
 *     lost_webhooks             == 0
 *     stale_webhook_overwrites  == 0
 *     stale_payloads_at_end     == 0
 *
 *   You may use AI freely. When you're done, your interviewer will ask you
 *   to walk through the architecture and explain every possible webhook
 *   ordering without leaning on the AI.
 *
 * Run:    npm run process
 */

// ---------- config ----------------------------------------------------------

const CONFIG = {
  TOTAL_PROFILES: 12,

  WORKER_INTERVAL_MIN: 10,
  WORKER_BATCH_SIZE: 5,

  // If a job has been waiting this long with no webhook, the watchdog assumes
  // the callback was lost and makes the job claimable again.
  WEBHOOK_TIMEOUT_MIN: 15,

  SIM_HORIZON_MIN: 60,
};

// ---------- types -----------------------------------------------------------

type JobStatus = "pending" | "in_progress" | "completed";

interface RefreshJob {
  id: number;
  profile_id: string;
  status: JobStatus;
  attempts: number;
  current_attempt_token: string | null;
  submitted_at_min: number | null;
  completed_at_min: number | null;
  response_version: number | null;
}

interface WebhookEvent {
  deliver_at_min: number;
  profile_id: string;
  attempt_token: string;
  snapshot_version: number;
}

interface VendorSubmission {
  profile_id: string;
  attempt_token: string;
  submitted_at_min: number;
  attempt_number: number;
}

interface Metrics {
  worker_ticks: number;
  vendor_submissions: VendorSubmission[];
  lost_webhooks: number;
  reclaimed_jobs: number;
  stale_webhook_overwrites: number;
}

// ---------- event queue -----------------------------------------------------

function makeEventQueue() {
  const events: WebhookEvent[] = [];

  return {
    schedule(event: WebhookEvent) {
      events.push(event);
      events.sort((a, b) => a.deliver_at_min - b.deliver_at_min);
    },
    deliverDue(now_min: number, handle: (event: WebhookEvent) => void) {
      while (events.length > 0 && events[0].deliver_at_min <= now_min) {
        const event = events.shift();
        if (event) handle(event);
      }
    },
    pendingCount() {
      return events.length;
    },
  };
}

type EventQueue = ReturnType<typeof makeEventQueue>;

// ---------- in-memory job table --------------------------------------------

function makeRefreshJobTable(total: number) {
  const rows: RefreshJob[] = Array.from({ length: total }, (_, i) => ({
    id: i + 1,
    profile_id: `profile-${String(i + 1).padStart(3, "0")}`,
    status: "pending",
    attempts: 0,
    current_attempt_token: null,
    submitted_at_min: null,
    completed_at_min: null,
    response_version: null,
  }));

  // In production this is a unique indexed lookup table or a durable column
  // written before the external side effect.
  const jobIdByAttemptToken = new Map<string, number>();

  return {
    fetchDue(limit: number): RefreshJob[] {
      return rows.filter(row => row.status === "pending").slice(0, limit);
    },

    nextAttemptToken(job: RefreshJob): string {
      return `${job.profile_id}:attempt-${job.attempts + 1}`;
    },

    recordAttempt(jobId: number, attemptToken: string, now_min: number) {
      const row = rows.find(r => r.id === jobId);
      if (!row || row.status === "completed") return;

      row.status = "in_progress";
      row.attempts += 1;
      row.current_attempt_token = attemptToken;
      row.submitted_at_min = now_min;
      jobIdByAttemptToken.set(attemptToken, row.id);
    },

    handleWebhook(event: WebhookEvent, now_min: number, metrics: Metrics) {
      const jobId = jobIdByAttemptToken.get(event.attempt_token);
      const row = rows.find(r => r.id === jobId);

      if (!row) {
        metrics.lost_webhooks += 1;
        return;
      }

      if (row.response_version !== null && event.snapshot_version < row.response_version) {
        metrics.stale_webhook_overwrites += 1;
      }

      row.status = "completed";
      row.completed_at_min = now_min;
      row.response_version = event.snapshot_version;
    },

    reclaimTimedOut(now_min: number): number {
      let count = 0;

      for (const row of rows) {
        if (
          row.status === "in_progress" &&
          row.submitted_at_min !== null &&
          now_min - row.submitted_at_min >= CONFIG.WEBHOOK_TIMEOUT_MIN
        ) {
          row.status = "pending";
          row.current_attempt_token = null;
          row.submitted_at_min = null;
          count += 1;
        }
      }

      return count;
    },

    stats() {
      return {
        pending: rows.filter(row => row.status === "pending").length,
        in_progress: rows.filter(row => row.status === "in_progress").length,
        completed: rows.filter(row => row.status === "completed").length,
        stale_payloads: rows.filter(row => row.response_version === 1).length,
      };
    },

    rows() {
      return rows.map(row => ({ ...row }));
    },
  };
}

type RefreshJobTable = ReturnType<typeof makeRefreshJobTable>;

// ---------- vendor simulator ------------------------------------------------

function submitToVendor(
  submission: VendorSubmission,
  events: EventQueue,
  handleWebhookNow: (event: WebhookEvent) => void,
  metrics: Metrics,
) {
  metrics.vendor_submissions.push(submission);

  for (const event of buildVendorWebhookEvents(submission)) {
    if (event.deliver_at_min === submission.submitted_at_min) {
      // Some vendor webhooks are extremely fast. This models the callback
      // arriving while the submit call is still returning to the worker.
      handleWebhookNow(event);
    } else {
      events.schedule(event);
    }
  }
}

function buildVendorWebhookEvents(submission: VendorSubmission): WebhookEvent[] {
  const profileNumber = Number(submission.profile_id.split("-")[1]);

  if ((profileNumber === 3 || profileNumber === 7) && submission.attempt_number === 1) {
    return [
      {
        deliver_at_min: submission.submitted_at_min,
        profile_id: submission.profile_id,
        attempt_token: submission.attempt_token,
        snapshot_version: 2,
      },
    ];
  }

  if (profileNumber === 4 || profileNumber === 9) {
    return [
      {
        deliver_at_min: submission.submitted_at_min + 4,
        profile_id: submission.profile_id,
        attempt_token: submission.attempt_token,
        snapshot_version: 2,
      },
      {
        deliver_at_min: submission.submitted_at_min + 7,
        profile_id: submission.profile_id,
        attempt_token: submission.attempt_token,
        snapshot_version: 1,
      },
    ];
  }

  return [
    {
      deliver_at_min: submission.submitted_at_min + 4,
      profile_id: submission.profile_id,
      attempt_token: submission.attempt_token,
      snapshot_version: 2,
    },
  ];
}

// ---------- worker ----------------------------------------------------------

function processWorkerTick(
  now_min: number,
  jobs: RefreshJobTable,
  events: EventQueue,
  metrics: Metrics,
) {
  metrics.worker_ticks += 1;

  const dueJobs = jobs.fetchDue(CONFIG.WORKER_BATCH_SIZE);

  for (const job of dueJobs) {
    const attemptToken = jobs.nextAttemptToken(job);
    const submission: VendorSubmission = {
      profile_id: job.profile_id,
      attempt_token: attemptToken,
      submitted_at_min: now_min,
      attempt_number: job.attempts + 1,
    };

    submitToVendor(
      submission,
      events,
      event => jobs.handleWebhook(event, now_min, metrics),
      metrics,
    );

    jobs.recordAttempt(job.id, attemptToken, now_min);
  }
}

// ---------- simulator -------------------------------------------------------

function simulate() {
  const jobs = makeRefreshJobTable(CONFIG.TOTAL_PROFILES);
  const events = makeEventQueue();
  const metrics: Metrics = {
    worker_ticks: 0,
    vendor_submissions: [],
    lost_webhooks: 0,
    reclaimed_jobs: 0,
    stale_webhook_overwrites: 0,
  };

  for (let now = 0; now <= CONFIG.SIM_HORIZON_MIN; now += CONFIG.WORKER_INTERVAL_MIN) {
    events.deliverDue(now, event => jobs.handleWebhook(event, now, metrics));
    metrics.reclaimed_jobs += jobs.reclaimTimedOut(now);
    processWorkerTick(now, jobs, events, metrics);
  }

  events.deliverDue(CONFIG.SIM_HORIZON_MIN, event =>
    jobs.handleWebhook(event, CONFIG.SIM_HORIZON_MIN, metrics),
  );

  const final = jobs.stats();
  const submissionsByProfile = new Map<string, number>();

  for (const submission of metrics.vendor_submissions) {
    submissionsByProfile.set(
      submission.profile_id,
      (submissionsByProfile.get(submission.profile_id) ?? 0) + 1,
    );
  }

  const duplicateVendorCalls = [...submissionsByProfile.values()].reduce(
    (sum, count) => sum + Math.max(0, count - 1),
    0,
  );
  const slaHit = final.completed === CONFIG.TOTAL_PROFILES;

  console.log("=== Metric refresh run complete ===");
  console.log("");
  console.log("  worker_ticks:                 " + metrics.worker_ticks);
  console.log("  vendor_submissions:           " + metrics.vendor_submissions.length);
  console.log("  reclaimed_jobs:               " + metrics.reclaimed_jobs);
  console.log("  pending_webhook_events:        " + events.pendingCount());
  console.log("");
  console.log(
    "  profiles_completed:           " +
      final.completed +
      " / " +
      CONFIG.TOTAL_PROFILES +
      "  " +
      (slaHit ? "OK" : "MISS"),
  );
  console.log("  profiles_pending_end:         " + final.pending);
  console.log("  profiles_in_progress_end:     " + final.in_progress);
  console.log("");
  console.log(
    "  duplicate_vendor_calls:       " +
      duplicateVendorCalls +
      "  " +
      (duplicateVendorCalls === 0 ? "OK" : "DUPLICATE"),
  );
  console.log(
    "  lost_webhooks:                " +
      metrics.lost_webhooks +
      "  " +
      (metrics.lost_webhooks === 0 ? "OK" : "UNKNOWN_TOKEN"),
  );
  console.log(
    "  stale_webhook_overwrites:     " +
      metrics.stale_webhook_overwrites +
      "  " +
      (metrics.stale_webhook_overwrites === 0 ? "OK" : "STALE_WRITE"),
  );
  console.log(
    "  stale_payloads_at_end:        " +
      final.stale_payloads +
      "  " +
      (final.stale_payloads === 0 ? "OK" : "OLDER_THAN_VENDOR_SENT"),
  );
  console.log("");
  console.log("  sla_hit:                      " + slaHit);

  if (duplicateVendorCalls > 0) {
    console.log("");
    console.log("  profiles submitted more than once:");
    for (const [profileId, count] of submissionsByProfile.entries()) {
      if (count > 1) console.log("    " + profileId + " -> " + count + " submissions");
    }
  }
}

simulate();

export {};
