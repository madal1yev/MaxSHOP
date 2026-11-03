// Live order-tracking helpers.

// An order moves through four stages automatically. The durations are kept
// short (the whole run lasts ~3.5 minutes) so the tracking page feels alive in
// the demo build. In production these stages would be driven by real courier
// events coming from the backend.
export const TRACKING_STAGES = [
  { status: "confirmed", durationMs: 40_000 },
  { status: "preparing", durationMs: 70_000 },
  { status: "delivering", durationMs: 100_000 },
  { status: "delivered", durationMs: 0 }
];

export const TRACKING_TOTAL_MS = TRACKING_STAGES.reduce(
  (sum, stage) => sum + stage.durationMs,
  0
);

const clamp01 = (value) => Math.min(1, Math.max(0, value));

/** Milliseconds already elapsed when an order entered the given status. */
export const statusElapsedMs = (status) => {
  let elapsed = 0;
  for (const stage of TRACKING_STAGES) {
    if (stage.status === status) return elapsed;
    elapsed += stage.durationMs;
  }
  return 0;
};

const orderStartTime = (order, now) => {
  const placed = Number(order?.placedAt);
  return Number.isFinite(placed) && placed > 0 ? placed : now - TRACKING_TOTAL_MS;
};

/**
 * Resolve the live state of an order: current stage, step timestamps, overall
 * progress (0..1), courier position along the route (0..1) and time left.
 */
export const getOrderTracking = (order, now = Date.now()) => {
  const start = orderStartTime(order, now);
  let cursor = start;
  const steps = TRACKING_STAGES.map((stage) => {
    const step = { ...stage, at: cursor };
    cursor += stage.durationMs;
    return step;
  });

  const deliveredAt = start + TRACKING_TOTAL_MS;
  const cancelled = order?.status === "cancelled";
  const reference = cancelled ? Number(order?.cancelledAt) || now : now;
  const elapsed = Math.max(0, reference - start);

  let index = 0;
  while (index < steps.length - 1 && elapsed >= steps[index + 1].at - start) {
    index += 1;
  }

  const deliveringStep = steps[2];
  const riderProgress =
    index < 2
      ? 0
      : index === 2
        ? clamp01(
            (elapsed - (deliveringStep.at - start)) /
              TRACKING_STAGES[2].durationMs
          )
        : 1;

  return {
    status: cancelled ? "cancelled" : steps[index].status,
    index,
    steps,
    start,
    deliveredAt,
    cancelledAt: cancelled ? reference : null,
    elapsed,
    remainingMs: cancelled ? 0 : Math.max(0, deliveredAt - now),
    progress: clamp01(elapsed / TRACKING_TOTAL_MS),
    riderProgress
  };
};

/** mm:ss countdown used in the tracking hero. */
export const formatCountdown = (ms) => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};
