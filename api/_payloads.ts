import { defaultQueueStates, PORTALS } from "../packages/shared/src/index";

export function healthPayload() {
  return { ok: true };
}

export function statusPayload() {
  return {
    ok: true,
    service: "api",
    portals: [...PORTALS],
    queues: defaultQueueStates()
  };
}

export function portalsPayload() {
  return {
    portals: PORTALS.map((portal) => ({ portal, enabled: true }))
  };
}
