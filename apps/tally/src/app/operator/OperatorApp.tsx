import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { MoonIcon, PanelLeftIcon, SunIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HolonBoundary } from "@/app/components/docs/HolonBoundary";
import { SHELL_HOLON_ORDER } from "@/app/components/docs/shellHolonOrder";
import { DocsPanel } from "@/app/components/DocsPanel";
import { dark, light } from "@/app/components/tokens";
import { DocsHighlightProvider } from "@/app/context/DocsHighlightContext";
import { HolonDetailProvider } from "@/app/context/HolonDetailContext";
import { DEFAULT_CONSOLE_PANEL_WIDTH } from "@/app/constants/layout";
import { cn } from "@/lib/utils";
import { CampaignsFlowView } from "./CampaignsFlowView";
import { OperatorSidebar, type OperatorNavId } from "./OperatorSidebar";

/**
 * Future Operator home — mounted at /prototype.
 * Holons nest under Prototype so Console live map can group them.
 * Full Create → Evaluate → Enrich → Deploy → Invite → Running path.
 * Dark mode from day one: Tokens `t` + html `.dark` for shadcn portals.
 */
export function OperatorApp() {
  return (
    <DocsHighlightProvider>
      <HolonDetailProvider>
        <TooltipProvider>
          <OperatorAppBody />
        </TooltipProvider>
      </HolonDetailProvider>
    </DocsHighlightProvider>
  );
}

function OperatorAppBody() {
  const [isDark, setIsDark] = useState(false);
  const t = isDark ? dark : light;
  const [nav, setNav] = useState<OperatorNavId>("campaigns");
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [flowBreadcrumb, setFlowBreadcrumb] = useState("Campaigns");

  // Portals (Sheet/Dialog) mount on body — class must live on <html>.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", isDark);
    return () => {
      root.classList.remove("dark");
    };
  }, [isDark]);

  const onBreadcrumbChange = useCallback((label: string) => {
    setFlowBreadcrumb(label);
  }, []);

  const breadcrumb =
    nav !== "campaigns"
      ? nav[0]!.toUpperCase() + nav.slice(1)
      : flowBreadcrumb;

  return (
    <HolonBoundary
      id="prototype"
      label="Prototype"
      order={SHELL_HOLON_ORDER.prototype}
      t={t}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: t.bgPrimary,
        color: t.textPrimary,
      }}
    >
      <SidebarProvider className="min-h-0 flex-1 bg-background text-foreground">
        <div className="flex min-h-0 flex-1 overflow-hidden bg-background">
          <OperatorSidebar active={nav} onNavigate={setNav} t={t} />
          <HolonBoundary
            id="prototype-inset"
            label="Workspace"
            order={SHELL_HOLON_ORDER["prototype-inset"]}
            t={t}
            style={{ display: "flex", flex: 1, minWidth: 0, minHeight: 0 }}
          >
            <SidebarInset className="min-w-0 overflow-hidden bg-background">
              <header
                className="flex h-12 shrink-0 items-center gap-2 border-b px-3"
                style={{ borderColor: t.border, background: t.bgPrimary }}
              >
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-1 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbPage>{breadcrumb}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
                <div className="ml-auto flex items-center gap-1">
                  <Link
                    to="/prototype"
                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                  >
                    Prototype
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title={isDark ? "Light mode" : "Dark mode"}
                    aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                    onClick={() => setIsDark((v) => !v)}
                  >
                    {isDark ? <SunIcon /> : <MoonIcon />}
                  </Button>
                  <Button
                    variant={consoleOpen ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setConsoleOpen((v) => !v)}
                  >
                    <PanelLeftIcon data-icon="inline-start" />
                    Console
                  </Button>
                </div>
              </header>
              <div
                className="flex min-h-0 flex-1 flex-col overflow-hidden"
                style={{ background: t.bgPrimary }}
              >
                {nav === "campaigns" ? (
                  <CampaignsFlowView onBreadcrumbChange={onBreadcrumbChange} t={t} />
                ) : (
                  <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
                    {nav[0]!.toUpperCase() + nav.slice(1)} — not planted yet (same block)
                  </div>
                )}
              </div>
            </SidebarInset>
          </HolonBoundary>
          {consoleOpen ? <DocsPanel width={DEFAULT_CONSOLE_PANEL_WIDTH} t={t} /> : null}
        </div>
      </SidebarProvider>
    </HolonBoundary>
  );
}
