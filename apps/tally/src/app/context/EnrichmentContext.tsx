import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createEnrichmentWorkflow,
  createSeedFreshWorkflow,
  createSeedLaneAWorkflow,
  createSeedRunningWorkflow,
  normalizeEnrichmentLabel,
  type EnrichmentRun,
  type EnrichmentWorkflow,
} from "../data/enrichmentWorkflows";
import type { EnrichmentStatus } from "../data/enrichments";

const WORKFLOWS_STORAGE_KEY = "tally.enrichment.workflows.v1";

function seedWorkflows(): EnrichmentWorkflow[] {
  return [
    createSeedLaneAWorkflow(),
    createSeedFreshWorkflow(),
    createSeedRunningWorkflow(),
  ];
}

function migrateWorkflows(workflows: EnrichmentWorkflow[]): EnrichmentWorkflow[] {
  return workflows.map((w) => {
    const nodes = w.nodes.map((n) => {
      if (n.type !== "trigger" || !n.data.enrollmentCriteria) return n;
      const c = n.data.enrollmentCriteria;
      if (c.kind) return n;
      // Legacy: configured enrollment without kind → treat as jobs
      if ((c.sourceIds?.length ?? 0) > 0) {
        return {
          ...n,
          data: {
            ...n.data,
            enrollmentCriteria: { ...c, kind: "jobs" as const },
          },
        };
      }
      return n;
    });
    return { ...w, nodes };
  });
}

function loadStoredWorkflows(): EnrichmentWorkflow[] {
  try {
    const raw = localStorage.getItem(WORKFLOWS_STORAGE_KEY);
    if (!raw) return seedWorkflows();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) return seedWorkflows();
    return migrateWorkflows(parsed as EnrichmentWorkflow[]);
  } catch {
    return seedWorkflows();
  }
}

type EnrichmentContextValue = {
  workflows: EnrichmentWorkflow[];
  getWorkflow: (id: string) => EnrichmentWorkflow | undefined;
  createWorkflow: () => EnrichmentWorkflow;
  renameWorkflow: (id: string, name: string) => void;
  updateWorkflow: (
    id: string,
    patch: Partial<Pick<EnrichmentWorkflow, "nodes" | "edges" | "status" | "runs">>,
  ) => void;
  startMockRun: (workflowId: string) => void;
  stopMockRun: (workflowId: string) => void;
};

const EnrichmentContext = createContext<EnrichmentContextValue | null>(null);

export function EnrichmentProvider({ children }: { children: ReactNode }) {
  const [workflows, setWorkflows] = useState<EnrichmentWorkflow[]>(() => loadStoredWorkflows());

  useEffect(() => {
    try {
      localStorage.setItem(WORKFLOWS_STORAGE_KEY, JSON.stringify(workflows));
    } catch {
      // Quota / private mode — keep working in memory.
    }
  }, [workflows]);

  const getWorkflow = useCallback(
    (id: string) => workflows.find((w) => w.id === id),
    [workflows],
  );

  const createWorkflow = useCallback(() => {
    const created = createEnrichmentWorkflow(workflows);
    setWorkflows((prev) => [created, ...prev]);
    return created;
  }, [workflows]);

  const renameWorkflow = useCallback((id: string, name: string) => {
    const next = normalizeEnrichmentLabel(name);
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, name: next, updatedAt: new Date().toISOString() } : w,
      ),
    );
  }, []);

  const updateWorkflow = useCallback(
    (
      id: string,
      patch: Partial<Pick<EnrichmentWorkflow, "nodes" | "edges" | "status" | "runs">>,
    ) => {
      setWorkflows((prev) =>
        prev.map((w) =>
          w.id === id ? { ...w, ...patch, updatedAt: new Date().toISOString() } : w,
        ),
      );
    },
    [],
  );

  const startMockRun = useCallback((workflowId: string) => {
    const run: EnrichmentRun = {
      id: `run-${Date.now()}`,
      startedAt: new Date().toISOString(),
      status: "running",
      summary: "Pulling enrolled sources…",
    };
    setWorkflows((prev) =>
      prev.map((w) => {
        if (w.id !== workflowId) return w;
        const nodes = w.nodes.map((n) =>
          n.type === "trigger"
            ? { ...n, data: { ...n.data, runStatus: "running" as const } }
            : n,
        );
        return {
          ...w,
          status: "running" as EnrichmentStatus,
          nodes,
          runs: [run, ...w.runs],
          updatedAt: new Date().toISOString(),
        };
      }),
    );
    window.setTimeout(() => {
      setWorkflows((prev) =>
        prev.map((w) => {
          if (w.id !== workflowId) return w;
          const survivors = 5 + Math.floor(Math.random() * 12);
          const runs = w.runs.map((r, i) =>
            i === 0
              ? {
                  ...r,
                  status: "done" as const,
                  finishedAt: new Date().toISOString(),
                  summary: `${survivors} survivors after enrollment + graph`,
                  survivors,
                }
              : r,
          );
          const nodes = w.nodes.map((n) => ({
            ...n,
            data: { ...n.data, runStatus: "done" as const },
          }));
          return {
            ...w,
            status: "done" as EnrichmentStatus,
            runs,
            nodes,
            updatedAt: new Date().toISOString(),
          };
        }),
      );
    }, 2200);
  }, []);

  const stopMockRun = useCallback((workflowId: string) => {
    setWorkflows((prev) =>
      prev.map((w) => {
        if (w.id !== workflowId) return w;
        const runs = w.runs.map((r, i) =>
          i === 0 && r.status === "running"
            ? {
                ...r,
                status: "cancelled" as const,
                finishedAt: new Date().toISOString(),
                summary: "Cancelled",
              }
            : r,
        );
        const nodes = w.nodes.map((n) => ({
          ...n,
          data: { ...n.data, runStatus: "idle" as const },
        }));
        return {
          ...w,
          status: "paused" as EnrichmentStatus,
          runs,
          nodes,
          updatedAt: new Date().toISOString(),
        };
      }),
    );
  }, []);

  const value = useMemo(
    () => ({
      workflows,
      getWorkflow,
      createWorkflow,
      renameWorkflow,
      updateWorkflow,
      startMockRun,
      stopMockRun,
    }),
    [
      workflows,
      getWorkflow,
      createWorkflow,
      renameWorkflow,
      updateWorkflow,
      startMockRun,
      stopMockRun,
    ],
  );

  return <EnrichmentContext.Provider value={value}>{children}</EnrichmentContext.Provider>;
}

export function useEnrichments(): EnrichmentContextValue {
  const ctx = useContext(EnrichmentContext);
  if (!ctx) throw new Error("useEnrichments must be used within EnrichmentProvider");
  return ctx;
}

export function workflowsAsListItems(workflows: EnrichmentWorkflow[]) {
  return workflows.map((w) => ({
    id: w.id,
    label: w.name,
    status: w.status,
    kind: w.kind,
  }));
}

export type { EnrichmentWorkflow };
