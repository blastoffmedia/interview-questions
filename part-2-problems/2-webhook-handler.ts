/**
 * PROBLEM 2, Idempotent Webhook Handler
 *
 * Context:
 *   Phyllo (a third-party social platform aggregator) sends us webhook events
 *   with view counts for a creator's content. Two known properties of this
 *   webhook stream:
 *     1. Duplicates: the same event_id can arrive more than once.
 *     2. Out-of-order: a webhook for an EARLIER timestamp can arrive AFTER
 *        a webhook for a LATER timestamp (network retries, lambda concurrency).
 *
 * YOUR TASK:
 *   Implement `handleWebhook(payload, db)` so that:
 *     - Duplicate event_ids are processed exactly once.
 *     - The stored row always reflects the latest-timestamp event for a given
 *       (creator_id, content_id) pair, i.e. an old event arriving late must
 *       NOT overwrite a newer one that already landed.
 *     - The function never throws on valid input (return { processed: bool }).
 *
 * Run:    npm run webhook
 * Expect: the demo fires 12 events including duplicates and out-of-order
 *         deliveries. The final state for each (creator, content) pair must
 *         match the highest-timestamp event in the stream.
 */

// ---------- types ----------

interface WebhookPayload {
  event_id: string;        // unique per event (used for dedup)
  creator_id: string;
  content_id: string;
  view_count: number;
  timestamp: number;       // event time, milliseconds since epoch
}

interface ViewCountRow {
  creator_id: string;
  content_id: string;
  view_count: number;
  last_event_timestamp: number;
}

interface Db {
  hasProcessedEvent(eventId: string): Promise<boolean>;
  markEventProcessed(eventId: string): Promise<void>;
  getViewCount(creatorId: string, contentId: string): Promise<ViewCountRow | null>;
  upsertViewCount(row: ViewCountRow): Promise<void>;
  /** Test helper, returns everything. */
  dump(): { events: Set<string>; rows: ViewCountRow[] };
}

// ---------- stubbed in-memory db ----------

function makeDb(): Db {
  const processedEvents = new Set<string>();
  const rows = new Map<string, ViewCountRow>();
  const key = (c: string, p: string) => `${c}::${p}`;

  return {
    async hasProcessedEvent(eventId) {
      return processedEvents.has(eventId);
    },
    async markEventProcessed(eventId) {
      processedEvents.add(eventId);
    },
    async getViewCount(creatorId, contentId) {
      return rows.get(key(creatorId, contentId)) ?? null;
    },
    async upsertViewCount(row) {
      rows.set(key(row.creator_id, row.content_id), { ...row });
    },
    dump() {
      return { events: new Set(processedEvents), rows: [...rows.values()] };
    },
  };
}

// ----------------------------------------------------------------
// YOUR IMPLEMENTATION
// ----------------------------------------------------------------

async function handleWebhook(
  payload: WebhookPayload,
  db: Db,
): Promise<{ processed: boolean }> {
  // TODO: implement
  throw new Error("Not implemented");
}

// ----------------------------------------------------------------
// DEMO RUNNER, mixes duplicates and out-of-order events
// ----------------------------------------------------------------

async function runDemo() {
  const db = makeDb();

  const stream: WebhookPayload[] = [
    { event_id: "evt-1", creator_id: "sarah",  content_id: "video-A", view_count: 100,  timestamp: 1_700_000_000_000 },
    { event_id: "evt-2", creator_id: "marco",  content_id: "reel-B",  view_count: 50,   timestamp: 1_700_000_100_000 },
    { event_id: "evt-3", creator_id: "sarah",  content_id: "video-A", view_count: 150,  timestamp: 1_700_000_200_000 },
    { event_id: "evt-3", creator_id: "sarah",  content_id: "video-A", view_count: 150,  timestamp: 1_700_000_200_000 },
    { event_id: "evt-4", creator_id: "sarah",  content_id: "video-A", view_count: 300,  timestamp: 1_700_000_400_000 },
    { event_id: "evt-5", creator_id: "sarah",  content_id: "video-A", view_count: 220,  timestamp: 1_700_000_300_000 },
    { event_id: "evt-6", creator_id: "marco",  content_id: "reel-B",  view_count: 80,   timestamp: 1_700_000_500_000 },
    { event_id: "evt-7", creator_id: "sarah",  content_id: "video-A", view_count: 70,   timestamp: 1_699_999_000_000 },
    { event_id: "evt-8", creator_id: "alex",   content_id: "track-C", view_count: 12,   timestamp: 1_700_000_600_000 },
    { event_id: "evt-3", creator_id: "sarah",  content_id: "video-A", view_count: 150,  timestamp: 1_700_000_200_000 },
    { event_id: "evt-9", creator_id: "alex",   content_id: "track-C", view_count: 25,   timestamp: 1_700_000_700_000 },
    { event_id: "evt-10",creator_id: "marco",  content_id: "reel-B",  view_count: 95,   timestamp: 1_700_000_650_000 },
  ];

  for (const event of stream) {
    await handleWebhook(event, db);
  }

  const { events, rows } = db.dump();
  console.log(`Processed event ids: ${events.size} unique`);
  console.log("Final rows:");
  for (const r of rows) {
    console.log(`  ${r.creator_id}/${r.content_id}  views=${r.view_count}  last_ts=${r.last_event_timestamp}`);
  }
}

runDemo().catch(err => {
  console.error("Demo crashed:", err);
  process.exit(1);
});

export {};
