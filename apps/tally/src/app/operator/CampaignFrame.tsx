import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CompanyMark } from "./CompanyMark";
import type { OperatorCampaign } from "./flowTypes";

type CompanyChip = { initials: string; name: string };

type CampaignFrameProps = {
  campaign: OperatorCampaign;
  company: CompanyChip | null;
  onBack: () => void;
  backLabel?: string;
  dimmed?: boolean;
  children: ReactNode;
};

/** Shared campaign block chrome — header + body (sidebar-07 block shape). */
export function CampaignFrame({
  campaign,
  company,
  onBack,
  backLabel = "← Campaigns",
  dimmed,
  children,
}: CampaignFrameProps) {
  return (
    <div
      className={cn(
        "bg-card max-w-xl overflow-hidden rounded-lg border",
        dimmed && "pointer-events-none opacity-55",
      )}
    >
      <div className="bg-muted/40 flex items-center gap-2.5 border-b px-4 py-3">
        <Button variant="link" size="sm" className="text-muted-foreground h-auto px-0" onClick={onBack}>
          {backLabel}
        </Button>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">{campaign.name}</span>
        {company ? <CompanyMark initials={company.initials} name={company.name} className="size-6 text-[10px]" /> : null}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
