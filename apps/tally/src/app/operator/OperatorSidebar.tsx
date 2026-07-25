import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { HolonBoundary } from "@/app/components/docs/HolonBoundary";
import { SHELL_HOLON_ORDER } from "@/app/components/docs/shellHolonOrder";
import { light, type Tokens } from "@/app/components/tokens";
import {
  BriefcaseIcon,
  CalendarIcon,
  FolderKanbanIcon,
  MessageSquareIcon,
  Settings2Icon,
} from "lucide-react";

export type OperatorNavId = "campaigns" | "meetings" | "messages" | "operations";

type OperatorSidebarProps = {
  active: OperatorNavId;
  onNavigate: (id: OperatorNavId) => void;
  t?: Tokens;
};

const NAV: { id: OperatorNavId; label: string; icon: typeof BriefcaseIcon }[] = [
  { id: "campaigns", label: "Campaigns", icon: BriefcaseIcon },
  { id: "meetings", label: "Meetings", icon: CalendarIcon },
  { id: "messages", label: "Messages", icon: MessageSquareIcon },
  { id: "operations", label: "Operations", icon: FolderKanbanIcon },
];

/** Product sidebar — sidebar-07 shape, Tally Operator nav (Create lives under Campaigns). */
export function OperatorSidebar({ active, onNavigate, t = light }: OperatorSidebarProps) {
  return (
    <HolonBoundary
      id="prototype-sidebar"
      label="Sidebar"
      order={SHELL_HOLON_ORDER["prototype-sidebar"]}
      t={t}
      style={{ display: "contents" }}
    >
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" className="pointer-events-none">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Settings2Icon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Tally</span>
                  <span className="truncate text-xs">Operator</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={active === item.id}
                      tooltip={item.label}
                      onClick={() => onNavigate(item.id)}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    </HolonBoundary>
  );
}
