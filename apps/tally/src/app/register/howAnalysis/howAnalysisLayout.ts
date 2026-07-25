const STORAGE_PREFIX = "tally.register.howPositions.";

export type HowNodePosition = {
  x: number;
  y: number;
};

export function loadHowNodePositions(graphId: string): Record<string, HowNodePosition> {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${graphId}`);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, HowNodePosition>;
  } catch {
    return {};
  }
}

export function saveHowNodePosition(
  graphId: string,
  nodeId: string,
  position: HowNodePosition,
): void {
  const saved = loadHowNodePositions(graphId);
  saved[nodeId] = position;
  localStorage.setItem(`${STORAGE_PREFIX}${graphId}`, JSON.stringify(saved));
}
