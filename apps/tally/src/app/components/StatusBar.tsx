import { useEffect, useState, type ReactNode } from "react";
import { GitBranch, Settings2 } from "lucide-react";
import { HolonBoundary } from "./docs/HolonBoundary";
import { SHELL_HOLON_ORDER } from "./docs/shellHolonOrder";
import type { Tokens } from "./tokens";

type StatusBarProps = {
  t: Tokens;
};

function StatusItem({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "0 8px",
        height: "100%",
        fontSize: 11,
        cursor: "default",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
}

function scannerUrl(path: string): string {
  const base = (import.meta.env.VITE_SCANNER_URL as string | undefined)?.replace(/\/$/, "") || "";
  return base ? `${base}${path}` : `/api/scanner${path}`;
}

export function StatusBar({ t }: StatusBarProps) {
  const iconColor = "rgba(255,255,255,0.88)";
  const [crawlHint, setCrawlHint] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await fetch(scannerUrl("/crawl/linkedin/active"));
        if (!res.ok) return;
        const data = await res.json();
        const run = data.run;
        if (!run) {
          if (!cancelled) setCrawlHint(null);
          return;
        }
        const phase = run.metadata?.phase || run.status;
        const rows = Array.isArray(run.metadata?.rows) ? run.metadata.rows.length : 0;
        const done = Array.isArray(run.metadata?.rows)
          ? run.metadata.rows.filter((r: { status?: string }) => r.status === "done").length
          : run.pages_fetched ?? 0;
        if (!cancelled) {
          setCrawlHint(
            rows > 0 ? `Extract ${phase} ${done}/${rows}` : `Extract ${phase}`,
          );
        }
      } catch {
        /* scanner may be down */
      }
    };
    tick();
    const id = window.setInterval(tick, 3000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return (
    <HolonBoundary
      id="status-bar"
      label="Status Bar"
      icon="chart-bar-horizontal"
      order={SHELL_HOLON_ORDER["status-bar"]}
      highlightColor="rgba(255,255,255,0.9)"
      t={t}
      style={{
        height: 22,
        background: t.accent,
        color: "rgba(255,255,255,0.95)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
        <StatusItem>
          <GitBranch size={12} color={iconColor} strokeWidth={2} />
          <span>main</span>
        </StatusItem>
        <StatusItem>
          <span>Tally Operator</span>
        </StatusItem>
        {crawlHint && (
          <StatusItem>
            <span>{crawlHint}</span>
          </StatusItem>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
        <StatusItem>
          <Settings2 size={12} color={iconColor} strokeWidth={2} />
        </StatusItem>
      </div>
    </HolonBoundary>
  );
}
